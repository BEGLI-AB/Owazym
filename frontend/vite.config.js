import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/album-data": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/music": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/playlists": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/playlist-tracks": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/storage": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
