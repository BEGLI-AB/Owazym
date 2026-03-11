<template>
  <div class="container" style="max-width: 1080px;">
    <div v-if="status" class="alert alert-info border-0 rounded-4">{{ status }}</div>

    <section class="rounded-4 p-4 mb-4 bg-dark border border-secondary-subtle">
      <div class="d-flex flex-wrap align-items-end justify-content-between gap-3">
        <div class="flex-grow-1">
          <p class="text-uppercase mb-2 text-white-50" style="letter-spacing:.14em;">{{ t("my_playlist_title") }}</p>
          <h5 class="mb-2">{{ t("create_my_playlist") }}</h5>
          <form class="d-flex flex-wrap gap-2" @submit.prevent="createPlaylist">
            <input
              v-model="name"
              type="text"
              class="form-control"
              style="max-width: 320px;"
              :placeholder="t('new_playlist_name')"
              required
              maxlength="120"
            />
            <button type="submit" class="btn btn-light rounded-pill px-3">
              <i class="bi bi-folder-plus me-1"></i> {{ t("create") }}
            </button>
          </form>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <a
            v-for="item in playlists"
            :key="item.id"
            :href="`/playlist?playlist_id=${item.id}`"
            class="btn rounded-pill px-3"
            :class="Number(item.id) === Number(active?.id || 0) ? 'btn-light text-dark' : 'btn-outline-light'"
          >
            {{ item.name }}
          </a>
        </div>
      </div>
    </section>

    <section class="rounded-4 p-4 mb-4" style="background: linear-gradient(135deg, rgba(42,11,74,.95), rgba(131,20,78,.85)); border:1px solid rgba(255,255,255,.08);">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <p class="text-uppercase mb-2 text-white-50" style="letter-spacing:.14em;">{{ t("my_playlist_title") }}</p>
          <h2 class="mb-2">{{ active?.name || t("no_playlist_selected") }}</h2>
          <div class="text-white-50">{{ tracks.length }} {{ t("tracks_word") }}</div>
        </div>

        <div class="d-flex gap-2">
          <a href="/#album" class="btn btn-light rounded-pill px-3">
            <i class="bi bi-play-fill me-1"></i> {{ t("start_listening") }}
          </a>
          <button v-if="active" type="button" class="btn btn-outline-danger rounded-pill px-3" @click="removePlaylist">
            <i class="bi bi-trash me-1"></i> {{ t("delete_playlist") }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="!tracks.length" class="card bg-dark text-white border-0 rounded-4">
      <div class="card-body py-5 text-center">
        <i class="bi bi-music-note-beamed" style="font-size:2rem;"></i>
        <h4 class="mt-3 mb-2">{{ active ? t("playlist_empty") : t("create_playlist_to_start") }}</h4>
        <p class="text-white-50 mb-0">{{ active ? t("add_tracks_from_pages") : t("use_form_then_add_tracks") }}</p>
      </div>
    </div>

    <div v-else class="row g-3">
      <div v-for="track in tracks" :key="track.id" class="col-12">
        <article class="card bg-dark text-white border-0 rounded-4 shadow-sm">
          <div class="card-body p-3 p-md-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <img :src="track.cover_url || '/img/1.jpg'" :alt="track.name" class="rounded-3" style="width:78px; height:78px; object-fit:cover;" @error="onImgError" />
              <div class="flex-grow-1">
                <h5 class="mb-1">{{ track.name }}</h5>
                <div class="text-white-50">{{ track.artist || t("unknown_artist") }}</div>
                <div class="small text-white-50 mt-1">{{ track.year || t("unknown_year") }} &middot; {{ track.category || t("no_category") }}</div>
              </div>

              <a
                :href="`/?music_id=${track.id}#album`"
                class="btn btn-outline-light rounded-pill px-3"
                :data-music-id="track.id"
                :data-audio-url="track.audio_url || ''"
                :data-title="track.name || ''"
                :data-artist="track.artist || ''"
                :data-cover-url="track.cover_url || '/img/1.jpg'"
              >
                <i class="bi bi-play-fill me-1"></i> {{ t("open") }}
              </a>

              <button type="button" class="btn btn-outline-danger rounded-pill px-3" @click="removeTrack(track.id)">
                <i class="bi bi-trash me-1"></i> {{ t("remove") }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { playlistService } from "../services/playlistService";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const { t } = useI18n();

const playlists = ref([]);
const active = ref(null);
const tracks = ref([]);
const name = ref("");
const status = ref("");

const onImgError = (event) => {
  event.target.onerror = null;
  event.target.src = "/img/1.jpg";
};

const syncPlaylistScript = () => {
  let script = document.getElementById("playlistData");
  if (!(script instanceof HTMLScriptElement)) {
    script = document.createElement("script");
    script.id = "playlistData";
    script.type = "application/json";
    document.body.appendChild(script);
  }
  script.textContent = JSON.stringify(
    playlists.value.map((item) => ({ id: Number(item.id), name: String(item.name || "") })),
  );
};

const setActiveByQuery = async () => {
  const requestedId = Number(route.query.playlist_id || 0);
  const fallbackId = Number(playlists.value[0]?.id || 0);
  const targetId = requestedId || fallbackId;

  if (!targetId) {
    active.value = null;
    tracks.value = [];
    return;
  }

  active.value = await playlistService.one(targetId);
  tracks.value = active.value?.tracks || [];
};

const refresh = async () => {
  playlists.value = await playlistService.list();
  syncPlaylistScript();
  await setActiveByQuery();

  await nextTick();
  window.dispatchEvent(new Event("owazym:route-changed"));
};

const createPlaylist = async () => {
  const playlistName = String(name.value || "").trim();
  if (!playlistName) return;

  try {
    const result = await playlistService.create(playlistName);
    status.value = result?.created ? t("playlist_created") : t("playlist_exists");
  } catch (error) {
    status.value = error.message || t("failed_create_playlist");
  }

  name.value = "";
  await refresh();
};

const removeTrack = async (trackId) => {
  if (!active.value) return;

  try {
    const result = await playlistService.removeTrack(active.value.id, trackId);
    status.value = result?.removed ? t("track_removed_from_playlist") : t("track_not_in_playlist");
  } catch (error) {
    status.value = error.message || t("failed_remove_track");
  }

  await refresh();
};

const removePlaylist = async () => {
  if (!active.value) return;
  if (!window.confirm(t("confirm_delete_playlist"))) return;

  try {
    await playlistService.remove(active.value.id);
    status.value = t("playlist_deleted");
  } catch (error) {
    status.value = error.message || t("failed_delete_playlist");
  }

  await refresh();
};

watch(
  () => `${route.path}|${route.query.playlist_id || ""}`,
  refresh,
);
onMounted(refresh);
</script>
