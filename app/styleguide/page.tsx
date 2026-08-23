import type { Metadata } from "next";

import { PropertyCard, type PropertyCardData } from "@/components/PropertyCard";
import { VergeIcon } from "@/components/VergeIcon";
import { formatPriceInr } from "@/lib/format-price";
import { prisma } from "@/lib/prisma";

// Temporary review surface. Deleted in Phase 7.
export const metadata: Metadata = { title: "Styleguide", robots: { index: false } };

const COLOURS = [
  { name: "ink", value: "#0A0A0A", on: "paper", ratio: "18.94:1", use: "All primary text" },
  { name: "paper", value: "#FAFAF8", on: "ink", ratio: "18.94:1", use: "Page ground" },
  { name: "muted", value: "#6B6B6B", on: "paper", ratio: "5.10:1", use: "Location, facts, captions" },
  { name: "edge", value: "#8E8E8A", on: "paper", ratio: "3.15:1", use: "Borders that are real UI" },
  { name: "hairline", value: "#E4E4E1", on: "paper", ratio: "1.22:1", use: "Decorative rules only" },
  { name: "accent", value: "#1F3B73", on: "paper", ratio: "10.40:1", use: "CTAs and focus, nothing else" },
];

const TYPE_ROWS = [
  { role: "Display", cls: "font-display text-display md:text-display-lg", note: "40 / 64 · DM Serif · 1.05 · −0.02em", sample: "Eight minutes to Bandra station" },
  { role: "Heading", cls: "font-display text-heading md:text-heading-lg", note: "26 / 34 · DM Serif · 1.15 · −0.01em", sample: "Worli Sea Face Penthouse" },
  { role: "Subheading", cls: "text-sub md:text-sub-lg", note: "18 / 20 · Lexend Deca 500 · 1.35", sample: "What a buyer needs before enquiring" },
  { role: "Body", cls: "text-body", note: "16 · Lexend Deca 400 · 1.6 · 62–68 char measure", sample: "Duplex across the 41st and 42nd floors. 5,400 sq ft with a 900 sq ft private terrace facing the sea link. Italian marble on the lower level, teak above." },
  { role: "Meta", cls: "text-meta text-muted", note: "13 · Lexend Deca 400 · 1.45", sample: "Assagao–Anjuna Village Panchayat Ward 4, North Goa" },
  { role: "Caption", cls: "text-caption text-muted uppercase", note: "12 · Lexend Deca 500 · 0.10em · uppercase", sample: "5 bed · Penthouse · 5,400 sq ft" },
];

const PRICE_SAMPLES = [8_500_000, 13_500_000, 24_000_000, 64_000_000, 185_000_000, 0];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline pt-8">
      <h2 className="text-caption text-muted uppercase">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function StyleguidePage() {
  const properties = await prisma.property.findMany({
    orderBy: { id: "asc" },
    take: 4,
  });
  const long = await prisma.property.findUnique({
    where: { slug: "coconut-grove-assagao-phase-two" },
  });

  const toCard = (p: (typeof properties)[number]): PropertyCardData => ({
    slug: p.slug,
    name: p.name,
    locality: p.locality,
    city: p.city,
    propertyType: p.propertyType,
    bedrooms: p.bedrooms,
    priceInr: p.priceInr,
    areaSqft: p.areaSqft,
    videoUrl: p.videoUrl,
    posterUrl: p.posterUrl,
  });

  return (
    <div className="mx-auto max-w-[1440px] space-y-16 px-6 py-12 md:px-12">
      <header>
        <h1 className="font-display text-display md:text-display-lg">Styleguide</h1>
        <p className="mt-4 max-w-[34rem] text-body text-muted">
          Review surface for Phase 2. Not linked from the finished site and
          deleted in Phase 7.
        </p>
      </header>

      <Section title="Colour">
        <ul className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {COLOURS.map((c) => (
            <li key={c.name} className="bg-paper p-4">
              <div className="h-16 w-full border border-hairline" style={{ backgroundColor: c.value }} />
              <p className="mt-3 text-meta text-ink">
                {c.name} <span className="text-muted">{c.value}</span>
              </p>
              <p className="text-caption text-muted uppercase">
                {c.ratio} on {c.on}
              </p>
              <p className="mt-1 text-meta text-muted">{c.use}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-[34rem] text-meta text-muted">
          Hairline fails the 3:1 minimum for anything that carries meaning, so
          it is only ever a decorative rule. Form borders use edge.
        </p>
      </Section>

      <Section title="Type scale">
        <div className="space-y-8">
          {TYPE_ROWS.map((row) => (
            <div key={row.role} className="grid gap-2 border-b border-hairline pb-6 md:grid-cols-[160px_1fr] md:gap-8">
              <div>
                <p className="text-caption text-muted uppercase">{row.role}</p>
                <p className="mt-1 text-meta text-muted">{row.note}</p>
              </div>
              <p className={`${row.cls} max-w-[34rem]`}>{row.sample}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[34rem] text-body text-muted">
          DM Serif Display has one weight and no bold. Hierarchy comes from the
          size steps above, from measure, and from setting the serif against
          Lexend Deca — never from a synthetic bold, which{" "}
          <code className="text-meta">font-synthesis: none</code> forbids.
        </p>
      </Section>

      <Section title="Price formatting">
        <ul className="flex flex-wrap gap-x-10 gap-y-3">
          {PRICE_SAMPLES.map((p) => (
            <li key={p}>
              <span className="text-sub text-ink tabular-nums">{formatPriceInr(p)}</span>
              <span className="ml-3 text-meta text-muted tabular-nums">{p.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Icon">
        <div className="flex flex-wrap items-end gap-10 text-ink">
          {[20, 22, 29, 48].map((size) => (
            <div key={size} className="flex flex-col items-center gap-3">
              <VergeIcon size={size} />
              <span className="text-caption text-muted uppercase">{size}px</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-3 bg-ink p-4 text-paper">
            <VergeIcon size={22} />
            <span className="text-caption uppercase">inverted</span>
          </div>
        </div>
        <p className="mt-4 max-w-[34rem] text-meta text-muted">
          The mark is 1196 × 892 units in a square 1292 viewBox, so a 20px box
          renders roughly 14px of actual ink. Legible, but optically smaller
          than the nav text beside it.
        </p>
      </Section>

      <Section title="PropertyCard — normal">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={toCard(p)} />
          ))}
        </div>
      </Section>

      <Section title="PropertyCard — focus, long name, missing media">
        <p className="mb-6 max-w-[34rem] text-body text-muted">
          Tab into the first card to see the real focus ring: an inner paper ring
          so it survives on dark video, and an accent ring outside it.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {long ? <PropertyCard property={toCard(long)} /> : null}
          {long ? (
            <PropertyCard
              property={{ ...toCard(long), videoUrl: null, name: "Poster only, video missing" }}
            />
          ) : null}
          {long ? (
            <PropertyCard
              property={{
                ...toCard(long),
                videoUrl: null,
                posterUrl: null,
                name: "No video and no poster",
              }}
            />
          ) : null}
        </div>
      </Section>
    </div>
  );
}
