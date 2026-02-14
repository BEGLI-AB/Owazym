const loggedIn = true;
const currentUser = (typeof window !== "undefined" && window.user) ? window.user : {};
function fullName(u) {
    const fn = (u?.firstName || "").trim();
    return (fn).trim() || i18n.user_fallback;
}

// ===== Daily wish =====
const wishesDataEl = document.getElementById("wishesData");
const i18nDataEl = document.getElementById("i18nData");
let wishes = ["Wish of the day..."];
if (wishesDataEl) {
  try {
    const parsed = JSON.parse(wishesDataEl.textContent || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) wishes = parsed;
  } catch (_) {}
}

let i18n = {
  profile: "Profile",
  subscription: "Subscription",
  logout: "Logout",
  menu: "Menu",
  register: "Register",
  login: "Login",
  user_fallback: "User"
};
if (i18nDataEl) {
  try {
    const parsed = JSON.parse(i18nDataEl.textContent || "{}");
    if (parsed && typeof parsed === "object") i18n = { ...i18n, ...parsed };
  } catch (_) {}
}

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
    const mobileSidebar = document.getElementById("themeToggleMobileSidebar");

    if (desktop) desktop.checked = theme === "light";
    if (mobileTop) mobileTop.checked = theme === "light";
    if (mobileSidebar) mobileSidebar.checked = theme === "light";
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
    const mobileSidebar = document.getElementById("themeToggleMobileSidebar");

    desktop?.addEventListener("change", (e) => applyTheme(e.target.checked ? "light" : "dark"));
    mobileTop?.addEventListener("change", (e) => applyTheme(e.target.checked ? "light" : "dark"));
    mobileSidebar?.addEventListener("change", (e) => applyTheme(e.target.checked ? "light" : "dark"));
}

// ===== TOP RIGHT: ПК toggle справа + burger на телефоне =====
function renderTopRight() {
    const el = document.getElementById("topRightAuth");
    if (!el) return;

    const burger = `
      <button class="navbar-toggler d-lg-none" type="button"
      data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar"aria-controls="mobileSidebar" aria-label="${i18n.menu}">
      <span class="text-danger navbar-toggler-icon"></span>
      </button>
      `;

    if (!loggedIn) {
        el.innerHTML = `
        <a class="btn btn-light btn-sm" href="/register">${i18n.register}</a>
        <a class="btn btn-outline-light btn-sm" href="/login">${i18n.login}</a>
        ${burger}
        `;
        return;
    }

    // ✅ Вошёл: показываем имя + toggle (только ПК) + burger (только телефон)
    el.innerHTML = `
      <span class="text-white-50 small d-none d-sm-inline me-2">${fullName(currentUser)}</span>
        
        ${burger}
        `;
}

// ===== Account menu =====
function renderAccountMenu(listEl) {
     
        const plan = (currentUser.plan || "free").toLowerCase();
        listEl.innerHTML = `
          <li class="px-3 py-2 small text-white-50">${i18n.profile}</li>
          <li class="px-3 pb-2">
            <div class="fw-semibold">${fullName(currentUser)}</div>
            <div class="small text-white-50">${i18n.subscription}: <span class="text-white">${plan}</span></div>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="/logout"><i class="bi bi-box-arrow-right me-2"></i>${i18n.logout}</a></li>
            `;
    
}
let row = null;
let nextBtn = null;
let prevBtn = null;

function refreshCarouselRefs() {
  row = document.getElementById('row');
  nextBtn = document.getElementById('nextBtn');
  prevBtn = document.getElementById('prevBtn');
}

function updateButtons() {
  if (!row) return;
  const maxScroll = row.scrollWidth - row.clientWidth;

  // начало — скрываем левую
  if (prevBtn) {
    if (row.scrollLeft <= 5) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }
  }

  // конец — скрываем правую
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
    behavior: 'smooth'
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.search-input');
  const artists = document.querySelectorAll('.artist-item');

  if (!inputs || inputs.length === 0) return;

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const value = (input.value || '').toLowerCase();
      if (!artists) return;

      artists.forEach(artist => {
        const name = (artist.dataset.name || '').toLowerCase();
        artist.style.display = name.includes(value) ? '' : 'none';
      });
    });
  });
});


// ===== Active menu by hash =====
function setActiveByHash() {
    const hash = location.hash || "#home";
    document
    .querySelectorAll("#desktopNav .nav-link, #mobileNav .nav-link")
    .forEach(a => {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      a.classList.toggle("active", href === hash);
    });
}

