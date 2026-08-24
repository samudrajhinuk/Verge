import type { Metadata } from "next";
import Link from "next/link";

import { FilterBar } from "@/components/FilterBar";
import { FilterSheet } from "@/components/FilterSheet";
import { PropertyGrid } from "@/components/PropertyGrid";
import {
  buildWhere,
  describeFilters,
  filtersToFormValues,
  parseFilters,
  type RawParams,
} from "@/lib/filters";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Properties",
  description:
    "Browse ten developments across seven Indian cities, filtered by location, price, bedrooms and type.",
  alternates: { canonical: "/properties" },
};

type PropertiesPageProps = {
  searchParams: Promise<RawParams>;
};

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedParams = await searchParams;
  const filters = parseFilters(resolvedParams);
  const formValues = filtersToFormValues(filters);

  // The query itself: URL params → validated filters → a Prisma where clause
  // → only the matching rows come back. The browser never sees, and never
  // filters, anything that didn't match.
  const properties = await prisma.property.findMany({
    where: buildWhere(filters),
    orderBy: { createdAt: "asc" },
    select: {
      slug: true,
      name: true,
      locality: true,
      city: true,
      propertyType: true,
      bedrooms: true,
      priceInr: true,
      areaSqft: true,
      videoUrl: true,
      posterUrl: true,
    },
  });

  const activeFilterLabels = describeFilters(formValues);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12 pb-28 md:px-12 xl:pb-12">
      <h1 className="font-display text-heading md:text-heading-lg">Properties</h1>

      <div className="mt-8 hidden xl:block">
        <FilterBar currentFilters={formValues} />
      </div>

      <p aria-live="polite" className="mt-6 text-meta text-muted tabular-nums xl:mt-6">
        {properties.length} {properties.length === 1 ? "property" : "properties"}
      </p>

      {properties.length === 0 ? (
        <div className="mt-16 max-w-[34rem]">
          <p className="text-body text-ink">No properties match these filters.</p>
          {activeFilterLabels.length > 0 ? (
            <p className="mt-2 text-meta text-muted">{activeFilterLabels.join(" · ")}</p>
          ) : null}
          <Link
            href="/properties"
            className="focus-ring mt-6 inline-block text-meta text-ink underline underline-offset-4"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <PropertyGrid properties={properties} />
        </div>
      )}

      <div className="xl:hidden">
        <FilterSheet currentFilters={formValues} resultCount={properties.length} />
      </div>
    </div>
  );
}
