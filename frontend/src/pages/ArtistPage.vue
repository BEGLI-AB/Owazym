<template>
  <section ref="pageRef" class="spotify-section main-page artist-page">
    <p v-if="loading" class="text-white-50">{{ t("loading") }}</p>

    <template v-else-if="artist">
      <div class="artist-shell">
        <button class="artist-back-btn" type="button" :aria-label="t('previous')" @click="goBack">
          <i class="bi bi-arrow-left"></i>
        </button>

        <header class="artist-hero" :style="artistHeroStyle">
          <div class="artist-hero-overlay">
            <div class="artist-kicker">{{ t("artist") }}</div>
            <h1 class="artist-name">{{ artist.name }}</h1>
            <div v-if="listenersLabel" class="artist-listeners">{{ listenersLabel }}</div>
          </div>
        </header>

        <article class="artist-description-card">
          <div class="artist-description-kicker">{{ t("artist_description") }}</div>
          <p class="artist-description-text">{{ artistDescription }}</p>
        </article>

        <section class="artist-top-block">
          <div class="artist-top-head">
            <h3>{{ t("top_songs") }}</h3>
            <a v-if="topTracks.length" class="artist-see-all" :href="albumUrl(topTracks[0].id)">{{ t("see_all") }}</a>
          </div>

          <div class="artist-top-list">
            <div
              v-for="(track, index) in topTracks"
              :key="track.id"
              class="artist-top-song music-card"
              :data-url="albumUrl(track.id)"
              :data-music-id="track.id"
              :data-audio-url="track.audio_url || ''"
              :data-title="track.title || track.name || ''"
              :data-artist="track.artist || artist.name || ''"
              :data-cover-url="track.cover_url || '/img/1.jpg'"
            >
              <div class="artist-song-left">
                <span class="artist-song-index">{{ index + 1 }}</span>
                <img :src="track.cover_url || '/img/1.jpg'" :alt="track.title || track.name || t('track')" @error="onTrackImgError" />
              </div>
              <div class="artist-song-main">
                <div class="artist-song-title">{{ track.title || track.name }}</div>
                <div class="artist-song-sub">{{ track.artist || artist.name }}</div>
              </div>
              <div class="artist-song-plays">{{ playLabel(track.display_plays) }}</div>
            </div>

            <p v-if="!topTracks.length" class="text-white-50 mb-0">{{ t("no_tracks_yet") }}</p>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const { t } = useI18n();
const loading = ref(true);
const artist = ref(null);
const pageRef = ref(null);
let themeObserver = null;
let themeRaf = 0;

const setImportantStyles = (element, styles) => {
  if (!(element instanceof HTMLElement)) return;
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value, "important");
  });
};

