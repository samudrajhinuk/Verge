"use server";

import { buildWhere, parseFilters, type RawParams } from "@/lib/filters";
import { prisma } from "@/lib/prisma";

// Powers the mobile filter sheet's live count. Runs the exact same
// parseFilters → buildWhere path the real /properties query uses, just with
// count() instead of findMany() — so the preview number and the eventual
// page are guaranteed to agree, because they're the same query.
export async function countProperties(rawFilters: RawParams): Promise<number> {
  const filters = parseFilters(rawFilters);
  return prisma.property.count({ where: buildWhere(filters) });
}
