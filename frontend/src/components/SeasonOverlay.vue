<template>
  <Transition name="season-overlay-fade">
    <div
      v-if="visible"
      class="season-overlay"
      :class="`season-overlay--${activeSeason}`"
      aria-hidden="true"
    >
      <div class="season-overlay__wash"></div>
      <div v-if="activeSeason === 'ramadan'" class="ramadan-scene">
        <div class="ramadan-lantern">
          <svg class="ramadan-lantern__svg" viewBox="0 0 220 360" aria-hidden="true">
            <defs>
              <linearGradient id="ramadanLanternGold" x1="18%" y1="10%" x2="82%" y2="90%">
                <stop offset="0%" stop-color="#f5c562" />
                <stop offset="55%" stop-color="#d9942e" />
                <stop offset="100%" stop-color="#9a5617" />
              </linearGradient>
              <linearGradient id="ramadanLanternGoldSoft" x1="16%" y1="12%" x2="84%" y2="88%">
                <stop offset="0%" stop-color="#ffd27a" />
                <stop offset="45%" stop-color="#e3a847" />
                <stop offset="100%" stop-color="#b96b1f" />
              </linearGradient>
              <radialGradient id="ramadanLanternGlow" cx="50%" cy="52%" r="55%">
                <stop offset="0%" stop-color="#fff8e8" stop-opacity="0.98" />
                <stop offset="38%" stop-color="#ffe29a" stop-opacity="0.9" />
                <stop offset="74%" stop-color="#f2ad41" stop-opacity="0.42" />
                <stop offset="100%" stop-color="#f2ad41" stop-opacity="0" />
              </radialGradient>
            </defs>

            <path
              d="M114 0 C118 34, 111 61, 112 83"
              fill="none"
              stroke="#f7f6f0"
              stroke-width="5"
              stroke-linecap="round"
            />
            <circle cx="112" cy="92" r="7" fill="none" stroke="url(#ramadanLanternGold)" stroke-width="3.5" />
            <line x1="112" y1="99" x2="112" y2="110" stroke="url(#ramadanLanternGold)" stroke-width="3" stroke-linecap="round" />

            <path
              d="M74 108 C84 70, 140 70, 150 108 L162 118 L62 118 Z"
              fill="url(#ramadanLanternGoldSoft)"
              stroke="url(#ramadanLanternGold)"
              stroke-width="4"
              stroke-linejoin="round"
            />
            <path
              d="M84 76 C93 56, 131 56, 140 76 L144 108 L80 108 Z"
              fill="url(#ramadanLanternGoldSoft)"
              stroke="url(#ramadanLanternGold)"
              stroke-width="4"
              stroke-linejoin="round"
            />

            <path
              d="M72 120 L152 120 L165 145 L165 236 L112 284 L59 236 L59 145 Z"
              fill="url(#ramadanLanternGoldSoft)"
              stroke="url(#ramadanLanternGold)"
              stroke-width="4"
              stroke-linejoin="round"
            />

            <ellipse cx="112" cy="194" rx="28" ry="66" fill="url(#ramadanLanternGlow)" />
            <path d="M88 138 C98 130, 126 130, 136 138 L136 232 C126 246, 98 246, 88 232 Z" fill="#17314f" opacity="0.94" />
            <path d="M66 148 C73 141, 88 141, 95 148 L95 224 C88 236, 73 236, 66 224 Z" fill="#17314f" opacity="0.9" />
            <path d="M129 148 C136 141, 151 141, 158 148 L158 224 C151 236, 136 236, 129 224 Z" fill="#17314f" opacity="0.9" />

            <path d="M79 120 L88 282" fill="none" stroke="#f4c976" stroke-width="3" stroke-linecap="round" opacity="0.82" />
            <path d="M96 118 L99 286" fill="none" stroke="#f4c976" stroke-width="3" stroke-linecap="round" opacity="0.82" />
            <path d="M112 118 L112 289" fill="none" stroke="#f4c976" stroke-width="3" stroke-linecap="round" opacity="0.82" />
            <path d="M128 118 L125 286" fill="none" stroke="#f4c976" stroke-width="3" stroke-linecap="round" opacity="0.82" />
            <path d="M145 120 L136 282" fill="none" stroke="#f4c976" stroke-width="3" stroke-linecap="round" opacity="0.82" />

            <path
              d="M86 286 C94 304, 130 304, 138 286 L144 276 L80 276 Z"
              fill="url(#ramadanLanternGoldSoft)"
              stroke="url(#ramadanLanternGold)"
              stroke-width="4"
              stroke-linejoin="round"
            />
            <path
              d="M96 304 C100 320, 124 320, 128 304 L132 294 L92 294 Z"
              fill="url(#ramadanLanternGoldSoft)"
              stroke="url(#ramadanLanternGold)"
              stroke-width="4"
              stroke-linejoin="round"
            />
            <line x1="112" y1="320" x2="112" y2="340" stroke="url(#ramadanLanternGold)" stroke-width="3" stroke-linecap="round" />
            <path d="M112 340 L118 352 L112 360 L106 352 Z" fill="url(#ramadanLanternGold)" />
          </svg>
        </div>
        <div class="ramadan-ornament">
          <svg class="ramadan-ornament__svg" viewBox="0 0 260 360" aria-hidden="true">
              <defs>
                <linearGradient id="ramadanMoonGold" x1="18%" y1="12%" x2="82%" y2="88%">
                  <stop offset="0%" stop-color="#e0a43a" />
                  <stop offset="35%" stop-color="#e0a43a" />
                  <stop offset="72%" stop-color="#e0a43a" />
                  <stop offset="100%" stop-color="#e0a43a" />
                </linearGradient>
                <linearGradient id="ramadanMoonFill" x1="12%" y1="18%" x2="84%" y2="82%">
                  <stop offset="0%" stop-color="#e0a43a" stop-opacity="0.96" />
                  <stop offset="42%" stop-color="#e0a43a" stop-opacity="0.96" />
                  <stop offset="100%" stop-color="#e0a43a" stop-opacity="0.96" />
                </linearGradient>
                <pattern id="ramadanMoonPattern" width="18" height="18" patternUnits="userSpaceOnUse">
                  <path
                    d="M9 1.4 L11 6 L15.6 8 L11 10 L9 14.6 L7 10 L2.4 8 L7 6 Z"
                    fill="none"
                    stroke="#f6d68c"
                    stroke-opacity="0.82"
                    stroke-width="1.15"
                    stroke-linejoin="round"
                  />
                  <circle cx="9" cy="8" r="1.2" fill="#f6d68c" fill-opacity="0.42" />
                </pattern>
                <mask id="ramadanMoonMask">
                  <rect width="260" height="280" fill="black" />
                  <circle cx="102" cy="184" r="76" fill="white" />
                  <circle cx="146" cy="145" r="66" fill="black" />
                </mask>
              </defs>

              <line
                x1="144"
                y1="24"
                x2="144"
                y2="24"
                stroke="transparent"
                stroke-width="0"
              />
              <path
                d="M148 0 C150 38, 145 78, 148 118 C151 142, 146 154, 144 158"
                fill="none"
                stroke="#f7f6f0"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="144" cy="166" r="7.5" fill="none" stroke="url(#ramadanMoonGold)" stroke-width="3.5" />
              <line x1="144" y1="173" x2="144" y2="186" stroke="url(#ramadanMoonGold)" stroke-width="3" stroke-linecap="round" />
              <polygon
                points="144,188 151,204 168,204 154,214 160,231 144,220 128,231 134,214 120,204 137,204"
                fill="url(#ramadanMoonGold)"
              />
              <polygon
                points="144,196 148,205 158,205 150,211 153,221 144,215 135,221 138,211 130,205 140,205"
                fill="#081426"
              />

              <g transform="translate(0 44) rotate(-13 118 174)">
                <rect width="260" height="280" fill="url(#ramadanMoonFill)" mask="url(#ramadanMoonMask)" />
                <rect width="260" height="280" fill="url(#ramadanMoonPattern)" opacity="0.94" mask="url(#ramadanMoonMask)" />
                <circle cx="102" cy="184" r="76" fill="none" stroke="url(#ramadanMoonGold)" stroke-width="5.5" mask="url(#ramadanMoonMask)" />
                <ellipse cx="82" cy="148" rx="18" ry="30" fill="#f6d68c" fill-opacity="0.14" mask="url(#ramadanMoonMask)" />
              </g>
          </svg>
        </div>
      </div>
      <span
        v-for="particle in particles"
        :key="particle.id"
        class="season-particle"
        :class="`season-particle--${activeSeason}`"
        :style="particle.style"
      ></span>
    </div>
  </Transition>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { libraryService } from "../services/libraryService";

