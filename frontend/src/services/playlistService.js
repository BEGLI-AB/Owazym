import { api } from "./api";

export const playlistService = {
  async list() {
    const { data } = await api.get("/playlists");
    return data.data;
  },
  async one(id) {
    const { data } = await api.get(`/playlists/${id}`);
    return data.data;
  },
  async create(name) {
    const { data } = await api.post("/playlists", { name });
    return data.data;
  },
  async remove(id) {
    const { data } = await api.delete(`/playlists/${id}`);
    return data.data;
  },
  async addTrack(playlistId, musicId) {
    const { data } = await api.post("/playlists/tracks", {
      playlist_id: playlistId,
      music_id: musicId,
    });
    return data.data;
  },
  async removeTrack(playlistId, musicId) {
    const { data } = await api.delete("/playlists/tracks", {
      data: {
        playlist_id: playlistId,
        music_id: musicId,
      },
    });
    return data.data;
  },
};
