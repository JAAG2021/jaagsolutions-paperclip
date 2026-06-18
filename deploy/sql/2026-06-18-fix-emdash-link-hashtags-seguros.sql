-- deploy/sql/2026-06-18-fix-emdash-link-hashtags-seguros.sql
-- Correctivo del lote cargado (18-jun → 14-jul) tras revisión de publicaciones.
-- Idempotente: solo toca filas pending >= hoy. Seguro de re-ejecutar.
--
-- Arregla 4 cosas detectadas en los posts ya generados:
--   #2  Guion largo/medio (— –) en copy_text  -> coma  (política: nunca publicar em dash)
--   #3  cta_url con UTMs largos               -> dominio limpio https://jaagsolutions.com
--   #4  Hashtags de seguros geo-bloqueados    -> set keyword de alcance (sin #SegurosElSalvador)
--   #5  Copy de seguros que solo dice LinkedIn -> "redes sociales" (+ corrige "Linkdln")
--
-- Ejecutar dentro del container postgres:
--   docker exec -i deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
--     < /opt/jaagsolutions/repo/deploy/sql/2026-06-18-fix-emdash-link-hashtags-seguros.sql

BEGIN;

-- ── #5: copy de seguros debe hablar de "redes sociales", no solo LinkedIn ────
-- (también corrige la falta ortográfica "Linkdln"). Se hace ANTES del strip de
-- guiones para no depender del orden.
UPDATE content_plan SET copy_text =
  replace(
    replace(
      replace(copy_text, 'Google y LinkedIn', 'Google y redes sociales'),
      'Google y Linkdln', 'Google y redes sociales'),
    'Linkdln', 'redes sociales')
WHERE vertical = 'seguros_servicio'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE
  AND (copy_text LIKE '%Google y LinkedIn%' OR copy_text LIKE '%Linkdln%');

-- ── #2: eliminar guion largo/medio de TODO copy pendiente -> coma ───────────
UPDATE content_plan SET copy_text =
  regexp_replace(copy_text, '\s*[—–]\s*', ', ', 'g')
WHERE status = 'pending'
  AND scheduled_date >= CURRENT_DATE
  AND copy_text ~ '[—–]';

-- ── #3: link visible = dominio limpio (sin UTMs ni fragment) ────────────────
UPDATE content_plan SET cta_url = 'https://jaagsolutions.com'
WHERE status = 'pending'
  AND scheduled_date >= CURRENT_DATE
  AND cta_url IS DISTINCT FROM 'https://jaagsolutions.com';

-- ── #4: hashtags de seguros = keywords de alcance (sin geo-lock) ────────────
UPDATE content_plan SET hashtags =
  '#Seguros #SegurosDigitales #CorredoresDeSeguros #AutomatizaciónSeguros #GestiónDeSeguros #TransformaciónDigital #AutomatizaciónEmpresarial #EficienciaOperativa #ProductividadEmpresarial #Pymes #Emprendedores #InteligenciaArtificial #SegurosLatam'
WHERE vertical = 'seguros_servicio'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE;

COMMIT;

-- Verificación:
-- SELECT scheduled_date, vertical, cta_url, hashtags,
--        (copy_text ~ '[—–]') AS tiene_guion_largo,
--        (copy_text LIKE '%Linkdln%') AS tiene_typo
-- FROM content_plan
-- WHERE status='pending' AND scheduled_date >= CURRENT_DATE
-- ORDER BY scheduled_date;
