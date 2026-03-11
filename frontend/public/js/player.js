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

function getAuthToken() {
    try {
        return localStorage.getItem('owazym_token') || sessionStorage.getItem('owazym_session_token') || '';
    } catch (_) {
        return '';
    }
}

function withAuthHeaders(headers = {}) {
    const token = getAuthToken();
    if (!token) return headers;
    return {
        ...headers,
        Authorization: `Bearer ${token}`,
    };
}

function unwrapPayload(payload) {
    if (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object') {
        return payload.data;
    }
    return payload;
}

const initSharedUI = OwazymCommon.initSharedUI || function () {};
const bindCarousel = OwazymCommon.bindCarousel || function () {};
const setActiveByHash = OwazymCommon.setActiveByHash || function () {};
const updatePathActiveLinks = OwazymCommon.updatePathActiveLinks || function () {};
const initSearchForms = OwazymCommon.initSearchForms || function () {};
const initArtistPhotoPreview = OwazymCommon.initArtistPhotoPreview || function () {};
const initArtistFieldManager = OwazymCommon.initArtistFieldManager || function () {};
const audioPlayer = new Audio();
let activeTrackRow = null;
const AUDIO_STATE_KEY = 'owazym_audio_state_v1';
const VOLUME_KEY = 'owazym_player_volume_v1';
const PENDING_TRACK_KEY = 'owazym_pending_track_v1';
const PLAY_MODE_KEY = 'owazym_play_mode_v1';
const AUDIO_STATE_THROTTLE_MS = 1200;
const PLAY_MODES = ['ordered', 'shuffle', 'repeat_one'];
const DEFAULT_JS_I18N = {
    playlist_name_prompt: 'Playlist name:',
    playlist_name_default: 'My Playlist',
    choose_playlist_prompt: 'Choose playlist number:',
    or_type_new_playlist_name: 'Or type a new playlist name',
    playlist_modal_title: 'Add to playlist',
    playlist_select_label: 'Select playlist',
    playlist_new_label: 'Or create new playlist',
    playlist_choose_placeholder: 'Choose playlist',
    playlist_create_placeholder: 'New playlist name',
    playlist_modal_add: 'Add',
    playlist_modal_cancel: 'Cancel',
    playlist_name_required: 'Enter playlist name.',
    track_not_selected: 'Track not selected.',
    track_already_in_playlist: 'This track is already in this playlist.',
    failed_add_track_playlist: 'Failed to add track to playlist.',
    failed_create_playlist: 'Failed to create playlist.',
    failed_download_track: 'Failed to download track.',
};
let jsI18n = { ...DEFAULT_JS_I18N };

let appBound = false;
let audioEventsBound = false;
let playerHashBound = false;
let unloadBound = false;
let routeChangeBound = false;
let routeRebindScheduled = false;
let themeFixBound = false;

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
let lastAlbumDataQuery = '';
let playMode = localStorage.getItem(PLAY_MODE_KEY) || 'ordered';
if (!PLAY_MODES.includes(playMode)) playMode = 'ordered';

function loadJsI18n() {
    const i18nDataEl = document.getElementById('i18nData');
    if (!i18nDataEl) return;
    try {
        const parsed = JSON.parse(i18nDataEl.textContent || '{}');
        if (parsed && typeof parsed === 'object') {
            jsI18n = { ...jsI18n, ...parsed };
        }
    } catch (_) {}
}

function t(key) {
    return jsI18n[key] || DEFAULT_JS_I18N[key] || key;
}

