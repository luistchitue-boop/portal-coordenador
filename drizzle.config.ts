import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./lib/db.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
})
