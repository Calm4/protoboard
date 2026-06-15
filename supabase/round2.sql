-- ============================================================================
-- Protoboard — порция 2 (выполнить ОДИН раз, ДО публикации нового кода)
--
-- SQL Editor → New query → вставить → Run. Делает две вещи:
--   1) добавляет цвет проекта (колонка color у projects);
--   2) переносит старые «Описания» в «Название» (мы объединяем эти поля).
-- Безопасно запускать повторно.
-- ============================================================================

-- 1. Цвет проекта (полоска слева / кружок у названия). NULL = цвет по умолчанию.
alter table public.projects add column if not exists color text;

-- 2. Переносим текст из description в title и очищаем description.
--    (description как колонку оставляем — она просто перестаёт использоваться.)
update public.tasks
   set title = title || E'\n' || description
 where description is not null and description <> '';

update public.tasks
   set description = ''
 where description <> '';
