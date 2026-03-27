import { defineStore } from "pinia";
import { authService } from "../services/authService";

const TOKEN_KEY = "owazym_token";
const SESSION_TOKEN_KEY = "owazym_session_token";
const REMEMBER_KEY = "owazym_remember_me";

const readStoredToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY) || "";
let expiryTimerId = 0;

const clearExpiryTimer = () => {
  if (expiryTimerId) {
    window.clearTimeout(expiryTimerId);
    expiryTimerId = 0;
  }
};

const decodeTokenExpiry = (token) => {
  const safeToken = String(token || "").trim();
  if (!safeToken) return 0;

  try {
    const [, payload] = safeToken.split(".");
    if (!payload) return 0;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const parsed = JSON.parse(window.atob(padded));
    const expiresAt = Number(parsed?.exp || 0) * 1000;

    return Number.isFinite(expiresAt) ? expiresAt : 0;
  } catch (_error) {
    return 0;
  }
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: readStoredToken(),
    user: null,
    loading: false,
    remember: localStorage.getItem(REMEMBER_KEY) !== "0",
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    scheduleExpiry(token = this.token) {
      clearExpiryTimer();

      const expiresAt = decodeTokenExpiry(token);
      if (!expiresAt) return;

      const delay = expiresAt - Date.now();
      if (delay <= 0) {
        this.expireSession();
        return;
      }

      expiryTimerId = window.setTimeout(() => {
        if (this.token === token) {
          this.expireSession();
        }
      }, delay);
    },
    expireSession() {
      const redirect =
        typeof window === "undefined"
          ? "/"
          : `${window.location.pathname}${window.location.search}${window.location.hash}`;

      this.clear();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("owazym:auth-expired", {
          detail: { redirect },
        }));
      }
    },
    bootstrap() {
      this.token = readStoredToken();
      this.remember = localStorage.getItem(REMEMBER_KEY) !== "0";
      window.csrfToken = this.token || "";
      if (this.token) {
        const expiresAt = decodeTokenExpiry(this.token);
        if (expiresAt && expiresAt <= Date.now()) {
          this.expireSession();
          return;
        }
        this.scheduleExpiry(this.token);
        this.fetchMe().catch(() => this.clear());
      }
    },
    setSession(token, user, remember = true) {
      this.token = token;
      this.user = user;
      this.remember = Boolean(remember);
      localStorage.setItem(REMEMBER_KEY, this.remember ? "1" : "0");
      if (this.remember) {
        localStorage.setItem(TOKEN_KEY, token);
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
      } else {
        sessionStorage.setItem(SESSION_TOKEN_KEY, token);
        localStorage.removeItem(TOKEN_KEY);
      }
      window.csrfToken = token;
      this.scheduleExpiry(token);
    },
    clear() {
      clearExpiryTimer();
      this.token = "";
      this.user = null;
      this.remember = true;
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      window.csrfToken = "";
    },
    async login(payload) {
      const session = await authService.login(payload);
      this.setSession(session.token, session.user, payload?.remember !== false);
      return session;
    },
    async register(payload) {
      const session = await authService.register(payload);
      this.setSession(session.token, session.user, true);
      return session;
    },
    async fetchMe() {
      if (!this.token) return null;
      const user = await authService.me();
      this.user = user;
      return user;
    },
    async logout() {
      if (this.token) {
        try {
          await authService.logout();
        } catch (_e) {}
      }
      this.clear();
    },
  },
});