function ensureLightThemePatchStyles() {
    if (document.getElementById('owazymLightModeJsPatch')) return;
    const style = document.createElement('style');
    style.id = 'owazymLightModeJsPatch';
    style.textContent = `
body.light.owazym-light-fix .genre-panel {
  background: linear-gradient(150deg, rgba(255,255,255,0.96), rgba(246,249,255,0.92)) !important;
  border: 1px solid rgba(15, 23, 42, 0.12) !important;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  backdrop-filter: none !important;
}
body.light.owazym-light-fix .genre-panel::before {
  opacity: 0.08 !important;
}
body.light.owazym-light-fix .genre-panel::after {
  background: linear-gradient(105deg, rgba(255,255,255,0.92) 0%, rgba(248,251,255,0.78) 58%, rgba(243,246,253,0.68) 100%) !important;
}
body.light.owazym-light-fix .popular-genres-title,
body.light.owazym-light-fix .genre-panel__head h5,
body.light.owazym-light-fix .genre-track-card .title {
  color: #0f172a !important;
}
body.light.owazym-light-fix .genre-panel__head small {
  color: #475569 !important;
}
body.light.owazym-light-fix .genre-track-card {
  background: rgba(255, 255, 255, 0.92) !important;
  border: 1px solid rgba(15, 23, 42, 0.1) !important;
  border-radius: 14px !important;
  padding: 8px 10px !important;
}
body.light.owazym-light-fix .album-page {
  background:
    radial-gradient(120% 95% at 8% 8%, rgba(99, 156, 255, 0.18) 0%, rgba(99, 156, 255, 0) 58%),
    radial-gradient(95% 82% at 100% 14%, rgba(255, 170, 132, 0.16) 0%, rgba(255, 170, 132, 0) 60%),
    linear-gradient(180deg, #edf3ff 0%, #f5f8ff 100%) !important;
  border: 1px solid rgba(15, 23, 42, 0.08);
}
body.light.owazym-light-fix .album-close {
  background: rgba(255, 255, 255, 0.92) !important;
  border: 1px solid rgba(15, 23, 42, 0.18) !important;
  color: #0f172a !important;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
}
body.light.owazym-light-fix .album-title,
body.light.owazym-light-fix .album-meta,
body.light.owazym-light-fix .track-title {
  color: #0f172a !important;
}
body.light.owazym-light-fix .track-artist,
body.light.owazym-light-fix .track-time,
body.light.owazym-light-fix .track-num,
body.light.owazym-light-fix .album-tracklist .tracklist-head {
  color: #475569 !important;
}
body.light.owazym-light-fix .album-tracklist .track-row {
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}
body.light.owazym-light-fix .album-tracklist .track-row.active {
  background: rgba(37, 99, 235, 0.14) !important;
}
body.light.owazym-light-fix .album-icon,
body.light.owazym-light-fix .track-add {
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid rgba(15, 23, 42, 0.14) !important;
  color: #0f172a !important;
}
`;
    document.head.appendChild(style);
}

