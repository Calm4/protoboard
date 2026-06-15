-- ============================================================================
-- Protoboard — хранилище скриншотов (шаг 3)
--
-- Выполнить так же, как schema.sql: SQL Editor → New query → вставить → Run.
-- Создаёт публичный бакет "screenshots" и разрешает загрузку/просмотр/удаление
-- по ссылке (авторизации пока нет — как в брифе).
-- ============================================================================

-- Публичный бакет: файлы доступны по прямой ссылке (для показа превью).
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Разрешения на файлы этого бакета. На шаге 4 (вход) их можно будет сузить
-- до "только авторизованным" — менять нужно будет только этот блок.
drop policy if exists "shots_select" on storage.objects;
drop policy if exists "shots_insert" on storage.objects;
drop policy if exists "shots_delete" on storage.objects;

create policy "shots_select" on storage.objects
  for select using (bucket_id = 'screenshots');
create policy "shots_insert" on storage.objects
  for insert with check (bucket_id = 'screenshots');
create policy "shots_delete" on storage.objects
  for delete using (bucket_id = 'screenshots');
