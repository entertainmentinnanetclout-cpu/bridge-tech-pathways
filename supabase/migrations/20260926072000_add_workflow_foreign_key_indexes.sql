-- Applied to TECH-UP Supabase project wwtxsvvnwwbjsqsdjfpn.
create index if not exists admin_audit_log_actor_idx
on public.admin_audit_log(actor);

create index if not exists assistance_requests_assigned_to_idx
on public.assistance_requests(assigned_to)
where assigned_to is not null;
