import { defineStore } from "pinia";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, messages } from "../i18n/messages";

const LOCALE_KEY = "locale";

const normalizeLocale = (value) => {
  const normalized = String(value || "").toLowerCase().trim();
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
};

const readLocale = () => normalizeLocale(localStorage.getItem(LOCALE_KEY) || DEFAULT_LOCALE);

const replaceMany = (value, replacements) =>
  replacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), value);

const TM_REPLACEMENTS = [
  [/\bYureginizde\b/g, "\u00DD\u00FCregi\u0148izde"],
  [/\byureginizde\b/g, "\u00FD\u00FCregi\u0148izde"],
  [/\bpikirinizde\b/g, "pikiri\u0148izde"],
  [/\bBugun\b/g, "Bug\u00FCn"],
  [/\bbugun\b/g, "bug\u00FCn"],
  [/\bGundiz\b/g, "G\u00FCndiz"],
  [/\bgundiz\b/g, "g\u00FCndiz"],
  [/\bGunun\b/g, "G\u00FCn\u00FC\u0148"],
  [/\bgunun\b/g, "g\u00FCn\u00FC\u0148"],
  [/\bYuklenyar\b/g, "\u00DD\u00FCklen\u00FD\u00E4r"],
  [/\byuklenyar\b/g, "\u00FD\u00FCklen\u00FD\u00E4r"],
  [/\bYuklenenler\b/g, "\u00DD\u00FCklenenler"],
  [/\byuklenenler\b/g, "\u00FD\u00FCklenenler"],
  [/\bYuklenmedi\b/g, "\u00DD\u00FCklenmedi"],
  [/\byuklenmedi\b/g, "\u00FD\u00FCklenmedi"],
  [/\bYuklemek\b/g, "\u00DD\u00FCklemek"],
  [/\byuklemek\b/g, "\u00FD\u00FCklemek"],
  [/\bYukleme\b/g, "\u00DD\u00FCkleme"],
  [/\byukleme\b/g, "\u00FD\u00FCkleme"],
  [/\bYukle\b/g, "\u00DD\u00FCkle"],
  [/\byukle\b/g, "\u00FD\u00FCkle"],
  [/\bTazelikler\b/g, "T\u00E4zelikler"],
  [/\btazelikler\b/g, "t\u00E4zelikler"],
  [/\bTaze\b/g, "T\u00E4ze"],
  [/\btaze\b/g, "t\u00E4ze"],
  [/\bGozlegden\b/g, "G\u00F6zlegden"],
  [/\bgozlegden\b/g, "g\u00F6zlegden"],
  [/\bGozleg\b/g, "G\u00F6zleg"],
  [/\bgozleg\b/g, "g\u00F6zleg"],
  [/\bGorkez\b/g, "G\u00F6rkez"],
  [/\bgorkez\b/g, "g\u00F6rkez"],
  [/\bGorunyar\b/g, "G\u00F6r\u00FCn\u00FD\u00E4r"],
  [/\bgorunyar\b/g, "g\u00F6r\u00FCn\u00FD\u00E4r"],
  [/\bGorundy\b/g, "G\u00F6r\u00FCndi"],
  [/\bgorundy\b/g, "g\u00F6r\u00FCndi"],
  [/\bDore/g, "D\u00F6re"],
  [/\bdore/g, "d\u00F6re"],
  [/\bOzuni\b/g, "\u00D6z\u00FCni"],
  [/\bozuni\b/g, "\u00F6z\u00FCni"],
  [/\bMening\b/g, "Meni\u0148"],
  [/\bmening\b/g, "meni\u0148"],
  [/\bHasabyn\b/g, "Hasaby\u0148"],
  [/\bhasabyn\b/g, "hasaby\u0148"],
  [/\bagsamynyz\b/g, "ag\u015Famy\u0148yz"],
  [/\bYagday\b/g, "\u00DDagda\u00FD"],
  [/\byagday\b/g, "\u00FDagda\u00FD"],
  [/\bYyl\b/g, "\u00DDyl"],
  [/\byyl\b/g, "\u00FDyl"],
  [/\bYokardaky\b/g, "\u00DDokardaky"],
  [/\byokardaky\b/g, "\u00FDokardaky"],
  [/\bYok\b/g, "\u00DDok"],
  [/\byok\b/g, "\u00FDok"],
  [/\bYap\b/g, "\u00DDap"],
  [/\byap\b/g, "\u00FDap"],
  [/\bYurtlar\b/g, "\u00DDurtlar"],
  [/\byurtlar\b/g, "\u00FDurtlar"],
  [/\bAydym/g, "A\u00FDdym"],
  [/\baydym/g, "a\u00FDdym"],
  [/\bAyyr/g, "A\u00FDyr"],
  [/\bayyr/g, "a\u00FDyr"],
  [/\bAyy/g, "A\u00FDy"],
  [/\bayy/g, "a\u00FDy"],
  [/\bSayla\b/g, "Sa\u00FDla"],
  [/\bsayla\b/g, "sa\u00FDla"],
  [/\bBeylekiler\b/g, "Be\u00FDlekiler"],
  [/\bbeylekiler\b/g, "be\u00FDlekiler"],
  [/\bBoyuncha\b/g, "Bo\u00FDun\u00E7a"],
  [/\bboyuncha\b/g, "bo\u00FDun\u00E7a"],
  [/\bBeyany\b/g, "Be\u00FDany"],
  [/\bbeyany\b/g, "be\u00FDany"],
  [/\bBeyan\b/g, "Be\u00FDan"],
  [/\bbeyan\b/g, "be\u00FDan"],
  [/\bPley/g, "Ple\u00FD"],
  [/\bpley/g, "ple\u00FD"],
  [/\bGos\b/g, "Go\u015F"],
  [/\bgos\b/g, "go\u015F"],
  [/\bCyk\b/g, "\u00C7yk"],
  [/\bcyk\b/g, "\u00E7yk"],
  [/\bAc\b/g, "A\u00E7"],
  [/\bac\b/g, "a\u00E7"],
  [/\bIsler\b/g, "I\u015Fler"],
  [/\bisler\b/g, "i\u015Fler"],
  [/\bcalysh\b/g, "\u00E7aly\u015F"],
  [/\bgecir\b/g, "ge\u00E7ir"],
  [/\bya\b/g, "\u00FDa"],
  [/\bYa\b/g, "\u00DDa"],
  [/ZH/g, "\u017D"],
  [/Zh/g, "\u017D"],
  [/zh/g, "\u017E"],
  [/SH/g, "\u015E"],
  [/Sh/g, "\u015E"],
  [/sh/g, "\u015F"],
  [/Cy/g, "\u00C7y"],
  [/cy/g, "\u00E7y"],
];

