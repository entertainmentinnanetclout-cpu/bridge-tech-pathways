# TECH-UP: GitHub + Supabase launch checklist

This project is maintained in `entertainmentinnanetclout-cpu/bridge-tech-pathways` and uses the existing Supabase project `wwtxsvvnwwbjsqsdjfpn`. Lovable is not required for code changes. The public TECH-UP Tertiary Intake is still the external Tally form at https://tally.so/r/gDPYa4; no Tally applicant records are imported into Supabase by this release.

## First super admin — one-time setup

As of the first release, `auth.users` and `public.staff_roles` have no entries. A public user-signup screen is deliberately not available. In **Supabase Dashboard → Authentication → Users**, invite the owner's chosen admin email address securely and have that person complete their account setup. In the Supabase SQL editor, find their UUID and grant them the role, using the actual UUID:

```sql
select id, email, email_confirmed_at from auth.users order by created_at desc;
-- Replace the UUID below with the confirmed owner account ID from the query above.
insert into public.staff_roles (user_id, role)
values ('REPLACE_WITH_CONFIRMED_OWNER_AUTH_UUID', 'super_admin');
```

Do not create an admin for an unverified or guessed email. Do not put passwords or a Supabase service-role key in the GitHub repository, browser source or chat. Once bootstrapped, sign in at `/admin/sign-in` and grant subsequent staff roles through `/admin/staff`. Staff management accepts **existing Auth user UUIDs**, not email invitations.

## Roles

- `viewer`: overview, content listing and inquiry read access.
- `editor`: viewer access plus create/edit programmes, opportunities, events and content.
- `admin`: editor access plus content deletion, inquiry status/notes and website settings.
- `super_admin`: admin access plus staff-role management.

Row-level-security policies enforce these privileges in Supabase; hiding a button is not a substitute for database access control. The SQL under `supabase/migrations` records policy changes **already applied** to the existing TECH-UP project on 2026-09-24. Do not blindly re-run migrations against a different project.

## Hosting and environment

Publish the intended deployment branch through the GitHub-linked hosting project. Configure the public Supabase URL and **publishable** key as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if required by the hosting configuration. The repository contains public-key fallbacks only; do not add service-role or database credentials to frontend variables. Confirm the deployed origin is authorised in **Supabase Auth → URL Configuration → Redirect URLs**, including `https://YOUR_ACTUAL_DOMAIN/admin/sign-in` for staff password recovery. The canonical and Open Graph URLs must be updated to the **actual** production domain before the public launch.

## Acceptance tests before merging/publishing

1. Confirm GitHub Actions production build, TypeScript and ESLint correctness checks pass. Repository-wide legacy Prettier formatting has been excluded from the correctness lint gate; normalise formatting in a separate maintenance change.
2. Confirm visitor homepage renders with the supplied founder portrait and TECH-UP logo, and all official Tally intake links work.
3. Submit a real, consented test inquiry. Confirm the Edge Function responds successfully and the resulting entry appears in the admin inbox. Never submit sensitive personal or academic records to the generic contact form.
4. Confirm an unauthenticated visitor and a signed-in user without a staff role cannot read inquiries or write content. Test each staff role's allowed and denied database operations.
5. Create/edit/publish one test programme, opportunity, event and announcement; verify published public visibility, drafts remain private, and deletion requires admin privileges.
6. Exercise sign-out, session persistence and password recovery using the configured deployment origin.
7. Verify mobile navigation, forms and accessibility in a real browser, and confirm the production deployment reaches READY.

Contact submissions are stored in `contact_inquiries`. The official Tally form stores tertiary-intake submissions separately. This release does not promise university admission or guaranteed placement.
