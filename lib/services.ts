import { db, turmas, students, enrollments, subjects, turma_subjects, grades, disciplinary_notes, turma_managers } from "./db"

export async function createTurma(data: { name: string; code?: string; description?: string; creatorId?: number }) {
  const res = await (db as any).insert(turmas).values({
    name: data.name,
    code: data.code,
    description: data.description,
    created_at: new Date(),
  }).returning('*')

  const turma = Array.isArray(res) ? res[0] : res

  if (data.creatorId) {
    await (db as any).insert(turma_managers).values({
      turma_id: turma.id,
      teacher_id: data.creatorId,
      role: 'owner',
      created_at: new Date(),
    })
  }

  return turma
}

export async function addStudentToTurma(turmaId: number, student: { name: string; registration?: string; email?: string }, addedBy?: number) {
  const studentRes = await (db as any).insert(students).values({
    name: student.name,
    registration: student.registration,
    turma_id: turmaId,
    email: student.email,
    created_at: new Date(),
  }).returning('*')

  const s = Array.isArray(studentRes) ? studentRes[0] : studentRes

  await (db as any).insert(enrollments).values({
    turma_id: turmaId,
    student_id: s.id,
    added_by: addedBy,
    joined_at: new Date(),
  })

  return s
}

export async function addGrade(data: { studentId: number; turmaId: number; subjectId: number; value: number; maxValue?: number; note?: string; addedBy?: number }) {
  const res = await (db as any).insert(grades).values({
    student_id: data.studentId,
    turma_id: data.turmaId,
    subject_id: data.subjectId,
    value: data.value,
    max_value: data.maxValue,
    recorded_at: new Date(),
    added_by: data.addedBy,
    note: data.note,
  }).returning('*')

  return Array.isArray(res) ? res[0] : res
}

export async function addDisciplinaryNote(data: { studentId: number; turmaId: number; note: string; addedBy?: number }) {
  const res = await (db as any).insert(disciplinary_notes).values({
    student_id: data.studentId,
    turma_id: data.turmaId,
    note: data.note,
    recorded_at: new Date(),
    added_by: data.addedBy,
  }).returning('*')

  return Array.isArray(res) ? res[0] : res
}

export async function getTurmasForTeacher(teacherId: number) {
  const res = await (db as any).select().from(turma_managers).where({ teacher_id: teacherId })
  return res
}

export async function isTeacherManager(turmaId: number, teacherId: number) {
  const res = await (db as any).select().from(turma_managers).where({ turma_id: turmaId, teacher_id: teacherId })
  return res && res.length > 0
}

export async function getStudentsInTurma(turmaId: number) {
  const res = await (db as any).select().from(enrollments).where({ turma_id: turmaId })
  // fetch student rows
  const studentsList = []
  for (const row of res) {
    const s = await (db as any).select().from(students).where({ id: row.student_id })
    if (s && s.length) studentsList.push(s[0])
  }
  return studentsList
}

export default {
  createTurma,
  addStudentToTurma,
  addGrade,
  addDisciplinaryNote,
  getTurmasForTeacher,
  getStudentsInTurma,
}