const INTRO_DURATION_MS = 2000;
const RAMADAN_DURATION_MS = 3000;
const SEASONS = ["summer", "autumn", "winter", "spring", "ramadan"];

let introPlayed = false;
let cachedSeason = "summer";

const visible = ref(false);
const activeSeason = ref("summer");
const particles = ref([]);

let hideTimerId = 0;

const syncSeasonOverlayState = (active, season = cachedSeason) => {
  window.__owazymSeasonOverlayActive = Boolean(active);
  window.dispatchEvent(
    new CustomEvent(active ? "owazym:season-overlay-started" : "owazym:season-overlay-finished", {
      detail: { season: normalizeSeason(season) },
    }),
  );
};

const normalizeSeason = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return SEASONS.includes(normalized) ? normalized : "summer";
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const createSummerParticles = () =>
  Array.from({ length: 42 }, (_, index) => {
    const width = randomBetween(18, 76);
    const height = randomBetween(2, 8);
    const colorRoll = Math.random();
    const color =
      colorRoll > 0.72
        ? "rgba(245, 214, 163, 0.78)"
        : colorRoll > 0.38
          ? "rgba(232, 182, 118, 0.64)"
          : "rgba(214, 154, 90, 0.54)";

    return {
      id: `summer-${index}-${Math.round(randomBetween(1000, 9999))}`,
      style: {
        left: `${randomBetween(-18, 8)}vw`,
        top: `${randomBetween(-4, 102)}vh`,
        width: `${width}px`,
        height: `${height}px`,
        opacity: `${randomBetween(0.18, 0.62)}`,
        "--summer-color": color,
        "--summer-drift-y": `${randomBetween(-18, 18)}vh`,
        "--summer-rotate": `${randomBetween(-10, 14)}deg`,
        "--summer-scale": `${randomBetween(0.85, 1.18)}`,
        animationDuration: `${randomBetween(0.9, 1.7)}s`,
        animationDelay: `${randomBetween(-0.35, 0.25)}s`,
      },
    };
  });