function applyLightModeFixes() {
    ensureLightThemePatchStyles();
    const isLight = document.body.classList.contains('light');
    document.body.classList.toggle('owazym-light-fix', isLight);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function persistPlayMode() {
    localStorage.setItem(PLAY_MODE_KEY, playMode);
}

function getPlayModeUi(mode) {
    if (mode === 'shuffle') {
        return { icon: 'bi-shuffle', label: 'Shuffle playback' };
    }
    if (mode === 'repeat_one') {
        return { icon: 'bi-repeat-1', label: 'Repeat current track' };
    }
    return { icon: 'bi-list-ol', label: 'Play in order' };
}

function updatePlayModeUI() {
    const { icon: iconClass, label } = getPlayModeUi(playMode);
    document.querySelectorAll('.player-mode-btn').forEach((modeBtn) => {
        const icon = modeBtn.querySelector('i');
        if (!icon) return;
        icon.className = `bi ${iconClass}`;
        modeBtn.classList.toggle('is-shuffle', playMode === 'shuffle');
        modeBtn.classList.toggle('is-repeat-one', playMode === 'repeat_one');
        modeBtn.setAttribute('aria-label', label);
        modeBtn.setAttribute('title', label);
    });
}

function getTrackRows() {
    return Array.from(document.querySelectorAll('.track-row'));
}

function getCurrentMusicId() {
    return (
        Number(activeTrackRow?.dataset?.musicId || 0) ||
        Number(document.querySelector('.track-row.active')?.dataset?.musicId || 0) ||
        Number(document.querySelector('.album-play')?.dataset?.musicId || 0) ||
        Number(document.querySelector('.play-btn')?.dataset?.musicId || 0)
    );
}

function getAdjacentTrackRow(direction) {
    const rows = getTrackRows();
    if (!rows.length) return null;

    const currentMusicId = getCurrentMusicId();
    let currentIndex = rows.findIndex((row) => Number(row.dataset.musicId || 0) === currentMusicId);
    if (currentIndex < 0) currentIndex = 0;

    if (playMode === 'shuffle') {
        if (rows.length === 1) return rows[0];
        let randomIndex = currentIndex;
        while (randomIndex === currentIndex) {
            randomIndex = Math.floor(Math.random() * rows.length);
        }
        return rows[randomIndex] || rows[0];
    }

    const nextIndex = direction > 0
        ? (currentIndex + 1) % rows.length
        : (currentIndex - 1 + rows.length) % rows.length;
    return rows[nextIndex] || null;
}

function playFromRow(row) {
    if (!row) return;
    playFromDataset(
        {
            musicId: row.dataset.musicId,
            audioUrl: row.dataset.audioUrl,
            title: row.dataset.title,
            artist: row.dataset.artist,
            coverUrl: row.dataset.coverUrl,
        },
        row,
        { restart: true }
    );
}

function initPlayModeButton() {
    const modeButtons = Array.from(document.querySelectorAll('.player-mode-btn'));
    updatePlayModeUI();
    modeButtons.forEach((modeBtn) => {
        if (modeBtn.dataset.playerBound) return;
        modeBtn.dataset.playerBound = '1';
        modeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentIndex = PLAY_MODES.indexOf(playMode);
            playMode = PLAY_MODES[(currentIndex + 1) % PLAY_MODES.length];
            persistPlayMode();
            updatePlayModeUI();
        });
    });
}

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
    const onAlbumPage = hash === '#album' || window.location.pathname === '/album';
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

    const addBtn = document.querySelector('.album-page .album-actions .album-add');
    if (addBtn && musicId != null) addBtn.dataset.musicId = String(musicId);

    const downloadBtn = document.querySelector('.album-page .album-actions .album-download');
    if (downloadBtn && musicId != null) downloadBtn.dataset.musicId = String(musicId);
}

function savePendingTrackFromElement(el) {
    if (!el || !el.dataset) return;
    const musicId = Number(el.dataset.musicId || 0);
    if (!musicId) return;

    const payload = {
        musicId: String(musicId),
        audioUrl: el.dataset.audioUrl || '',
        title: el.dataset.title || '',
        artist: el.dataset.artist || '',
        coverUrl: el.dataset.coverUrl || '',
    };
    sessionStorage.setItem(PENDING_TRACK_KEY, JSON.stringify(payload));
}

function applyPendingTrackSelection() {
    const raw = sessionStorage.getItem(PENDING_TRACK_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_TRACK_KEY);

    let data;
    try {
        data = JSON.parse(raw);
    } catch (_) {
        return;
    }
    if (!data || !data.musicId) return;

    const targetRow = document.querySelector(`.track-row[data-music-id="${data.musicId}"]`);
    if (targetRow) {
        document.querySelectorAll('.track-row.active').forEach((row) => row.classList.remove('active'));
        targetRow.classList.add('active');
        activeTrackRow = targetRow;
        updateAlbumHero({
            musicId: targetRow.dataset.musicId,
            audioUrl: targetRow.dataset.audioUrl,
            title: targetRow.dataset.title,
            artist: targetRow.dataset.artist,
            coverUrl: targetRow.dataset.coverUrl,
        });
        return;
    }

    updateAlbumHero(data);
}

function syncAlbumSelectionFromQuery() {
    const params = new URLSearchParams(window.location.search || '');
    const musicId = Number(params.get('music_id') || 0);
    if (!musicId) return;

    const targetRow = document.querySelector(`.track-row[data-music-id="${musicId}"]`);
    if (!targetRow) return;

    document.querySelectorAll('.track-row.active').forEach((row) => row.classList.remove('active'));
    targetRow.classList.add('active');
    activeTrackRow = targetRow;

    updateAlbumHero({
        musicId: targetRow.dataset.musicId,
        audioUrl: targetRow.dataset.audioUrl,
        title: targetRow.dataset.title,
        artist: targetRow.dataset.artist,
        coverUrl: targetRow.dataset.coverUrl,
    });
}

