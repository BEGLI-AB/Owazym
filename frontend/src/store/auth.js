import { defineStore } from "pinia";
import { authService } from "../services/authService";

const TOKEN_KEY = "owazym_token";
const SESSION_TOKEN_KEY = "owazym_session_token";
const REMEMBER_KEY = "owazym_remember_me";

const readStoredToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY) || "";

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
    bootstrap() {
      this.token = readStoredToken();
      this.remember = localStorage.getItem(REMEMBER_KEY) !== "0";
      window.csrfToken = this.token || "";
      if (this.token) {
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
    },
    clear() {
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