const createWinterParticles = () =>
  Array.from({ length: 34 }, (_, index) => {
    const size = randomBetween(3, 10);
    return {
      id: `winter-${index}-${Math.round(randomBetween(1000, 9999))}`,
      style: {
        left: `${randomBetween(0, 100)}%`,
        top: `${randomBetween(-25, 5)}vh`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: `${randomBetween(0.35, 0.95)}`,
        animationDuration: `${randomBetween(1.6, 2.8)}s`,
        animationDelay: `${randomBetween(-0.6, 0.4)}s`,
        "--drift": `${randomBetween(-90, 90)}px`,
      },
    };
  });

const createAutumnParticles = () =>
  Array.from({ length: 22 }, (_, index) => {
    const size = randomBetween(14, 28);
    return {
      id: `autumn-${index}-${Math.round(randomBetween(1000, 9999))}`,
      style: {
        left: `${randomBetween(0, 100)}%`,
        top: `${randomBetween(-22, 0)}vh`,
        width: `${size}px`,
        height: `${size * 0.72}px`,
        opacity: `${randomBetween(0.5, 0.95)}`,
        animationDuration: `${randomBetween(1.7, 2.9)}s`,
        animationDelay: `${randomBetween(-0.5, 0.4)}s`,
        "--drift": `${randomBetween(-120, 120)}px`,
        "--rotate-start": `${randomBetween(0, 180)}deg`,
        "--rotate-end": `${randomBetween(220, 520)}deg`,
      },
    };
  });