// ===== INIT =====
setDailyWish();
renderTopRight();
const accDesktop = document.getElementById("accountMenuDesktop");
const accMobile = document.getElementById("accountMenuMobile");
if (accDesktop) renderAccountMenu(accDesktop);
if (accMobile) renderAccountMenu(accMobile);
setActiveByHash();
window.addEventListener("hashchange", setActiveByHash);
initTheme();
refreshCarouselRefs();
if (row) row.addEventListener('scroll', updateButtons);
window.addEventListener('load', () => { if (typeof updateButtons === 'function') updateButtons(); });

// ===== SEARCH TOGGLE BUTTON (first click focuses, second click submits) =====
function initSearchToggles() {
  document.querySelectorAll('.search-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const form = btn.closest('form');
      if (!form) return;
      const input = form.querySelector('.search-input');
      if (!input) return;

      // If input isn't focused, focus it (open filter)
      if (document.activeElement !== input) {
        input.focus();
        // small visual hint: select text
        input.select?.();
        return;
      }

      // If input is focused: submit the form
      // If input has empty value, still submit to keep behaviour consistent
      form.submit();
    });
  });
}

document.addEventListener('DOMContentLoaded', initSearchToggles);

// ===== Album / player flow =====
const audioPlayer = new Audio();
let activeTrackRow = null;
const AUDIO_STATE_KEY = "owazym_audio_state_v1";
let audioEventsBound = false;
let navigationBound = false;
let seekBarEl = null;
let progressFillEl = null;
let progressCurrentEl = null;
let progressDurationEl = null;
let isSeeking = false;
let volumeBarEl = null;
let volumeFillEl = null;
let volumeBtnEl = null;
let isVolumeSeeking = false;
const VOLUME_KEY = "owazym_player_volume_v1";

function refreshPlayerRefs() {
  seekBarEl = document.querySelector(".player-seekbar");
  progressFillEl = document.querySelector(".player-progress-fill");
  progressCurrentEl = document.querySelector(".progress-current");
  progressDurationEl = document.querySelector(".progress-duration");
  volumeBarEl = document.querySelector(".player-volume-bar");
  volumeFillEl = document.querySelector(".player-volume-fill");
  volumeBtnEl = document.querySelector(".player-volume-btn");
}

