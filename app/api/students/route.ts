import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { db, students } from "@/lib/db"

export async function GET() {
  const session = await getServerAuthSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await (db as any).select().from(students)
  return NextResponse.json(rows)
}
