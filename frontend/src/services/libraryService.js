import { api } from "./api";

export const libraryService = {
  async getHome(params = {}) {
    const { data } = await api.get("/home", { params });
    return data.data;
  },
  async getAlbum(params = {}) {
    const { data } = await api.get("/albums", { params });
    return data.data;
  },
  async getTracks(params = {}) {
    const { data } = await api.get("/tracks", { params });
    return data.data;
  },
  async getTrack(id) {
    const { data } = await api.get(`/tracks/${id}`);
    return data.data;
  },
  async getArtists(params = {}) {
    const { data } = await api.get("/artists", { params });
    return data.data;
  },
  async getArtistsIndex(params = {}) {
    const { data } = await api.get("/artists-index", { params });
    return data.data;
  },
  async getArtist(id) {
    const { data } = await api.get(`/artists/${id}`);
    return data.data;
  },
  async getMusicsIndex(params = {}) {
    const { data } = await api.get("/musics-index", { params });
    return data.data;
  },
  async search(params = {}) {
    const { data } = await api.get("/search", { params });
    return data.data;
  },
  async play(id) {
    const { data } = await api.post(`/tracks/${id}/play`);
    return data.data;
  },
  async download(id) {
    const { data } = await api.get(`/tracks/${id}/download`);
    return data.data;
  },
  async getSubscription() {
    const { data } = await api.get("/subscription");
    return data.data;
  },
  async updateSubscription(plan) {
    const { data } = await api.post("/subscription", { plan });
    return data.data;
  },
  async submitSupport(payload) {
    const { data } = await api.post("/support", payload);
    return data.data;
  },
  async getTop10Vote() {
    const { data } = await api.get("/top10-vote");
    return data.data;
  },
  async getTop10VoteStatus() {
    const { data } = await api.get("/top10-vote/status");
    return data.data;
  },
  async getSiteEffects() {
    const { data } = await api.get("/site-effects");
    return data.data;
  },
  async submitTop10Vote(musicId) {
    const { data } = await api.post("/top10-vote", { music_id: musicId });
    return data.data;
  },
};
