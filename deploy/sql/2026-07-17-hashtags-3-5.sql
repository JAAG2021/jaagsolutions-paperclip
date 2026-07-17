-- deploy/sql/2026-07-17-hashtags-3-5.sql
-- Hashtags 3-5 tematicos globales (revierte el set 12-13 de 2026-06-17-fix-hashtags-softcta.sql).
-- Motivo: LinkedIn B2B recomienda 3-5; 12-13 se lee automatizado y contradice el
-- mensaje "un humano lo aprueba". SIN geo-lock (#PymesSV/#NegociosSV eliminados):
-- el mercado es pan-hispano (LATAM + Espana), no El Salvador; el SV excluia a la
-- mayoria de la audiencia. Se usan tags tematicos de nicho (no ultra-genericos, que
-- ahogan entre millones de posts). Idempotente: solo filas pending >= hoy.
--
-- Ejecutar dentro del container postgres deploy-postgres-1:
--   docker exec -i deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
--     < /opt/jaagsolutions/repo/deploy/sql/2026-07-17-hashtags-3-5.sql

BEGIN;

-- core generico (educacion, behind_the_scenes) — post_type valor
UPDATE content_plan SET hashtags =
  '#AutomatizaciónPymes #TransformaciónDigital #ProductividadPymes'
WHERE vertical = 'jaagsolutions_core'
  AND pillar IN ('educacion','behind_the_scenes')
  AND post_type = 'valor'
  AND status = 'pending' AND scheduled_date >= CURRENT_DATE;

-- casos_de_uso / prueba_social — post_type valor
UPDATE content_plan SET hashtags =
  '#AutomatizaciónPymes #CasosDeÉxito #TransformaciónDigital'
WHERE vertical = 'jaagsolutions_core'
  AND pillar IN ('casos_de_uso','prueba_social')
  AND post_type = 'valor'
  AND status = 'pending' AND scheduled_date >= CURRENT_DATE;

-- cualquier conversion (independiente del pilar)
UPDATE content_plan SET hashtags =
  '#AutomatizaciónPymes #TransformaciónDigital #Emprendedores #Pymes'
WHERE vertical = 'jaagsolutions_core'
  AND post_type = 'conversion'
  AND status = 'pending' AND scheduled_date >= CURRENT_DATE;

COMMIT;

-- Verificacion:
-- SELECT scheduled_date, pillar, post_type, hashtags FROM content_plan
-- WHERE status='pending' AND scheduled_date >= CURRENT_DATE ORDER BY scheduled_date;
