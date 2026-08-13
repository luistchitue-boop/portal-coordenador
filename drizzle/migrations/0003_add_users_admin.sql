-- Add `admin` column to users (boolean-like). Idempotent.
BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS admin boolean DEFAULT false;

COMMIT;