function renderAlbumTracklistFromData(tracks, featuredId) {
    const tracklistEl = document.querySelector('.album-tracklist');
    if (!tracklistEl) return;
    const head = tracklistEl.querySelector('.tracklist-head');
    if (!head) return;

    tracklistEl.querySelectorAll('.track-row').forEach((row) => row.remove());
    activeTrackRow = null;

    (tracks || []).slice(0, 8).forEach((track) => {
        const row = document.createElement('div');
        row.className = `track-row ${Number(track.id) === Number(featuredId) ? 'active' : ''}`;
        row.dataset.musicId = String(track.id || '');
        row.dataset.audioUrl = track.audio_url || '';
        row.dataset.title = track.title || '';
        row.dataset.artist = track.artist || '';
        row.dataset.coverUrl = track.cover_url || '';

        const num = document.createElement('span');
        num.className = 'track-num';
        num.textContent = String(Number(track.plays || 0));

        const main = document.createElement('div');
        main.className = 'track-main';

        const title = document.createElement('div');
        title.className = 'track-title';
        title.textContent = track.title || '';

        const artist = document.createElement('div');
        artist.className = 'track-artist';
        artist.textContent = track.artist || '';

        const time = document.createElement('div');
        time.className = 'track-time text-end';
        time.textContent = '--:--';

        main.appendChild(title);
        main.appendChild(artist);
        row.appendChild(num);
        row.appendChild(main);
        row.appendChild(time);
        tracklistEl.appendChild(row);

        if (row.classList.contains('active')) activeTrackRow = row;
    });
}

function updateTrackPlayCountInUi(musicId, plays) {
    const id = Number(musicId || 0);
    if (!id) return;

    document
        .querySelectorAll(`.track-row[data-music-id="${id}"] .track-num`)
        .forEach((el) => {
            el.textContent = String(Number(plays || 0));
        });
}

async function incrementTrackPlayCount(musicId) {
    const id = Number(musicId || 0);
    if (!id) return;

    try {
        const response = await fetch(`/music/${id}/play`, {
            method: 'POST',
            headers: withAuthHeaders({
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': getCsrfToken(),
            }),
            body: JSON.stringify({}),
        });
        if (!response.ok) return;
        const payload = unwrapPayload(await response.json());
        updateTrackPlayCountInUi(id, Number(payload?.plays || 0));
    } catch (_) {}
}