const applyArtistTheme = () => {
  const root = pageRef.value;
  if (!(root instanceof HTMLElement)) return;

  const isLight = document.body.classList.contains("light") || document.body.classList.contains("light-mode");
  const backBtn = root.querySelector(".artist-back-btn");
  const hero = root.querySelector(".artist-hero");
  const kicker = root.querySelector(".artist-kicker");
  const name = root.querySelector(".artist-name");
  const listeners = root.querySelector(".artist-listeners");
  const descriptionCard = root.querySelector(".artist-description-card");
  const descriptionKicker = root.querySelector(".artist-description-kicker");
  const descriptionText = root.querySelector(".artist-description-text");
  const topHeading = root.querySelector(".artist-top-head h3");
  const seeAll = root.querySelector(".artist-see-all");
  const emptyState = root.querySelector(".artist-top-list > p");
  const songCards = root.querySelectorAll(".artist-top-song.music-card");
  const songIndexes = root.querySelectorAll(".artist-song-index");
  const songTitles = root.querySelectorAll(".artist-song-title");
  const songSubs = root.querySelectorAll(".artist-song-sub");
  const songPlays = root.querySelectorAll(".artist-song-plays");

  setImportantStyles(root, {
    color: isLight ? "#0f172a" : "#ffffff",
  });

  setImportantStyles(backBtn, {
    border: isLight ? "1px solid rgba(15, 23, 42, 0.12)" : "1px solid rgba(255, 255, 255, 0.2)",
    background: isLight ? "rgba(255, 255, 255, 0.96)" : "rgba(255, 255, 255, 0.04)",
    color: isLight ? "#0f172a" : "#ffffff",
    "box-shadow": isLight ? "0 10px 24px rgba(15, 23, 42, 0.10)" : "none",
  });

  setImportantStyles(hero, {
    "box-shadow": isLight ? "0 22px 48px rgba(15, 23, 42, 0.14)" : "0 20px 44px rgba(0, 0, 0, 0.38)",
  });

  setImportantStyles(kicker, {
    color: "rgba(255, 255, 255, 0.88)",
  });

  setImportantStyles(name, {
    color: "#ffffff",
    "text-shadow": "0 3px 18px rgba(0, 0, 0, 0.28)",
  });

  setImportantStyles(listeners, {
    color: "rgba(255, 255, 255, 0.88)",
  });

  setImportantStyles(descriptionCard, {
    background: isLight ? "#f8fbff" : "rgba(255, 255, 255, 0.06)",
    border: isLight ? "1px solid rgba(15, 23, 42, 0.12)" : "1px solid rgba(255, 255, 255, 0.12)",
    "box-shadow": isLight ? "0 16px 36px rgba(15, 23, 42, 0.09)" : "none",
  });

  setImportantStyles(descriptionKicker, {
    color: isLight ? "rgba(15, 23, 42, 0.58)" : "rgba(255, 255, 255, 0.66)",
  });

  setImportantStyles(descriptionText, {
    color: isLight ? "#334155" : "rgba(255, 255, 255, 0.82)",
  });

  setImportantStyles(topHeading, {
    color: isLight ? "#0f172a" : "#ffffff",
  });

  setImportantStyles(seeAll, {
    color: isLight ? "rgba(15, 23, 42, 0.76)" : "rgba(255, 255, 255, 0.82)",
  });

  setImportantStyles(emptyState, {
    color: isLight ? "rgba(15, 23, 42, 0.65)" : "rgba(255, 255, 255, 0.65)",
  });

  songCards.forEach((card) => {
    setImportantStyles(card, {
      background: isLight ? "#ffffff" : "rgba(26, 30, 40, 0.9)",
      border: isLight ? "1px solid rgba(15, 23, 42, 0.12)" : "1px solid transparent",
      "box-shadow": isLight ? "0 12px 28px rgba(15, 23, 42, 0.07)" : "none",
    });
  });

  songIndexes.forEach((item) => {
    setImportantStyles(item, {
      color: isLight ? "rgba(15, 23, 42, 0.56)" : "rgba(255, 255, 255, 0.66)",
    });
  });

  songTitles.forEach((item) => {
    setImportantStyles(item, {
      color: isLight ? "#0f172a" : "#ffffff",
    });
  });

  songSubs.forEach((item) => {
    setImportantStyles(item, {
      color: isLight ? "rgba(15, 23, 42, 0.66)" : "rgba(255, 255, 255, 0.72)",
    });
  });

  songPlays.forEach((item) => {
    setImportantStyles(item, {
      color: isLight ? "rgba(15, 23, 42, 0.66)" : "rgba(255, 255, 255, 0.64)",
    });
  });
};

const scheduleApplyArtistTheme = () => {
  if (themeRaf) cancelAnimationFrame(themeRaf);
  themeRaf = requestAnimationFrame(() => {
    themeRaf = 0;
    applyArtistTheme();
  });
};

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

const tracks = computed(() => (Array.isArray(artist.value?.tracks) ? artist.value.tracks.filter(Boolean) : []));

const topTracks = computed(() =>
  tracks.value
    .slice()
    .sort((a, b) => Number(b?.plays || 0) - Number(a?.plays || 0))
    .slice(0, 8),
);

const listenersLabel = computed(() => {
  const visualListeners = Number(artist.value?.display_listeners);
  if (Number.isFinite(visualListeners) && visualListeners >= 1_000) {
    return `${compactNumber(visualListeners)} ${t("listeners")}`;
  }

  const totalPlays = tracks.value.reduce((sum, track) => sum + Number(track?.plays || 0), 0);
  if (totalPlays < 1_000) return "";
  return `${compactNumber(totalPlays)} ${t("listeners")}`;
});

const artistDescription = computed(() => {
  const text = String(artist.value?.description || "").trim();
  return text || t("no_artist_description");
});

const artistHeroStyle = computed(() => {
  const photo = String(artist.value?.photo_url || "/img/1.jpg").replace(/"/g, "%22");
  return {
    backgroundImage: `linear-gradient(180deg, rgba(7, 10, 20, 0.08) 0%, rgba(7, 10, 20, 0.72) 72%, rgba(7, 10, 20, 0.92) 100%), url("${photo}")`,
    backgroundPosition: "center 8%",
  };
});

const albumUrl = (trackId) => {
  const params = new URLSearchParams();
  const artistId = Number(artist.value?.id || route.params.id || 0);
  const musicId = Number(trackId || 0);
  if (artistId > 0) params.set("artist_id", String(artistId));
  if (musicId > 0) params.set("music_id", String(musicId));
  const query = params.toString();
  return `/${query ? `?${query}` : ""}#album`;
};

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  const target = "/#home";
  const navigate = window.__owazymNavigate;
  if (typeof navigate === "function") {
    navigate(target).catch(() => {
      window.location.href = target;
    });
    return;
  }
  window.location.href = target;
};

