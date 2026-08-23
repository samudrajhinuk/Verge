# Verge — build specification

The canonical brief for this project. Amended as decisions are made; every
amendment is dated and explained.

> Note on where this lives: this file was created on 2026-08-23. Before that the
> brief existed only in conversation — `CLAUDE.md` contained the Next.js
> scaffolding pointer and nothing else. It is written down here so it survives.

---

## Project

A landing page and property discovery experience for **Verge**, a premium
real-estate developer. The differentiator: short-form vertical video is the
primary way properties are presented, not conventional photo galleries. Every
property leads with video.

The site must feel like a real premium brand website — art-directed,
black-and-white dominant — not a generic real-estate template or SaaS dashboard.

**Goal:** turn a viewer of a short property video into a qualified enquiry.

This is a portfolio project built to be defended in a job interview. The
implementation must be production-minded but simple enough to explain out loud.
Prefer explicit, obvious architecture over clever abstractions.

## Working rules

- Do not redesign the concept or introduce unrelated features.
- Do not substitute the stack.
- No dependency without a one-sentence justification first.
- No generic AI-looking UI: excessive cards, gradients, glassmorphism, floating
  blobs, decorative animation, dashboard layouts.
- Keep naming, folder structure, data flow and logic obvious enough to explain
  verbally.
- Flag conflicts rather than silently changing requirements.
- If a phase is ballooning, stop and say so.

## Stack — do not substitute

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite ·
Server Actions for the enquiry form.

No authentication, payments, CMS, external APIs, or state-management library.

**Database portability:** the Prisma datasource URL comes from `DATABASE_URL`,
never a hardcoded path. `.env.example` is committed. The schema avoids
SQLite-only features so the provider can move to PostgreSQL with a minimal diff.
Do not switch to PostgreSQL now — just keep the door open.

## Data flow

Filtering is genuinely server-side. Filters live in the URL as search params →
read by a React Server Component → validated and normalised → converted into a
Prisma query → only matching properties are rendered. Never preload the full
list and filter in the browser.

## Pages

1. `/` — landing. Full-bleed muted autoplaying vertical hero video, one primary
   CTA, a short proof section, footer with the brand name and contact details.
   No filler sections.
2. `/properties` — server-filtered grid. Each card leads with vertical video.
   Location, type, bedrooms, price clearly present. Editorial, not a marketplace.
3. `/properties/[slug]` — video first, property identity and key facts, what a
   buyer needs before enquiring, enquiry form.

## Brand

Name: **Verge**. The logo is an icon only, placed in the nav. Its shape extends
past its container on one side; wrap it in a square viewBox with equal padding
so it aligns optically with adjacent nav items. Verify legibility at 20px.

The word "Verge" must appear in the page `<title>`, the footer, and the enquiry
success message — a user submitting a lead must know who they contacted. The
wordmark does not go in the nav.

## Design tokens

**Colour**

| Role | Value |
|---|---|
| Ink | `#0A0A0A` |
| Paper | `#FAFAF8` |
| Muted text | `#6B6B6B` (verified 5.10:1 on Paper — passes, no darkening needed) |
| Hairline | `#E4E4E1` |
| Accent | interaction and focus only — never decoration |

**Typography** — amended 2026-08-23, see below.

**Spacing** — only 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px.

**Other** — border radius 0 everywhere except the logo. 1px hairlines, no drop
shadows. Max content width 1440px; 24px side padding mobile, 48px desktop.
Transitions 150ms ease-out, nothing longer, no entrance animations on load.

---

## Amendment — 2026-08-23 — Typography

**Inter is no longer the typeface.** Replaced by a two-face system:

**Display — DM Serif Display.** Headings, property names, the hero statement.

> This face has only weight 400, plus an italic. **There is no bold.** Hierarchy
> must come from size, measure and spacing — never from faking weight with a
> synthetic bold. Set `font-synthesis: none` so the browser cannot invent one.

**Body / UI — Lexend Deca.** Body copy, labels, buttons, property facts, form
fields. Variable weights available.

Both loaded with `next/font`, subset appropriately, with explicit fallback fonts
declared to avoid layout shift.

**The display serif is used with restraint.** It is not the default for every
piece of text on the page. It is reserved for property names, section headings
and the hero statement. Everything a user reads at length or interacts with is
Lexend Deca. If in doubt, the text is sans.

---

## Copy quality — hard requirement

AI-generated websites are identified by their writing, not their layout.

Banned: "Elevate your living experience", "Discover your dream home", "Where
luxury meets comfort", "Seamlessly", "Curated collection", "Unlock",
"Redefining", "Nestled in the heart of", "Journey", "Experience the difference",
and any sentence that could describe any product.

Required instead: concrete, specific, restrained. Copy that names things — a
floor number, a distance, a material, a year, a measurement. Short sentences.
Assume a serious buyer with money, not a browser being persuaded. No lorem ipsum.

## Filters

Location, price range, bedrooms, property type. Applied server-side through
Prisma, stored in URL search params. The URL must be shareable; back/forward must
restore state; refresh must preserve it. Invalid or missing params fail
gracefully. No client state where the URL can be the source of truth.

