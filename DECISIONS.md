# Decisions

A running log of what was built, why, and what was given up in exchange.
Written to be readable by someone who does not write code.

---

## Phase 1 — Project setup, database schema, seed data

### What was built

An empty but working Next.js project with a database behind it. No pages yet.
Specifically: the project skeleton, a two-table database design (properties and
enquiries), ten real-looking properties loaded into that database, and the
configuration that lets the database be moved to a different host later.

### Decisions, and why

**The database address is read from an environment variable, not written into
the code.**
The file `prisma/schema.prisma` describes the shape of the data. It does not say
*where* the data lives. That comes from a setting called `DATABASE_URL`, kept in
a `.env` file that is never committed. `.env.example` is committed instead, so
anyone cloning the project knows what to fill in.

Why this matters: locally the database is a single file on disk. Many hosting
platforms give an application a read-only disk, which would make that file
impossible to write to. Because the address is a setting rather than a hardcoded
path, moving to a hosted database is a configuration change, not a rewrite.

*Alternative rejected:* hardcoding the local file path. Faster today, but it
guarantees a painful change later, and the point of this project is to show the
door was left open.

*Trade-off:* one more file to keep in sync, and a new developer must copy
`.env.example` to `.env` before anything runs.

**No `enum` columns, even though the data has fixed choices.**
Property type is one of Apartment, Penthouse, Villa, Row House. The obvious tool
is a database "enum" — a column that only accepts values from a fixed list.
SQLite does not support enums; Postgres does. Using one now would mean the two
databases genuinely differ, and switching would require rewriting the schema.

Instead those columns are plain text, and the list of allowed values lives in
one file, `lib/property-options.ts`, which the seed script, the filters and the
validation all read from. One list, one place.

*Trade-off:* the database itself will not stop a bad value being written — the
application has to. That is an accepted cost for portability, and the list being
in exactly one file keeps it honest.

**Exactly what would change to switch to Postgres.** Three things:

1. `prisma/schema.prisma` — the line `provider = "sqlite"` becomes
   `provider = "postgresql"`.
2. `.env` — `DATABASE_URL` becomes a Postgres connection string.
3. `lib/prisma.ts` — the SQLite driver is swapped for the Postgres one
   (`@prisma/adapter-better-sqlite3` → `@prisma/adapter-pg`).

Then the migrations are regenerated. The driver only appears in that one file,
on purpose, so the change stays contained.

**Prices are stored as a plain whole number of rupees.**
The database stores `64000000`. The site will display `₹6.4 Cr`. Formatting
happens at display time, in one shared function, never in the database.

Why: the moment a price is stored as the text "₹6.4 Cr", it can no longer be
sorted or filtered by range. Storing the number keeps "under ₹5 crore" a real
database question.

*Trade-off:* the whole-number column tops out around ₹214 crore. That is far
above anything residential, so it is not a practical limit here. A production
system selling commercial towers would use a larger number type.

**Properties have both an `id` and a `slug`.**
The `id` (`verge-001`) is the permanent internal key that enquiries point at.
The `slug` (`pali-hill-14th-floor-bandra-west`) is the human-readable part of
the web address.

Why two: if a property is renamed, the slug should be free to change without
breaking the link between an enquiry and the property it came from. Using the
slug as the permanent key would tie those two things together.

**The seed is deterministic.**
No random identifiers, no "right now" timestamps. Every property has a fixed id
and a fixed creation date, and the script clears the tables before writing. Run
it ten times and you get the identical database ten times.

Why: a reset command is only safe to hand someone if the result is predictable.

**Indexes on two columns, not five.**
`city` and `priceInr` are indexed. `bedrooms` and `propertyType` are not.

Honest caveat: with ten rows, no index will make any difference — the database
will read every row regardless. These are here because they are the columns that
*would* matter at ten thousand rows, and because indexing the low-variety columns
(there are only four property types) earns almost nothing even at scale.

### Dependencies added, and why each one

- `prisma` / `@prisma/client` — the database toolkit named in the spec.
- `@prisma/adapter-better-sqlite3` — Prisma version 7 no longer ships a built-in
  database engine, so an explicit SQLite driver is required to connect at all.
