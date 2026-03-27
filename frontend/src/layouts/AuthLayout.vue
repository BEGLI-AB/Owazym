<template>
  <div class="auth-page-shell font-Ambassador">
    <SeasonOverlay />
    <router-view v-slot="{ Component, route: currentRoute }">
      <Transition name="page-soft" mode="out-in" appear>
        <div :key="currentRoute.fullPath" class="route-frame route-frame-auth">
          <component :is="Component" />
        </div>
      </Transition>
    </router-view>
  </div>
</template>

<script setup>
import SeasonOverlay from "../components/SeasonOverlay.vue";
</script>
