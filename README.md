# Verge

**Live:** [verge.whoisneel.in](https://verge.whoisneel.in)

## What this is

Verge is a fictional premium real-estate developer. Most property sites show
a photo gallery per listing — a dozen still images, clicked through one at a
time. Verge shows a single vertical video instead: the card *is* the clip,
not a photo with a play button on it. The grid's column count at each screen
size is derived from that video's 9:16 shape, rather than the footage being
cropped to fit a layout chosen first.

The site has one job beneath the video: turn a viewer into a **qualified
enquiry** — a message tied to one specific property, so a sales team knows
what someone actually wants before calling them back.

## Stack, and why each piece

| Piece | Why this one |
|---|---|
| **Next.js (App Router)** | Server Components mean the property list, the filter query, and the detail page all run on the server and ship close to zero client JavaScript. Only the four things that genuinely need a browser — the filter sheet, filter controls, the enquiry form, and gating video autoplay on `prefers-reduced-motion` — are Client Components. |
| **TypeScript** | The filter logic, the Prisma queries, and the enquiry validation all share types end to end. A typo in a field name fails at compile time, not in front of a user. |
| **Tailwind CSS v4** | Design tokens (colour, type scale, spacing) live as CSS custom properties in one file (`app/globals.css`), each one both a real CSS variable and a generated utility class. No second config file that can drift from it. |
| **PostgreSQL, hosted on Neon** | Vercel's filesystem is read-only in production — a file-based database like SQLite would silently fail to save an enquiry there. Postgres is a real network service, so it works the same locally and deployed. |
| **Prisma** | Typed database access, plus migrations that describe every schema change as a reviewable file rather than a manual `ALTER TABLE` someone has to remember they ran. |
| **Server Actions** | The enquiry form posts directly to a server-side function — no hand-built API route, no client-side fetch boilerplate, and the validation it runs is unreachable from the browser's DevTools. |

## How the filtering actually works

This is the part worth understanding, not just believing works.

Someone changes a filter — say, "Mumbai" — and the browser navigates to
`/properties?city=Mumbai`. That's it; the filter's entire state lives in the
URL, which is why the back button, a page refresh, and pasting the link to
someone else all show the same result without any extra code.

A Server Component reads those URL parameters, checks each one against an
explicit allow-list (a real city, a sane price, a bedroom count that exists
as an option — anything else is silently dropped, never crashed on), and
turns the survivors into a database query. Postgres returns only the rows
that match. **The browser never receives, and never filters, a property that
didn't match** — there is no client-side `.filter()` anywhere in this
codebase, and finding one would mean this design failed.

The one wrinkle: the mobile filter sheet shows a live "12 properties" count
*before* you've applied anything, for selections that don't exist in the URL
yet. That count comes from a Server Action that runs the identical
filter-to-query logic and asks Postgres for a count instead of the rows —
the same two functions powering the real page, not a second implementation
that could quietly disagree with the first.

## Running it locally

```bash
git clone <this repo>
cd verge
npm install
cp .env.example .env.local   # add your own Postgres connection string
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The seed is deterministic — it clears and
reloads the same ten properties every time, so `npm run db:seed` is always
safe to re-run.

## What was deliberately left out, and why

- **Authentication.** `/admin` — the page that lists enquiries — has no
  login. It's not linked from anywhere on the site and exists to prove the
  pipeline genuinely writes to a database, not to be a real back office. A
  production version needs real auth before it holds one real lead.
- **The shot list.** The original plan was a timestamped index beside each
  video — click "0:11 Kitchen," the clip jumps there. It was fully designed
  and then cut once the real footage arrived showing one room per clip
  rather than a walkthrough: there was nothing to index into, so every
  timestamp would have been invented. Each clip has a plain caption instead
  ("Kitchen," "Bedroom, west-facing"). Recorded as a scoping decision made on
  contact with the real material, not an oversight.
- **Elaborate SEO.** Titles, descriptions, canonical URLs, and Open Graph
  images are all real and correct. Sitemaps, structured data, and a
  `robots.txt` beyond the default are not — reasonable scope for a ten-page
  portfolio site, disproportionate effort for what they'd actually return.
