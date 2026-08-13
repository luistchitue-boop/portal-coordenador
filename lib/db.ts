import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
})

const DB_PATH = process.env.DB_PATH || "./dev.db"

// export the raw connection for simple queries and the drizzle instance
export const connection = new Database(DB_PATH)

// ensure table exists (simple approach without migrations)
connection.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT
  )
`)

export const db = drizzle(connection)

export default db
