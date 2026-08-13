import { NextResponse, type NextRequest } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { addStudentToTurma, getStudentsInTurma, isTeacherManager } from "@/lib/services"

export async function GET(req: NextRequest, context: { params: any }) {
  const session = await getServerAuthSession()
  if (!session || !((session.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const p = await context.params
  const turmaId = Number(p.id)
  // only managers can view students
  const ok = await isTeacherManager(turmaId, Number((session.user as any).id))
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const students = await getStudentsInTurma(turmaId)
  return NextResponse.json(students)
}

export async function POST(req: NextRequest, context: { params: any }) {
  const session = await getServerAuthSession()
  if (!session || !((session.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const p = await context.params
  const turmaId = Number(p.id)

  const ok = await isTeacherManager(turmaId, Number((session.user as any).id))
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const student = await addStudentToTurma(turmaId, { name: body.name, registration: body.registration, email: body.email }, Number((session.user as any).id))
  return NextResponse.json(student)
}
