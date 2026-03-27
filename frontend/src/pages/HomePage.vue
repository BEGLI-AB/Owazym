<template>
  <div v-if="loading" class="text-white-50 p-3">{{ t("loading") }}</div>
  <template v-else>
    <div v-if="loadError" class="alert alert-warning mb-3">{{ loadError }}</div>

    <section class="spotify-section main-page">
      <div v-if="isAdmin || homeBanners.length" class="mb-3 viewport banner-viewport">
        <button class="overlay-arrow right" type="button" :aria-label="t('next')" @click="slideBanner(1)">
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
        <button class="overlay-arrow left" type="button" :aria-label="t('previous')" @click="slideBanner(-1)">
          <i class="bi bi-chevron-left" aria-hidden="true"></i>
        </button>

        <div ref="bannerRow" class="scroll-row banner-scroll-row">
          <a
            v-if="isAdmin"
            href="/home-banner/create"
            class="banner-tile flex-shrink-0 border-0 text-white text-decoration-none d-flex align-items-center justify-content-between gap-3 rounded-3 px-4 py-4"
            style="height: 145px; min-height: 145px; background: linear-gradient(145deg, #1f6feb 0%, #0f3d8a 100%); border: 1px solid rgba(255,255,255,.18);"
          >
            <div class="d-flex align-items-center gap-3">
              <div class="text-start">
                <div class="fw-semibold">{{ t("add_banner") }}</div>
                <small class="text-white-50">{{ t("create_reklama_card") }}</small>
              </div>
            </div>
            <span
              class="rounded-circle d-inline-flex align-items-center justify-content-center"
              style="width:44px;height:44px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);"
            >
              <i class="bi bi-plus-lg" style="font-size: 22px; line-height: 1;"></i>
            </span>
          </a>

          <div v-for="item in homeBanners" :key="item.id" class="position-relative banner-tile flex-shrink-0">
            <a
              :href="item.url || '#'"
              :target="isExternalUrl(item.url) ? '_blank' : null"
              :rel="isExternalUrl(item.url) ? 'noopener noreferrer' : null"
              class="d-flex align-items-center justify-content-between gap-3 text-white text-decoration-none rounded-3 px-4 py-4"
              :style="bannerInlineStyle(item.image_url, hasBannerText(item))"
            >
              <div v-if="hasBannerText(item)" class="banner-copy">
                <div class="banner-copy__badge">
                  <i class="bi bi-bell-fill" aria-hidden="true"></i>
                  <span>OWAZYM</span>
                </div>
                <div v-if="bannerTitle(item)" class="banner-copy__title">{{ bannerTitle(item) }}</div>
                <div v-if="bannerSubtitle(item)" class="banner-copy__subtitle">{{ bannerSubtitle(item) }}</div>
              </div>
              <div v-else></div>
            </a>
            <button
              v-if="isAdmin"
              type="button"
              class="btn btn-sm btn-danger rounded-pill px-2 py-0 position-absolute top-0 start-0 m-2"
              style="font-size:.75rem;"
              @click="deleteHomeBanner(item.id)"
            >
              {{ t("delete") }}
            </button>
          </div>
        </div>
      </div>

	    </section>

	    <section class="spotify-section main-page home-featured-track-section">
	      <div>
	        <h3>{{ t("popular") }}</h3>
	      </div>

	      <div class="viewport">
	        <button class="overlay-arrow right" type="button" :aria-label="t('next')" @click="slidePopularTracks(1)">
	          <i class="bi bi-chevron-right" aria-hidden="true"></i>
	        </button>
	        <button class="overlay-arrow left" type="button" :aria-label="t('previous')" @click="slidePopularTracks(-1)">
	          <i class="bi bi-chevron-left" aria-hidden="true"></i>
	        </button>

	        <div ref="popularTracksRow" class="scroll-row overflow-auto">
	          <a
	            v-if="isAdmin"
	            href="/musics"
	            class="music-card bg-dark text-white text-decoration-none d-flex flex-column justify-content-center align-items-center"
	            style="min-height: 250px;"
	          >
	            <i class="bi bi-plus-lg" style="font-size: 46px; line-height: 1;"></i>
	            <div class="title mt-3">{{ t("choose_track") }}</div>
	            <div class="artist text-white-50">{{ t("from_existing") }}</div>
	          </a>
	          <div
	            v-for="music in homeTracks"
	            :key="music.id"
	            class="music-card bg-dark"
	            :data-url="musicUrl(music.id)"
	            :data-music-id="music.id"
	            :data-audio-url="music.audio_url || ''"
	            :data-title="music.title || music.name || ''"
	            :data-artist="music.artist || ''"
	            :data-cover-url="music.cover_url || '/img/1.jpg'"
	          >
	            <img :src="music.cover_url || '/img/1.jpg'" :alt="t('cover_image')" @error="onImgError" />
	            <div class="title">{{ music.name }}</div>
	            <div class="artist">{{ music.artist }}</div>
	          </div>
	        </div>
	      </div>
	    </section>

	    <section class="spotify-section main-page mt-4 popular-artists-section">
	      <img class="popular-artists-bg-logo" src="/img/image.png" alt="" aria-hidden="true" />
	      <div>
        <h3>{{ t("popular_artists") }}</h3>
      </div>
      <div class="viewport">
        <button class="overlay-arrow right" type="button" :aria-label="t('next')" @click="slidePopularArtists(1)">
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
        <button class="overlay-arrow left" type="button" :aria-label="t('previous')" @click="slidePopularArtists(-1)">
          <i class="bi bi-chevron-left" aria-hidden="true"></i>
        </button>

        <div ref="popularArtistsRow" class="scroll-row overflow-auto">
          <a
            v-if="isAdmin"
            href="/artists"
            class="text-white text-decoration-none d-flex flex-column align-items-center justify-content-center me-3"
            style="min-width: 170px;"
          >
            <span
              class="rounded-circle d-inline-flex align-items-center justify-content-center"
              style="width:150px; height:150px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.22);"
            >
              <i class="bi bi-plus-lg" style="font-size: 44px; line-height: 1;"></i>
            </span>
            <div class="artist mt-2 text-center">{{ t("choose_artist") }}</div>
          </a>
          <a
            v-for="artist in popularArtists"
            :key="artist.id"
            class="text-white text-decoration-none d-flex flex-column align-items-center me-3"
            :href="artistUrl(artist.id)"
            style="min-width: 170px;"
          >
            <img
              :src="artist.photo_url || '/img/1.jpg'"
              :alt="t('artist_photo')"
              class="rounded-circle"
              style="width:150px; height:150px; object-fit:cover;"
              @error="onImgError"
            />
            <div class="artist mt-2 text-center">{{ artist.name }}</div>
          </a>
        </div>
      </div>
    </section>

    <section class="spotify-section main-page mt-4">
      <div>
        <h3>{{ t("new_releases") }}</h3>
      </div>
      <div class="viewport">
        <button class="overlay-arrow right" type="button" :aria-label="t('next')" @click="slideNewReleases(1)">
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
        <button class="overlay-arrow left" type="button" :aria-label="t('previous')" @click="slideNewReleases(-1)">
          <i class="bi bi-chevron-left" aria-hidden="true"></i>
        </button>

        <div ref="newReleasesRow" class="scroll-row overflow-auto">
          <div
            v-for="music in newReleases"
            :key="music.id"
            class="music-card bg-dark"
            :data-url="musicUrl(music.id)"
            :data-music-id="music.id"
            :data-audio-url="music.audio_url || ''"
            :data-title="music.title || music.name || ''"
            :data-artist="music.artist || ''"
            :data-cover-url="music.cover_url || '/img/1.jpg'"
          >
            <img :src="music.cover_url || '/img/1.jpg'" :alt="t('cover_image')" @error="onImgError" />
            <div class="title">{{ music.name }}</div>
            <div class="artist">{{ music.artist }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="spotify-section main-page mt-4">
      <div class="popular-genres-showcase">
        <h3 class="popular-genres-title">{{ t("popular_by_genres") }}</h3>
        <div class="genre-rail">
          <article v-for="genre in popularGenres" :key="genre.id" class="genre-panel" :style="genreStyle(genre)">
            <div class="genre-panel__head">
              <h5 class="mb-0">{{ genre.name }}</h5>
              <small>{{ genre.musics_count }} {{ t("tracks_word") }}</small>
            </div>

            <div class="scroll-row genre-track-row">
              <div
                v-for="music in genre.tracks || []"
                :key="music.id"
                class="music-card bg-dark genre-track-card"
                :data-url="musicUrl(music.id)"
                :data-music-id="music.id"
                :data-audio-url="music.audio_url || ''"
                :data-title="music.title || music.name || ''"
                :data-artist="music.artist || ''"
                :data-cover-url="music.cover_url || '/img/1.jpg'"
              >
                <img :src="music.cover_url || '/img/1.jpg'" :alt="t('cover_image')" @error="onImgError" />
                <div class="title">{{ music.name }}</div>
                <div class="artist">{{ music.artist }}</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section ref="top10Section" class="spotify-section main-page mt-4 home-top10-section">
      <div class="home-top10-heading">
        <h3>{{ t("top_10_this_month") }}</h3>
        <div class="home-top10-actions">
          <a v-if="top10VoteEnabled" class="btn btn-outline-light rounded-pill px-3 home-top10-vote-link" href="/top10-vote">
            <i class="bi bi-check2-square me-1"></i>
            {{ t("vote_now") }}
          </a>
          <button v-else type="button" class="btn btn-outline-light rounded-pill px-3 home-top10-vote-link" disabled>
            <i class="bi bi-slash-circle me-1"></i>
            {{ t("vote_disabled") }}
          </button>
          <span v-if="isAdmin" class="home-top10-admin-badge">
            <i class="bi bi-headphones"></i>
            {{ t("plays") }}
          </span>
        </div>
      </div>

      <div
        class="home-top-tracklist"
        :class="{ 'home-top-tracklist--admin': isAdmin, 'home-top-tracklist--empty': !topMonthTracks.length }"
      >
        <div
          v-for="music in topMonthTracks"
          :key="music.id"
          class="track-row home-top-tracklist-row"
          :data-url="musicUrl(music.id)"
          :data-music-id="music.id"
          :data-audio-url="music.audio_url || ''"
          :data-title="music.title || music.name || ''"
          :data-artist="music.artist || ''"
          :data-cover-url="music.cover_url || '/img/1.jpg'"
        >
          <div class="home-top-tracklist-cover">
            <img :src="music.cover_url || '/img/1.jpg'" :alt="music.title || music.name || t('track')" @error="onImgError" />
          </div>

          <div class="track-main home-top-tracklist-main">
            <div class="track-title">{{ music.title || music.name }}</div>
            <div class="track-artist">{{ music.artist || t("unknown_artist") }}</div>
          </div>

          <div v-if="isAdmin" class="track-end home-top-tracklist-end">
            <span class="home-top-tracklist-plays">
              <i class="bi bi-headphones"></i>
              {{ Number(music.plays || 0) }}
            </span>
          </div>
        </div>

        <div v-if="!topMonthTracks.length" class="home-top-tracklist-empty">
          <div class="home-top-tracklist-empty-icon">
            <i class="bi bi-music-note-beamed"></i>
          </div>
          <div class="home-top-tracklist-empty-title">{{ t("no_tracks_yet") }}</div>
        </div>
      </div>
    </section>

	  </template>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { libraryService } from "../services/libraryService";
import { adminService } from "../services/adminService";
import { useAuthStore } from "../store/auth";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();

const loading = ref(true);
const loadError = ref("");
const home = ref({
  tracks: [],
  top_month_tracks: [],
  top10_vote_enabled: true,
  popular_artists: [],
  new_releases: [],
  popular_genres: [],
});

const homeTracks = computed(() => home.value.tracks || []);
const topMonthTracks = computed(() => home.value.top_month_tracks || []);
const top10VoteEnabled = computed(() => home.value.top10_vote_enabled !== false);
const popularArtists = computed(() => home.value.popular_artists || []);
const newReleases = computed(() => home.value.new_releases || []);
const popularGenres = computed(() => home.value.popular_genres || []);
const homeBanners = computed(() => {
  const list = Array.isArray(home.value.home_banners) ? home.value.home_banners : [];
  if (list.length) return list;
  return home.value.home_banner ? [home.value.home_banner] : [];
});
const top10Section = ref(null);
const bannerRow = ref(null);
const popularTracksRow = ref(null);
const popularArtistsRow = ref(null);
const newReleasesRow = ref(null);
let top10ThemeObserver = null;
let top10ThemeRaf = 0;

const setImportantStyles = (element, styles) => {
  if (!(element instanceof HTMLElement)) return;
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value, "important");
  });
};

