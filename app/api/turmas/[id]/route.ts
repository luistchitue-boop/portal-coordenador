import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { db, turmas, turma_subjects, subjects, grades } from "@/lib/db"
import { getStudentsInTurma } from "@/lib/services"

export async function GET(req: Request, context: { params: any }) {
  const session = await getServerAuthSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const p = context.params
  const turmaId = Number(p.id)

  const t = await (db as any).select().from(turmas).where({ id: turmaId })
  if (!t || !t.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const students = await getStudentsInTurma(turmaId)

  // subjects for turma
  const tsubs = await (db as any).select().from(turma_subjects).where({ turma_id: turmaId })
  const subjectRows: any[] = []
  for (const ts of tsubs) {
    const s = await (db as any).select().from(subjects).where({ id: ts.subject_id })
    if (s && s.length) subjectRows.push(s[0])
  }

  // grades
  const gradeRows = await (db as any).select().from(grades).where({ turma_id: turmaId })

  return NextResponse.json({ turma: t[0], students, subjects: subjectRows, grades: gradeRows })
}
