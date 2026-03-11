import axios from "axios";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, messages } from "../i18n/messages";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
const LOCALE_KEY = "locale";

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
  const backendMessage = String(error?.response?.data?.message || "").toLowerCase();
  const isInvalidCredentials =
    backendMessage.includes("invalid credentials") ||
    backendMessage.includes("invalid username or password") ||
    backendMessage.includes("credentials do not match");

  if (isInvalidCredentials) return translate("invalid_credentials");
  if (status === 401 && (requestUrl.endsWith("/login") || requestUrl.endsWith("/register"))) {
    return translate("invalid_credentials");
  }
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
    const message = resolveErrorMessage(error);
    const wrapped = new Error(message);
    wrapped.status = error?.response?.status;
    wrapped.errors = null;
    wrapped.originalMessage = error?.response?.data?.message || error?.message || "";
    return Promise.reject(wrapped);
  },
);
