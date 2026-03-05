<script setup>
import { onMounted, ref } from 'vue';

const mountPoint = ref(null);
const emitRouteReady = () => {
    requestAnimationFrame(() => {
        window.dispatchEvent(new Event('owazym:route-changed'));
    });
};

onMounted(() => {
    const host = mountPoint.value;
    if (!host) return;

    const tpl = document.getElementById('vue-home-template');
    if (!(tpl instanceof HTMLTemplateElement)) {
        host.innerHTML = '<section class="spotify-section"><h3>Home</h3></section>';
        emitRouteReady();
        return;
    }

    host.replaceChildren(tpl.content.cloneNode(true));
    emitRouteReady();
});
</script>

<template>
    <div ref="mountPoint"></div>
</template>
