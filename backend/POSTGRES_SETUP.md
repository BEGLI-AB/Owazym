# PostgreSQL Migration Guide

## 1. Prepare PostgreSQL

Create DB:

```sql
CREATE DATABASE owazym;
```

## 2. Configure backend env

In `backend/.env` set:

```env
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/owazym?schema=public"
```

## 3. Apply Prisma schema

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:push
```

If `prisma generate` fails with `EPERM` on Windows, stop all running Node processes for this project and run it again.

## 4. (Optional) migrate existing MySQL data

Use `pgloader`:

```bash
pgloader mysql://root:password@127.0.0.1:3306/owazym postgresql://postgres:password@127.0.0.1:5432/owazym
```

Then run:

```bash
npm run prisma:push
```

## 5. Start backend

```bash
npm run dev
```

## Notes

- Table and column names stay compatible via Prisma `@@map` / `@map`.
- IDs remain `BigInt`.
- After migration verify: login/register, home feed, player interactions, playlists, admin create/delete actions.