const createSpringParticles = () =>
  Array.from({ length: 20 }, (_, index) => {
    const size = randomBetween(18, 34);
    const paletteRoll = Math.random();
    const palette =
      paletteRoll > 0.8
        ? {
            petal: "hsla(107, 72%, 84%, 0.96)",
            petalShadow: "hsla(113, 42%, 70%, 0.5)",
            center: "hsla(54, 98%, 70%, 0.98)",
          }
        : paletteRoll > 0.48
          ? {
              petal: "hsla(332, 100%, 91%, 0.98)",
              petalShadow: "hsla(332, 44%, 74%, 0.48)",
              center: "hsla(42, 100%, 72%, 0.98)",
            }
          : {
              petal: "hsla(44, 100%, 92%, 0.98)",
              petalShadow: "hsla(41, 58%, 78%, 0.46)",
              center: "hsla(28, 100%, 66%, 0.98)",
            };

    return {
      id: `spring-${index}-${Math.round(randomBetween(1000, 9999))}`,
      style: {
        left: `${randomBetween(0, 100)}%`,
        top: `${randomBetween(72, 108)}vh`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: `${randomBetween(0.58, 0.98)}`,
        "--drift": `${randomBetween(-90, 90)}px`,
        "--spring-scale-start": `${randomBetween(0.4, 0.95)}`,
        "--spring-scale-mid": `${randomBetween(0.8, 1.12)}`,
        "--spring-scale-end": `${randomBetween(1.02, 1.34)}`,
        "--spring-blur": `${randomBetween(0, 0.25)}px`,
        "--spring-petal": palette.petal,
        "--spring-petal-shadow": palette.petalShadow,
        "--spring-center": palette.center,
        "--spring-rise-duration": `${randomBetween(1.55, 2.55)}s`,
        "--spring-twinkle-duration": `${randomBetween(0.65, 1.25)}s`,
        "--spring-delay": `${randomBetween(-0.4, 0.35)}s`,
        "--spring-drift-mid": `${randomBetween(-44, 44)}px`,
        "--spring-rise-mid": `${randomBetween(-46, -24)}vh`,
        "--spring-rise-end": `${randomBetween(-88, -48)}vh`,
        "--spring-rotate-start": `${randomBetween(-20, 20)}deg`,
        "--spring-rotate-mid": `${randomBetween(20, 110)}deg`,
        "--spring-rotate-end": `${randomBetween(110, 220)}deg`,
      },
    };
  });

const buildParticles = (season) => {
  const normalized = normalizeSeason(season);
  if (normalized === "summer") return createSummerParticles();
  if (normalized === "winter") return createWinterParticles();
  if (normalized === "autumn") return createAutumnParticles();
  if (normalized === "spring") return createSpringParticles();
  return [];
};

const getIntroDuration = (season) => (normalizeSeason(season) === "ramadan" ? RAMADAN_DURATION_MS : INTRO_DURATION_MS);

const clearHideTimer = () => {
  if (hideTimerId) {
    window.clearTimeout(hideTimerId);
    hideTimerId = 0;
  }
};

const playEffect = (season) => {
  const normalized = normalizeSeason(season);
  cachedSeason = normalized;
  activeSeason.value = normalized;

  clearHideTimer();

  particles.value = buildParticles(normalized);
  visible.value = true;
  syncSeasonOverlayState(true, normalized);

  hideTimerId = window.setTimeout(() => {
    visible.value = false;
    syncSeasonOverlayState(false, normalized);
  }, getIntroDuration(normalized));
};

const fetchSeasonEffect = async ({ playIntro = false } = {}) => {
  try {
    const data = await libraryService.getSiteEffects();
    const season = normalizeSeason(data?.season_effect);
    cachedSeason = season;

    if (playIntro && !introPlayed) {
      introPlayed = true;
      playEffect(season);
      return;
    }

    activeSeason.value = season;
  } catch (_error) {
    if (playIntro) {
      introPlayed = true;
    }
  }
};

const onSeasonEffectUpdated = (event) => {
  const season = normalizeSeason(event?.detail?.season);
  introPlayed = true;
  playEffect(season);
};

onMounted(() => {
  syncSeasonOverlayState(false, cachedSeason);

  if (!introPlayed) {
    fetchSeasonEffect({ playIntro: true });
  } else {
    activeSeason.value = cachedSeason;
  }

  window.addEventListener("owazym:season-effect-updated", onSeasonEffectUpdated);
});

onBeforeUnmount(() => {
  clearHideTimer();
  syncSeasonOverlayState(false, cachedSeason);
  window.removeEventListener("owazym:season-effect-updated", onSeasonEffectUpdated);
});
</script>

<style scoped>
.season-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  pointer-events: none;
  overflow: hidden;
}

.season-overlay__wash {
  position: absolute;
  inset: 0;
}

.season-overlay--summer .season-overlay__wash {
  background:
    linear-gradient(110deg, rgba(183, 116, 45, 0.08) 0%, rgba(244, 194, 123, 0.22) 34%, rgba(232, 174, 96, 0.12) 68%, rgba(183, 116, 45, 0.04) 100%),
    radial-gradient(circle at 18% 24%, rgba(255, 220, 160, 0.16), transparent 26%),
    radial-gradient(circle at 82% 68%, rgba(214, 154, 90, 0.14), transparent 30%),
    linear-gradient(180deg, rgba(255, 246, 219, 0.04), rgba(173, 98, 33, 0.08));
  backdrop-filter: blur(1.5px);
}

.season-overlay--winter .season-overlay__wash {
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(147, 197, 253, 0.12), rgba(255, 255, 255, 0));
}

