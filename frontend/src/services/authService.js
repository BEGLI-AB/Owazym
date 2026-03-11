import { api } from "./api";

export const authService = {
  async login(payload) {
    const { data } = await api.post("/login", payload);
    return data.data;
  },
  async register(payload) {
    const { data } = await api.post("/register", payload);
    return data.data;
  },
  async me() {
    const { data } = await api.get("/user");
    return data.data;
  },
  async logout() {
    await api.post("/logout");
  },
};
