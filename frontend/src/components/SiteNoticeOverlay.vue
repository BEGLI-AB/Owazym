<template>
  <div v-if="visible && notice" :key="notice.id" class="site-notice-layer" aria-live="polite" aria-atomic="true">
    <button type="button" class="site-notice-hanger" @click="openNotice">
      <div class="site-notice-chain site-notice-chain--left" aria-hidden="true">
        <span v-for="link in chainLinks" :key="`left-${link}`" class="site-notice-chain__link"></span>
      </div>
      <div class="site-notice-chain site-notice-chain--right" aria-hidden="true">
        <span v-for="link in chainLinks" :key="`right-${link}`" class="site-notice-chain__link"></span>
      </div>
      <span class="site-notice-pin site-notice-pin--left" aria-hidden="true"></span>
      <span class="site-notice-pin site-notice-pin--right" aria-hidden="true"></span>

      <div class="site-notice-board">
        <div class="site-notice-board__frame" aria-hidden="true"></div>
        <div class="site-notice-board__grain" aria-hidden="true"></div>
        <div class="site-notice-board__streak site-notice-board__streak--one" aria-hidden="true"></div>
        <div class="site-notice-board__streak site-notice-board__streak--two" aria-hidden="true"></div>
        <div class="site-notice-board__streak site-notice-board__streak--three" aria-hidden="true"></div>
        <div class="site-notice-board__knot site-notice-board__knot--left" aria-hidden="true"></div>
        <div class="site-notice-board__knot site-notice-board__knot--right" aria-hidden="true"></div>
        <div class="site-notice-board__label">{{ noticeCopy.label }}</div>
        <div class="site-notice-board__title">{{ notice.artist_name }}</div>
        <div class="site-notice-board__subtitle">{{ noticeCopy.subtitle }}</div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";
import { useAuthStore } from "../store/auth";

const NOTICE_AFTER_SEASON_GAP_MS = 120;
const SEEN_NOTICE_STORAGE_KEY = "owazym_seen_site_notice_v2";
const route = useRoute();
const router = useRouter();
const { locale } = useI18n();
const auth = useAuthStore();

const visible = ref(false);
const notice = ref(null);
const chainLinks = Array.from({ length: 10 }, (_, index) => index);

let hideTimer = 0;
let showTimer = 0;
let pendingNotice = null;
let shownNoticeKey = "";

const noticeCopy = computed(() => {
  if (locale.value === "ru") {
    return {
      label: "Новинка",
      subtitle: "добавил новый трек",
    };
  }

  if (locale.value === "en") {
    return {
      label: "New",
      subtitle: "added a new track",
    };
  }

  return {
    label: "Tazelik",
    subtitle: "taze track gosdy",
  };
});

const normalizeNotice = (value) => {
  const source = value && typeof value === "object" ? value : {};
  const id = String(source.id || "").trim();
  const type = String(source.type || "").trim().toLowerCase();
  const artistName = String(source.artist_name || source.artistName || "").trim();
  const url = String(source.url || "").trim();

  if (!id || !type || !artistName) return null;

  return {
    id,
    type,
    artist_name: artistName,
    url: url || null,
  };
};

const decodeTokenUserId = (token) => {
  const safeToken = String(token || "").trim();
  if (!safeToken) return "";

  try {
    const [, payload] = safeToken.split(".");
    if (!payload) return "";

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const parsed = JSON.parse(window.atob(padded));
    return String(parsed?.sub || "").trim();
  } catch (_error) {
    return "";
  }
};

const getViewerId = () => {
  const userId = String(auth.user?.id ?? "").trim();
  if (userId) return userId;

  const tokenUserId = decodeTokenUserId(auth.token);
  if (tokenUserId) return tokenUserId;

  const userName = String(auth.user?.name || "").trim().toLowerCase();
  return userName || "guest";
};

const getNoticeSeenStorageKey = () => `${SEEN_NOTICE_STORAGE_KEY}:${getViewerId()}`;

const readSeenNoticeId = () => {
  try {
    return localStorage.getItem(getNoticeSeenStorageKey()) || "";
  } catch (_error) {
    return "";
  }
};

const writeSeenNoticeId = (id) => {
  try {
    localStorage.setItem(getNoticeSeenStorageKey(), String(id || ""));
  } catch (_error) {
    // ignore storage errors
  }
};

