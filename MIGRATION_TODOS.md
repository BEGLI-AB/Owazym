# Remaining TODOs

1. File uploads for create/update music, artist photos, and banner images are not yet implemented in Node (`multer` + storage path compatibility needed).
2. Admin CRUD endpoints for full create/edit/delete of artists/categories/music/banner are partially mapped (popular toggles done, full CRUD still pending).
3. Locale switching (`/locale/{locale}`) is not migrated yet; frontend i18n layer should be added if multilingual behavior is required.
4. Download endpoint currently returns resolved storage URL metadata; if strict file streaming headers are required, add direct stream/proxy download support.
5. Frontend visual parity with existing Blade design is intentionally simplified; replicate full current design tokens/components if exact UI parity is required.
6. Add tests:
   - backend integration tests for auth, playlist limits, subscription download limits
   - frontend store tests for player queue/repeat/shuffle behavior
7. Add role/`is_admin` fields to Prisma model if present in real database but absent in current migrations.
