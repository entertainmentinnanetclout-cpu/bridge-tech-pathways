# TECH-UP Digital-Rural Empowerment NPC — Public Website

A single-page premium public website (no backend, no auth, no database). All intake actions link out to the official Tally form in a new tab.

## Brand & design language

Palette derived from the supplied logo: deep teal, turquoise, fresh/lime green, warm golden-yellow accent, white and very light neutral surfaces, charcoal-teal body text. Tokens defined in `src/styles.css` (oklch) — no hardcoded colour classes. Rounded-but-restrained radii, generous whitespace, editorial rhythm alternating split layouts, feature grids, timelines and full-width bands. Subtle path/circuit motifs as SVG, not neon or purple-gradient AI styling.

The uploaded logo is used as-is (CDN asset pointer) in header and footer, and downscaled into `public/favicon.png`.

## Page structure (all on `/`)

1. **SiteHeader** — sticky, compact; logo left; nav Home / About / What We Do / Tertiary Support / Our Approach / FAQ; primary CTA "Start Tertiary Intake" → Tally (new tab). Mobile: slide-out sheet menu.
2. **Hero** — eyebrow "DIGITAL-RURAL EMPOWERMENT", H1 "Bridging Rural Gaps Through Digital Opportunity.", supporting copy, primary CTA → Tally, secondary "Discover TECH-UP" → scroll to About. Visual: abstract rural topography + pathway/connectivity composition (generated illustration, no people, no robots).
3. **IntroBand** — "Technology should create opportunity — wherever you live." with three focus indicators (Digital Access, Education Pathways, Rural Empowerment).
4. **AboutSection** — editorial two-column layout with the pull-quote "Rural should never mean disconnected." and a subtle path motif.
5. **FocusAreas** — "Creating Pathways to Opportunity": Digital Empowerment, Tertiary Readiness, Opportunity Navigation, Community Development, with Lucide icons in a branded treatment.
6. **TertiarySupport** — distinctive deep-teal branded band, eyebrow + heading + copy, prominent "Complete Tertiary Intake" CTA and the Tally microcopy.
7. **IntakeProcess** — four numbered stages (Your Information, Next of Kin, Study Preferences, Supporting Documents) followed by "Start My Intake".
8. **DocumentChecklist** — "Prepare Before You Begin" checklist of the four document items, plus the 10 MB per-upload note and the readiness tip.
9. **DigitalRuralStory** — "Why Digital-Rural Empowerment Matters", barrier list, strong Community → Connectivity → Knowledge → Opportunity journey graphic.
10. **ImpactPathway** — "From Access to Opportunity": Access → Readiness → Navigation → Opportunity (horizontal on desktop, vertical on mobile).
11. **CTASection** — full-width "Ready to Take the Next Step?" with Tally primary and "Learn About TECH-UP" secondary.
12. **FAQ** — shadcn Accordion with the six supplied Q&As; the intake question includes an "Open Intake Form" button.
13. **SiteFooter** — logo, name, tagline, footer nav, Tertiary Intake CTA, dynamic-year copyright. No invented contact details.

All copy is exactly as supplied. No statistics, partners, addresses or contact details are invented.

## SEO, accessibility, performance

- Route `head()` on `/` with the supplied title/description, Open Graph and Twitter tags, canonical `/`, and Organization JSON-LD (name, alternateName, description, logo, url only).
- `public/robots.txt` and a `/sitemap.xml` server route with the single homepage entry (no `lastmod`).
- Favicon generated from the logo; default `favicon.ico` removed.
- Semantic HTML, one `<h1>`, single `<main>`, aria-labels on icon-only controls, visible focus rings, 44px tap targets, descriptive alt text, no horizontal overflow.
- Lazy-loaded non-critical imagery, no video, restrained CSS/IntersectionObserver reveal animations gated on `prefers-reduced-motion`.

## Technical notes

- TanStack Start; `src/routes/index.tsx` replaces the placeholder; sections as components in `src/components/site/`.
- Design tokens and gradients in `src/styles.css`; shadcn Accordion, Button, Sheet.
- Intake URL centralised in one constant, used by every CTA, always `target="_blank" rel="noopener noreferrer"`.
- Final pass: check all breakpoints from 320px up, keyboard navigation, anchor links and console cleanliness in the live preview.
