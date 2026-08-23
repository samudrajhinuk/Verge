# VERGE — COMPLETE BUILD BLUEPRINT
Your reference document. Read it once end to end, then keep it open while building.
**One correction before you start:** your question mentions SQLite. We changed that to PostgreSQL (hosted on Neon). SQLite would break in production on Vercel — the server's filesystem is read-only there, so saving an enquiry would silently fail. Everywhere below says Postgres. The Prisma code is nearly identical either way.
---
# 1. WHAT VERGE IS
## 1.1 What Verge is
Verge is a fictional premium real-estate developer. It sells apartments, villas and penthouses in Indian cities.
You are building its website.
## 1.2 What the website does
It does two jobs, in this order:
1st — Show people the properties.
2nd — Collect their contact details when they want to know more.
That second thing is called a **lead**. A lead is a person who has expressed interest and given you a way to contact them. The whole site exists to produce leads.
## 1.3 What makes Verge different from a normal real-estate website
A normal real-estate site shows a **photo gallery**: fifteen still images per property, which you click through one at a time.
Verge shows **one vertical video per property** instead. Vertical means portrait orientation — the shape of a phone screen, taller than it is wide.
**Why this is a real idea and not just a style choice:** a photo gallery lets you skip straight to the kitchen. A video does not — you have to watch it in order. That is the weakness of video, and most video-led sites ignore it.
Verge solves it with the **shot list**: a timestamped list beside the video saying what appears when.
```
0:00   Entrance and hall
0:11   Living room, west glazing
0:19   Kitchen
0:26   Principal bedroom
```
Each line is a button. Click it, the video jumps there. You get video's continuity *and* the gallery's random access.
**This is the single most important thing on the site.** If Rishank asks what makes it more than a nice-looking page, this is your answer.
## 1.4 Who the target user is
A person in an Indian metro looking to buy a home in the ₹1–20 crore range. They are browsing on a phone, in the evening, comparing several properties. They are not ready to buy today — they are ready to *ask a question*.
## 1.5 What we want that user to do
Submit an enquiry on one specific property.
Not "contact us". Not "sign up". One action: send a message about a property they just watched.
## 1.6 The primary business goal
**Turn a video viewer into a qualified enquiry.**
"Qualified" means the enquiry is attached to a specific property, so Verge's sales team knows what the person is interested in before they call back.
Every decision in this document serves that sentence. If a feature does not, it should not exist.
---
# 2. THE COMPLETE USER JOURNEY
## 1st — They arrive at the homepage
**What they see:** a full-screen vertical video of a building, playing silently. Over it, the Verge name and one short statement. Below that, one button.
**What they can do:** watch, or press the button.
**Information received:** this is a property company, and video is how it presents things.
**Why this section exists:** to establish the format in three seconds without explaining it. A person who sees a silent autoplaying property video understands the premise immediately.
**Intended next action:** press the button to see properties.
## 2nd — They reach the property listing
**What they see:** a grid of property cards. Each card is a vertical video with the property name, location, price and bed count beneath it. At the top, the count of results.
**What they can do:** scroll, or open filters.
**Information received:** how many properties exist, roughly what they cost, what areas are covered.
**Why this section exists:** this is the discovery surface. Everything before it is introduction; everything after it is commitment.
**Intended next action:** either filter down, or tap a property.
## 3rd — They narrow the results
**What they see (mobile):** a button fixed at the bottom of the screen reading "Filter". Tapping it slides a panel up from the bottom — this is a **bottom sheet**. Inside are four controls: location, price range, bedrooms, property type. As they change controls, a line updates: "7 properties". At the bottom, an Apply button.
**What they see (desktop):** the same four controls in a horizontal bar under the navigation.
**What they can do:** change filters, apply, or reset.
**Information received:** how many properties match before committing to the change. This is the important part — they never apply a filter and discover it returned nothing.
**Why this section exists:** ten properties is browsable; a real site has hundreds. Filtering demonstrates the backend, and the live count demonstrates you thought about the user.
**Intended next action:** apply, then tap a property.
## 4th — They open a property
**What they see, top to bottom:** the vertical video, larger. Beside it (desktop) or beneath it (mobile), the shot list. Below, the property name, location, price. Below that, the facts — size, floor, bedrooms, bathrooms, possession date. Below that, a paragraph of description. At the end, the enquiry form.
**What they can do:** watch, jump to a moment via the shot list, read the facts, enquire.
**Information received:** everything needed to decide whether to ask a question.
**Why this section exists:** this is where interest converts to intent. The video creates desire; the facts create confidence; the form captures the result.
**Intended next action:** fill in the form.
## 5th — They submit an enquiry
**What they see:** four fields — name, email, phone, message. The message field is pre-filled with the property name so they do not have to type it.
**What they can do:** submit.
**What happens:** the button shows a pending state. Then the form is replaced by a confirmation saying the enquiry was received, naming the property, and stating when someone will respond.
**Why this section exists:** it is the business goal.
**Intended next action:** none. The journey is complete. Do not add "browse more properties" here — it undercuts the finality of the moment.
## 6th — Verge sees the enquiry
**What they see:** at `/admin`, a plain table of enquiries — who, which property, when, what they said.
**Why this section exists:** it proves the pipeline is real. Without it, a viewer has no evidence the form did anything.
---
# 3. SITE STRUCTURE
## 3.1 The sitemap
```
/                          Homepage
/properties                Property listing
/properties/[slug]         Individual property
/admin                     Enquiry list (demo)
```
**What "slug" means:** a slug is the human-readable identifier in a URL. For a property called "Pali Hill, 14th Floor" the slug is `pali-hill-14th-floor`, and the URL is `/properties/pali-hill-14th-floor`.
The square brackets in `[slug]` mean "any value goes here". You write **one** file that serves all ten properties. That is called a **dynamic route**.
## 3.2 How the routes connect
```
/  ──(main button)──►  /properties  ──(tap a card)──►  /properties/[slug]
                            ▲                                  │
                            └────────(back button)─────────────┘
/properties/[slug]  ──(submit form)──►  same page, success state
                                              │
                                              ▼
                                     enquiry appears at /admin
```
`/admin` is not linked from anywhere in the site. You reach it by typing the URL. That is deliberate — it is a demo view, not a public page.
---
# 4. PAGE-BY-PAGE LAYOUT
## 4.1 Homepage (`/`)
### Section 1 → Navigation
- **Purpose:** identify the brand, give one route onward.
- **Content:** Verge icon on the left. Three links on the right: Properties, About, Enquire.
- **Layout:** full width, fixed height, sits over the video.
- **Interaction:** links navigate.
- **Prominent:** nothing. The nav should be nearly invisible over the video.
- **Quiet:** all of it. White text, no background bar, no shadow.
### Section 2 → Hero
- **Purpose:** establish the video-led premise in under three seconds.
- **Content:** one vertical video filling the screen. Over it: the word Verge, and one sentence you write yourself. One button: "See the properties".
- **Layout:** video fills the viewport. Text sits in the lower-left, not centred. **Design decision:** lower-left rather than centred, because centred-over-hero-video is the most common template layout in existence and reads as generic immediately.
- **Interaction:** the button goes to `/properties`.
- **Prominent:** the video, then the sentence.
- **Quiet:** the nav, the button (outlined, not filled).
### Section 3 → Proof
- **Purpose:** answer "why should I trust this company" in one screen.
- **Content:** three facts, set large, as text. Example: "11 developments · 4 cities · Possession within 18 months". No icons. No cards.
- **Layout:** a single horizontal row on desktop, stacked on mobile, separated by thin rules.
- **Interaction:** none.
- **Prominent:** the numbers.
- **Quiet:** the labels.
> **Blind spot flagged:** the instinct here is a three-column grid with an icon above each item. Do not. That specific pattern is the clearest visual signature of AI-generated design, and Rishank looks at websites for a living.
### Section 4 → Footer
- **Purpose:** close the page, provide contact.
- **Content:** the word Verge, an email address, a phone number, a line of copyright.
- **Layout:** left-aligned, one column, generous space above.
- **Prominent:** nothing.
## 4.2 Property listing (`/properties`)
### Section 1 → Navigation
Same as homepage, but on a solid background rather than over video.
### Section 2 → Filter bar (desktop) / result count (mobile)
- **Purpose:** let the user narrow results; tell them how many there are.
- **Content (desktop):** four controls in a row — Location, Price, Bedrooms, Type — with the result count on the right.
- **Content (mobile):** just the count. Filters live in the bottom sheet instead.
- **Layout:** a single horizontal band, separated from content by a hairline rule.
- **Interaction:** changing a control updates the URL and re-runs the query.
- **Prominent:** the result count.
- **Quiet:** the controls themselves — plain text with underlines, not boxed dropdowns.
### Section 3 → Property grid
- **Purpose:** discovery.
- **Content:** property cards.
- **Layout:** 4 columns at 1440px, 3 at 1280px, 2 at 768px, 1 at 375px. Gutter (the gap between columns) 24px.
- **Interaction:** the whole card is one link to the property.
- **Prominent:** the video.
- **Quiet:** everything else. No borders, no shadows, no background on the card. The video *is* the card.
### Section 4 → Filter button (mobile only)
- **Purpose:** open the filter sheet.
- **Content:** the word "Filter" and, when filters are active, the count in brackets: `Filter (2)`.
- **Layout:** fixed to the bottom of the screen, minimum 44px tall.
- **Interaction:** tap opens the bottom sheet.
**Why 44px:** that is the smallest touch target most people can hit reliably. Anything smaller produces mis-taps.
## 4.3 Property detail (`/properties/[slug]`)
### Section 1 → Navigation
Same as listing.
### Section 2 → Video and shot list
- **Purpose:** the property presentation. This is the heart of the site.
- **Content:** the vertical video, and the timestamped shot list.
- **Layout (desktop):** video on the left at roughly one third width, shot list on the right, top-aligned with the video.
- **Layout (mobile):** video full width, shot list directly beneath.
- **Interaction:** each shot-list line is a button; clicking seeks the video to that timestamp.
- **Prominent:** the video.
- **Quiet:** the shot list — plain left-aligned text against a hairline, no boxes, no icons.
### Section 3 → Identity
- **Purpose:** name the thing being sold.
- **Content:** property name (large, serif), location beneath it, price beneath that.
- **Layout:** left-aligned, stacked, generous space above.
- **Prominent:** the name.
- **Quiet:** the price — set it as a plain fact, not a highlighted badge. **Design decision:** premium brands state prices quietly. Emphasising the price signals discount, not luxury.
### Section 4 → Facts
- **Purpose:** the information a buyer needs before enquiring.
- **Content:** size in sq ft, bedrooms, bathrooms, floor, facing direction, possession date.
- **Layout:** a two-column list on desktop, single column on mobile. Label left, value right, separated by hairlines.
- **Prominent:** the values.
- **Quiet:** the labels.
### Section 5 → Description
- **Purpose:** the human voice of the listing.
- **Content:** one paragraph, 60–80 words.
- **Layout:** constrained to about 65 characters per line. **Why:** lines longer than that are measurably harder to read, because the eye loses its place returning to the start of the next line.
### Section 6 → Enquiry form
- **Purpose:** the business goal.
- **Content:** a short heading, then four fields — name, email, phone, message.
- **Layout:** single column, full width up to about 480px, left-aligned.
- **Interaction:** submit sends the enquiry.
- **Prominent:** the submit button — the only filled, solid button on the entire site.
- **Quiet:** the field labels.
> **Design decision:** the submit button is the single most emphasised element on the whole site. If everything else stays restrained, this one button carries all the visual weight. That is what "conversion-focused design" actually means in practice.
### Section 7 → Footer
Same as homepage.
## 4.4 Admin (`/admin`)
- **Purpose:** prove the pipeline is real.
- **Content:** a heading, a visible note reading "Demo view — no authentication", and a table: date, name, email, phone, property, message.
- **Layout:** plain table, hairline rules, no styling ambition.
- **Prominent:** nothing. This page should look deliberately utilitarian.
---
# 5. VISUAL DESIGN
## 5.1 Colour palette
| Name | Hex | Used for |
|---|---|---|
| Ink | `#0A0A0A` | Page background, all dark surfaces |
| Paper | `#F5F4F2` | Primary text on ink, light surfaces |
| Ink 60 | `rgba(245,244,242,0.6)` | Secondary text, labels |
| Ink 20 | `rgba(245,244,242,0.2)` | Hairline rules, borders |
| Accent | one colour, chosen in your design plan | Focus rings, the submit button, active filter state |
**Rule:** the accent appears **only** on interactive things. It never decorates. If you can point at accent-coloured pixels that are not a button, a link, or a focus ring, remove them.
## 5.2 Typography
- **Display: DM Serif Display.** Property names, page headings, the hero statement. Used with restraint — it is not the default for every piece of text, only these specific roles.
- **Body/UI: Lexend Deca.** Everything else — body copy, labels, buttons, facts, form fields, shot list. Variable weights are available on this face.
**The constraint you must design around:** DM Serif Display has **one weight (400) and an italic**. There is no bold. Hierarchy comes from **size, measure and spacing only**.
Never let the browser fake a bold — that produces a smeared, cheap-looking result called synthetic bold.
**Loading:** both faces load via `next/font`, subset appropriately, with explicit fallback fonts set so there is no layout shift while they load.

