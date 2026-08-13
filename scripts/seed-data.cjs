const postgres = require('postgres')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf8')
  return content.split(/\n/).reduce((acc, line) => {
    line = line.trim()
    if (!line || line.startsWith('#')) return acc
    const idx = line.indexOf('=')
    if (idx === -1) return acc
    const key = line.slice(0, idx)
    let val = line.slice(idx + 1)
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1)
    }
    acc[key] = val
    return acc
  }, {})
}

;(async () => {
  try {
    const repoRoot = path.resolve(__dirname, '..')
    const envPath = path.join(repoRoot, '.env.local')
    const env = parseEnvFile(envPath)
    const DATABASE_URL = process.env.DATABASE_URL || env.DATABASE_URL || env.NEON_DATABASE_URL
    if (!DATABASE_URL) {
      console.error('.env.local not found or DATABASE_URL not set. Aborting.')
      process.exit(1)
    }

    const sql = postgres(DATABASE_URL, { ssl: 'require' })

    console.log('Seeding sample data...')

    // Ensure Postgres students table has turma_id column (safe to run multiple times)
    try {
      await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS turma_id integer`
    } catch (e) {
      // ignore if table doesn't exist yet or permission issues
    }

    await sql.begin(async sqlTx => {
      // insert subjects (avoid ON CONFLICT since no unique constraint)
      const subjects = ['Mathematics', 'Portuguese', 'Science', 'History', 'Geography']
      const subjectIds = []
      for (const name of subjects) {
        const existing = await sqlTx`SELECT id FROM subjects WHERE name = ${name}`
        if (existing.length) {
          subjectIds.push(existing[0].id)
        } else {
          const res = await sqlTx`INSERT INTO subjects (name, code) VALUES (${name}, ${name.slice(0,3).toUpperCase()}) RETURNING id`
          subjectIds.push(res[0].id)
        }
      }

      // insert turmas
      const turmas = [
        { name: 'Turma A', code: 'A-101', description: 'Primeira turma' },
        { name: 'Turma B', code: 'B-102', description: 'Segunda turma' },
      ]
      const turmaIds = []
      for (const t of turmas) {
        const existing = await sqlTx`SELECT id FROM turmas WHERE name = ${t.name}`
        if (existing.length) {
          turmaIds.push(existing[0].id)
        } else {
          const res = await sqlTx`INSERT INTO turmas (name, code, description) VALUES (${t.name}, ${t.code}, ${t.description}) RETURNING id`
          turmaIds.push(res[0].id)
        }
      }

      // insert students
      const students = [
        { name: 'Ana Silva', registration: '2026-001', email: 'ana@example.com' },
        { name: 'João Pereira', registration: '2026-002', email: 'joao@example.com' },
        { name: 'Maria Costa', registration: '2026-003', email: 'maria@example.com' },
      ]
      const studentIds = []
      for (const s of students) {
        const existing = await sqlTx`SELECT id FROM students WHERE email = ${s.email}`
        if (existing.length) {
          studentIds.push(existing[0].id)
        } else {
          // Assign seeded students to Turma A by default
          const res = await sqlTx`INSERT INTO students (name, registration, email, turma_id) VALUES (${s.name}, ${s.registration}, ${s.email}, ${turmaIds[0]}) RETURNING id`
          studentIds.push(res[0].id)
        }
      }

      // Ensure every student belongs to an existing turma (round-robin) and has an enrollment
      for (let i = 0; i < studentIds.length; i++) {
        const sid = studentIds[i]
        // check current turma assignment
        const stu = await sqlTx`SELECT turma_id FROM students WHERE id = ${sid}`
        let assignedTurma = (stu && stu.length && stu[0].turma_id) ? stu[0].turma_id : null
        if (!assignedTurma) {
          assignedTurma = turmaIds[i % turmaIds.length]
          await sqlTx`UPDATE students SET turma_id = ${assignedTurma} WHERE id = ${sid}`
        }

        // ensure enrollment exists for that turma
        const exists = await sqlTx`SELECT id FROM enrollments WHERE turma_id = ${assignedTurma} AND student_id = ${sid}`
        if (!exists.length) {
          await sqlTx`INSERT INTO enrollments (turma_id, student_id, added_by) VALUES (${assignedTurma}, ${sid}, NULL)`
        }
      }

      // map all subjects into Turma A (avoid duplicates)
      for (const subId of subjectIds) {
        const exists = await sqlTx`SELECT id FROM turma_subjects WHERE turma_id = ${turmaIds[0]} AND subject_id = ${subId}`
        if (!exists.length) {
          await sqlTx`INSERT INTO turma_subjects (turma_id, subject_id) VALUES (${turmaIds[0]}, ${subId})`
        }
      }

      // create teacher users and turma_managers
      const teachers = [
        { name: 'Professor Pedro', email: 'pedro@example.com', password: 'Teacher123!' },
        { name: 'Professor Luisa', email: 'luisa@example.com', password: 'Teacher123!' },
      ]
      const teacherIds = []
      for (const t of teachers) {
        const existing = await sqlTx`SELECT id FROM users WHERE email = ${t.email}`
        if (existing.length) {
          teacherIds.push(existing[0].id)
        } else {
          const hash = bcrypt.hashSync(t.password, 10)
          const res = await sqlTx`INSERT INTO users (email, password, name) VALUES (${t.email}, ${hash}, ${t.name}) RETURNING id`
          teacherIds.push(res[0].id)
        }
      }

      // assign first teacher as manager of Turma A, second as manager of Turma B
      const tm1 = await sqlTx`SELECT id FROM turma_managers WHERE turma_id = ${turmaIds[0]} AND teacher_id = ${teacherIds[0]}`
      if (!tm1.length) {
        await sqlTx`INSERT INTO turma_managers (turma_id, teacher_id, role) VALUES (${turmaIds[0]}, ${teacherIds[0]}, 'manager')`
      }
      const tm2 = await sqlTx`SELECT id FROM turma_managers WHERE turma_id = ${turmaIds[1]} AND teacher_id = ${teacherIds[1]}`
      if (!tm2.length) {
        await sqlTx`INSERT INTO turma_managers (turma_id, teacher_id, role) VALUES (${turmaIds[1]}, ${teacherIds[1]}, 'manager')`
      }

      // add grades for students in Turma A across subjects
      for (const sid of studentIds) {
        for (let i = 0; i < subjectIds.length; i++) {
          const subj = subjectIds[i]
          const value = 10 + (i * 2) + (sid % 3)
          const exists = await sqlTx`SELECT id FROM grades WHERE student_id=${sid} AND turma_id=${turmaIds[0]} AND subject_id=${subj} AND value=${value}`
          if (!exists.length) {
            await sqlTx`INSERT INTO grades (student_id, turma_id, subject_id, value, max_value, added_by, note) VALUES (${sid}, ${turmaIds[0]}, ${subj}, ${value}, 20, ${teacherIds[0]}, 'Auto-seeded grade')`
          }
        }
      }

      // add a disciplinary note for first student
      const noteExists = await sqlTx`SELECT id FROM disciplinary_notes WHERE student_id = ${studentIds[0]} AND turma_id = ${turmaIds[0]} AND note = 'Late submission'`
      if (!noteExists.length) {
        await sqlTx`INSERT INTO disciplinary_notes (student_id, turma_id, note, added_by) VALUES (${studentIds[0]}, ${turmaIds[0]}, 'Late submission', ${teacherIds[0]})`
      }
    })

    console.log('Seeded subjects, turmas, students, and enrollments.')
    await sql.end()
  } catch (err) {
    console.error('Error seeding data:', err)
    process.exit(1)
  }
})()
