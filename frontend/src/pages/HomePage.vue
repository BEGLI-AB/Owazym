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
            style="width: min(100%, 640px); height: 145px; min-height: 145px; background: linear-gradient(145deg, #1f6feb 0%, #0f3d8a 100%); border: 1px solid rgba(255,255,255,.18);"
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

          <div v-for="item in homeBanners" :key="item.id" class="position-relative banner-tile flex-shrink-0" style="width: min(100%, 640px);">
            <a
              :href="item.url || '#'"
              :target="item.url ? '_blank' : null"
              :rel="item.url ? 'noopener noreferrer' : null"
              class="d-flex align-items-center justify-content-between gap-3 text-white text-decoration-none rounded-3 px-4 py-4"
              :style="bannerInlineStyle(item.image_url)"
            >
              <div></div>
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

      <div>
        <h3>{{ t("popular") }}</h3>
      </div>

      <div class="viewport">
        <button class="overlay-arrow right" id="nextBtn" onclick="slide(1)" :aria-label="t('next')">
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
        <button class="overlay-arrow left" id="prevBtn" onclick="slide(-1)" :aria-label="t('previous')">
          <i class="bi bi-chevron-left" aria-hidden="true"></i>
        </button>

        <div class="scroll-row" id="row">
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

    <section class="spotify-section main-page mt-4">
      <div>
        <h3>{{ t("popular_artists") }}</h3>
      </div>
      <div class="scroll-row overflow-auto">
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
    </section>

    <section class="spotify-section main-page mt-4">
      <div>
        <h3>{{ t("new_releases") }}</h3>
      </div>
      <div class="scroll-row overflow-auto">
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

    <section class="album-page">
      <a class="icon-ghost album-close" data-hash="#home" href="/#home" :aria-label="t('close_player')">
        <i class="bi bi-x-lg"></i>
      </a>

      <div class="album-hero">
        <div class="album-cover rounded-3 overflow-hidden">
          <img
            class="rounded-3"
            :src="albumHeroCover"
            :data-default-cover="albumHeroCover"
            :data-lock-cover="album.lock_album_cover ? '1' : '0'"
            :alt="t('cover_image')"
          />
        </div>

        <div class="album-info">
          <div class="album-title">{{ albumFeatured?.title || albumFeatured?.name || t("track") }}</div>
          <div class="album-meta">
            <span class="artist-dot"></span>
            <span class="artist-name">{{ albumFeatured?.artist || t("artist") }}</span>
            <span class="meta-dot"></span>
            <span>{{ albumFeatured?.year || t("unknown_year") }}</span>
          </div>
        </div>
      </div>

      <div class="album-actions">
        <button
          class="album-play"
          :data-music-id="albumFeatured?.id || ''"
          :data-audio-url="albumFeatured?.audio_url || ''"
          :data-title="albumFeatured?.title || albumFeatured?.name || t('track')"
          :data-artist="albumFeatured?.artist || t('artist')"
          :data-cover-url="albumHeroCover"
        >
          <i class="bi bi-play-fill"></i>
        </button>

        <button class="album-icon album-add" type="button" :data-music-id="albumFeatured?.id || ''" :aria-label="t('add_to_playlist')">
          <i class="bi bi-plus-lg"></i>
        </button>
        <button class="album-icon album-download" type="button" :data-music-id="albumFeatured?.id || ''" :aria-label="t('download')">
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
          v-for="music in albumTracks"
          :key="music.id"
          class="track-row"
          :class="{ active: Number(albumFeatured?.id || 0) === Number(music.id) }"
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
    </section>
  </template>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { libraryService } from "../services/libraryService";
import { adminService } from "../services/adminService";
import { useAuthStore } from "../store/auth";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const auth = useAuthStore();
const { t } = useI18n();

const loading = ref(true);
const loadError = ref("");
const home = ref({
  tracks: [],
  popular_artists: [],
  new_releases: [],
  popular_genres: [],
});

const album = ref({
  tracks: [],
  featured: null,
  hero_cover_url: "",
  lock_album_cover: false,
});

const homeTracks = computed(() => home.value.tracks || []);
const popularArtists = computed(() => home.value.popular_artists || []);
const newReleases = computed(() => home.value.new_releases || []);
const popularGenres = computed(() => home.value.popular_genres || []);
const homeBanners = computed(() => {
  const list = Array.isArray(home.value.home_banners) ? home.value.home_banners : [];
  if (list.length) return list;
  return home.value.home_banner ? [home.value.home_banner] : [];
});
const albumFeatured = computed(() => album.value.featured || home.value.featured_track || null);
const albumTracks = computed(() => (album.value.tracks || []).slice(0, 8));
const albumHeroCover = computed(() => album.value.hero_cover_url || albumFeatured.value?.cover_url || "/img/1.jpg");
const bannerRow = ref(null);
const isAdmin = computed(() => {
  const user = auth.user || {};
  if (user.is_admin === true || user.isAdmin === true) return true;
  const role = String(user.role || "").toLowerCase().trim();
  if (role === "admin" || role === "administrator") return true;
  return String(user.name || "").toLowerCase().trim() === "admin";
});
const bannerInlineStyle = (imageUrl) => {
  const image = String(imageUrl || "").trim();
  const fallbackGradient = "linear-gradient(145deg, #1f6feb 0%, #0f3d8a 100%)";
  const softOverlay = "linear-gradient(90deg, rgba(8,13,28,.22) 0%, rgba(8,13,28,.10) 45%, rgba(8,13,28,.22) 100%)";
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

const artistUrl = (id) => `/?artist_id=${id}#album`;

const genreStyle = (genre) => {
  const firstTrack = (genre.tracks || [])[0];
  if (!firstTrack?.cover_url) return {};
  return { "--genre-bg": `url('${firstTrack.cover_url}')` };
};

const onImgError = (event) => {
  event.target.onerror = null;
  event.target.src = "/img/1.jpg";
};

const slideBanner = (direction) => {
  const row = bannerRow.value;
  if (!row) return;
  const firstCard = row.querySelector(".banner-tile");
  const computedStyles = window.getComputedStyle(row);
  const gap = Number.parseInt(computedStyles.columnGap || computedStyles.gap || "18", 10) || 18;
  const step = firstCard ? firstCard.getBoundingClientRect().width + gap : Math.max(320, row.clientWidth * 0.9);
  row.scrollBy({ left: direction * step, behavior: "smooth" });
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
    const [homeData, albumData] = await Promise.all([
      libraryService.getHome(params),
      libraryService.getAlbum(params),
    ]);

    home.value = homeData || {};
    album.value = albumData || { tracks: [], featured: null };
  } catch (error) {
    home.value = { tracks: [], popular_artists: [], new_releases: [], popular_genres: [] };
    album.value = { tracks: [], featured: null };
    loadError.value = error.message || t("failed_load_home");
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

<style scoped>
.banner-scroll-row {
  overflow-y: hidden;
}

.banner-tile {
  scroll-snap-align: start;
}
</style>