> *Amendment, 2026-08-24:* the two bullets above and the loading note were tightened for Phase 2 — no change in substance from the original brief, just spelled out explicitly (restraint, variable weights, `next/font` loading) so there's no ambiguity going into implementation.
## 5.3 Typography hierarchy
| Role | Face | Mobile | Desktop | Line-height | Letter-spacing | Used for |
|---|---|---|---|---|---|---|
| Display | DM Serif | 40px | 64px | 1.05 | −0.02em | Hero statement (homepage) |
| Heading | DM Serif | 26px | 34px | 1.15 | −0.01em | Property name on the detail page (its `<h1>`); the `/admin` heading |
| Sub | DM Serif | 18px | 20px | 1.35 | −0.01em | Property name on a listing card |
| Body | Lexend | 16px | 16px | 1.6 | — | Body copy, descriptions |
| Meta | Lexend | 13px | 13px | 1.45 | — | Locality, facts, shot list |
| Caption | Lexend | 12px | 12px | 1.2 | 0.10em, uppercase | Bed/type/area line, small labels |
**Why:** large text needs tighter leading or it falls apart into separate lines; small text needs looser leading or it becomes a grey block.
Set the shot list and all numbers in **tabular figures** — a font setting where every digit occupies the same width, so timestamps and prices align vertically in a column.

