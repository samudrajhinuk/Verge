import Link from "next/link";

import { PropertyMedia } from "@/components/PropertyMedia";
import { formatPriceInr } from "@/lib/format-price";

// Only the fields the card actually draws. Taking a narrow shape rather than
// the whole Prisma model keeps it obvious what a card needs, and means the
// listing query can select just these columns later.
export type PropertyCardData = {
  slug: string;
  name: string;
  locality: string;
  city: string;
  propertyType: string;
  bedrooms: number;
  priceInr: number;
  areaSqft: number;
  videoUrl: string | null;
  posterUrl: string | null;
};

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const {
    slug,
    name,
    locality,
    city,
    propertyType,
    bedrooms,
    priceInr,
    areaSqft,
    videoUrl,
    posterUrl,
  } = property;

  return (
    <article>
      {/* One link around the whole card. The video carries tabIndex={-1} so it
          never becomes a second tab stop inside this one. */}
      <Link
        href={`/properties/${slug}`}
        className="focus-ring group block"
        aria-label={`${name}, ${locality}, ${formatPriceInr(priceInr)}`}
      >
        <div className="overflow-hidden">
          <PropertyMedia
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            caption={`${name}, ${locality}`}
          />
        </div>

        <h3 className="wrap-anywhere mt-4 font-display text-sub text-ink md:text-sub-lg">
          <span className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-ink">
            {name}
          </span>
        </h3>

        <p className="wrap-anywhere mt-1 text-meta text-muted">{locality}, {city}</p>

        {/* The price is a fact, so it is set at the same size as the name in
            the regular sans weight — present and findable, not shouted. */}
        <p className="mt-3 text-sub text-ink tabular-nums md:text-sub-lg">
          {formatPriceInr(priceInr)}
        </p>

        <p className="mt-1 text-caption text-muted uppercase tabular-nums">
          {bedrooms} bed · {propertyType} · {areaSqft.toLocaleString("en-IN")} sq
          ft
        </p>
      </Link>
    </article>
  );
}
