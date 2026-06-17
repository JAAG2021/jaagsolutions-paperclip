-- deploy/sql/2026-06-17-fix-hashtags-softcta.sql
-- Fix 1: Hashtags 8-15 por pillar/vertical (mismos para las 3 redes).
-- Fix 2: Soft CTA de engagement al final del copy de posts 'valor' (4.o elemento obligatorio).
-- Idempotente: solo toca filas pending >= hoy.
--
-- Ejecutar:
--   docker exec -i deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
--     < /opt/jaagsolutions/repo/deploy/sql/2026-06-17-fix-hashtags-softcta.sql

BEGIN;

-- ── FIX 1: HASHTAGS ─────────────────────────────────────────────────────────

UPDATE content_plan SET hashtags =
  '#AutomatizaciónEmpresarial #TransformaciónDigital #ProductividadPymes #ProcesosEmpresariales #AutomatizaciónPymes #FlujoDeTrabajo #EficienciaOperativa #MarketingDigital #n8n #NegociosSV #IA #InteligenciaArtificial #DigitalizaciónPymes'
WHERE vertical = 'jaagsolutions_core'
  AND pillar IN ('educacion')
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE;

UPDATE content_plan SET hashtags =
  '#AutomatizaciónEmpresarial #CasosDeÉxito #ResultadosReales #AutomatizaciónPymes #TransformaciónDigital #EficienciaOperativa #ProcesosEmpresariales #NegociosSV #Workflow #MarketingDigital #PymesSV #DigitalizaciónPymes'
WHERE vertical = 'jaagsolutions_core'
  AND pillar IN ('casos_de_uso', 'prueba_social')
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE;

UPDATE content_plan SET hashtags =
  '#AutomatizaciónEmpresarial #CómoLoHacemos #ProcesosReales #TransformaciónDigital #AutomatizaciónPymes #ProcesosEmpresariales #Workflow #FlujoDeTrabajo #NegociosSV #n8n #EficienciaOperativa #DigitalizaciónPymes'
WHERE vertical = 'jaagsolutions_core'
  AND pillar IN ('behind_the_scenes')
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE;

UPDATE content_plan SET hashtags =
  '#AutomatizaciónEmpresarial #CrecimientoEmpresarial #TransformaciónDigital #VisiónEmpresarial #AutomatizaciónPymes #EficienciaOperativa #NegociosSV #MarketingDigital #PymesSV #DigitalizaciónPymes #Emprendimiento'
WHERE vertical = 'jaagsolutions_core'
  AND pillar IN ('promesa', 'educacion')
  AND post_type = 'conversion'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE;

UPDATE content_plan SET hashtags =
  '#SegurosDigitales #AutomatizaciónSeguros #SegurosElSalvador #TransformaciónDigital #CorredoresDeSeguros #AutomatizaciónEmpresarial #EficienciaOperativa #GestiónDeSeguros #NegociosSV #Seguros #DigitalizaciónSeguros #SegurosLatam #AutomatizaciónPymes'
WHERE vertical = 'seguros_servicio'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE;

-- ── FIX 2: SOFT CTA DE ENGAGEMENT (solo posts 'valor' sin cierre explícito) ─

UPDATE content_plan SET copy_text =
  copy_text || E'\n\n¿Ya lo aplicas en tu negocio? Cuéntanos en los comentarios.'
WHERE post_type = 'valor'
  AND vertical = 'jaagsolutions_core'
  AND pillar = 'educacion'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE
  AND copy_text NOT ILIKE '%cuéntanos%'
  AND copy_text NOT ILIKE '%comenta%'
  AND copy_text NOT ILIKE '%escríbenos%';

UPDATE content_plan SET copy_text =
  copy_text || E'\n\n¿Cómo mapean sus procesos hoy? Cuéntanos en los comentarios.'
WHERE post_type = 'valor'
  AND vertical = 'jaagsolutions_core'
  AND pillar = 'behind_the_scenes'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE
  AND copy_text NOT ILIKE '%cuéntanos%'
  AND copy_text NOT ILIKE '%comenta%'
  AND copy_text NOT ILIKE '%escríbenos%';

UPDATE content_plan SET copy_text =
  copy_text || E'\n\n¿Qué resultado buscas este trimestre? Cuéntanos en los comentarios.'
WHERE post_type = 'valor'
  AND vertical = 'jaagsolutions_core'
  AND pillar IN ('casos_de_uso', 'prueba_social')
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE
  AND copy_text NOT ILIKE '%cuéntanos%'
  AND copy_text NOT ILIKE '%comenta%'
  AND copy_text NOT ILIKE '%escríbenos%';

UPDATE content_plan SET copy_text =
  copy_text || E'\n\n¿Cuál es el siguiente nivel para tu negocio? Cuéntanos en los comentarios.'
WHERE post_type = 'valor'
  AND vertical = 'jaagsolutions_core'
  AND pillar = 'promesa'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE
  AND copy_text NOT ILIKE '%cuéntanos%'
  AND copy_text NOT ILIKE '%comenta%'
  AND copy_text NOT ILIKE '%escríbenos%';

UPDATE content_plan SET copy_text =
  copy_text || E'\n\n¿Cuánto tiempo le dedicas hoy a tareas que podría automatizar tu equipo? Cuéntanos.'
WHERE post_type = 'valor'
  AND vertical = 'seguros_servicio'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE
  AND copy_text NOT ILIKE '%cuéntanos%'
  AND copy_text NOT ILIKE '%comenta%'
  AND copy_text NOT ILIKE '%escríbenos%';

COMMIT;

-- Verificación:
-- SELECT scheduled_date, pillar, post_type, vertical, hashtags,
--        right(copy_text, 80) AS copy_tail
-- FROM content_plan
-- WHERE status='pending' AND scheduled_date >= CURRENT_DATE
-- ORDER BY scheduled_date;