async function refreshAlbumDataFromQuery(force = false) {
    if (window.location.pathname !== '/album') return;
    const query = window.location.search || '';
    if (!force && query === lastAlbumDataQuery) return;
    lastAlbumDataQuery = query;

    try {
        const response = await fetch(`/album-data${query}`, {
            headers: withAuthHeaders({ 'X-Requested-With': 'XMLHttpRequest' }),
        });
        if (!response.ok) return;

        const payload = unwrapPayload(await response.json());
        const featured = payload?.featured || null;
        const coverEl = document.querySelector('.album-page .album-cover img');
        if (coverEl) {
            const heroCover = payload?.hero_cover_url || featured?.hero_cover_url || featured?.cover_url || coverEl.dataset.defaultCover || coverEl.getAttribute('src') || '';
            coverEl.dataset.lockCover = payload?.lock_album_cover ? '1' : '0';
            coverEl.dataset.defaultCover = heroCover;
            coverEl.src = heroCover;
        }

        if (featured) {
            updateAlbumHero({
                musicId: featured.id,
                audioUrl: featured.audio_url,
                title: featured.title,
                artist: featured.artist,
                coverUrl: featured.cover_url,
            });
        }

        renderAlbumTracklistFromData(payload?.tracks || [], featured?.id || 0);
        initPlayerActivate();
        loadTrackDurations();
        syncAlbumSelectionFromQuery();
    } catch (_) {}
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

function getPlaylistDataFromPage() {
    const script = document.getElementById('playlistData');
    if (!script) return [];
    try {
        const parsed = JSON.parse(script.textContent || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((item) => ({
                id: Number(item?.id || 0),
                name: String(item?.name || '').trim(),
            }))
            .filter((item) => item.id > 0 && item.name !== '');
    } catch (_) {
        return [];
    }
}

function setPlaylistDataOnPage(playlists) {
    const script = document.getElementById('playlistData');
    if (!script) return;
    script.textContent = JSON.stringify(playlists || []);
}

async function createPlaylist(name) {
    const token = getCsrfToken();
    const response = await fetch('/playlists', {
        method: 'POST',
        headers: withAuthHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': token,
        }),
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        let message = t('failed_create_playlist');
        try {
            const payload = await response.json();
            if (payload?.message) message = String(payload.message);
        } catch (_) {}
        throw new Error(message);
    }
    return unwrapPayload(await response.json());
}

function parseDownloadFileName(disposition) {
    const raw = String(disposition || '');
    const starMatch = raw.match(/filename\*=UTF-8''([^;]+)/i);
    if (starMatch && starMatch[1]) return decodeURIComponent(starMatch[1]);
    const regularMatch = raw.match(/filename=\"?([^\";]+)\"?/i);
    if (regularMatch && regularMatch[1]) return regularMatch[1];
    return 'track.mp3';
}

async function downloadTrackById(musicId) {
    const response = await fetch(`/music/${musicId}/download`, {
        method: 'GET',
        headers: withAuthHeaders({
            Accept: 'application/json, application/octet-stream',
            'X-Requested-With': 'XMLHttpRequest',
        }),
    });

    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (!response.ok || contentType.includes('application/json')) {
        let message = t('failed_download_track');
        try {
            const payload = await response.json();
            if (payload?.message) message = String(payload.message);
        } catch (_) {}
        throw new Error(message);
    }

    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const fileName = parseDownloadFileName(disposition);
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
}

function askPlaylistChoiceLegacy(playlists) {
    if (!Array.isArray(playlists) || playlists.length === 0) {
        const firstName = window.prompt(t('playlist_name_prompt'), t('playlist_name_default'));
        const name = (firstName || '').trim();
        if (!name) return { action: 'cancel' };
        return { action: 'new', name };
    }

    const lines = playlists.map((item, idx) => `${idx + 1}. ${item.name}`).join('\n');
    const value = window.prompt(
        `${t('choose_playlist_prompt')}\n${lines}\n\n${t('or_type_new_playlist_name')}`,
        '1'
    );
    if (value == null) return { action: 'cancel' };

    const trimmed = String(value).trim();
    if (!trimmed) return { action: 'cancel' };

    const index = Number(trimmed);
    if (Number.isInteger(index) && index >= 1 && index <= playlists.length) {
        return { action: 'existing', playlist: playlists[index - 1] };
    }

    return { action: 'new', name: trimmed };
}

function ensurePlaylistAddModal() {
    let modalEl = document.getElementById('playlistAddModal');
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.className = 'modal fade';
        modalEl.id = 'playlistAddModal';
        modalEl.tabIndex = -1;
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content bg-black text-white border border-secondary-subtle">
                <div class="modal-header border-secondary-subtle">
                  <h5 class="modal-title">${escapeHtml(t('playlist_modal_title'))}</h5>
                  <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="${escapeHtml(t('playlist_modal_cancel'))}"></button>
                </div>
                <div class="modal-body">
                  <form class="playlist-add-form d-flex flex-column gap-2" data-playlist-add-form>
                    <div class="playlist-field bg-dark rounded-3 p-2">
                      <label class="form-label mb-1 text-white-50">${escapeHtml(t('playlist_select_label'))}</label>
                      <select class="form-select bg-dark text-white border-secondary" data-playlist-select></select>
                    </div>
                    <div class="playlist-field bg-dark rounded-3 p-2">
                      <label class="form-label mb-1 text-white-50">${escapeHtml(t('playlist_new_label'))}</label>
                      <input type="text" class="form-control bg-dark text-white border-secondary" maxlength="120" data-playlist-name-input placeholder="${escapeHtml(t('playlist_create_placeholder'))}">
                    </div>
                    <div class="small text-danger d-none" data-playlist-error></div>
                    <div class="modal-footer playlist-add-footer border-secondary-subtle d-flex px-0 pb-0 mb-0">
                      <button type="button" class="btn btn-outline-light flex-fill" data-bs-dismiss="modal">${escapeHtml(t('playlist_modal_cancel'))}</button>
                      <button type="submit" class="btn btn-primary flex-fill" data-playlist-submit>${escapeHtml(t('playlist_modal_add'))}</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        `;
        document.body.appendChild(modalEl);
    }
    return {
        modalEl,
        formEl: modalEl.querySelector('[data-playlist-add-form]'),
        selectEl: modalEl.querySelector('[data-playlist-select]'),
        inputEl: modalEl.querySelector('[data-playlist-name-input]'),
        errorEl: modalEl.querySelector('[data-playlist-error]'),
        submitEl: modalEl.querySelector('[data-playlist-submit]'),
    };
}

function buildPlaylistChoice(playlists, selectedId, newName) {
    const existingId = Number(selectedId || 0);
    if (existingId > 0) {
        const existing = playlists.find((item) => Number(item.id) === existingId);
        if (existing) return { action: 'existing', playlist: existing };
    }
    const proposed = String(newName || '').trim();
    if (!proposed) return { action: 'cancel' };
    return { action: 'new', name: proposed };
}

function pickPlaylistForAddViaModal(playlists) {
    if (!global.bootstrap?.Modal) return Promise.resolve(null);
    const { modalEl, formEl, selectEl, inputEl, errorEl, submitEl } = ensurePlaylistAddModal();
    if (!formEl || !selectEl || !inputEl || !errorEl || !submitEl) return Promise.resolve({ action: 'cancel' });

    const options = ['<option value="">' + escapeHtml(t('playlist_choose_placeholder')) + '</option>']
        .concat(
            playlists.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`)
        );
    selectEl.innerHTML = options.join('');
    inputEl.value = '';
    errorEl.classList.add('d-none');
    errorEl.textContent = '';
    submitEl.disabled = false;

    const modal = global.bootstrap.Modal.getOrCreateInstance(modalEl, {
        backdrop: true,
        keyboard: true,
        focus: true,
    });

    return new Promise((resolve) => {
        let settled = false;
        const finish = (value) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };

        const cleanup = () => {
            formEl.removeEventListener('submit', onSubmit);
            modalEl.removeEventListener('hidden.bs.modal', onHidden);
        };

        const onHidden = () => {
            cleanup();
            finish({ action: 'cancel' });
        };

        const onSubmit = (e) => {
            e.preventDefault();
            errorEl.classList.add('d-none');
            errorEl.textContent = '';

            const choice = buildPlaylistChoice(playlists, selectEl.value, inputEl.value);
            if (choice.action === 'cancel') {
                errorEl.textContent = t('playlist_name_required');
                errorEl.classList.remove('d-none');
                return;
            }

            cleanup();
            finish(choice);
            modal.hide();
        };

        modalEl.addEventListener('hidden.bs.modal', onHidden);
        formEl.addEventListener('submit', onSubmit);
        modal.show();
    });
}

