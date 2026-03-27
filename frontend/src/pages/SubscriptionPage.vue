<template>
  <div class="container" style="max-width: 1080px;">
    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
    <div v-if="status" class="alert alert-success py-2">{{ status }}</div>

    <section class="rounded-4 p-4 mb-4 bg-dark border border-secondary-subtle">
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
        <div class="flex-grow-1">
          <p class="text-uppercase mb-2 text-white-50" style="letter-spacing:.14em;">{{ t("subscription") }}</p>
          <h2 class="mb-2">{{ currentMeta.planName }}</h2>
          <p class="text-white-50 mb-3" style="max-width: 720px;">{{ copy.subtitle }}</p>

          <div class="d-flex flex-wrap gap-2">
            <span class="badge rounded-pill text-bg-light text-dark px-3 py-2">
              {{ t("playlists") }}: {{ playlistUsage }}
            </span>
            <span class="badge rounded-pill border border-secondary-subtle text-white px-3 py-2">
              {{ copy.downloadsLabel }}: {{ downloadUsage }}
            </span>
            <span v-if="downloadResetLabel" class="badge rounded-pill border border-secondary-subtle text-white-50 px-3 py-2">
              {{ downloadResetLabel }}
            </span>
          </div>
        </div>

        <div class="rounded-4 px-4 py-3" style="min-width: 240px; background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);">
          <div class="text-uppercase text-white-50 small mb-2" style="letter-spacing:.14em;">{{ copy.currentPlanLabel }}</div>
          <div class="fs-4 fw-semibold">{{ currentMeta.planName }}</div>
          <div class="text-white-50 mt-2">{{ currentMeta.description }}</div>
        </div>
      </div>

      <div v-if="limitWarning" class="alert alert-warning border-0 rounded-4 mt-4 mb-0">
        {{ limitWarning }}
      </div>
    </section>

    <div class="row g-3">
      <div class="col-12 col-md-4" v-for="plan in planCards" :key="plan.id">
        <article class="card bg-dark text-white border-0 rounded-4 h-100 overflow-hidden">
          <div class="card-body p-4 d-flex flex-column h-100" :style="{ background: plan.background }">
            <div class="text-uppercase text-white-50 small mb-2">{{ plan.badge }}</div>
            <h3 class="mb-2">{{ plan.planName }}</h3>
            <p class="text-white-50 mb-4">{{ plan.description }}</p>

            <ul class="list-unstyled small text-white-50 mb-4 d-grid gap-2">
              <li v-for="feature in plan.features" :key="feature" class="d-flex align-items-start gap-2">
                <span class="text-white">-</span>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <button
              type="button"
              class="btn rounded-pill px-4 mt-auto"
              :class="data.plan === plan.id ? 'btn-light text-dark' : 'btn-outline-light'"
              :disabled="busy || data.plan === plan.id"
              @click="setPlan(plan.id)"
            >
              {{ data.plan === plan.id ? t("current_plan") : t("choose_plan") }}
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";
import { useAuthStore } from "../store/auth";

const data = ref({
  plan: "free",
  features: {
    playlist_limit: 1,
    can_download: false,
    monthly_download_limit: null,
    unlimited_downloads: false,
  },
  stats: {
    playlists_count: 0,
    playlists_left: 1,
    playlists_over_limit: false,
    downloads_used: 0,
    downloads_left: null,
    month_start: null,
    month_end: null,
  },
});
const busy = ref(false);
const status = ref("");
const error = ref("");
const auth = useAuthStore();
const { t, locale } = useI18n();