export const normalizeTmText = (value) => {
  if (typeof value !== "string") return value;
  return replaceMany(value, TM_REPLACEMENTS);
};

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
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        const value = current[key];
        return this.locale === "tm" ? normalizeTmText(value) : value;
      }
      if (Object.prototype.hasOwnProperty.call(fallback, key)) return fallback[key];
      return key;
    },
    wishes() {
      const locale = this.locale;
      if (locale === "ru") {
        return [
          "\u041F\u0443\u0441\u0442\u044C \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u0432\u0441\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0441\u044F \u043B\u0435\u0433\u043A\u043E.",
          "\u0421\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u044F \u0432 \u0441\u0435\u0440\u0434\u0446\u0435 \u0438 \u044F\u0441\u043D\u043E\u0441\u0442\u0438 \u0432 \u043C\u044B\u0441\u043B\u044F\u0445.",
          "\u041F\u0443\u0441\u0442\u044C \u0434\u0435\u043D\u044C \u043F\u0440\u0438\u043D\u0435\u0441\u0435\u0442 \u0445\u043E\u0440\u043E\u0448\u0438\u0435 \u043D\u043E\u0432\u043E\u0441\u0442\u0438.",
          "\u041F\u0443\u0441\u0442\u044C \u0440\u0430\u0431\u043E\u0442\u0430 \u0438\u0434\u0435\u0442 \u0433\u043B\u0430\u0434\u043A\u043E, \u0430 \u0432\u0435\u0447\u0435\u0440 \u0431\u0443\u0434\u0435\u0442 \u0442\u0435\u043F\u043B\u044B\u043C.",
          "\u0411\u0435\u0440\u0435\u0433\u0438 \u0441\u0435\u0431\u044F, \u0442\u044B \u0432\u0430\u0436\u043D\u0435\u0435 \u043B\u044E\u0431\u044B\u0445 \u0437\u0430\u0434\u0430\u0447.",
          "\u041F\u0443\u0441\u0442\u044C \u0443\u0434\u0430\u0447\u0430 \u0431\u0443\u0434\u0435\u0442 \u0440\u044F\u0434\u043E\u043C \u0432\u043E \u0432\u0441\u0435\u0445 \u043C\u0435\u043B\u043E\u0447\u0430\u0445.",
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
      ].map(normalizeTmText);
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
