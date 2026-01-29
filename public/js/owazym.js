// ===== DEMO auth (потом заменишь на Laravel @auth/@guest) =====
const loggedIn = true;
const user = { firstName: "Aman", lastName: "Gurbanov", plan: "premium" };

function fullName(u) {
    const fn = (u?.firstName || "").trim();
    const ln = (u?.lastName || "").trim();
    return (fn + " " + ln).trim() || "Пользователь";
}

// ===== Daily wish =====
const wishes = [
    "Пусть сегодня всё получится легко ✨",
    "Спокойствия в сердце и ясности в мыслях 🌿",
    "Пусть день принесёт хорошие новости ☀️",
    "Пусть работа идёт гладко, а вечер будет тёплым 🤍",
    "Береги себя — ты важнее любых задач 🌙",
    "Пусть удача будет рядом во всех мелочах 🍀"
];

function dayOfYearIndex() {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / (1000 * 60 * 60 * 24));
}

function setDailyWish() {
    const el = document.getElementById("dailyWish");
    if (!el) return;
    el.textContent = wishes[dayOfYearIndex() % wishes.length];
}

// ===== THEME (one source of truth) =====
function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);

    const desktop = document.getElementById("themeToggleDesktop");
    const mobileTop = document.getElementById("themeToggleMobileTop");

    if (desktop) desktop.checked = theme === "light";
    if (mobileTop) mobileTop.checked = theme === "light";
    if (document.body.classList.contains('light')) {
        let logo = document.getElementById('NAME')
        logo.classList.remove('text-light');
        logo.classList.add('text-dark');
        ;
    } else {
        let logo = document.getElementById('NAME')
        logo.classList.remove('text-dark');
        logo.classList.add('text-light');
        ;
    }
}

function initTheme() {
    const saved = localStorage.getItem("theme") || "dark";
    applyTheme(saved);

    const desktop = document.getElementById("themeToggleDesktop");
    const mobileTop = document.getElementById("themeToggleMobileTop");

    desktop?.addEventListener("change", (e) => applyTheme(e.target.checked ? "light" : "dark"));
    mobileTop?.addEventListener("change", (e) => applyTheme(e.target.checked ? "light" : "dark"));
}

// ===== TOP RIGHT: ПК toggle справа + burger на телефоне =====
function renderTopRight() {
    const el = document.getElementById("topRightAuth");
    if (!el) return;

    const burger = `
      <button class="navbar-toggler d-lg-none" type="button"
      data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar"aria-controls="mobileSidebar" aria-label="Меню">
      <span class="text-danger navbar-toggler-icon"></span>
      </button>
      `;

    if (!loggedIn) {
        el.innerHTML = `
        <a class="btn btn-light btn-sm" href="/register">Зарегистрироваться</a>
        <a class="btn btn-outline-light btn-sm" href="/login">Войти</a>
        ${burger}
        `;
        return;
    }

    // ✅ Вошёл: показываем имя + toggle (только ПК) + burger (только телефон)
    el.innerHTML = `
      <span class="text-white-50 small d-none d-sm-inline me-2">${fullName(user)}</span>
      
      <label class="theme-switch ios d-none d-lg-inline me-2" title="Дневной режим">
        <input id="themeToggleDesktop" type="checkbox">
        <span class="slider"></span>
        </label>
        
        ${burger}
        `;
}

// ===== Account menu =====
function renderAccountMenu(listEl) {
    if (!listEl) return;

    if (!loggedIn) {
        listEl.innerHTML = `
          <li><a class="dropdown-item" href="/login">Войти</a></li>
          <li><a class="dropdown-item" href="/register">Регистрация</a></li>
          `;
    } else {
        const plan = (user.plan || "free").toLowerCase();
        listEl.innerHTML = `
          <li class="px-3 py-2 small text-white-50">Профиль</li>
          <li class="px-3 pb-2">
            <div class="fw-semibold">${fullName(user)}</div>
            <div class="small text-white-50">Subscription: <span class="text-white">${plan}</span></div>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="/logout"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
            `;
    }
}

// ===== Active menu by hash =====
function setActiveByHash() {
    const hash = location.hash || "#home";
    document
        .querySelectorAll("#desktopNav .nav-link, #mobileNav .nav-link")
        .forEach(a => a.classList.toggle("active", a.getAttribute("href") === hash));
}

// ===== INIT =====
setDailyWish();
renderTopRight();
renderAccountMenu(document.getElementById("accountMenuDesktop"));
renderAccountMenu(document.getElementById("accountMenuMobile"));
setActiveByHash();
window.addEventListener("hashchange", setActiveByHash);
initTheme();