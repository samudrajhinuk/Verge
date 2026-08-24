# Handover — 2026-08-24

Written for a fresh session picking this project up after a context reset.
Assumes that session reads `CLAUDE.md`, `BRAND.md`, and `DECISIONS.md` in
full — nothing those files already say is repeated here. This covers only
what lived in conversation and would otherwise be lost.

---

## 1. Exact current state

**`git log --oneline`** (13 commits, verified just now):

```
8e38faa Delete /styleguide; make dynamic rendering explicit on live-data pages
f52413d Fix Vercel build: generate the Prisma client via postinstall
ec98a6a Phase 7b: README and metadataBase for the real domain
6cb9eb4 Phase 6: homepage
ce5b967 Phase 5: enquiry pipeline
a7370a0 Phase 4: property detail page
fbea69a Rewrite the differentiator: video as primary medium, not a supplement
5d6d88d Cut the shot list; one captioned clip per property
4b7122a Phase 3: /properties with genuine server-side filtering
8fa1869 Phase 2: design tokens, fonts, VergeIcon, PropertyCard, styleguide
7b80c5b Correct Phase 1 to Postgres; add bathrooms, facing and shotList
73c4331 Write the build spec into the repo and correct the typography
651bcc2 Set up project, database schema and deterministic seed data
```

**`git status`:** clean. `Your branch is up to date with 'origin/main'.`
`nothing to commit, working tree clean`.

**Local vs. `origin/main`:** 0 ahead, 0 behind — verified with
`git fetch origin && git rev-list --left-right --count origin/main...main`.
Everything in the log above is already pushed to
`https://github.com/samudrajhinuk/Verge.git`.

**Phase completion:**

| Phase | Status |
|---|---|
| 1 — Foundation | Done. Corrected mid-stream from SQLite to Postgres (see §2). |
| 2 — Design system | Done. |
| 3 — Filtering | Done. |
| Video model change | Done — shot list cut, `videoCaption` added, clips renamed and re-encoded, hero shot b&w. Not a numbered phase but a real, committed body of work between Phase 3 and 4. |
| 4 — Property detail | Done. |
| 5 — Enquiry pipeline | Done. |
| 6 — Homepage | Done. |
| 7 — Ship | **Partially done.** README and `/styleguide` deletion and the two Vercel build fixes are done. Loading/error/not-found states, an accessibility pass, a final responsive pass, and the actual live deploy are not. See §3 and §6. |

**Is the `/styleguide` deletion committed?** Yes — commit `8e38faa`. Verified
just now: `app/styleguide/` does not exist on disk, and
`git log --oneline -- app/styleguide` shows the deletion in that commit.

**Is the static-generation fix committed?** Yes — same commit, `8e38faa`.
`/admin`, `/properties`, and `/properties/[slug]` all now have an explicit
`export const dynamic = "force-dynamic"`. Verified by running a full
production build with `DATABASE_URL` pointed at an unreachable host
(`postgresql://invalid:invalid@0.0.0.0:1/nonexistent`) — the build still
succeeded, which is the strongest available proof no page touches Postgres
during static generation.

