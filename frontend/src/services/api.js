import axios from "axios";

const stripTrailing = (value) =>
  String(value || "").trim().replace(/\/+$/, "");

const normalizeApi = (value) => {
  const configured = stripTrailing(value);

  if (!configured) return "";

  return /\/api$/i.test(configured)
    ? configured
    : `${configured}/api`;
};

// Local backend
const localApi = normalizeApi(
  import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5000/api"
);

// Render backend
const renderApi = normalizeApi(
  import.meta.env.VITE_RENDER_API_URL ||
    "https://job-portal1-rph3.onrender.com/api"
);

// Detect local development
const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "0.0.0.0"].includes(
    window.location.hostname
  );

// IMPORTANT:
// In production, always use Render API.
// Do not allow VITE_API_URL=localhost to override it.
const baseURL = isLocalBrowser ? localApi : renderApi;

console.log("Jobify API configuration:", {
  isLocalBrowser,
  localApi,
  renderApi,
  baseURL,
});

const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Prevent requests such as:
  // /api/api/auth/login
  // /api/api/jobs
  if (typeof config.url === "string") {
    config.url = config.url.replace(/^(?:\/?api\/)+/i, "/");
  }

  if (
    typeof FormData !== "undefined" &&
    config.data instanceof FormData
  ) {
    // Browser must set multipart/form-data boundary.
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  } else {
    config.headers = config.headers || {};
    config.headers["Content-Type"] ||= "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isNetworkFailure =
      !error.response &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        /timeout|network error/i.test(error.message || ""));

    // If local API fails during local development,
    // try Render once.
    if (
      isNetworkFailure &&
      isLocalBrowser &&
      !original?._renderRetry &&
      renderApi &&
      baseURL !== renderApi
    ) {
      original._renderRetry = true;
      original.baseURL = renderApi;
      original.timeout = 25000;

      return api.request(original);
    }

    if (
      error.response?.status === 401 &&
      error.config?.url !== "/auth/login"
    ) {
      // Individual pages decide how to handle authentication failures.
    }

    return Promise.reject(error);
  }
);

export { localApi, renderApi };

export default api;