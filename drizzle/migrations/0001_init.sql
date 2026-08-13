-- Initial migration: create core tables for turmas, users, students, enrollments, subjects, grades, and notes

CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  name text
);

CREATE TABLE IF NOT EXISTS turmas (
  id serial PRIMARY KEY,
  name text NOT NULL,
  code text,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS turma_managers (
  id serial PRIMARY KEY,
  turma_id integer NOT NULL,
  teacher_id integer NOT NULL,
  role text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id serial PRIMARY KEY,
  name text NOT NULL,
  registration text,
  email text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id serial PRIMARY KEY,
  turma_id integer NOT NULL,
  student_id integer NOT NULL,
  added_by integer,
  joined_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id serial PRIMARY KEY,
  name text NOT NULL,
  code text
);

CREATE TABLE IF NOT EXISTS turma_subjects (
  id serial PRIMARY KEY,
  turma_id integer NOT NULL,
  subject_id integer NOT NULL
);

CREATE TABLE IF NOT EXISTS grades (
  id serial PRIMARY KEY,
  student_id integer NOT NULL,
  turma_id integer NOT NULL,
  subject_id integer NOT NULL,
  value double precision NOT NULL,
  max_value double precision,
  recorded_at timestamp with time zone DEFAULT now(),
  added_by integer,
  note text
);

CREATE TABLE IF NOT EXISTS disciplinary_notes (
  id serial PRIMARY KEY,
  student_id integer NOT NULL,
  turma_id integer NOT NULL,
  note text NOT NULL,
  recorded_at timestamp with time zone DEFAULT now(),
  added_by integer
);
