<template>
  <div class="container" style="max-width: 840px;">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <h2 class="mb-0">{{ t("create") }}</h2>
      <div class="d-flex flex-wrap gap-2">
        <a href="/top10-vote" class="btn btn-outline-light">
          <i class="bi bi-check2-square me-1"></i>
          {{ t("top_10_vote") }}
        </a>
        <button
          type="button"
          class="btn"
          :class="createData.top10_vote_enabled ? 'btn-outline-danger' : 'btn-outline-success'"
          :disabled="voteBusy"
          @click="toggleTop10Vote"
        >
          <i class="bi me-1" :class="createData.top10_vote_enabled ? 'bi-pause-circle' : 'bi-play-circle'"></i>
          {{ createData.top10_vote_enabled ? t("disable_voting") : t("enable_voting") }}
        </button>
      </div>
    </div>

    <div v-if="status" class="alert alert-success">{{ status }}</div>
    <div v-if="errors.length" class="alert alert-danger">
      <ul class="mb-0">
        <li v-for="(item, index) in errors" :key="index">{{ item }}</li>
      </ul>
    </div>

    <div class="card bg-dark text-white mb-4">
      <div class="card-body">
        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
          <div>
            <div class="fw-semibold fs-5">{{ seasonCopy.title }}</div>
            <div class="text-white-50 small mt-1">{{ seasonCopy.subtitle }}</div>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="option in seasonCopy.options"
              :key="option.id"
              type="button"
              class="btn"
              :class="createData.season_effect === option.id ? 'btn-light text-dark' : 'btn-outline-light'"
              :disabled="seasonBusy || createData.season_effect === option.id"
              @click="applySeasonEffect(option.id)"
            >
              <i class="bi me-1" :class="option.icon"></i>
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-dark text-white mb-4">
      <div class="card-body">
        <button
          class="btn btn-outline-light w-100 text-start mb-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#addMusicBlock"
          aria-expanded="true"
          aria-controls="addMusicBlock"
        >
          {{ t("add_music") }}
        </button>
        <div id="addMusicBlock" class="collapse show">
          <form :key="musicFormKey" @submit.prevent="submitMusic">
            <div class="mb-3">
              <label class="form-label">{{ t("music_name") }}</label>
              <input type="text" name="name" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label">{{ t("artist") }}</label>
              <div id="artistFields" class="d-grid gap-2">
                <div class="d-flex gap-2 align-items-center artist-row">
                  <select name="artist_ids[]" class="form-select" required>
                    <option value="" disabled selected>{{ t("select_artist") }}</option>
                    <option v-for="artist in createData.artists" :key="artist.id" :value="artist.id">{{ artist.name }}</option>
                  </select>
                  <button type="button" class="btn btn-outline-light btn-sm remove-artist" disabled>{{ t("remove") }}</button>
                </div>
              </div>
              <button id="addArtistBtn" type="button" class="btn btn-outline-light btn-sm mt-2">+ {{ t("add_artist_button") }}</button>
            </div>

            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">{{ t("year") }}</label>
                <select name="year_id" class="form-select" required>
                  <option value="" disabled selected>{{ t("select_year") }}</option>
                  <option v-for="year in createData.years" :key="year.id" :value="year.id">{{ year.date }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">{{ t("language_label") }}</label>
                <select name="language_id" class="form-select" required>
                  <option value="" disabled selected>{{ t("select_language") }}</option>
                  <option v-for="language in createData.languages" :key="language.id" :value="language.id">{{ language.name }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">{{ t("category") }}</label>
                <select name="category_id" class="form-select" required>
                  <option value="" disabled selected>{{ t("select_category") }}</option>
                  <option v-for="category in createData.categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                </select>
              </div>
            </div>

            <div class="row g-3 mt-1">
              <div class="col-md-6">
                <label class="form-label">{{ t("audio_file") }}</label>
                <input type="file" name="audio" class="form-control" accept=".mp3,.wav,.ogg,.flac,.m4a,audio/*" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">{{ t("cover_image") }}</label>
                <input type="file" name="cover" class="form-control" accept=".jpg,.jpeg,.png,.webp,image/*" required />
              </div>
            </div>

            <button :disabled="busy" type="submit" class="btn btn-light mt-3">{{ busy ? t("saving") : t("create_music") }}</button>
          </form>
        </div>
      </div>
    </div>

    <div class="card bg-dark text-white">
      <div class="card-body">
        <button
          class="btn btn-outline-light w-100 text-start mb-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#addArtistBlock"
          aria-expanded="false"
          aria-controls="addArtistBlock"
        >
          {{ t("add_artist") }}
        </button>
        <div id="addArtistBlock" class="collapse">
          <form @submit.prevent="submitArtist">
            <div class="mb-3">
              <label class="form-label">{{ t("artist_name") }}</label>
              <input type="text" name="name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t("artist_description") }}</label>
              <textarea
                name="description"
                class="form-control"
                rows="4"
                :placeholder="t('enter_artist_description')"
                required
              ></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t("artist_photo") }}</label>
              <input id="artistPhotoInput" type="file" name="photo" class="form-control" accept=".jpg,.jpeg,.png,.webp,image/*" required />
              <img
                id="artistPhotoPreview"
                src=""
                :alt="t('artist_photo')"
                class="rounded mt-2 d-none"
                style="width:120px; height:120px; object-fit:cover;"
              />
            </div>
            <button :disabled="busy" type="submit" class="btn btn-light">{{ busy ? t("saving") : t("create_artist") }}</button>
          </form>
        </div>
      </div>
    </div>

    <div class="card bg-dark text-white mt-4">
      <div class="card-body">
        <button
          class="btn btn-outline-light w-100 text-start mb-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#addCategoryBlock"
          aria-expanded="false"
          aria-controls="addCategoryBlock"
        >
          {{ t("create_category") }}
        </button>
        <div id="addCategoryBlock" class="collapse">
          <form @submit.prevent="submitCategory">
            <div class="row g-2">
              <div class="col-12 col-md-4">
                <input type="text" name="name_tm" class="form-control" placeholder="Category (TM)" required />
              </div>
              <div class="col-12 col-md-4">
                <input type="text" name="name_ru" class="form-control" placeholder="Category (RU)" required />
              </div>
              <div class="col-12 col-md-4">
                <input type="text" name="name_en" class="form-control" placeholder="Category (EN)" required />
              </div>
            </div>
            <div class="mt-2">
              <button :disabled="busy" type="submit" class="btn btn-light">{{ busy ? t("saving") : t("create") }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="card bg-dark text-white mt-4">
      <div class="card-body">
        <button
          class="btn btn-outline-light w-100 text-start mb-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#manageArtistsBlock"
          aria-expanded="false"
          aria-controls="manageArtistsBlock"
        >
          {{ t("manage_artists") }}
        </button>
        <div id="manageArtistsBlock" class="collapse">
          <form class="mb-3" @submit.prevent="searchArtists">
            <div class="input-group">
              <input v-model="artistQ" type="search" class="form-control" :placeholder="t('search_artist')" />
              <button class="btn btn-outline-light" type="submit">{{ t("search") }}</button>
              <button class="btn btn-outline-secondary" type="button" @click="resetArtists">{{ t("reset") }}</button>
            </div>
          </form>
          <div v-if="editingArtist" class="card bg-dark border-secondary text-white mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="fw-semibold">{{ t("edit_artist") }}</div>
                <button class="btn btn-sm btn-outline-secondary" type="button" @click="cancelEditArtist">{{ t("cancel") }}</button>
              </div>
              <form @submit.prevent="submitArtistUpdate">
                <div class="mb-3">
                  <label class="form-label">{{ t("artist_name") }}</label>
                  <input v-model.trim="editingArtist.name" type="text" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">{{ t("artist_description") }}</label>
                  <textarea
                    v-model.trim="editingArtist.description"
                    class="form-control"
                    rows="4"
                    :placeholder="t('enter_artist_description')"
                    required
                  ></textarea>
                </div>
                <div v-if="editingArtist.photo_url" class="mb-3">
                  <img
                    :src="editingArtist.photo_url"
                    :alt="editingArtist.name || t('artist_photo')"
                    class="rounded"
                    style="width:120px; height:120px; object-fit:cover;"
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">{{ t("artist_photo") }}</label>
                  <input type="file" class="form-control" accept=".jpg,.jpeg,.png,.webp,image/*" @change="onEditArtistPhotoChange" />
                </div>
                <div class="d-flex gap-2">
                  <button :disabled="busy" type="submit" class="btn btn-light">{{ busy ? t("saving") : t("save") }}</button>
                  <button :disabled="busy" type="button" class="btn btn-outline-secondary" @click="cancelEditArtist">{{ t("cancel") }}</button>
                </div>
              </form>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-dark table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ t("artist") }}</th>
                  <th>{{ t("status") }}</th>
                  <th>{{ t("listeners") }}</th>
                  <th class="text-end">{{ t("actions") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in createData.existing_artists" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name }}</td>
                  <td>
                    <span class="badge" :class="item.is_visible ? 'text-bg-success' : 'text-bg-secondary'">
                      {{ item.is_visible ? t("visible_for_users") : t("hidden_for_users") }}
                    </span>
                  </td>
                  <td style="min-width: 220px;">
                    <div class="small text-white-50 mb-1">{{ t("listeners") }}: {{ Number(item.actual_listeners || 0) }}</div>
                    <div class="input-group input-group-sm">
                      <input
                        v-model="artistDisplayListeners[item.id]"
                        type="number"
                        min="0"
                        step="1"
                        class="form-control"
                        :placeholder="t('empty_uses_backend')"
                      />
                      <button class="btn btn-outline-light" type="button" :disabled="busy" @click="saveArtistDisplayListeners(item)">
                        {{ t("save") }}
                      </button>
                    </div>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-light me-2" type="button" @click="startEditArtist(item)">{{ t("edit") }}</button>
                    <button class="btn btn-sm btn-outline-info me-2" type="button" :disabled="busy" @click="publishArtistTrackBanner(item)">
                      <i class="bi bi-megaphone me-1"></i>{{ artistAnnouncementCopy.button }}
                    </button>
                    <button
                      class="btn btn-sm me-2"
                      :class="item.is_visible ? 'btn-outline-warning' : 'btn-outline-success'"
                      type="button"
                      @click="toggleArtistVisibility(item)"
                    >
                      {{ item.is_visible ? t("hide_from_users") : t("show_for_users") }}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteArtist(item.id)">{{ t("delete") }}</button>
                  </td>
                </tr>
                <tr v-if="!createData.existing_artists.length">
                  <td colspan="5" class="text-white-50">{{ t("no_artists_yet") }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-dark text-white mt-4">
      <div class="card-body">
        <button
          class="btn btn-outline-light w-100 text-start mb-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#manageCategoriesBlock"
          aria-expanded="false"
          aria-controls="manageCategoriesBlock"
        >
          {{ t("manage_categories") }}
        </button>
        <div id="manageCategoriesBlock" class="collapse">
          <form class="mb-3" @submit.prevent="searchCategories">
            <div class="input-group">
              <input v-model="categoryQ" type="search" class="form-control" :placeholder="t('search_category')" />
              <button class="btn btn-outline-light" type="submit">{{ t("search") }}</button>
              <button class="btn btn-outline-secondary" type="button" @click="resetCategories">{{ t("reset") }}</button>
            </div>
          </form>
          <div class="table-responsive">
            <table class="table table-dark table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ t("category") }}</th>
                  <th>{{ t("tracks_word") }}</th>
                  <th class="text-end">{{ t("actions") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in createData.existing_categories" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.musics_count }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteCategory(item.id)">{{ t("delete") }}</button>
                  </td>
                </tr>
                <tr v-if="!createData.existing_categories.length">
                  <td colspan="4" class="text-white-50">{{ t("no_categories_yet") }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-dark text-white mt-4">
      <div class="card-body">
        <button
          class="btn btn-outline-light w-100 text-start mb-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#manageMusicsBlock"
          aria-expanded="false"
          aria-controls="manageMusicsBlock"
        >
          {{ t("manage_musics") }}
        </button>
        <div id="manageMusicsBlock" class="collapse">
          <form class="mb-3" @submit.prevent="searchMusics">
            <div class="input-group">
              <input v-model="musicQ" type="search" class="form-control" :placeholder="t('search_track')" />
              <button class="btn btn-outline-light" type="submit">{{ t("search") }}</button>
              <button class="btn btn-outline-secondary" type="button" @click="resetMusics">{{ t("reset") }}</button>
            </div>
          </form>
          <div class="table-responsive">
            <table class="table table-dark table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ t("track") }}</th>
                  <th>{{ t("artist") }}</th>
                  <th>{{ t("popular") }}</th>
                  <th>{{ t("plays") }}</th>
                  <th class="text-end">{{ t("actions") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in createData.existing_musics" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.artist }}</td>
                  <td>
                    <span class="badge" :class="item.is_popular ? 'text-bg-success' : 'text-bg-secondary'">
                      {{ item.is_popular ? t("yes") : t("no") }}
                    </span>
                  </td>
                  <td style="min-width: 220px;">
                    <div class="small text-white-50 mb-1">{{ t("plays") }}: {{ Number(item.plays || 0) }}</div>
                    <div class="input-group input-group-sm">
                      <input
                        v-model="musicDisplayPlays[item.id]"
                        type="number"
                        min="0"
                        step="1"
                        class="form-control"
                        :placeholder="t('empty_uses_backend')"
                      />
                      <button class="btn btn-outline-light" type="button" :disabled="busy" @click="saveMusicDisplayPlays(item)">
                        {{ t("save") }}
                      </button>
                    </div>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteMusic(item.id)">{{ t("delete") }}</button>
                  </td>
                </tr>
                <tr v-if="!createData.existing_musics.length">
                  <td colspan="6" class="text-white-50">{{ t("no_music_yet") }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { adminService } from "../services/adminService";
import { useI18n } from "../composables/useI18n";

const { t, locale } = useI18n();

const busy = ref(false);
const voteBusy = ref(false);
const seasonBusy = ref(false);
const status = ref("");
const errors = ref([]);
const loading = ref(true);
const musicFormKey = ref(0);
const editingArtist = ref(null);
const artistDisplayListeners = ref({});
const musicDisplayPlays = ref({});

const artistQ = ref("");
const musicQ = ref("");
const categoryQ = ref("");

const createData = ref({
  top10_vote_enabled: true,
  season_effect: "summer",
  artists: [],
  years: [],
  languages: [],
  categories: [],
  existing_artists: [],
  existing_musics: [],
  existing_categories: [],
});

const seasonCopy = computed(() => {
  if (locale.value === "ru") {
    return {
      title: "Режим входа на сайт",
      subtitle: "Выберите, какой короткий эффект пользователь увидит при входе на сайт.",
      saved: {
        summer: "Лето включено. При входе будет пустынная буря.",
        autumn: "Осень включена. При входе будет листопад.",
        winter: "Зима включена. При входе будет метель.",
        spring: "Весна включена. При входе будут цветочки.",
        ramadan: "Ramadan включён. При входе луна на ниточке опустится и поднимется обратно.",
      },
      options: [
        { id: "summer", label: "Лето", icon: "bi-brightness-high" },
        { id: "autumn", label: "Осень", icon: "bi-flower3" },
        { id: "winter", label: "Зима", icon: "bi-snow" },
        { id: "spring", label: "Весна", icon: "bi-flower1" },
        { id: "ramadan", label: "Ramadan", icon: "bi-moon-stars-fill" },
      ],
    };
  }

  if (locale.value === "en") {
    return {
      title: "Site intro mode",
      subtitle: "Choose the short visual effect users see when they enter the site.",
      saved: {
        summer: "Summer is active. A sandstorm will appear on entry.",
        autumn: "Autumn is active. Falling leaves will appear on entry.",
        winter: "Winter is active. A snowstorm will appear on entry.",
        spring: "Spring is active. Flowers will appear on entry.",
        ramadan: "Ramadan is active. A hanging moon will lower down and rise back up on entry.",
      },
      options: [
        { id: "summer", label: "Summer", icon: "bi-brightness-high" },
        { id: "autumn", label: "Autumn", icon: "bi-flower3" },
        { id: "winter", label: "Winter", icon: "bi-snow" },
        { id: "spring", label: "Spring", icon: "bi-flower1" },
        { id: "ramadan", label: "Ramadan", icon: "bi-moon-stars-fill" },
      ],
    };
  }

  if (locale.value === "tm") {
    return {
      title: "Sayt giris effekti",
      subtitle: "Ulanyjy sahypa girende gysga wagtlayyn gorer yaly effekti sayla.",
      saved: {
        summer: "Tomus acyk. Girisde gumly boran bolar.",
        autumn: "Guz acyk. Girisde yapraklar ucar.",
        winter: "Gys acyk. Girisde metel bolar.",
        spring: "Bahar acyk. Girisde gunchekler gorkezer.",
        ramadan: "Ramadan acyk. Girisde iplekde asylan ay asak dusup yene yokari galar.",
      },
      options: [
        { id: "summer", label: "Tomus", icon: "bi-brightness-high" },
        { id: "autumn", label: "Guz", icon: "bi-flower3" },
        { id: "winter", label: "Gys", icon: "bi-snow" },
        { id: "spring", label: "Bahar", icon: "bi-flower1" },
        { id: "ramadan", label: "Ramadan", icon: "bi-moon-stars-fill" },
      ],
    };
  }
  if (locale.value === "ru") {
      return {
        title: "Эффект времени года",
        subtitle: "Выберите, что пользователь увидит при входе на сайт.",
        saved: {
          summer: "Лето включено. При входе будет песчаная буря.",
          autumn: "Осень включена. При входе будет листопад.",
          winter: "Зима включена. При входе будет метель.",
          spring: "Весна включена. При входе будут огни.",
        },
      options: [
        { id: "summer", label: "Лето", icon: "bi-brightness-high" },
        { id: "autumn", label: "Осень", icon: "bi-flower3" },
        { id: "winter", label: "Зима", icon: "bi-snow" },
        { id: "spring", label: "Весна", icon: "bi-stars" },
      ],
    };
  }

  if (locale.value === "en") {
      return {
        title: "Season intro effect",
        subtitle: "Choose what users see for 2 seconds when they enter the site.",
        saved: {
          summer: "Summer is active. A sandstorm will appear on entry.",
          autumn: "Autumn is active. Falling leaves will appear on entry.",
          winter: "Winter is active. A snowstorm will appear on entry.",
          spring: "Spring is active. Lights will appear on entry.",
        },
      options: [
        { id: "summer", label: "Summer", icon: "bi-brightness-high" },
        { id: "autumn", label: "Autumn", icon: "bi-flower3" },
        { id: "winter", label: "Winter", icon: "bi-snow" },
        { id: "spring", label: "Spring", icon: "bi-stars" },
      ],
    };
  }

  return {
    title: "Mowsum effekti",
    subtitle: "Ulanyjy sahypa girende 2 sekunt dowamynda gorkezer yaly effekt sayla.",
    saved: {
      summer: "Tomus acyk. Girisde gumly boran bolar.",
      autumn: "Guz acyk. Girisde yapraklar ucar.",
      winter: "Gys acyk. Girisde metel bolar.",
      spring: "Bahar acyk. Girisde ysyklar gorkezer.",
    },
    options: [
      { id: "summer", label: "Tomus", icon: "bi-brightness-high" },
      { id: "autumn", label: "Guz", icon: "bi-flower3" },
      { id: "winter", label: "Gys", icon: "bi-snow" },
      { id: "spring", label: "Bahar", icon: "bi-stars" },
    ],
  };
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

const flattenErrors = (error) => {
  const list = [];
  if (error?.errors && typeof error.errors === "object") {
    Object.values(error.errors).forEach((value) => {
      if (Array.isArray(value)) list.push(...value.map((item) => String(item)));
      else if (value != null) list.push(String(value));
    });
  }
  if (!list.length && error?.message) list.push(String(error.message));
  if (!list.length) list.push(t("request_failed"));
  return [...new Set(list)];
};

const fileToPayload = (file) =>
  new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new Error(t("file_required")));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        dataUrl: String(reader.result || ""),
      });
    };
    reader.onerror = () => reject(new Error(t("failed_read_file")));
    reader.readAsDataURL(file);
  });

const maybeFileToPayload = async (file) => {
  if (!(file instanceof File) || !file.size) return null;
  return fileToPayload(file);
};

const initLegacyCreateEnhancers = async () => {
  await nextTick();
  window.OwazymCommon?.initArtistPhotoPreview?.();
  window.OwazymCommon?.initArtistFieldManager?.();
  window.dispatchEvent(new Event("owazym:route-changed"));
};

const normalizeCounterInput = (value) => {
  const raw = String(value ?? "").trim();
  return raw ? raw : null;
};

const hydrateDisplayCounterInputs = (data) => {
  artistDisplayListeners.value = Object.fromEntries(
    (data?.existing_artists || []).map((item) => [item.id, item.display_listeners == null ? "" : String(item.display_listeners)]),
  );
  musicDisplayPlays.value = Object.fromEntries(
    (data?.existing_musics || []).map((item) => [item.id, item.display_plays == null ? "" : String(item.display_plays)]),
  );
};

const load = async () => {
  loading.value = true;
  try {
    const data = await adminService.getCreateData({
      artist_q: artistQ.value || undefined,
      music_q: musicQ.value || undefined,
      category_q: categoryQ.value || undefined,
      locale: locale.value,
    });
    createData.value = data;
    hydrateDisplayCounterInputs(data);
  } finally {
    loading.value = false;
    await initLegacyCreateEnhancers();
  }
};

const toggleTop10Vote = async () => {
  status.value = "";
  errors.value = [];
  voteBusy.value = true;
  try {
    const data = await adminService.setTop10VoteEnabled(!createData.value.top10_vote_enabled);
    createData.value.top10_vote_enabled = Boolean(data?.enabled);
    window.dispatchEvent(
      new CustomEvent("owazym:top10-vote-toggled", {
        detail: { enabled: createData.value.top10_vote_enabled },
      }),
    );
    status.value = createData.value.top10_vote_enabled ? t("voting_enabled") : t("voting_disabled");
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    voteBusy.value = false;
  }
};

const applySeasonEffect = async (seasonEffect) => {
  const normalized = String(seasonEffect || "").trim().toLowerCase();
  if (!normalized || createData.value.season_effect === normalized) return;

  status.value = "";
  errors.value = [];
  seasonBusy.value = true;
  try {
    const data = await adminService.setSeasonEffect(normalized);
    createData.value.season_effect = String(data?.season_effect || normalized).toLowerCase();
    window.dispatchEvent(
      new CustomEvent("owazym:season-effect-updated", {
        detail: { season: createData.value.season_effect, preview: true },
      }),
    );
    status.value = seasonCopy.value.saved[createData.value.season_effect] || "";
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    seasonBusy.value = false;
  }
};

const submitArtist = async (event) => {
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    const formData = new FormData(event.target);
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const photoFile = formData.get("photo");
    const photo = await fileToPayload(photoFile);

    await adminService.createArtist({ name, description, photo });
    status.value = t("artist_created");
    event.target.reset();
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const startEditArtist = (artist) => {
  editingArtist.value = {
    id: artist.id,
    name: String(artist.name || ""),
    description: String(artist.description || ""),
    photo_url: String(artist.photo_url || ""),
    nextPhotoFile: null,
  };
};

const cancelEditArtist = () => {
  editingArtist.value = null;
};

const onEditArtistPhotoChange = (event) => {
  if (!editingArtist.value) return;
  const [file] = event.target?.files || [];
  editingArtist.value.nextPhotoFile = file || null;
};

const submitArtistUpdate = async () => {
  if (!editingArtist.value?.id) return;
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    const photo = await maybeFileToPayload(editingArtist.value.nextPhotoFile);
    await adminService.updateArtist(editingArtist.value.id, {
      name: editingArtist.value.name,
      description: editingArtist.value.description,
      ...(photo ? { photo } : {}),
    });
    status.value = t("artist_updated");
    cancelEditArtist();
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const submitCategory = async (event) => {
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    const formData = new FormData(event.target);
    const nameTm = String(formData.get("name_tm") || "").trim();
    const nameRu = String(formData.get("name_ru") || "").trim();
    const nameEn = String(formData.get("name_en") || "").trim();
    await adminService.createCategory({
      name_tm: nameTm,
      name_ru: nameRu,
      name_en: nameEn,
    });
    status.value = t("category_created");
    event.target.reset();
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const submitMusic = async (event) => {
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    const formData = new FormData(event.target);
    const name = String(formData.get("name") || "").trim();
    const artistIds = formData
      .getAll("artist_ids[]")
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);
    const yearId = Number(formData.get("year_id") || 0);
    const languageId = Number(formData.get("language_id") || 0);
    const categoryId = Number(formData.get("category_id") || 0);

    const audio = await fileToPayload(formData.get("audio"));
    const cover = await fileToPayload(formData.get("cover"));

    await adminService.createMusic({
      name,
      artist_ids: artistIds,
      year_id: yearId,
      language_id: languageId,
      category_id: categoryId,
      audio,
      cover,
    });

    status.value = t("music_created");
    musicFormKey.value += 1;
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const deleteArtist = async (id) => {
  if (!window.confirm(t("delete_artist_confirm"))) return;
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    await adminService.deleteArtist(id);
    status.value = t("artist_deleted");
    if (editingArtist.value?.id === id) cancelEditArtist();
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const toggleArtistVisibility = async (artist) => {
  if (!artist?.id) return;
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    if (artist.is_visible) {
      await adminService.hideArtist(artist.id);
      status.value = t("artist_hidden_for_users");
    } else {
      await adminService.showArtist(artist.id);
      status.value = t("artist_visible_for_users");
    }
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const publishArtistTrackBanner = async (artist) => {
  if (!artist?.id) return;
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    const notice = await adminService.publishArtistTrackBanner(artist.id);
    window.dispatchEvent(
      new CustomEvent("owazym:site-notice-published", {
        detail: { notice },
      }),
    );
    status.value = artistAnnouncementCopy.value.success;
    await load();
  } catch (error) {
    const nextErrors = flattenErrors(error);
    errors.value = nextErrors.length ? nextErrors : [artistAnnouncementCopy.value.fallbackError];
  } finally {
    busy.value = false;
  }
};

const saveArtistDisplayListeners = async (artist) => {
  if (!artist?.id) return;
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    await adminService.setArtistDisplayListeners(artist.id, normalizeCounterInput(artistDisplayListeners.value[artist.id]));
    status.value = t("visual_listeners_updated");
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const deleteCategory = async (id) => {
  if (!window.confirm(t("delete_category_confirm"))) return;
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    await adminService.deleteCategory(id);
    status.value = t("category_deleted");
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const deleteMusic = async (id) => {
  if (!window.confirm(t("delete_music_confirm"))) return;
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    await adminService.deleteMusic(id);
    status.value = t("music_deleted");
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const saveMusicDisplayPlays = async (music) => {
  if (!music?.id) return;
  status.value = "";
  errors.value = [];
  busy.value = true;
  try {
    await adminService.setMusicDisplayPlays(music.id, normalizeCounterInput(musicDisplayPlays.value[music.id]));
    status.value = t("visual_plays_updated");
    await load();
  } catch (error) {
    errors.value = flattenErrors(error);
  } finally {
    busy.value = false;
  }
};

const searchArtists = () => load();
const searchCategories = () => load();
const searchMusics = () => load();

const resetArtists = async () => {
  artistQ.value = "";
  await load();
};
const resetCategories = async () => {
  categoryQ.value = "";
  await load();
};
const resetMusics = async () => {
  musicQ.value = "";
  await load();
};

onMounted(load);
watch(
  () => locale.value,
  () => {
    load();
  },
);
</script>
