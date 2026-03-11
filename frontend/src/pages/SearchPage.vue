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
      <div class="modal-content bg-black text-white border border-secondary-subtle">
        <div class="modal-header border-secondary-subtle">
          <h5 class="modal-title" id="searchFiltersModalLabel">{{ t("search") }}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" :aria-label="t('close')"></button>
        </div>

        <form method="GET" action="/search">
          <input type="hidden" name="q" :value="query" />
          <div class="modal-body">
            <div class="d-grid gap-2">
              <div class="bg-dark rounded-3 p-3">
                <label class="form-label mb-1 text-white-50">{{ t("genres") }}</label>
                <select class="form-select bg-dark text-white border-secondary" name="genre_id">
                  <option value="">{{ t("any") }}</option>
                  <option v-for="genre in result.genres || []" :key="genre.id" :value="genre.id" :selected="Number(genreId || 0) === Number(genre.id)">
                    {{ genre.name }}
                  </option>
                </select>
              </div>

              <div class="bg-dark rounded-3 p-3">
                <label class="form-label mb-1 text-white-50">{{ t("countries") }}</label>
                <select class="form-select bg-dark text-white border-secondary" name="country_id">
                  <option value="">{{ t("any") }}</option>
                  <option
                    v-for="country in result.countries || []"
                    :key="country.id"
                    :value="country.id"
                    :selected="Number(countryId || 0) === Number(country.id)"
                  >
                    {{ country.name }}
                  </option>
                </select>
              </div>

              <div class="bg-dark rounded-3 p-3">
                <label class="form-label mb-1 text-white-50">{{ t("year") }}</label>
                <select class="form-select bg-dark text-white border-secondary" name="year_id">
                  <option value="">{{ t("any") }}</option>
                  <option v-for="year in result.years || []" :key="year.id" :value="year.id" :selected="Number(yearId || 0) === Number(year.id)">
                    {{ year.date }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer border-secondary-subtle d-flex">
            <a :href="`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`" class="btn btn-outline-light flex-fill">{{ t("clear") }}</a>
            <button type="submit" class="btn btn-primary flex-fill">{{ t("show_results") }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";

const route = useRoute();
const { t } = useI18n();

const result = ref({ items: [], genres: [], countries: [], years: [] });
const query = ref(String(route.query.q || ""));
const genreId = ref(String(route.query.genre_id || ""));
const countryId = ref(String(route.query.country_id || ""));
const yearId = ref(String(route.query.year_id || ""));
let themeObserver = null;

const musicUrl = (id) => `/?music_id=${id}#album`;

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
};

const load = async () => {
  query.value = String(route.query.q || "");
  genreId.value = String(route.query.genre_id || "");
  countryId.value = String(route.query.country_id || "");
  yearId.value = String(route.query.year_id || "");

  result.value = await libraryService.search({
    q: query.value || undefined,
    genre_id: genreId.value || undefined,
    country_id: countryId.value || undefined,
    year_id: yearId.value || undefined,
  });

  await nextTick();
  applySearchTheme();
  window.dispatchEvent(new Event("owazym:route-changed"));
};

watch(
  () => `${route.path}|${route.query.q || ""}|${route.query.genre_id || ""}|${route.query.country_id || ""}|${route.query.year_id || ""}`,
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