- `dotenv` — Prisma 7's config file does not read `.env` on its own; this loads it.
- `tsx` — Prisma 7 generates its client as TypeScript source, so the seed script
  needs a TypeScript-aware runner. Development only; not shipped to users.

Nothing else was installed.

### Limitations, deliberately

- No pages, styling or design tokens yet — that is Phase 2.
- The video and poster file paths are written into the seeded data, but the
  actual placeholder media files do not exist yet.
- Nothing validates data on the way into the database yet; that arrives with the
  enquiry form in Phase 5.

### One thing that was not in the plan

The project directory. This session's working directory was the home folder
(`/Users/samudrajhinukmandi`). Starting a git repository there would have tracked
Library files, Downloads and credential files, so the project was created at
`~/Documents/verge` instead. Move it anywhere; nothing depends on the location.

---

## Phase 1 — correction to Postgres, schema caught up to spec

The full build blueprint (now `CLAUDE.md`) corrected the stack from SQLite to
Postgres, and defined `bathrooms`, `facing`, and `shotList` on `Property` —
none of which the schema above had yet. This phase updates Phase 1 in place to
match, keeping the original two commits as real history rather than rewriting
them.

- Decision: Switched the database to Postgres, hosted on Neon, region
  `ap-southeast-1` (Singapore — the closest Neon offers to Kolkata).
- Why: SQLite writes to a local file. Vercel's filesystem is read-only in
  production, so saving an enquiry there would silently fail.
- Alternative rejected: Rewriting history to look like Postgres was chosen from
  the start. Rejected — the true version (built on SQLite, caught the
  production issue, corrected it) is a stronger interview answer than a clean
  history that isn't accurate.
- For production I would change: Nothing further — a hosted Postgres instance
  is already the production-appropriate choice.

- Decision: Added `bathrooms` (Int), `facing` (String), and `shotList` (Json,
  an array of `{ time, label }`) to `Property`. Renamed `title`→`name` and
  `location`→`locality` to match the spec, and removed the interim `caption`
  field it replaces.
- Why: The shot list is the feature the whole site exists to demonstrate —
  without it in the schema, there's nowhere to store what the video player
  will seek to.
- Alternative rejected: Adding these fields later, right before building the
  video player. Rejected — Phase 1's job is to make every later phase
  straightforward, and this is the most load-bearing field in the project.
- For production I would change: `shotList` would likely move to its own table
  if a non-technical team needed to edit it through an admin UI. A JSON column
  is fine for content only a developer touches directly.

- Decision: `prisma.config.ts` and `prisma/seed.ts` now load `.env.local`
  explicitly, instead of the plain `dotenv/config` that only reads `.env`.
- Why: matches both the spec and Next.js's own convention — the app code will
  read `.env.local` automatically later, with no extra code required.
- Alternative rejected: keeping the secret in `.env`. Rejected only because it
  contradicts what was explicitly specified, not for a technical reason.
- For production I would change: nothing — the deployed app won't use
  `.env.local` at all; Vercel injects `DATABASE_URL` as a real environment
  variable instead.

### Dependency change

- Removed `@prisma/adapter-better-sqlite3`. Added `@prisma/adapter-pg` (same
  `7.9.1` line as the rest of Prisma) — Prisma 7's driver-adapter model needs
  one adapter package per database engine; this is the Postgres one.

### Limitations, deliberately

- `bathrooms` and `facing` values are authored per property to be plausible
  and consistent with each description (e.g. Vasant Vihar's description
  already said "South-facing"; that's the value used) — they aren't derived
  from anything, the same way the descriptions themselves are invented.
- `shotList` timestamps are placeholder — real video files don't exist yet
  (that arrives in Phase 2/4), so the timestamps assume a plausible ~30-second
  clip rather than being measured against real footage.
- `priceInr` stays an `Int`, not the spec's `BigInt`, and `areaSqft` keeps its
  existing casing rather than the spec's `areaSqFt`. These weren't part of
  what broke Phase 1 (the shot list was), so they weren't touched — flagging
  here rather than silently leaving them out of the record.

---

## Phase 2 — design tokens and type scale

Most of Phase 2's design system already existed, written before Phase 1's
field rename broke it (see `app/globals.css`, `components/PropertyCard.tsx`,
`components/PropertyMedia.tsx`, `app/styleguide/page.tsx`). This entry covers
the decisions made reviewing and finishing it, not decisions made from zero.

- Decision: Consolidated the type scale's four serif sizes (Hero statement
  40/72, Page heading 32/48, Property name 28/40) down to three that are
  actually distinct in use — Display (40/64), Heading (26/34), Sub (18/20).
