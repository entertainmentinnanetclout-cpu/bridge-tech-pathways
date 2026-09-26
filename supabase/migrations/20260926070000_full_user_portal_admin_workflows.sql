-- Applied to TECH-UP Supabase project wwtxsvvnwwbjsqsdjfpn.
-- Adds user profiles, applications, course enrolments, assistance, notifications and realtime feeds.
begin;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  phone text,
  province text,
  municipality text,
  school_name text,
  current_stage text not null default 'prospective_student'
    check (current_stage in ('prospective_student','matriculant','tvet_student','university_student','graduate','job_seeker','employed','entrepreneur','other')),
  highest_qualification text,
  interests text[] not null default '{}',
  onboarding_completed boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_profiles_created_idx on public.user_profiles(created_at desc);
create index if not exists user_profiles_stage_idx on public.user_profiles(current_stage);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 3 and 160),
  slug text not null unique,
  summary text not null default '',
  description text not null default '',
  provider text not null default 'TECH-UP',
  delivery_mode text not null default 'in_person'
    check (delivery_mode in ('in_person','online','hybrid')),
  location text,
  duration text,
  start_date date,
  end_date date,
  capacity integer check (capacity is null or capacity > 0),
  image_url text,
  external_url text,
  application_required boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft','published','closed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists courses_status_start_idx on public.courses(status, start_date);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_type text not null
    check (application_type in ('tertiary','tvet','bursary','course','internship','employment','other')),
  institution text,
  programme text not null,
  qualification_level text,
  academic_year integer not null default extract(year from now())::integer,
  notes text not null default '',
  status text not null default 'draft'
    check (status in ('draft','submitted','in_review','awaiting_information','ready_to_submit','submitted_to_institution','offer_received','unsuccessful','withdrawn','closed')),
  reference_number text,
  staff_response text not null default '',
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists applications_user_created_idx on public.applications(user_id, created_at desc);
create index if not exists applications_status_created_idx on public.applications(status, created_at desc);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  motivation text not null default '',
  status text not null default 'interested'
    check (status in ('interested','applied','enrolled','waitlisted','completed','cancelled')),
  staff_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_id, user_id)
);
create index if not exists course_enrollments_user_idx on public.course_enrollments(user_id, created_at desc);
create index if not exists course_enrollments_status_idx on public.course_enrollments(status, created_at desc);

