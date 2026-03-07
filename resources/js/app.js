import './bootstrap';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const SPA_PATHS = new Set(['/', '/album', '/search', '/playlist']);
const PENDING_TRACK_KEY = 'owazym_pending_track_v1';
let genreBgObserver = null;

function applyRouteBodyState(pathname) {
    document.body.classList.toggle('search-view', pathname === '/search');
}

function initLazyGenreBackgrounds() {
    const cards = Array.from(document.querySelectorAll('.genre-panel[data-genre-bg]'));
    if (!cards.length) return;

    const applyBackground = (el) => {
        const bg = (el.getAttribute('data-genre-bg') || '').trim();
        if (!bg) return;
        el.style.setProperty('--genre-bg', `url("${bg}")`);
        el.removeAttribute('data-genre-bg');
    };

    if (!('IntersectionObserver' in window)) {
        cards.forEach(applyBackground);
        return;
    }

    if (!genreBgObserver) {
        genreBgObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const target = entry.target;
                if (!(target instanceof HTMLElement)) return;
                applyBackground(target);
                genreBgObserver?.unobserve(target);
            });
        }, { rootMargin: '240px 0px' });
    }

    cards.forEach((card) => genreBgObserver?.observe(card));
}

function isSpaUrl(url) {
    return SPA_PATHS.has(url.pathname);
}

function normalizeTarget(target) {
    let url;

    try {
        url = new URL(target, window.location.origin);
    } catch (_) {
        return null;
    }

    if (url.origin !== window.location.origin) return null;
    if (!isSpaUrl(url)) return null;

    if (url.hash === '#album' && url.pathname === '/') {
        return `/album${url.search}`;
    }

    if (url.hash === '#home' && (url.pathname === '/' || url.pathname === '/album')) {
        return `/${url.search}`;
    }

    return `${url.pathname}${url.search}${url.hash}`;
}

window.__owazymNavigate = (target) => {
    const normalized = normalizeTarget(target);
    if (!normalized) {
        window.location.href = target;
        return Promise.resolve();
    }

    return router.push(normalized);
};

window.OwazymCommon?.setNavigateHandler?.((target) => window.__owazymNavigate(target));

applyRouteBodyState(window.location.pathname);
initLazyGenreBackgrounds();

function handleSpaLinkEvent(e) {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const link = target.closest('a[href]');
    if (!link) return;
    if (e.defaultPrevented) return;
    if ('button' in e && e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;
    if (link.getAttribute('data-bs-toggle')) return;

    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('javascript:')) return;
    if (href.startsWith('#')) return;
    if (href.startsWith('/locale/')) return;
    if (href === '/logout' || href.startsWith('/logout?')) return;

    let parsed;
    try {
        parsed = new URL(href, window.location.origin);
    } catch (_) {
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
            audioUrl: link.dataset.audioUrl || '',
            title: link.dataset.title || '',
            artist: link.dataset.artist || '',
            coverUrl: link.dataset.coverUrl || '',
        };
        sessionStorage.setItem(PENDING_TRACK_KEY, JSON.stringify(payload));
    }

    const now = Date.now();
    const lastAt = Number(link.dataset.spaNavAt || 0);
    if (now - lastAt < 400) {
        e.preventDefault();
        return;
    }
    link.dataset.spaNavAt = String(now);

    e.preventDefault();
    window.__owazymNavigate(normalized).catch(() => {
        window.location.href = href;
    });
}

document.addEventListener('click', handleSpaLinkEvent);

document.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch') return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (!link) return;
    if (!link.closest('.mobile-bottom-nav')) return;
    handleSpaLinkEvent(e);
});

router.afterEach((to) => {
    applyRouteBodyState(to.path);

    const homeHash = to.path === '/album' ? '#album' : '#home';
    if (window.location.hash !== homeHash) {
        history.replaceState(history.state, '', `${window.location.pathname}${window.location.search}${homeHash}`);
    }

    window.OwazymCommon?.updatePathActiveLinks?.();
    window.OwazymCommon?.setActiveByHash?.();

    requestAnimationFrame(() => {
        const main = document.getElementById('appMain');
        if (main instanceof HTMLElement) {
            main.focus({ preventScroll: true });
        }
        initLazyGenreBackgrounds();
    });
});

createApp(App).use(router).mount('#app');