const isLightTheme = () =>
  document.body.classList.contains("light") ||
  document.body.classList.contains("light-mode") ||
  document.documentElement.getAttribute("data-theme") === "light";

const applyHomeTop10Theme = () => {
  const root = top10Section.value;
  if (!(root instanceof HTMLElement)) return;

  const light = isLightTheme();
  const tracklist = root.querySelector(".home-top-tracklist");
  const voteLink = root.querySelector(".home-top10-vote-link");
  const emptyPanel = root.querySelector(".home-top-tracklist-empty");
  const emptyIcon = root.querySelector(".home-top-tracklist-empty-icon");
  const emptyTitle = root.querySelector(".home-top-tracklist-empty-title");
  const rowPanels = root.querySelectorAll(".home-top-tracklist-row");
  const activeRows = root.querySelectorAll(".home-top-tracklist-row.track-row.active");
  const coverPanels = root.querySelectorAll(".home-top-tracklist-cover");
  const titleNodes = root.querySelectorAll(".home-top-tracklist .track-title");
  const artistNodes = root.querySelectorAll(".home-top-tracklist .track-artist");
  const badgeNodes = root.querySelectorAll(".home-top10-admin-badge, .home-top-tracklist-plays");

  setImportantStyles(root, {
    color: light ? "#0f172a" : "#ffffff",
  });

  if (tracklist) {
    setImportantStyles(tracklist, {
      border: light ? "1px solid rgba(15, 23, 42, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
      background: light
        ? "linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96))"
        : "linear-gradient(180deg, rgba(10, 14, 24, 0.78), rgba(21, 26, 39, 0.56))",
      "box-shadow": light ? "0 20px 48px rgba(15, 23, 42, 0.1)" : "0 20px 48px rgba(0, 0, 0, 0.2)",
    });
  }

  rowPanels.forEach((element) => {
    setImportantStyles(element, {
      border: light ? "1px solid rgba(15, 23, 42, 0.08)" : "1px solid rgba(255, 255, 255, 0.07)",
      background: light ? "rgba(15, 23, 42, 0.03)" : "rgba(255, 255, 255, 0.035)",
    });
  });

  activeRows.forEach((element) => {
    setImportantStyles(element, {
      border: light ? "1px solid rgba(37, 99, 235, 0.18)" : "1px solid rgba(120, 160, 255, 0.26)",
      background: light ? "rgba(37, 99, 235, 0.08)" : "rgba(120, 160, 255, 0.16)",
      "box-shadow": light
        ? "0 10px 24px rgba(37, 99, 235, 0.08)"
        : "inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
    });
  });

  coverPanels.forEach((element) => {
    setImportantStyles(element, {
      background: light ? "rgba(15, 23, 42, 0.06)" : "rgba(255, 255, 255, 0.08)",
      "box-shadow": light
        ? "inset 0 0 0 1px rgba(15, 23, 42, 0.05)"
        : "inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
    });
  });

  titleNodes.forEach((element) => {
    setImportantStyles(element, {
      color: light ? "#0f172a" : "#ffffff",
    });
  });

  artistNodes.forEach((element) => {
    setImportantStyles(element, {
      color: light ? "#64748b" : "rgba(255, 255, 255, 0.72)",
    });
  });

  badgeNodes.forEach((element) => {
    setImportantStyles(element, {
      border: light ? "1px solid rgba(15, 23, 42, 0.1)" : "1px solid rgba(255, 255, 255, 0.12)",
      background: light ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.07)",
      color: light ? "#0f172a" : "#ffffff",
      "box-shadow": light ? "0 10px 24px rgba(15, 23, 42, 0.06)" : "none",
    });
  });

  if (voteLink) {
    setImportantStyles(voteLink, {
      color: light ? "#0f172a" : "#ffffff",
      border: light ? "1px solid rgba(15, 23, 42, 0.1)" : "1px solid rgba(255, 255, 255, 0.14)",
      background: light ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.05)",
      "box-shadow": light ? "0 12px 28px rgba(15, 23, 42, 0.08)" : "none",
    });
  }

  if (emptyPanel) {
    setImportantStyles(emptyPanel, {
      border: light ? "1px dashed rgba(15, 23, 42, 0.12)" : "1px dashed rgba(255, 255, 255, 0.14)",
      background: light
        ? "linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.92))"
        : "rgba(255, 255, 255, 0.03)",
      color: light ? "#334155" : "rgba(255, 255, 255, 0.82)",
      "box-shadow": light ? "inset 0 0 0 1px rgba(255, 255, 255, 0.35)" : "none",
    });
  }

  if (emptyIcon) {
    setImportantStyles(emptyIcon, {
      background: light ? "rgba(15, 23, 42, 0.06)" : "rgba(255, 255, 255, 0.08)",
      color: light ? "#0f172a" : "#ffffff",
      "box-shadow": light
        ? "inset 0 0 0 1px rgba(15, 23, 42, 0.05)"
        : "inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
    });
  }

  if (emptyTitle) {
    setImportantStyles(emptyTitle, {
      color: light ? "#334155" : "#ffffff",
    });
  }
};

