<template>
  <div class="app-shell font-Ambassador">
    <AppNavbar />

    <div class="d-flex">
      <AppSidebar :artists="artists" :has-more="hasMoreArtists" :is-admin="isAdmin" />

      <main id="appMain" class="app-content flex-grow-1 p-3 text-white" tabindex="-1">
        <router-view />
      </main>
    </div>

    <GlobalAudioPlayer />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppNavbar from "../components/AppNavbar.vue";
import AppSidebar from "../components/AppSidebar.vue";
import GlobalAudioPlayer from "../components/GlobalAudioPlayer.vue";
import { libraryService } from "../services/libraryService";
import { playlistService } from "../services/playlistService";
import { useAuthStore } from "../store/auth";
import { useLocaleStore } from "../store/locale";

const route = useRoute();
const auth = useAuthStore();
const locale = useLocaleStore();

const artists = ref([]);
const hasMoreArtists = computed(() => artists.value.length > 20);

const isAdmin = computed(() => {
  const user = auth.user || {};
  if (user.is_admin === true) return true;
  const role = String(user.role || "").toLowerCase().trim();
  if (role === "admin" || role === "administrator") return true;
  return String(user.name || "").toLowerCase().trim() === "admin";
});

const ensureJsonScript = (id, value) => {
  let script = document.getElementById(id);
  if (!(script instanceof HTMLScriptElement)) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/json";
    document.body.appendChild(script);
  }
  script.textContent = JSON.stringify(value);
};

const syncCommonDataScripts = async () => {
  ensureJsonScript("wishesData", locale.wishes());
  ensureJsonScript("i18nData", locale.legacyI18nData());

  if (!auth.isAuthenticated) {
    ensureJsonScript("playlistData", []);
    return;
  }

  try {
    const playlists = await playlistService.list();
    const compact = (playlists || []).map((item) => ({
      id: Number(item.id),
      name: String(item.name || ""),
    }));
    ensureJsonScript("playlistData", compact);
  } catch (_error) {
    ensureJsonScript("playlistData", []);
  }
};

const loadSidebar = async () => {
  try {
    artists.value = await libraryService.getArtists();
  } catch (_error) {
    artists.value = [];
  }
};

const initLegacyUi = () => {
  if (window.OwazymCommon?.initSharedUI) {
    window.OwazymCommon.initSharedUI();
  }
  if (window.OwazymPlayer?.initPlayerApp) {
    window.OwazymPlayer.initPlayerApp();
  }
};

watch(
  () => route.path,
  (path) => {
    document.body.classList.toggle("search-view", path === "/search");
  },
  { immediate: true },
);

watch(
  () => auth.user,
  () => {
    syncCommonDataScripts().finally(() => {
      initLegacyUi();
    });
  },
  { deep: true },
);

watch(
  () => locale.locale,
  () => {
    syncCommonDataScripts().finally(() => {
      initLegacyUi();
    });
  },
);

onMounted(async () => {
  await Promise.all([loadSidebar(), syncCommonDataScripts()]);
  initLegacyUi();
});
</script>
