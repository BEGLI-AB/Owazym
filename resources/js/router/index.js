import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Album from '../pages/Album.vue';
import Search from '../pages/Search.vue';
import Playlist from '../pages/Playlist.vue';

const routes = [
    { path: '/', name: 'home', component: Home },
    { path: '/album', name: 'album', component: Album },
    { path: '/search', name: 'search', component: Search },
    { path: '/playlist', name: 'playlist', component: Playlist },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    if (to.path === '/' && to.hash === '#album') {
        return { path: '/album', query: to.query, replace: true };
    }

    if (to.path === '/album' && to.hash === '#home') {
        return { path: '/', query: to.query, replace: true };
    }

    return true;
});

export default router;
