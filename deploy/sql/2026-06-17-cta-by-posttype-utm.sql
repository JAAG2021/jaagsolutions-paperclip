-- deploy/sql/2026-06-17-cta-by-posttype-utm.sql
-- CTA por post_type + UTMs en cta_url (atribución). Idempotente.
--
-- Reglas:
--   - TODOS los posts pendientes: cta_url con UTMs (utm_source = platform de la fila,
--     utm_medium=social, utm_campaign=pillar, utm_content=YYYYMMDD, utm_term=post_type).
--   - post_type='conversion': el destino apunta al formulario de diagnóstico (#contacto)
--     y se agrega una línea de CTA dura al copy_text. El publisher solo añade el link
--     en posts 'conversion' (los 'valor' quedan como engagement, sin link).
--
-- IMPORTANTE sobre el destino:
--   El sitio es one-page; NO existe la ruta /diagnostico. El destino real del
--   diagnóstico es el ancla #contacto (ContactFormSection). Los UTMs van ANTES del
--   '#', porque lo que va después del fragment no llega al servidor ni a GA.
--   Si en el futuro se crea una landing dedicada, cambiar `base`/`anchor` abajo.
--
-- Ejecutar dentro del container postgres: deploy-postgres-1
--   docker exec -i deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < deploy/sql/2026-06-17-cta-by-posttype-utm.sql

BEGIN;

-- NOTA 2026-06-18: política de link cambiada a DOMINIO LIMPIO (sin UTMs).
-- En texto plano de redes los UTMs no aportan atribución y ensucian el copy.
-- El publisher muestra siempre https://jaagsolutions.com (recorta '?...'/'#...').
WITH params AS (
  SELECT
    'https://jaagsolutions.com'::text AS clean_link,
    E'\n\n👉 Agenda tu diagnóstico gratuito de 10 minutos.'::text AS hard_cta
)
UPDATE content_plan cp
SET
  cta_url = p.clean_link,
  copy_text =
    CASE
      WHEN cp.post_type = 'conversion'
           AND position('Agenda tu diagnóstico' IN cp.copy_text) = 0
        THEN cp.copy_text || p.hard_cta
      ELSE cp.copy_text
    END
FROM params p
WHERE cp.status = 'pending'
  AND cp.scheduled_date >= CURRENT_DATE;

COMMIT;

-- Verificación rápida:
-- SELECT scheduled_date, platform, pillar, post_type, cta_url,
--        right(copy_text, 60) AS copy_tail
-- FROM content_plan
-- WHERE status='pending' AND scheduled_date >= CURRENT_DATE
-- ORDER BY scheduled_date, platform;