- Why: no page in the sitemap ever needs "Page heading" as a size distinct
  from a property name or `/admin`'s title — every real use is the hero, a
  property name (card or detail), or a utilitarian page title, and those
  three already had separate roles once traced through every page.
- Alternative rejected: keeping four sizes to match the spec's original table
  exactly. Rejected because a size nothing on the site actually uses breaks
  the same "no arbitrary values" discipline the spacing scale (§5.4) depends
  on — a scale earns a step by being used, not by being specified in advance.
- For production I would change: nothing here — if a real fifth context
  showed up later (a press page, a blog), I'd add a role once something
  concrete needed it, not ahead of time.

- Decision: Desktop Display size is 64px, not the spec's 72px.
- Why: matches the site's restraint principle — quiet pricing, no icons, the
  accent colour used only for interaction. 72px, rendered side by side with
  64px in the styleguide, read as the generic "premium means bigger" instinct
  §4.1 explicitly warns against for the hero section specifically.
- Alternative rejected: 72px, the spec's original number. Genuinely close —
  decided by comparing both rendered, not by the numbers alone.
- For production I would change: nothing — this was decided by looking at it,
  not placeholder.

- Decision: Tokens live in `app/globals.css` under Tailwind v4's `@theme`,
  not a `tailwind.config.ts`.
- Why: Tailwind v4 is CSS-first — each `@theme` line both declares a real CSS
  custom property and generates the matching utility class in one place. A JS
  config alongside it would just be a second file that can drift from the
  first.
- Alternative rejected: a `tailwind.config.ts` with a `theme.extend` block —
  the pre-v4 pattern. Rejected because v4 doesn't need it and adding one back
  would mean two sources of truth for one set of numbers.
- For production I would change: nothing — this is the currently-recommended
  way to do it, not a shortcut.

- Decision: `VergeIcon` renders the mark as a CSS `mask-image` filled with
  `currentColor`, referencing `/verge-icon.svg` as a static file, rather than
  inlining the SVG's markup into every page.
- Why: the supplied mark is a 91-path traced file (~36KB). Inlining it would
  ship that weight on every single page; as a referenced file it's fetched
  and cached once.
- Alternative rejected: inlining the raw `<svg>` so `fill="currentColor"`
  could be set directly on the paths — the more common pattern for icons that
  need to inherit text colour. Rejected here specifically because of the
  file's size; a hand-drawn few-path mark would have made inlining the
  better trade.
- For production I would change: nothing at this file size, but if the mark
  were ever redrawn smaller/simpler, inlining would become the better choice.
- Legibility check, as asked: at 20px (mobile nav) the mark is legible but
  optically smaller than the 13px nav text beside it — the drawn shape only
  fills about 14px of the 20px box (1196×892 units in a 1292 viewBox). Not a
  blocker, but flagging it since it was asked for directly rather than left
  for you to notice later.

- Decision: Removed `bg-hairline` from the video and poster `<img>` in
  `PropertyMedia`, and added `tabular-nums` to the bed/type/area line in
  `PropertyCard` (the price line already had it).
- Why: both are the checklist in this phase's brief, applied literally — no
  background of any kind on the video (a loading-state tint still counts as a
  background), and tabular figures on *all* numbers, not just the price.
- Alternative rejected: keeping the placeholder tint, reasoning that a brief
  loading flash isn't "decorative." Rejected because the instruction was
  unambiguous and posters (a few KB, per §12.3) load fast enough that the
  tint was never solving a real problem.
- For production I would change: nothing — these were bugs against the spec,
  not judgement calls.

---

## Phase 3 — /properties with server-side filtering

- Decision: `lib/filters.ts` holds two functions the rest of the phase is
  built around — `parseFilters` (URL params → a validated `Filters` object,
  dropping anything invalid) and `buildWhere` (`Filters` → a Prisma `where`
  clause) — plus the option lists (`CITIES`, `PROPERTY_TYPES`,
  `BEDROOM_OPTIONS`, `PRICE_BANDS`) the filter UI reads from instead of
  hand-typing.
