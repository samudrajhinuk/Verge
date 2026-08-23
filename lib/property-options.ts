// The allowed values for the two "enum-like" Property columns.
//
// These live in application code rather than as a Prisma `enum` because SQLite
// has no enum type. Keeping them here means the schema stays portable and the
// filter UI, the seed script and the query validation all read from one list.

export const PROPERTY_TYPES = [
  "Apartment",
  "Penthouse",
  "Villa",
  "Row House",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const CITIES = [
  "Mumbai",
  "Bengaluru",
  "Delhi",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Goa",
] as const;

export type City = (typeof CITIES)[number];
