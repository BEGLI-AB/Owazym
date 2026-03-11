import { defineStore } from "pinia";
import { libraryService } from "../services/libraryService";

const audio = new Audio();
audio.preload = "metadata";

const STORAGE_KEY = "owazym_player_state";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    currentTrack: null,
    queue: [],
    queueIndex: -1,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    repeat: "off",
    shuffle: false,
    hydrated: false,
  }),
  actions: {
    bootstrap() {
      if (this.hydrated) return;
      this.hydrated = true;

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const state = JSON.parse(raw);
          this.volume = Number(state.volume ?? 1);
          this.repeat = state.repeat || "off";
          this.shuffle = Boolean(state.shuffle);
          this.queue = state.queue || [];
          this.queueIndex = Number(state.queueIndex ?? -1);
          this.currentTrack = state.currentTrack || null;
          if (this.currentTrack?.audio_url) {
            audio.src = this.currentTrack.audio_url;
            audio.currentTime = Number(state.currentTime || 0);
          }
        } catch (_e) {}
      }

      audio.volume = this.volume;
      audio.addEventListener("timeupdate", () => {
        this.currentTime = audio.currentTime || 0;
        this.persist();
      });
      audio.addEventListener("loadedmetadata", () => {
        this.duration = audio.duration || 0;
      });
      audio.addEventListener("play", () => {
        this.isPlaying = true;
        this.persist();
      });
      audio.addEventListener("pause", () => {
        this.isPlaying = false;
        this.persist();
      });
      audio.addEventListener("ended", () => this.handleEnded());
    },

    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentTrack: this.currentTrack,
          queue: this.queue,
          queueIndex: this.queueIndex,
          volume: this.volume,
          currentTime: this.currentTime,
          repeat: this.repeat,
          shuffle: this.shuffle,
        }),
      );
    },

    setQueue(list, startTrackId = null) {
      this.queue = Array.isArray(list) ? list : [];
      if (startTrackId != null) {
        const idx = this.queue.findIndex((item) => Number(item.id) === Number(startTrackId));
        this.queueIndex = idx >= 0 ? idx : 0;
      } else {
        this.queueIndex = this.queue.length ? 0 : -1;
      }
      this.persist();
    },

    async playTrack(track, list = null) {
      if (!track?.audio_url) return;

      if (list) {
        this.setQueue(list, track.id);
      } else if (this.queue.length) {
        const idx = this.queue.findIndex((item) => Number(item.id) === Number(track.id));
        if (idx >= 0) this.queueIndex = idx;
      }

      this.currentTrack = track;
      this.duration = 0;
      this.currentTime = 0;

      if (audio.src !== track.audio_url) {
        audio.src = track.audio_url;
      } else {
        audio.currentTime = 0;
      }

      await audio.play();
      this.isPlaying = true;
      this.persist();
      if (track.id) {
        libraryService.play(track.id).catch(() => {});
      }
    },

    async togglePlay() {
      if (!this.currentTrack && this.queue.length) {
        await this.playTrack(this.queue[this.queueIndex >= 0 ? this.queueIndex : 0]);
        return;
      }
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    },

    seek(seconds) {
      audio.currentTime = Number(seconds || 0);
      this.currentTime = audio.currentTime;
      this.persist();
    },

    setVolume(value) {
      const next = Math.max(0, Math.min(1, Number(value || 0)));
      this.volume = next;
      audio.volume = next;
      this.persist();
    },

    async next() {
      if (!this.queue.length) return;
      if (this.shuffle) {
        const random = Math.floor(Math.random() * this.queue.length);
        this.queueIndex = random;
      } else {
        this.queueIndex = (this.queueIndex + 1) % this.queue.length;
      }
      await this.playTrack(this.queue[this.queueIndex]);
    },

    async prev() {
      if (!this.queue.length) return;
      if (audio.currentTime > 3) {
        this.seek(0);
        return;
      }
      this.queueIndex = (this.queueIndex - 1 + this.queue.length) % this.queue.length;
      await this.playTrack(this.queue[this.queueIndex]);
    },

    async handleEnded() {
      if (this.repeat === "one") {
        await this.playTrack(this.currentTrack);
        return;
      }
      if (!this.queue.length) return;
      if (this.repeat === "all" || this.queueIndex < this.queue.length - 1 || this.shuffle) {
        await this.next();
      }
    },

    toggleRepeat() {
      this.repeat = this.repeat === "off" ? "all" : this.repeat === "all" ? "one" : "off";
      this.persist();
    },

    toggleShuffle() {
      this.shuffle = !this.shuffle;
      this.persist();
    },
  },
});
