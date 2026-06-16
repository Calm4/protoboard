-- ============================================================================
-- Protoboard — номера задач (id для багов). Выполнить ОДИН раз, ДО публикации.
--
-- Добавляет у задач колонку num (порядковый номер в рамках проекта, #1, #2, …)
-- и проставляет номера всем существующим задачам по их текущему порядку.
-- Безопасно запускать повторно (новым проставит, существующие не тронет).
-- ============================================================================
alter table public.tasks add column if not exists num integer;

with ranked as (
  select id,
         row_number() over (partition by project_id order by sort_order asc, created_at asc) as rn
    from public.tasks
)
update public.tasks t
   set num = r.rn
  from ranked r
 where t.id = r.id and t.num is null;
