const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')

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
const info = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hash, name)
console.log('Inserted user id', info.lastInsertRowid)