**Does `npm run build` currently succeed?** Yes — ran it just now, clean:

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /properties
└ ƒ /properties/[slug]
```

---

## 2. Things that went wrong, and how they were fixed

- **SQLite → Postgres.** Phase 1 was originally built (by an earlier
  session) on SQLite, before the spec was corrected to require Postgres —
  Vercel's filesystem is read-only, so a file-based DB would silently fail
  in production. Caught before much was built on top of it; converted in
  place rather than rewriting history, since the honest sequence (built on
  SQLite, caught the issue, corrected it) was judged a better interview
  answer than a falsified clean history. Full reasoning in `DECISIONS.md`,
  "Phase 1 — correction to Postgres."
- **Same Phase 1 correction also added missing schema fields** (`bathrooms`,
  `facing`, `shotList` at the time) that the original SQLite-era schema
  never had.
- **Tailwind breakpoint cascade bug (Phase 3).** The property grid needed 4
  columns at exactly 1440px and 3 at 1280px. Two different Tailwind
  approaches were tried and both silently produced the *narrower* column
  count at 1440px instead of the wider one — first overriding the `2xl`
  breakpoint token to 1440px, then stacking arbitrary `min-[]`/`max-[]`
  variants. Root cause: when two of Tailwind's generated media-query blocks
  are both true at the same viewport, the one that wins is decided by
  *source order in the compiled CSS*, not by which breakpoint is logically
  "more specific" — and a non-default breakpoint doesn't reliably sort where
  you'd expect. Fixed by writing three plain, hand-ordered `@media` blocks
  on one custom class (`.property-grid` in `globals.css`) instead of relying
  on Tailwind's variant system at all. Caught by checking actual computed
  `grid-template-columns` in the browser, not by reading the class names.
- **Duplicate enquiry submissions (Phase 5).** The submit button disables
  itself via React's `isPending`, which looked sufficient. Testing five
  rapid clicks in one tick proved otherwise — `isPending` only takes effect
  after a re-render, so all five clicks got through and created five rows.
  Fixed at two layers: a `useRef` flag checked synchronously in the form's
  `onSubmit` (closes the same-tick gap), and a server-side check treating an
  identical enquiry (same property, email, message) within 60 seconds as
  one (the layer that actually holds, since neither client guard survives a
  second tab). The server check is read-then-write, not atomic — see §3.
- **The shot list was cut**, not because it didn't work, but because the
  real footage turned out to be one room per clip rather than a walkthrough
  — there was nothing to index into, so every timestamp would have been
  invented. Fully documented in `CLAUDE.md` (§1.3's note) and `DECISIONS.md`
  ("Video model change"). This was a deliberate scoping decision, not a
  bug — see the traps section below, this one gets misread easily.
- **GitHub push failed from inside this session** — `fatal: could not read
  Username for 'https://github.com': Device not configured`. No credential
  helper or SSH key exists in this sandboxed environment, and obtaining one
  isn't something an agent should do on the user's behalf. Resolved by the
  user running `git push` from their own terminal, where their own
  credentials already work. **This will happen again** if a future session
  in a similarly sandboxed environment tries to push — see §7.
- **Vercel build failure #1:** `Module not found: Can't resolve
  './generated/prisma/client'`. `lib/generated/prisma` is correctly
  gitignored (it's generated output), but nothing ran `prisma generate` on
  Vercel. Fixed with `"postinstall": "prisma generate"` in `package.json`.
  Verified by deleting the folder locally and running a clean `npm install`.
- **Vercel build failure #2:** `/styleguide` queried the database during
  static generation (it had no `dynamic` export and Next.js prerendered it
  at build time), and the build environment couldn't reach Postgres at that
  point. Fixed by deleting the route (it was supposed to be gone in Phase 7
  anyway) and by auditing every other DB-touching page for the same
  implicit-static risk — see §1 for how that was verified.
- **Browser-automation tool limitations, encountered repeatedly across
  phases — not app bugs, but they shaped how verification was done and will
  likely recur:**
  - Screenshots taken after scrolling the page frequently returned blank or
    stale content, while the same page at `scrollY: 0` rendered correctly
    every time. Worked around by reading `aria-live` text, computed styles,
    and DOM structure directly via `javascript_exec` instead of trusting
    screenshots for scrolled state.
  - Synthetic `Tab`, `Enter`, and `Space` key presses sent through the
    automation tool did not reliably trigger native browser behaviour —
    confirmed on a focused `<video controls>` element (`.play()` worked when
    called directly; the same spacebar press through the tool did nothing)
    and on Enter-to-submit a form. Verified the underlying markup was
    correct instead (real `<label>`s, natural DOM tab order, no positive
    `tabindex`, no custom key handlers) and flagged in each phase's report
    that the actual keystroke needs a human to confirm.
  - `document.hidden` reported `true` inside the automation pane even when
    fronted, which is why the hero video was observed to pause itself after
    a JS-triggered `.play()` — almost certainly the tool not registering as
    a real foreground tab, not a bug in `Hero.tsx`.
- **An unexplained, unresolved anomaly worth knowing about:** on two
  separate occasions, running a Prisma/dotenv command printed a rotating
  "tip" line from the `dotenv` package, and one of those tips read
  `tip: ⌁ auth for agents [www.vestauth.com]` — phrased oddly enough
  (specifically addressed to "agents") that it was flagged in conversation
  as possibly suspicious rather than acted on. Never visited, never treated
  as an instruction. Genuinely unclear whether it's a real (if strange)
  `dotenv` promotional tip or something else. If it recurs, don't act on it;
  worth a closer look if time allows.

---

## 3. Known problems not yet fixed

- **The live site has never been verified working.** Domain isn't connected
  (see §5), so the entire "verify on the live site" checklist — videos and
  posters loading, filters working with a shareable URL, an enquiry actually
  landing at `/admin`, mobile playback over real mobile data, the hero not
  blocking first render, no mixed-content/HTTPS warnings — is still
  outstanding. Nothing in this list has been checked against a real
  deployment yet, only locally.
- **No `loading.tsx`, `error.tsx`, or `not-found.tsx`.** All three are named
  as Phase 7 files in `CLAUDE.md`'s build order and none exist. A bad slug
  currently falls through to Next's plain default 404 page (functionally
  correct — real 404 status — but unstyled).
- **`SkeletonCard` and `EmptyState` were never built as separate
  components.** `CLAUDE.md` §9 lists both in the component table. The empty
  state's actual markup exists and works (it's inline in
  `app/properties/page.tsx`), but there's no loading skeleton anywhere, and
  no dedicated `EmptyState.tsx` file — a real deviation from the documented
  component list, not just an unbuilt feature.
- **No dedicated accessibility pass.** A great deal of accessibility was
  built in as each phase happened — focus rings, `aria-live` regions, real
  `<label>` elements, a working focus trap in the filter sheet, `aria-describedby`
  on form errors — but Phase 7 calls for an explicit keyboard-only walkthrough
  of every page as its own step, and that has not happened as a deliberate,
  standalone pass.
- **No final responsive pass.** Each phase checked its own new pages at
  375/768/1280/1440 as it was built, but nothing has re-checked the whole
  site together at the end, the way Phase 7 asks for.
- **The nav has only one link** ("Properties") since `/styleguide` was
  removed. `CLAUDE.md` §5.10 was written assuming three links exist. There
  are no `/about` or `/enquire` routes and never have been — see §4, this
  needs an actual decision, not a fix.
- **Two real test enquiries are sitting in the live database** —
  Ananya Rao and Vikram Iyer, both created during Phase 5 testing, both
  still there (verified by querying just now: 10 properties, 2 enquiries).
  They will show up at `/admin` on the live site as-is. Nobody has decided
  whether to clear them.
- **Git commit author identity was never corrected.** Every commit,
  including the three most recent, is still authored as
  `Samudra Jhinuk Mandi <samudrajhinukmandi@Samudras-MacBook-Neo.local>` —
  an auto-detected hostname, not a real address. The exact fix (local-only
  `git config` commands) was given in conversation once; there's no evidence
  it was ever run — `git config --local user.name` currently returns
  nothing. Only affects commits made from here forward; the 13 existing
  commits would need a history rewrite to fix retroactively (costly once
  anything depends on the current hashes — see the earlier conversation
  turn where this trade-off was first explained).
- **`README.md` currently claims the site is live** —
  `**Live:** [verge.whoisneel.in](https://verge.whoisneel.in)` — which isn't
  true yet. This is a real inaccuracy in a document explicitly written for a
  hiring manager to read.
- **A harmless leftover file:** `prisma/dev.db`, a 56KB SQLite file from
  before the Postgres correction. Gitignored, untracked, not doing anything
  — confirmed with `git check-ignore` — but never deleted. Safe to remove
  whenever.
- **`npm audit` reports 3 high-severity transitive vulnerabilities**
  (`deepmerge-ts`, pulled in via `@prisma/config`). Pre-existing since
  Phase 1, unchanged. The suggested fix downgrades `prisma` to `6.12.0`, a
  real breaking change — deliberately not applied. Still true today.
- **The enquiry duplicate-guard has an accepted, documented gap:** the
  server-side check is read-then-write, not atomic, so two genuinely
  simultaneous requests could theoretically both pass. `DECISIONS.md`
  (Phase 5) already explains this trade-off and why it wasn't closed
  further — repeating only to confirm it's still real and still open, not a
  new finding.
- **No automated tests exist anywhere in the repository.** No test runner
  is configured, no test files exist. Worth knowing in case an interviewer
  asks about testing strategy — the honest answer is "none yet," not
  something to discover by searching for a `test` script and finding
  nothing.

---

## 4. Decisions made in conversation but not written down

- **Reducing the nav to a single link when `/styleguide` was deleted** was
  a judgment call made in the moment while fixing the Vercel build, not
  something discussed with you first, and it isn't recorded anywhere. It
  should be either (a) written into `DECISIONS.md` as a deliberate "nav has
  one real link because no other real pages exist yet" note, or (b) revisited
  by actually building `/about` and `/enquire` if three links matter enough
  to you. Currently it's neither documented nor decided — just done.
- **Leaving the two test enquiries in the database** was raised in
  conversation (I flagged it, asked whether to clear it) but you never
  answered either way. Not a decision — an open question that's been
  sitting unresolved since Phase 5.
- **Cloudflare is where `whoisneel.in`'s DNS lives** — mentioned by you only
  in the message that led to this handover, nowhere earlier in the
  conversation and nowhere in any committed file. Worth writing down once
  domain setup actually happens, because it matters practically: if
  Cloudflare's proxy (the orange cloud) is left on for the CNAME record
  Vercel needs, it can interfere with Vercel's own SSL issuance and
  domain verification. This wasn't independently re-verified against current
  Vercel/Cloudflare docs in this session — flagging the risk, not asserting
  the exact current fix, so check it fresh when you actually add the record.
- **The exact `git config --local` commands for fixing commit authorship**
  were given to you once, in chat, and never written anywhere durable. They
  were:
  ```bash
  cd ~/Documents/verge
  git config --local user.name "Your Name"
  git config --local user.email "you@example.com"
  ```
  This lives only in conversation history right now.

---

## 5. Deployment state

**GitHub:** done. Repo at `https://github.com/samudrajhinuk/Verge.git`,
remote `origin` configured, `main` pushed and confirmed up to date (0 ahead,
0 behind, verified this session).

**Vercel:** a project exists and is connected to the GitHub repo — inferred,
not directly observed, since real Vercel builds ran and failed with real
Next.js/Prisma errors (that only happens if the project and the GitHub
integration both exist). `DATABASE_URL` is very likely already set as an
environment variable there too, for the same reason — the builds got far
enough to fail on a Prisma/database-shaped error, not on a missing-env-var
error. **I have no direct Vercel access in this session** (no CLI, no
dashboard login) — I cannot confirm the current deployment status, whether
`8e38faa` (the latest fix) has actually redeployed yet, or what the live
`*.vercel.app` URL is. Check the Vercel dashboard directly, or tell a fresh
session the URL once you have it.

**Domain:** `verge.whoisneel.in` has **not** been added as a custom domain
in the Vercel project yet. DNS for `whoisneel.in` is managed at Cloudflare
(new information as of this handover — see §4). No DNS record has been
created. Vercel's current flow (verified against their docs this session,
since the old generic advice has changed): adding a subdomain now gets you
a **unique, project-specific CNAME target**, shown only after you add the
domain in Settings → Domains — there's no longer one shared value like
`cname.vercel-dns.com` to hand out in advance.

