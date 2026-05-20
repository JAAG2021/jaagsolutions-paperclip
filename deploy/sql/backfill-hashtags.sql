-- Backfill hashtags en content_plan donde el campo está vacío o NULL.
-- Asigna hashtags estándar por pilar según la estrategia de A4.
-- Ejecutar en VPS:
--   docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/backfill-hashtags.sql'
-- (copiar este archivo al VPS primero con scp o copiando el contenido)

UPDATE content_plan
SET hashtags = CASE pillar
  WHEN 'educacion'         THEN '#automatizacion #pymes #productividad #eficiencia #jaagsolutions'
  WHEN 'casos_de_uso'      THEN '#casoexito #automatizacion #pymes #resultados #jaagsolutions'
  WHEN 'prueba_social'     THEN '#jaagsolutions #automatizacion #resultados #crecimiento #clientes'
  WHEN 'behind_the_scenes' THEN '#jaagsolutions #buildinpublic #automatizacion #n8n #proceso'
  ELSE '#automatizacion #pymes #jaagsolutions'
END
WHERE hashtags IS NULL OR hashtags = '';

-- Verificar resultado:
SELECT id, scheduled_date, platform, pillar, hashtags
FROM content_plan
ORDER BY scheduled_date;
