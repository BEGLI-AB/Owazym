import { computed } from "vue";
import { useLocaleStore } from "../store/locale";

export const useI18n = () => {
  const localeStore = useLocaleStore();

  const locale = computed(() => localeStore.locale);
  const setLocale = (value) => localeStore.setLocale(value);
  const t = (key) => localeStore.t(key);

  return {
    locale,
    setLocale,
    t,
  };
};

