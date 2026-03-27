<template>
  <section class="search-page">
    <div class="search-header">
      <form method="GET" action="/search" class="search-bar app-search-form">
        <button type="submit" class="search-submit-btn" :aria-label="t('search')">
          <i class="bi bi-search"></i>
        </button>
        <input type="search" name="q" :value="query" class="search-page-input" :placeholder="t('search')" />
      </form>

      <button
        class="chip-btn chip-icon search-filter-btn"
        type="button"
        :aria-label="t('search_filters')"
        data-bs-toggle="modal"
        data-bs-target="#searchFiltersModal"
        data-open-search-filters
      >
        <i class="bi bi-sliders2"></i>
      </button>
    </div>

    <div class="search-grid">
      <a
        v-for="music in result.items || []"
        :key="music.id"
        class="search-card"
        :href="musicUrl(music.id)"
        :data-music-id="music.id"
        :data-audio-url="music.audio_url || ''"
        :data-title="music.title || music.name || ''"
        :data-artist="music.artist || ''"
        :data-cover-url="music.cover_url || '/img/1.jpg'"
      >
        <div class="search-card-media">
          <img :src="music.cover_url || '/img/1.jpg'" :alt="t('cover_image')" @error="onImgError" />
        </div>
        <div class="search-card-title">{{ music.name }}</div>
      </a>
    </div>
  </section>

  <div class="modal fade" id="searchFiltersModal" tabindex="-1" aria-labelledby="searchFiltersModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-black text-white border border-secondary-subtle search-filters-modal-content">
        <div class="modal-header border-secondary-subtle search-filters-modal-header">
          <h5 class="modal-title" id="searchFiltersModalLabel">{{ t("search") }}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" :aria-label="t('close')"></button>
        </div>

        <form method="GET" action="/search">
          <input type="hidden" name="q" :value="query" />
          <div class="modal-body">
            <div class="d-grid gap-2">
              <div class="bg-dark rounded-3 p-3 search-filter-panel">
                <label class="form-label mb-1 text-white-50">{{ t("genres") }}</label>
                <select v-model="genreId" class="form-select bg-dark text-white border-secondary search-filter-select" name="genre_id">
                  <option value="">{{ t("any") }}</option>
                  <option v-for="genre in result.genres || []" :key="genre.id" :value="String(genre.id)">
                    {{ genre.name }}
                  </option>
                </select>
              </div>

              <div class="bg-dark rounded-3 p-3 search-filter-panel">
                <label class="form-label mb-1 text-white-50">{{ t("artists") }}</label>
                <input
                  v-model="artistSearch"
                  type="search"
                  class="form-control search-filter-lookup"
                  :placeholder="t('search')"
                  list="artistFilterOptions"
                  autocomplete="off"
                />
                <input type="hidden" name="artist_id" :value="resolvedArtistId" />
                <datalist id="artistFilterOptions">
                  <option v-for="artist in filteredArtists" :key="artist.id" :value="artist.name"></option>
                </datalist>
              </div>

              <div class="bg-dark rounded-3 p-3 search-filter-panel">
                <label class="form-label mb-1 text-white-50">{{ t("countries") }}</label>
                <select v-model="countryId" class="form-select bg-dark text-white border-secondary search-filter-select" name="country_id">
                  <option value="">{{ t("any") }}</option>
                  <option v-for="country in result.countries || []" :key="country.id" :value="String(country.id)">
                    {{ country.name }}
                  </option>
                </select>
              </div>

              <div class="bg-dark rounded-3 p-3 search-filter-panel">
                <label class="form-label mb-1 text-white-50">{{ t("year") }}</label>
                <select v-model="yearId" class="form-select bg-dark text-white border-secondary search-filter-select" name="year_id">
                  <option value="">{{ t("any") }}</option>
                  <option v-for="year in result.years || []" :key="year.id" :value="String(year.id)">
                    {{ year.date }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer border-secondary-subtle d-flex search-filters-modal-footer">
            <a :href="`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`" class="btn btn-outline-light flex-fill">{{ t("clear") }}</a>
            <button type="submit" class="btn btn-primary flex-fill">{{ t("show_results") }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const { t } = useI18n();

const result = ref({ items: [], genres: [], artists: [], countries: [], years: [] });
const query = ref(String(route.query.q || ""));
const genreId = ref(String(route.query.genre_id || ""));
const artistId = ref(String(route.query.artist_id || ""));
const countryId = ref(String(route.query.country_id || ""));
const yearId = ref(String(route.query.year_id || ""));
const artistSearch = ref("");
const randomArtistOptions = ref([]);
let themeObserver = null;

const musicUrl = (id) => `/?music_id=${id}#album`;

const normalizeSearch = (value) => String(value || "").trim().toLowerCase();

const pickRandomItems = (items, limit = 10) => {
  const source = Array.isArray(items) ? items.slice() : [];
  for (let index = source.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [source[index], source[swapIndex]] = [source[swapIndex], source[index]];
  }
  return source.slice(0, Math.max(0, Number(limit) || 0));
};

const filterOptions = (items, searchValue, labelGetter, selectedValue) => {
  const source = Array.isArray(items) ? items : [];
  const queryValue = normalizeSearch(searchValue);
  const filtered = queryValue
    ? source.filter((item) => normalizeSearch(labelGetter(item)).includes(queryValue))
    : source.slice();

  if (!selectedValue) return filtered;

  const selectedItem = source.find((item) => String(item.id) === String(selectedValue));
  if (!selectedItem) return filtered;
  if (filtered.some((item) => String(item.id) === String(selectedValue))) return filtered;
  return [selectedItem, ...filtered];
};

const filteredArtists = computed(() => {
  const source = Array.isArray(result.value.artists) ? result.value.artists : [];
  const selected = source.find((item) => String(item.id) === String(artistId.value));
  const queryValue = normalizeSearch(artistSearch.value);

  if (!queryValue) {
    const randomItems = Array.isArray(randomArtistOptions.value) ? randomArtistOptions.value.slice() : [];
    if (selected && !randomItems.some((item) => String(item.id) === String(selected.id))) {
      return [selected, ...randomItems].slice(0, 10);
    }
    return randomItems.slice(0, 10);
  }

  return filterOptions(source, artistSearch.value, (item) => item?.name, artistId.value).slice(0, 10);
});
const resolvedArtistId = computed(() => {
  const match = (result.value.artists || []).find((item) => normalizeSearch(item?.name) === normalizeSearch(artistSearch.value));
  return match ? String(match.id) : "";
});

const onImgError = (event) => {
  event.target.onerror = null;
  event.target.src = "/img/1.jpg";
};

const applySearchTheme = () => {
  const isLight = document.body.classList.contains("light") || document.body.classList.contains("light-mode");
  const input = document.querySelector(".search-view .search-page-input");
  const submitBtn = document.querySelector(".search-view .search-submit-btn");
  const submitIcon = submitBtn ? submitBtn.querySelector("i") : null;
  const filterBtn = document.querySelector(".search-view .search-filter-btn");
  const filterIcon = filterBtn ? filterBtn.querySelector("i") : null;
  const cardTitles = document.querySelectorAll(".search-view .search-card-title");
  const modalContent = document.querySelector(".search-view .search-filters-modal-content");
  const modalHeader = document.querySelector(".search-view .search-filters-modal-header");
  const modalFooter = document.querySelector(".search-view .search-filters-modal-footer");
  const modalTitle = modalHeader ? modalHeader.querySelector(".modal-title") : null;
  const modalClose = modalHeader ? modalHeader.querySelector(".btn-close") : null;
  const panels = document.querySelectorAll(".search-view .search-filter-panel");
  const labels = document.querySelectorAll(".search-view .search-filter-panel .form-label");
  const selects = document.querySelectorAll(".search-view .search-filter-select");
  const lookupInputs = document.querySelectorAll(".search-view .search-filter-lookup");
  const footerButtons = document.querySelectorAll(".search-view .search-filters-modal-footer .btn");

  if (input) {
    input.style.setProperty("color", isLight ? "#0f172a" : "#ffffff", "important");
    input.style.setProperty("-webkit-text-fill-color", isLight ? "#0f172a" : "#ffffff", "important");
    input.style.setProperty("caret-color", isLight ? "#0f172a" : "#ffffff", "important");
  }
  if (submitBtn) submitBtn.style.setProperty("color", isLight ? "#0f172a" : "rgba(255,255,255,0.7)", "important");
  if (submitIcon) submitIcon.style.setProperty("color", isLight ? "#0f172a" : "rgba(255,255,255,0.55)", "important");
  if (filterBtn) {
    filterBtn.style.setProperty("color", isLight ? "#0f172a" : "#ffffff", "important");
    filterBtn.style.setProperty("border-color", isLight ? "rgba(15,23,42,0.18)" : "rgba(255,255,255,0.12)", "important");
    filterBtn.style.setProperty("background", isLight ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.08)", "important");
  }
  if (filterIcon) filterIcon.style.setProperty("color", isLight ? "#0f172a" : "#ffffff", "important");
  if (cardTitles.length) {
    cardTitles.forEach((title) => {
      title.style.setProperty("color", isLight ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.85)", "important");
    });
  }

  if (modalContent) {
    modalContent.style.setProperty("background", isLight ? "#f8fbff" : "#000000", "important");
    modalContent.style.setProperty("color", isLight ? "#0f172a" : "#ffffff", "important");
    modalContent.style.setProperty("border-color", isLight ? "rgba(15,23,42,0.14)" : "rgba(255,255,255,0.12)", "important");
    modalContent.style.setProperty("box-shadow", isLight ? "0 26px 64px rgba(15,23,42,0.22)" : "0 30px 70px rgba(0,0,0,0.55)", "important");
  }
  if (modalHeader) {
    modalHeader.style.setProperty("background", isLight ? "#f8fbff" : "#000000", "important");
    modalHeader.style.setProperty("border-bottom-color", isLight ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.12)", "important");
  }
  if (modalFooter) {
    modalFooter.style.setProperty("background", isLight ? "#f8fbff" : "#000000", "important");
    modalFooter.style.setProperty("border-top-color", isLight ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.12)", "important");
  }
  if (modalTitle) modalTitle.style.setProperty("color", isLight ? "#0f172a" : "#ffffff", "important");
  if (modalClose) modalClose.style.setProperty("filter", isLight ? "none" : "invert(1) grayscale(1)", "important");

  panels.forEach((panel) => {
    panel.style.setProperty("background", isLight ? "#ffffff" : "#111111", "important");
    panel.style.setProperty("border", isLight ? "1px solid rgba(15,23,42,0.10)" : "1px solid rgba(255,255,255,0.08)", "important");
    panel.style.setProperty("box-shadow", isLight ? "0 14px 30px rgba(15,23,42,0.08)" : "none", "important");
  });

  labels.forEach((label) => {
    label.style.setProperty("color", isLight ? "rgba(15,23,42,0.68)" : "rgba(255,255,255,0.62)", "important");
  });

  selects.forEach((select) => {
    select.style.setProperty("background", isLight ? "#f8fbff" : "#161616", "important");
    select.style.setProperty("color", isLight ? "#0f172a" : "#ffffff", "important");
    select.style.setProperty("border-color", isLight ? "rgba(15,23,42,0.16)" : "rgba(255,255,255,0.16)", "important");
    select.style.setProperty("box-shadow", isLight ? "0 8px 18px rgba(15,23,42,0.06)" : "none", "important");
  });

  lookupInputs.forEach((lookup) => {
    lookup.style.setProperty("background", isLight ? "#ffffff" : "#0f0f0f", "important");
    lookup.style.setProperty("color", isLight ? "#0f172a" : "#ffffff", "important");
    lookup.style.setProperty("-webkit-text-fill-color", isLight ? "#0f172a" : "#ffffff", "important");
    lookup.style.setProperty("caret-color", isLight ? "#0f172a" : "#ffffff", "important");
    lookup.style.setProperty("border-color", isLight ? "rgba(15,23,42,0.14)" : "rgba(255,255,255,0.16)", "important");
    lookup.style.setProperty("box-shadow", isLight ? "0 8px 18px rgba(15,23,42,0.06)" : "none", "important");
  });

  footerButtons.forEach((button) => {
    if (button.classList.contains("btn-primary")) return;
    button.style.setProperty("color", isLight ? "#0f172a" : "rgba(255,255,255,0.82)", "important");
    button.style.setProperty("border-color", isLight ? "rgba(15,23,42,0.14)" : "rgba(255,255,255,0.14)", "important");
    button.style.setProperty("background", isLight ? "#ffffff" : "transparent", "important");
    button.style.setProperty("box-shadow", isLight ? "0 10px 22px rgba(15,23,42,0.08)" : "none", "important");
  });
};

const load = async () => {
  query.value = String(route.query.q || "");
  genreId.value = String(route.query.genre_id || "");
  artistId.value = String(route.query.artist_id || "");
  countryId.value = String(route.query.country_id || "");
  yearId.value = String(route.query.year_id || "");
  artistSearch.value = "";

  result.value = await libraryService.search({
    q: query.value || undefined,
    genre_id: genreId.value || undefined,
    artist_id: artistId.value || undefined,
    country_id: countryId.value || undefined,
    year_id: yearId.value || undefined,
  });
  randomArtistOptions.value = pickRandomItems(result.value.artists, 10);

  await nextTick();
  const currentArtist = (result.value.artists || []).find((item) => String(item.id) === String(artistId.value));
  artistSearch.value = currentArtist ? currentArtist.name : "";
  applySearchTheme();
  window.dispatchEvent(new Event("owazym:route-changed"));
};

watch(
  () => `${route.path}|${route.query.q || ""}|${route.query.genre_id || ""}|${route.query.artist_id || ""}|${route.query.country_id || ""}|${route.query.year_id || ""}`,
  load,
);
onMounted(async () => {
  await load();

  themeObserver = new MutationObserver(() => {
    applySearchTheme();
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
});

onBeforeUnmount(() => {
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
});
</script>