async function pickPlaylistForAdd() {
    const playlists = getPlaylistDataFromPage();
    const hasModalApi = Boolean(global.bootstrap?.Modal);
    let choice = hasModalApi ? await pickPlaylistForAddViaModal(playlists) : null;
    if (!hasModalApi) {
        choice = askPlaylistChoiceLegacy(playlists);
    }
    if (!choice || choice.action === 'cancel') return null;

    if (choice.action === 'existing') return choice.playlist;

    const proposedName =
        choice.name ||
        window.prompt(t('playlist_name_prompt'), t('playlist_name_default'))?.trim();

    if (!proposedName) return null;

    const createResult = await createPlaylist(proposedName);
    const playlist = {
        id: Number(createResult?.playlist?.id || 0),
        name: String(createResult?.playlist?.name || proposedName).trim(),
    };

    if (playlist.id > 0) {
        const next = [...playlists];
        if (!next.some((item) => Number(item.id) === playlist.id)) {
            next.push(playlist);
            setPlaylistDataOnPage(next);
        }
    }

    return playlist;
}

async function addMusicToPlaylist(musicId, playlistId) {
    const token = getCsrfToken();
    const response = await fetch('/playlist-tracks', {
        method: 'POST',
        headers: withAuthHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': token,
        }),
        body: JSON.stringify({ music_id: musicId, playlist_id: playlistId }),
    });

    if (!response.ok) throw new Error('Failed to add track');
    return unwrapPayload(await response.json());
}

