import { NextResponse, type NextRequest } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { addDisciplinaryNote, isTeacherManager } from "@/lib/services"

export async function POST(req: NextRequest, context: { params: any }) {
  const session = await getServerAuthSession()
  if (!session || !((session.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const p = await context.params
  const turmaId = Number(p.id)

  const ok = await isTeacherManager(turmaId, Number((session.user as any).id))
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const note = await addDisciplinaryNote({ studentId: body.studentId, turmaId, note: body.note, addedBy: Number((session.user as any).id) })
  return NextResponse.json(note)
}