const scheduleApplyHomeTop10Theme = () => {
  if (top10ThemeRaf) cancelAnimationFrame(top10ThemeRaf);
  top10ThemeRaf = requestAnimationFrame(() => {
    top10ThemeRaf = 0;
    applyHomeTop10Theme();
  });
};

const isAdmin = computed(() => {
  const user = auth.user || {};
  if (user.is_admin === true || user.isAdmin === true) return true;
  const role = String(user.role || "").toLowerCase().trim();
  if (role === "admin" || role === "administrator") return true;
  return String(user.name || "").toLowerCase().trim() === "admin";
});
const isExternalUrl = (url) => /^https?:\/\//i.test(String(url || "").trim());

const bannerTitle = (item) => {
  const value = String(item?.title || "").trim();
  if (!value) return "";
  const normalized = value.toLowerCase();
  if (normalized === "banner" || normalized === "home banner") return "";
  return value;
};

const bannerSubtitle = (item) => String(item?.subtitle || "").trim();

const hasBannerText = (item) => Boolean(bannerTitle(item) || bannerSubtitle(item));

const bannerInlineStyle = (imageUrl, withCopy = false) => {
  const image = String(imageUrl || "").trim();
  const fallbackGradient = withCopy
    ? "linear-gradient(135deg, #091321 0%, #143d6e 50%, #0a1424 100%)"
    : "linear-gradient(145deg, #1f6feb 0%, #0f3d8a 100%)";
  const softOverlay = withCopy
    ? "linear-gradient(100deg, rgba(6,10,22,.82) 0%, rgba(6,10,22,.46) 42%, rgba(6,10,22,.18) 70%, rgba(6,10,22,.58) 100%)"
    : "linear-gradient(90deg, rgba(8,13,28,.22) 0%, rgba(8,13,28,.10) 45%, rgba(8,13,28,.22) 100%)";
  return {
    height: "145px",
    minHeight: "145px",
    background: image ? `${softOverlay}, url('${image}')` : fallbackGradient,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    border: "1px solid rgba(255,255,255,.18)",
  };
};

