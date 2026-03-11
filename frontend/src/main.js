import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/styles.css";
import { useAuthStore } from "./store/auth";
import { useLocaleStore } from "./store/locale";
import { applyTheme, readTheme } from "./utils/theme";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const auth = useAuthStore();
auth.bootstrap();
const locale = useLocaleStore();
locale.bootstrap();
applyTheme(readTheme());

const SPA_PATHS = new Set([
  "/",
  "/album",
  "/artists",
  "/musics",
  "/home-banner/create",
  "/create",
  "/search",
  "/playlist",
  "/subscription",
  "/profile",
  "/login",
  "/register",
]);

const isSpaPath = (pathname) => {
  if (SPA_PATHS.has(pathname)) return true;
  if (/^\/artist\/\d+$/.test(pathname)) return true;
  return false;
};

const isSpaUrl = (url) => isSpaPath(url.pathname);

const normalizeTarget = (target) => {
  let url;
  try {
    url = new URL(target, window.location.origin);
  } catch (_error) {
    return null;
  }

  if (url.origin !== window.location.origin) return null;
  if (!isSpaUrl(url)) return null;

  if (url.hash === "#album" && url.pathname === "/") {
    return `/album${url.search}`;
  }
  if (url.hash === "#home" && (url.pathname === "/" || url.pathname === "/album")) {
    return `/${url.search}`;
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

window.__owazymNavigate = (target) => {
  const normalized = normalizeTarget(target);
  if (!normalized) {
    window.location.href = target;
    return Promise.resolve();
  }
  return router.push(normalized);
};

if (window.OwazymCommon?.setNavigateHandler) {
  window.OwazymCommon.setNavigateHandler((target) => window.__owazymNavigate(target));
}

const PENDING_TRACK_KEY = "owazym_pending_track_v1";

const handleSpaLinkEvent = (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest("a[href]");
  if (!link) return;
  if (event.defaultPrevented) return;
  if ("button" in event && event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target && link.target !== "_self") return;
  if (link.hasAttribute("download")) return;
  if (link.getAttribute("data-bs-toggle")) return;

  const href = link.getAttribute("href") || "";
  if (!href || href.startsWith("javascript:")) return;
  if (href.startsWith("#")) return;
  if (href.startsWith("/locale/")) return;
  if (href === "/logout" || href.startsWith("/logout?")) return;

  let parsed;
  try {
    parsed = new URL(href, window.location.origin);
  } catch (_error) {
    return;
  }
  if (parsed.origin !== window.location.origin) return;
  if (!isSpaUrl(parsed)) return;

  const normalized = normalizeTarget(parsed.toString());
  if (!normalized) return;

  const musicId = Number(link.dataset.musicId || 0);
  if (musicId > 0) {
    const payload = {
      musicId: String(musicId),
      audioUrl: link.dataset.audioUrl || "",
      title: link.dataset.title || "",
      artist: link.dataset.artist || "",
      coverUrl: link.dataset.coverUrl || "",
    };
    sessionStorage.setItem(PENDING_TRACK_KEY, JSON.stringify(payload));
  }

  event.preventDefault();
  window.__owazymNavigate(normalized).catch(() => {
    window.location.href = href;
  });
};

document.addEventListener("click", handleSpaLinkEvent);
document.addEventListener("pointerup", (event) => {
  if (event.pointerType !== "touch") return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest("a[href]");
  if (!link) return;
  if (!link.closest(".mobile-bottom-nav")) return;
  handleSpaLinkEvent(event);
});

router.afterEach((to) => {
  const hash = to.path === "/album" ? "#album" : "#home";
  if (window.location.hash !== hash && (to.path === "/" || to.path === "/album")) {
    history.replaceState(history.state, "", `${window.location.pathname}${window.location.search}${hash}`);
  }

  if (window.OwazymCommon?.updatePathActiveLinks) {
    window.OwazymCommon.updatePathActiveLinks();
  }
  if (window.OwazymCommon?.setActiveByHash) {
    window.OwazymCommon.setActiveByHash();
  }

  window.dispatchEvent(new Event("owazym:route-changed"));
});

app.mount("#app");

window.dispatchEvent(new Event("owazym:route-changed"));
