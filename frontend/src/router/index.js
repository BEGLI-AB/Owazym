import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";

const routes = [
  { path: "/", name: "home", component: () => import("../pages/HomePage.vue"), meta: { auth: true } },
  { path: "/album", name: "album", component: () => import("../pages/AlbumPage.vue"), meta: { auth: true } },
  { path: "/artist/:id", name: "artist", component: () => import("../pages/ArtistPage.vue"), meta: { auth: true } },
  { path: "/artists", name: "artists", component: () => import("../pages/ArtistsManagePage.vue"), meta: { auth: true } },
  { path: "/musics", name: "musics", component: () => import("../pages/MusicsManagePage.vue"), meta: { auth: true } },
  { path: "/home-banner/create", name: "home-banner-create", component: () => import("../pages/BannerPage.vue"), meta: { auth: true, admin: true } },
  { path: "/create", name: "create", component: () => import("../pages/CreatePage.vue"), meta: { auth: true, admin: true } },
  { path: "/admin-sms", name: "admin-sms", component: () => import("../pages/AdminSmsPage.vue"), meta: { auth: true, admin: true } },
  { path: "/search", name: "search", component: () => import("../pages/SearchPage.vue"), meta: { auth: true } },
  { path: "/playlist", name: "playlist", component: () => import("../pages/PlaylistPage.vue"), meta: { auth: true } },
  { path: "/top10-vote", name: "top10-vote", component: () => import("../pages/Top10VotePage.vue"), meta: { auth: true } },
  { path: "/subscription", name: "subscription", component: () => import("../pages/SubscriptionPage.vue"), meta: { auth: true } },
  { path: "/profile", name: "profile", component: () => import("../pages/ProfilePage.vue"), meta: { auth: true } },
  { path: "/support", name: "support", component: () => import("../pages/SupportPage.vue"), meta: { auth: true } },
  { path: "/login", name: "login", component: () => import("../pages/LoginPage.vue"), meta: { guest: true, layout: "auth" } },
  { path: "/register", name: "register", component: () => import("../pages/RegisterPage.vue"), meta: { guest: true, layout: "auth" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.path === "/" && to.hash === "#album") {
    return { path: "/album", query: to.query, replace: true };
  }
  if (to.path === "/album" && to.hash === "#home") {
    return { path: "/", query: to.query, replace: true };
  }

  const auth = useAuthStore();
  if (to.meta.auth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (to.meta.admin) {
    if (auth.isAuthenticated && !auth.user) {
      try {
        await auth.fetchMe();
      } catch (_error) {
        auth.clear();
        return { name: "login", query: { redirect: to.fullPath } };
      }
    }
    const user = auth.user || {};
    const isAdminByFlag = user.is_admin === true || user.isAdmin === true;
    const role = String(user.role || "").toLowerCase().trim();
    const isAdminByRole = role === "admin" || role === "administrator";
    const isAdminByName = String(user.name || "").toLowerCase().trim() === "admin";
    if (!isAdminByFlag && !isAdminByRole && !isAdminByName) {
      return { name: "home" };
    }
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return { name: "home" };
  }
  return true;
});

export default router;