const copy = computed(() => {
  if (locale.value === "ru") {
    return {
      subtitle: "Переключайте план и сразу получайте новые лимиты по плейлистам и загрузкам.",
      currentPlanLabel: "Текущий тариф",
      downloadsLabel: "Загрузки",
      downloadsBlocked: "недоступны",
      unlimitedDownloads: "без лимита",
      unlimitedPlaylists: "без лимита",
      downloadsReset: "Сброс лимита",
      warning: (count, limit) =>
        `У вас уже ${count} плейлист(ов), а текущий тариф разрешает только ${limit}. Удалите лишние плейлисты или повысьте тариф.`,
      planNames: {
        free: "Free",
        plus: "Plus",
        premium: "Premium",
      },
      badges: {
        free: "Старт",
        plus: "Больше музыки",
        premium: "Максимум",
      },
      descriptions: {
        free: "Для прослушивания и одного личного плейлиста.",
        plus: "Для активных пользователей с плейлистами и месячными загрузками.",
        premium: "Для полного доступа без ограничений.",
      },
      features: {
        free: ["1 плейлист", "Скачивание выключено", "Подходит для обычного прослушивания"],
        plus: ["До 5 плейлистов", "До 30 скачиваний в месяц", "Лимит обновляется каждый месяц"],
        premium: ["Безлимитные плейлисты", "Безлимитные скачивания", "Полный доступ ко всем возможностям"],
      },
    };
  }

  if (locale.value === "en") {
    return {
      subtitle: "Switch plans and the new playlist and download limits apply right away.",
      currentPlanLabel: "Current plan",
      downloadsLabel: "Downloads",
      downloadsBlocked: "blocked",
      unlimitedDownloads: "unlimited",
      unlimitedPlaylists: "unlimited",
      downloadsReset: "Limit resets",
      warning: (count, limit) =>
        `You already have ${count} playlists, but this plan allows only ${limit}. Delete extra playlists or upgrade your plan.`,
      planNames: {
        free: "Free",
        plus: "Plus",
        premium: "Premium",
      },
      badges: {
        free: "Starter",
        plus: "More Music",
        premium: "Unlimited",
      },
      descriptions: {
        free: "For listening and keeping one personal playlist.",
        plus: "For active listeners who want playlists and monthly downloads.",
        premium: "For full access without limits.",
      },
      features: {
        free: ["1 playlist", "Downloads disabled", "Good for streaming only"],
        plus: ["Up to 5 playlists", "Up to 30 downloads per month", "Monthly limit resets automatically"],
        premium: ["Unlimited playlists", "Unlimited downloads", "Full access to all features"],
      },
    };
  }

  return {
    subtitle: "Plany calyshyp, pleylist we yukleme limitleri dessine uytgeyar.",
    currentPlanLabel: "Hazirki plan",
    downloadsLabel: "Yuklemeler",
    downloadsBlocked: "yapyly",
    unlimitedDownloads: "limitsiz",
    unlimitedPlaylists: "limitsiz",
    downloadsReset: "Limit tazelenyar",
    warning: (count, limit) =>
      `Hazir sizde ${count} pleylist bar, emma bu plan diyne ${limit} pleylist rugsat beryar. Artigini pozuň ya-da plany yokarlandyryň.`,
    planNames: {
      free: "Free",
      plus: "Plus",
      premium: "Premium",
    },
    badges: {
      free: "Starter",
      plus: "Kop musyka",
      premium: "Unlimited",
    },
    descriptions: {
      free: "Diňlemek we bir sany şahsy pleylist uc in.",
      plus: "Pleylist we aylyk yukleme isleyaňler uc in.",
      premium: "Caksyz giris we doly elyetirlik.",
    },
    features: {
      free: ["1 pleylist", "Yukleme yapyk", "Diýňe diňlemek uc in amatly"],
      plus: ["5 pleyliste çenli", "Ayda 30 yukleme çenli", "Limit her ay tazelenyar"],
      premium: ["Limitsiz pleylist", "Limitsiz yukleme", "Hemmelere doly elyetirlik"],
    },
  };
});

const planCards = computed(() => [
  {
    id: "free",
    planName: copy.value.planNames.free,
    badge: copy.value.badges.free,
    description: copy.value.descriptions.free,
    features: copy.value.features.free,
    background: "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01))",
  },
  {
    id: "plus",
    planName: copy.value.planNames.plus,
    badge: copy.value.badges.plus,
    description: copy.value.descriptions.plus,
    features: copy.value.features.plus,
    background: "linear-gradient(180deg, rgba(8,92,82,.32), rgba(255,255,255,.02))",
  },
  {
    id: "premium",
    planName: copy.value.planNames.premium,
    badge: copy.value.badges.premium,
    description: copy.value.descriptions.premium,
    features: copy.value.features.premium,
    background: "linear-gradient(180deg, rgba(138,89,21,.32), rgba(255,255,255,.02))",
  },
]);

const currentMeta = computed(
  () => planCards.value.find((plan) => plan.id === data.value.plan) || planCards.value[0],
);

const playlistUsage = computed(() => {
  const limit = data.value.features?.playlist_limit;
  const count = Number(data.value.stats?.playlists_count || 0);
  return limit == null ? `${count} / ${copy.value.unlimitedPlaylists}` : `${count} / ${limit}`;
});

const downloadUsage = computed(() => {
  if (!data.value.features?.can_download) return copy.value.downloadsBlocked;
  if (data.value.features?.unlimited_downloads) return copy.value.unlimitedDownloads;

  const used = Number(data.value.stats?.downloads_used || 0);
  const limit = Number(data.value.features?.monthly_download_limit || 0);
  return `${used} / ${limit}`;
});

const downloadResetLabel = computed(() => {
  if (!data.value.stats?.month_end || data.value.features?.unlimited_downloads || !data.value.features?.can_download) {
    return "";
  }
  return `${copy.value.downloadsReset}: ${data.value.stats.month_end}`;
});

const limitWarning = computed(() => {
  const limit = data.value.features?.playlist_limit;
  const count = Number(data.value.stats?.playlists_count || 0);
  if (limit == null || !data.value.stats?.playlists_over_limit) return "";
  return copy.value.warning(count, limit);
});

const load = async () => {
  error.value = "";
  try {
    data.value = await libraryService.getSubscription();
  } catch (e) {
    error.value = e.message || t("failed_load_subscription");
  }
};

const setPlan = async (plan) => {
  if (!plan || data.value.plan === plan) return;
  busy.value = true;
  error.value = "";
  status.value = "";
  try {
    data.value = await libraryService.updateSubscription(plan);
    await auth.fetchMe();
    status.value = t("subscription_updated");
  } catch (e) {
    error.value = e.message || t("failed_update_subscription");
  } finally {
    busy.value = false;
  }
};

onMounted(load);
</script>
