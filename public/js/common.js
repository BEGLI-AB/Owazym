(function (global) {
const DEFAULT_I18N = {
    profile: 'Profile',
    subscription: 'Subscription',
    logout: 'Logout',
    menu: 'Menu',
    register: 'Register',
    login: 'Login',
    user_fallback: 'User',
};

let i18n = { ...DEFAULT_I18N };
let wishes = ['Wish of the day...'];
let dataLoaded = false;
let hashListenerBound = false;
let row = null;
let nextBtn = null;
let prevBtn = null;
let navigateHandler = null;

function getCurrentUserFromDom() {
    const authEl = document.getElementById('topRightAuth');
    const firstNameFromDom = (authEl?.dataset?.firstName || '').trim();
    const planFromDom = (authEl?.dataset?.plan || '').trim();

    return {
        firstName: firstNameFromDom || 'Guest',
        plan: (planFromDom || 'free').toLowerCase(),
    };
}

function fullName(user) {
    const firstName = (user?.firstName || '').trim();
    return firstName || i18n.user_fallback;
}

function ensureDataLoaded() {
    if (dataLoaded) return;
    dataLoaded = true;

    const wishesDataEl = document.getElementById('wishesData');
    const i18nDataEl = document.getElementById('i18nData');

    if (wishesDataEl) {
        try {
            const parsed = JSON.parse(wishesDataEl.textContent || '[]');
            if (Array.isArray(parsed) && parsed.length > 0) wishes = parsed;
        } catch (_) {}
    }

    if (i18nDataEl) {
        try {
            const parsed = JSON.parse(i18nDataEl.textContent || '{}');
            if (parsed && typeof parsed === 'object') i18n = { ...i18n, ...parsed };
        } catch (_) {}
    }
}

function getCsrfToken() {
    if (typeof window !== 'undefined' && window.csrfToken) return window.csrfToken;
    const authEl = document.getElementById('topRightAuth');
    const tokenFromAuth = authEl?.dataset?.csrfToken || '';
    if (tokenFromAuth) return tokenFromAuth;
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta?.getAttribute('content') || '';
}

function submitLogout() {
    const token = getCsrfToken();
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/logout';
    form.style.display = 'none';

    const csrf = document.createElement('input');
    csrf.type = 'hidden';
    csrf.name = '_token';
    csrf.value = token;

    form.appendChild(csrf);
    document.body.appendChild(form);
    form.submit();
}

function dayOfYearIndex() {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / (1000 * 60 * 60 * 24));
}

function setDailyWish() {
    const el = document.getElementById('dailyWish');
    if (!el) return;
    el.textContent = wishes[dayOfYearIndex() % wishes.length];
}

function applyTheme(theme) {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);

    const desktop = document.getElementById('themeToggleDesktop');
    const mobileTop = document.getElementById('themeToggleMobileTop');
    const mobileSidebar = document.getElementById('themeToggleMobileSidebar');

    if (desktop) desktop.checked = theme === 'light';
    if (mobileTop) mobileTop.checked = theme === 'light';
    if (mobileSidebar) mobileSidebar.checked = theme === 'light';

    const logo = document.getElementById('NAME');
    if (!logo) return;

    if (document.body.classList.contains('light')) {
        logo.classList.remove('text-light');
        logo.classList.add('text-dark');
    } else {
        logo.classList.remove('text-dark');
        logo.classList.add('text-light');
    }
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    applyTheme(saved);

    const desktop = document.getElementById('themeToggleDesktop');
    const mobileTop = document.getElementById('themeToggleMobileTop');
    const mobileSidebar = document.getElementById('themeToggleMobileSidebar');

    desktop?.addEventListener('change', (e) => applyTheme(e.target.checked ? 'light' : 'dark'));
    mobileTop?.addEventListener('change', (e) => applyTheme(e.target.checked ? 'light' : 'dark'));
    mobileSidebar?.addEventListener('change', (e) => applyTheme(e.target.checked ? 'light' : 'dark'));
}

function renderTopRight() {
    const el = document.getElementById('topRightAuth');
    if (!el) return;

    const currentUser = getCurrentUserFromDom();
    const burger = `
      <button id="mobileDrawerToggle" class="navbar-toggler app-drawer-toggle" type="button"
      data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar" aria-controls="mobileSidebar" aria-expanded="false" aria-label="${i18n.menu}">
      <span class="text-danger navbar-toggler-icon"></span>
      </button>
    `;
    const topAccount = `
      <div class="dropdown">
        <button type="button" class="btn btn-sm btn-outline-light rounded-pill px-2 py-1" data-bs-toggle="dropdown" aria-expanded="false" aria-label="${i18n.profile}">
          <i class="bi bi-person-circle"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" id="accountMenuTop"></ul>
      </div>
    `;

    el.innerHTML = `
      <span class="text-white-50 small me-2">${fullName(currentUser)}</span>
      ${topAccount}
      ${burger}
    `;
}