function initAlbumAdd() {
    document.querySelectorAll('.album-add').forEach((addBtn) => {
        if (addBtn.dataset.playerBound) return;
        addBtn.dataset.playerBound = '1';
        addBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const musicId =
                Number(addBtn.dataset.musicId || 0) ||
                Number(addBtn.closest('.track-row')?.dataset?.musicId || 0) ||
                Number(activeTrackRow?.dataset?.musicId || 0) ||
                Number(document.querySelector('.album-play')?.dataset?.musicId || 0);

            if (!musicId) {
                alert(t('track_not_selected'));
                return;
            }

            try {
                setAlbumAddButtonState(addBtn, 'pending');
                const playlist = await pickPlaylistForAdd();
                if (!playlist?.id) {
                    setAlbumAddButtonState(addBtn, 'idle');
                    return;
                }

                const result = await addMusicToPlaylist(musicId, playlist.id);
                if (!result?.added) {
                    setAlbumAddButtonState(addBtn, 'idle');
                    alert(t('track_already_in_playlist'));
                    return;
                }
                setAlbumAddButtonState(addBtn, 'done');
            } catch (error) {
                setAlbumAddButtonState(addBtn, 'idle');
                alert(error?.message || t('failed_add_track_playlist'));
            }
        });
    });
}

