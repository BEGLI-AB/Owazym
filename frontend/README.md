# Frontend (Vue 3 SPA)

## Setup

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
2. Install dependencies:
   - `npm install`
3. Start:
   - `npm run dev`

## Notes

- Uses Vue Router for navigation.
- Uses Pinia for auth/player state.
- Uses Axios service modules only for API calls.
- Global player is mounted in layout outside `<router-view>` so it survives route changes.
