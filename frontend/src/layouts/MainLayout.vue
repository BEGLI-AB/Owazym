<template>
  <div class="app-shell font-Ambassador">
    <SeasonOverlay />
    <SiteNoticeOverlay />
    <AppNavbar />

    <div class="d-flex">
      <AppSidebar
        :artists="artists"
        :has-more="hasMoreArtists"
        :is-admin="isAdmin"
        :top10-vote-enabled="top10VoteEnabled"
      />

      <main id="appMain" class="app-content flex-grow-1 p-3 text-white" tabindex="-1">
        <router-view v-slot="{ Component, route: currentRoute }">
          <Transition name="page-soft" mode="out-in" appear>
            <div :key="currentRoute.fullPath" class="route-frame">
              <component :is="Component" />
            </div>
          </Transition>
        </router-view>
      </main>
    </div>

    <GlobalAudioPlayer />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppNavbar from "../components/AppNavbar.vue";
import AppSidebar from "../components/AppSidebar.vue";
import GlobalAudioPlayer from "../components/GlobalAudioPlayer.vue";
import SeasonOverlay from "../components/SeasonOverlay.vue";
import SiteNoticeOverlay from "../components/SiteNoticeOverlay.vue";
import { libraryService } from "../services/libraryService";
import { playlistService } from "../services/playlistService";
import { useAuthStore } from "../store/auth";
import { useLocaleStore } from "../store/locale";

const route = useRoute();
const auth = useAuthStore();
const locale = useLocaleStore();

const artists = ref([]);
const top10VoteEnabled = ref(true);
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

const loadTop10VoteStatus = async () => {
  try {
    const data = await libraryService.getTop10VoteStatus();
    top10VoteEnabled.value = data?.enabled !== false;
  } catch (_error) {
    top10VoteEnabled.value = true;
  }
};

const onTop10VoteToggled = (event) => {
  top10VoteEnabled.value = event?.detail?.enabled !== false;
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
    document.body.classList.toggle("show-album", path === "/album");
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
  await Promise.all([loadSidebar(), loadTop10VoteStatus(), syncCommonDataScripts()]);
  initLegacyUi();
  window.addEventListener("owazym:top10-vote-toggled", onTop10VoteToggled);
});

onBeforeUnmount(() => {
  window.removeEventListener("owazym:top10-vote-toggled", onTop10VoteToggled);
});
</script>
