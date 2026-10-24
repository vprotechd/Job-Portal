import fs from "fs";
import path from "path";
import crypto from "crypto";

const cleanLocalFilename = (value) =>
  path.basename(
    String(value || "")
      .replace(/^\/+/, "")
      .replace(/^uploads[\\/]/i, "")
  );

const getExtensionFromContentType = (contentType = "") => {
  const type = String(contentType).toLowerCase().split(";")[0].trim();
  if (type === "application/pdf") return ".pdf";
  if (type === "application/msword") return ".doc";
  if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return ".docx";
  return "";
};

const getFilenameFromDisposition = (value = "") => {
  const match = String(value).match(/filename\\*?=(?:UTF-8''|\")?([^\";]+)/i);
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1].replace(/\"/g, "").trim());
  } catch {
    return match[1].replace(/\"/g, "").trim();
  }
};

// -----------------------------------------------------------------
// External (Cloudinary) resume support
// -----------------------------------------------------------------
// Old resumes were stored as Cloudinary URLs. Cloudinary answers 401 for
// PDF/raw files when "Restricted media types" / strict delivery is enabled
// or when the asset is private/authenticated. To keep downloads working we:
//   1. try the stored URL as-is,
//   2. try the alternate resource types (raw <-> image) of the same asset,
//   3. if CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
//      are set, ask Cloudinary for a signed private download of the asset.
const CLOUDINARY_URL_RE =
  /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|raw|video)\/(upload|authenticated|private)\/(?:(?:[^/]+,[^/]+|[a-z]{1,3}_[^/]+)\/)*?(?:v\d+\/)?(.+)$/i;

const parseCloudinaryUrl = (url) => {
  const match = String(url).match(CLOUDINARY_URL_RE);
  if (!match) return null;
  const [, cloudName, resourceType, deliveryType, rest] = match;
  const cleanRest = decodeURIComponent(rest.split("?")[0]);
  return { cloudName, resourceType, deliveryType, publicIdWithExt: cleanRest };
};

const buildCloudinaryCandidates = (url) => {
  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return [];
  const { cloudName, resourceType, publicIdWithExt } = parsed;
  const candidates = [];
  const otherTypes = ["raw", "image"].filter((type) => type !== resourceType);
  for (const type of otherTypes) {
    candidates.push(
      `https://res.cloudinary.com/${cloudName}/${type}/upload/${publicIdWithExt
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`
    );
  }
  return candidates;
};

const buildSignedCloudinaryDownloadUrls = (url) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const parsed = parseCloudinaryUrl(url);
  if (!cloudName || !apiKey || !apiSecret || !parsed) return [];

  const ext = path.extname(parsed.publicIdWithExt).replace(/^\./, "");
  const withoutExt = ext
    ? parsed.publicIdWithExt.slice(0, -(ext.length + 1))
    : parsed.publicIdWithExt;

  const urls = [];
  const attempts = [];
  // image/video assets use public_id (without extension) + format;
  // raw assets use the full public_id (extension included) and no format.
  if (parsed.resourceType === "raw") {
    attempts.push({ resourceType: "raw", public_id: parsed.publicIdWithExt });
  } else {
    attempts.push({ resourceType: parsed.resourceType, public_id: withoutExt, format: ext || "pdf" });
    attempts.push({ resourceType: "raw", public_id: parsed.publicIdWithExt });
  }

  for (const attempt of attempts) {
    const params = {
      public_id: attempt.public_id,
      type: parsed.deliveryType === "upload" ? "upload" : parsed.deliveryType,
      timestamp: Math.floor(Date.now() / 1000),
      ...(attempt.format ? { format: attempt.format } : {}),
    };
    const toSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const signature = crypto
      .createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex");
    const query = new URLSearchParams({ ...params, api_key: apiKey, signature });
    urls.push(
      `https://api.cloudinary.com/v1_1/${cloudName}/${attempt.resourceType}/download?${query.toString()}`
    );
  }
  return urls;
};

const fetchResumeFile = (url) =>
  fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      Accept:
        "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,*/*",
      "User-Agent": "Mozilla/5.0 (compatible; JobifyResumeProxy/1.0)",
    },
  });

/**
 * Sends a stored Jobify resume to the requester.
 * Supports both the current local-upload format and older/external
 * resume URLs (for example Cloudinary URLs) without changing the API.
 */
export async function sendResume(res, resumeValue, candidateName = "candidate") {
  const value = String(resumeValue || "").trim();
  if (!value) {
    const error = new Error("This candidate has not uploaded a resume.");
    error.status = 404;
    throw error;
  }

  const safeName = String(candidateName || "candidate")
    .replace(/[^a-zA-Z0-9_-]+/g, "-") || "candidate";

  // Current/local Jobify upload.
  if (!/^https?:\/\//i.test(value)) {
    const filename = cleanLocalFilename(value);
    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!filename || !fs.existsSync(filePath)) {
      const error = new Error("Resume file is no longer available on the server.");
      error.status = 404;
      throw error;
    }

    return res.download(
      filePath,
      `${safeName}-resume${path.extname(filename) || ".pdf"}`
    );
  }

  // Older/external stored resumes. Fetch the file on the backend so the
  // browser does not need direct access to the external storage provider.
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    const error = new Error("Invalid resume URL.");
    error.status = 400;
    throw error;
  }

  if (!/^https?:$/i.test(parsed.protocol)) {
    const error = new Error("Invalid resume URL.");
    error.status = 400;
    throw error;
  }

  const attemptUrls = [
    parsed.toString(),
    ...buildCloudinaryCandidates(parsed.toString()),
    ...buildSignedCloudinaryDownloadUrls(parsed.toString()),
  ];

  let upstream = null;
  let lastStatus = 0;

  for (const candidateUrl of attemptUrls) {
    try {
      const response = await fetchResumeFile(candidateUrl);
      lastStatus = response.status;
      if (response.ok) {
        upstream = response;
        break;
      }
    } catch (fetchError) {
      console.error("Resume fetch attempt failed:", fetchError.message);
    }
  }

  if (!upstream) {
    const error = new Error(
      lastStatus === 401 || lastStatus === 403
        ? "This resume is stored on an external file service that refused access. Ask the candidate to re-upload their resume from their profile."
        : lastStatus === 404
        ? "The stored resume file could not be found. Ask the candidate to re-upload their resume."
        : `Unable to retrieve resume from stored file URL (HTTP ${lastStatus || "network error"}).`
    );
    // Never forward an upstream 401 as our own 401: that would look like the
    // recruiter's login expired and trigger a logout on the client.
    error.status = lastStatus === 404 ? 404 : 502;
    throw error;
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const disposition = upstream.headers.get("content-disposition") || "";
  const upstreamFilename = getFilenameFromDisposition(disposition);
  const urlFilename = path.basename(parsed.pathname || "");
  const extension =
    path.extname(upstreamFilename) ||
    path.extname(urlFilename) ||
    getExtensionFromContentType(contentType) ||
    ".pdf";

  const filename = `${safeName}-resume${extension}`;
  const buffer = Buffer.from(await upstream.arrayBuffer());

  if (!buffer.length) {
    const error = new Error("The stored resume file is empty.");
    error.status = 404;
    throw error;
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", buffer.length);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.end(buffer);
}