function formatTime(seconds) {
  const sec = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function updateProgressUI() {
  if (isSeeking) return;
  if (!progressFillEl || !progressCurrentEl || !progressDurationEl) return;
  const duration = Number(audioPlayer.duration || 0);
  const current = Number(audioPlayer.currentTime || 0);
  const percent = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  progressFillEl.style.width = `${percent}%`;
  progressCurrentEl.textContent = formatTime(current);
  progressDurationEl.textContent = formatTime(duration);
}

function updateVolumeIcon(volume) {
  if (!volumeBtnEl) return;
  const icon = volumeBtnEl.querySelector("i");
  if (!icon) return;
  icon.classList.remove("bi-volume-up", "bi-volume-down", "bi-volume-mute");
  if (volume <= 0) {
    icon.classList.add("bi-volume-mute");
  } else if (volume < 0.5) {
    icon.classList.add("bi-volume-down");
  } else {
    icon.classList.add("bi-volume-up");
  }
}

function updateVolumeUI() {
  if (!volumeFillEl) return;
  const v = Math.min(1, Math.max(0, Number(audioPlayer.volume ?? 1)));
  volumeFillEl.style.width = `${v * 100}%`;
  updateVolumeIcon(v);
}

function getVolumeRatio(clientX) {
  if (!volumeBarEl) return 0;
  const rect = volumeBarEl.getBoundingClientRect();
  if (!rect.width) return 0;
  return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
}

function setVolume(value, persist = true) {
  const v = Math.min(1, Math.max(0, Number(value) || 0));
  audioPlayer.volume = v;
  updateVolumeUI();
  if (persist) {
    localStorage.setItem(VOLUME_KEY, String(v));
  }
}

function getSeekRatio(clientX) {
  if (!seekBarEl) return 0;
  const rect = seekBarEl.getBoundingClientRect();
  if (!rect.width) return 0;
  return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
}

function previewSeek(clientX) {
  if (!progressFillEl || !progressCurrentEl || !progressDurationEl) return;
  const duration = Number(audioPlayer.duration || 0);
  const ratio = getSeekRatio(clientX);
  progressFillEl.style.width = `${ratio * 100}%`;
  progressCurrentEl.textContent = formatTime(duration * ratio);
  progressDurationEl.textContent = formatTime(duration);
}

function commitSeek(clientX) {
  if (!audioPlayer.duration) return;
  const ratio = getSeekRatio(clientX);
  audioPlayer.currentTime = audioPlayer.duration * ratio;
  updateProgressUI();
}

function saveAudioState(extra = {}) {
  if (!audioPlayer.src) return;
  const state = {
    src: audioPlayer.src,
    currentTime: audioPlayer.currentTime || 0,
    isPlaying: !audioPlayer.paused,
    title: document.querySelector(".track-now")?.textContent || "",
    artist: document.querySelector(".track-now-artist")?.textContent || "",
    ...extra
  };
  sessionStorage.setItem(AUDIO_STATE_KEY, JSON.stringify(state));
}

function clearAudioState() {
  sessionStorage.removeItem(AUDIO_STATE_KEY);
}

function restoreAudioState() {
  const raw = sessionStorage.getItem(AUDIO_STATE_KEY);
  if (!raw) return;

  let state;
  try {
    state = JSON.parse(raw);
  } catch (_) {
    clearAudioState();
    return;
  }

  if (!state?.src) return;

  if (!state.isPlaying) {
    clearAudioState();
    sessionStorage.removeItem("playerActive");
    setPlayButtonState(false);
    setNowPlaying("Track", "Artist");
    return;
  }

  audioPlayer.src = state.src;
  setNowPlaying(state.title, state.artist);
  setPlayButtonState(Boolean(state.isPlaying));

  const resumeAt = Number(state.currentTime || 0);
  const resumePlayback = () => {
    if (resumeAt > 0) {
      try {
        audioPlayer.currentTime = resumeAt;
      } catch (_) {}
    }
    if (state.isPlaying) {
      audioPlayer.play()
        .then(() => {
          sessionStorage.setItem("playerActive", "1");
          setPlayerUIByHash();
        })
        .catch(() => {
          setPlayButtonState(false);
        });
    }
  };

  if (audioPlayer.readyState >= 1) {
    resumePlayback();
  } else {
    audioPlayer.addEventListener("loadedmetadata", resumePlayback, { once: true });
  }
}

function setPlayButtonState(isPlaying) {
  document.querySelectorAll(".album-play, .play-btn").forEach((btn) => {
    const icon = btn.querySelector("i");
    if (!icon) return;
    icon.classList.remove("bi-play-fill", "bi-pause-fill");
    icon.classList.add(isPlaying ? "bi-pause-fill" : "bi-play-fill");
  });
}

function setNowPlaying(title, artist) {
  const titleEl = document.querySelector(".track-now");
  const artistEl = document.querySelector(".track-now-artist");
  if (titleEl) titleEl.textContent = title || "Track";
  if (artistEl) artistEl.textContent = artist || "Artist";
}

function setPlayerUIByHash() {
  const hash = location.hash || "#home";
  const onAlbumPage = hash === "#album";
  const playerActive = sessionStorage.getItem("playerActive") === "1";
  document.body.classList.toggle("show-album", onAlbumPage);
  document.body.classList.toggle("show-player-ui", !onAlbumPage && playerActive);
}

function playFromDataset(data, row = null, options = {}) {
  const restart = Boolean(options.restart);
  const url = (data.audioUrl || "").trim();
  if (!url) {
    alert("U etogo treka net audio faila.");
    return;
  }

  const resetProgressUi = () => {
    if (progressFillEl) progressFillEl.style.width = "0%";
    if (progressCurrentEl) progressCurrentEl.textContent = "0:00";
  };

  const startPlayback = () => {
    if (restart) {
      try {
        audioPlayer.currentTime = 0;
      } catch (_) {}
      resetProgressUi();
      updateProgressUI();
    }

    audioPlayer.play()
    .then(() => {
      setPlayButtonState(true);
      setNowPlaying(data.title, data.artist);

      if (activeTrackRow) activeTrackRow.classList.remove("active");
      if (row) {
        row.classList.add("active");
        activeTrackRow = row;
      }

      sessionStorage.setItem("playerActive", "1");
      setPlayerUIByHash();
      saveAudioState();
      updateProgressUI();
    })
    .catch(() => {
      alert("Ne udalos zapustit audio.");
    });
  };

  if (audioPlayer.src !== url) {
    audioPlayer.pause();
    audioPlayer.src = url;
    resetProgressUi();
    if (restart) {
      audioPlayer.addEventListener("loadedmetadata", () => {
        startPlayback();
      }, { once: true });
      return;
    }
  } else if (restart) {
    audioPlayer.pause();
    try {
      audioPlayer.currentTime = 0;
    } catch (_) {}
    resetProgressUi();
  }

  startPlayback();
}

function pauseAudio() {
  audioPlayer.pause();
  setPlayButtonState(false);
  sessionStorage.setItem("playerActive", "1");
  setPlayerUIByHash();
  saveAudioState({ isPlaying: false });
  updateProgressUI();
}

function initAlbumNav() {
  const triggers = document.querySelectorAll("[data-hash], .music-card");
  triggers.forEach((el) => {
    el.addEventListener("click", () => {
      const targetUrl = el.getAttribute("data-url");
      if (targetUrl) {
        navigateWithoutReload(targetUrl, true).catch(() => {
          location.href = targetUrl;
        });
        return;
      }
      const target = el.getAttribute("data-hash") || "#album";
      location.hash = target;
    });
  });
}

function initPlayerActivate() {
  document.querySelectorAll(".track-row").forEach((rowEl) => {
    rowEl.addEventListener("click", () => {
      playFromDataset(
        {
          audioUrl: rowEl.dataset.audioUrl,
          title: rowEl.dataset.title,
          artist: rowEl.dataset.artist
        },
        rowEl,
        { restart: true }
      );
    });
  });

  const albumPlay = document.querySelector(".album-play");
  if (albumPlay) {
    albumPlay.addEventListener("click", (e) => {
      e.preventDefault();
      if (!audioPlayer.paused && audioPlayer.src) {
        pauseAudio();
        return;
      }

      playFromDataset({
        audioUrl: albumPlay.dataset.audioUrl,
        title: albumPlay.dataset.title,
        artist: albumPlay.dataset.artist
      }, null, { restart: true });
    });
  }

  const bottomPlay = document.querySelector(".play-btn");
  if (bottomPlay && !bottomPlay.dataset.playerBound) {
    bottomPlay.dataset.playerBound = "1";
    bottomPlay.addEventListener("click", (e) => {
      e.preventDefault();
      if (!audioPlayer.paused && audioPlayer.src) {
        pauseAudio();
        return;
      }

      const sourceEl = activeTrackRow || document.querySelector(".track-row.active") || document.querySelector(".album-play");
      playFromDataset(
        {
          audioUrl: sourceEl?.dataset?.audioUrl || "",
          title: sourceEl?.dataset?.title || "",
          artist: sourceEl?.dataset?.artist || ""
        },
        sourceEl?.classList?.contains("track-row") ? sourceEl : null
      );
    });
  }

  if (!audioEventsBound) {
    audioEventsBound = true;
    audioPlayer.addEventListener("ended", () => {
      setPlayButtonState(false);
      sessionStorage.removeItem("playerActive");
      setPlayerUIByHash();
      saveAudioState({ isPlaying: false, currentTime: 0 });
    });

    audioPlayer.addEventListener("timeupdate", () => {
      saveAudioState();
      updateProgressUI();
    });

    audioPlayer.addEventListener("pause", () => {
      saveAudioState({ isPlaying: false });
      updateProgressUI();
    });

    audioPlayer.addEventListener("play", () => {
      saveAudioState({ isPlaying: true });
      updateProgressUI();
    });

    audioPlayer.addEventListener("loadedmetadata", () => {
      updateProgressUI();
    });
  }

  if (seekBarEl && !seekBarEl.dataset.playerBound) {
    seekBarEl.dataset.playerBound = "1";
    seekBarEl.addEventListener("click", (e) => {
      if (!audioPlayer.duration) return;
      commitSeek(e.clientX);
    });

    seekBarEl.addEventListener("pointerdown", (e) => {
      if (!audioPlayer.duration) return;
      isSeeking = true;
      seekBarEl.setPointerCapture?.(e.pointerId);
      previewSeek(e.clientX);
    });

    seekBarEl.addEventListener("pointermove", (e) => {
      if (!isSeeking) return;
      previewSeek(e.clientX);
    });

    const finishSeek = (e) => {
      if (!isSeeking) return;
      isSeeking = false;
      commitSeek(e.clientX);
    };

    seekBarEl.addEventListener("pointerup", finishSeek);
    seekBarEl.addEventListener("pointercancel", () => {
      isSeeking = false;
      updateProgressUI();
    });
  }

  if (volumeBarEl && !volumeBarEl.dataset.playerBound) {
    volumeBarEl.dataset.playerBound = "1";
    volumeBarEl.addEventListener("click", (e) => {
      setVolume(getVolumeRatio(e.clientX));
    });

    volumeBarEl.addEventListener("pointerdown", (e) => {
      isVolumeSeeking = true;
      volumeBarEl.setPointerCapture?.(e.pointerId);
      setVolume(getVolumeRatio(e.clientX));
    });

    volumeBarEl.addEventListener("pointermove", (e) => {
      if (!isVolumeSeeking) return;
      setVolume(getVolumeRatio(e.clientX), false);
    });

    const finishVolumeSeek = (e) => {
      if (!isVolumeSeeking) return;
      isVolumeSeeking = false;
      setVolume(getVolumeRatio(e.clientX));
    };

    volumeBarEl.addEventListener("pointerup", finishVolumeSeek);
    volumeBarEl.addEventListener("pointercancel", () => {
      isVolumeSeeking = false;
      updateVolumeUI();
    });
  }

  if (volumeBtnEl && !volumeBtnEl.dataset.playerBound) {
    volumeBtnEl.dataset.playerBound = "1";
    volumeBtnEl.addEventListener("click", () => {
      if (audioPlayer.volume > 0) {
        volumeBtnEl.dataset.prevVolume = String(audioPlayer.volume);
        setVolume(0);
      } else {
        const prev = Number(volumeBtnEl.dataset.prevVolume || 1);
        setVolume(prev > 0 ? prev : 1);
      }
    });
  }
}

function initPlayerClose() {
  const closeBtn = document.querySelector(".player-close");
  if (!closeBtn || closeBtn.dataset.playerBound) return;
  closeBtn.dataset.playerBound = "1";
  closeBtn.addEventListener("click", () => {
    sessionStorage.removeItem("playerActive");
    document.body.classList.remove("show-player-ui");
    pauseAudio();
    clearAudioState();
  });
}

function updatePathActiveLinks() {
  const currentPath = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
  document.querySelectorAll(".nav-apple .nav-link").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return;
    try {
      const u = new URL(href, window.location.origin);
      const path = (u.pathname || "/").replace(/\/+$/, "") || "/";
      link.classList.toggle("active", path === currentPath);
    } catch (_) {}
  });
}

