const bcrypt = require('bcryptjs')
const Database = require('better-sqlite3')

const POSTGRES_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (POSTGRES_URL) {
  // Seed in Postgres/Neon using `postgres` client
  const postgres = require('postgres')
  const sql = postgres(POSTGRES_URL, { ssl: 'require' })

  ;(async () => {
    const email = process.env.AUTH_EMAIL || 'test@example.com'
    const password = process.env.AUTH_PASSWORD || 'Test1234!'
    const name = process.env.AUTH_NAME || 'Test User'
    const isAdminEnv = process.env.AUTH_IS_ADMIN || '1'
    const adminFlag = isAdminEnv === '1' || isAdminEnv === 'true'

    await sql`CREATE TABLE IF NOT EXISTS users (id serial primary key, email text unique not null, password text not null, name text)`
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`
    if (existing.length) {
      console.log('User already exists:', email)
      await sql.end()
      process.exit(0)
    }
    const hash = bcrypt.hashSync(password, 10)
    const res = await sql`INSERT INTO users (email, password, name, admin) VALUES (${email}, ${hash}, ${name}, ${adminFlag}) RETURNING id`
    console.log('Inserted user id', res[0].id)
    await sql.end()
  })()
} else {
  const DB_PATH = process.env.DB_PATH || './dev.db'
  const db = new Database(DB_PATH)

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT
    )
  `)

  const email = process.env.AUTH_EMAIL || 'test@example.com'
  const password = process.env.AUTH_PASSWORD || 'Test1234!'
  const name = process.env.AUTH_NAME || 'Test User'

  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (existing) {
    console.log('User already exists:', email)
    process.exit(0)
  }

  const hash = bcrypt.hashSync(password, 10)
  const adminFlag = (process.env.AUTH_IS_ADMIN || '1') === '1'
  const info = db.prepare('INSERT INTO users (email, password, name, admin) VALUES (?, ?, ?, ?)').run(email, hash, name, adminFlag ? 1 : 0)
  console.log('Inserted user id', info.lastInsertRowid)
}
