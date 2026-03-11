<template>
  <div class="font-Ambassador d-flex align-items-center justify-content-center min-vh-100">
    <div class="auth-lang-toggle" role="group" :aria-label="t('language')">
      <button type="button" class="btn btn-sm" :class="locale === 'tm' ? 'btn-light text-dark' : 'btn-outline-light'" @click="setLocale('tm')">TM</button>
      <button type="button" class="btn btn-sm" :class="locale === 'ru' ? 'btn-light text-dark' : 'btn-outline-light'" @click="setLocale('ru')">RU</button>
      <button type="button" class="btn btn-sm" :class="locale === 'en' ? 'btn-light text-dark' : 'btn-outline-light'" @click="setLocale('en')">EN</button>
    </div>
    <button type="button" class="auth-theme-toggle" :aria-label="t('toggle_theme')" @click="toggleTheme">
      <i class="bi bi-circle-half"></i>
      <span>{{ themeLabel }}</span>
    </button>
    <div class="card bg-dark text-white shadow auth-card" style="max-width:420px;width:100%;border-radius:16px;">
      <div class="card-body p-4">
        <h3 class="mb-2">{{ t("register") }}</h3>
        <p class="text-white-50 mb-4">{{ t("welcome_register") }}</p>
        <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
        <form @submit.prevent="submit">
          <div class="mb-3">
            <label class="form-label">{{ t("username") }}</label>
            <input v-model="name" type="text" class="form-control auth-input" required autocomplete="username" />
          </div>
          <div class="mb-3">
            <label class="form-label">{{ t("password") }}</label>
            <input v-model="password" type="password" class="form-control auth-input" required autocomplete="new-password" />
          </div>
          <div class="mb-3">
            <label class="form-label">{{ t("confirm_password") }}</label>
            <input v-model="confirmPassword" type="password" class="form-control auth-input" required autocomplete="new-password" />
          </div>
          <button :disabled="loading" type="submit" class="btn btn-danger w-100">{{ loading ? t("loading") : t("register") }}</button>
        </form>
        <div class="text-center mt-3">
          <router-link class="text-white-50" to="/login">{{ t("already_have_account_login") }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { useI18n } from "../composables/useI18n";
import { applyTheme, readTheme, toggleTheme as toggleAppTheme } from "../utils/theme";

const router = useRouter();
const auth = useAuthStore();
const i18n = useI18n();
const { t } = i18n;
const locale = computed(() => i18n.locale.value);
const setLocale = (value) => i18n.setLocale(value);
const name = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const loading = ref(false);
const themeLabel = ref("");
let authInputObserver = null;

const updateThemeLabel = (theme) => {
  themeLabel.value = theme === "light" ? t("day_mode") : t("night_mode");
};

const applyCurrentTheme = () => {
  updateThemeLabel(applyTheme(readTheme()));
};

const toggleTheme = () => {
  updateThemeLabel(toggleAppTheme());
};

const forceAuthInputStyle = (input) => {
  if (!(input instanceof HTMLElement)) return;
  input.style.setProperty("background", "#ffffff", "important");
  input.style.setProperty("color", "#111827", "important");
  input.style.setProperty("-webkit-text-fill-color", "#111827", "important");
  input.style.setProperty("caret-color", "#111827", "important");
  input.style.setProperty("text-shadow", "0 0 0 #111827", "important");
  input.style.setProperty("font-family", "Arial,Helvetica,sans-serif", "important");
};

const bindAuthInputFixes = () => {
  document.querySelectorAll(".auth-card .auth-input").forEach((input) => {
    forceAuthInputStyle(input);
    if (input.dataset.authFixBound === "1") return;
    input.dataset.authFixBound = "1";
    const apply = () => forceAuthInputStyle(input);
    input.addEventListener("focus", apply);
    input.addEventListener("input", apply);
    input.addEventListener("change", apply);
    input.addEventListener("blur", apply);
    input.addEventListener("animationstart", apply);
  });
};

const submit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = t("passwords_do_not_match");
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    await auth.register({ name: name.value, password: password.value });
    await router.push("/");
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  applyCurrentTheme();
  bindAuthInputFixes();
  authInputObserver = new MutationObserver(() => {
    bindAuthInputFixes();
  });
  authInputObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
});

watch(
  () => locale.value,
  () => {
    applyCurrentTheme();
  },
);

onBeforeUnmount(() => {
  if (authInputObserver) {
    authInputObserver.disconnect();
    authInputObserver = null;
  }
});
</script>
