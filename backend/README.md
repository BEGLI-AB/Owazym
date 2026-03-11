# Backend (Node.js API)

## Stack

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT auth

## Quick start

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`.
3. Install dependencies:
   - `npm install`
4. Generate Prisma client:
   - `npm run prisma:generate`
5. Sync schema to PostgreSQL:
   - `npm run prisma:push`
6. Start API:
   - `npm run dev`

## PostgreSQL connection example

```env
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/owazym?schema=public"
```

## Migrate data from MySQL to PostgreSQL

If you still have old MySQL data, use `pgloader`:

```bash
pgloader mysql://root:password@127.0.0.1:3306/owazym postgresql://postgres:password@127.0.0.1:5432/owazym
```

Then run:

```bash
npm run prisma:generate
npm run prisma:push
```

Notes:
- Prisma schema keeps original Laravel table/column names via `@@map` and `@map`.
- IDs are still `BigInt`.
- Re-check admin/login/home/playlist flows after migration.

## API base

- `http://localhost:4000/api`

## Main endpoints

- `POST /login`
- `POST /register`
- `GET /user`
- `POST /logout`
- `GET /home`
- `GET /albums`
- `GET /tracks`
- `GET /artists`
- `GET /search`
- `GET /subscription`
- `POST /subscription`
- `GET /playlists`
- `POST /playlists`
- `POST /playlists/tracks`

## Useful Prisma commands

- `npm run prisma:validate`
- `npm run prisma:studio`