function initMobileDrawerA11y() {
    const drawer = document.getElementById('mobileSidebar');
    const toggle = document.getElementById('mobileDrawerToggle');
    if (!drawer || !toggle || drawer.dataset.drawerA11yBound === '1') return;

    drawer.dataset.drawerA11yBound = '1';
    const setExpanded = (expanded) => {
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };

    if (window.bootstrap?.Offcanvas) {
        const instance = window.bootstrap.Offcanvas.getOrCreateInstance(drawer);
        drawer.addEventListener('show.bs.offcanvas', () => setExpanded(true));
        drawer.addEventListener('hide.bs.offcanvas', () => setExpanded(false));

        drawer.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            const link = target.closest('a[href]');
            if (!link) return;
            instance.hide();
        });

        window.addEventListener('owazym:route-changed', () => {
            instance.hide();
        });
    } else {
        window.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            setExpanded(false);
        });
    }
}

function renderAccountMenu(listEl) {
    if (!listEl) return;
    const currentUser = getCurrentUserFromDom();
    const plan = (currentUser.plan || 'free').toLowerCase();
    listEl.innerHTML = `
      <li class="px-3 py-2 small text-white-50">${i18n.profile}</li>
      <li class="px-3 pb-2">
        <div class="fw-semibold">${fullName(currentUser)}</div>
        <div class="small text-white-50">${i18n.subscription}: <span class="text-white">${plan}</span></div>
      </li>
      <li><hr class="dropdown-divider"></li>
      <li><button type="button" class="dropdown-item js-logout-btn"><i class="bi bi-box-arrow-right me-2"></i>${i18n.logout}</button></li>
    `;

    listEl.querySelectorAll('.js-logout-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            submitLogout();
        });
    });
}

function renderAccountMenus() {
    renderAccountMenu(document.getElementById('accountMenuDesktop'));
    renderAccountMenu(document.getElementById('accountMenuMobile'));
    renderAccountMenu(document.getElementById('accountMenuTop'));
}

function refreshCarouselRefs() {
    row = document.getElementById('row');
    nextBtn = document.getElementById('nextBtn');
    prevBtn = document.getElementById('prevBtn');
}

function updateButtons() {
    if (!row) return;
    const maxScroll = row.scrollWidth - row.clientWidth;

    if (prevBtn) {
        if (row.scrollLeft <= 5) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }
    }

    if (nextBtn) {
        if (row.scrollLeft >= maxScroll - 5) {
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }
}

function slide(dir) {
    if (!row) return;
    const card = row.querySelector('.music-card');
    if (!card) return;
    const step = card.offsetWidth + 18;

    row.scrollBy({
        left: dir * step * 2,
        behavior: 'smooth',
    });
}

function bindCarousel() {
    refreshCarouselRefs();
    if (row && !row.dataset.carouselBound) {
        row.dataset.carouselBound = '1';
        row.addEventListener('scroll', updateButtons);
    }
    updateButtons();
}

function initArtistSearchFilter() {
    document.querySelectorAll('.search-input').forEach((input) => {
        if (input.dataset.artistFilterBound) return;
        input.dataset.artistFilterBound = '1';
        input.addEventListener('input', () => {
            const value = (input.value || '').toLowerCase();
            document.querySelectorAll('.artist-item').forEach((artist) => {
                const name = (artist.dataset.name || '').toLowerCase();
                artist.style.display = name.includes(value) ? '' : 'none';
            });
        });
    });
}

function setActiveByHash() {
    const hash = location.hash || '#home';
    document
        .querySelectorAll('#desktopNav .nav-link, #mobileNav .nav-link')
        .forEach((link) => {
            const href = link.getAttribute('href') || '';
            if (!href.startsWith('#')) return;
            link.classList.toggle('active', href === hash);
        });
}

function updatePathActiveLinks() {
    const currentUrl = new URL(window.location.href);
    const currentPath = (currentUrl.pathname || '/').replace(/\/+$/, '') || '/';
    const isSearchPage = currentPath === '/search';

    document.querySelectorAll('.nav-apple .nav-link, .mobile-bottom-link[href]').forEach((link) => {
        const href = link.getAttribute('href') || '';
        if (!href || href.startsWith('#')) return;

        const navType = link.getAttribute('data-nav') || '';
        if (navType === 'search') {
            link.classList.toggle('active', isSearchPage);
            return;
        }

        if (navType === 'home') {
            link.classList.toggle('active', currentPath === '/');
            return;
        }

        try {
            const url = new URL(href, window.location.origin);
            const path = (url.pathname || '/').replace(/\/+$/, '') || '/';
            link.classList.toggle('active', path === currentPath);
        } catch (_) {}
    });
}

