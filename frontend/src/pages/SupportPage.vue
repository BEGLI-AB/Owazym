<template>
  <section class="support-page">
    <div v-if="error" class="alert alert-danger py-2 mb-0">{{ error }}</div>
    <div v-if="status" class="alert alert-success py-2 mb-0">{{ status }}</div>

    <section class="support-hero">
      <div class="support-eyebrow">{{ t("support") }}</div>
      <h1 class="support-title">{{ copy.title }}</h1>
      <p class="support-subtitle">{{ copy.subtitle }}</p>
    </section>

    <section class="support-form-card">
      <form class="row g-3" @submit.prevent="submitSupport">
        <div class="col-12">
          <label class="form-label support-label" for="supportMessage">{{ copy.messageLabel }}</label>
          <textarea
            id="supportMessage"
            v-model="form.message"
            class="form-control support-input support-textarea"
            :placeholder="copy.messagePlaceholder"
            rows="8"
            maxlength="5000"
          ></textarea>
        </div>

        <div class="col-12 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div class="support-submit-note">{{ copy.footerNote }}</div>

          <button type="submit" class="btn btn-light text-dark rounded-pill px-4 support-submit" :disabled="busy">
            <span v-if="busy">{{ copy.sending }}</span>
            <span v-else>{{ copy.send }}</span>
          </button>
        </div>
      </form>
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "../composables/useI18n";
import { libraryService } from "../services/libraryService";

const { locale, t } = useI18n();

const busy = ref(false);
const error = ref("");
const status = ref("");
const form = ref({
  message: "",
});

const translations = {
  tm: {
    title: "Yazyn haysy aydymy isleyaniniz, biz gosarys",
    subtitle: "Aydymyn adyny, aytujysyny ya-da albumyny yazyn. Bize gerekli zatlar dusunarli bolsa, gosmaga synanysharys.",
    messageLabel: "Haysy aydym gerek",
    messagePlaceholder: "Mesela: artist, track ya-da album adyny yazyn...",
    footerNote: "Isleginiz admin inbox-a duser.",
    send: "Ugrat",
    sending: "Ugradylyar...",
    success: "Isleginiz ugradyldy.",
    failure: "Habary ugratmak basartmady.",
    messageRequired: "Haysy aydym gerekdigini yazyn.",
    messageDigitsOnly: "Habarda diyne san bolmaly dal.",
  },
  ru: {
    title: "\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435, \u043a\u0430\u043a\u0443\u044e \u043c\u0443\u0437\u044b\u043a\u0443 \u0445\u043e\u0442\u0438\u0442\u0435, \u043c\u044b \u0434\u043e\u0431\u0430\u0432\u0438\u043c",
    subtitle: "\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0442\u0440\u0435\u043a\u0430, \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f \u0438\u043b\u0438 \u0430\u043b\u044c\u0431\u043e\u043c\u0430. \u0415\u0441\u043b\u0438 \u0441\u043c\u043e\u0436\u0435\u043c, \u0434\u043e\u0431\u0430\u0432\u0438\u043c \u044d\u0442\u043e \u0432 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435.",
    messageLabel: "\u041a\u0430\u043a\u0443\u044e \u043c\u0443\u0437\u044b\u043a\u0443 \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c",
    messagePlaceholder: "\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0442\u0440\u0435\u043a\u0430, \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c \u0438\u043b\u0438 \u0430\u043b\u044c\u0431\u043e\u043c...",
    footerNote: "\u0412\u0430\u0448 \u0437\u0430\u043f\u0440\u043e\u0441 \u0441\u0440\u0430\u0437\u0443 \u043f\u043e\u043f\u0430\u0434\u0451\u0442 \u0432 admin inbox.",
    send: "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c",
    sending: "\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430...",
    success: "\u0417\u0430\u043f\u0440\u043e\u0441 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d.",
    failure: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435.",
    messageRequired: "\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435, \u043a\u0430\u043a\u0443\u044e \u043c\u0443\u0437\u044b\u043a\u0443 \u0432\u044b \u0445\u043e\u0442\u0438\u0442\u0435.",
    messageDigitsOnly: "\u041d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435, \u0433\u0434\u0435 \u0442\u043e\u043b\u044c\u043a\u043e \u0446\u0438\u0444\u0440\u044b.",
  },
  en: {
    title: "Write what music you want and we will add it",
    subtitle: "Send the track, artist, or album name you want to hear. If we can, we will add it to the app.",
    messageLabel: "What music should we add",
    messagePlaceholder: "For example: track title, artist, or album...",
    footerNote: "Your request goes straight to the admin inbox.",
    send: "Send message",
    sending: "Sending...",
    success: "Request sent.",
    failure: "Failed to send the message.",
    messageRequired: "Please write what music you want.",
    messageDigitsOnly: "Message cannot contain only digits.",
  },
};