async function navigateWithoutReload(url, pushState = true) {
  saveAudioState();
  const response = await fetch(url, {
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  });

  if (!response.ok) {
    window.location.href = url;
    return;
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const newMain = doc.querySelector("main.app-content");
  const currentMain = document.querySelector("main.app-content");

  if (!newMain || !currentMain) {
    window.location.href = url;
    return;
  }

  currentMain.replaceWith(newMain);
  document.title = doc.title || document.title;
  if (pushState) history.pushState({}, "", url);

  refreshCarouselRefs();
  refreshPlayerRefs();
  if (row) row.addEventListener("scroll", updateButtons);
  if (typeof updateButtons === "function") updateButtons();
  initAlbumNav();
  initPlayerActivate();
  setPlayerUIByHash();
  setActiveByHash();
  updatePathActiveLinks();
}

function initPersistentNavigation() {
  if (navigationBound) return;
  navigationBound = true;

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return;

    let url;
    try {
      url = new URL(href, window.location.origin);
    } catch (_) {
      return;
    }

    if (url.origin !== window.location.origin) return;
    if (url.pathname.startsWith("/locale/")) return;

    e.preventDefault();
    navigateWithoutReload(url.toString(), true).catch(() => {
      window.location.href = url.toString();
    });
  });

  window.addEventListener("popstate", () => {
    navigateWithoutReload(window.location.href, false).catch(() => {
      window.location.reload();
    });
  });
}

window.addEventListener("hashchange", setPlayerUIByHash);
window.addEventListener("load", () => {
  restoreAudioState();
  refreshCarouselRefs();
  refreshPlayerRefs();
  const storedVolume = Number(localStorage.getItem(VOLUME_KEY));
  setVolume(Number.isFinite(storedVolume) ? storedVolume : 1, false);
  if (row) row.addEventListener("scroll", updateButtons);
  initAlbumNav();
  initPlayerActivate();
  initPlayerClose();
  initPersistentNavigation();
  setPlayerUIByHash();
  setActiveByHash();
  updatePathActiveLinks();
  updateProgressUI();
  updateVolumeUI();
});

window.addEventListener("beforeunload", () => {
  saveAudioState();
});



