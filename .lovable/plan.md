# Official Profile Update + Leadership & Contact

Update the site to match the official CIPC-registered organisational profile, add a Leadership section with the director photos, and add a Contact section.

## Naming and identity

Rename throughout to **TECH-UP Rural-Digital Empowerment NPC** (site copy, header/footer, metadata, JSON-LD, alt text). The tagline "Bridging Rural Gaps Through Digital Opportunity" stays. Existing brand colours and layout system are unchanged.

## Content updates from the profile document

- **About** — replace with the official "Who We Are" text: registered SA Non-Profit Company working at the intersection of education, 4IR technology and community development, serving high school learners, pre-matric students, unemployed youth and rural institutions across Maologane, Witrandjies, Tlhatlhaganye and broader rural areas.
- **Why We Exist** — replace the current "digital-rural story" barrier list with the three named gaps: Access Gap, Information & Opportunity Gap, 4IR Skills Gap, plus the mission statement ("a student's geographic location never limits their academic potential, technical capability, or economic future").
- **What We Do** — rework the four-card grid into the three official pillars:
  1. Tertiary Intake & Academic Admissions Support (career guidance and APS-based qualification matching, document digitisation, end-to-end online submissions for universities, TVET colleges and bursaries).
  2. Digital Literacy & 4IR Skills Training (computer literacy, document processing, internet navigation, foundational programming, digital workplace tools).
  3. Commercial Services & Sustainability (high-volume printing, scanning and document management; graphic design, digital administration, local IT/hardware support) — framed as the model that funds the non-profit mandate.
- **Get Involved** — short band using the "What We Look For in a Candidate" points: Community-First Mindset, Practical Problem Solving, Collaboration & Respect. Enquiries go to the contact email.
- Tertiary Support, Intake Process, Document Checklist, Impact Pathway and FAQ keep their existing verified copy, with wording aligned to the new pillars and name.

## Leadership section

New `Leadership` section listing the three directors as portrait cards:

- Onnalenna Molothlekgi — no photo supplied, rendered as a branded initials avatar.
- Keamogetswe Soma — uploaded photo.
- Kgatoentle Chimoya — uploaded photo.

Names and order only; no titles or biographies are invented. Photos are uploaded as CDN assets and cropped to a consistent square/portrait ratio with lazy loading and descriptive alt text.

## Contact section

New `Contact` section plus footer details, using only the verified information:

- Email: info@techup.org.za (mailto link)
- Website: www.techup.org.za
- Location: Rustenburg Local Municipality, North West Province, South Africa
- CIPC Registration Number: K2026577450
- Status: Active Non-Profit Company (NPC)
- Primary CTA remains the Tally intake link.

No phone number, physical address or social links are added, as none were supplied.

## SEO

- Update title, description, Open Graph and Twitter copy for the new name and pillars.
- Extend the Organization JSON-LD with `email`, `url` (https://www.techup.org.za), `areaServed` (Rustenburg Local Municipality, North West, ZA) and `address` region — verified fields only.
- Add "Contact" and "Leadership" to the header and footer navigation.

## Technical notes

- New components in `src/components/site/`: `Leadership.tsx`, `Contact.tsx`, `WhyWeExist.tsx` (replacing `DigitalRuralStory.tsx`), with `FocusAreas.tsx` reworked to three pillars.
- Director photos uploaded via `lovable-assets` from the uploads mount and referenced by `.asset.json` pointer; no binaries committed.
- Organisation facts centralised in `src/lib/site.ts` (name, email, site URL, registration number, location, director list) so header, footer, contact and JSON-LD stay in sync.
- Final check across 320px–1440px in the live preview: anchor links, keyboard navigation, no overflow, clean console.