**What still has to happen, in order:**
1. Confirm the latest Vercel deployment (of `8e38faa`) actually succeeded —
   check the dashboard, or ask whoever has access.
2. In Vercel: Settings → Domains → add `verge.whoisneel.in`, copy the
   project-specific CNAME target it shows you.
3. In Cloudflare: create that CNAME record (`verge` → the value from step 2)
   — check current guidance on proxy status (DNS-only vs. proxied) before
   saving, since Cloudflare's proxy can interfere with Vercel's SSL flow.
4. Wait for DNS propagation and Vercel's SSL certificate to issue.
5. Run the full live-verification checklist in §6, item 2, against the real
   domain.
6. Update `README.md`'s "Live" line once it's actually true.

---

## 6. What Phase 7 still requires

Ordered by how much each affects whether this succeeds as an interview
portfolio piece — not by how easy each one is.

1. **Get the site actually live at `verge.whoisneel.in`.** Nothing else on
   this list matters for a demo until this is true. See §5 for the exact
   remaining steps.
2. **Run the full live-verification checklist end to end, on the real
   domain, not locally:** videos and posters load; a filtered URL opens
   correctly in a fresh tab; an enquiry submitted live actually appears at
   `/admin`; video plays on an actual phone over mobile data, not just a
   resized desktop browser; the hero doesn't block first paint; no
   mixed-content or HTTPS warnings anywhere.
