-- deploy/sql/content-plan-schema.sql
-- Ejecutar dentro del container postgres: deploy-postgres-1

CREATE TABLE IF NOT EXISTS content_plan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME NOT NULL DEFAULT '10:00',
  platform        TEXT NOT NULL
                  CHECK (platform IN ('linkedin','instagram','facebook','meta')),
  format          TEXT NOT NULL
                  CHECK (format IN ('imagen_copy','carrusel','texto_largo','reel')),
  pillar          TEXT NOT NULL
                  CHECK (pillar IN ('educacion','casos_de_uso','prueba_social','behind_the_scenes')),
  post_type       TEXT NOT NULL
                  CHECK (post_type IN ('valor','conversion')),
  vertical        TEXT NOT NULL DEFAULT 'jaagsolutions_core'
                  CHECK (vertical IN ('jaagsolutions_core','seguros_servicio')),
  copy_text       TEXT NOT NULL,
  image_prompt    TEXT NOT NULL,
  hashtags        TEXT,
  cta_url         TEXT,
  image_url       TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','generating','review','approved','published','error')),
  retry_count     INTEGER NOT NULL DEFAULT 0,
  telegram_msg_id TEXT,
  published_at    TIMESTAMPTZ,
  error_log       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_plan_status_date
  ON content_plan (status, scheduled_date);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_plan_updated_at ON content_plan;
CREATE TRIGGER content_plan_updated_at
  BEFORE UPDATE ON content_plan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
