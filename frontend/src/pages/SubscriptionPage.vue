<template>
  <div class="container" style="max-width: 1080px;">
    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
    <div v-if="status" class="alert alert-success py-2">{{ status }}</div>

    <section class="rounded-4 p-4 mb-4 bg-dark border border-secondary-subtle">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <p class="text-uppercase mb-2 text-white-50" style="letter-spacing:.14em;">{{ t("subscription") }}</p>
          <h2 class="mb-2 text-capitalize">{{ data.plan || "free" }}</h2>
          <div class="text-white-50">
            {{ t("playlists") }}: {{ data.stats?.playlists_count ?? 0 }}
            <span class="mx-2">&middot;</span>
            {{ t("downloads_used") }}: {{ data.stats?.downloads_used ?? 0 }}
          </div>
        </div>
      </div>
    </section>

    <div class="row g-3">
      <div class="col-12 col-md-4" v-for="plan in plans" :key="plan.id">
        <article class="card bg-dark text-white border-0 rounded-4 h-100">
          <div class="card-body p-4">
            <div class="text-uppercase text-white-50 small mb-2">{{ t(plan.badge) }}</div>
            <h3 class="mb-2 text-capitalize">{{ plan.id }}</h3>
            <p class="text-white-50">{{ t(plan.description) }}</p>
            <button
              type="button"
              class="btn rounded-pill px-4"
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
import { onMounted, ref } from "vue";
import { libraryService } from "../services/libraryService";
import { useI18n } from "../composables/useI18n";
import { useAuthStore } from "../store/auth";

const data = ref({});
const busy = ref(false);
const status = ref("");
const error = ref("");
const auth = useAuthStore();
const { t } = useI18n();
const plans = [
  { id: "free", badge: "starter", description: "plan_desc_free" },
  { id: "plus", badge: "balanced", description: "plan_desc_plus" },
  { id: "premium", badge: "unlimited", description: "plan_desc_premium" },
];

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