const load = async () => {
  loading.value = true;
  try {
    artist.value = await libraryService.getArtist(route.params.id);
  } catch (_error) {
    artist.value = {
      id: Number(route.params.id || 0),
      name: t("artist"),
      description: "",
      tracks: [],
      photo_url: "/img/1.jpg",
    };
  }
  loading.value = false;

  await nextTick();
  scheduleApplyArtistTheme();
  window.dispatchEvent(new Event("owazym:route-changed"));
};

const onTrackImgError = (event) => {
  event.target.onerror = null;
  event.target.src = "/img/1.jpg";
};

watch(() => route.params.id, load);
onMounted(async () => {
  await load();

  themeObserver = new MutationObserver(() => {
    scheduleApplyArtistTheme();
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("owazym:theme-changed", scheduleApplyArtistTheme);
});

onBeforeUnmount(() => {
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
  if (themeRaf) {
    cancelAnimationFrame(themeRaf);
    themeRaf = 0;
  }
  window.removeEventListener("owazym:theme-changed", scheduleApplyArtistTheme);
});
</script>

<style scoped>
.artist-page {
  padding-bottom: 108px;
}

.artist-shell {
  width: min(100%, 760px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.artist-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.artist-hero {
  position: relative;
  min-height: 400px;
  border-radius: 28px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.38);
}

.artist-hero-overlay {
  position: absolute;
  inset: auto 0 0;
  padding: 22px 20px 20px;
}

.artist-kicker {
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.artist-name {
  margin: 0;
  font-size: clamp(2rem, 8vw, 3.4rem);
  line-height: 1.02;
  color: #fff;
  text-shadow: 0 3px 18px rgba(0, 0, 0, 0.28);
}

.artist-listeners {
  margin-top: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.82);
}

.artist-description-card {
  display: block;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.artist-description-kicker {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.66);
  margin-bottom: 6px;
}

.artist-description-text {
  margin: 0;
  line-height: 1.45;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.82);
  white-space: pre-wrap;
}

.artist-top-block {
  margin-top: 4px;
}

.artist-top-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.artist-top-head h3 {
  margin: 0;
  font-size: clamp(1.4rem, 4.5vw, 2rem);
}

.artist-see-all {
  font-size: 0.84rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.82);
}

.artist-top-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.artist-top-song.music-card {
  width: 100%;
  min-width: 100%;
  flex: 0 0 100%;
  margin: 0;
  padding: 9px 10px;
  border-radius: 14px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  background: rgba(26, 30, 40, 0.9);
}

.artist-top-song.music-card:hover {
  transform: none;
  background: rgba(37, 43, 57, 0.95);
}

.artist-song-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.artist-song-index {
  width: 18px;
  text-align: center;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.8rem;
}

.artist-top-song img {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
}

.artist-song-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.artist-song-title {
  font-size: 0.96rem;
  font-weight: 600;
  line-height: 1.22;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist-song-sub {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.72);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist-song-plays {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.64);
}

:global(body.light) .artist-page,
:global(body.light) .artist-page * {
  color-scheme: light;
}

:global(body.light) .artist-page {
  color: #0f172a;
}

:global(body.light) .artist-back-btn {
  border-color: rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
}

:global(body.light) .artist-hero {
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.12);
}

:global(body.light) .artist-kicker,
:global(body.light) .artist-listeners {
  color: rgba(255, 255, 255, 0.9);
}

:global(body.light) .artist-page .artist-description-card {
  background: #f8fbff !important;
  border: 1px solid rgba(15, 23, 42, 0.12) !important;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09) !important;
}

:global(body.light) .artist-page .artist-description-kicker {
  color: rgba(15, 23, 42, 0.58) !important;
}

:global(body.light) .artist-page .artist-description-text {
  color: #334155 !important;
}

:global(body.light) .artist-page .artist-top-head h3 {
  color: #0f172a !important;
}

:global(body.light) .artist-page .artist-see-all {
  color: rgba(15, 23, 42, 0.76) !important;
  font-weight: 600;
}

:global(body.light) .artist-page .artist-top-song.music-card {
  background: #ffffff !important;
  border: 1px solid rgba(15, 23, 42, 0.12) !important;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07) !important;
}

:global(body.light) .artist-page .artist-top-song.music-card:hover {
  background: #ffffff !important;
  border-color: rgba(15, 23, 42, 0.18) !important;
}

:global(body.light) .artist-page .artist-song-index {
  color: rgba(15, 23, 42, 0.56) !important;
}

:global(body.light) .artist-page .artist-song-title {
  color: #0f172a !important;
}

:global(body.light) .artist-page .artist-song-sub,
:global(body.light) .artist-page .artist-song-plays {
  color: rgba(15, 23, 42, 0.66) !important;
}

@media (min-width: 992px) {
  .artist-shell {
    width: min(100%, 900px);
  }

  .artist-hero {
    min-height: 520px;
  }
}
</style>
