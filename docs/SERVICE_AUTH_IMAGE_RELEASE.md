# TECH-UP service portal and image release

## Images

The previous logo and two director photos were JSON pointers to ` /__l5e/assets-v1/... `, a preview-only image proxy. They are not image files stored in this repository and cannot be relied upon in external hosting. The header, footer, admin portal and service portal now use `public/favicon.png` plus the TECH-UP wordmark. The existing founder photo is served from `public/techup-founder.jpg`. Other directors show branded initials rather than broken image icons. To restore the actual photographs, obtain the original `keamogetswe-soma.jpg` and `kgatoentle-chimoya.jpg` from their owners, commit the binaries under `public/leadership/`, and update `src/components/site/Leadership.tsx` image paths. Do **not** fabricate substitute portraits.

## Service-account flows

Public navigation: Home > My services > register/sign in > create request > monitor requests. Registration and password recovery use Supabase Auth. Service users may create and read only their own service requests; only authorized staff can update statuses and the response shown to the requester. Staff enter via `/admin/sign-in`, and manage requests at `/admin/services`. A service user is not a staff member. The applicant portal does not submit an institutional admission application: the pre-existing Tally form remains the official tertiary-intake channel.

## Supabase Auth deployment settings

1. In the *Tech Up* project, configure Authentication > URL Configuration: set the Site URL to the actual HTTPS production origin and add `https://<your-real-production-host>/services`, `https://<your-real-production-host>/services/sign-in`, and `https://<your-real-production-host>/services/sign-in?recovery=1` to Redirect URLs. For a preview smoke test, include that precise preview origin temporarily; do not allow broad wildcards in production. Retain the existing `/admin/sign-in` redirect for staff password recovery.
2. Confirm that Email provider and email confirmation are enabled; configure working SMTP for transactional email and appropriate rate limits and CAPTCHA for a public launch. Set the email templates and sender branding; never place an SMTP secret or service role key in browser variables or GitHub.
3. Test registration and email confirmation with a real inbox; test login, persisted session, sign-out, forgot/reset password, new request and history refresh. Use a *second independent user* to verify requests are isolated, and confirm an ordinary user cannot access `/admin` or change request status by direct API calls. Test staff request updates once an invited staff Auth user and its `staff_roles` record are set up securely.
4. The new `service_requests` migration has already been applied to Tech Up Supabase and versioned under `supabase/migrations/`. RLS is enabled. Verify it after any future schema update.

## Release limitation

A green compile/build and a successful Vercel deployment do not establish real email deliverability, account registration or end-to-end row-security acceptance without verified test users and the production redirect configuration. Service intake is an enquiry and tracking workflow; no payment gateway, document upload or automatic external admission filing has been added.