create table if not exists public.assistance_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null
    check (category in ('application_help','course_guidance','bursary_help','document_help','career_guidance','digital_help','accessibility','other')),
  subject text not null check (char_length(btrim(subject)) between 3 and 160),
  description text not null check (char_length(btrim(description)) between 10 and 4000),
  priority text not null default 'normal' check (priority in ('normal','high','urgent')),
  status text not null default 'open'
    check (status in ('open','assigned','waiting_user','in_progress','resolved','closed')),
  staff_response text not null default '',
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists assistance_requests_user_idx on public.assistance_requests(user_id, created_at desc);
create index if not exists assistance_requests_status_idx on public.assistance_requests(status, priority, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  kind text not null default 'update',
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(user_id, read_at) where read_at is null;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end
$$;

drop trigger if exists user_profiles_touch on public.user_profiles;
create trigger user_profiles_touch before update on public.user_profiles for each row execute function public.touch_updated_at();
drop trigger if exists courses_touch on public.courses;
create trigger courses_touch before update on public.courses for each row execute function public.touch_updated_at();
drop trigger if exists applications_touch on public.applications;
create trigger applications_touch before update on public.applications for each row execute function public.touch_updated_at();
drop trigger if exists course_enrollments_touch on public.course_enrollments;
create trigger course_enrollments_touch before update on public.course_enrollments for each row execute function public.touch_updated_at();
drop trigger if exists assistance_requests_touch on public.assistance_requests;
create trigger assistance_requests_touch before update on public.assistance_requests for each row execute function public.touch_updated_at();

create or replace function public.sync_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_profiles (id,email,full_name,phone,current_stage,updated_at)
  values (
    new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name',''),
    coalesce(new.phone,new.raw_user_meta_data ->> 'phone'),
    coalesce(nullif(new.raw_user_meta_data ->> 'current_stage',''),'prospective_student'), now()
  )
  on conflict (id) do update set
    email=excluded.email,
    full_name=case when btrim(coalesce(public.user_profiles.full_name,''))='' then excluded.full_name else public.user_profiles.full_name end,
    phone=coalesce(public.user_profiles.phone,excluded.phone),
    updated_at=now();
  return new;
end
$$;
revoke all on function public.sync_user_profile() from public, anon, authenticated;
drop trigger if exists techup_sync_user_profile on auth.users;
create trigger techup_sync_user_profile after insert or update of email,phone,raw_user_meta_data on auth.users
for each row execute function public.sync_user_profile();

insert into public.user_profiles (id,email,full_name,phone,current_stage,created_at,updated_at)
select u.id,u.email,coalesce(u.raw_user_meta_data ->> 'full_name',''),
coalesce(u.phone,u.raw_user_meta_data ->> 'phone'),
coalesce(nullif(u.raw_user_meta_data ->> 'current_stage',''),'prospective_student'),
u.created_at,now() from auth.users u on conflict (id) do nothing;

create or replace function public.application_owner_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not public.is_staff('editor') then
    if new.user_id is distinct from old.user_id
      or new.reference_number is distinct from old.reference_number
      or new.staff_response is distinct from old.staff_response
      or new.created_at is distinct from old.created_at then
      raise exception 'Protected application fields cannot be changed';
    end if;
    if new.status not in ('draft','submitted','awaiting_information','withdrawn') then
      raise exception 'This application status can only be changed by TECH-UP staff';
    end if;
    if old.status not in ('draft','submitted','awaiting_information') then
      raise exception 'This application is locked for staff review';
    end if;
  end if;
  if new.status='submitted' and old.status is distinct from 'submitted' and new.submitted_at is null then new.submitted_at:=now(); end if;
  return new;
end
$$;
drop trigger if exists applications_owner_guard_trigger on public.applications;
create trigger applications_owner_guard_trigger before update on public.applications
for each row execute function public.application_owner_guard();

create or replace function public.profile_owner_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.id is distinct from old.id or new.created_at is distinct from old.created_at then raise exception 'Profile identity fields are immutable'; end if;
  if not public.is_staff('admin') and new.email is distinct from old.email then new.email:=old.email; end if;
  return new;
end
$$;
drop trigger if exists user_profiles_owner_guard_trigger on public.user_profiles;
create trigger user_profiles_owner_guard_trigger before update on public.user_profiles
for each row execute function public.profile_owner_guard();

create or replace function public.notification_owner_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not public.is_staff('editor') then
    new.user_id:=old.user_id; new.title:=old.title; new.body:=old.body; new.kind:=old.kind;
    new.href:=old.href; new.created_at:=old.created_at;
  end if;
  return new;
end
$$;
drop trigger if exists notifications_owner_guard_trigger on public.notifications;
create trigger notifications_owner_guard_trigger before update on public.notifications
for each row execute function public.notification_owner_guard();

create or replace function public.create_workflow_notification()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target_href text; target_title text; target_body text; target_user uuid;
begin
  target_user:=new.user_id;
  if tg_table_name='applications' then
    target_href:='/portal/applications';
    target_title:=case when tg_op='INSERT' then 'Application created' else 'Application updated' end;
    target_body:=case when tg_op='INSERT' then 'Your '||replace(new.application_type,'_',' ')||' application for '||new.programme||' has been added.'
      else 'Your application status is now '||replace(new.status,'_',' ')||'.' end;
  elsif tg_table_name='course_enrollments' then
    target_href:='/portal/courses';
    target_title:=case when tg_op='INSERT' then 'Course interest recorded' else 'Course enrolment updated' end;
    target_body:=case when tg_op='INSERT' then 'Your course interest has been recorded.'
      else 'Your course enrolment status is now '||replace(new.status,'_',' ')||'.' end;
  elsif tg_table_name='assistance_requests' then
    target_href:='/portal/assistance';
    target_title:=case when tg_op='INSERT' then 'Assistance request received' else 'Assistance request updated' end;
    target_body:=case when tg_op='INSERT' then 'TECH-UP received your request for assistance.'
      else 'Your assistance request status is now '||replace(new.status,'_',' ')||'.' end;
  elsif tg_table_name='service_requests' then
    target_href:='/services'; target_title:='Service request updated';
    target_body:='Your service request status is now '||replace(new.status,'_',' ')||'.';
  else return new; end if;

  if tg_op='INSERT' or new.status is distinct from old.status
    or (tg_table_name in ('applications','assistance_requests','service_requests') and new.staff_response is distinct from old.staff_response) then
    insert into public.notifications(user_id,title,body,kind,href)
    values(target_user,target_title,target_body,'workflow',target_href);
  end if;
  return new;
end
$$;
revoke all on function public.create_workflow_notification() from public, anon, authenticated;
drop trigger if exists applications_notify on public.applications;
create trigger applications_notify after insert or update on public.applications for each row execute function public.create_workflow_notification();
drop trigger if exists course_enrollments_notify on public.course_enrollments;
create trigger course_enrollments_notify after insert or update on public.course_enrollments for each row execute function public.create_workflow_notification();
drop trigger if exists assistance_requests_notify on public.assistance_requests;
create trigger assistance_requests_notify after insert or update on public.assistance_requests for each row execute function public.create_workflow_notification();
drop trigger if exists service_requests_notify on public.service_requests;
create trigger service_requests_notify after update on public.service_requests for each row execute function public.create_workflow_notification();

alter table public.user_profiles enable row level security;
alter table public.courses enable row level security;
alter table public.applications enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.assistance_requests enable row level security;
alter table public.notifications enable row level security;

create policy user_profiles_owner_select on public.user_profiles for select to authenticated using (id=(select auth.uid()));
create policy user_profiles_owner_update on public.user_profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy user_profiles_staff_select on public.user_profiles for select to authenticated using (public.is_staff('viewer'));
create policy user_profiles_staff_update on public.user_profiles for update to authenticated using (public.is_staff('admin')) with check (public.is_staff('admin'));

create policy courses_public_read on public.courses for select to anon,authenticated using (status='published' or public.is_staff('viewer'));
create policy courses_staff_insert on public.courses for insert to authenticated with check (public.is_staff('editor'));
create policy courses_staff_update on public.courses for update to authenticated using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy courses_staff_delete on public.courses for delete to authenticated using (public.is_staff('admin'));

create policy applications_owner_select on public.applications for select to authenticated using (user_id=(select auth.uid()));
create policy applications_owner_insert on public.applications for insert to authenticated with check (
  user_id=(select auth.uid()) and status in ('draft','submitted') and coalesce(reference_number,'')='' and staff_response=''
);
create policy applications_owner_update on public.applications for update to authenticated
using (user_id=(select auth.uid()) and status in ('draft','submitted','awaiting_information'))
with check (user_id=(select auth.uid()) and status in ('draft','submitted','awaiting_information','withdrawn'));
create policy applications_staff_select on public.applications for select to authenticated using (public.is_staff('viewer'));
create policy applications_staff_update on public.applications for update to authenticated using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy applications_staff_delete on public.applications for delete to authenticated using (public.is_staff('admin'));

create policy enrollments_owner_select on public.course_enrollments for select to authenticated using (user_id=(select auth.uid()));
create policy enrollments_owner_insert on public.course_enrollments for insert to authenticated with check (user_id=(select auth.uid()) and status in ('interested','applied'));
create policy enrollments_staff_select on public.course_enrollments for select to authenticated using (public.is_staff('viewer'));
create policy enrollments_staff_update on public.course_enrollments for update to authenticated using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy enrollments_staff_delete on public.course_enrollments for delete to authenticated using (public.is_staff('admin'));

create policy assistance_owner_select on public.assistance_requests for select to authenticated using (user_id=(select auth.uid()));
create policy assistance_owner_insert on public.assistance_requests for insert to authenticated with check (
  user_id=(select auth.uid()) and status='open' and staff_response='' and assigned_to is null
);
create policy assistance_staff_select on public.assistance_requests for select to authenticated using (public.is_staff('viewer'));
create policy assistance_staff_update on public.assistance_requests for update to authenticated using (public.is_staff('editor')) with check (public.is_staff('editor'));
create policy assistance_staff_delete on public.assistance_requests for delete to authenticated using (public.is_staff('admin'));

create policy notifications_owner_select on public.notifications for select to authenticated using (user_id=(select auth.uid()));
create policy notifications_owner_update on public.notifications for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy notifications_staff_select on public.notifications for select to authenticated using (public.is_staff('viewer'));
create policy notifications_staff_insert on public.notifications for insert to authenticated with check (public.is_staff('editor'));

grant select,update on public.user_profiles to authenticated;
grant select on public.courses to anon,authenticated;
grant insert,update,delete on public.courses to authenticated;
grant select,insert,update,delete on public.applications to authenticated;
grant select,insert,update,delete on public.course_enrollments to authenticated;
grant select,insert,update,delete on public.assistance_requests to authenticated;
grant select,update,insert on public.notifications to authenticated;

do $$
declare t text;
begin
  foreach t in array array['user_profiles','applications','courses','course_enrollments','assistance_requests','notifications','service_requests']
  loop
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I',t);
    end if;
  end loop;
end
$$;

commit;
