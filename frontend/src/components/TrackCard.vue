<template>
  <div
    class="music-card bg-dark"
    :data-music-id="track.id"
    :data-audio-url="track.audio_url"
    :data-title="track.name"
    :data-artist="track.artist"
    :data-cover-url="track.cover_url"
    @click="$emit('play', track)"
  >
    <img :src="track.cover_url" :alt="track.name" @error="onImgError" />
    <div class="title">{{ track.name }}</div>
    <div class="artist">{{ track.artist }}</div>
  </div>
</template>

<script setup>
defineProps({
  track: {
    type: Object,
    required: true,
  },
});

const onImgError = (event) => {
  event.target.src = "/img/1.jpg";
};
</script>
