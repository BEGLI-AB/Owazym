<template>
  <section ref="pageRef" class="top10-vote-page">
    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
    <div v-if="status" class="alert alert-success py-2">{{ status }}</div>

    <section class="top10-vote-hero">
      <div>
        <div class="top10-vote-eyebrow">{{ t("top_10_vote") }}</div>
        <h1 class="top10-vote-title">{{ t("top_10_this_month") }}</h1>
        <p class="top10-vote-subtitle">{{ t("top_10_vote_subtitle") }}</p>
        <div class="top10-vote-note">
          <i class="bi bi-shield-check"></i>
          {{ t("one_vote_per_month") }}
        </div>
        <div v-if="!data.vote_enabled" class="alert alert-warning py-2 mt-3 mb-0">
          {{ t("vote_disabled_by_admin") }}
        </div>
      </div>

      <div class="top10-vote-stats">
        <div class="top10-vote-stat">
          <span class="top10-vote-stat-label">{{ monthLabel }}</span>
          <strong>{{ !data.vote_enabled ? t("vote_disabled") : data.user_vote ? t("vote_locked") : t("vote_now") }}</strong>
        </div>
      </div>
    </section>

    <section v-if="data.user_vote?.track" class="top10-vote-picked">
      <div class="top10-vote-picked-badge">
        <i class="bi bi-check2-circle"></i>
        {{ t("your_choice") }}
      </div>
      <div class="top10-vote-picked-main">
        <img
          :src="data.user_vote.track.cover_url || '/img/1.jpg'"
          :alt="data.user_vote.track.title || data.user_vote.track.name || t('track')"
          class="top10-vote-picked-cover"
          @error="onImgError"
        />
        <div>
          <div class="top10-vote-picked-title">{{ data.user_vote.track.title || data.user_vote.track.name }}</div>
          <div class="top10-vote-picked-artist">{{ data.user_vote.track.artist || t("unknown_artist") }}</div>
        </div>
      </div>
    </section>

    <div v-if="!items.length" class="top10-vote-empty">
      <i class="bi bi-music-note-beamed"></i>
      <div>{{ t("no_tracks_to_vote") }}</div>
    </div>

    <div v-else class="top10-vote-list">
      <article
        v-for="(item, index) in items"
        :key="item.id"
        class="top10-vote-card"
        :class="{ 'top10-vote-card--selected': item.is_user_choice }"
      >
        <div class="top10-vote-card-head">
          <div class="top10-vote-rank">{{ index + 1 }}</div>
          <img :src="item.cover_url || '/img/1.jpg'" :alt="item.title || item.name || t('track')" class="top10-vote-cover" @error="onImgError" />

          <div class="top10-vote-main">
            <div class="top10-vote-track">{{ item.title || item.name }}</div>
            <div class="top10-vote-artist">{{ item.artist || t("unknown_artist") }}</div>
          </div>

        </div>

        <div class="top10-vote-progress">
          <span class="top10-vote-progress-fill" :style="{ width: `${Math.max(0, Math.min(100, Number(item.vote_percent || 0)))}%` }"></span>
        </div>

        <div class="top10-vote-actions">
          <a class="btn btn-outline-light rounded-pill px-3" :href="`/?music_id=${item.id}#album`">
            <i class="bi bi-play-fill me-1"></i>
            {{ t("open") }}
          </a>
          <button
            v-if="data.vote_enabled"
            type="button"
            class="btn rounded-pill px-3"
            :class="item.is_user_choice ? 'btn-light text-dark' : 'btn-primary'"
            :disabled="busy || !data.can_vote"
            @click="submitVote(item.id)"
          >
            <i class="bi" :class="item.is_user_choice ? 'bi-check2-circle' : 'bi-hand-thumbs-up me-1'"></i>
            {{
              item.is_user_choice
                ? t("your_choice")
                : !data.vote_enabled
                  ? t("vote_disabled")
                  : data.can_vote
                    ? t("vote_now")
                    : t("vote_locked")
            }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";

const { locale, t } = useI18n();

const pageRef = ref(null);
const busy = ref(false);
const error = ref("");
const status = ref("");
const data = ref({
  total_votes: 0,
  items: [],
  user_vote: null,
  vote_enabled: true,
  can_vote: false,
  month_key: "",
});

const items = computed(() => data.value?.items || []);
let themeObserver = null;
let themeRaf = 0;

const setImportantStyles = (element, styles) => {
  if (!(element instanceof HTMLElement)) return;
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value, "important");
  });
};

