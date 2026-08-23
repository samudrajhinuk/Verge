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