.season-overlay--autumn .season-overlay__wash {
  background:
    radial-gradient(circle at 20% 25%, rgba(251, 146, 60, 0.16), transparent 30%),
    linear-gradient(180deg, rgba(120, 53, 15, 0.12), rgba(0, 0, 0, 0));
}

.season-overlay--spring .season-overlay__wash {
  background:
    radial-gradient(circle at 78% 16%, rgba(255, 248, 196, 0.14), transparent 20%),
    radial-gradient(circle at 16% 84%, rgba(244, 114, 182, 0.1), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0));
}

.season-overlay--ramadan .season-overlay__wash {
  background:
    radial-gradient(circle at 50% 12%, rgba(255, 244, 204, 0.12), transparent 18%),
    radial-gradient(circle at 18% 20%, rgba(59, 130, 246, 0.08), transparent 24%),
    radial-gradient(circle at 80% 70%, rgba(180, 83, 9, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(3, 18, 38, 0.36), rgba(4, 9, 18, 0.1));
}

.season-particle {
  position: absolute;
  display: block;
  will-change: transform, opacity;
}

.season-particle--summer {
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), var(--summer-color), rgba(255, 255, 255, 0));
  filter: blur(1px);
  box-shadow: 0 0 12px rgba(233, 184, 108, 0.18);
  animation: season-summer-blow linear forwards;
}

.season-particle--winter {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
  animation: season-winter-fall linear forwards;
}

.season-particle--autumn {
  border-radius: 80% 0 80% 0;
  background: linear-gradient(135deg, #7c2d12 0%, #f59e0b 58%, #facc15 100%);
  box-shadow: 0 6px 16px rgba(124, 45, 18, 0.22);
  animation: season-autumn-fall ease-in forwards;
}

.season-particle--spring {
  position: absolute;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 18%, var(--spring-petal) 0 23%, transparent 26%),
    radial-gradient(circle at 82% 50%, var(--spring-petal) 0 23%, transparent 26%),
    radial-gradient(circle at 50% 82%, var(--spring-petal) 0 23%, transparent 26%),
    radial-gradient(circle at 18% 50%, var(--spring-petal) 0 23%, transparent 26%),
    radial-gradient(circle at 70% 28%, color-mix(in srgb, var(--spring-petal-shadow) 72%, transparent) 0 18%, transparent 24%),
    radial-gradient(circle at 50% 50%, var(--spring-center) 0 16%, transparent 18%);
  filter: blur(var(--spring-blur));
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  animation:
    season-spring-rise var(--spring-rise-duration) ease-out forwards,
    season-spring-twinkle var(--spring-twinkle-duration) ease-in-out infinite alternate;
  animation-delay: var(--spring-delay), var(--spring-delay);
}

.season-particle--spring::before,
.season-particle--spring::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 999px;
  transform: translate(-50%, -50%);
}

.season-particle--spring::before {
  width: 58%;
  height: 58%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, transparent 75%);
  opacity: 0.46;
  top: 38%;
  left: 38%;
}

.season-particle--spring::after {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, transparent 72%);
  opacity: 0.38;
}

.ramadan-scene {
  position: absolute;
  inset: 0;
  --ramadan-anchor-right: clamp(40px, 10vw, 140px);
  --ramadan-anchor-left: clamp(20px, 7vw, 92px);
  opacity: 0;
  animation: ramadan-scene-float 3s cubic-bezier(0.32, 0, 0.2, 1) forwards;
}

.ramadan-lantern {
  position: absolute;
  left: var(--ramadan-anchor-left);
  top: -3vh;
  width: clamp(120px, 18vw, 190px);
  aspect-ratio: 220 / 360;
  transform: translateX(-18%);
  transform-origin: 50% 0;
  animation: ramadan-lantern-sway 3s ease-in-out forwards;
  filter: drop-shadow(0 0 22px rgba(224, 164, 58, 0.16));
}

.ramadan-lantern__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.ramadan-ornament {
  position: absolute;
  right: var(--ramadan-anchor-right);
  top: -4vh;
  width: clamp(180px, 26vw, 300px);
  aspect-ratio: 260 / 360;
  transform: translateX(50%);
  transform-origin: 64% 0;
  animation: ramadan-ornament-sway 3s ease-in-out forwards;
  filter: drop-shadow(0 0 22px rgba(224, 164, 58, 0.16));
}

.ramadan-ornament__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

