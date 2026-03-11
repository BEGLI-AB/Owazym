<template>
  <aside class="app-sidebar text-white p-3 d-none d-lg-flex flex-column">
    <form method="GET" action="/search" class="position-relative mb-3 app-search-form">
      <input
        type="search"
        name="q"
        :value="searchQuery"
        class="form-control form-control-sm search-input pe-5"
        :placeholder="t('search')"
      />
      <button
        type="button"
        class="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-white-50 search-toggle"
        :aria-label="t('search')"
      >
        <i class="bi bi-search"></i>
      </button>
    </form>

    <div class="d-flex align-items-center justify-content-between mb-3 px-1">
      <span class="small text-white-50">{{ t("theme") }}</span>
      <label class="theme-icon-toggle" :title="t('theme')">
        <input id="themeToggleDesktop" type="checkbox" :aria-label="t('toggle_theme')" />
        <span class="theme-icon">
          <i class="bi bi-sun-fill theme-icon-sun"></i>
          <i class="bi bi-moon-stars-fill theme-icon-moon"></i>
        </span>
      </label>
    </div>

    <div class="d-flex align-items-center justify-content-between mb-3 px-1">
      <span class="small text-white-50">{{ t("language") }}</span>
      <div class="btn-group btn-group-sm lang-toggle" role="group" :aria-label="t('language')">
        <button type="button" class="btn btn-outline-light" :class="{ active: locale === 'ru' }" @click="setLocale('ru')">RU</button>
        <button type="button" class="btn btn-outline-light" :class="{ active: locale === 'tm' }" @click="setLocale('tm')">TM</button>
        <button type="button" class="btn btn-outline-light" :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button>
      </div>
    </div>

    <nav class="nav flex-column nav-apple" id="desktopNav">
      <a class="nav-link" :class="{ active: route.path === '/' }" href="/" data-nav="home"><i class="bi bi-house"></i><span class="sidebar-label">{{ t("home") }}</span></a>
      <a v-if="isAdmin" class="nav-link" :class="{ active: route.path === '/create' }" href="/create"><i class="bi bi-plus-lg"></i><span class="sidebar-label">{{ t("create") }}</span></a>
      <a class="nav-link" :class="{ active: route.path === '/playlist' }" href="/playlist"><i class="bi bi-music-note"></i><span class="sidebar-label">{{ t("my_playlist") }}</span></a>
      <a class="nav-link" :class="{ active: route.path === '/search' }" href="/search?q=" data-nav="search"><i class="bi bi-search"></i><span class="sidebar-label">{{ t("search") }}</span></a>
      <div><i class="bi bi-people"></i> <span class="sidebar-label">{{ t("artists") }}</span></div>
    </nav>

    <div class="artists-scrollable">
      <nav class="nav flex-column">
        <a
          v-for="artist in visibleArtists"
          :key="artist.id"
          class="nav-link text-white artist-item"
          :data-name="String(artist.name || '').toLowerCase()"
          :href="artistHref(artist.id)"
          :aria-current="isArtistCurrent(artist.id) ? 'page' : 'false'"
        >
          <img
            v-if="artist.photo_url"
            :src="artist.photo_url"
            :alt="artist.name"
            class="rounded-circle me-1"
            style="width:22px; height:22px; object-fit:cover;"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            @error="onArtistImgError"
          />
          <i v-else class="bi bi-person-circle"></i>
          <span class="artist-item-name">{{ artist.name }}</span>
        </a>

        <div v-if="hasMore || artists.length > 20" class="text-white-50 mt-2">{{ t("and_other") }}</div>
      </nav>
    </div>

    <div class="menu-static sidebar-bottom-links mt-auto pt-3">
      <nav class="nav flex-column nav-apple">
        <a class="nav-link" href="/#home"><i class="bi bi-info-circle"></i> {{ t("about_us") }}</a>
        <a class="nav-link" href="mailto:support@owazym.com"><i class="bi bi-life-preserver"></i> {{ t("support") }}</a>
      </nav>
    </div>
  </aside>

  <div class="offcanvas offcanvas-end text-bg-dark app-mobile-drawer" tabindex="-1" id="mobileSidebar" aria-labelledby="mobileSidebarLabel" aria-modal="true" style="width: 260px;">
    <div class="offcanvas-header border-bottom" style="border-color: rgba(255,255,255,.08)!important;">
      <h5 class="offcanvas-title brand fw-light" id="mobileSidebarLabel" style="font-size: 34px; font-weight: lighter;">OWAZYM</h5>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" :aria-label="t('close')"></button>
    </div>

    <div class="offcanvas-body d-flex flex-column">
      <form method="GET" action="/search" class="position-relative mb-3 app-search-form">
        <input
          type="search"
          name="q"
          :value="searchQuery"
          class="form-control form-control-sm search-input pe-5"
          :placeholder="t('search')"
        />
        <button
          type="button"
          class="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-white-50 search-toggle"
          :aria-label="t('search')"
        >
          <i class="bi bi-search"></i>
        </button>
      </form>

      <div class="d-flex align-items-center justify-content-between mb-3 px-1">
        <span class="small text-white-50">{{ t("theme") }}</span>
        <label class="theme-icon-toggle" :title="t('theme')">
          <input id="themeToggleMobileSidebar" type="checkbox" :aria-label="t('toggle_theme')" />
          <span class="theme-icon">
            <i class="bi bi-sun-fill theme-icon-sun"></i>
            <i class="bi bi-moon-stars-fill theme-icon-moon"></i>
          </span>
        </label>
      </div>

      <div class="d-flex align-items-center justify-content-between mb-3 px-1">
        <span class="small text-white-50">{{ t("language") }}</span>
        <div class="btn-group btn-group-sm lang-toggle" role="group" :aria-label="t('language')">
          <button type="button" class="btn btn-outline-light" :class="{ active: locale === 'ru' }" @click="setLocale('ru')">RU</button>
          <button type="button" class="btn btn-outline-light" :class="{ active: locale === 'tm' }" @click="setLocale('tm')">TM</button>
          <button type="button" class="btn btn-outline-light" :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button>
        </div>
      </div>

      <div class="menu-static">
        <nav class="nav flex-column nav-apple">
          <a v-if="isAdmin" class="nav-link" :class="{ active: route.path === '/create' }" href="/create"><i class="bi bi-plus-lg"></i> {{ t("create") }}</a>
          <div><i class="bi bi-people"></i> {{ t("artists") }}</div>
        </nav>
      </div>

      <div class="artists-scrollable">
        <nav class="nav flex-column">
          <a
            v-for="artist in visibleArtists"
            :key="`m-${artist.id}`"
            class="nav-link text-white artist-item"
            :data-name="String(artist.name || '').toLowerCase()"
            :href="artistHref(artist.id)"
            :aria-current="isArtistCurrent(artist.id) ? 'page' : 'false'"
          >
            <img
              v-if="artist.photo_url"
              :src="artist.photo_url"
              :alt="artist.name"
              class="rounded-circle me-1"
              style="width:22px; height:22px; object-fit:cover;"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              @error="onArtistImgError"
            />
            <i v-else class="bi bi-person-circle"></i>
            <span class="artist-item-name">{{ artist.name }}</span>
          </a>

          <div v-if="hasMore || artists.length > 20" class="text-white-50 mt-2">{{ t("and_other") }}</div>
        </nav>
      </div>

      <div class="menu-static sidebar-bottom-links mt-auto pt-3">
        <nav class="nav flex-column nav-apple">
          <a class="nav-link" href="/#home"><i class="bi bi-info-circle"></i> {{ t("about_us") }}</a>
          <a class="nav-link" href="mailto:support@owazym.com"><i class="bi bi-life-preserver"></i> {{ t("support") }}</a>
        </nav>
      </div>
    </div>
  </div>

  <nav class="mobile-bottom-nav" :class="isAdmin ? 'mobile-bottom-nav-admin' : 'mobile-bottom-nav-user'" :aria-label="t('menu')">
    <a class="mobile-bottom-link" :class="{ active: route.path === '/' }" href="/" data-nav="home">
      <i class="bi bi-house"></i>
      <span>{{ t("home") }}</span>
    </a>
    <a class="mobile-bottom-link" :class="{ active: route.path === '/search' }" href="/search?q=" :aria-label="t('search')" data-nav="search">
      <i class="bi bi-search"></i>
      <span>{{ t("search") }}</span>
    </a>
    <a v-if="isAdmin" class="mobile-bottom-link" :class="{ active: route.path === '/create' }" href="/create">
      <i class="bi bi-plus-lg"></i>
      <span>{{ t("create") }}</span>
    </a>
    <a class="mobile-bottom-link" :class="{ active: route.path === '/playlist' }" href="/playlist">
      <i class="bi bi-collection-play"></i>
      <span>{{ t("my_playlist") }}</span>
    </a>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "../composables/useI18n";

const props = defineProps({
  artists: {
    type: Array,
    default: () => [],
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const { locale, setLocale, t } = useI18n();

const searchQuery = computed(() => String(route.query.q || ""));
const visibleArtists = computed(() => (props.artists || []).slice(0, 20));

const artistHref = (id) => `/?artist_id=${id}#album`;
const isArtistCurrent = (id) => route.path === "/" && Number(route.query.artist_id || 0) === Number(id);

const onArtistImgError = (event) => {
  event.target.onerror = null;
  event.target.src = "/img/1.jpg";
};
</script>