const applyVoteTheme = () => {
  const root = pageRef.value;
  if (!(root instanceof HTMLElement)) return;

  const isLight =
    document.body.classList.contains("light") ||
    document.body.classList.contains("light-mode") ||
    document.documentElement.getAttribute("data-theme") === "light";

  const surfaces = root.querySelectorAll(".top10-vote-hero, .top10-vote-picked, .top10-vote-card, .top10-vote-empty");
  const softPanels = root.querySelectorAll(".top10-vote-stat, .top10-vote-note, .top10-vote-rank, .top10-vote-cover");
  const mutedText = root.querySelectorAll(
    ".top10-vote-eyebrow, .top10-vote-subtitle, .top10-vote-stat-label, .top10-vote-picked-artist, .top10-vote-artist, .top10-vote-count, .top10-vote-empty",
  );
  const strongText = root.querySelectorAll(
    ".top10-vote-title, .top10-vote-stat strong, .top10-vote-picked-title, .top10-vote-track, .top10-vote-percent, .top10-vote-rank",
  );
  const selectedCards = root.querySelectorAll(".top10-vote-card--selected");
  const progressBars = root.querySelectorAll(".top10-vote-progress");
  const outlineButtons = root.querySelectorAll(".top10-vote-actions .btn-outline-light");
  const primaryButtons = root.querySelectorAll(".top10-vote-actions .btn-primary, .top10-vote-actions .btn-light");
  const pickedBadge = root.querySelector(".top10-vote-picked-badge");

  setImportantStyles(root, {
    color: isLight ? "#0f172a" : "#ffffff",
  });

  surfaces.forEach((element) => {
    setImportantStyles(element, {
      border: isLight ? "1px solid rgba(15, 23, 42, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
      background: isLight
        ? "linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96))"
        : "rgba(12, 16, 26, 0.72)",
      "box-shadow": isLight ? "0 18px 42px rgba(15, 23, 42, 0.08)" : "0 18px 42px rgba(0, 0, 0, 0.18)",
    });
  });

  softPanels.forEach((element) => {
    setImportantStyles(element, {
      background: isLight ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.06)",
      border: isLight ? "1px solid rgba(15, 23, 42, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
      color: isLight ? "#0f172a" : "#ffffff",
    });
  });

  mutedText.forEach((element) => {
    setImportantStyles(element, {
      color: isLight ? "#64748b" : "rgba(255, 255, 255, 0.68)",
    });
  });

  strongText.forEach((element) => {
    setImportantStyles(element, {
      color: isLight ? "#0f172a" : "#ffffff",
    });
  });

  selectedCards.forEach((element) => {
    setImportantStyles(element, {
      border: isLight ? "1px solid rgba(37, 99, 235, 0.18)" : "1px solid rgba(59, 130, 246, 0.34)",
      "box-shadow": isLight ? "0 18px 40px rgba(37, 99, 235, 0.10)" : "0 20px 48px rgba(37, 99, 235, 0.16)",
    });
  });

  progressBars.forEach((element) => {
    setImportantStyles(element, {
      background: isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)",
    });
  });

  outlineButtons.forEach((element) => {
    setImportantStyles(element, {
      color: isLight ? "#0f172a" : "#ffffff",
      background: isLight ? "rgba(15, 23, 42, 0.03)" : "transparent",
      border: isLight ? "1px solid rgba(15, 23, 42, 0.12)" : "1px solid rgba(255, 255, 255, 0.16)",
      "box-shadow": isLight ? "0 10px 22px rgba(15, 23, 42, 0.08)" : "none",
    });
  });

  primaryButtons.forEach((element) => {
    if (element.classList.contains("btn-light")) {
      setImportantStyles(element, {
        color: "#0f172a",
        background: isLight ? "#e2e8f0" : "#ffffff",
        border: isLight ? "1px solid rgba(15, 23, 42, 0.12)" : "1px solid transparent",
      });
      return;
    }

    setImportantStyles(element, {
      "box-shadow": isLight ? "0 12px 26px rgba(37, 99, 235, 0.18)" : "none",
    });
  });

  if (pickedBadge) {
    setImportantStyles(pickedBadge, {
      background: isLight ? "rgba(37, 99, 235, 0.10)" : "rgba(59, 130, 246, 0.16)",
      border: isLight ? "1px solid rgba(37, 99, 235, 0.18)" : "1px solid rgba(59, 130, 246, 0.24)",
      color: isLight ? "#1d4ed8" : "#bfdbfe",
    });
  }
};