function buildSearchUrl(form) {
    const action = form.getAttribute('action') || window.location.pathname || '/';
    const url = new URL(action, window.location.origin);
    const data = new FormData(form);

    data.forEach((value, key) => {
        const normalized = String(value ?? '').trim();
        if (!normalized) {
            url.searchParams.delete(key);
            return;
        }
        url.searchParams.set(key, normalized);
    });

    return url.toString();
}

function submitSearchForm(form) {
    const url = buildSearchUrl(form);
    if (navigateHandler) {
        navigateHandler(url, true).catch(() => {
            window.location.href = url;
        });
        return;
    }
    window.location.href = url;
}

function initSearchToggles() {
    document.querySelectorAll('.search-toggle').forEach((btn) => {
        if (btn.dataset.searchToggleBound) return;
        btn.dataset.searchToggleBound = '1';
        btn.addEventListener('click', () => {
            const form = btn.closest('form');
            if (!form) return;
            const input = form.querySelector('.search-input');
            if (!input) return;

            if (document.activeElement !== input) {
                input.focus();
                input.select?.();
                return;
            }

            submitSearchForm(form);
        });
    });
}

function initSearchForms() {
    document.querySelectorAll('form.app-search-form').forEach((form) => {
        if (form.dataset.searchBound) return;
        form.dataset.searchBound = '1';
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitSearchForm(form);
        });
    });
}

function initArtistPhotoPreview() {
    const photoInput = document.getElementById('artistPhotoInput');
    const photoPreview = document.getElementById('artistPhotoPreview');
    if (!photoInput || !photoPreview || photoInput.dataset.previewBound) return;

    photoInput.dataset.previewBound = '1';
    photoInput.addEventListener('change', () => {
        const file = photoInput.files && photoInput.files[0];
        if (!file) {
            photoPreview.src = '';
            photoPreview.classList.add('d-none');
            return;
        }
        photoPreview.src = URL.createObjectURL(file);
        photoPreview.classList.remove('d-none');
    });
}

function initArtistFieldManager() {
    const container = document.getElementById('artistFields');
    const addBtn = document.getElementById('addArtistBtn');
    if (!container || !addBtn || container.dataset.artistManagerBound) return;

    container.dataset.artistManagerBound = '1';

    const updateRemoveState = () => {
        const rows = container.querySelectorAll('.artist-row');
        rows.forEach((rowEl, index) => {
            const btn = rowEl.querySelector('.remove-artist');
            if (btn) btn.disabled = rows.length === 1 || index === 0;
        });
    };

    addBtn.addEventListener('click', () => {
        const templateRow = container.querySelector('.artist-row');
        if (!templateRow) return;
        const clone = templateRow.cloneNode(true);
        const select = clone.querySelector('select');
        if (select) select.value = '';
        const btn = clone.querySelector('.remove-artist');
        if (btn) btn.disabled = false;
        container.appendChild(clone);
        updateRemoveState();
    });

    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-artist');
        if (!btn) return;
        const rowEl = btn.closest('.artist-row');
        if (!rowEl) return;
        rowEl.remove();
        updateRemoveState();
    });

    updateRemoveState();
}

const SIDEBAR_COLLAPSE_KEY = 'owazym_sidebar_collapsed_v1';

function applySidebarCollapsedState(collapsed) {
    document.body.classList.toggle('sidebar-collapsed', Boolean(collapsed));
}

function initSidebarCollapse() {
    const toggleBtn = document.getElementById('desktopSidebarToggle');
    if (!toggleBtn || toggleBtn.dataset.sidebarCollapseBound) return;

    const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1';
    applySidebarCollapsedState(savedCollapsed);

    toggleBtn.dataset.sidebarCollapseBound = '1';
    toggleBtn.addEventListener('click', () => {
        const next = !document.body.classList.contains('sidebar-collapsed');
        applySidebarCollapsedState(next);
        localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? '1' : '0');
    });
}

function setNavigateHandler(handler) {
    navigateHandler = typeof handler === 'function' ? handler : null;
    window.navigateWithoutReload = navigateHandler;
}

function initSharedUI() {
    ensureDataLoaded();
    setDailyWish();
    renderTopRight();
    renderAccountMenus();
    initTheme();
    setActiveByHash();
    updatePathActiveLinks();
    bindCarousel();
    initArtistSearchFilter();
    initSearchToggles();
    initSearchForms();
    initSidebarCollapse();
    initMobileDrawerA11y();

    if (!hashListenerBound) {
        hashListenerBound = true;
        window.addEventListener('hashchange', setActiveByHash);
        window.addEventListener('load', updateButtons);
    }
}

window.slide = slide;



global.OwazymCommon = {
    initSharedUI: initSharedUI,
    initArtistPhotoPreview: initArtistPhotoPreview,
    initArtistFieldManager: initArtistFieldManager,
    bindCarousel: bindCarousel,
    setActiveByHash: setActiveByHash,
    updatePathActiveLinks: updatePathActiveLinks,
    initSearchForms: initSearchForms,
    setNavigateHandler: setNavigateHandler
};
})(window);

