import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { db, users, turma_managers } from "@/lib/db"

export async function GET() {
  const session = await getServerAuthSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const managers = await (db as any).select().from(turma_managers)
  const ids = Array.from(new Set(managers.map((m: any) => m.teacher_id)))
  const teachers: any[] = []
  for (const id of ids) {
    const u = await (db as any).select().from(users).where({ id })
    if (u && u.length) teachers.push(u[0])
  }

  return NextResponse.json(teachers)
}
