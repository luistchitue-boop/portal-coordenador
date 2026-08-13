-- Add foreign key constraints to enforce relationships between tables

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_turma_managers_turma') THEN
    ALTER TABLE turma_managers ADD CONSTRAINT fk_turma_managers_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_turma_managers_teacher') THEN
    ALTER TABLE turma_managers ADD CONSTRAINT fk_turma_managers_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_enrollments_turma') THEN
    ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_enrollments_student') THEN
    ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_enrollments_added_by') THEN
    ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_added_by FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_turma_subjects_turma') THEN
    ALTER TABLE turma_subjects ADD CONSTRAINT fk_turma_subjects_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_turma_subjects_subject') THEN
    ALTER TABLE turma_subjects ADD CONSTRAINT fk_turma_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_grades_student') THEN
    ALTER TABLE grades ADD CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_grades_turma') THEN
    ALTER TABLE grades ADD CONSTRAINT fk_grades_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_grades_subject') THEN
    ALTER TABLE grades ADD CONSTRAINT fk_grades_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_grades_added_by') THEN
    ALTER TABLE grades ADD CONSTRAINT fk_grades_added_by FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notes_student') THEN
    ALTER TABLE disciplinary_notes ADD CONSTRAINT fk_notes_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notes_turma') THEN
    ALTER TABLE disciplinary_notes ADD CONSTRAINT fk_notes_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notes_added_by') THEN
    ALTER TABLE disciplinary_notes ADD CONSTRAINT fk_notes_added_by FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END$$;
