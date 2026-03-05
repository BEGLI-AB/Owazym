(function (global) {
const OwazymCommon = global.OwazymCommon || {};

function getCsrfToken() {
    if (typeof window !== 'undefined' && window.csrfToken) return window.csrfToken;
    const authEl = document.getElementById('topRightAuth');
    const tokenFromAuth = authEl?.dataset?.csrfToken || '';
    if (tokenFromAuth) return tokenFromAuth;
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta?.getAttribute('content') || '';
}

const initSharedUI = OwazymCommon.initSharedUI || function () {};
const bindCarousel = OwazymCommon.bindCarousel || function () {};
const setActiveByHash = OwazymCommon.setActiveByHash || function () {};
const updatePathActiveLinks = OwazymCommon.updatePathActiveLinks || function () {};
const initSearchForms = OwazymCommon.initSearchForms || function () {};
const initArtistPhotoPreview = OwazymCommon.initArtistPhotoPreview || function () {};
const initArtistFieldManager = OwazymCommon.initArtistFieldManager || function () {};
const setNavigateHandler = OwazymCommon.setNavigateHandler || function () {};
const audioPlayer = new Audio();
let activeTrackRow = null;
const AUDIO_STATE_KEY = 'owazym_audio_state_v1';
const VOLUME_KEY = 'owazym_player_volume_v1';
const AUDIO_STATE_THROTTLE_MS = 1200;

let appBound = false;
let audioEventsBound = false;
let navigationBound = false;
let playerHashBound = false;
let unloadBound = false;

let seekBarEl = null;
let progressFillEl = null;
let progressCurrentEl = null;
let progressDurationEl = null;
let isSeeking = false;

let volumeBarEl = null;
let volumeFillEl = null;
let volumeBtnEl = null;
let isVolumeSeeking = false;

let pendingSeekRatio = null;
let isPendingSeek = false;
let lastAudioStateWriteAt = 0;

function refreshPlayerRefs() {
    seekBarEl = document.querySelector('.player-seekbar');
    progressFillEl = document.querySelector('.player-progress-fill');
    progressCurrentEl = document.querySelector('.progress-current');
    progressDurationEl = document.querySelector('.progress-duration');
    volumeBarEl = document.querySelector('.player-volume-bar');
    volumeFillEl = document.querySelector('.player-volume-fill');
    volumeBtnEl = document.querySelector('.player-volume-btn');
}

function formatTime(seconds) {
    const sec = Math.max(0, Math.floor(Number(seconds) || 0));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function setSeekAria(current, duration) {
    if (!seekBarEl) return;
    const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
    const safeCurrent = Number.isFinite(current) ? Math.max(0, current) : 0;
    seekBarEl.setAttribute('aria-valuemin', '0');
    seekBarEl.setAttribute('aria-valuemax', String(Math.floor(safeDuration)));
    seekBarEl.setAttribute('aria-valuenow', String(Math.floor(safeCurrent)));
}

function updateProgressUI() {
    if (isSeeking || isPendingSeek) return;
    if (!progressFillEl || !progressCurrentEl || !progressDurationEl) return;
    const duration = Number(audioPlayer.duration || 0);
    const current = Number(audioPlayer.currentTime || 0);
    const percent = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
    progressFillEl.style.width = `${percent}%`;
    progressCurrentEl.textContent = formatTime(current);
    progressDurationEl.textContent = formatTime(duration);
    setSeekAria(current, duration);
}

function updateVolumeIcon(volume) {
    if (!volumeBtnEl) return;
    const icon = volumeBtnEl.querySelector('i');
    if (!icon) return;
    icon.classList.remove('bi-volume-up', 'bi-volume-down', 'bi-volume-mute');
    if (volume <= 0) {
        icon.classList.add('bi-volume-mute');
    } else if (volume < 0.5) {
        icon.classList.add('bi-volume-down');
    } else {
        icon.classList.add('bi-volume-up');
    }
}

function updateVolumeUI() {
    if (!volumeFillEl) return;
    const volume = Math.min(1, Math.max(0, Number(audioPlayer.volume ?? 1)));
    volumeFillEl.style.width = `${volume * 100}%`;
    updateVolumeIcon(volume);
}

function getVolumeRatio(clientX) {
    if (!volumeBarEl) return 0;
    const rect = volumeBarEl.getBoundingClientRect();
    if (!rect.width) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
}

function setVolume(value, persist = true) {
    const volume = Math.min(1, Math.max(0, Number(value) || 0));
    audioPlayer.volume = volume;
    updateVolumeUI();
    if (persist) localStorage.setItem(VOLUME_KEY, String(volume));
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
    setSeekAria(duration * ratio, duration);
}

function applyPendingSeek() {
    if (pendingSeekRatio == null) return;
    if (!audioPlayer.duration || !Number.isFinite(audioPlayer.duration)) return;
    isPendingSeek = true;
    audioPlayer.currentTime = audioPlayer.duration * pendingSeekRatio;
    pendingSeekRatio = null;
    updateProgressUI();
}

function commitSeek(clientX) {
    const ratio = getSeekRatio(clientX);
    if (!audioPlayer.src) return;
    if (!audioPlayer.duration || !Number.isFinite(audioPlayer.duration)) {
        pendingSeekRatio = ratio;
        isPendingSeek = true;
        audioPlayer.addEventListener('loadedmetadata', applyPendingSeek, { once: true });
        return;
    }
    isPendingSeek = true;
    audioPlayer.currentTime = audioPlayer.duration * ratio;
    updateProgressUI();
}

function saveAudioState(extra = {}, force = false) {
    if (!audioPlayer.src) return;
    const now = Date.now();
    const hasExtra = extra && Object.keys(extra).length > 0;
    if (!force && !hasExtra && now - lastAudioStateWriteAt < AUDIO_STATE_THROTTLE_MS) return;
    lastAudioStateWriteAt = now;

    const state = {
        src: audioPlayer.src,
        currentTime: audioPlayer.currentTime || 0,
        isPlaying: !audioPlayer.paused,
        title: document.querySelector('.track-now')?.textContent || '',
        artist: document.querySelector('.track-now-artist')?.textContent || '',
        coverUrl: document.querySelector('.player-left img')?.getAttribute('src') || '',
        ...extra,
    };
    sessionStorage.setItem(AUDIO_STATE_KEY, JSON.stringify(state));
}

function clearAudioState() {
    sessionStorage.removeItem(AUDIO_STATE_KEY);
}

function setPlayButtonState(isPlaying) {
    document.querySelectorAll('.album-play, .play-btn').forEach((btn) => {
        const icon = btn.querySelector('i');
        if (!icon) return;
        icon.classList.remove('bi-play-fill', 'bi-pause-fill');
        icon.classList.add(isPlaying ? 'bi-pause-fill' : 'bi-play-fill');
    });
}

function setNowPlaying(title, artist, coverUrl = '') {
    const titleEl = document.querySelector('.track-now');
    const artistEl = document.querySelector('.track-now-artist');
    const coverEl = document.querySelector('.player-left img');
    if (titleEl) titleEl.textContent = title || 'Track';
    if (artistEl) artistEl.textContent = artist || 'Artist';
    if (coverEl) {
        const fallback = coverEl.dataset.defaultCover || coverEl.getAttribute('src') || '';
        coverEl.src = (coverUrl || '').trim() || fallback;
    }
}

function setPlayerUIByHash() {
    const hash = location.hash || '#home';
    const onAlbumPage = hash === '#album';
    const playerActive = sessionStorage.getItem('playerActive') === '1';
    document.body.classList.toggle('show-album', onAlbumPage);
    document.body.classList.toggle('show-player-ui', playerActive);
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
        sessionStorage.removeItem('playerActive');
        setPlayButtonState(false);
        setNowPlaying('Track', 'Artist');
        return;
    }

    audioPlayer.src = state.src;
    setNowPlaying(state.title, state.artist, state.coverUrl || '');
    setPlayButtonState(Boolean(state.isPlaying));

    const resumeAt = Number(state.currentTime || 0);
    const resumePlayback = () => {
        if (resumeAt > 0) {
            try {
                audioPlayer.currentTime = resumeAt;
            } catch (_) {}
        }
        if (state.isPlaying) {
            audioPlayer
                .play()
                .then(() => {
                    sessionStorage.setItem('playerActive', '1');
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
        audioPlayer.addEventListener('loadedmetadata', resumePlayback, { once: true });
    }
}

function updateAlbumHero(data = {}) {
    const titleEl = document.querySelector('.album-page .album-title');
    const artistEl = document.querySelector('.album-page .artist-name');
    const coverEl = document.querySelector('.album-page .album-cover img');
    const title = (data.title || '').trim();
    const artist = (data.artist || '').trim();
    const coverUrl = (data.coverUrl || '').trim();
    const musicId = Number(data.musicId || 0) || null;

    if (titleEl && title) titleEl.textContent = title;
    if (artistEl && artist) artistEl.textContent = artist;
    if (coverEl) {
        const fallback = coverEl.dataset.defaultCover || coverEl.getAttribute('src') || '';
        const lockCover = coverEl.dataset.lockCover === '1';
        coverEl.src = lockCover ? fallback : coverUrl || fallback;
    }

    const albumPlay = document.querySelector('.album-page .album-play');
    if (albumPlay) {
        if (musicId != null) albumPlay.dataset.musicId = String(musicId);
        if (data.audioUrl != null) albumPlay.dataset.audioUrl = data.audioUrl;
        if (data.title != null) albumPlay.dataset.title = data.title;
        if (data.artist != null) albumPlay.dataset.artist = data.artist;
        if (data.coverUrl != null) albumPlay.dataset.coverUrl = data.coverUrl;
    }

    const bottomPlay = document.querySelector('.player-center .play-btn');
    if (bottomPlay) {
        if (musicId != null) bottomPlay.dataset.musicId = String(musicId);
        if (data.audioUrl != null) bottomPlay.dataset.audioUrl = data.audioUrl;
        if (data.title != null) bottomPlay.dataset.title = data.title;
        if (data.artist != null) bottomPlay.dataset.artist = data.artist;
        if (data.coverUrl != null) bottomPlay.dataset.coverUrl = data.coverUrl;
    }

    const addBtn = document.querySelector('.album-page .album-add');
    if (addBtn && musicId != null) addBtn.dataset.musicId = String(musicId);
}

function setAlbumAddButtonState(button, mode) {
    if (!button) return;
    const icon = button.querySelector('i');
    if (!icon) return;

    if (mode === 'pending') {
        button.disabled = true;
        icon.className = 'bi bi-hourglass-split';
        return;
    }

    if (mode === 'done') {
        button.disabled = false;
        icon.className = 'bi bi-check-lg';
        setTimeout(() => {
            icon.className = 'bi bi-plus-lg';
        }, 1200);
        return;
    }

    button.disabled = false;
    icon.className = 'bi bi-plus-lg';
}

async function addMusicToPlaylist(musicId) {
    const token = getCsrfToken();
    const response = await fetch('/playlist-tracks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify({ music_id: musicId }),
    });

    if (!response.ok) throw new Error('Failed to add track');
    return response.json();
}

function initAlbumAdd() {
    const addBtn = document.querySelector('.album-page .album-add');
    if (!addBtn || addBtn.dataset.playerBound) return;

    addBtn.dataset.playerBound = '1';
    addBtn.addEventListener('click', async () => {
        const musicId =
            Number(addBtn.dataset.musicId || 0) ||
            Number(activeTrackRow?.dataset?.musicId || 0) ||
            Number(document.querySelector('.album-play')?.dataset?.musicId || 0);

        if (!musicId) {
            alert('Track not selected.');
            return;
        }

        try {
            setAlbumAddButtonState(addBtn, 'pending');
            await addMusicToPlaylist(musicId);
            setAlbumAddButtonState(addBtn, 'done');
        } catch (_) {
            setAlbumAddButtonState(addBtn, 'idle');
            alert('Failed to add track to playlist.');
        }
    });
}

function loadTrackDurations() {
    const rows = document.querySelectorAll('.track-row');
    rows.forEach((rowEl) => {
        if (rowEl.dataset.durationLoaded === '1') return;
        const url = (rowEl.dataset.audioUrl || '').trim();
        if (!url) return;
        const timeEl = rowEl.querySelector('.track-time');
        if (!timeEl) return;
        rowEl.dataset.durationLoaded = '1';

        const probe = new Audio();
        probe.preload = 'metadata';
        probe.src = url;
        probe.addEventListener('loadedmetadata', () => {
            const duration = Number(probe.duration || 0);
            timeEl.textContent = duration > 0 ? formatTime(duration) : '0:00';
        });
        probe.addEventListener('error', () => {
            timeEl.textContent = '--:--';
        });
    });
}

function playFromDataset(data, rowEl = null, options = {}) {
    const restart = Boolean(options.restart);
    const url = (data.audioUrl || '').trim();
    if (!url) {
        alert('U etogo treka net audio faila.');
        return;
    }
    updateAlbumHero(data);

    const resetProgressUi = () => {
        if (progressFillEl) progressFillEl.style.width = '0%';
        if (progressCurrentEl) progressCurrentEl.textContent = '0:00';
    };

    const startPlayback = () => {
        if (restart) {
            try {
                audioPlayer.currentTime = 0;
            } catch (_) {}
            resetProgressUi();
            updateProgressUI();
        }

        audioPlayer
            .play()
            .then(() => {
                setPlayButtonState(true);
                setNowPlaying(data.title, data.artist, data.coverUrl || '');

                if (activeTrackRow) activeTrackRow.classList.remove('active');
                if (rowEl) {
                    rowEl.classList.add('active');
                    activeTrackRow = rowEl;
                }

                sessionStorage.setItem('playerActive', '1');
                setPlayerUIByHash();
                saveAudioState();
                updateProgressUI();
            })
            .catch(() => {
                alert('Ne udalos zapustit audio.');
            });
    };

    if (audioPlayer.src !== url) {
        audioPlayer.pause();
        audioPlayer.src = url;
        resetProgressUi();
        if (restart) {
            audioPlayer.addEventListener(
                'loadedmetadata',
                () => {
                    startPlayback();
                },
                { once: true }
            );
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

function pauseAudio(keepPlayerVisible = true) {
    audioPlayer.pause();
    setPlayButtonState(false);
    if (keepPlayerVisible) {
        sessionStorage.setItem('playerActive', '1');
    } else {
        sessionStorage.removeItem('playerActive');
    }
    setPlayerUIByHash();
    saveAudioState({ isPlaying: false });
    updateProgressUI();
}

function initAlbumNav() {
    const triggers = document.querySelectorAll('[data-hash], .music-card');
    triggers.forEach((el) => {
        if (el.dataset.albumNavBound) return;
        el.dataset.albumNavBound = '1';
        el.addEventListener('click', () => {
            const targetUrl = el.getAttribute('data-url');
            if (targetUrl) {
                navigateWithoutReload(targetUrl, true).catch(() => {
                    location.href = targetUrl;
                });
                return;
            }
            const target = el.getAttribute('data-hash') || '#album';
            location.hash = target;
        });
    });
}

function initPlayerActivate() {
    document.querySelectorAll('.track-row').forEach((rowEl) => {
        if (rowEl.dataset.playerBound) return;
        rowEl.dataset.playerBound = '1';
        rowEl.addEventListener('click', () => {
            playFromDataset(
                {
                    musicId: rowEl.dataset.musicId,
                    audioUrl: rowEl.dataset.audioUrl,
                    title: rowEl.dataset.title,
                    artist: rowEl.dataset.artist,
                    coverUrl: rowEl.dataset.coverUrl,
                },
                rowEl,
                { restart: true }
            );
        });
    });

    const albumPlay = document.querySelector('.album-play');
    if (albumPlay && !albumPlay.dataset.playerBound) {
        albumPlay.dataset.playerBound = '1';
        albumPlay.addEventListener('click', (e) => {
            e.preventDefault();
            if (!audioPlayer.paused && audioPlayer.src) {
                pauseAudio();
                return;
            }

            playFromDataset(
                {
                    musicId: albumPlay.dataset.musicId,
                    audioUrl: albumPlay.dataset.audioUrl,
                    title: albumPlay.dataset.title,
                    artist: albumPlay.dataset.artist,
                    coverUrl: albumPlay.dataset.coverUrl,
                },
                null,
                { restart: true }
            );
        });
    }

    const bottomPlay = document.querySelector('.play-btn');
    if (bottomPlay && !bottomPlay.dataset.playerBound) {
        bottomPlay.dataset.playerBound = '1';
        bottomPlay.addEventListener('click', (e) => {
            e.preventDefault();
            if (!audioPlayer.paused && audioPlayer.src) {
                pauseAudio();
                return;
            }

            const sourceEl =
                activeTrackRow ||
                document.querySelector('.track-row.active') ||
                document.querySelector('.album-play');
            playFromDataset(
                {
                    musicId: sourceEl?.dataset?.musicId || '',
                    audioUrl: sourceEl?.dataset?.audioUrl || '',
                    title: sourceEl?.dataset?.title || '',
                    artist: sourceEl?.dataset?.artist || '',
                    coverUrl: sourceEl?.dataset?.coverUrl || '',
                },
                sourceEl?.classList?.contains('track-row') ? sourceEl : null
            );
        });
    }

    if (!audioEventsBound) {
        audioEventsBound = true;
        audioPlayer.addEventListener('ended', () => {
            setPlayButtonState(false);
            sessionStorage.removeItem('playerActive');
            setPlayerUIByHash();
            saveAudioState({ isPlaying: false, currentTime: 0 });
        });

        audioPlayer.addEventListener('timeupdate', () => {
            saveAudioState();
            updateProgressUI();
        });

        audioPlayer.addEventListener('pause', () => {
            saveAudioState({ isPlaying: false });
            updateProgressUI();
        });

        audioPlayer.addEventListener('play', () => {
            saveAudioState({ isPlaying: true });
            updateProgressUI();
        });

        audioPlayer.addEventListener('loadedmetadata', () => {
            updateProgressUI();
        });

        audioPlayer.addEventListener('seeked', () => {
            if (!isPendingSeek) return;
            isPendingSeek = false;
            updateProgressUI();
        });
    }

    if (seekBarEl && !seekBarEl.dataset.playerBound) {
        seekBarEl.dataset.playerBound = '1';
        seekBarEl.addEventListener('click', (e) => {
            commitSeek(e.clientX);
        });

        seekBarEl.addEventListener('pointerdown', (e) => {
            isSeeking = true;
            seekBarEl.setPointerCapture?.(e.pointerId);
            previewSeek(e.clientX);
        });

        seekBarEl.addEventListener('pointermove', (e) => {
            if (!isSeeking) return;
            previewSeek(e.clientX);
        });

        const finishSeek = (e) => {
            if (!isSeeking) return;
            isSeeking = false;
            commitSeek(e.clientX);
        };

        seekBarEl.addEventListener('pointerup', finishSeek);
        document.addEventListener('pointerup', finishSeek);
        seekBarEl.addEventListener(
            'touchstart',
            (e) => {
                const touch = e.touches && e.touches[0];
                if (!touch) return;
                isSeeking = true;
                previewSeek(touch.clientX);
            },
            { passive: true }
        );
        seekBarEl.addEventListener(
            'touchmove',
            (e) => {
                if (!isSeeking) return;
                const touch = e.touches && e.touches[0];
                if (!touch) return;
                previewSeek(touch.clientX);
            },
            { passive: true }
        );
        seekBarEl.addEventListener(
            'touchend',
            (e) => {
                if (!isSeeking) return;
                isSeeking = false;
                const touch = (e.changedTouches && e.changedTouches[0]) || null;
                if (!touch) return;
                commitSeek(touch.clientX);
            },
            { passive: true }
        );
        seekBarEl.addEventListener('pointercancel', () => {
            isSeeking = false;
            updateProgressUI();
        });
        document.addEventListener('pointercancel', () => {
            if (!isSeeking) return;
            isSeeking = false;
            updateProgressUI();
        });
        window.addEventListener('blur', () => {
            if (!isSeeking) return;
            isSeeking = false;
            updateProgressUI();
        });
    }

    if (volumeBarEl && !volumeBarEl.dataset.playerBound) {
        volumeBarEl.dataset.playerBound = '1';
        volumeBarEl.addEventListener('click', (e) => {
            setVolume(getVolumeRatio(e.clientX));
        });

        volumeBarEl.addEventListener('pointerdown', (e) => {
            isVolumeSeeking = true;
            volumeBarEl.setPointerCapture?.(e.pointerId);
            setVolume(getVolumeRatio(e.clientX));
        });

        volumeBarEl.addEventListener('pointermove', (e) => {
            if (!isVolumeSeeking) return;
            setVolume(getVolumeRatio(e.clientX), false);
        });

        const finishVolumeSeek = (e) => {
            if (!isVolumeSeeking) return;
            isVolumeSeeking = false;
            setVolume(getVolumeRatio(e.clientX));
        };

        volumeBarEl.addEventListener('pointerup', finishVolumeSeek);
        volumeBarEl.addEventListener('pointercancel', () => {
            isVolumeSeeking = false;
            updateVolumeUI();
        });
    }

    if (volumeBtnEl && !volumeBtnEl.dataset.playerBound) {
        volumeBtnEl.dataset.playerBound = '1';
        volumeBtnEl.addEventListener('click', () => {
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
    const closeBtn = document.querySelector('.player-close');
    if (!closeBtn || closeBtn.dataset.playerBound) return;
    closeBtn.dataset.playerBound = '1';
    closeBtn.addEventListener('click', () => {
        const homeUrl = `${window.location.pathname}${window.location.search}#home`;
        if (window.location.hash !== '#home') {
            window.history.pushState({}, '', homeUrl);
        } else {
            window.location.hash = '#home';
        }
        sessionStorage.removeItem('playerActive');
        document.body.classList.remove('show-player-ui');
        pauseAudio(false);
        clearAudioState();
        setPlayerUIByHash();
        setActiveByHash();
    });
}

function initPlayerOpenAlbum() {
    const playerBar = document.querySelector('.player-bar');
    if (!playerBar || playerBar.dataset.openAlbumBound) return;
    playerBar.dataset.openAlbumBound = '1';

    playerBar.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;

        const interactive = target.closest(
            "button, a, input, [role='button'], [role='slider'], .player-controls, .player-seekbar, .player-volume-bar, .player-close"
        );
        if (interactive) return;

        const sourceEl =
            activeTrackRow ||
            document.querySelector('.track-row.active') ||
            document.querySelector('.player-center .play-btn') ||
            document.querySelector('.album-play');

        const musicId = Number(sourceEl?.dataset?.musicId || 0);
        const currentUrl = new URL(window.location.href);
        currentUrl.hash = 'album';
        if (musicId > 0) currentUrl.searchParams.set('music_id', String(musicId));

        navigateWithoutReload(currentUrl.toString(), true).catch(() => {
            window.location.href = currentUrl.toString();
        });
    });
}

async function navigateWithoutReload(url, pushState = true) {
    saveAudioState();
    const response = await fetch(url, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    const finalUrl = response.url || url;

    if (!response.ok) {
        window.location.href = finalUrl;
        return;
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newMain = doc.querySelector('main.app-content');
    const currentMain = document.querySelector('main.app-content');

    if (!newMain || !currentMain) {
        window.location.href = finalUrl;
        return;
    }

    currentMain.replaceWith(newMain);
    document.title = doc.title || document.title;
    if (pushState) history.pushState({}, '', url);

    initSharedUI();
    refreshPlayerRefs();
    loadTrackDurations();
    initAlbumNav();
    initPlayerActivate();
    initAlbumAdd();
    initPlayerClose();
    initPlayerOpenAlbum();
    initSearchForms();
    initArtistFieldManager();
    initArtistPhotoPreview();
    setPlayerUIByHash();
    setActiveByHash();
    updatePathActiveLinks();
    updateProgressUI();
    updateVolumeUI();
}

function initPersistentNavigation() {
    if (navigationBound) return;
    navigationBound = true;

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        if (e.defaultPrevented) return;
        if (e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (link.target && link.target !== '_self') return;
        if (link.hasAttribute('download')) return;

        const href = link.getAttribute('href') || '';
        if (!href || href.startsWith('#')) return;

        let targetUrl;
        try {
            targetUrl = new URL(href, window.location.origin);
        } catch (_) {
            return;
        }

        if (targetUrl.origin !== window.location.origin) return;
        if (targetUrl.pathname.startsWith('/locale/')) return;
        if (targetUrl.pathname === '/login' || targetUrl.pathname === '/register' || targetUrl.pathname === '/logout') return;

        e.preventDefault();
        navigateWithoutReload(targetUrl.toString(), true).catch(() => {});
    });

    window.addEventListener('popstate', () => {
        navigateWithoutReload(window.location.href, false).catch(() => {});
    });
}

function runPlayerSetup() {
    initSharedUI();
    bindCarousel();
    refreshPlayerRefs();
    loadTrackDurations();
    const storedVolume = Number(localStorage.getItem(VOLUME_KEY));
    setVolume(Number.isFinite(storedVolume) ? storedVolume : 1, false);
    initAlbumNav();
    initPlayerActivate();
    initAlbumAdd();
    initPlayerClose();
    initPlayerOpenAlbum();
    initPersistentNavigation();
    initArtistFieldManager();
    initArtistPhotoPreview();
    setPlayerUIByHash();
    setActiveByHash();
    updatePathActiveLinks();
    updateProgressUI();
    updateVolumeUI();
}

function initPlayerApp() {
    setNavigateHandler(navigateWithoutReload);

    if (!playerHashBound) {
        playerHashBound = true;
        window.addEventListener('hashchange', setPlayerUIByHash);
    }

    if (!unloadBound) {
        unloadBound = true;
        window.addEventListener('beforeunload', () => {
            saveAudioState({}, true);
        });
    }

    if (!appBound) {
        appBound = true;
        if (document.readyState !== 'loading') {
            restoreAudioState();
            runPlayerSetup();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                restoreAudioState();
                runPlayerSetup();
            }, { once: true });
        }
        return;
    }

    runPlayerSetup();
}



global.OwazymPlayer = {
    initPlayerApp: initPlayerApp
};
})(window);

