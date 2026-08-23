import "dotenv/config";
import { defineConfig } from "prisma/config";

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
