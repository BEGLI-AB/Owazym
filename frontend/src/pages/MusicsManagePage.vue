<template>
  <div class="container" style="max-width: 960px;">
    <h2 class="mb-3">{{ t("musics_page_title") }}</h2>

    <div v-if="status" class="alert alert-success py-2">{{ status }}</div>
    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

    <form class="d-flex gap-2 mb-3" @submit.prevent="submitSearch">
      <input v-model="q" type="search" class="form-control" :placeholder="t('search_track')" />
      <button type="submit" class="btn btn-outline-light">{{ t("search") }}</button>
    </form>

    <div v-if="isAdmin" class="card bg-dark text-white mb-3">
      <div class="card-body">
        <div class="fw-semibold mb-2">{{ t("already_in_popular") }}</div>
        <div v-if="!popularMusics.length" class="text-white-50 small">{{ t("no_tracks_yet") }}</div>
        <div v-else class="d-flex flex-wrap gap-2">
          <span v-for="music in popularMusics" :key="`p-${music.id}`" class="badge text-bg-success">{{ music.name }}</span>
        </div>
        <div class="fw-semibold mt-3 mb-2">{{ t("auto_popular_by_plays") }}</div>
        <div v-if="!autoPopularMusics.length" class="text-white-50 small">{{ t("no_tracks_yet") }}</div>
        <div v-else class="d-flex flex-wrap gap-2">
          <span v-for="music in autoPopularMusics" :key="`a-${music.id}`" class="badge text-bg-secondary">
            {{ music.name }} ({{ Number(music.plays || 0) }})
          </span>
        </div>
      </div>
    </div>

    <div class="card bg-dark text-white">
      <div class="table-responsive d-none d-md-block">
        <table class="table table-dark table-striped mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ t("title") }}</th>
              <th>{{ t("artists") }}</th>
              <th>{{ t("year") }}</th>
              <th>{{ t("language_label") }}</th>
              <th>{{ t("category") }}</th>
              <th v-if="isAdmin" class="text-end">{{ t("add") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="music in musics" :key="music.id">
              <td>{{ music.id }}</td>
              <td>{{ music.name }}</td>
              <td>{{ music.artist }}</td>
              <td>{{ music.year }}</td>
              <td>{{ music.language?.name || "-" }}</td>
              <td>{{ music.category?.name || "-" }}</td>
              <td v-if="isAdmin" class="text-end">
                <button
                  v-if="music.is_popular"
                  :disabled="busy"
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="setPopular(music, false)"
                >
                  {{ t("remove") }}
                </button>
                <button
                  v-else
                  :disabled="busy"
                  type="button"
                  class="btn btn-sm btn-light"
                  @click="setPopular(music, true)"
                >
                  {{ t("add") }}
                </button>
              </td>
            </tr>
            <tr v-if="!musics.length && !loading">
              <td :colspan="isAdmin ? 7 : 6" class="text-center text-white-50">{{ t("no_musics_found") }}</td>
            </tr>
            <tr v-if="loading">
              <td :colspan="isAdmin ? 7 : 6" class="text-center text-white-50">{{ t("loading") }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-md-none p-2">
        <article
          v-for="music in musics"
          :key="`m-${music.id}`"
          class="rounded-3 p-2 mb-2"
          style="background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);"
        >
          <div class="fw-semibold">{{ music.name }}</div>
          <div class="small text-white-50">{{ music.artist }}</div>
          <div class="small text-white-50 mt-1">{{ music.year }} &middot; {{ music.language?.name || "-" }} &middot; {{ music.category?.name || "-" }}</div>
          <div v-if="isAdmin" class="mt-2">
            <button
              v-if="music.is_popular"
              :disabled="busy"
              type="button"
              class="btn btn-sm btn-outline-danger"
              @click="setPopular(music, false)"
            >
              {{ t("remove") }}
            </button>
            <button
              v-else
              :disabled="busy"
              type="button"
              class="btn btn-sm btn-light"
              @click="setPopular(music, true)"
            >
              {{ t("add") }}
            </button>
          </div>
        </article>
        <div v-if="!musics.length && !loading" class="text-center text-white-50 py-3">{{ t("no_musics_found") }}</div>
      </div>
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
const { t } = useI18n();

const loading = ref(false);
const busy = ref(false);
const status = ref("");
const error = ref("");
const q = ref("");
const musics = ref([]);
const popularMusics = ref([]);
const autoPopularMusics = ref([]);

const isAdmin = computed(() => {
  const user = auth.user || {};
  if (user.is_admin === true || user.isAdmin === true) return true;
  const role = String(user.role || "").toLowerCase().trim();
  if (role === "admin" || role === "administrator") return true;
  return String(user.name || "").toLowerCase().trim() === "admin";
});

const load = async () => {
  loading.value = true;
  error.value = "";
  try {
    const data = await libraryService.getMusicsIndex({ q: q.value || undefined });
    musics.value = data.musics || [];
    popularMusics.value = data.popular_musics || [];
    autoPopularMusics.value = data.auto_popular_musics || [];
  } catch (e) {
    error.value = e.message || t("failed_load_musics");
    musics.value = [];
    popularMusics.value = [];
    autoPopularMusics.value = [];
  } finally {
    loading.value = false;
  }
};

const submitSearch = async () => {
  await router.replace({
    path: "/musics",
    query: q.value ? { q: q.value } : {},
  });
};

const setPopular = async (music, popular) => {
  if (!isAdmin.value) return;
  status.value = "";
  error.value = "";
  busy.value = true;
  try {
    if (popular) {
      await adminService.addMusicPopular(music.id);
      status.value = t("music_added_popular");
    } else {
      await adminService.removeMusicPopular(music.id);
      status.value = t("music_removed_popular");
    }
    await load();
  } catch (e) {
    error.value = e.message || t("failed_update_popular");
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
