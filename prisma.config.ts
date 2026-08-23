import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Plain `dotenv/config` only reads `.env`. The database secret lives in
// `.env.local` instead (matching Next.js convention), so it's loaded explicitly.
config({ path: ".env.local" });

// The datasource URL is read from the environment, never hardcoded, so the
// database can move to a hosted Postgres without touching the schema.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