const scheduleApplyVoteTheme = () => {
  if (themeRaf) cancelAnimationFrame(themeRaf);
  themeRaf = requestAnimationFrame(() => {
    themeRaf = 0;
    applyVoteTheme();
  });
};

const localeMap = {
  tm: "tk-TM",
  ru: "ru-RU",
  en: "en-US",
};

const monthLabel = computed(() => {
  const monthKey = String(data.value?.month_key || "").trim();
  if (!monthKey) return "";

  const [year, month] = monthKey.split("-").map((value) => Number(value));
  if (!year || !month) return monthKey;

  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(localeMap[locale.value] || "en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
});

const onImgError = (event) => {
  event.target.onerror = null;
  event.target.src = "/img/1.jpg";
};

const load = async () => {
  error.value = "";
  try {
    data.value = await libraryService.getTop10Vote();
  } catch (e) {
    error.value = e.message || t("failed_load_top10_vote");
  }
  await nextTick();
  scheduleApplyVoteTheme();
};

const submitVote = async (musicId) => {
  if (busy.value || !data.value?.can_vote) return;

  busy.value = true;
  error.value = "";
  status.value = "";

  try {
    data.value = await libraryService.submitTop10Vote(musicId);
    status.value = t("vote_saved");
  } catch (e) {
    if (Number(e?.status || 0) === 403) {
      error.value = t("vote_disabled_by_admin");
      await load();
    } else if (Number(e?.status || 0) === 409) {
      error.value = t("already_voted_this_month");
      await load();
    } else {
      error.value = e.message || t("failed_submit_top10_vote");
    }
  } finally {
    busy.value = false;
  }

  await nextTick();
  scheduleApplyVoteTheme();
};

onMounted(async () => {
  await load();

  themeObserver = new MutationObserver(() => {
    scheduleApplyVoteTheme();
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("owazym:theme-changed", scheduleApplyVoteTheme);
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
  window.removeEventListener("owazym:theme-changed", scheduleApplyVoteTheme);
});
</script>

<style scoped>
.top10-vote-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.top10-vote-hero,
.top10-vote-picked,
.top10-vote-card,
.top10-vote-empty {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(12, 16, 26, 0.72);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
}

.top10-vote-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 28px;
}

.top10-vote-eyebrow {
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.8rem;
}

.top10-vote-title {
  margin: 0 0 0.65rem;
  font-size: clamp(1.9rem, 3vw, 2.8rem);
}

.top10-vote-subtitle {
  max-width: 720px;
  margin: 0 0 0.9rem;
  color: rgba(255, 255, 255, 0.72);
}

.top10-vote-note {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 0.95rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.82);
}

.top10-vote-stats {
  min-width: 240px;
  display: grid;
  gap: 0.85rem;
}

.top10-vote-stat {
  padding: 1rem 1.1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.top10-vote-stat-label {
  display: block;
  margin-bottom: 0.35rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.top10-vote-stat strong {
  font-size: 1.1rem;
}

.top10-vote-picked {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-radius: 24px;
}

.top10-vote-picked-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.16);
  border: 1px solid rgba(59, 130, 246, 0.24);
  color: #bfdbfe;
  font-weight: 600;
}

.top10-vote-picked-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-left: auto;
}

.top10-vote-picked-cover,
.top10-vote-cover {
  object-fit: cover;
  display: block;
}

.top10-vote-picked-cover {
  width: 56px;
  height: 56px;
  border-radius: 16px;
}

