import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core"

// We'll support both Neon Postgres (when DATABASE_URL env is set) and a local
// SQLite fallback. Table definitions are created for both dialects and the
// appropriate driver/instance is exported at runtime.
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

// ---------- SQLite definitions (local dev fallback) ----------
import Database from "better-sqlite3"
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3"

const users_sqlite = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
})

const turmas_sqlite = sqliteTable("turmas", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code"),
  description: text("description"),
  created_at: integer("created_at"),
})

const turma_managers_sqlite = sqliteTable("turma_managers", {
  id: integer("id").primaryKey(),
  turma_id: integer("turma_id").notNull(),
  teacher_id: integer("teacher_id").notNull(),
  role: text("role"),
  created_at: integer("created_at"),
})

const students_sqlite = sqliteTable("students", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  registration: text("registration"),
  email: text("email"),
  created_at: integer("created_at"),
})

const enrollments_sqlite = sqliteTable("enrollments", {
  id: integer("id").primaryKey(),
  turma_id: integer("turma_id").notNull(),
  student_id: integer("student_id").notNull(),
  added_by: integer("added_by"),
  joined_at: integer("joined_at"),
})

const subjects_sqlite = sqliteTable("subjects", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code"),
})

const turma_subjects_sqlite = sqliteTable("turma_subjects", {
  id: integer("id").primaryKey(),
  turma_id: integer("turma_id").notNull(),
  subject_id: integer("subject_id").notNull(),
})

const grades_sqlite = sqliteTable("grades", {
  id: integer("id").primaryKey(),
  student_id: integer("student_id").notNull(),
  turma_id: integer("turma_id").notNull(),
  subject_id: integer("subject_id").notNull(),
  value: real("value").notNull(),
  max_value: real("max_value"),
  recorded_at: integer("recorded_at"),
  added_by: integer("added_by"),
  note: text("note"),
})

const disciplinary_notes_sqlite = sqliteTable("disciplinary_notes", {
  id: integer("id").primaryKey(),
  student_id: integer("student_id").notNull(),
  turma_id: integer("turma_id").notNull(),
  note: text("note").notNull(),
  recorded_at: integer("recorded_at"),
  added_by: integer("added_by"),
})

// ---------- Postgres definitions (Neon) ----------
import postgres from "postgres"
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import { pgTable, serial, varchar, text as pgText, integer as pgInteger, real as pgReal, timestamp } from "drizzle-orm/pg-core"

const users_pg = pgTable("users", {
  id: serial("id").primaryKey(),
  email: pgText("email").notNull().unique(),
  password: pgText("password").notNull(),
  name: pgText("name"),
})

const turmas_pg = pgTable("turmas", {
  id: serial("id").primaryKey(),
  name: pgText("name").notNull(),
  code: pgText("code"),
  description: pgText("description"),
  created_at: timestamp("created_at"),
})

const turma_managers_pg = pgTable("turma_managers", {
  id: serial("id").primaryKey(),
  turma_id: pgInteger("turma_id").notNull(),
  teacher_id: pgInteger("teacher_id").notNull(),
  role: pgText("role"),
  created_at: timestamp("created_at"),
})

const students_pg = pgTable("students", {
  id: serial("id").primaryKey(),
  name: pgText("name").notNull(),
  registration: pgText("registration"),
  email: pgText("email"),
  created_at: timestamp("created_at"),
})

const enrollments_pg = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  turma_id: pgInteger("turma_id").notNull(),
  student_id: pgInteger("student_id").notNull(),
  added_by: pgInteger("added_by"),
  joined_at: timestamp("joined_at"),
})

const subjects_pg = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: pgText("name").notNull(),
  code: pgText("code"),
})

const turma_subjects_pg = pgTable("turma_subjects", {
  id: serial("id").primaryKey(),
  turma_id: pgInteger("turma_id").notNull(),
  subject_id: pgInteger("subject_id").notNull(),
})

const grades_pg = pgTable("grades", {
  id: serial("id").primaryKey(),
  student_id: pgInteger("student_id").notNull(),
  turma_id: pgInteger("turma_id").notNull(),
  subject_id: pgInteger("subject_id").notNull(),
  value: pgReal("value").notNull(),
  max_value: pgReal("max_value"),
  recorded_at: timestamp("recorded_at"),
  added_by: pgInteger("added_by"),
  note: pgText("note"),
})

const disciplinary_notes_pg = pgTable("disciplinary_notes", {
  id: serial("id").primaryKey(),
  student_id: pgInteger("student_id").notNull(),
  turma_id: pgInteger("turma_id").notNull(),
  note: pgText("note").notNull(),
  recorded_at: timestamp("recorded_at"),
  added_by: pgInteger("added_by"),
})

// Module-level exports (assigned based on detected driver)
let db: any = null
let connection: any = null
let users: any = null
let turmas: any = null
let turma_managers: any = null
let students: any = null
let enrollments: any = null
let subjects: any = null
let turma_subjects: any = null
let grades: any = null
let disciplinary_notes: any = null

if (DATABASE_URL) {
  // Postgres (Neon) connection
  const sql = postgres(DATABASE_URL, { ssl: "require" })
  db = drizzlePostgres(sql)
  connection = sql

  users = users_pg as any
  turmas = turmas_pg as any
  turma_managers = turma_managers_pg as any
  students = students_pg as any
  enrollments = enrollments_pg as any
  subjects = subjects_pg as any
  turma_subjects = turma_subjects_pg as any
  grades = grades_pg as any
  disciplinary_notes = disciplinary_notes_pg as any
} else {
  // SQLite local fallback
  const DB_PATH = process.env.DB_PATH || "./dev.db"
  connection = new Database(DB_PATH)

  // ensure table exists (simple approach without migrations)
  connection.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT
    )
  `)

  db = drizzleSqlite(connection)

  users = users_sqlite as any
  turmas = turmas_sqlite as any
  turma_managers = turma_managers_sqlite as any
  students = students_sqlite as any
  enrollments = enrollments_sqlite as any
  subjects = subjects_sqlite as any
  turma_subjects = turma_subjects_sqlite as any
  grades = grades_sqlite as any
  disciplinary_notes = disciplinary_notes_sqlite as any
}

export { db, connection, users, turmas, turma_managers, students, enrollments, subjects, turma_subjects, grades, disciplinary_notes }

export default db
