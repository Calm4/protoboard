-- ============================================================================
-- Protoboard — схема базы данных (шаг 2)
--
-- Как выполнить:
--   1. Открой свой проект на supabase.com
--   2. Слева в меню: SQL Editor → New query
--   3. Вставь ВЕСЬ этот файл и нажми Run
--   4. Должно написать "Success". Таблицы появятся в разделе Table Editor.
--
-- Скрипт безопасно запускать повторно (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================================

-- ── Таблица проектов ────────────────────────────────────────────────────────
create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  build      text not null default 'v0.1',   -- версия проекта, напр. "v0.4"
  archived   boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Таблица задач ───────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  title       text not null default 'Новая задача',
  description text not null default '',
  notes       text not null default '',       -- доп. условия / инфо
  priority    text not null default 'med'  check (priority in ('high','med','low')),
  status      text not null default 'todo' check (status   in ('todo','check','done')),
  platform    text not null default 'both' check (platform in ('ios','android','both')),
  version     text not null default '',       -- билд, в котором найдено
  sort_order  integer not null default 0,     -- порядок в колонке
  created_at  timestamptz not null default now()
);

-- ── Таблица скриншотов ──────────────────────────────────────────────────────
-- Сами файлы будут лежать в Supabase Storage (bucket "screenshots", шаг 3),
-- здесь хранится только путь к файлу и его имя.
create table if not exists public.attachments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  file_path  text not null,                   -- путь в Storage
  name       text not null default '',
  created_at timestamptz not null default now()
);

-- ── Индексы (чтобы выборки были быстрыми) ────────────────────────────────────
create index if not exists tasks_project_id_idx       on public.tasks(project_id);
create index if not exists attachments_task_id_idx    on public.attachments(task_id);

-- ── Realtime: живое обновление у всех ───────────────────────────────────────
-- Добавляем таблицы в публикацию, чтобы изменения сразу прилетали всем клиентам.
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.attachments;

-- ── Доступ (RLS) ────────────────────────────────────────────────────────────
-- Включаем защиту на уровне строк (так Supabase требует для доступа из браузера)
-- и пока разрешаем читать/писать ВСЕМ, у кого есть ссылка и публичный ключ —
-- авторизации ещё нет (доступ по ссылке, как в брифе).
--
-- ВАЖНО: на шаге 4, когда добавим вход, эти разрешающие политики заменим на
-- "только авторизованным" — менять надо будет только этот блок, не таблицы.
alter table public.projects    enable row level security;
alter table public.tasks       enable row level security;
alter table public.attachments enable row level security;

drop policy if exists "open_projects"    on public.projects;
drop policy if exists "open_tasks"       on public.tasks;
drop policy if exists "open_attachments" on public.attachments;

create policy "open_projects"    on public.projects    for all using (true) with check (true);
create policy "open_tasks"       on public.tasks       for all using (true) with check (true);
create policy "open_attachments" on public.attachments for all using (true) with check (true);