const musicUrl = (id) => {
  const params = new URLSearchParams();
  const artistId = Number(route.query.artist_id || 0);
  if (artistId > 0) params.set("artist_id", String(artistId));
  params.set("music_id", String(id));
  const query = params.toString();
  return `/${query ? `?${query}` : ""}#album`;
};

const artistUrl = (id) => `/artist/${id}`;

const genreStyle = (genre) => {
  const firstTrack = (genre.tracks || [])[0];
  if (!firstTrack?.cover_url) return {};
  return { "--genre-bg": `url('${firstTrack.cover_url}')` };
};

const onImgError = (event) => {
  event.target.onerror = null;
  event.target.src = "/img/1.jpg";
};

const slideRow = (rowRef, direction, cardSelector) => {
  const row = rowRef?.value;
  if (!row) return;
  const firstCard = row.querySelector(cardSelector);
  const computedStyles = window.getComputedStyle(row);
  const gap = Number.parseInt(computedStyles.columnGap || computedStyles.gap || "18", 10) || 18;
  const step = firstCard ? firstCard.getBoundingClientRect().width + gap : Math.max(320, row.clientWidth * 0.9);
  row.scrollBy({ left: direction * step, behavior: "smooth" });
};

const slideBanner = (direction) => slideRow(bannerRow, direction, ".banner-tile");
const slidePopularTracks = (direction) => slideRow(popularTracksRow, direction, ".music-card");
const slidePopularArtists = (direction) => slideRow(popularArtistsRow, direction, "a");
const slideNewReleases = (direction) => slideRow(newReleasesRow, direction, ".music-card");

