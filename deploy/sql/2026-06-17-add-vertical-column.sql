-- deploy/sql/2026-06-17-add-vertical-column.sql
-- Formaliza la columna `vertical` en content_plan.
--
-- Contexto: la columna `vertical` (con 'seguros_servicio' desde 2026-06-16) se
-- había agregado solo en producción, sin migración en el repo. Si se recreaba la
-- DB desde content-plan-schema.sql, la columna no existía. Esta migración la
-- formaliza de forma idempotente.
--
-- Ejecutar dentro del container postgres: deploy-postgres-1
--   docker exec -i deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < deploy/sql/2026-06-17-add-vertical-column.sql

ALTER TABLE content_plan
  ADD COLUMN IF NOT EXISTS vertical TEXT NOT NULL DEFAULT 'jaagsolutions_core';

-- Restringe a los valores conocidos. Se agrega solo si aún no existe el constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_plan_vertical_check'
  ) THEN
    ALTER TABLE content_plan
      ADD CONSTRAINT content_plan_vertical_check
      CHECK (vertical IN ('jaagsolutions_core', 'seguros_servicio'));
  END IF;
END $$;

-- Índice para filtros por vertical (metadata/reportería; no afecta ruteo de generación).
CREATE INDEX IF NOT EXISTS idx_content_plan_vertical
  ON content_plan (vertical);
