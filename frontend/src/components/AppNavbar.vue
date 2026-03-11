<template>
  <nav class="navbar nav-fixed navbar-dark sticky-top topbar">
    <div class="container-fluid d-flex align-items-center">
      <div class="me-2 d-lg-none">
        <label class="theme-icon-toggle" title="Theme">
          <input id="themeToggleMobileTop" type="checkbox" aria-label="Toggle theme" />
          <span class="theme-icon">
            <i class="bi bi-sun-fill theme-icon-sun"></i>
            <i class="bi bi-moon-stars-fill theme-icon-moon"></i>
          </span>
        </label>
      </div>

      <a id="NAME" class="text-light navbar-brand brand fw-light me-2 offcanvas-title brand p-0" href="/#home" style="font-size: 34px;">
        OWAZYM
      </a>

      <div class="mx-auto text-center">
        <span class="wish-pill text-white-50 small" id="dailyWish">{{ t("daily_wish") }}</span>
      </div>

      <div
        id="topRightAuth"
        class="d-flex gap-2 align-items-center ms-2"
        :data-first-name="firstName"
        :data-plan="plan"
        :data-csrf-token="csrfToken"
      ></div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../store/auth";
import { useI18n } from "../composables/useI18n";

const auth = useAuthStore();
const { t } = useI18n();

const firstName = computed(() => String(auth.user?.name || "Guest"));
const plan = computed(() => String(auth.user?.subscription_plan || (auth.user?.subscribes ? "premium" : "free") || "free").toLowerCase());
const csrfToken = computed(() => "");
</script>
