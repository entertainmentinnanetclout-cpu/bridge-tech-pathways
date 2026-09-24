-- Applied to TECH-UP Supabase project wwtxsvvnwwbjsqsdjfpn on 2026-09-24.
-- A generic ALL policy granted editors DELETE; use explicit policies instead.
begin;
drop policy if exists programs_staff_write on public.programs;
create policy programs_staff_insert on public.programs for insert to authenticated with check (public.is_staff('editor'));
create policy programs_staff_update on public.programs for update to authenticated using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy programs_staff_delete on public.programs for delete to authenticated using (public.is_staff('admin'));

drop policy if exists opportunities_staff_write on public.opportunities;
create policy opportunities_staff_insert on public.opportunities for insert to authenticated with check (public.is_staff('editor'));
create policy opportunities_staff_update on public.opportunities for update to authenticated using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy opportunities_staff_delete on public.opportunities for delete to authenticated using (public.is_staff('admin'));

drop policy if exists events_staff_write on public.events;
create policy events_staff_insert on public.events for insert to authenticated with check (public.is_staff('editor'));
create policy events_staff_update on public.events for update to authenticated using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy events_staff_delete on public.events for delete to authenticated using (public.is_staff('admin'));

drop policy if exists sections_staff_write on public.content_sections;
create policy sections_staff_insert on public.content_sections for insert to authenticated with check (public.is_staff('editor'));
create policy sections_staff_update on public.content_sections for update to authenticated using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy sections_staff_delete on public.content_sections for delete to authenticated using (public.is_staff('admin'));
commit;