.top10-vote-picked-title {
  font-weight: 700;
}

.top10-vote-picked-artist {
  color: rgba(255, 255, 255, 0.68);
}

.top10-vote-list {
  display: grid;
  gap: 1rem;
}

.top10-vote-card {
  padding: 1.1rem;
  border-radius: 24px;
}

.top10-vote-card--selected {
  border-color: rgba(59, 130, 246, 0.34);
  box-shadow: 0 20px 48px rgba(37, 99, 235, 0.16);
}

.top10-vote-card-head {
  display: grid;
  grid-template-columns: 52px 88px minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
}

.top10-vote-rank {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 1.1rem;
  font-weight: 700;
}

.top10-vote-cover {
  width: 88px;
  height: 88px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
}

.top10-vote-main {
  min-width: 0;
}

.top10-vote-track,
.top10-vote-artist {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.top10-vote-track {
  font-size: 1.15rem;
  font-weight: 700;
}

.top10-vote-artist {
  margin-top: 0.28rem;
  color: rgba(255, 255, 255, 0.68);
}

.top10-vote-meta {
  text-align: right;
}

.top10-vote-percent {
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1;
}

.top10-vote-count {
  margin-top: 0.35rem;
  color: rgba(255, 255, 255, 0.64);
}

.top10-vote-progress {
  height: 14px;
  margin: 1rem 0 0.95rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.top10-vote-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.72), rgba(139, 92, 246, 0.88));
}

.top10-vote-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.top10-vote-empty {
  min-height: 240px;
  display: grid;
  place-items: center;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: 26px;
  color: rgba(255, 255, 255, 0.78);
  text-align: center;
}

.top10-vote-empty i {
  font-size: 2rem;
}

:global(body.light) .top10-vote-hero,
:global(body.light) .top10-vote-picked,
:global(body.light) .top10-vote-card,
:global(body.light) .top10-vote-empty {
  border-color: rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme="light"]) .top10-vote-page {
  color: #0f172a;
}

:global(html[data-theme="light"]) .top10-vote-hero,
:global(html[data-theme="light"]) .top10-vote-picked,
:global(html[data-theme="light"]) .top10-vote-card,
:global(html[data-theme="light"]) .top10-vote-empty,
:global(body.light) .top10-vote-hero,
:global(body.light) .top10-vote-picked,
:global(body.light) .top10-vote-card,
:global(body.light) .top10-vote-empty {
  border-color: rgba(15, 23, 42, 0.08) !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)) !important;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08) !important;
}

:global(body.light) .top10-vote-eyebrow,
:global(body.light) .top10-vote-subtitle,
:global(body.light) .top10-vote-stat-label,
:global(body.light) .top10-vote-picked-artist,
:global(body.light) .top10-vote-artist,
:global(body.light) .top10-vote-count,
:global(body.light) .top10-vote-empty {
  color: #64748b;
}

:global(html[data-theme="light"]) .top10-vote-eyebrow,
:global(html[data-theme="light"]) .top10-vote-subtitle,
:global(html[data-theme="light"]) .top10-vote-stat-label,
:global(html[data-theme="light"]) .top10-vote-picked-artist,
:global(html[data-theme="light"]) .top10-vote-artist,
:global(html[data-theme="light"]) .top10-vote-count,
:global(html[data-theme="light"]) .top10-vote-empty,
:global(body.light) .top10-vote-eyebrow,
:global(body.light) .top10-vote-subtitle,
:global(body.light) .top10-vote-stat-label,
:global(body.light) .top10-vote-picked-artist,
:global(body.light) .top10-vote-artist,
:global(body.light) .top10-vote-count,
:global(body.light) .top10-vote-empty {
  color: #64748b !important;
}

:global(body.light) .top10-vote-title,
:global(body.light) .top10-vote-stat strong,
:global(body.light) .top10-vote-picked-title,
:global(body.light) .top10-vote-track,
:global(body.light) .top10-vote-percent,
:global(body.light) .top10-vote-rank {
  color: #0f172a;
}

