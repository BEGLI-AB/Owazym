import { api } from "./api";

export const adminService = {
  async getCreateData(params = {}) {
    const { data } = await api.get("/admin/create-data", { params });
    return data.data;
  },

  async createArtist(payload) {
    const { data } = await api.post("/admin/artists", payload, { timeout: 120000 });
    return data.data;
  },

  async createCategory(payload) {
    const { data } = await api.post("/admin/categories", payload);
    return data.data;
  },

  async addArtistPopular(id) {
    const { data } = await api.post(`/admin/artists/${id}/popular`);
    return data.data;
  },

  async removeArtistPopular(id) {
    const { data } = await api.delete(`/admin/artists/${id}/popular`);
    return data.data;
  },

  async hideArtist(id) {
    const { data } = await api.post(`/admin/artists/${id}/hide`);
    return data.data;
  },

  async showArtist(id) {
    const { data } = await api.post(`/admin/artists/${id}/show`);
    return data.data;
  },

  async createMusic(payload) {
    const { data } = await api.post("/admin/musics", payload, { timeout: 120000 });
    return data.data;
  },

  async addMusicPopular(id) {
    const { data } = await api.post(`/admin/musics/${id}/popular`);
    return data.data;
  },

  async removeMusicPopular(id) {
    const { data } = await api.delete(`/admin/musics/${id}/popular`);
    return data.data;
  },

  async saveBanner(payload) {
    const { data } = await api.post("/admin/banner", payload, { timeout: 120000 });
    return data.data;
  },

  async deleteBanner(id) {
    const { data } = await api.delete(`/admin/banner/${id}`);
    return data.data;
  },

  async deleteArtist(id) {
    const { data } = await api.delete(`/admin/artists/${id}`);
    return data.data;
  },

  async deleteCategory(id) {
    const { data } = await api.delete(`/admin/categories/${id}`);
    return data.data;
  },

  async deleteMusic(id) {
    const { data } = await api.delete(`/admin/musics/${id}`);
    return data.data;
  },
};
