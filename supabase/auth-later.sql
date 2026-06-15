-- ============================================================================
-- Protoboard — ужесточение доступа ПРИ ВКЛЮЧЕНИИ ВХОДА (на будущее)
--
-- ⚠️ СЕЙЧАС ЭТОТ ФАЙЛ ЗАПУСКАТЬ НЕ НУЖНО. Он нужен только в тот момент, когда
--    решишь включить вход в систему. Тогда последовательность такая:
--      1) в src/hooks/useAuth.js поставить AUTH_REQUIRED = true;
--      2) в Supabase → Authentication включить вход по e-mail (Email / Magic Link);
--      3) выполнить ЭТОТ файл в SQL Editor.
--
-- Что он делает: меняет правило доступа с «всем по ссылке» на «только вошедшим
-- пользователям». Таблицы, данные и файлы НЕ трогаются — заменяются лишь политики.
-- ============================================================================

-- ── Таблицы: доступ только авторизованным ───────────────────────────────────
drop policy if exists "open_projects"    on public.projects;
drop policy if exists "open_tasks"       on public.tasks;
drop policy if exists "open_attachments" on public.attachments;

create policy "authed_projects" on public.projects
  for all to authenticated using (true) with check (true);
create policy "authed_tasks" on public.tasks
  for all to authenticated using (true) with check (true);
create policy "authed_attachments" on public.attachments
  for all to authenticated using (true) with check (true);

-- ── Storage (скриншоты): тоже только авторизованным ─────────────────────────
drop policy if exists "shots_select" on storage.objects;
drop policy if exists "shots_insert" on storage.objects;
drop policy if exists "shots_delete" on storage.objects;

create policy "shots_select" on storage.objects
  for select to authenticated using (bucket_id = 'screenshots');
create policy "shots_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'screenshots');
create policy "shots_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'screenshots');

-- Примечание: если захочешь, чтобы превью скриншотов грузились даже без входа,
-- политику "shots_select" можно оставить открытой (to anon, authenticated).