const clearHideTimer = () => {
  if (!hideTimer) return;
  window.clearTimeout(hideTimer);
  hideTimer = 0;
};

const clearShowTimer = () => {
  if (!showTimer) return;
  window.clearTimeout(showTimer);
  showTimer = 0;
};

const revealNotice = (nextNotice) => {
  if (!nextNotice) return;
  clearHideTimer();
  notice.value = nextNotice;
  visible.value = true;
  shownNoticeKey = `${getViewerId()}:${nextNotice.id}`;
  writeSeenNoticeId(nextNotice.id);
  hideTimer = window.setTimeout(() => {
    visible.value = false;
  }, 5000);
};

const showNotice = (nextNotice, delayMs = 0) => {
  clearShowTimer();
  if (delayMs <= 0) {
    revealNotice(nextNotice);
    return;
  }

  showTimer = window.setTimeout(() => {
    showTimer = 0;
    revealNotice(nextNotice);
  }, delayMs);
};

const isSeasonOverlayActive = () => Boolean(window.__owazymSeasonOverlayActive);

const flushPendingNotice = () => {
  if (!pendingNotice) return;
  const nextNotice = pendingNotice;
  pendingNotice = null;
  showNotice(nextNotice, NOTICE_AFTER_SEASON_GAP_MS);
};
const maybeShowNotice = (nextNotice, options = {}) => {
  const normalized = normalizeNotice(nextNotice);
  if (!normalized) return;
  const currentNoticeKey = `${getViewerId()}:${normalized.id}`;
  if (!options.force && (shownNoticeKey === currentNoticeKey || readSeenNoticeId() === normalized.id)) return;

  if (isSeasonOverlayActive()) {
    pendingNotice = normalized;
    return;
  }

  const delayMs = Math.max(0, Number(options.delayMs || 0));
  showNotice(normalized, delayMs);
};

const loadNotice = async () => {
  try {
    const data = await libraryService.getSiteEffects();
    maybeShowNotice(data?.site_notice);
  } catch (_error) {
    // ignore fetch errors for the decorative notice
  }
};

