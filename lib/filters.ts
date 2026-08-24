import type { Prisma } from "./generated/prisma/client";
import { CITIES, PROPERTY_TYPES, type City, type PropertyType } from "./property-options";

export { CITIES, PROPERTY_TYPES };
export type { City, PropertyType };

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5] as const;

export const PRICE_BANDS = [
  { label: "Under ₹2 Cr", minPrice: undefined, maxPrice: 20_000_000 },
  { label: "₹2 – 5 Cr", minPrice: 20_000_000, maxPrice: 50_000_000 },
  { label: "₹5 – 10 Cr", minPrice: 50_000_000, maxPrice: 100_000_000 },
  { label: "₹10 Cr and above", minPrice: 100_000_000, maxPrice: undefined },
] as const satisfies readonly {
  label: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
}[];

export type Filters = {
  city?: City;
  propertyType?: PropertyType;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
};

// The shape Next.js hands a Server Component's `searchParams` prop, and also
// what a plain params object looks like once read off a URL. Reused as the
// input type everywhere filters are read from, so there is one shape, not two.
export type RawParams = Record<string, string | string[] | undefined>;

function readParam(params: RawParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

// Turns whatever is in the URL's search params into a Filters object that is
// safe to build a database query from. Every field is checked against the
// list of values that are actually allowed (a real city, a real property
// type, a bedroom count that exists as a filter option, non-negative prices).
// Anything missing, misspelled, or nonsensical — ?beds=banana, ?beds=-5,
// ?minPrice=abc — is silently left out rather than thrown on, so a
// hand-edited or shared URL degrades to "no filter on that field" instead of
// crashing the page.
export function parseFilters(searchParams: RawParams): Filters {
  const filters: Filters = {};

  const city = readParam(searchParams, "city");
  if (city && (CITIES as readonly string[]).includes(city)) {
    filters.city = city as City;
  }

  const propertyType = readParam(searchParams, "type");
  if (propertyType && (PROPERTY_TYPES as readonly string[]).includes(propertyType)) {
    filters.propertyType = propertyType as PropertyType;
  }

  const bedrooms = Number(readParam(searchParams, "beds"));
  if ((BEDROOM_OPTIONS as readonly number[]).includes(bedrooms)) {
    filters.bedrooms = bedrooms;
  }

  const minPrice = Number(readParam(searchParams, "minPrice"));
  if (Number.isFinite(minPrice) && minPrice >= 0) {
    filters.minPrice = minPrice;
  }

  const maxPrice = Number(readParam(searchParams, "maxPrice"));
  if (
    Number.isFinite(maxPrice) &&
    maxPrice >= 0 &&
    (filters.minPrice === undefined || maxPrice >= filters.minPrice)
  ) {
    filters.maxPrice = maxPrice;
  }

  return filters;
}

// Converts a validated Filters object into the Prisma `where` clause. A field
// only appears in the clause if it was actually set — an empty Filters object
// produces an empty where, which Prisma treats as "match every property".
// Bedrooms is "at least this many", not "exactly this many", matching how a
// real-estate bedroom filter is normally read.
export function buildWhere(filters: Filters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {};

  if (filters.city) where.city = filters.city;
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.bedrooms) where.bedrooms = { gte: filters.bedrooms };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.priceInr = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  return where;
}

// --- Below: mapping Filters to and from the four form controls. Not part of
// the filtering logic itself — just the UI's vocabulary for it. ---

export type FilterFormValues = {
  city: string;
  propertyType: string;
  bedrooms: string;
  priceBand: string;
};

export const EMPTY_FILTER_VALUES: FilterFormValues = {
  city: "",
  propertyType: "",
  bedrooms: "",
  priceBand: "",
};

export function filtersToFormValues(filters: Filters): FilterFormValues {
  const hasPrice = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  const bandIndex = PRICE_BANDS.findIndex(
    (band) => band.minPrice === filters.minPrice && band.maxPrice === filters.maxPrice,
  );

  return {
    city: filters.city ?? "",
    propertyType: filters.propertyType ?? "",
    bedrooms: filters.bedrooms ? String(filters.bedrooms) : "",
    priceBand: hasPrice && bandIndex >= 0 ? String(bandIndex) : "",
  };
}

export function formValuesToParams(values: FilterFormValues): Record<string, string> {
  const params: Record<string, string> = {};

  if (values.city) params.city = values.city;
  if (values.propertyType) params.type = values.propertyType;
  if (values.bedrooms) params.beds = values.bedrooms;

  const band = values.priceBand === "" ? undefined : PRICE_BANDS[Number(values.priceBand)];
  if (band?.minPrice !== undefined) params.minPrice = String(band.minPrice);
  if (band?.maxPrice !== undefined) params.maxPrice = String(band.maxPrice);

  return params;
}

export function countActiveFilters(values: FilterFormValues): number {
  return [values.city, values.propertyType, values.bedrooms, values.priceBand].filter(
    (value) => value !== "",
  ).length;
}

export function describeFilters(values: FilterFormValues): string[] {
  const parts: string[] = [];
  if (values.city) parts.push(values.city);
  if (values.propertyType) parts.push(values.propertyType);
  if (values.bedrooms) parts.push(`${values.bedrooms}+ bed`);
  if (values.priceBand !== "") parts.push(PRICE_BANDS[Number(values.priceBand)].label);
  return parts;
}
