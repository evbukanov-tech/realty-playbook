# Realty Playbook

Минимальный Next.js (App Router) + Prisma + Neon PostgreSQL, готовый к деплою на Vercel.

## Стек

- **Next.js 15** — TypeScript, App Router
- **Prisma** — ORM
- **Neon** — serverless PostgreSQL

## Быстрый старт (локально)

### 1. Установка зависимостей

```powershell
npm install
```

### 2. База Neon

1. Создайте проект на [neon.tech](https://neon.tech)
2. Скопируйте **pooled** и **direct** connection strings
3. Создайте `.env` из примера:

```powershell
Copy-Item .env.example .env
```

4. Заполните в `.env`:

```env
DATABASE_URL="postgresql://...?sslmode=require"      # pooled (для приложения)
DIRECT_URL="postgresql://...?sslmode=require"      # direct (для миграций)
```

### 3. Миграция и seed

```powershell
npx prisma migrate deploy
npm run db:seed
```

Для разработки с созданием новых миграций:

```powershell
npm run db:migrate
```

### 4. Запуск

```powershell
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — на главной странице отобразятся заметки из БД.

## Деплой на Vercel

1. Запушьте репозиторий в GitHub
2. Импортируйте проект в [Vercel](https://vercel.com)
3. В **Settings → Environment Variables** добавьте:
   - `DATABASE_URL` — pooled connection string из Neon
   - `DIRECT_URL` — direct connection string из Neon
4. Деплой: `build` автоматически выполнит `prisma generate`, `prisma migrate deploy` и `next build`

После деплоя выполните seed один раз (локально с production URL или через Neon SQL Editor):

```powershell
npm run db:seed
```

## Структура

```
prisma/
  schema.prisma    # модель Note
  seed.ts          # тестовые данные
  migrations/      # SQL-миграции
src/
  app/page.tsx     # чтение Note из БД
  lib/prisma.ts    # singleton Prisma Client
```

## Модель Note

| Поле      | Тип      |
|-----------|----------|
| id        | UUID     |
| title     | String   |
| createdAt | DateTime |
