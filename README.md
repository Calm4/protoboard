# Protoboard

Веб-трекер задач и багов по прототипам мобильных игр для команды. Упрощённая Asana:
один проект = один прототип игры. Доступ по ссылке, изменения видны всем в реальном времени.

## Стек

- **React + Vite** — интерфейс.
- **Supabase** — база (Postgres), живое обновление (Realtime), хранилище скриншотов (Storage).
- **Cloudflare Pages** — хостинг (деплой из этого GitHub-репозитория).

## Структура

```
src/
  App.jsx              — главный компонент, состояние интерфейса
  hooks/
    useProjects.js     — вся работа с данными (чтение/запись/Realtime/Storage)
    useAuth.js         — задел под вход в систему (сейчас выключен)
  lib/supabase.js      — подключение к Supabase
  components/          — экраны: проекты, доска, список, панель задачи и т.д.
  styles.js            — стили интерфейса
supabase/
  schema.sql           — таблицы (выполнить один раз при настройке)
  storage.sql          — бакет для скриншотов
  auth-later.sql       — ужесточение доступа при включении входа (на будущее)
docs/                  — бриф и оригинальный прототип интерфейса
```

## Локальный запуск

1. `npm install`
2. Создать файл `.env.local` в корне (см. `.env.example`) и вписать ключи Supabase:
   ```
   VITE_SUPABASE_URL=https://<твой-проект>.supabase.co
   VITE_SUPABASE_ANON_KEY=<publishable / anon ключ>
   ```
3. `npm run dev` → открыть http://localhost:5173/

## Деплой (Cloudflare Pages)

Подключить репозиторий к Cloudflare Pages и указать:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Переменные окружения** (Settings → Environment variables): `VITE_SUPABASE_URL` и
  `VITE_SUPABASE_ANON_KEY` — те же значения, что в `.env.local`.

Файл `.env.local` в репозиторий не попадает (он в `.gitignore`) — ключи задаются в настройках Cloudflare.

## Включить вход в систему позже (без переделки)

1. В `src/hooks/useAuth.js` поставить `AUTH_REQUIRED = true`.
2. В Supabase → Authentication включить вход по e-mail (Magic Link).
3. Выполнить `supabase/auth-later.sql`.
