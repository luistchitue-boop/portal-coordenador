import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { db, students, connection } from "@/lib/db"

export async function DELETE(req: Request, context: { params: any }) {
  const session = await getServerAuthSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = Number(context.params.id)
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const uid = Number((session.user as any).id)
  // check student's turma
  const srows = await (db as any).select().from(students).where({ id })
  if (!srows || !srows.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const student = srows[0]
  const turmaId = student.turma_id
  const services = await import('@/lib/services')
  const isAdmin = await services.isUserAdmin(uid)
  const isManager = turmaId ? await services.isTeacherManager(turmaId, uid) : false
  if (!isAdmin && !isManager) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Support both sqlite and postgres connection types
  if ((connection as any).run) {
    const stmt = (connection as any).prepare('DELETE FROM students WHERE id = ?')
    const info = stmt.run(id)
    return NextResponse.json({ deleted: info.changes })
  }

  try {
    const res = await (db as any).delete(students).where({ id })
    return NextResponse.json({ deleted: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
