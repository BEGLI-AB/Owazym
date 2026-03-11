import { defineStore } from "pinia";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, messages } from "../i18n/messages";

const LOCALE_KEY = "locale";

const normalizeLocale = (value) => {
  const normalized = String(value || "").toLowerCase().trim();
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
};

const readLocale = () => normalizeLocale(localStorage.getItem(LOCALE_KEY) || DEFAULT_LOCALE);

export const useLocaleStore = defineStore("locale", {
  state: () => ({
    locale: readLocale(),
  }),
  actions: {
    bootstrap() {
      this.setLocale(readLocale(), { silent: true });
    },
    setLocale(locale, options = {}) {
      const next = normalizeLocale(locale);
      this.locale = next;
      localStorage.setItem(LOCALE_KEY, next);
      document.documentElement.setAttribute("lang", next);
      if (!options.silent) {
        window.dispatchEvent(new CustomEvent("owazym:locale-changed", { detail: next }));
      }
    },
    t(key) {
      const current = messages[this.locale] || messages[DEFAULT_LOCALE];
      const fallback = messages.en || {};
      if (Object.prototype.hasOwnProperty.call(current, key)) return current[key];
      if (Object.prototype.hasOwnProperty.call(fallback, key)) return fallback[key];
      return key;
    },
    wishes() {
      const locale = this.locale;
      if (locale === "ru") {
        return [
          "Пусть сегодня все получится легко.",
          "Спокойствия в сердце и ясности в мыслях.",
          "Пусть день принесет хорошие новости.",
          "Пусть работа идет гладко, а вечер будет теплым.",
          "Береги себя, ты важнее любых задач.",
          "Пусть удача будет рядом во всех мелочах.",
        ];
      }
      if (locale === "en") {
        return [
          "May everything go smoothly today.",
          "Peace in your heart and clarity in your thoughts.",
          "Let the day bring good news.",
          "May work flow easily and the evening be warm.",
          "Take care of yourself, you matter more than any task.",
          "May luck be with you in every little thing.",
        ];
      }
      return [
        "Bugun hemme zat yonsay gitsin.",
        "Yureginizde rahatlyk, pikirinizde anyklyk bolsun.",
        "Bugun gowy habarlar getirsin.",
        "Isler yonsay bolsun, agsamynyz yly bolsun.",
        "Ozuni ayan, sen her bir isden gymmat.",
        "Heryerde bagt hemra bolsun.",
      ];
    },
    legacyI18nData() {
      return {
        profile: this.t("profile"),
        subscription: this.t("subscription"),
        logout: this.t("logout"),
        menu: "Menu",
        register: this.t("register"),
        login: this.t("login"),
        user_fallback: "User",
      };
    },
  },
});

