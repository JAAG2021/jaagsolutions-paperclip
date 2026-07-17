-- deploy/sql/2026-07-17-rewrite-today.sql
-- Task W5/W6 (ajustada): el "post de hoy" (2026-07-17) ya estaba PUBLISHED, no se
-- puede reescribir via pipeline. Lo accionable:
--   (A) Cancelar el post de SEGUROS atascado en review (vertical pausado 2026-07-17).
--   (B) Limpiar el doble CTA de engagement en los valor pendientes: se quita el
--       soft-CTA generico agregado por 2026-06-17-fix-hashtags-softcta.sql, dejando
--       la pregunta original y contextual (una sola invitacion a comentar).
--
-- Ejecutar dentro del container postgres deploy-postgres-1.

BEGIN;

-- (A) Cancelar el post de seguros en review (seguros pausado). Deja rastro en error_log.
UPDATE content_plan
SET status = 'error',
    error_log = 'Cancelado 2026-07-17: vertical seguros_servicio PAUSADO (no publicar pieza suelta de seguros).'
WHERE id = '47996626-b239-4e4c-b0b9-f975c9a9c83b'
  AND status = 'review';

-- (B) Quitar el soft-CTA generico agregado ("...Cuéntanos en los comentarios.") del
--     final del copy en los valor pendientes que ademas ya traen su pregunta original.
--     Idempotente: tras correr, ya no queda esa linea final, no vuelve a matchear.
UPDATE content_plan
SET copy_text = regexp_replace(copy_text, E'\\n\\n[^\\n]*Cuéntanos en los comentarios\\.?\\s*$', '')
WHERE post_type = 'valor'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE
  AND copy_text ~ E'Cuéntanos en los comentarios\\.?\\s*$';

COMMIT;

-- Verificacion:
-- SELECT scheduled_date, right(copy_text, 90) AS tail FROM content_plan
-- WHERE post_type='valor' AND status='pending' AND scheduled_date >= CURRENT_DATE
-- ORDER BY scheduled_date;
