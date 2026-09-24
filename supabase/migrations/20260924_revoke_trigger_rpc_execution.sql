-- Already applied in the TECH-UP Supabase project on 2026-09-24.
-- Trigger functions are called by triggers; they do not need to be exposed as callable RPC endpoints.
revoke execute on function public.prevent_last_super_admin() from public, anon, authenticated;