const copy = computed(() => translations[locale.value] || translations.en);

const submitSupport = async () => {
  error.value = "";
  status.value = "";

  const payload = {
    message: String(form.value.message || "").trim(),
  };

  if (!payload.message) {
    error.value = copy.value.messageRequired;
    return;
  }
  if (/^[\d\s]+$/.test(payload.message)) {
    error.value = copy.value.messageDigitsOnly;
    return;
  }

  busy.value = true;

  try {
    await libraryService.submitSupport(payload);
    status.value = copy.value.success;
    form.value = {
      message: "",
    };
  } catch (requestError) {
    error.value = requestError.message || copy.value.failure;
  } finally {
    busy.value = false;
  }
};
</script>

<style scoped>
.support-page {
  width: 100%;
  max-width: 880px;
  display: grid;
  gap: 1rem;
}

.support-hero,
.support-form-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(12, 16, 26, 0.72);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
}

.support-hero {
  padding: 1.5rem;
  border-radius: 28px;
}

.support-form-card {
  padding: 1.5rem;
  border-radius: 28px;
}

.support-eyebrow {
  margin-bottom: 0.55rem;
  color: rgba(255, 255, 255, 0.62);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.8rem;
}

.support-title {
  margin: 0 0 0.7rem;
  font-size: clamp(1.85rem, 3vw, 2.8rem);
  line-height: 1.1;
}

.support-subtitle {
  max-width: 720px;
  margin: 0;
  color: rgba(255, 255, 255, 0.74);
}

.support-submit-note {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.92rem;
}

.support-label {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.support-input {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
  padding: 0.85rem 1rem;
}

.support-input:focus {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  border-color: rgba(96, 165, 250, 0.6);
  box-shadow: 0 0 0 0.2rem rgba(96, 165, 250, 0.16);
}

.support-input::placeholder {
  color: rgba(255, 255, 255, 0.42);
}

.support-textarea {
  min-height: 220px;
  resize: vertical;
}

.support-submit {
  min-width: 180px;
  font-weight: 700;
}

:global(body.light) .support-hero,
:global(body.light) .support-form-card,
:global(html[data-theme="light"]) .support-hero,
:global(html[data-theme="light"]) .support-form-card {
  border-color: rgba(15, 23, 42, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

:global(body.light) .support-page,
:global(html[data-theme="light"]) .support-page,
:global(body.light) .support-title,
:global(html[data-theme="light"]) .support-title,
:global(body.light) .support-label,
:global(html[data-theme="light"]) .support-label {
  color: #0f172a;
}

:global(body.light) .support-eyebrow,
:global(body.light) .support-subtitle,
:global(body.light) .support-submit-note,
:global(html[data-theme="light"]) .support-eyebrow,
:global(html[data-theme="light"]) .support-subtitle,
:global(html[data-theme="light"]) .support-submit-note {
  color: #64748b;
}

:global(body.light) .support-input,
:global(html[data-theme="light"]) .support-input {
  border-color: rgba(15, 23, 42, 0.1);
  background: rgba(15, 23, 42, 0.03);
  color: #0f172a;
}

:global(body.light) .support-input:focus,
:global(html[data-theme="light"]) .support-input:focus {
  background: rgba(15, 23, 42, 0.04);
  color: #0f172a;
}

:global(body.light) .support-input::placeholder,
:global(html[data-theme="light"]) .support-input::placeholder {
  color: #94a3b8;
}

@media (max-width: 575.98px) {
  .support-page {
    gap: 0.85rem;
  }

  .support-hero,
  .support-form-card {
    padding: 1rem;
    border-radius: 22px;
  }

  .support-submit {
    width: 100%;
  }
}
</style>
