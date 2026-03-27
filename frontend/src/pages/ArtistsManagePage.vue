<template>
  <div class="container" style="max-width: 760px;">
    <h2 class="mb-3">{{ t("artists_page_title") }}</h2>

    <div v-if="status" class="alert alert-success py-2">{{ status }}</div>
    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

    <form class="d-flex gap-2 mb-3" @submit.prevent="submitSearch">
      <input v-model="q" type="search" class="form-control" :placeholder="t('search_artist')" />
      <button type="submit" class="btn btn-outline-light">{{ t("search") }}</button>
    </form>

    <div v-if="isAdmin" class="card bg-dark text-white mb-3">
      <div class="card-body">
        <div class="fw-semibold mb-2">{{ t("already_in_popular_artists") }}</div>
        <div v-if="!popularArtists.length" class="text-white-50 small">{{ t("no_artists_yet") }}</div>
        <div v-else class="d-flex flex-wrap gap-2">
          <span v-for="artist in popularArtists" :key="`p-${artist.id}`" class="badge text-bg-success">{{ artist.name }}</span>
        </div>
      </div>
    </div>

    <div class="card bg-dark text-white">
      <ul class="list-group list-group-flush">
        <li
          v-for="artist in artists"
          :key="artist.id"
          class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center"
        >
          <span>{{ artist.name }}</span>
          <div class="d-flex align-items-center gap-2">
            <span class="badge text-bg-secondary">{{ artist.musics_count }}</span>
            <template v-if="isAdmin">
              <button
                :disabled="busy"
                type="button"
                class="btn btn-sm btn-outline-info"
                @click="publishArtistTrackBanner(artist)"
              >
                <i class="bi bi-megaphone me-1"></i>{{ artistAnnouncementCopy.button }}
              </button>
              <button
                v-if="artist.is_popular"
                :disabled="busy"
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="setPopular(artist, false)"
              >
                {{ t("remove") }}
              </button>
              <button
                v-else
                :disabled="busy"
                type="button"
                class="btn btn-sm btn-light"
                @click="setPopular(artist, true)"
              >
                {{ t("add") }}
              </button>
            </template>
          </div>
        </li>
        <li v-if="!artists.length && !loading" class="list-group-item bg-dark text-white-50">{{ t("no_artists_found") }}</li>
        <li v-if="loading" class="list-group-item bg-dark text-white-50">{{ t("loading") }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { libraryService } from "../services/libraryService";
import { adminService } from "../services/adminService";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { t, locale } = useI18n();

const loading = ref(false);
const busy = ref(false);
const status = ref("");
const error = ref("");
const q = ref("");
const artists = ref([]);
const popularArtists = ref([]);

const isAdmin = computed(() => {
  const user = auth.user || {};
  if (user.is_admin === true || user.isAdmin === true) return true;
  const role = String(user.role || "").toLowerCase().trim();
  if (role === "admin" || role === "administrator") return true;
  return String(user.name || "").toLowerCase().trim() === "admin";
});

const artistAnnouncementCopy = computed(() => {
  if (locale.value === "ru") {
    return {
      button: "Анонс наверх",
      success: "Верхнее уведомление опубликовано.",
      fallbackError: "Не удалось опубликовать уведомление.",
    };
  }

  if (locale.value === "en") {
    return {
      button: "Top notice",
      success: "The top announcement is now live.",
      fallbackError: "Failed to publish the announcement.",
    };
  }

  return {
    button: "Yokarda bildiris",
    success: "Yokarky bildiris acyldy.",
    fallbackError: "Yokarky bildiris acylmady.",
  };
});

const load = async () => {
  loading.value = true;
  error.value = "";
  try {
    const data = await libraryService.getArtistsIndex({ q: q.value || undefined });
    artists.value = data.artists || [];
    popularArtists.value = data.popular_artists || [];
  } catch (e) {
    error.value = e.message || t("failed_load_artists");
    artists.value = [];
    popularArtists.value = [];
  } finally {
    loading.value = false;
  }
};

const submitSearch = async () => {
  await router.replace({
    path: "/artists",
    query: q.value ? { q: q.value } : {},
  });
};

const setPopular = async (artist, popular) => {
  if (!isAdmin.value) return;
  status.value = "";
  error.value = "";
  busy.value = true;
  try {
    if (popular) {
      await adminService.addArtistPopular(artist.id);
      status.value = t("artist_added_popular");
    } else {
      await adminService.removeArtistPopular(artist.id);
      status.value = t("artist_removed_popular");
    }
    await load();
  } catch (e) {
    error.value = e.message || t("failed_update_popular");
  } finally {
    busy.value = false;
  }
};

const publishArtistTrackBanner = async (artist) => {
  if (!isAdmin.value || !artist?.id) return;
  status.value = "";
  error.value = "";
  busy.value = true;
  try {
    const notice = await adminService.publishArtistTrackBanner(artist.id);
    window.dispatchEvent(
      new CustomEvent("owazym:site-notice-published", {
        detail: { notice },
      }),
    );
    status.value = artistAnnouncementCopy.value.success;
  } catch (e) {
    error.value = e.message || artistAnnouncementCopy.value.fallbackError;
  } finally {
    busy.value = false;
  }
};

watch(
  () => route.query.q,
  async (value) => {
    q.value = String(value || "");
    await load();
  },
  { immediate: true },
);
</script>
