-- deploy/sql/2026-05-25-seed-content-plan-operational-agenda.sql
-- Operational agenda load for the official n8n content pipeline.
--
-- Source of truth after execution: PostgreSQL table content_plan.
-- This file is not a live calendar and must not be read by n8n.
--
-- Active cadence from 2026-05-25 through 2026-07-31:
--   Monday 10:00, Wednesday 10:00, Friday 11:00.
--
-- platform = 'meta' is intentional. In the current Telegram approval workflow,
-- the Meta branch publishes FB + IG and then continues into LinkedIn publishing.
--
-- This script removes pending future rows in the operation window that are not
-- part of the official Monday/Wednesday/Friday cadence. It does not touch rows
-- already in review, generating, approved or published.
--
-- Execute from the VPS host:
-- docker exec -i deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < deploy/sql/2026-05-25-seed-content-plan-operational-agenda.sql

BEGIN;

WITH planned_raw (
  scheduled_date,
  scheduled_time,
  pillar,
  post_type,
  headline,
  body,
  cta,
  hashtags
) AS (
  VALUES
  (DATE '2026-05-25', TIME '10:00', 'educacion', 'valor',
   'Empiece por una tarea repetitiva',
   'La mejor primera automatización no es la más grande. Es una tarea que se repite, consume tiempo y tiene reglas claras. Cuando empieza pequeño, mide rápido y reduce riesgo.',
   'Elija una tarea de esta semana y escriba cuánto tiempo le consume.',
   '#AutomatizaciónPYME #Productividad #Procesos'),

  (DATE '2026-05-27', TIME '10:00', 'casos_de_uso', 'valor',
   'Del formulario a la tarea asignada',
   'Una respuesta de formulario puede crear una tarea, avisar al equipo y dejar el contexto listo para responder. Ese flujo simple evita perder oportunidades por copiar y pegar.',
   'Revise qué ocurre hoy después de cada formulario recibido.',
   '#CasosDeUso #Formularios #Automatización'),

  (DATE '2026-05-29', TIME '11:00', 'prueba_social', 'conversion',
   'Revise un proceso en 15 minutos',
   'Si no sabe por dónde empezar, una revisión breve suele revelar dos o tres automatizaciones pequeñas que liberan tiempo sin cambiar toda la operación.',
   'Escriba QUIERO o envíe un mensaje directo para revisar un proceso.',
   '#RevisiónOperativa #AutomatizaciónPYME #Crecimiento'),

  (DATE '2026-06-01', TIME '10:00', 'educacion', 'valor',
   'La agenda no automatiza por sí sola',
   'Tener fechas y responsables ayuda, pero el valor aparece cuando el sistema mueve información, crea recordatorios y deja evidencia sin depender de memoria humana.',
   'Identifique un seguimiento que hoy dependa de alguien recordándolo.',
   '#Operaciones #Automatización #PYME'),

  (DATE '2026-06-03', TIME '10:00', 'behind_the_scenes', 'valor',
   'Cómo se diseña un workflow confiable',
   'Un workflow confiable tiene disparador claro, datos de entrada, decisión esperada, acción final y registro. Si falta una de esas piezas, la automatización se vuelve frágil.',
   'Mapee esas cinco piezas antes de conectar herramientas.',
   '#Workflow #BehindTheScenes #Automatización'),

  (DATE '2026-06-05', TIME '11:00', 'casos_de_uso', 'valor',
   'Recordatorios de cobro sin persecución manual',
   'Un sistema puede revisar vencimientos, enviar avisos internos y priorizar cuentas sin que el equipo copie fechas a mano. Menos olvido, más seguimiento oportuno.',
   'Revise cuántas veces su equipo busca manualmente pagos pendientes.',
   '#Cobros #FinanzasPYME #Automatización'),

  (DATE '2026-06-08', TIME '10:00', 'educacion', 'valor',
   'Mida tiempo antes de automatizar',
   'Antes de invertir en una herramienta, mida cuánto tarda el proceso manual y cuántas veces se repite. Esa base permite saber si la automatización realmente devuelve valor.',
   'Cronometre una tarea repetitiva esta semana.',
   '#MejoraContinua #Productividad #Procesos'),

  (DATE '2026-06-10', TIME '10:00', 'casos_de_uso', 'valor',
   'Leads web con seguimiento ordenado',
   'Cuando entra un lead por la web, el sistema puede avisar, asignar responsable y preparar contexto. La velocidad de respuesta mejora sin sumar trabajo manual.',
   'Cuente cuántos pasos manuales ocurren después de cada lead.',
   '#Leads #Ventas #AutomatizaciónComercial'),

  (DATE '2026-06-12', TIME '11:00', 'prueba_social', 'conversion',
   'Dos ideas desde un solo proceso',
   'Un proceso repetitivo suele esconder varias oportunidades: una alerta, una tarea automática o un registro ordenado. No necesita automatizar todo para empezar a ahorrar tiempo.',
   'Envíe un proceso y le devuelvo dos ideas concretas.',
   '#Asesoría #AutomatizaciónPYME #Operaciones'),

  (DATE '2026-06-15', TIME '10:00', 'educacion', 'valor',
   'Automatice excepciones, no todo',
   'En procesos complejos, empezar por el cien por ciento aumenta el riesgo. Automatice lo repetitivo y cree alertas para los casos raros. Así el equipo gana control primero.',
   'Busque una excepción que hoy nadie detecta a tiempo.',
   '#ControlOperativo #AutomatizaciónInteligente #PYME'),

  (DATE '2026-06-17', TIME '10:00', 'behind_the_scenes', 'valor',
   'Mapa simple de entradas y salidas',
   'Un buen mapa operativo responde tres preguntas: qué entra, qué decisión se toma y qué debe salir. Esa claridad evita automatizaciones que se rompen al primer caso distinto.',
   'Dibuje una entrada y una salida de su proceso principal.',
   '#Procesos #Workflow #Operación'),

  (DATE '2026-06-19', TIME '11:00', 'casos_de_uso', 'valor',
   'Reportes semanales sin copiar datos',
   'Si cada semana alguien consolida datos a mano, ahí hay una oportunidad clara. El sistema puede reunir información, ordenar indicadores y avisar cuando falta algo.',
   'Revise qué reporte semanal le consume más tiempo.',
   '#Reportes #AutomatizaciónPYME #Productividad'),

  (DATE '2026-06-22', TIME '10:00', 'educacion', 'valor',
   'Tres señales de un proceso automatizable',
   'Si una tarea se repite, usa datos parecidos y termina con una decisión clara, probablemente puede automatizarse. Empiece por ahí antes de rediseñar toda la operación.',
   'Evalúe una tarea con esas tres señales.',
   '#ProcesosAutomatizables #Productividad #PYME'),

  (DATE '2026-06-24', TIME '10:00', 'behind_the_scenes', 'valor',
   'Prueba piloto antes de escalar',
   'Un piloto pequeño permite validar reglas, errores y beneficios sin comprometer toda la operación. La automatización debe probarse con casos reales antes de escalar.',
   'Elija un piloto que pueda medirse en una semana.',
   '#Piloto #Automatización #MejoraOperativa'),

  (DATE '2026-06-26', TIME '11:00', 'prueba_social', 'conversion',
   'Cierre junio con una revisión',
   'Si junio dejó tareas repetitivas, errores manuales o seguimientos atrasados, ahí puede estar su primera automatización rentable. Una revisión breve ayuda a priorizar.',
   'Escriba REVISION y vemos un proceso concreto.',
   '#RevisiónOperativa #AutomatizaciónPYME #Crecimiento'),

  (DATE '2026-06-29', TIME '10:00', 'educacion', 'valor',
   'Antes de comprar una herramienta',
   'La herramienta no arregla un proceso indefinido. Primero escriba el disparador, los datos necesarios, la acción esperada y cómo medirá el resultado.',
   'Defina esas cuatro piezas antes de invertir tiempo o dinero.',
   '#HerramientasNoCode #Procesos #Automatización'),

  (DATE '2026-07-01', TIME '10:00', 'casos_de_uso', 'valor',
   'Onboarding de clientes sin pasos perdidos',
   'Un flujo de onboarding puede crear tareas, pedir documentos, avisar responsables y registrar avances. La experiencia mejora porque nadie depende de recordar cada paso.',
   'Revise qué paso suele perderse al iniciar un cliente nuevo.',
   '#Onboarding #ExperienciaCliente #Automatización'),

  (DATE '2026-07-03', TIME '11:00', 'prueba_social', 'conversion',
   'Primer viernes de julio: elija proceso',
   'Julio puede empezar con una mejora concreta. Si elige un proceso repetitivo esta semana, puede salir con un mapa claro y una primera automatización viable.',
   'Comente PROCESO si quiere ayuda para elegirlo.',
   '#AutomatizaciónPYME #Crecimiento #Operaciones'),

  (DATE '2026-07-06', TIME '10:00', 'educacion', 'valor',
   'El costo oculto de copiar y pegar',
   'Copiar datos entre sistemás parece pequeño, pero se acumula en horas, errores y retrasos. Automatizar ese puente suele ser una mejora rapida y visible.',
   'Identifique donde su equipo copia el mismo dato dos veces.',
   '#Productividad #Automatización #PYME'),

  (DATE '2026-07-08', TIME '10:00', 'behind_the_scenes', 'valor',
   'Checklist operativo antes de conectar apps',
   'Antes de conectar aplicaciones, confirme permisos, datos obligatorios, responsable, criterio de error y acción final. Eso evita workflows que funcionan solo en pruebas.',
   'Use esta lista antes de su próxima integración.',
   '#Integraciones #Workflow #Automatización'),

  (DATE '2026-07-10', TIME '11:00', 'casos_de_uso', 'valor',
   'Solicitudes internas en un solo flujo',
   'Cuando las solicitudes llegan por chats, correos y llamadas, el seguimiento se dispersa. Un flujo único puede ordenar entradas, priorizar y asignar responsables.',
   'Revise por cuántos canales entran hoy sus solicitudes.',
   '#Operaciones #Solicitudes #AutomatizaciónPYME'),

  (DATE '2026-07-13', TIME '10:00', 'educacion', 'valor',
   'No todo debe ser inmediato',
   'Automatizar también significa decidir qué puede esperar, qué debe escalar y qué necesita alerta. Una buena regla reduce ruido y mejora la atención del equipo.',
   'Defina que evento merece una alerta real.',
   '#Alertas #ControlOperativo #Procesos'),

  (DATE '2026-07-15', TIME '10:00', 'casos_de_uso', 'valor',
   'Alertas cuando falta información',
   'Un sistema puede detectar campos incompletos, avisar al responsable y evitar que el proceso avance con datos malos. La calidad mejora antes de que el error crezca.',
   'Piense qué dato faltante retrasa más su operación.',
   '#CalidadDeDatos #Automatización #PYME'),

  (DATE '2026-07-17', TIME '11:00', 'prueba_social', 'conversion',
   'Revisión express de mitad de mes',
   'A mitad de mes ya hay señales claras: tareas repetidas, seguimientos atrasados y errores evitables. Una revisión express permite escoger la mejora con más impacto.',
   'Escriba EXPRESS y revisamos un proceso puntual.',
   '#Asesoría #AutomatizaciónPYME #MejoraOperativa'),

  (DATE '2026-07-20', TIME '10:00', 'educacion', 'valor',
   'Estandarice antes de automatizar',
   'Si cada persona ejecuta el proceso de una forma distinta, la automatización tendrá demasiadas excepciones. Primero estandarice la versión mínima que debe cumplirse.',
   'Documente una sola forma correcta de hacer la tarea.',
   '#Estandarización #Procesos #Automatización'),

  (DATE '2026-07-22', TIME '10:00', 'behind_the_scenes', 'valor',
   'Cómo evitar automatizaciones frágiles',
   'Los workflows fuertes contemplan errores esperados: datos faltantes, respuestas tardías y casos fuera de regla. Diseñar esos caminos evita interrupciones innecesarias.',
   'Anote tres errores previsibles antes de automatizar.',
   '#Workflow #Operación #AutomatizaciónInteligente'),

  (DATE '2026-07-24', TIME '11:00', 'casos_de_uso', 'valor',
   'Seguimiento postventa ordenado',
   'Después de una venta, el sistema puede activar tareas, pedir confirmaciones y recordar próximos pasos. Eso mejora la experiencia sin depender de mensajes sueltos.',
   'Revise qué seguimiento postventa se olvida con más frecuencia.',
   '#Postventa #ExperienciaCliente #Automatización'),

  (DATE '2026-07-27', TIME '10:00', 'educacion', 'valor',
   'Qué revisar cada lunes',
   'Un buen lunes operativo revisa pendientes, excepciones, respuestas atrasadas y procesos repetidos. Si esa revisión se automatiza, el equipo empieza la semana con claridad.',
   'Elija una métrica operativa para revisar cada lunes.',
   '#GestionOperativa #Productividad #PYME'),

  (DATE '2026-07-29', TIME '10:00', 'casos_de_uso', 'valor',
   'Cierre de mes con datos listos',
   'El cierre de mes mejora cuando los datos llegan ordenados antes del último día. Automatizar recordatorios y validaciones reduce carreras de última hora.',
   'Detecte qué dato siempre falta al cerrar el mes.',
   '#CierreDeMes #Datos #Automatización'),

  (DATE '2026-07-31', TIME '11:00', 'prueba_social', 'conversion',
   'Termine julio con un proceso más claro',
   'Si julio dejó tareas repetitivas, es momento de convertir una en workflow. Empezar pequeño permite aprender, medir y escalar con menos riesgo.',
   'Envíe un proceso y le propongo dos automatizaciones iniciales.',
   '#AutomatizaciónPYME #RevisiónOperativa #Crecimiento')
),
planned AS (
  SELECT
    scheduled_date,
    scheduled_time,
    'meta'::text AS platform,
    'imagen_copy'::text AS format,
    pillar,
    post_type,
    headline || E'\n\n' || body || E'\n\n' || cta AS copy_text,
    CASE pillar
      WHEN 'educacion' THEN
        'Professional editorial photography inside a modern Latin American SME office. A consultant and business owner review an abstract workflow made from smooth colored lines and plain circular markers on a clean table. Main subjects in the top area, calm empty lower area for overlay, soft natural light, premium B2B automation mood, no screens, no documents, no sticky notes, no whiteboards, no charts, no letters, no numbers, no readable text, no logos.'
      WHEN 'casos_de_uso' THEN
        'High-end editorial photo of a small Latino business team reviewing an abstract operational flow on a clean table. A simple path of colored lines moves from one plain object to several organized markers, suggesting intake to outcome without showing software. Human, practical, modern, calm lower area for overlay, no forms, no UI, no screens, no documents, no text, no letters, no numbers, no logos.'
      WHEN 'behind_the_scenes' THEN
        'Premium behind-the-scenes consulting scene in a bright modern office. Two Latino automation consultants arrange blank geometric process blocks and colored route lines on a glass table while a client observes. Calm, precise, professional, top-weighted composition, soft natural light, empty lower area for overlay, no notebooks, no screens, no whiteboard writing, no letters, no numbers, no logos, no text.'
      ELSE
        'Warm professional editorial photo of a Latino consultant and small business owner in a modern office, reviewing an abstract workflow made only from colored lines and plain circular markers on a table. Trustworthy human consultation mood, soft natural light, premium but approachable. Main people in top area, clean calm lower area for overlay, no forms, no documents, no screens, no signage, no text, no letters, no numbers, no logos.'
    END AS image_prompt,
    hashtags,
    'https://jaagsolutions.com'::text AS cta_url
  FROM planned_raw
),
obsolete_pending AS (
  DELETE FROM content_plan cp
  WHERE cp.status = 'pending'
    AND cp.scheduled_date BETWEEN DATE '2026-05-25' AND DATE '2026-07-31'
    AND NOT EXISTS (
      SELECT 1
      FROM planned p
      WHERE p.scheduled_date = cp.scheduled_date
        AND p.scheduled_time = cp.scheduled_time
        AND p.platform = cp.platform
    )
  RETURNING cp.id
),
normalized AS (
  UPDATE content_plan cp
  SET
    format = p.format,
    pillar = p.pillar,
    post_type = p.post_type,
    copy_text = p.copy_text,
    image_prompt = p.image_prompt,
    hashtags = p.hashtags,
    cta_url = p.cta_url
  FROM planned p
  WHERE cp.status = 'pending'
    AND cp.scheduled_date = p.scheduled_date
    AND cp.scheduled_time = p.scheduled_time
    AND cp.platform = p.platform
  RETURNING cp.id
)
INSERT INTO content_plan (
  scheduled_date,
  scheduled_time,
  platform,
  format,
  pillar,
  post_type,
  copy_text,
  image_prompt,
  hashtags,
  cta_url,
  status
)
SELECT
  p.scheduled_date,
  p.scheduled_time,
  p.platform,
  p.format,
  p.pillar,
  p.post_type,
  p.copy_text,
  p.image_prompt,
  p.hashtags,
  p.cta_url,
  'pending'
FROM planned p
WHERE NOT EXISTS (
  SELECT 1
  FROM content_plan cp
  WHERE cp.scheduled_date = p.scheduled_date
    AND cp.scheduled_time = p.scheduled_time
    AND cp.platform = p.platform
    AND cp.status IN ('pending','generating','review','approved')
);

COMMIT;

SELECT
  id,
  scheduled_date,
  scheduled_time,
  platform,
  format,
  pillar,
  post_type,
  status
FROM content_plan
WHERE scheduled_date BETWEEN DATE '2026-05-25' AND DATE '2026-07-31'
ORDER BY scheduled_date, scheduled_time, platform;

SELECT
  id,
  scheduled_date,
  scheduled_time,
  platform,
  pillar,
  status
FROM content_plan
WHERE status = 'pending'
  AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 2
ORDER BY scheduled_date, scheduled_time;