> *Amendment, 2026-08-24:* consolidated from four serif sizes (Hero statement 40/72, Page heading 32/48, Property name 28/40) to three (Display, Heading, Sub) after confirming no page in the sitemap ever needs a large serif heading distinct from the hero, a property name, or `/admin`'s title — "Page heading" was never a separate use case in practice. Desktop Display is 64px, not 72px, chosen by comparing both rendered side by side against the rest of the (deliberately quiet) system — see DECISIONS.md, Phase 2. `Meta` is the working size for the shot list until Phase 4 (`ShotList` component) shows a need for something else.
## 5.4 Spacing
Use one scale, and never a value outside it:
`4 · 8 · 16 · 24 · 40 · 64 · 96 · 160`
**Why a scale:** arbitrary spacing is the fastest way to make a minimal design look sloppy. With almost no decoration, spacing *is* the design.
Section padding: 64px mobile, 160px desktop.
## 5.5 Grid
12 columns, 24px gutter, 24px page margin on mobile and 64px on desktop.
Property grid: 4 columns at 1440, 3 at 1280, 2 at 768, 1 at 375.
## 5.6 Buttons
Three kinds only:
1. **Primary** — solid accent, paper text. Used once per page maximum. The enquiry submit.
2. **Secondary** — 1px border, transparent background. The hero CTA, Apply in the filter sheet.
3. **Text** — underlined text, no box. Reset filters, shot list lines.
No rounded pills. Radius 0 or 2px, nothing more. Minimum 44px tall on mobile.
## 5.7 Property cards
Vertical video at 9:16 aspect ratio. Beneath it, in Lexend: property name, location, price, then `3 bed · Apartment` on one line.
No border. No shadow. No background. No radius on the video. The card is defined by the space around it, not by a box drawn around it.
## 5.8 Forms
Label above the field, always visible. Never use placeholder text as the label — it vanishes when the user types, and people forget what the field was for.
Field: transparent background, 1px bottom border only, 44px tall. On focus, the bottom border becomes the accent colour and thickens to 2px.
Errors: accent-coloured text directly beneath the field, plus a change to the border. **Never colour alone** — some users cannot distinguish it.
## 5.9 Filters
Desktop: plain text with a thin underline, not boxed dropdowns. Active filters show in the accent colour.
Mobile: bottom sheet, ink background, hairline divider at the top, 24px padding, Apply button fixed at the bottom of the sheet.
## 5.10 Navigation
Icon left, three text links right. 13px Lexend, letter-spaced. No hamburger menu on mobile — three links fit. **Why this matters:** a hamburger for three items hides content for no reason and costs an extra tap.
## 5.11 Video treatment
Always 9:16. Never cropped to fit a layout — if the layout does not fit the video, change the layout. `object-fit: cover` within the correct ratio container.
Muted always. Autoplay on listing cards and hero. Controls visible on the detail page only.
## 5.12 Borders and radius
Borders: 1px, Ink 20, used only to separate sections and as form underlines.
Radius: 0 everywhere, except 2px on buttons. **Design decision:** rounded corners read as friendly and app-like. Verge is meant to read as editorial and expensive.
## 5.13 Icons
One icon exists on this website: the Verge mark in the nav. That is all.
No icons in the proof section, no chevrons on links, no house symbols, no arrows on buttons. **Why:** icon clutter is the second-clearest signature of templated design after the three-column feature grid.
## 5.14 Motion
Permitted:
- Page transitions: none.
- Bottom sheet: slides up over 240ms.
- Link and button hover: opacity or border colour change over 150ms.
- Focus ring: appears instantly, no transition.
Banned: scroll-triggered reveals, parallax, counting-up numbers, staggered card entrances, anything that moves without being caused by the user.
All of it wrapped in `prefers-reduced-motion` — a browser setting where a user has asked the operating system to reduce animation. Respecting it is not optional.
## 5.15 What to deliberately avoid
- Centred hero with headline, grey subtitle, two side-by-side buttons
- Three-column grid with an icon above each heading
- Numbered markers 01 / 02 / 03 where the content is not a sequence
- Cards with shadows and rounded corners
- Gradients of any kind
- Glassmorphism (frosted blurred panels)
- Pill-shaped tags used decoratively
- Invented testimonials with star ratings
- Emoji anywhere
- Copy like "Discover your dream home" or "Where luxury meets comfort"
---
# 6. RESPONSIVE BEHAVIOUR
**Breakpoint** means a screen width at which the layout changes.
## 375px — small phone
- **Navigation:** icon 20px, three links at 13px, all fitting on one row.
- **Video:** full width minus 24px margins. Card media is 327 × 581px.
- **Property cards:** one column. One property fills the screen. **This is deliberate, not a shrunk grid** — vertical video's native form is a full-screen feed, and forcing two columns would produce 150px-wide video, which is useless.
- **Filters:** hidden. Replaced by a fixed bottom button.
- **Filter sheet:** slides up, covers roughly 80% of screen height, Apply fixed at the bottom.
- **Typography:** hero 40px, property name 28px, body 16px.
- **Spacing:** 24px page margin, 64px between sections.
- **Enquiry form:** full width, fields 44px tall, stacked.
- **Touch:** every interactive element minimum 44 × 44px, minimum 8px apart.
## 768px — tablet
- **Navigation:** unchanged.
- **Property cards:** two columns.
- **Filters:** still the bottom sheet. **Why:** 768px is usually a touch device, and a horizontal filter bar with four dropdowns is cramped and fiddly with a finger.
- **Typography:** hero 56px.
- **Spacing:** 40px page margin, 96px between sections.
- **Detail page:** video and shot list still stacked.
## 1280px — laptop
- **Navigation:** unchanged.
- **Property cards:** three columns, 390px wide, media 694px tall.
- **Filters:** switch to a horizontal bar. Bottom sheet no longer used.
- **Typography:** hero 72px.
- **Spacing:** 64px page margin, 160px between sections.
- **Detail page:** video left, shot list right.
## 1440px — desktop
- **Property cards:** four columns, 306px wide, media 544px tall.
- Content capped at 1440px, centred, so the layout does not stretch indefinitely on very wide screens.
**The arithmetic to have ready if asked:** the 9:16 ratio is fixed, so the only free variable is column count. Three columns at 1280px gives 694px-tall media — taller than most browser windows, so the grid becomes a wall. Four columns at 1440px gives 544px, roughly the proportion of a phone held at arm's length, which is the right mental model for the content. That is why four columns, and why the video is never cropped to make the grid convenient.
---
# 7. TECHNICAL ARCHITECTURE
## 7.1 Server Components and Client Components — the core concept
Modern Next.js has two kinds of component.
A **Server Component** runs on the server. It can talk to the database directly. Its JavaScript is never sent to the browser — only the finished HTML.
A **Client Component** runs in the browser. It can respond to clicks, hold temporary state, use the video player. It cannot talk to the database.
**Default to Server. Use Client only when something must respond to user interaction in real time.**
## 7.2 Which parts are which
**Server Components:**
- `app/page.tsx` (homepage)
- `app/properties/page.tsx` (listing — runs the filter query)
- `app/properties/[slug]/page.tsx` (detail — fetches one property)
- `app/admin/page.tsx` (reads enquiries)
- `PropertyCard` (just displays data)
**Client Components:**
- `FilterSheet` — opens, closes, holds temporary selections
- `FilterControls` — responds to changes
- `EnquiryForm` — validation feedback, pending state
- `VideoPlayer` on the detail page — the shot list seeks the video, which requires browser control
**Why the card is a Server Component even though it contains a video:** an autoplaying muted video needs no JavaScript. The HTML `<video>` element handles it. Only the *seeking* behaviour on the detail page needs JavaScript.
## 7.3 How URL filters work
A **search param** is the part of a URL after `?`:
```
/properties?city=Mumbai&beds=3
```
Next.js passes these to the page component automatically. Because they live in the URL rather than in browser memory:
- The URL is shareable — send it to someone, they see the same filtered results.
- The back button works, because the browser already tracks URL history.
- Refreshing preserves the filters.
- There is one source of truth instead of two that can disagree.
## 7.4 How Prisma fits
**Prisma** is an ORM — a tool that lets you query a database using TypeScript instead of writing SQL. You describe your data once in `schema.prisma`, and Prisma generates typed functions.
You write:
```ts
prisma.property.findMany({ where: { city: "Mumbai" } })
```
Prisma writes the SQL and returns typed results, so a typo in a field name is caught before the site runs.
## 7.5 How Postgres fits
Postgres is the database itself, hosted on Neon. Your app holds a connection string in `.env.local` — a file of secrets that is never committed to git.
## 7.6 Data flow — property listing
```
User changes a filter
  → URL becomes /properties?city=Mumbai&beds=3
  → Server Component reads the search params
  → params are validated and normalised
     (invalid values are dropped, not crashed on)
  → Prisma builds a WHERE clause from the valid params
  → Postgres returns only matching rows
  → HTML is rendered on the server with only those properties
  → browser receives finished HTML
```
**The sentence to remember:** the browser never receives the properties that did not match. That is what makes it genuinely server-side.
## 7.7 Data flow — enquiry
```
User fills the form and submits
  → Server Action runs on the server
  → validates name, email, phone, message
  → if invalid: returns field errors, form keeps the user's input
  → if valid: Prisma writes an Enquiry row linked to the property
  → returns success
  → form is replaced by the confirmation state
```
A **Server Action** is a function that lives on the server but can be called directly from a form, without you writing an API endpoint. Next.js handles the network call.
**Why validation happens on the server:** browser validation can be bypassed by anyone who opens developer tools. Client validation is for convenience; server validation is for correctness. Have this answer ready — it is a very likely interview question.
## 7.8 How /admin reads enquiries
A Server Component runs `prisma.enquiry.findMany()` with the related property included, ordered newest first, and renders a table. No JavaScript is sent to the browser at all.
---
# 8. DATABASE STRUCTURE
## 8.1 Property
| Field | Type | Why it exists |
|---|---|---|
| `id` | String | Unique identifier. Hardcoded in the seed for stability. |
| `slug` | String, unique | The URL. Indexed, because every detail page looks up by it. |
| `name` | String | Display name. |
| `city` | String | Filter field. Indexed. |
| `locality` | String | Neighbourhood, shown under the name. |
| `propertyType` | String | Filter field. Apartment / Villa / Penthouse. |
| `bedrooms` | Int | Filter field. |
| `bathrooms` | Int | Fact. |
| `priceInRupees` | BigInt | Filter field. Stored raw, formatted at display. |
| `areaSqFt` | Int | Fact. |
| `floor` | String | Fact. Nullable — villas have no floor. |
| `facing` | String | Fact. |
| `possession` | String | Fact. When it's ready. |
| `description` | String | The paragraph. |
| `videoUrl` | String | Path to the clip. |
| `posterUrl` | String | Still frame shown before video loads. |
| `shotList` | Json | Array of `{ time, label }`. |
| `createdAt` | DateTime | Fixed in seed for deterministic ordering. |
**Why `priceInRupees` is a BigInt:** ₹18.5 crore is 185,000,000. A standard integer is safe to about 2.1 billion, which ₹200+ crore properties would exceed. BigInt removes the risk entirely.
**Why `shotList` is Json and not its own table:** shot lists are only ever read as a complete list belonging to one property. You never query across them. A separate table would add a join for no benefit. **This is a deliberate simplification** — say so if asked, and add that a production system with editable shot lists would justify a real table.
## 8.2 Enquiry
| Field | Type | Why it exists |
|---|---|---|
| `id` | String | Unique identifier. |
| `name` | String | Who enquired. |
| `email` | String | How to reach them. |
| `phone` | String | Indian buyers expect a call, not an email. |
| `message` | String | What they asked. |
| `propertyId` | String | Which property. **The field that makes the lead qualified.** |
| `createdAt` | DateTime | When. Auto-generated — real enquiries genuinely happen at different times. |
## 8.3 The relationship
**One Property has many Enquiries. Each Enquiry belongs to exactly one Property.**
This is a **one-to-many relationship**, expressed by `propertyId` on Enquiry pointing at Property's `id`. It is a **foreign key** — the database itself refuses to store an enquiry for a property that does not exist.
---
# 9. COMPONENTS
| Component | What it does | Where used | Type | Receives |
|---|---|---|---|---|
| `Nav` | Icon and three links | Every page | Server | nothing |
| `Footer` | Brand, contact, copyright | Every page | Server | nothing |
| `VergeIcon` | The SVG mark | Nav | Server | `size`, `className` |
| `PropertyCard` | Video plus four lines of info; links to detail | Listing | Server | one property |
| `PropertyGrid` | Lays cards out in columns | Listing | Server | array of properties |
| `FilterControls` | The four inputs | Filter bar and sheet | Client | current values, change handler |
| `FilterBar` | Desktop horizontal filters | Listing, ≥1280px | Client | current filters, result count |
| `FilterSheet` | Mobile bottom sheet | Listing, <1280px | Client | current filters, live count |
| `VideoPlayer` | Video with seek control | Detail page | Client | video url, poster, ref for seeking |
| `ShotList` | Timestamped buttons | Detail page | Client | shot array, seek function |
| `PropertyFacts` | Label/value list | Detail page | Server | one property |
| `EnquiryForm` | Fields, validation, states | Detail page | Client | property id and name |
| `SkeletonCard` | Grey placeholder while loading | Listing | Server | nothing |
| `EmptyState` | Shown when filters match nothing | Listing | Server | active filters |
**Why `FilterControls` is separate from `FilterBar` and `FilterSheet`:** the same four inputs appear in two different containers. Without this split you would write the validation and option lists twice, and they would eventually disagree. This is the one place in the project where an extra component is genuinely earned.
---
# 10. STATES WE NEED TO BUILD
## 10.1 Loading
**User sees:** grey rectangles in the exact shape and position of property cards, with no animation.
**Can do:** wait. Nothing is interactive.
**Why placeholders and not a spinner:** the layout does not jump when real content arrives, so the page feels stable rather than jittery.
## 10.2 Empty results
**User sees:** "No properties match these filters." Then, specifically, which filters are active: "Mumbai · Villa · 4 bed". Then a button: "Clear filters".
**Can do:** clear all, or open filters and change one.
**Why name the active filters:** a generic "no results" leaves the user guessing which choice was too narrow.
## 10.3 Error
**User sees:** "Something went wrong loading properties." and a "Try again" button.
**Can do:** retry, or navigate away using the nav, which must remain functional.
**Never:** a blank page or a raw error message.
## 10.4 Validation error
**User sees:** accent-coloured text directly beneath the offending field, naming the problem: "Enter a valid email address." The field's border also changes. Everything they typed is still there.
**Can do:** fix it and resubmit.
**Accessibility requirement:** the error must be linked to its field with `aria-describedby`, so a screen reader announces it when the field is focused.
## 10.5 Form submitting
**User sees:** the button reads "Sending…" and is disabled. Fields are disabled.
**Can do:** wait.
**Why disable:** prevents double submission, which would create duplicate enquiries.
## 10.6 Form success
**User sees:** the form is replaced by a short confirmation naming the property and stating when someone will respond.
**Can do:** nothing further. This is the end.
**Accessibility requirement:** wrap it in `aria-live="polite"` so screen readers announce it. Without this, a blind user gets no feedback that anything happened.
## 10.7 Video unavailable
**User sees:** the poster image, still, filling the same space.
**Can do:** everything else on the page.
**Why this matters:** iOS blocks autoplay under Low Power Mode. If your layout collapses when video does not play, it breaks for a large share of real phone users — and you are pitching a video company.
## 10.8 Mobile filter open
**User sees:** the sheet covering the lower portion of the screen. The page behind is dimmed and does not scroll.
**Can do:** change filters, apply, reset, or close.
**Requirements:** keyboard focus is trapped inside the sheet — pressing Tab cycles within it, never reaching the page behind. Escape closes it. On close, focus returns to the Filter button that opened it.
## 10.9 Mobile filter closed
**User sees:** the grid with the fixed Filter button. If filters are active, the button shows the count: `Filter (2)`.
**Why show the count:** the user needs to know why they are seeing three properties instead of ten, without opening the sheet.
---
# 11. ACCESSIBILITY
## 11.1 Keyboard navigation
Every interactive element reachable by Tab, in the order it appears visually. Test it: put the mouse away, press Tab from the top of the listing page, and confirm you can filter and reach a property.
## 11.2 Focus
Every focusable element gets a visible focus ring: 2px accent, 2px offset. Never remove focus outlines — it makes the site unusable without a mouse.
In the filter sheet: focus moves into the sheet on open, is trapped inside, and returns to the trigger on close.
## 11.3 Screen readers
- Result count in an `aria-live="polite"` region, so filter changes are announced.
- Form success in an `aria-live="polite"` region.
- The Verge icon needs an accessible name, or is hidden from screen readers if the adjacent text already says Verge.
- Shot list buttons need names including the timestamp: "Jump to 0:11, living room".
## 11.4 Forms
Real `<label>` elements connected to inputs. Correct input types: `type="email"`, `type="tel"` — these change the phone keyboard, which is a real usability win on mobile. Errors connected by `aria-describedby`. Required fields marked in text, not with an asterisk alone.
## 11.5 Filter sheet
`role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing at its heading. Escape closes.
## 11.6 Video
Muted, `playsInline`. Poster image on every video. Controls reachable by keyboard on the detail page. The shot list is the accessible alternative to scrubbing.
## 11.7 Motion
Every animation inside `prefers-reduced-motion: reduce`. Autoplaying video paused when that setting is on.
## 11.8 Contrast
Minimum 4.5:1 for body text, 3:1 for large text. Paper on Ink passes comfortably. **Check Ink 60 specifically** — secondary text is where contrast failures usually hide.
Text over video must have a scrim (a dark overlay behind the text) or it fails contrast on light frames of the video.
## 11.9 Semantic HTML
`<nav>`, `<main>`, `<footer>`, `<article>` for cards, `<button>` for actions, `<a>` for navigation. One `<h1>` per page. Heading levels never skip.
**Why this matters more than it sounds:** screen readers navigate by headings and landmarks. Divs everywhere means no navigation at all.
---
# 12. PERFORMANCE
## 12.1 The core problem
Ten autoplaying videos on one page is a lot of data. On Indian mobile networks that is the difference between a site that feels premium and one that feels broken.
## 12.2 Video loading
- `preload="none"` on cards below the fold.
- Only the first four videos (the visible row) load immediately.
- The rest load as they scroll into view.
- Each file under 3MB.
## 12.3 Poster images
Every video has a poster — a still image displayed before the video loads. A few KB instead of megabytes. The page looks complete instantly, then videos fill in.
**This is the single highest-impact performance decision on the site.**
## 12.4 Lazy loading
Loading something only when it is about to be seen. Applies to below-the-fold videos and poster images. Above-the-fold media loads immediately — lazy-loading the hero would make the site look slower, not faster.
## 12.5 Image optimisation
Use `next/image` for posters. It serves modern formats and correct sizes automatically, and reserves the right space so the layout does not shift.
## 12.6 Server Components
Server Components ship zero JavaScript. Most of this site is Server Components, so most of the site ships no JavaScript at all.
## 12.7 Client JavaScript
Only four things need it: filter sheet, filter controls, video seeking, enquiry form. Everything else is HTML.
## 12.8 Suspense
`Suspense` lets the page render immediately with placeholders where slow content will appear. The nav, filter bar and result count show instantly; the grid fills in.
## 12.9 What should and should not load immediately
**Immediately:** fonts, nav, hero video poster, first row of property posters, all text.
**Not immediately:** videos below the fold, poster images below the fold, admin page (never visited by real users).
---
# 13. SEO
**SEO** means search engine optimisation — helping search engines understand and list your pages.
## 13.1 Homepage
Title: `Verge — Property, on video`
Description: one sentence about video-led property discovery.
## 13.2 Property listing
Title: `Properties — Verge`
Description: one sentence about browsing developments.
Filtered URLs should carry a canonical link pointing at the unfiltered `/properties`. **Why:** otherwise search engines index dozens of near-identical filtered pages and split your ranking across them.
## 13.3 Individual property pages
Generated per property:
Title: `Pali Hill, 14th Floor — Bandra West — Verge`
Description: the first line of the property description.
Add Open Graph tags with the poster image, so a shared link previews with the property still rather than a blank box.
**Stop there.** Structured data, sitemaps and robots directives are out of scope for a portfolio project, and saying "I scoped that out deliberately" is a better answer than a half-built SEO system.
---
# 14. EXACT BUILD ORDER
## Phase 1 — Foundation ✓ (done)
1. **Building:** project setup, `CLAUDE.md`, git, Prisma schema, seed data.
2. **Why now:** nothing can be displayed before data exists.
3. **Files:** `prisma/schema.prisma`, `prisma/seed.ts`, `lib/db.ts`, `CLAUDE.md`.
4. **Understand:** what a schema is; why the seed is deterministic.
5. **Test:** run the seed, open Prisma Studio, see ten properties.
6. **Finished when:** ten properties exist and rebuild identically every time.
## Phase 2 — Design system and card
1. **Building:** design plan, then tokens, fonts, and `PropertyCard`.
2. **Why now:** the card is the most repeated element. Getting it right first means every later page inherits correct decisions.
3. **Files:** `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`, `components/PropertyCard.tsx`, `components/VergeIcon.tsx`, `app/styleguide/page.tsx`.
4. **Understand:** why DM Serif Display's single weight forces size-based hierarchy.
5. **Test:** open `/styleguide`, check the card at all four widths, check a very long property name.
6. **Finished when:** the card looks right at 375, 768, 1280, 1440, has a visible focus ring, and does not break on long text.
## Phase 3 — Listing and filtering
1. **Building:** `/properties` with server-side filtering.
2. **Why now:** the card exists; this is where the backend becomes visible.
3. **Files:** `app/properties/page.tsx`, `lib/filters.ts`, `components/FilterBar.tsx`, `components/FilterSheet.tsx`, `components/FilterControls.tsx`, `components/PropertyGrid.tsx`.
4. **Understand:** search params → validation → Prisma query. **This is the most likely interview topic. Do not move on until you can explain it out loud.**
5. **Test:** apply a filter, copy the URL, open it in a new tab — same results. Press back — previous results. Type `?beds=banana` — page still works, shows empty state.
6. **Finished when:** all four filters work, URL is shareable, back button works, mobile sheet is keyboard operable.
## Phase 4 — Property detail
1. **Building:** `/properties/[slug]`, video, shot list, facts.
2. **Why now:** the listing links here; without it the journey dead-ends.
3. **Files:** `app/properties/[slug]/page.tsx`, `components/VideoPlayer.tsx`, `components/ShotList.tsx`, `components/PropertyFacts.tsx`.
4. **Understand:** dynamic routes; why the shot list requires a Client Component.
5. **Test:** click every shot-list line, confirm the video seeks. Operate it by keyboard. Test with a nonexistent slug — should show a proper 404.
6. **Finished when:** the shot list seeks accurately and works without a mouse.
## Phase 5 — Enquiry pipeline
1. **Building:** form, Server Action, validation, database write, `/admin`.
2. **Why now:** the detail page exists to lead here.
3. **Files:** `components/EnquiryForm.tsx`, `app/actions/enquiry.ts`, `app/admin/page.tsx`.
4. **Understand:** why server validation is the source of truth. **Second most likely interview topic.**
5. **Test:** submit valid data, see it at `/admin`. Submit an invalid email, confirm your other input is preserved. Double-click submit, confirm only one enquiry is created.
6. **Finished when:** enquiries save reliably and every failure mode is handled.
## Phase 6 — Homepage
1. **Building:** hero, proof, footer.
2. **Why now:** deliberately last. The homepage is the least technically demanding page and the most tempting to fiddle with. Building it last means it inherits a finished design system instead of inventing one.
3. **Files:** `app/page.tsx`, `components/Hero.tsx`, `components/Footer.tsx`.
4. **Understand:** why the hero uses a poster and a scrim.
5. **Test:** confirm the hero video does not delay the page. Check text contrast over the brightest frame.
6. **Finished when:** the page loads fast and reads as a statement rather than a template.
## Phase 7 — States, accessibility, responsive, ship
1. **Building:** loading, empty, error states; accessibility pass; responsive pass; README; delete `/styleguide`; deploy.
2. **Why now:** these cut across every page.
3. **Files:** `loading.tsx`, `error.tsx`, `not-found.tsx`, `components/SkeletonCard.tsx`, `components/EmptyState.tsx`, `README.md`.
4. **Understand:** how Next.js uses those specially-named files automatically.
5. **Test:** keyboard-only pass over every page. Throttle the network and watch loading states. Check all four widths one final time. Deploy to `verge.whoisneel.in` and test the live form.
6. **Finished when:** the live site works end to end on your phone, on mobile data.
---
# 15. FINAL MENTAL MODEL
## 15.1 In plain language
> A buyer lands on Verge and sees a property video. They browse the listings, narrow them by city and budget, and open one property. They watch the walkthrough, jump to the kitchen using the shot list, read the facts, and send an enquiry. Verge sees that enquiry, attached to that exact property.
## 15.2 Technically
> Server Component reads URL params → validates them → Prisma queries Postgres → filtered HTML is sent to the browser → user opens a property → a Client Component controls video seeking → the form calls a Server Action → the server validates → Prisma writes an Enquiry linked to the Property → the success state renders → `/admin` reads it back.
## 15.3 The one sentence to have ready
**"The browser never receives the properties that didn't match the filter — the query runs on the server and the HTML arrives already filtered."**
That single sentence demonstrates you understand the difference between a real backend and a visual effect. It is the most valuable thing in this document.
