import { NextResponse, type NextRequest } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { db, turmas } from "@/lib/db"
import services from "@/lib/services"

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session || !((session.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // For now return all turmas to any authenticated user so they can see data
  const rows = await (db as any).select().from(turmas)
  return NextResponse.json(rows || [])
}

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session || !((session.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, code, description } = body
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 })

  const turma = await services.createTurma({ name, code, description, creatorId: Number((session.user as any).id) })
  return NextResponse.json(turma)
}
