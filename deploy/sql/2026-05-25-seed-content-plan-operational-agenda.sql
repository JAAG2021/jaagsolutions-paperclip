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

-- Corregir registros pendientes que aún tienen 11:00 (viernes anteriores al cambio)
UPDATE content_plan
SET scheduled_time = '10:00'
WHERE scheduled_time = '11:00'
  AND status = 'pending'
  AND scheduled_date >= CURRENT_DATE;

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
   'La mayoría empieza automatizando lo incorrecto. Y pierde tiempo y dinero en el proceso.',
   'La mejor primera automatización no es la más grande. Es una tarea que se repite, consume tiempo y tiene reglas claras. Cuando empieza pequeño, mide rápido y reduce riesgo.',
   '¿Cuál es la tarea que más veces repite en su semana? Cuéntenme abajo.',
   '#AutomatizaciónPYME #Productividad #Procesos'),

  (DATE '2026-05-27', TIME '10:00', 'casos_de_uso', 'valor',
   'Cada formulario sin respuesta automática es una oportunidad que se enfría sola.',
   'Una respuesta de formulario puede crear una tarea, avisar al equipo y dejar el contexto listo para responder. Ese flujo simple evita perder oportunidades por copiar y pegar.',
   '¿Qué pasa en su empresa cuando llega un formulario? ¿Lo gestiona una persona o un sistema?',
   '#CasosDeUso #Formularios #Automatización'),

  (DATE '2026-05-29', TIME '10:00', 'prueba_social', 'conversion',
   '15 minutos cambiaron la operación de varios negocios con los que trabajamos. Así fue.',
   'Si no sabe por dónde empezar, una revisión breve suele revelar dos o tres automatizaciones pequeñas que liberan tiempo sin cambiar toda la operación.',
   '¿Qué proceso les gustaría revisar? Descríbanlo en los comentarios y les doy una primera idea.',
   '#RevisiónOperativa #AutomatizaciónPYME #Crecimiento'),

  (DATE '2026-06-01', TIME '10:00', 'educacion', 'valor',
   'Tener una agenda ordenada no es suficiente. Le explicamos por qué.',
   'Tener fechas y responsables ayuda, pero el valor aparece cuando el sistema mueve información, crea recordatorios y deja evidencia sin depender de memoria humana.',
   '¿Tienen algún proceso que depende 100% de que alguien lo recuerde? ¿Cuál es?',
   '#Operaciones #Automatización #PYME'),

  (DATE '2026-06-03', TIME '10:00', 'behind_the_scenes', 'valor',
   'La mayoría de las automatizaciones se rompen no por las herramientas, sino por lo que no se definió antes.',
   'Un workflow confiable tiene disparador claro, datos de entrada, decisión esperada, acción final y registro. Si falta una de esas piezas, la automatización se vuelve frágil.',
   '¿Cuántas de esas cinco piezas tiene definidas en su próximo workflow? Cuéntenme.',
   '#Workflow #BehindTheScenes #Automatización'),

  (DATE '2026-06-05', TIME '10:00', 'casos_de_uso', 'valor',
   'Perseguir cobros a mano es uno de los trabajos más frustrantes y más fáciles de automatizar.',
   'Un sistema puede revisar vencimientos, enviar avisos internos y priorizar cuentas sin que el equipo copie fechas a mano. Menos olvido, más seguimiento oportuno.',
   '¿Cuántas horas semanales invierte su equipo en gestionar cobros pendientes? Cuéntenme.',
   '#Cobros #FinanzasPYME #Automatización'),

  (DATE '2026-06-08', TIME '10:00', 'educacion', 'valor',
   'No sabemos cuánto tiempo perdemos hasta que lo medimos. El número suele sorprender.',
   'Antes de invertir en una herramienta, mida cuánto tarda el proceso manual y cuántas veces se repite. Esa base permite saber si la automatización realmente devuelve valor.',
   '¿Han cronometrado alguna vez una tarea repetitiva? ¿Qué encontraron?',
   '#MejoraContinua #Productividad #Procesos'),

  (DATE '2026-06-10', TIME '10:00', 'casos_de_uso', 'valor',
   'El 78% de los clientes compra al primero que responde. ¿Cuánto tarda su equipo en atender un lead?',
   'Cuando entra un lead por la web, el sistema puede avisar, asignar responsable y preparar contexto. La velocidad de respuesta mejora sin sumar trabajo manual.',
   '¿Cuántos pasos manuales ocurren en su empresa desde que entra un lead hasta que alguien lo contacta?',
   '#Leads #Ventas #AutomatizaciónComercial'),

  (DATE '2026-06-12', TIME '10:00', 'prueba_social', 'conversion',
   'Esta semana revisamos un proceso de tres pasos. Encontramos seis automatizaciones posibles.',
   'Un proceso repetitivo suele esconder varias oportunidades: una alerta, una tarea automática o un registro ordenado. No necesita automatizar todo para empezar a ahorrar tiempo.',
   '¿Qué proceso repetitivo tienen hoy que se siente como una pérdida de tiempo? Comenten y lo analizamos.',
   '#Asesoría #AutomatizaciónPYME #Operaciones'),

  (DATE '2026-06-15', TIME '10:00', 'educacion', 'valor',
   'Intentar automatizar todo al mismo tiempo es uno de los errores más costosos que vemos.',
   'En procesos complejos, empezar por el cien por ciento aumenta el riesgo. Automatice lo repetitivo y cree alertas para los casos raros. Así el equipo gana control primero.',
   '¿Tienen alguna excepción operativa que se detecta tarde? ¿Cómo la manejan hoy?',
   '#ControlOperativo #AutomatizaciónInteligente #PYME'),

  (DATE '2026-06-17', TIME '10:00', 'behind_the_scenes', 'valor',
   'Antes de tocar una sola herramienta, hacemos este ejercicio de 10 minutos. Cambia todo.',
   'Un buen mapa operativo responde tres preguntas: qué entra, qué decisión se toma y qué debe salir. Esa claridad evita automatizaciones que se rompen al primer caso distinto.',
   '¿Tienen claro cuál es la entrada y la salida de su proceso principal? ¿O varía según la persona?',
   '#Procesos #Workflow #Operación'),

  (DATE '2026-06-19', TIME '10:00', 'casos_de_uso', 'valor',
   'Alguien en su empresa dedica tiempo cada semana a copiar datos de un lugar a otro. Ese tiempo tiene costo.',
   'Si cada semana alguien consolida datos a mano, ahí hay una oportunidad clara. El sistema puede reunir información, ordenar indicadores y avisar cuando falta algo.',
   '¿Cuánto tiempo consume en su empresa preparar el reporte semanal? ¿Quién lo hace?',
   '#Reportes #AutomatizaciónPYME #Productividad'),

  (DATE '2026-06-22', TIME '10:00', 'educacion', 'valor',
   'No todo se puede automatizar. Pero estas tres señales le dicen cuándo vale la pena intentarlo.',
   'Si una tarea se repite, usa datos parecidos y termina con una decisión clara, probablemente puede automatizarse. Empiece por ahí antes de rediseñar toda la operación.',
   '¿Tienen una tarea que cumpla esas tres señales? Descríbanla en los comentarios.',
   '#ProcesosAutomatizables #Productividad #PYME'),

  (DATE '2026-06-24', TIME '10:00', 'behind_the_scenes', 'valor',
   'Vimos una automatización costosa fallar porque nadie la probó con datos reales antes de escalar.',
   'Un piloto pequeño permite validar reglas, errores y beneficios sin comprometer toda la operación. La automatización debe probarse con casos reales antes de escalar.',
   '¿Han lanzado alguna vez algo directamente a producción sin piloto? ¿Cómo terminó?',
   '#Piloto #Automatización #MejoraOperativa'),

  (DATE '2026-06-26', TIME '10:00', 'prueba_social', 'conversion',
   'Junio cierra en días. Si este mes dejó procesos lentos, ese es el mejor punto de partida para julio.',
   'Si junio dejó tareas repetitivas, errores manuales o seguimientos atrasados, ahí puede estar su primera automatización rentable. Una revisión breve ayuda a priorizar.',
   '¿Cuál fue el proceso más lento o frustrante de junio en su empresa? Cuéntenme en los comentarios.',
   '#RevisiónOperativa #AutomatizaciónPYME #Crecimiento'),

  (DATE '2026-06-29', TIME '10:00', 'educacion', 'valor',
   'La herramienta no es el problema. El proceso sin definir sí lo es.',
   'La herramienta no arregla un proceso indefinido. Primero escriba el disparador, los datos necesarios, la acción esperada y cómo medirá el resultado.',
   '¿Compraron alguna herramienta que terminó sin usar? ¿Qué pasó?',
   '#HerramientasNoCode #Procesos #Automatización'),

  (DATE '2026-07-01', TIME '10:00', 'casos_de_uso', 'valor',
   'El primer mes con un cliente nuevo define si se queda o se va. ¿Cuántos pasos dependen de que alguien no olvide?',
   'Un flujo de onboarding puede crear tareas, pedir documentos, avisar responsables y registrar avances. La experiencia mejora porque nadie depende de recordar cada paso.',
   '¿Qué paso del onboarding se pierde con más frecuencia en su empresa? Cuéntenme.',
   '#Onboarding #ExperienciaCliente #Automatización'),

  (DATE '2026-07-03', TIME '10:00', 'prueba_social', 'conversion',
   'Julio es buen momento para empezar algo nuevo. Un proceso bien elegido puede cambiar el trimestre.',
   'Julio puede empezar con una mejora concreta. Si elige un proceso repetitivo esta semana, puede salir con un mapa claro y una primera automatización viable.',
   '¿Qué proceso quieren mejorar en julio? Comenten PROCESO y lo analizamos juntos.',
   '#AutomatizaciónPYME #Crecimiento #Operaciones'),

  (DATE '2026-07-06', TIME '10:00', 'educacion', 'valor',
   'Copiar y pegar parece gratis. No lo es. Aquí están los números.',
   'Copiar datos entre sistemas parece pequeño, pero se acumula en horas, errores y retrasos. Automatizar ese puente suele ser una mejora rápida y visible.',
   '¿En cuántos lugares distintos vive el mismo dato en su empresa? (CRM, Excel, WhatsApp, correo...)',
   '#Productividad #Automatización #PYME'),

  (DATE '2026-07-08', TIME '10:00', 'behind_the_scenes', 'valor',
   'Conectar dos aplicaciones sin este checklist es como construir sin planos. Funciona hasta que no funciona.',
   'Antes de conectar aplicaciones, confirme permisos, datos obligatorios, responsable, criterio de error y acción final. Eso evita workflows que funcionan solo en pruebas.',
   '¿Tienen un checklist antes de conectar herramientas, o van directo a probar? ¿Qué les ha pasado?',
   '#Integraciones #Workflow #Automatización'),

  (DATE '2026-07-10', TIME '10:00', 'casos_de_uso', 'valor',
   'WhatsApp, correo, llamada, mensaje directo. Si las solicitudes entran por cuatro canales, algo se pierde siempre.',
   'Cuando las solicitudes llegan por chats, correos y llamadas, el seguimiento se dispersa. Un flujo único puede ordenar entradas, priorizar y asignar responsables.',
   '¿Por cuántos canales entran solicitudes en su empresa hoy? ¿Cuál genera más confusión?',
   '#Operaciones #Solicitudes #AutomatizaciónPYME'),

  (DATE '2026-07-13', TIME '10:00', 'educacion', 'valor',
   'Las alertas que no importan entrenan al equipo a ignorar las que sí importan.',
   'Automatizar también significa decidir qué puede esperar, qué debe escalar y qué necesita alerta. Una buena regla reduce ruido y mejora la atención del equipo.',
   '¿Tienen alguna alerta que ya nadie revisa porque siempre es ruido? ¿Cuál es?',
   '#Alertas #ControlOperativo #Procesos'),

  (DATE '2026-07-15', TIME '10:00', 'casos_de_uso', 'valor',
   'Un proceso avanzó con datos incompletos. El error se descubrió tres semanas después. Así se evita.',
   'Un sistema puede detectar campos incompletos, avisar al responsable y evitar que el proceso avance con datos malos. La calidad mejora antes de que el error crezca.',
   '¿Tienen algún proceso que avanza aunque le falte información crítica? ¿Cómo lo detectan hoy?',
   '#CalidadDeDatos #Automatización #PYME'),

  (DATE '2026-07-17', TIME '10:00', 'prueba_social', 'conversion',
   'A mitad de julio ya hay señales claras de dónde se pierde tiempo. ¿Las están leyendo?',
   'A mitad de mes ya hay señales claras: tareas repetidas, seguimientos atrasados y errores evitables. Una revisión express permite escoger la mejora con más impacto.',
   '¿Cuál ha sido el cuello de botella más claro en julio hasta ahora? Comenten EXPRESS y lo revisamos.',
   '#Asesoría #AutomatizaciónPYME #MejoraOperativa'),

  (DATE '2026-07-20', TIME '10:00', 'educacion', 'valor',
   'Automatizar un proceso que cada persona hace diferente no ahorra tiempo. Lo congela.',
   'Si cada persona ejecuta el proceso de una forma distinta, la automatización tendrá demasiadas excepciones. Primero estandarice la versión mínima que debe cumplirse.',
   '¿Tienen algún proceso que cada persona del equipo ejecuta a su manera? ¿Cómo lo manejan?',
   '#Estandarización #Procesos #Automatización'),

  (DATE '2026-07-22', TIME '10:00', 'behind_the_scenes', 'valor',
   'Una automatización que funciona solo cuando todo sale bien no es una automatización. Es una apuesta.',
   'Los workflows fuertes contemplan errores esperados: datos faltantes, respuestas tardías y casos fuera de regla. Diseñar esos caminos evita interrupciones innecesarias.',
   '¿Han tenido alguna automatización que se rompió con el primer caso inesperado? ¿Qué pasó?',
   '#Workflow #Operación #AutomatizaciónInteligente'),

  (DATE '2026-07-24', TIME '10:00', 'casos_de_uso', 'valor',
   'La venta cierra. El seguimiento se olvida. El cliente no vuelve. Ese ciclo tiene solución.',
   'Después de una venta, el sistema puede activar tareas, pedir confirmaciones y recordar próximos pasos. Eso mejora la experiencia sin depender de mensajes sueltos.',
   '¿Cuántos días pasan entre que cierra una venta y el primer seguimiento postventa en su empresa?',
   '#Postventa #ExperienciaCliente #Automatización'),

  (DATE '2026-07-27', TIME '10:00', 'educacion', 'valor',
   'Los lunes sin estructura operativa son los que generan los viernes de emergencia.',
   'Un buen lunes operativo revisa pendientes, excepciones, respuestas atrasadas y procesos repetidos. Si esa revisión se automatiza, el equipo empieza la semana con claridad.',
   '¿Qué es lo primero que revisan cada lunes en su empresa? ¿Tienen un proceso definido para eso?',
   '#GestionOperativa #Productividad #PYME'),

  (DATE '2026-07-29', TIME '10:00', 'casos_de_uso', 'valor',
   'El último día del mes no debería ser el más estresante. Pero en la mayoría de las empresas lo es.',
   'El cierre de mes mejora cuando los datos llegan ordenados antes del último día. Automatizar recordatorios y validaciones reduce carreras de última hora.',
   '¿Qué dato siempre falta cuando cierran el mes? ¿Por qué creen que sigue pasando?',
   '#CierreDeMes #Datos #Automatización'),

  (DATE '2026-07-31', TIME '10:00', 'prueba_social', 'conversion',
   'Julio tuvo 22 días hábiles. Si alguno se fue en trabajo que un sistema pudo hacer, eso es una señal.',
   'Si julio dejó tareas repetitivas, es momento de convertir una en workflow. Empezar pequeño permite aprender, medir y escalar con menos riesgo.',
   '¿Qué proceso les gustaría tener automatizado para agosto? Comenten abajo y lo analizamos.',
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
  AND scheduled_date >= CURRENT_DATE
ORDER BY scheduled_date, scheduled_time;

