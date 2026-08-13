import { NextResponse, type NextRequest } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { addGrade, isTeacherManager } from "@/lib/services"

export async function POST(req: NextRequest, context: { params: any }) {
  const session = await getServerAuthSession()
  if (!session || !((session.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const p = await context.params
  const turmaId = Number(p.id)

  const ok = await isTeacherManager(turmaId, Number((session.user as any).id))
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const grade = await addGrade({ studentId: body.studentId, turmaId, subjectId: body.subjectId, value: body.value, maxValue: body.maxValue, note: body.note, addedBy: Number((session.user as any).id) })
  return NextResponse.json(grade)
}
