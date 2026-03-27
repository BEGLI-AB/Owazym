<template>
  <section class="album-page">
    <a class="icon-ghost album-close" data-hash="#home" href="/#home" :aria-label="t('close_player')">
      <i class="bi bi-x-lg"></i>
    </a>

    <div v-if="loading" class="text-white-50 p-3">{{ t("loading") }}</div>
    <template v-else>
      <div v-if="loadError" class="alert alert-warning mb-3">{{ loadError }}</div>

      <div class="album-hero">
        <div class="album-cover rounded-3 overflow-hidden">
          <img
            class="rounded-3"
            :src="heroCover"
            :data-default-cover="heroCover"
            :data-lock-cover="album.lock_album_cover ? '1' : '0'"
            alt="Cover image"
          />
        </div>

        <div class="album-info">
          <div class="album-title">{{ featured?.title || featured?.name || t("track") }}</div>
          <div class="album-subtitle artist-name">{{ featured?.artist || t("artist") }}</div>

          <div class="album-stats">
            <span v-if="featuredPlays" class="album-stat">
              <i class="bi bi-headphones"></i>
              {{ featuredPlays }} {{ t("plays") }}
            </span>
            <span class="album-stat">
              <i class="bi bi-download"></i>
              {{ featuredDownloads }} {{ t("download") }}
            </span>
            <button
              class="album-stat-info"
              type="button"
              :aria-label="t('artist')"
              :disabled="!featuredArtistId"
              @click="goToArtistPage"
            >
              <i class="bi bi-info-circle"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="album-playback">
        <button class="album-nav album-prev" type="button" :aria-label="t('previous')">
          <i class="bi bi-skip-start-fill"></i>
        </button>
        <button
          class="album-play"
          :data-music-id="featured?.id || ''"
          :data-audio-url="featured?.audio_url || ''"
          :data-title="featured?.title || featured?.name || t('track')"
          :data-artist="featured?.artist || t('artist')"
          :data-cover-url="heroCover"
        >
          <i class="bi bi-play-fill"></i>
        </button>
        <button class="album-nav album-next" type="button" :aria-label="t('next')">
          <i class="bi bi-skip-end-fill"></i>
        </button>
      </div>

      <div class="album-progress player-progress" aria-live="polite">
        <span class="progress-current">0:00</span>
        <div class="progress-bar player-seekbar" role="slider" :aria-label="t('seek')">
          <span class="bar-fill player-progress-fill"></span>
        </div>
        <span class="progress-duration">0:00</span>
      </div>

      <div class="album-actions">
        <button class="album-action-btn player-mode-btn album-mode-btn" type="button" :aria-label="t('play_mode')">
          <i class="bi bi-list"></i>
          <span>{{ t("play_mode") }}</span>
        </button>
        <button class="album-action-btn album-download" type="button" :data-music-id="featured?.id || ''" :aria-label="t('download')">
          <i class="bi bi-download"></i>
          <span>{{ t("download") }}</span>
        </button>
        <button class="album-action-btn album-add" type="button" :data-music-id="featured?.id || ''" :aria-label="t('add_to_playlist')">
          <i class="bi bi-plus-lg"></i>
          <span>{{ t("add_to_playlist") }}</span>
        </button>
      </div>

      <div class="album-tracklist">
        <div class="tracklist-head">
          <span class="text-center" :aria-label="t('plays')"><i class="bi bi-headphones"></i></span>
          <span>{{ t("title") }}</span>
          <span class="text-end"><i class="bi bi-clock"></i></span>
        </div>

        <div
          v-for="music in tracks"
          :key="music.id"
          class="track-row"
          :class="{ active: Number(featured?.id || 0) === Number(music.id) }"
          :data-music-id="music.id"
          :data-audio-url="music.audio_url || ''"
          :data-title="music.title || music.name || ''"
          :data-artist="music.artist || ''"
          :data-cover-url="music.cover_url || '/img/1.jpg'"
        >
          <span class="track-num">{{ playLabel(music.display_plays) }}</span>
          <div class="track-main">
            <div class="track-title">{{ music.title || music.name }}</div>
            <div class="track-artist">{{ music.artist }}</div>
          </div>
          <div class="track-end text-end">
            <button class="track-add album-add" type="button" :data-music-id="music.id" :aria-label="t('add_to_playlist')">
              <i class="bi bi-plus-lg"></i>
            </button>
            <div class="track-time">--:--</div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const loading = ref(true);
const loadError = ref("");
const album = ref({ tracks: [], featured: null, hero_cover_url: "", lock_album_cover: false });

const featured = computed(() => album.value.featured || null);
const tracks = computed(() => (album.value.tracks || []).slice(0, 12));
const heroCover = computed(() => album.value.hero_cover_url || featured.value?.cover_url || "/img/1.jpg");
const featuredArtistId = computed(() => {
  const trackArtistId = Number(featured.value?.artists?.[0]?.id || 0);
  const selectedArtistId = Number(album.value.artist_id || route.query.artist_id || 0);
  return trackArtistId || selectedArtistId || 0;
});
const compactNumber = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "0";
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} m`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)} k`;
  return String(Math.round(amount));
};
const playLabel = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 1_000) return "";
  return compactNumber(amount);
};
const featuredPlays = computed(() => playLabel(featured.value?.display_plays));
const featuredDownloads = computed(() =>
  compactNumber(featured.value?.downloads || featured.value?.downloads_count || featured.value?.download_count || 0),
);

const goToArtistPage = () => {
  if (!featuredArtistId.value) return;
  router.push(`/artist/${featuredArtistId.value}`);
};

const load = async () => {
  loading.value = true;
  loadError.value = "";

  try {
    album.value = await libraryService.getAlbum({
      artist_id: route.query.artist_id || undefined,
      music_id: route.query.music_id || undefined,
    });
  } catch (error) {
    album.value = { tracks: [], featured: null, hero_cover_url: "", lock_album_cover: false };
    loadError.value = error.message || t("failed_load_album");
  } finally {
    loading.value = false;
    await nextTick();
    window.dispatchEvent(new Event("owazym:route-changed"));
  }
};

watch(
  () => `${route.path}|${route.query.artist_id || ""}|${route.query.music_id || ""}`,
  load,
);
onMounted(load);
</script>
