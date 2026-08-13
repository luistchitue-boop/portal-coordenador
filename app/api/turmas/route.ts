import { NextResponse, type NextRequest } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import services from "@/lib/services"

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session || !((session.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const teacherId = Number((session.user as any).id)
  const turmas = await services.getTurmasForTeacher(teacherId)
  return NextResponse.json(turmas)
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