:global(html[data-theme="light"]) .top10-vote-title,
:global(html[data-theme="light"]) .top10-vote-stat strong,
:global(html[data-theme="light"]) .top10-vote-picked-title,
:global(html[data-theme="light"]) .top10-vote-track,
:global(html[data-theme="light"]) .top10-vote-percent,
:global(html[data-theme="light"]) .top10-vote-rank,
:global(body.light) .top10-vote-title,
:global(body.light) .top10-vote-stat strong,
:global(body.light) .top10-vote-picked-title,
:global(body.light) .top10-vote-track,
:global(body.light) .top10-vote-percent,
:global(body.light) .top10-vote-rank {
  color: #0f172a !important;
}

:global(body.light) .top10-vote-note,
:global(body.light) .top10-vote-stat,
:global(body.light) .top10-vote-rank {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.08);
}

:global(html[data-theme="light"]) .top10-vote-note,
:global(html[data-theme="light"]) .top10-vote-stat,
:global(html[data-theme="light"]) .top10-vote-rank,
:global(html[data-theme="light"]) .top10-vote-cover,
:global(body.light) .top10-vote-note,
:global(body.light) .top10-vote-stat,
:global(body.light) .top10-vote-rank,
:global(body.light) .top10-vote-cover {
  background: rgba(15, 23, 42, 0.04) !important;
  border-color: rgba(15, 23, 42, 0.08) !important;
}

:global(body.light) .top10-vote-progress {
  background: rgba(15, 23, 42, 0.08);
}

:global(html[data-theme="light"]) .top10-vote-progress,
:global(body.light) .top10-vote-progress {
  background: rgba(15, 23, 42, 0.08) !important;
}

:global(body.light) .top10-vote-picked-badge {
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.18);
  color: #1d4ed8;
}

:global(html[data-theme="light"]) .top10-vote-picked-badge,
:global(body.light) .top10-vote-picked-badge {
  background: rgba(37, 99, 235, 0.1) !important;
  border-color: rgba(37, 99, 235, 0.18) !important;
  color: #1d4ed8 !important;
}

:global(body.light) .top10-vote-actions .btn-outline-light {
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.03);
}

:global(html[data-theme="light"]) .top10-vote-actions .btn-outline-light,
:global(body.light) .top10-vote-actions .btn-outline-light {
  color: #0f172a !important;
  border-color: rgba(15, 23, 42, 0.12) !important;
  background: rgba(15, 23, 42, 0.03) !important;
}

:global(body.light) .top10-vote-actions .btn-outline-light:hover {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.16);
}

:global(html[data-theme="light"]) .top10-vote-actions .btn-outline-light:hover,
:global(body.light) .top10-vote-actions .btn-outline-light:hover {
  background: rgba(37, 99, 235, 0.08) !important;
  border-color: rgba(37, 99, 235, 0.16) !important;
}

:global(html[data-theme="light"]) .top10-vote-card--selected,
:global(body.light) .top10-vote-card--selected {
  border-color: rgba(37, 99, 235, 0.18) !important;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.1) !important;
}

@media (max-width: 991.98px) {
  .top10-vote-hero,
  .top10-vote-picked {
    flex-direction: column;
    align-items: stretch;
  }

  .top10-vote-stats {
    min-width: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .top10-vote-picked-main {
    margin-left: 0;
  }

  .top10-vote-card-head {
    grid-template-columns: 44px 72px minmax(0, 1fr);
  }

  .top10-vote-meta {
    grid-column: 2 / 4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
  }

  .top10-vote-cover {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }
}

@media (max-width: 575.98px) {
  .top10-vote-page {
    gap: 0.85rem;
  }

  .top10-vote-hero,
  .top10-vote-card,
  .top10-vote-picked {
    padding: 1rem;
    border-radius: 20px;
  }

  .top10-vote-stats {
    grid-template-columns: 1fr;
  }

  .top10-vote-card-head {
    grid-template-columns: 40px 60px minmax(0, 1fr);
    gap: 0.8rem;
  }

  .top10-vote-rank {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .top10-vote-cover {
    width: 60px;
    height: 60px;
    border-radius: 16px;
  }

  .top10-vote-track {
    font-size: 1rem;
  }

  .top10-vote-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
