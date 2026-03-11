# Laravel -> Node + Vue Migration Map

## 1) Laravel Analysis Summary

### Routes found
- `GET /login`, `POST /login`, `GET /register`, `POST /register`, `POST /logout`
- `GET /`, `GET /album`, `GET /album-data`, `GET /search`
- `POST /music/{music}/play`, `GET /music/{music}/download`
- `GET /playlist`, `POST /playlists`, `DELETE /playlists/{playlist}`
- `POST /playlist-tracks`, `DELETE /playlist-tracks`
- `GET /subscription`, `POST /subscription`
- `GET /artists`, `POST /artists`, `PATCH /artists/{artist}`, `DELETE /artists/{artist}`
- `POST /artists/{artist}/popular`, `DELETE /artists/{artist}/popular`
- `GET /categories`, `POST /categories`, `PATCH /categories/{category}`, `DELETE /categories/{category}`
- `GET /musics`, `POST /musics`, `PATCH /musics/{music}`, `DELETE /musics/{music}`
- `POST /musics/{music}/popular`, `DELETE /musics/{music}/popular`
- `GET /home-banner/create`, `POST /home-banner`, `DELETE /home-banner/{homeBanner}`
- `GET /locale/{locale}`, `GET /health`

### Controllers found
- `AuthController`: login/register/logout/session behavior
- `UserController`: home feed, album data, search/filter pages
- `MusicController`: list/create/update/delete, plays increment, download with plan limits, popular toggle
- `ArtistController`: list/create/update/delete, popular toggle
- `CategoryController`: list/create/update/delete
- `PlaylistController`: list/create/delete playlists with plan limits
- `PlaylistTrackController`: add/remove track in playlist
- `SubscriptionController`: plan summary + plan update
- `HomeBannerController`: create/update/delete latest banner
- `HomeController`: locale switch

### Models + DB entities found
- `users`, `artists`, `music`, `music_artist`, `years`, `languages`, `categories`
- `playlists`, `playlist_tracks`
- `home_banners`
- additional legacy `klips`, `sessions`

### Middleware/auth
- `auth`, `guest`, `admin` middleware on web routes
- admin resolved from `is_admin`, `role`, or username `"admin"`
- locale session middleware (`tm/ru/en`)

### Blade/page structure
- Main composed shell in `resources/views/layouts/app.blade.php`
- Dynamic sections in templates: home, album, search, playlist, subscription
- Admin Blade pages for create/edit/list entities
- Auth pages: login/register

### Legacy JS behavior found
- `public/js/player.js`: global audio state, seek/volume, queue mode, add-to-playlist, download, play counter
- `public/js/common.js`: theme, navbar/sidebar, search form interception, manual route-ish handlers
- `public/js/app-init.js`: bootstraps shared/player modules
- `public/js/search.js`: modal filter opener
- old dynamic mounting used DOM template cloning and custom route events

## 2) Route/Controller Migration Map

| Laravel | Node API | Vue Route/Page |
|---|---|---|
| `GET /` (`UserController@index`) | `GET /api/home` | `/` (`HomePage.vue`) |
| `GET /album` + `/album-data` | `GET /api/albums` and `GET /api/albums/:id` | `/album/:id?` (`AlbumPage.vue`) |
| `GET /search` | `GET /api/search` | `/search` (`SearchPage.vue`) |
| `POST /music/{id}/play` | `POST /api/tracks/:id/play` | called from player store |
| `GET /music/{id}/download` | `GET /api/tracks/:id/download` | download action in SPA |
| `GET /artists` | `GET /api/artists` | home/search/artist views |
| `GET artist detail` (implicit) | `GET /api/artists/:id` | `/artist/:id` (`ArtistPage.vue`) |
| `GET /musics` list behavior | `GET /api/tracks` | list/search cards |
| auth routes | `/api/login`, `/api/register`, `/api/user`, `/api/logout` | `/login`, `/register`, `/profile` |
| playlist routes | `/api/playlists*` | `/playlist` (`PlaylistPage.vue`) |
| subscription routes | `/api/subscription` `GET/POST` | `/subscription` |
| admin popular toggles | `/api/admin/musics/:id/popular`, `/api/admin/artists/:id/popular` | admin SPA controls (TODO UI) |

## 3) Controller -> Node Service Mapping

- `UserController` -> `library.service.js` (`getHome`, `getAlbumData`, `listTracks/search`)
- `MusicController` -> `library.service.js` (`incrementPlay`, `getDownloadInfo`, `markMusicPopular`)
- `ArtistController` -> `library.service.js` (`listArtists`, `getArtistById`, `markArtistPopular`)
- `PlaylistController` + `PlaylistTrackController` -> `playlist.service.js`
- `AuthController` -> `auth.service.js`
- `SubscriptionController` -> `library.service.js` (`getSubscriptionSummary`, `updateSubscription`)

## 4) Eloquent -> Prisma model mapping

- `User` -> `model User`
- `Artist` -> `model Artist`
- `Music` -> `model Music`
- `Music::artists()` -> `model MusicArtist` join table
- `Playlist` + `playlist_tracks` -> `model Playlist`, `model PlaylistTrack`
- `Category`, `Language`, `Year` -> direct Prisma models
- `HomeBanner` -> `model HomeBanner`

## 5) Blade -> Vue Component/Page mapping

- `layouts/app.blade.php` shell -> `layouts/MainLayout.vue`
- Home cards/sections -> `pages/HomePage.vue` + `components/TrackCard.vue`
- Album page template -> `pages/AlbumPage.vue`
- Search page + filters -> `pages/SearchPage.vue`
- Playlist template -> `pages/PlaylistPage.vue`
- Subscription page -> `pages/SubscriptionPage.vue`
- Auth blades -> `pages/LoginPage.vue`, `pages/RegisterPage.vue`
- Profile dropdown data -> `pages/ProfilePage.vue`
- Footer player UI -> `components/GlobalAudioPlayer.vue`

## 6) Legacy JS replacement notes

- Removed need for hash-based page switching and template injection.
- Replaced custom navigation (`__owazymNavigate`, `owazym:route-changed`) with Vue Router.
- Replaced manual global player state in `sessionStorage` with Pinia `player` store persisted in `localStorage`.
- Preserved key behaviors:
  - single global audio instance
  - play/pause/seek/volume
  - queue, repeat, shuffle
  - play count API call when track starts
  - playlist add/remove flow via API

## 7) New Folder Structure

```text
/backend
  /prisma
    schema.prisma
  /src
    /config
    /controllers
    /middlewares
    /routes
    /services
    /utils
    /validators
    app.js
    server.js

/frontend
  /src
    /assets
    /components
    /layouts
    /pages
    /router
    /services
    /store
    App.vue
    main.js
```
