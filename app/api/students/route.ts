import { NextResponse, type NextRequest } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { db, students, connection } from "@/lib/db"

export async function GET() {
  const session = await getServerAuthSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await (db as any).select().from(students)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, registration, email } = body
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 })

  // Insert student; support both Postgres and SQLite connection styles
  if ((connection as any).run) {
    // better-sqlite3
    const stmt = (connection as any).prepare('INSERT INTO students (name, registration, email, created_at) VALUES (?, ?, ?, ?)')
    const info = stmt.run(name, registration || null, email || null, Date.now())
    const id = info.lastInsertRowid
    const s = await (db as any).select().from(students).where({ id })
    return NextResponse.json(s && s.length ? s[0] : { id })
  }

  // Postgres (postgres tagged template client)
  try {
    const res = await (db as any).insert(students).values({ name, registration, email, created_at: new Date() }).returning('*')
    return NextResponse.json(Array.isArray(res) ? res[0] : res)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