**Mobile:** filters open in a bottom sheet with an explicit Apply button, a live
count of matching results before applying, and an obvious reset. Keyboard
accessible, Escape closes, focus trapped and restored on close, background scroll
locked. Distinguish carefully between temporary selections inside the sheet and
filters applied to the URL — Apply is the moment the URL changes.

## Price formatting

Indian prices display in lakh/crore convention (₹2.4 Cr, ₹85 L). Store the raw
number; format only at display time, in one shared utility. Filter range
boundaries use the same convention.

## Lead pipeline

Enquiry form → Server Action → validate → write to database → success state.
Persist the enquirer's details, the property, and the timestamp. The success
state states what happens next and when.

`/admin` lists submitted enquiries so the pipeline is visibly real.

**Security:** there is no authentication in this project by design. `/admin` is a
demo route. Do not implement fake authentication or pretend it is secure. Note it
honestly in `DECISIONS.md` and put a visible line on the page saying it is an
unsecured demo view.

## Form quality

Clear labels, appropriate input types, browser validation where useful, and
server-side validation as the source of truth. Inline errors tied to their field.
Preserve entered values on failure. Prevent double submission. Clear pending
state. Accessible success and error announcements.

## States — all required

Loading (skeleton cards via Suspense, not a spinner) · empty (state which filters
caused zero results, offer one-action clear) · error (a recovery path, not a dead
end) · form failure (input preserved, plain explanation) · validation (inline,
field-specific, announced) · pending · success.

These use the same design tokens as everything else. They are not afterthoughts.

## Accessibility

Visible keyboard focus indicators (accent, 2px offset) · real labels on every
input · semantic HTML and logical heading hierarchy · 4.5:1 minimum text contrast
· full keyboard operation of the filter sheet with correct dialog semantics ·
screen-reader-friendly validation and status messages · accessible names on
buttons and meaningful link text · respect `prefers-reduced-motion` · videos
muted for autoplay with reachable controls · never communicate essential
information through motion or colour alone.

Build this into components as you go, not as a final pass. At the accessibility
phase, actually tab through every page and report the real focus sequence
observed. Verification, not assertion.

## Video / media

Video is the product, not a decorated image slot. Correct 9:16 ratio · `poster`
fallbacks · sensible `preload` · `muted`, `playsInline`, `autoplay` · graceful
behaviour when autoplay is blocked (iOS low-power mode will block it) ·
lazy-load below-the-fold media · accessible fallback content · sensible object
positioning.

Local placeholder assets only. No external video APIs. The layout must look
intentional even with placeholders.

## Responsive

Design intentionally for 375, 768, 1280 and 1440px. Do not just shrink the
desktop layout. Watch: vertical video proportions, type scaling, filter
interaction, navigation, card density, whitespace, form usability, 44px minimum
touch targets, horizontal overflow, and very long property and location names.

When the dev server runs, report the local network URL so the site can be opened
on a real phone. A resized browser window is not a phone.

## Seed data

10 properties, Indian metro locations, realistic pricing, varied deliberately so
every filter combination visibly proves server-side filtering. At least one
deliberate edge case: an unusually long property or location name. Fictional
developer and property information; no real people's data.

## Database

Small, appropriate Prisma schema. Property → Enquiries. Sensible types, indexes
and constraints where they genuinely help. Unique, stable, human-readable slugs.
Deterministic seed script. A documented reset-and-reseed command.

## SEO, performance, code quality

Meaningful titles and descriptions, per-property metadata, semantic HTML,
sensible canonical handling. No elaborate SEO system.

Server Components by default; Client Components only where interaction requires
it. Suspense at appropriate boundaries. No unnecessary JavaScript. Do not
optimise prematurely.

Clear component boundaries. Explicit types, never `any`. Reusable components only
where repetition actually exists. Small readable functions. No giant all-in-one
page component. No duplicated filtering logic.

## Version control

Git initialised in Phase 1 with a sensible `.gitignore`. A descriptive commit at
the end of every phase explaining what changed and why. The commit history is a
deliverable.

## Required documents

- **`DECISIONS.md`** — appended every phase: what was built, why, what
  alternative was rejected, the trade-off, and what would change in production.
  Written so a non-technical reader can follow it.
- **`README.md`** — final phase: what Verge is, the problem it solves, how to run
  it, the stack and why each piece, and what is deliberately out of scope.
- **"What I would change for production"** in `DECISIONS.md` — authentication for
  `/admin`, the database change for a read-only host, video hosting and delivery,
  rate limiting, spam protection, and how enquiry-to-conversion would be
  measured. Describe, do not implement.

## Process

Stop after each phase. Report what was built, files changed, decisions in plain
language, how to verify, limitations, commit, append to `DECISIONS.md`, then ask
comprehension questions and wait.

## Build order

1. Project setup, git init, Prisma schema, deterministic seed, `.env.example` ✅
2. Design tokens + property card component
3. `/properties` with genuine server-side filtering
4. Property detail page
5. Enquiry Server Action + validation + persistence + admin view
6. Landing page
7. States, accessibility pass, responsive pass, README, production trade-offs,
   final cleanup

## Final rule

Do not try to impress with complexity. Verge should feel sophisticated through
product thinking, visual hierarchy, interaction design, data flow and restraint —
not through excessive code.
