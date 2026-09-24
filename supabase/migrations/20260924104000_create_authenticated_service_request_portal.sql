-- Applied to the existing TECH-UP Supabase project through its migration API.
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_type text not null check (service_type in ('tertiary_admissions','digital_training','printing_scanning','graphic_design','digital_admin','it_support','other')),
  subject text not null check (char_length(btrim(subject)) between 3 and 160),
  description text not null check (char_length(btrim(description)) between 10 and 3000),
  contact_phone text check (contact_phone is null or char_length(contact_phone) between 7 and 25),
  status text not null default 'submitted' check (status in ('submitted','in_review','awaiting_information','in_progress','completed','cancelled')),
  staff_response text not null default '' check (char_length(staff_response) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists service_requests_user_created_idx on public.service_requests(user_id, created_at desc);
create index if not exists service_requests_status_created_idx on public.service_requests(status, created_at desc);
alter table public.service_requests enable row level security;
create policy "service_requests_owner_select" on public.service_requests for select to authenticated using (user_id = (select auth.uid()));
create policy "service_requests_staff_select" on public.service_requests for select to authenticated using (public.is_staff('viewer'));
create policy "service_requests_owner_create" on public.service_requests for insert to authenticated with check (user_id = (select auth.uid()) and status = 'submitted' and staff_response = '');
create policy "service_requests_staff_update" on public.service_requests for update to authenticated using (public.is_staff('editor')) with check (public.is_staff('editor'));
create or replace function public.service_requests_guard() returns trigger language plpgsql set search_path = '' as $$
begin
 if tg_op = 'UPDATE' then
  if new.id is distinct from old.id or new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at then
   raise exception 'Request ownership and creation time are immutable';
  end if;
  new.updated_at := now();
 end if;
 return new;
end$$;
drop trigger if exists service_requests_guard_trigger on public.service_requests;
create trigger service_requests_guard_trigger before update on public.service_requests for each row execute function public.service_requests_guard();
revoke all on public.service_requests from anon;
grant select, insert, update on public.service_requests to authenticated;