function initAlbumDownload() {
    document.querySelectorAll('.album-download').forEach((downloadBtn) => {
        if (downloadBtn.dataset.playerBound) return;
        downloadBtn.dataset.playerBound = '1';
        downloadBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const musicId =
                Number(downloadBtn.dataset.musicId || 0) ||
                Number(activeTrackRow?.dataset?.musicId || 0) ||
                Number(document.querySelector('.album-play')?.dataset?.musicId || 0);

            if (!musicId) {
                alert(t('track_not_selected'));
                return;
            }

            const icon = downloadBtn.querySelector('i');
            if (icon) icon.className = 'bi bi-hourglass-split';
            downloadBtn.disabled = true;

            try {
                await downloadTrackById(musicId);
                if (icon) icon.className = 'bi bi-check-lg';
            } catch (error) {
                alert(error?.message || t('failed_download_track'));
                if (icon) icon.className = 'bi bi-download';
                downloadBtn.disabled = false;
                return;
            }

            setTimeout(() => {
                if (icon) icon.className = 'bi bi-download';
                downloadBtn.disabled = false;
            }, 1000);
        });
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
                incrementTrackPlayCount(data.musicId);
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

function navigateWithRouter(url) {
    const navigate = window.__owazymNavigate;
    if (typeof navigate === 'function') {
        return Promise.resolve(navigate(url));
    }

    window.location.href = url;
    return Promise.resolve();
}

function initAlbumNav() {
    const triggers = document.querySelectorAll('[data-hash], .music-card[data-url]');
    triggers.forEach((el) => {
        if (el.dataset.albumNavBound) return;
        el.dataset.albumNavBound = '1';
        el.addEventListener('click', (e) => {
            savePendingTrackFromElement(el);
            const targetUrl = el.getAttribute('data-url');
            if (targetUrl) {
                e.preventDefault();
                navigateWithRouter(targetUrl).catch(() => {
                    location.href = targetUrl;
                });
                return;
            }
            const target = el.getAttribute('data-hash') || '#album';
            const path = target === '#album' ? '/album' : '/';
            e.preventDefault();
            navigateWithRouter(path).catch(() => {
                location.href = path;
            });
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

    const forwardBtn = document
        .querySelector('.player-controls .bi-skip-forward-fill')
        ?.closest('button');
    if (forwardBtn && !forwardBtn.dataset.playerBound) {
        forwardBtn.dataset.playerBound = '1';
        forwardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const nextRow = getAdjacentTrackRow(1);
            playFromRow(nextRow);
        });
    }

    const backwardBtn = document
        .querySelector('.player-controls .bi-skip-backward-fill')
        ?.closest('button');
    if (backwardBtn && !backwardBtn.dataset.playerBound) {
        backwardBtn.dataset.playerBound = '1';
        backwardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const prevRow = getAdjacentTrackRow(-1);
            playFromRow(prevRow);
        });
    }

    if (!audioEventsBound) {
        audioEventsBound = true;
        audioPlayer.addEventListener('ended', () => {
            if (playMode === 'repeat_one') {
                audioPlayer.currentTime = 0;
                audioPlayer.play().catch(() => {});
                return;
            }

            const nextRow = getAdjacentTrackRow(1);
            if (nextRow) {
                playFromRow(nextRow);
                return;
            }

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
    document.querySelectorAll('.player-close').forEach((closeBtn) => {
        if (closeBtn.dataset.playerBound) return;
        closeBtn.dataset.playerBound = '1';
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('playerActive');
            document.body.classList.remove('show-player-ui');
            pauseAudio(false);
            clearAudioState();
            setPlayerUIByHash();
            setActiveByHash();
        });
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
        const currentUrl = new URL('/album', window.location.origin);
        if (musicId > 0) currentUrl.searchParams.set('music_id', String(musicId));

        navigateWithRouter(currentUrl.toString()).catch(() => {
            window.location.href = currentUrl.toString();
        });
    });
}

function runPlayerSetup() {
    loadJsI18n();
    initPlayModeButton();
    initSharedUI();
    bindCarousel();
    refreshPlayerRefs();
    loadTrackDurations();
    const storedVolume = Number(localStorage.getItem(VOLUME_KEY));
    setVolume(Number.isFinite(storedVolume) ? storedVolume : 1, false);
    initAlbumNav();
    initPlayerActivate();
    initAlbumAdd();
    initAlbumDownload();
    initPlayerClose();
    initPlayerOpenAlbum();
    applyPendingTrackSelection();
    syncAlbumSelectionFromQuery();
    refreshAlbumDataFromQuery();
    initArtistFieldManager();
    initArtistPhotoPreview();
    setPlayerUIByHash();
    setActiveByHash();
    updatePathActiveLinks();
    updateProgressUI();
    updateVolumeUI();
    applyLightModeFixes();
}

function rebindAfterRouteChange() {
    if (routeRebindScheduled) return;
    routeRebindScheduled = true;

    requestAnimationFrame(() => {
        routeRebindScheduled = false;
        initSharedUI();
        refreshPlayerRefs();
        loadTrackDurations();
        initAlbumNav();
        initPlayerActivate();
        initAlbumAdd();
        initAlbumDownload();
        initPlayerClose();
        initPlayerOpenAlbum();
        applyPendingTrackSelection();
        syncAlbumSelectionFromQuery();
        refreshAlbumDataFromQuery();
        initSearchForms();
        initArtistFieldManager();
        initArtistPhotoPreview();
        setPlayerUIByHash();
        setActiveByHash();
        updatePathActiveLinks();
        updateProgressUI();
        updateVolumeUI();
        applyLightModeFixes();
    });
}

function initPlayerApp() {
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

    if (!routeChangeBound) {
        routeChangeBound = true;
        window.addEventListener('owazym:route-changed', rebindAfterRouteChange);
    }

    if (!themeFixBound) {
        themeFixBound = true;
        window.addEventListener('owazym:theme-changed', applyLightModeFixes);
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