const clearLegacyTop10SectionQuery = async () => {
  if (route.path !== "/" || String(route.query.section || "") !== "top10") return;

  const nextQuery = { ...route.query };
  delete nextQuery.section;

  await router.replace({
    path: "/",
    query: nextQuery,
    hash: "#home",
  });

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

const deleteHomeBanner = async (bannerId) => {
  const id = Number(bannerId || 0);
  if (!id) return;
  if (!window.confirm(t("delete_banner_confirm"))) return;
  try {
    await adminService.deleteBanner(id);
    await load();
  } catch (error) {
    loadError.value = error.message || t("failed_delete_banner");
  }
};

const load = async () => {
  loading.value = true;
  loadError.value = "";

  const params = {
    artist_id: route.query.artist_id || undefined,
    music_id: route.query.music_id || undefined,
  };

  try {
    const homeData = await libraryService.getHome(params);
    home.value = homeData || {};
  } catch (error) {
    home.value = { tracks: [], top_month_tracks: [], top10_vote_enabled: true, popular_artists: [], new_releases: [], popular_genres: [] };
    loadError.value = error.message || t("failed_load_home");
  } finally {
    loading.value = false;
    await nextTick();
    scheduleApplyHomeTop10Theme();
    await clearLegacyTop10SectionQuery();
    window.dispatchEvent(new Event("owazym:route-changed"));
  }
};

watch(
  () => `${route.path}|${route.query.artist_id || ""}|${route.query.music_id || ""}`,
  load,
);
watch(
  () => route.query.section,
  () => {
    clearLegacyTop10SectionQuery();
  },
);
watch(
  () => `${topMonthTracks.value.length}|${isAdmin.value}`,
  async () => {
    await nextTick();
    scheduleApplyHomeTop10Theme();
  },
);

onMounted(async () => {
  await load();

  top10ThemeObserver = new MutationObserver(() => {
    scheduleApplyHomeTop10Theme();
  });

  if (document.body) {
    top10ThemeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  top10ThemeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  window.addEventListener("owazym:theme-changed", scheduleApplyHomeTop10Theme);
});

onBeforeUnmount(() => {
  if (top10ThemeObserver) {
    top10ThemeObserver.disconnect();
    top10ThemeObserver = null;
  }

  if (top10ThemeRaf) {
    cancelAnimationFrame(top10ThemeRaf);
    top10ThemeRaf = 0;
  }

  window.removeEventListener("owazym:theme-changed", scheduleApplyHomeTop10Theme);
});
</script>

<style scoped>
.banner-viewport {
  width: 100%;
  margin-top: 8px;
}

.banner-scroll-row {
  overflow-y: hidden;
  gap: 0;
  scroll-snap-type: x mandatory;
}

.banner-tile {
  flex: 0 0 100%;
  width: 100%;
  min-width: 100%;
  scroll-snap-align: start;
}

.banner-copy {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  max-width: min(72%, 560px);
}

.banner-copy__badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.78rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(8, 13, 28, 0.42);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  backdrop-filter: blur(12px);
}

.banner-copy__title {
  font-size: clamp(1.45rem, 3vw, 2.7rem);
  font-weight: 700;
  line-height: 1.04;
  text-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
}

.banner-copy__subtitle {
  max-width: 34rem;
  color: rgba(255, 255, 255, 0.84);
  font-size: clamp(0.95rem, 1.3vw, 1.08rem);
  text-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
}

.viewport .overlay-arrow {
  opacity: 0;
  pointer-events: none;
}

.viewport:hover .overlay-arrow {
  opacity: 1;
  pointer-events: auto;
}

.spotify-section.main-page {
  position: relative;
  z-index: 1;
}

.home-top10-section {
  width: 100%;
}

.home-featured-track-section {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.home-top10-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.95rem;
}

.home-top10-heading h3 {
  margin: 0;
}

.home-top10-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.home-top10-admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.9rem;
  line-height: 1;
}

