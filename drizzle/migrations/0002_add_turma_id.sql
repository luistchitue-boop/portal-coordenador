-- Adds turma_id column to students, populates it from enrollments,
-- and adds a foreign key constraint to turmas.id. Safe to run multiple times.
BEGIN;

-- Add column if missing
ALTER TABLE students ADD COLUMN IF NOT EXISTS turma_id integer;

-- Populate turma_id from enrollments (pick first enrollment if multiple)
UPDATE students
SET turma_id = (
  SELECT turma_id FROM enrollments e WHERE e.student_id = students.id LIMIT 1
)
WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = students.id);

-- Add foreign key constraint if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'fk_students_turma' AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE students
    ADD CONSTRAINT fk_students_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) DEFERRABLE INITIALLY DEFERRED;
  END IF;
END$$;

COMMIT;
