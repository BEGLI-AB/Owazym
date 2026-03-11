<template>
  <div class="container" style="max-width: 760px;">
    <div class="card bg-dark text-white border-0 rounded-4 shadow-sm">
      <div class="card-body p-4">
        <div class="text-uppercase text-white-50 small mb-2" style="letter-spacing:.14em;">{{ t("profile") }}</div>
        <h2 class="mb-2">{{ auth.user?.name }}</h2>
        <div class="text-white-50 mb-4 text-capitalize">{{ t("plan") }}: {{ auth.user?.subscription_plan }}</div>
        <div class="d-flex gap-2">
          <router-link class="btn btn-outline-light rounded-pill px-4" to="/subscription">{{ t("subscription") }}</router-link>
          <button type="button" class="btn btn-light rounded-pill px-4 text-dark" @click="auth.logout()">{{ t("logout") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "../store/auth";
import { useI18n } from "../composables/useI18n";

const auth = useAuthStore();
const { t } = useI18n();
</script>