.home-top10-vote-link {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
}

.home-top10-vote-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.22);
}

.home-top-tracklist {
  width: 100%;
  max-width: none;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0;
  padding: 1rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(10, 14, 24, 0.78), rgba(21, 26, 39, 0.56));
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(14px);
}

.home-top-tracklist-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.035);
  overflow: hidden;
}

.home-top-tracklist--admin .home-top-tracklist-row {
  grid-template-columns: 56px minmax(0, 1fr) auto;
}

.home-top-tracklist-row.track-row.active {
  background: rgba(120, 160, 255, 0.16);
  border-color: rgba(120, 160, 255, 0.26);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.home-top-tracklist-cover {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.home-top-tracklist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.home-top-tracklist-main {
  min-width: 0;
}

.home-top-tracklist-main .track-title,
.home-top-tracklist-main .track-artist {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-top-tracklist-main .track-title {
  font-size: 1rem;
}

.home-top-tracklist-end {
  justify-self: end;
}

.home-top-tracklist-plays {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 86px;
  padding: 0.62rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

.home-top-tracklist-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  min-height: 180px;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.82);
  text-align: center;
  pointer-events: none;
}

.home-top-tracklist-empty-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 1.25rem;
}

.home-top-tracklist-empty-title {
  font-size: 1rem;
  font-weight: 600;
}

:global(body.light) .home-top10-admin-badge,
:global(body.light) .home-top-tracklist-plays {
  border-color: rgba(15, 23, 42, 0.1);
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
}

:global(body.light) .home-top10-vote-link {
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.1);
  background: rgba(15, 23, 42, 0.04);
}

