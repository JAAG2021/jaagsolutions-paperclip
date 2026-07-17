-- deploy/sql/2026-07-17-prueba-social-texto-largo.sql
-- Prueba Social pasa a formato texto_largo (narrativa con gancho en linea 1).
-- La estrategia original asigno texto largo a Prueba Social; LinkedIn premia el
-- contenido narrativo con mas dwell time. Idempotente: solo filas pending >= hoy.
--
-- Ejecutar dentro del container postgres deploy-postgres-1:
--   docker exec -i deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
--     < /opt/jaagsolutions/repo/deploy/sql/2026-07-17-prueba-social-texto-largo.sql

BEGIN;

UPDATE content_plan SET format = 'texto_largo'
WHERE pillar = 'prueba_social'
  AND format = 'imagen_copy'
  AND status = 'pending' AND scheduled_date >= CURRENT_DATE;

COMMIT;

-- Verificacion:
-- SELECT scheduled_date, pillar, format FROM content_plan
-- WHERE status='pending' AND scheduled_date >= CURRENT_DATE ORDER BY scheduled_date;
