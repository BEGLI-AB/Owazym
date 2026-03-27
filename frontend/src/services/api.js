import axios from "axios";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, messages } from "../i18n/messages";

const rawBaseURL = String(import.meta.env.VITE_API_BASE_URL || "/api").trim() || "/api";
const LOCALE_KEY = "locale";

const resolveBaseURL = () => {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return rawBaseURL;
  }

  try {
    const parsed = new URL(rawBaseURL, window.location.origin);
    const isLocalDevApi =
      parsed.port === "4000" &&
      ["localhost", "127.0.0.1", window.location.hostname].includes(parsed.hostname);

    if (isLocalDevApi) {
      return "/api";
    }
  } catch (_error) {
    return rawBaseURL;
  }

  return rawBaseURL;
};

const baseURL = resolveBaseURL();

const normalizeLocale = (value) => {
  const normalized = String(value || "").toLowerCase().trim();
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
};

const getLocale = () => {
  try {
    return normalizeLocale(localStorage.getItem(LOCALE_KEY));
  } catch (_error) {
    return DEFAULT_LOCALE;
  }
};

const translate = (key) => {
  const locale = getLocale();
  const current = messages[locale] || messages[DEFAULT_LOCALE] || {};
  const fallback = messages.en || {};
  return current[key] || fallback[key] || key;
};

const resolveErrorMessage = (error) => {
  const messageKey = String(error?.response?.data?.message_key || "").trim();
  if (messageKey) return translate(messageKey);

  const requestUrl = String(error?.config?.url || "").toLowerCase();
  const status = Number(error?.response?.status || 0);
  const backendRawMessage = String(error?.response?.data?.message || "").trim();
  const backendMessage = backendRawMessage.toLowerCase();
  const backendErrors = error?.response?.data?.errors;
  const firstBackendError = backendErrors && typeof backendErrors === "object"
    ? Object.values(backendErrors).flat().find(Boolean)
    : "";
  const isInvalidCredentials =
    backendMessage.includes("invalid credentials") ||
    backendMessage.includes("invalid username or password") ||
    backendMessage.includes("credentials do not match");

  if (!error?.response) return String(error?.message || translate("request_failed"));
  if (isInvalidCredentials) return translate("invalid_credentials");
  if (status === 401 && (requestUrl.endsWith("/login") || requestUrl.endsWith("/register"))) {
    return translate("invalid_credentials");
  }
  if (status === 422 && firstBackendError) return String(firstBackendError);
  if (status === 422 && backendRawMessage) return backendRawMessage;
  if (backendRawMessage) return backendRawMessage;
  return translate("request_failed");
};

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("owazym_token") || sessionStorage.getItem("owazym_session_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error?.config?.url || "").toLowerCase();
    const status = Number(error?.response?.status || 0);
    const isAuthRequest = requestUrl.endsWith("/login") || requestUrl.endsWith("/register");

    if (status === 401 && !isAuthRequest && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("owazym:auth-expired"));
    }

    const message = resolveErrorMessage(error);
    const wrapped = new Error(message);
    wrapped.status = status;
    wrapped.errors = error?.response?.data?.errors || null;
    wrapped.originalMessage = error?.response?.data?.message || error?.message || "";
    return Promise.reject(wrapped);
  },
);