:global(body.light) .home-top10-vote-link:hover {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.16);
}

:global(body.light) .home-top-tracklist {
  border-color: rgba(15, 23, 42, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9));
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.1);
}

:global(body.light) .home-top-tracklist-row {
  border-color: rgba(15, 23, 42, 0.08);
  background: rgba(15, 23, 42, 0.03);
}

:global(body.light) .home-top-tracklist-row.track-row.active {
  border-color: rgba(37, 99, 235, 0.18);
  background: rgba(37, 99, 235, 0.08);
}

:global(body.light) .home-top-tracklist-cover,
:global(body.light) .home-top-tracklist-empty-icon {
  background: rgba(15, 23, 42, 0.06);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05);
}

:global(body.light) .home-top-tracklist .track-title {
  color: #0f172a;
}

:global(body.light) .home-top-tracklist .track-artist {
  color: #64748b;
}

:global(body.light) .home-top-tracklist-empty {
  border-color: rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.03);
  color: #334155;
}

:global(body.light) .banner-copy__badge {
  border-color: rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
}

@media (max-width: 991.98px) {
  .home-top10-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .home-top10-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .home-top-tracklist {
    padding: 0.85rem;
    border-radius: 20px;
  }

  .home-top-tracklist-row,
  .home-top-tracklist--admin .home-top-tracklist-row {
    grid-template-columns: 50px minmax(0, 1fr) auto;
    gap: 0.8rem;
    padding: 0.75rem;
    border-radius: 16px;
  }

  .home-top-tracklist-cover {
    width: 50px;
    height: 50px;
    border-radius: 14px;
  }

  .home-top-tracklist-plays {
    min-width: 74px;
    padding-inline: 0.7rem;
    font-size: 0.9rem;
  }

  .banner-copy {
    max-width: min(80%, 440px);
  }
}