:global(body.light) .season-overlay--ramadan .season-overlay__wash,
:global(html[data-theme="light"]) .season-overlay--ramadan .season-overlay__wash {
  background:
    radial-gradient(circle at 50% 12%, rgba(251, 211, 141, 0.18), transparent 18%),
    radial-gradient(circle at 18% 24%, rgba(191, 219, 254, 0.14), transparent 24%),
    radial-gradient(circle at 80% 72%, rgba(254, 215, 170, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(255, 248, 231, 0.18), rgba(255, 255, 255, 0.04));
}

:global(body.light) .ramadan-lantern,
:global(html[data-theme="light"]) .ramadan-lantern {
  filter: drop-shadow(0 0 18px rgba(193, 136, 42, 0.14));
}

:global(body.light) .ramadan-ornament {
  filter: drop-shadow(0 0 18px rgba(193, 136, 42, 0.14));
}

.season-overlay-fade-enter-active,
.season-overlay-fade-leave-active {
  transition: opacity 0.28s ease;
}

.season-overlay-fade-enter-from,
.season-overlay-fade-leave-to {
  opacity: 0;
}

@keyframes season-summer-blow {
  0% {
    transform: translate3d(-16vw, 0, 0) rotate(var(--summer-rotate)) scaleX(var(--summer-scale));
    opacity: 0;
  }

  16% {
    opacity: 1;
  }

  100% {
    transform: translate3d(132vw, var(--summer-drift-y), 0) rotate(var(--summer-rotate)) scaleX(calc(var(--summer-scale) * 1.08));
    opacity: 0;
  }
}

@keyframes season-winter-fall {
  0% {
    transform: translate3d(0, -12vh, 0);
    opacity: 0;
  }

  15% {
    opacity: 1;
  }

  100% {
    transform: translate3d(var(--drift), 118vh, 0);
    opacity: 0;
  }
}

@keyframes season-autumn-fall {
  0% {
    transform: translate3d(0, -10vh, 0) rotate(var(--rotate-start));
    opacity: 0;
  }

  18% {
    opacity: 1;
  }

  100% {
    transform: translate3d(var(--drift), 118vh, 0) rotate(var(--rotate-end));
    opacity: 0;
  }
}

@keyframes season-spring-rise {
  0% {
    transform: translate3d(0, 10vh, 0) rotate(var(--spring-rotate-start)) scale(var(--spring-scale-start));
    opacity: 0;
  }

  24% {
    opacity: 1;
  }

  58% {
    transform: translate3d(var(--spring-drift-mid), var(--spring-rise-mid), 0) rotate(var(--spring-rotate-mid))
      scale(var(--spring-scale-mid));
  }

  100% {
    transform: translate3d(var(--drift), var(--spring-rise-end), 0) rotate(var(--spring-rotate-end))
      scale(var(--spring-scale-end));
    opacity: 0;
  }
}

@keyframes season-spring-twinkle {
  0% {
    filter: blur(var(--spring-blur)) saturate(0.96) brightness(0.96);
  }

  100% {
    filter: blur(var(--spring-blur)) saturate(1.08) brightness(1.06);
  }
}

@keyframes ramadan-scene-float {
  0% {
    transform: translateY(-18vh);
    opacity: 0;
  }

  14% {
    opacity: 1;
  }

  48% {
    transform: translateY(0.8vh);
    opacity: 1;
  }

  64% {
    transform: translateY(1.4vh);
    opacity: 1;
  }

  78% {
    transform: translateY(0.9vh);
    opacity: 1;
  }

  100% {
    transform: translateY(-14vh);
    opacity: 0;
  }
}

@keyframes ramadan-ornament-sway {
  0% {
    transform: translateX(50%) rotate(-7deg);
  }

  22% {
    transform: translateX(50%) rotate(3.8deg);
  }

  46% {
    transform: translateX(50%) rotate(-1.8deg);
  }

  70% {
    transform: translateX(50%) rotate(0.9deg);
  }

  100% {
    transform: translateX(50%) rotate(0deg);
  }
}

@keyframes ramadan-lantern-sway {
  0% {
    transform: translateX(-18%) rotate(5deg);
  }

  22% {
    transform: translateX(-18%) rotate(-2.8deg);
  }

  46% {
    transform: translateX(-18%) rotate(1.4deg);
  }

  70% {
    transform: translateX(-18%) rotate(-0.7deg);
  }

  100% {
    transform: translateX(-18%) rotate(0deg);
  }
}

@keyframes ramadan-glow {
  0% {
    opacity: 0.76;
    transform: scale(0.96);
  }

  100% {
    opacity: 1;
    transform: scale(1.03);
  }
}
</style>
