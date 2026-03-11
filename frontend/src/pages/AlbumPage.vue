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
          <div class="album-meta">
            <span class="artist-dot"></span>
            <span class="artist-name">{{ featured?.artist || t("artist") }}</span>
            <span class="meta-dot"></span>
            <span>{{ featured?.year || t("unknown_year") }}</span>
          </div>
        </div>
      </div>

      <div class="album-actions">
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
        <button class="album-icon album-add" type="button" :data-music-id="featured?.id || ''" :aria-label="t('add_to_playlist')">
          <i class="bi bi-plus-lg"></i>
        </button>
        <button class="album-icon album-download" type="button" :data-music-id="featured?.id || ''" :aria-label="t('download')">
          <i class="bi bi-download"></i>
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
          <span class="track-num">{{ Number(music.plays || 0) }}</span>
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
import { useRoute } from "vue-router";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const { t } = useI18n();

const loading = ref(true);
const loadError = ref("");
const album = ref({ tracks: [], featured: null, hero_cover_url: "", lock_album_cover: false });

const featured = computed(() => album.value.featured || null);
const tracks = computed(() => (album.value.tracks || []).slice(0, 12));
const heroCover = computed(() => album.value.hero_cover_url || featured.value?.cover_url || "/img/1.jpg");

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
