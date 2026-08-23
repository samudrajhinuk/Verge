import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// Prisma 7 talks to the database through a driver adapter rather than a
// bundled engine. Keeping the adapter here — and nowhere else — means the
// database can move again later with a change to this file plus one line in
// schema.prisma.
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
}

// Next.js hot-reloads modules in development, which would otherwise open a new
// database connection on every save until the process runs out of them.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
