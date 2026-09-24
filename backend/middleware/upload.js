import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const RESUME_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);

const safeFilename = (original) => {
  const ext = path.extname(original || "").toLowerCase();
  const base = path
    .basename(original || "file", ext)
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 80) || "file";
  return `${base}-${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, safeFilename(file.originalname)),
});

const fileFilter = (_req, file, cb) => {
  const field = file.fieldname;
  const extension = path.extname(file.originalname || "").toLowerCase();
  const type = String(file.mimetype || "").toLowerCase();

  if (field === "profileImage") {
    if (IMAGE_TYPES.has(type) && IMAGE_EXTENSIONS.has(extension)) return cb(null, true);
    const error = new Error("Profile picture must be JPG, JPEG, PNG or WEBP.");
    error.status = 400;
    return cb(error);
  }

  if (field === "resume") {
    // Some browsers/mobile file pickers report application/octet-stream.
    // The extension is therefore accepted as a second validation signal.
    if ((RESUME_TYPES.has(type) || type === "") && RESUME_EXTENSIONS.has(extension)) {
      return cb(null, true);
    }
    const error = new Error("Resume must be PDF, DOC or DOCX.");
    error.status = 400;
    return cb(error);
  }

  const error = new Error("Unsupported upload field.");
  error.status = 400;
  return cb(error);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 2,
    fields: 30,
  },
});

const upload = {
  fields: (fieldDefinitions = []) => uploader.fields(fieldDefinitions),
};

export default upload;