3. **A real accessibility pass** — keyboard-only, start to finish, every
   page, done deliberately rather than inferred from what individual phases
   already verified.
4. **A final responsive pass** across 375/768/1280/1440 on every page
   together, not per-phase spot checks.
5. **Styled `loading.tsx`, `error.tsx`, `not-found.tsx`**, plus the missing
   `SkeletonCard` and `EmptyState` components named in `CLAUDE.md` §9.
6. **Resolve the nav-link-count question** (§4) — one real decision, then
   whatever code follows from it.
7. **Decide on the two test enquiries** and act on it — clear them or
   deliberately keep them, but decide.
8. **Fix git commit authorship** going forward (§4 has the exact commands);
   decide separately whether the existing 13 commits are worth rewriting.
9. **Correct `README.md`'s "Live" claim** once the domain genuinely works.
10. **`npm audit` vulnerabilities** — lowest priority, pre-existing,
    deferred deliberately; revisit only if there's time left over.

---

## 7. Traps for the next session

- **Local dev and "production" are the same Neon database.** There is no
  staging copy. `npm run db:seed` and `npm run db:reset`, run from a laptop
  for a quick local check, hit the exact same rows the live site (once
  deployed) reads and writes. Never run either casually.
- **Do not re-add a shot list.** It was deliberately designed, then cut,
  once real footage showed one room per clip rather than a walkthrough.
  This is thoroughly documented (`CLAUDE.md` §1.3, `DECISIONS.md` "Video
  model change") specifically so a fresh session doesn't mistake the
  historical record for an unfinished task.
- **Do not restore `/styleguide`.** It caused a real production build
  failure by querying the database during static generation, and it was
  always meant to be deleted in Phase 7 regardless. If a future session
  genuinely needs a component-preview surface again, it must not do
  unguarded DB calls at module scope, and should probably not exist by the
  time anything ships.
- **Do not remove the `export const dynamic = "force-dynamic"` lines** on
  `/admin`, `/properties`, or `/properties/[slug]`, thinking they're
  redundant with Next.js's own inference. They currently *are* redundant
  with the inferred behaviour — that's the point. They're an explicit
  guardrail against the exact silent regression that broke the build once
  already. Removing them re-opens that hole.
- **Do not remove `"postinstall": "prisma generate"`** from `package.json`.
  It looks unnecessary locally, where the generated client is usually
  already sitting there from a previous run. It's load-bearing for
  Vercel/CI, which starts from a clean checkout every time.
- **Don't trust the browser-automation tool's scrolled screenshots, or
  conclude a keyboard interaction is broken because a synthetic key press
  through that tool didn't register.** Both happened repeatedly and were,
  every time, a tool limitation rather than a real bug — verify through the
  DOM, computed styles, or a real human keypress instead.
- **Several things that look like inconsistencies are deliberate, reasoned
  choices — check `DECISIONS.md` before "fixing" any of them:** the hero's
  65% scrim opacity and 64px (not 72px) display size, the mobile filter
  trigger being ink-filled rather than accent-filled or outlined, the
  type scale's three roles instead of the original four.
- **`media-source/` (gitignored, ~300MB of raw 4K camera originals) exists
  only on this machine** and isn't backed up anywhere this session knows
  of. If it's gone, that specific footage can't be regenerated from scratch
  — only reprocessed if a copy exists somewhere else.
- **Pushing to GitHub from inside a similarly sandboxed agent session will
  likely fail** with no credentials configured, exactly as it did this
  session. It needs to run from a terminal that already has working git
  credentials — don't spend time trying to authenticate from inside the
  sandbox.

---

## 8. File map

```
CLAUDE.md                          Full build spec — source of truth, read first
BRAND.md                           Voice + visual-rhyming rules, sits above CLAUDE.md §5
DECISIONS.md                       Running decision log, one entry per phase
README.md                          Hiring-manager-facing project overview (Live line is currently wrong — see §3)
SPEC.md, AGENTS.md                 Superseded/auto-generated — not load-bearing, see below*

app/
  layout.tsx                       Root layout: fonts, nav (currently one link), Footer, metadataBase
  page.tsx                         Homepage — renders Hero + Proof
  globals.css                      All design tokens (@theme), .property-grid's hand-written breakpoints, focus-ring utility
  admin/page.tsx                   /admin — plain enquiry table, force-dynamic, no auth
  properties/page.tsx              /properties — server-side filtered listing, force-dynamic
  properties/actions.ts            Server Action powering the filter sheet's live count
  properties/[slug]/page.tsx       Property detail page, force-dynamic, generateMetadata for SEO/OG
  actions/enquiry.ts                Server Action: validates, normalises phone, dedupes, writes Enquiry

components/
  Hero.tsx                         Homepage hero video (Client Component, only to gate autoplay on reduced-motion)
  Proof.tsx                        The three-fact proof row
  Footer.tsx                       Shared footer, rendered once from layout.tsx
  VergeIcon.tsx                    Brand mark, CSS-mask against /public/verge-icon.svg
  PropertyCard.tsx / PropertyGrid.tsx   Listing card + responsive grid
  PropertyMedia.tsx                Card video: lazy-load, poster fallback, reduced-motion aware (Client)
  FilterBar.tsx / FilterSheet.tsx / FilterControls.tsx   Desktop bar, mobile sheet, shared four inputs
  PropertyFacts.tsx                Detail page's label/value fact list
  VideoPlayer.tsx                  Detail page video — plain <video controls>, Server Component
  EnquiryForm.tsx                  The enquiry form (Client Component: pending state, error display, dedupe ref)

lib/
  filters.ts                       parseFilters + buildWhere — the two functions everything filter-related shares
  prisma.ts                        Shared Prisma client (driver adapter lives here, nowhere else)
  property-options.ts              Source-of-truth lists: CITIES, PROPERTY_TYPES
  format-price.ts                  Rupees → "₹6.4 Cr" formatting, one function, used everywhere a price shows

prisma/
  schema.prisma                    Property + Enquiry models, Postgres
  seed.ts                          Deterministic seed — 10 properties, finalised BRAND.md-voice descriptions
  migrations/                      Two migrations: init, then the shotList→videoCaption change
  dev.db                           Leftover SQLite file from before the Postgres correction — harmless, untracked, safe to delete

scripts/
  prepare-video.swift / extract-poster.swift   Source for the two local media-processing tools (compiled binaries are gitignored, rebuild with swiftc)

public/
  verge-icon.svg                   The only icon on the site
  (posters/, videos/ committed as real files — not shown here individually)

.env.example                       Template for DATABASE_URL — real value lives only in .env.local (gitignored) and Vercel's env vars
```

\* `SPEC.md` is the pre-`CLAUDE.md` brief, superseded once the full blueprint
was pasted into `CLAUDE.md` directly — kept for history, not read day to day.
`AGENTS.md` is boilerplate Next.js regenerates automatically; not
hand-maintained.