@media (max-width: 575.98px) {
  .banner-copy {
    max-width: 100%;
    gap: 0.5rem;
  }

  .banner-copy__badge {
    padding: 0.36rem 0.68rem;
    font-size: 0.64rem;
  }

  .banner-copy__title {
    font-size: 1.35rem;
  }

  .banner-copy__subtitle {
    font-size: 0.9rem;
  }

  .home-top-tracklist-row,
  .home-top-tracklist--admin .home-top-tracklist-row {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .home-top-tracklist-end {
    grid-column: 2;
    justify-self: start;
    margin-top: 0.25rem;
  }

  .home-top-tracklist-cover {
    width: 46px;
    height: 46px;
    border-radius: 12px;
  }
}

.popular-artists-section {
  position: relative;
  isolation: isolate;
}

.popular-artists-section > :not(.popular-artists-bg-logo) {
  position: relative;
  z-index: 1;
}

.popular-artists-bg-logo {
  position: fixed;
  left: 50%;
  bottom: 0;
  width: clamp(740px, 60vw, 1060px);
  opacity: 0.45;
  transform: translate(-50%, 35%);
  pointer-events: none;
  user-select: none;
  z-index: 0;
  filter: drop-shadow(0 0 26px rgba(230, 0, 120, 0.28));
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.72) 42%,
    rgba(0, 0, 0, 0.25) 58%,
    rgba(0, 0, 0, 0.05) 78%,
    rgba(0, 0, 0, 0) 100%
  );
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.72) 42%,
    rgba(0, 0, 0, 0.25) 58%,
    rgba(0, 0, 0, 0.05) 78%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

@media (max-width: 991.98px) {
  .popular-artists-bg-logo {
    left: 50%;
    bottom: 0;
    width: min(122vw, 680px);
    opacity: 0.36;
    transform: translate(-50%, 35%);
    filter: none;
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.65) 44%,
      rgba(0, 0, 0, 0.22) 60%,
      rgba(0, 0, 0, 0.04) 80%,
      rgba(0, 0, 0, 0) 100%
    );
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.65) 44%,
      rgba(0, 0, 0, 0.22) 60%,
      rgba(0, 0, 0, 0.04) 80%,
      rgba(0, 0, 0, 0) 100%
    );
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }
}
</style>