- Why: every caller — the real page query, the mobile sheet's live count,
  and (later) any other place that needs to know what's filterable — goes
  through the same two functions. There is exactly one definition of what a
  valid filter is and one definition of what query it produces.
- Alternative rejected: validating inline in `page.tsx` and writing the
  Prisma query by hand there too. Rejected because the live count would then
  need its own copy of the same rules, and the two would eventually disagree.
- For production I would change: nothing in the shape — I'd add Zod or
  similar for the parsing if the filter surface grew much larger than four
  fields, purely to keep `parseFilters` itself shorter, not because the
  hand-written version is wrong.

- Decision: Bedrooms is "at least N", not "exactly N" (`bedrooms: { gte: n }`).
- Why: that's how a real bedroom filter reads — someone who wants "3 bed"
  usually means "3 or more fits my life", not exactly three and never four.
- Alternative rejected: exact match. Rejected as the less useful default for
  a buyer, and it isn't what the `${n}+ bed` label the UI shows would imply.
- For production I would change: nothing.

- Decision: **The live count.** The mobile sheet needs a result count for
  selections that aren't in the URL yet — a count for filters that don't
  exist as a real query anywhere. The chosen approach: a Server Action
  (`app/properties/actions.ts`) that takes the sheet's in-progress values,
  runs them through the exact same `parseFilters`/`buildWhere` the real page
  uses, and returns `prisma.property.count(...)`. The sheet calls it 200ms
  after the user stops changing something.
- Why: this is the only option that can't drift from the real query, because
  it *is* the real query — same two functions, just `count` instead of
  `findMany`. It also never sends the property list to the browser, which
  the fully-forbidden alternative would require.
- Alternative rejected: fetch all ten properties once and re-run filter
  logic in the browser for the live count. Rejected for two reasons — it is
  a second implementation of `buildWhere` that could silently disagree with
  the first, and it stops being honest the moment the catalogue is larger
  than what's reasonable to ship to every visitor just to power a preview
  number.
- Trade-off accepted: a small amount of latency — one round trip to Postgres
  per settled change, debounced — in exchange for the number always being
  exactly what the server would return. On ten rows this is invisible; at a
  much larger catalogue the debounce would need to be longer, or the count
  could be approximated, but I'd only make that trade if it were ever
  actually slow, not pre-emptively.

- Decision: Resetting the sheet clears the *temporary* selections, not the
  URL — Apply is still required afterward to actually clear the filters.
- Why: keeping one rule ("nothing changes the URL except Apply") with no
  exception is easier to hold in your head, and to explain, than a rule with
  a carve-out for Reset specifically.
- Alternative rejected: Reset applies immediately (clears and navigates in
  one step). More convenient for a one-filter case, but it breaks the
  temporary/applied distinction the brief specifically asked to keep obvious
  — right after asserting it, the code would then quietly not follow it.
- For production I would change: nothing — this is a one-extra-tap cost for
  a clearer mental model, which is the right side of that trade here.

- Decision: The four columns per breakpoint are a hand-written CSS class
  (`.property-grid` in `globals.css`) with three sequential `@media` blocks,
  not stacked Tailwind breakpoint variants.
- Why: found, by testing this exact grid at 1440px, that two of Tailwind's
  generated variant rules that are both true at once (an `md:` rule and a
  rule on a non-default breakpoint) don't reliably cascade smallest-to-
  largest — the narrower rule won by source order, not the wider one. Three
  media queries on one class, written in order, cascade correctly by
  definition; there's no variant-ordering behavior to depend on.
- Alternative rejected: keep pushing on Tailwind variants (tried overriding
  the `2xl` breakpoint token to 1440px, then tried stacked `min-[]`/`max-[]`
  arbitrary variants) — both produced the same class of bug for the same
  underlying reason. Rejected once the pattern repeated a second time rather
  than trying a third variant-based fix.
- For production I would change: nothing — this is the same technique
  Tailwind's own generated CSS uses internally, just written by hand for the
  one case where the automatic version proved unreliable.
