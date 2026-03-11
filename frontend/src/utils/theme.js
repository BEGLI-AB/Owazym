const THEME_KEY = "theme";

const normalizeTheme = (value) => (String(value || "").toLowerCase().trim() === "light" ? "light" : "dark");

export const readTheme = () => {
  try {
    return normalizeTheme(localStorage.getItem(THEME_KEY) || "dark");
  } catch (_error) {
    return "dark";
  }
};

export const applyTheme = (theme) => {
  const normalized = normalizeTheme(theme);
  const isLight = normalized === "light";

  document.body.classList.toggle("light", isLight);
  document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
  document.documentElement.style.colorScheme = isLight ? "light" : "dark";
  document.body.style.colorScheme = isLight ? "light" : "dark";

  const bodyBg = isLight
    ? "linear-gradient(180deg, #f7f8fc 0%, #f2f4fb 100%)"
    : "linear-gradient(180deg, #040507 0%, #050608 55%, #050608 100%)";
  const contentBg = isLight
    ? "radial-gradient(1200px 460px at 62% 78%, rgba(176, 86, 155, 0.14), transparent 74%), linear-gradient(180deg, #f7f8fc 0%, #f2f4fb 100%)"
    : "radial-gradient(1200px 460px at 62% 78%, rgba(158, 32, 112, 0.22), transparent 72%), linear-gradient(180deg, #040507 0%, #050608 55%, #050608 100%)";

  document.body.style.background = bodyBg;
  document.querySelectorAll(".app-content").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.style.background = contentBg;
  });

  try {
    localStorage.setItem(THEME_KEY, normalized);
  } catch (_error) {}

  window.dispatchEvent(
    new CustomEvent("owazym:theme-changed", {
      detail: { theme: normalized, isLight },
    }),
  );

  return normalized;
};

export const toggleTheme = () => applyTheme(document.body.classList.contains("light") ? "dark" : "light");
