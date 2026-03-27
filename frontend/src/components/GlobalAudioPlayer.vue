<template>
  <footer class="player-bar player-ui">
    <div class="player-left">
      <img src="/img/1.jpg" data-default-cover="/img/1.jpg" alt="Track" />
      <div>
        <div class="track-now">{{ t("track") }}</div>
        <div class="track-now-artist">{{ t("artist") }}</div>
      </div>
      <button class="icon-ghost" :aria-label="t('like')">
        <i class="bi bi-plus-lg"></i>
      </button>
    </div>

    <div class="player-center">
      <div class="player-controls">
        <button class="icon-ghost" :aria-label="t('previous')"><i class="bi bi-skip-backward-fill"></i></button>
        <button class="play-btn" :aria-label="t('start_listening')">
          <i class="bi bi-play-fill"></i>
        </button>
        <button class="icon-ghost" :aria-label="t('next')"><i class="bi bi-skip-forward-fill"></i></button>
      </div>
      <div class="player-progress">
        <span class="progress-current">0:00</span>
        <div class="progress-bar player-seekbar" role="slider" :aria-label="t('seek')">
          <span class="bar-fill player-progress-fill"></span>
        </div>
        <span class="progress-duration">0:00</span>
      </div>
    </div>

    <div class="player-right">
      <button class="icon-ghost player-volume-btn" :aria-label="t('mute_or_unmute')">
        <i class="bi bi-volume-up"></i>
      </button>
      <div class="volume-bar player-volume-bar" role="slider" :aria-label="t('volume')">
        <span class="bar-fill player-volume-fill" style="width: 100%"></span>
      </div>
      <button class="icon-ghost player-mode-btn player-right-mobile-action" type="button" :aria-label="t('play_mode')">
        <i class="bi bi-list"></i>
      </button>
      <button class="icon-ghost player-close" :aria-label="t('close_player')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from "../composables/useI18n";

const { t } = useI18n();
</script>
