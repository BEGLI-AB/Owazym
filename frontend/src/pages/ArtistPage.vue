<template>
  <section class="spotify-section main-page">
    <p v-if="loading" class="text-white-50">{{ t("loading") }}</p>
    <template v-else-if="artist">
      <div class="d-flex flex-column flex-md-row align-items-md-center gap-4 mb-4">
        <img
          :src="artist.photo_url || '/img/1.jpg'"
          :alt="artist.name"
          class="rounded-circle"
          style="width:160px; height:160px; object-fit:cover;"
          @error="onArtistImgError"
        />
        <div>
          <div class="text-uppercase text-white-50 small mb-2" style="letter-spacing:.14em;">{{ t("artist") }}</div>
          <h1 class="mb-2">{{ artist.name }}</h1>
          <div class="text-white-50">{{ (artist.tracks || []).length }} {{ t("tracks_word") }}</div>
        </div>
      </div>

      <div class="scroll-row overflow-auto">
        <div
          v-for="track in artist.tracks || []"
          :key="track.id"
          class="music-card bg-dark"
          :data-url="`/?music_id=${track.id}#album`"
          :data-music-id="track.id"
          :data-audio-url="track.audio_url || ''"
          :data-title="track.title || track.name || ''"
          :data-artist="track.artist || ''"
          :data-cover-url="track.cover_url || '/img/1.jpg'"
        >
          <img :src="track.cover_url || '/img/1.jpg'" :alt="track.name" @error="onTrackImgError" />
          <div class="title">{{ track.name }}</div>
          <div class="artist">{{ track.artist }}</div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const { t } = useI18n();
const loading = ref(true);
const artist = ref(null);

const load = async () => {
  loading.value = true;
  try {
    artist.value = await libraryService.getArtist(route.params.id);
  } catch (_error) {
    artist.value = {
      name: t("artist"),
      tracks: [],
      photo_url: "/img/1.jpg",
    };
  }
  loading.value = false;

  await nextTick();
  window.dispatchEvent(new Event("owazym:route-changed"));
};

const onArtistImgError = (event) => {
  event.target.onerror = null;
  event.target.src = "/img/1.jpg";
};

const onTrackImgError = (event) => {
  event.target.onerror = null;
  event.target.src = "/img/1.jpg";
};

watch(() => route.params.id, load);
onMounted(load);
</script>