const openNotice = async () => {
  const url = String(notice.value?.url || "").trim();
  visible.value = false;
  if (!url) return;

  if (/^https?:\/\//i.test(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  await router.push(url);
};

const onSiteNoticePublished = (event) => {
  maybeShowNotice(event?.detail?.notice, { force: true });
};

const onSeasonOverlayFinished = () => {
  flushPendingNotice();
};

watch(
  () => route.fullPath,
  () => {
    loadNotice();
  },
);

onMounted(() => {
  loadNotice();
  window.addEventListener("owazym:site-notice-published", onSiteNoticePublished);
  window.addEventListener("owazym:season-overlay-finished", onSeasonOverlayFinished);
});

onBeforeUnmount(() => {
  clearHideTimer();
  clearShowTimer();
  pendingNotice = null;
  window.removeEventListener("owazym:site-notice-published", onSiteNoticePublished);
  window.removeEventListener("owazym:season-overlay-finished", onSeasonOverlayFinished);
});
</script>

<style scoped>
.site-notice-layer {
  position: fixed;
  inset: 0 0 auto 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 2500;
}

.site-notice-hanger {
  position: relative;
  width: min(88vw, 640px);
  padding: 158px 0 0;
  border: 0;
  background: transparent;
  pointer-events: auto;
  cursor: pointer;
  transform-origin: top center;
  animation: site-notice-hanger-cycle 5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.site-notice-chain {
  position: absolute;
  top: 4px;
  width: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 0;
  filter: drop-shadow(0 5px 6px rgba(0, 0, 0, 0.26));
}

.site-notice-chain--left {
  left: 18%;
}

.site-notice-chain--right {
  right: 18%;
}

.site-notice-chain__link {
  position: relative;
  display: block;
  width: 16px;
  height: 30px;
  margin-top: -13px;
  border-radius: 999px;
  border: 4px solid #1f2328;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 34%, rgba(7, 8, 10, 0.2) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    inset 1px 1px 2px rgba(255, 255, 255, 0.05),
    inset -2px -2px 3px rgba(0, 0, 0, 0.34),
    0 3px 6px rgba(0, 0, 0, 0.3);
}

.site-notice-chain__link::before {
  content: "";
  position: absolute;
  left: 50%;
  top: -18px;
  width: 8px;
  height: 22px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(180deg, #353b42 0%, #191d22 42%, #0f1215 100%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.04),
    inset 0 -2px 2px rgba(0, 0, 0, 0.3);
}

.site-notice-chain__link::after {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: inherit;
  box-shadow:
    inset 1px 0 0 rgba(255, 255, 255, 0.08),
    inset -1px 0 0 rgba(255, 255, 255, 0.03);
}

.site-notice-chain__link:first-child::before {
  display: none;
}

.site-notice-chain__link:nth-child(odd) {
  transform: translateX(-1px) rotate(-5deg);
  z-index: 2;
}

.site-notice-chain__link:nth-child(even) {
  transform: translateX(1px) rotate(5deg);
  z-index: 1;
}

.site-notice-pin {
  position: absolute;
  top: 146px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #f5f7fa 0%, #b8c0c8 34%, #6e7680 64%, #444b54 100%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.35),
    inset 0 -2px 3px rgba(28, 32, 36, 0.28),
    0 3px 8px rgba(0, 0, 0, 0.2);
  animation: site-notice-pin-cycle 5s ease-in-out both;
}

.site-notice-pin--left {
  left: calc(18% - 4px);
}

.site-notice-pin--right {
  right: calc(18% - 4px);
}

.site-notice-board {
  position: relative;
  min-height: 140px;
  padding: 1.15rem 1.6rem 1.2rem;
  border-radius: 8px 8px 14px 14px;
  background:
    linear-gradient(92deg, rgba(255, 245, 220, 0.08) 0%, rgba(255, 245, 220, 0) 22%, rgba(100, 58, 29, 0.08) 48%, rgba(255, 245, 220, 0.02) 70%, rgba(92, 54, 27, 0.1) 100%),
    radial-gradient(ellipse at 18% 28%, rgba(137, 82, 39, 0.16) 0, rgba(137, 82, 39, 0) 20%),
    radial-gradient(ellipse at 78% 66%, rgba(117, 68, 34, 0.15) 0, rgba(117, 68, 34, 0) 22%),
    linear-gradient(180deg, rgba(255, 251, 238, 0.22), rgba(255, 255, 255, 0) 18%),
    linear-gradient(180deg, #e2ba86 0%, #cc9257 45%, #9a6031 100%);
  box-shadow:
    0 18px 36px rgba(0, 0, 0, 0.28),
    inset 0 0 0 1px rgba(90, 53, 25, 0.18),
    inset 0 1px 0 rgba(255, 247, 229, 0.32);
  overflow: hidden;
  text-align: center;
  color: #4a2c18;
  transform-origin: top center;
  animation: site-notice-board-cycle 5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.site-notice-board__frame,
.site-notice-board__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.site-notice-board__frame {
  inset: 10px;
  border-radius: 6px 6px 11px 11px;
  box-shadow:
    inset 0 0 0 2px rgba(113, 67, 30, 0.34),
    inset 0 0 0 10px rgba(255, 244, 216, 0.035),
    inset 0 18px 18px rgba(255, 246, 217, 0.06),
    inset 0 -16px 18px rgba(87, 47, 18, 0.12);
}

.site-notice-board__grain {
  inset: 1px;
  background:
    linear-gradient(
      90deg,
      rgba(99, 57, 27, 0) 0%,
      rgba(99, 57, 27, 0.08) 11%,
      rgba(255, 244, 220, 0.06) 19%,
      rgba(109, 64, 31, 0.04) 32%,
      rgba(255, 244, 220, 0.035) 46%,
      rgba(95, 55, 28, 0.08) 62%,
      rgba(255, 244, 220, 0.03) 76%,
      rgba(88, 50, 25, 0.09) 88%,
      rgba(88, 50, 25, 0) 100%
    ),
    radial-gradient(ellipse 220px 24px at 30% 28%, rgba(115, 67, 33, 0.14) 0 14%, rgba(115, 67, 33, 0) 18%),
    radial-gradient(ellipse 260px 22px at 70% 56%, rgba(111, 66, 34, 0.12) 0 12%, rgba(111, 66, 34, 0) 16%),
    repeating-linear-gradient(
      0deg,
      rgba(122, 72, 35, 0.16) 0 1px,
      rgba(255, 244, 220, 0.025) 1px 4px,
      rgba(118, 70, 34, 0.08) 4px 8px,
      rgba(255, 246, 224, 0.02) 8px 11px,
      rgba(103, 60, 29, 0.12) 11px 13px,
      rgba(255, 246, 224, 0.018) 13px 17px
    );
  mix-blend-mode: multiply;
  opacity: 0.68;
  filter: blur(0.18px);
}

.site-notice-board__streak,
.site-notice-board__knot {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}

.site-notice-board__streak {
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(109, 62, 28, 0), rgba(109, 62, 28, 0.26), rgba(153, 95, 51, 0.14), rgba(109, 62, 28, 0));
  opacity: 0.46;
  filter: blur(0.5px);
}

.site-notice-board__streak--one {
  top: 36px;
  left: 12%;
  width: 52%;
}

.site-notice-board__streak--two {
  top: 74px;
  right: 10%;
  width: 46%;
}

.site-notice-board__streak--three {
  bottom: 30px;
  left: 18%;
  width: 38%;
}

.site-notice-board__knot {
  width: 66px;
  height: 42px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 46% 50%, rgba(90, 51, 24, 0.4) 0 7%, rgba(156, 102, 54, 0.2) 7% 15%, rgba(98, 57, 28, 0.16) 15% 23%, rgba(98, 57, 28, 0) 24%),
    radial-gradient(ellipse at center, rgba(124, 76, 37, 0.18) 0 48%, rgba(124, 76, 37, 0) 49%);
  opacity: 0.56;
}

.site-notice-board__knot--left {
  top: 42px;
  left: 8%;
  transform: rotate(-12deg);
}

.site-notice-board__knot--right {
  right: 12%;
  bottom: 24px;
  transform: rotate(8deg);
}

.site-notice-board__label,
.site-notice-board__title,
.site-notice-board__subtitle {
  position: relative;
  z-index: 1;
}

.site-notice-board__label {
  margin-bottom: 0.35rem;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(74, 44, 24, 0.78);
}

.site-notice-board__title {
  font-size: clamp(1.8rem, 2.65vw, 2.55rem);
  line-height: 1.05;
  font-weight: 700;
}

.site-notice-board__subtitle {
  margin-top: 0.35rem;
  font-size: clamp(1.12rem, 1.5vw, 1.34rem);
  color: rgba(74, 44, 24, 0.84);
}

@keyframes site-notice-hanger-cycle {
  0% {
    opacity: 0;
    transform: translateY(-320px);
  }
  16% {
    opacity: 1;
    transform: translateY(18px);
  }
  24% {
    opacity: 1;
    transform: translateY(0);
  }
  72% {
    opacity: 1;
    transform: translateY(0);
  }
  86% {
    opacity: 1;
    transform: translateY(-8px);
  }
  100% {
    opacity: 0;
    transform: translateY(-260px);
  }
}

@keyframes site-notice-board-cycle {
  0% {
    transform: rotate(-2.2deg);
  }
  16% {
    transform: rotate(1.8deg);
  }
  28% {
    transform: rotate(-1.15deg);
  }
  40% {
    transform: rotate(0.72deg);
  }
  54% {
    transform: rotate(-0.42deg);
  }
  70% {
    transform: rotate(0.2deg);
  }
  86% {
    transform: rotate(-0.18deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes site-notice-pin-cycle {
  0%,
  8% {
    opacity: 0;
  }
  16%,
  84% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@media (max-width: 767.98px) {
  .site-notice-hanger {
    width: min(94vw, 520px);
    padding-top: 136px;
  }

  .site-notice-chain {
    top: 4px;
    width: 28px;
  }

  .site-notice-chain__link {
    width: 14px;
    height: 24px;
    margin-top: -10px;
    border-width: 3px;
  }

  .site-notice-chain__link::before {
    top: -14px;
    width: 7px;
    height: 17px;
  }

  .site-notice-chain__link:nth-child(odd) {
    transform: translateX(-1px) rotate(-4deg);
  }

  .site-notice-chain__link:nth-child(even) {
    transform: translateX(1px) rotate(4deg);
  }

  .site-notice-pin {
    top: 124px;
  }

  .site-notice-board {
    min-height: 138px;
    padding: 1.05rem 1.05rem 1.08rem;
  }

  .site-notice-board__frame {
    inset: 8px;
  }

  .site-notice-board__label {
    font-size: 0.95rem;
  }

  .site-notice-board__title {
    font-size: 1.85rem;
  }

  .site-notice-board__subtitle {
    font-size: 1.15rem;
  }
}
</style>
