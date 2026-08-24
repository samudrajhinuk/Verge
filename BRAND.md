# Verge — brand

This sits above `CLAUDE.md` §5 (Visual design). §5 is *how things look* —
colours, type, spacing. This is *how the site talks and what repeats* — no
new hex values, faces, or motion live here, only rules for using what's
already defined.

## Root idea

"Verge" — on the verge: the moment before a change, an edge about to be
crossed. A buyer here is on the verge of a move, not mid-move. This idea
governs the system's *structure* — it should be legible in what repeats,
not spelled out in what things say. It is used **once**, in words, across
the entire site (Part 1, Rule 4). Everywhere else it shows up only as
shape: an edge that marks a boundary, a still frame that holds until
crossed. If you catch yourself writing "threshold" or "edge" a second time
anywhere, that's the signal to delete it, not to find a synonym.

---

## Part 1 — Voice

**Rule 1 — Register: plain, factual, unhurried.**
State what is true and stop. Adjectives are allowed only when they carry a
fact (*west-facing*, *sea-facing*); banned the moment they're doing
persuasion's job instead of a noun's.
- Real: *"Open on three sides, with the sea visible from the west
  elevation. 2,180 sq ft carpet. IPS-finished concrete floors, full-height
  glazing along the living room."* (Pali Hill)
- Rejected (same property, corrupted): *"Discover a dream home where
  luxury meets the sea — this stunning apartment boasts breathtaking
  views."*

**Rule 2 — Sentence shape: short declaratives, one idea each.**
No comma-stacking three facts into one sentence to sound grander.
- Real: *"Built 2011, roof waterproofed 2023."* — two facts, one comma
  because they're one event, not padding. (Palm Meadows)
- Rejected: *"Built in 2011 and lovingly maintained ever since, this
  remarkable villa also benefits from a roof that was thoughtfully
  waterproofed in 2023 for your peace of mind."*

**Rule 3 — Banned words and moves.**
*dream, luxury, elevate, discover, experience, nestled, boasts* — plus
exclamation marks and emoji. (Extends the templates already named in §5.15.)
- Real caption: *"Bedroom, west-facing."*
- Rejected: *"Experience the dream of luxury — this stunning bedroom
  boasts breathtaking west-facing views!"*

**Rule 4 — The one permitted nod.**
"Verge / edge / threshold / the moment before" may appear **once** across
the whole site, outside the brand name itself — in the homepage hero
statement, written in Phase 6, nowhere else. Not in descriptions, captions,
facts, filters, empty states, or the enquiry confirmation.
- Illustrative only, not final copy (Phase 6 writes the real line): *"Ten
  residences. See the moment before you decide."*
- Rejected — the overplay failure mode, shown across captions where it must
  never appear: *"Kitchen, at the edge of morning light." / "Bedroom, the
  verge of rest." / "Entrance, a threshold moment."* — three uses, and the
  idea is already dead.

---

## Part 2 — Visual rhyming

Three gestures. All three already exist in the tokens and the committed
components — this section makes them deliberate and non-negotiable rather
than incidental.

**1. The threshold line.**
One hairline rule (`--color-hairline`, 1px, decorative weight — §5.12),
always in the same place-meaning: it marks a boundary, never decorates a
box. Recurs: under the nav, above the footer, between each row in
`PropertyFacts`, above the filter bar, at the top of the filter sheet.
*Breaking it* means using the hairline anywhere that isn't a real edge
(around a card, under a heading with nothing being divided) — the moment
it stops meaning "boundary," it's decoration, and §5.12 already forbids
that.

**2. The reveal.**
The poster is the held moment; playback is the crossing. This needs no new
motion — it's what `PropertyMedia` and `VideoPlayer` already do. On cards,
the clip starts the instant it crosses the viewport's own edge
(`IntersectionObserver`) — the mechanism and the metaphor already line up
without being contrived. On the detail page, the crossing is the visitor's
own decision: the poster holds until they press play. *Breaking it* means
autoplaying the detail-page video (removes the visitor's choice to cross)
or freezing a card's poster once it's in view with no clip behind it (the
threshold with nothing on the other side).

**3. Content anchors to an edge, never the centre.**
Nothing on the site is centred: the nav is icon-left/links-right, the hero
statement sits lower-left (§4.1, already specified against the generic
centred-hero template), `PropertyFacts` pairs a left label against a right
value, the footer is one left-aligned column. Content holds a corner or an
edge of its container, never the middle. *Breaking it* means a centred
hero, a centred CTA, or a centred page heading — each one is also
independently the generic default §5.15 already tells you to avoid, which
is exactly why this gesture is cheap to keep.

No fourth gesture. Numbered markers, a repeating icon motif, or a
recurring shape beyond these three would be decoration standing in for an
idea, which is the thing this file exists to prevent.
