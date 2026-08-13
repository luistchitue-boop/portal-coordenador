import postgres from 'postgres'
import bcrypt from 'bcryptjs'

const DATABASE_URL = process.env.DATABASE_URL
const EMAIL = process.env.AUTH_EMAIL || 'user_test@example.com'
const PASSWORD = process.env.AUTH_PASSWORD || 'UserTest123!'

if (!DATABASE_URL) {
  console.error('No DATABASE_URL in environment.')
  process.exit(2)
}

const sql = postgres(DATABASE_URL, { max: 1 })

async function run() {
  try {
    const res = await sql`SELECT id, email, password, name, admin FROM users WHERE email = ${EMAIL}`
    if (!res || res.length === 0) {
      console.error('User not found:', EMAIL)
      process.exit(3)
    }
    const user = res[0]
    console.log('Found user:', { id: user.id, email: user.email, name: user.name, admin: user.admin })
    const ok = bcrypt.compareSync(PASSWORD, user.password)
    console.log('Password match:', ok)
    process.exit(ok ? 0 : 4)
  } catch (err) {
    console.error('Error querying DB:', err)
    process.exit(1)
  } finally {
    await sql.end({ timeout: 5 })
  }
}

run()
