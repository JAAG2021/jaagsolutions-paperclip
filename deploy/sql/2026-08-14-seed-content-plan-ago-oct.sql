-- deploy/sql/2026-08-14-seed-content-plan-ago-oct.sql
-- Recarga de la agenda operativa del pipeline de contenido n8n.
--
-- CONTEXTO: el lote anterior (2026-05-25-seed-content-plan-operational-agenda.sql)
-- cubria hasta el 2026-07-31 y se agoto. Desde el 2026-08-01 el Content Generator
-- corrio cada manana sin encontrar filas y no publico nada durante 14 dias, en
-- silencio (el monitor 08:15 solo miraba posts de HOY, y con la agenda vacia no
-- habia ninguno). Se perdieron 6 fechas: 3, 5, 7, 10, 12 y 14 de agosto.
--
-- Cadencia core-only vigente desde 2026-07-17: Lunes, Miercoles y Viernes 10:00.
-- (La hora 10:00 tambien los viernes es lo que reflejan los datos reales del lote
-- anterior; la doc mencionaba 16:00 pero ese cambio nunca llego a la tabla.)
--
-- Cobertura: lunes 2026-08-17 a viernes 2026-10-30. 33 posts.
--   educacion 10 | casos_de_uso 11 | behind_the_scenes 6 | prueba_social 6
--   prueba_social cae cada dos viernes y es siempre post_type='conversion' (18%,
--   misma proporcion que el lote mayo-julio).
--
-- IMPORTANTE: el cron toma `scheduled_date = CURRENT_DATE` (no un rango). Las
-- fechas vencidas NO se recuperan solas. Por eso este lote arranca en la proxima
-- fecha futura y no intenta rellenar agosto hacia atras.
--
-- Reglas vigentes horneadas aqui (NO heredar la logica derivada del seed de mayo,
-- que quedo obsoleta en estos cuatro puntos):
--   1. cta_url = dominio limpio, sin UTMs             (politica 2026-06-18)
--   2. format  = texto_largo en prueba_social         (politica 2026-07-17)
--   3. image_prompt = '' -> el Auditor deriva la escena del copy_text
--                                                     (politica 2026-06-17)
--   4. hashtags = set canonico 3-5 sin geo-lock       (politica 2026-07-17)
-- Ademas: prohibido el guion largo en el copy (se usa coma).
--
-- Idempotente: no inserta si ya existe una fila con la misma fecha y hora.
--
-- Ejecutar dentro del container postgres deploy-postgres-1:
--   docker exec -i deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
--     < /opt/jaagsolutions/repo/deploy/sql/2026-08-14-seed-content-plan-ago-oct.sql

BEGIN;

WITH planned_raw (
  scheduled_date,
  scheduled_time,
  pillar,
  post_type,
  headline,
  body,
  cta
) AS (
  VALUES
  (DATE '2026-08-17', TIME '10:00', 'educacion', 'valor',
   'La mayoría de los procesos no falla por falta de gente. Falla por falta de reglas claras.',
   'Cuando cada persona resuelve a su manera, el resultado depende de quién esté ese día. Escribir la regla antes de automatizar es lo que vuelve predecible el proceso.',
   '¿Qué proceso en su empresa se hace distinto según quién lo ejecute?'),

  (DATE '2026-08-19', TIME '10:00', 'casos_de_uso', 'valor',
   'Una cotización que tarda dos días en salir ya perdió contra la que salió en dos horas.',
   'Cuando los datos del cliente, los precios y las condiciones viven en un solo flujo, la cotización se arma sola y solo queda revisarla. El vendedor deja de perseguir información.',
   '¿Cuánto tardan hoy en enviar una cotización desde que el cliente la pide?'),

  (DATE '2026-08-21', TIME '10:00', 'prueba_social', 'conversion',
   'En seis meses acompañamos a empresas que empezaron automatizando un solo proceso. Ninguna empezó por el más complejo.',
   'El patrón se repite: eligen la tarea que más se repite y menos criterio necesita, la convierten en workflow y miden el resultado. Ese primer número es el que abre la puerta a los siguientes.',
   'Si tuvieran que elegir un solo proceso para empezar, ¿cuál sería?'),

  (DATE '2026-08-24', TIME '10:00', 'educacion', 'valor',
   'Automatizar un proceso malo solo hace que el error llegue más rápido.',
   'Antes de conectar herramientas conviene mapear el flujo real, no el que está en el manual. Casi siempre aparecen pasos que ya nadie recuerda para qué existen.',
   '¿Cuándo fue la última vez que revisaron un proceso completo de principio a fin?'),

  (DATE '2026-08-26', TIME '10:00', 'behind_the_scenes', 'valor',
   'Antes de escribir una línea de código, dibujamos el proceso en papel con el cliente.',
   'Esa sesión suele durar una hora y ahorra semanas. Ahí salen las excepciones, los casos raros y las decisiones que nadie había puesto por escrito.',
   '¿Su proceso más importante está documentado en algún lado, o vive en la cabeza del equipo?'),

  (DATE '2026-08-28', TIME '10:00', 'casos_de_uso', 'valor',
   'Un cliente escribe un viernes a las 6 de la tarde. La respuesta llega el lunes. Ahí se perdió la venta.',
   'Un flujo que confirma la recepción y agenda el seguimiento mantiene viva la conversación fuera de horario. No reemplaza al vendedor, le gana tiempo.',
   '¿Qué pasa hoy con los mensajes que entran fuera de horario?'),

  (DATE '2026-08-31', TIME '10:00', 'educacion', 'valor',
   'Medir el tiempo de un proceso cambia la conversación sobre ese proceso.',
   'Sin datos, la discusión es de opiniones. Con el tiempo real de cada paso queda claro dónde está el cuello de botella y qué vale la pena atacar primero.',
   '¿Saben cuánto tarda hoy su proceso más importante, de inicio a fin?'),

  (DATE '2026-09-02', TIME '10:00', 'casos_de_uso', 'valor',
   'Cerrar el mes no debería requerir perseguir a cinco personas por mensajes.',
   'Cuando cada área carga su información en el mismo flujo y el sistema avisa quién falta, el cierre deja de ser una cacería. La contabilidad recibe todo ordenado.',
   '¿Cuántos recordatorios manuales manda su equipo para cerrar el mes?'),

  (DATE '2026-09-04', TIME '10:00', 'prueba_social', 'conversion',
   'La objeción más común que escuchamos es que la empresa es muy pequeña para automatizar.',
   'Casi siempre es al revés. Cuanto menos gente hay, más caro sale que alguien dedique tres horas semanales a copiar datos de un lado a otro.',
   '¿Cuántas horas a la semana se van en su empresa moviendo información entre herramientas?'),

  (DATE '2026-09-07', TIME '10:00', 'educacion', 'valor',
   'La integración no es el objetivo. El objetivo es que nadie tenga que copiar y pegar.',
   'Conectar dos sistemas solo sirve si elimina un paso manual real. Si después de la integración alguien sigue revisando a mano, el problema no se resolvió.',
   '¿Qué dato copian hoy de un sistema a otro más de una vez por semana?'),

  (DATE '2026-09-09', TIME '10:00', 'behind_the_scenes', 'valor',
   'Cada automatización que entregamos incluye un plan de qué hacer cuando falle.',
   'Los sistemas fallan: se cae una API, cambia un formato, alguien edita una hoja. Lo que separa un flujo confiable de uno frágil es que avise y se pueda retomar.',
   'Si su automatización actual fallara hoy, ¿se enterarían el mismo día?'),

  (DATE '2026-09-11', TIME '10:00', 'casos_de_uso', 'valor',
   'El alta de un cliente nuevo tiene doce pasos. Nadie los recuerda todos.',
   'Convertir esa lista en un flujo con responsables y tiempos hace que ningún paso se caiga. El cliente nota la diferencia en la primera semana.',
   '¿Cuántos pasos tiene su proceso de alta de cliente nuevo?'),

  (DATE '2026-09-14', TIME '10:00', 'educacion', 'valor',
   'Una automatización sin dueño se abandona en tres meses.',
   'Alguien tiene que revisar que siga corriendo, entender qué hace y decidir cuándo ajustarla. Sin esa persona, el flujo se convierte en una caja negra que nadie toca.',
   '¿Quién es hoy el responsable de los procesos automatizados en su empresa?'),

  (DATE '2026-09-16', TIME '10:00', 'casos_de_uso', 'valor',
   'Un inventario desactualizado genera ventas que después no se pueden cumplir.',
   'Sincronizar existencias entre el punto de venta y el canal online evita prometer lo que no hay. El costo de no hacerlo se paga en devoluciones y en reputación.',
   '¿Con qué frecuencia actualizan su inventario entre canales?'),

  (DATE '2026-09-18', TIME '10:00', 'prueba_social', 'conversion',
   'Nos piden inteligencia artificial. Casi siempre lo que hace falta primero es orden.',
   'Un modelo sobre datos desordenados devuelve resultados desordenados. Ordenar el flujo y las fuentes suele resolver la mitad del problema antes de agregar nada sofisticado.',
   '¿Sus datos operativos hoy están en un solo lugar o repartidos en varias hojas?'),

  (DATE '2026-09-21', TIME '10:00', 'educacion', 'valor',
   'El mejor momento para documentar un proceso es cuando todavía funciona.',
   'Documentar en crisis produce manuales que nadie lee. Escribirlo mientras el proceso corre bien deja un registro fiel de cómo se hace y por qué.',
   '¿Qué proceso crítico de su empresa no está documentado todavía?'),

  (DATE '2026-09-23', TIME '10:00', 'behind_the_scenes', 'valor',
   'No entregamos un sistema y desaparecemos. Las primeras dos semanas miramos cada ejecución.',
   'Ahí aparecen los casos que no salieron en la sesión de diseño. Ajustar temprano cuesta poco, ajustar seis meses después cuesta rehacer.',
   'Cuando implementaron una herramienta nueva, ¿hubo acompañamiento después del arranque?'),

  (DATE '2026-09-25', TIME '10:00', 'casos_de_uso', 'valor',
   'Los reportes que nadie lee suelen ser los que más trabajo cuestan armar.',
   'Antes de automatizar un reporte conviene preguntar quién lo usa y para qué decisión. Muchos se pueden eliminar, y los que quedan se arman solos.',
   '¿Cuántos reportes arma su equipo cada mes que nadie termina de leer?'),

  (DATE '2026-09-28', TIME '10:00', 'educacion', 'valor',
   'Si un proceso necesita criterio humano, automatice todo lo demás y deje el criterio.',
   'La decisión difícil la toma una persona, pero recolectar los datos, ordenarlos y presentarlos no. Ese reparto es donde la automatización rinde más.',
   '¿Qué parte de sus decisiones operativas se va en juntar información en vez de decidir?'),

  (DATE '2026-09-30', TIME '10:00', 'casos_de_uso', 'valor',
   'El seguimiento postventa se olvida porque depende de que alguien se acuerde.',
   'Un flujo que agenda el contacto a los siete, treinta y noventa días convierte el recuerdo en sistema. El cliente siente continuidad y el equipo no carga con eso.',
   '¿Cuándo fue el último contacto con un cliente que les compró hace tres meses?'),

  (DATE '2026-10-02', TIME '10:00', 'prueba_social', 'conversion',
   'El tercer trimestre cierra esta semana. Es buen momento para mirar qué se repitió demasiadas veces.',
   'Las tareas que aparecieron cada semana durante tres meses son las candidatas obvias. No hace falta transformar la empresa, basta con quitar una de la lista.',
   '¿Qué tarea repitieron tantas veces este trimestre que ya les molesta hacerla?'),

  (DATE '2026-10-05', TIME '10:00', 'educacion', 'valor',
   'Empezar por el proceso más complejo es la forma más rápida de abandonar el proyecto.',
   'El primer flujo debería ser aburrido y frecuente. Sirve para que el equipo aprenda, vea el resultado y confíe en el siguiente paso.',
   '¿Cuál es la tarea más repetitiva y menos interesante de su semana?'),

  (DATE '2026-10-07', TIME '10:00', 'behind_the_scenes', 'valor',
   'Guardamos el registro de cada ejecución para poder explicar qué pasó y cuándo.',
   'Cuando un cliente pregunta por qué un pedido siguió cierto camino, la respuesta está en el registro y no en la memoria de alguien. Esa trazabilidad es parte del entregable.',
   'Si tuvieran que reconstruir qué pasó con un pedido de hace un mes, ¿podrían?'),

  (DATE '2026-10-09', TIME '10:00', 'casos_de_uso', 'valor',
   'Un contacto que llega por el sitio web y espera tres días ya está hablando con otro.',
   'Cuando el formulario crea la tarea, asigna responsable y avisa al vendedor en el momento, el tiempo de respuesta baja de días a minutos.',
   '¿Cuánto tardan en contactar a alguien que llena el formulario de su sitio?'),

  (DATE '2026-10-12', TIME '10:00', 'educacion', 'valor',
   'Cambiar de herramienta no arregla un proceso mal definido. Lo muda de lugar.',
   'Antes de migrar conviene entender qué falla: si es la herramienta o cómo se usa. La mayoría de las migraciones fallidas empieza sin esa pregunta.',
   '¿Cuántas herramientas cambiaron en los últimos dos años sin resolver el problema de fondo?'),

  (DATE '2026-10-14', TIME '10:00', 'casos_de_uso', 'valor',
   'Aprobar una compra por correo deja el estado repartido en cinco bandejas de entrada.',
   'Un flujo de aprobación con estado visible muestra en qué punto está cada solicitud y quién la tiene. Se acaban los correos preguntando si ya se aprobó.',
   '¿Cómo saben hoy en qué punto está una solicitud de compra?'),

  (DATE '2026-10-16', TIME '10:00', 'prueba_social', 'conversion',
   'Lo que más nos hace dudar de un proyecto es cuando nadie sabe explicar el proceso actual.',
   'Si el equipo no puede describir cómo se hace hoy, automatizar solo va a congelar el desorden. En esos casos empezamos por entender, no por construir.',
   '¿Podrían explicar su proceso de ventas completo en cinco minutos?'),

  (DATE '2026-10-19', TIME '10:00', 'educacion', 'valor',
   'Una excepción que ocurre el diez por ciento de las veces igual necesita un camino definido.',
   'Los flujos que solo contemplan el caso ideal se rompen en la primera semana real. Diseñar la excepción desde el inicio es lo que los mantiene en pie.',
   '¿Qué excepción de su proceso resuelven siempre a mano?'),

  (DATE '2026-10-21', TIME '10:00', 'behind_the_scenes', 'valor',
   'Medimos el éxito de una automatización en horas devueltas al equipo, no en cantidad de flujos.',
   'Un solo flujo bien elegido puede liberar más tiempo que diez marginales. Por eso la primera conversación es sobre dónde se va el tiempo, no sobre tecnología.',
   '¿En qué tarea se va más tiempo del que debería en su semana?'),

  (DATE '2026-10-23', TIME '10:00', 'casos_de_uso', 'valor',
   'Cuando el equipo crece, lo que antes se coordinaba hablando deja de funcionar.',
   'Con cinco personas alcanza con avisar. Con quince hace falta que el proceso avise solo, con responsables y estados claros.',
   '¿En qué momento del crecimiento notaron que la coordinación informal dejó de alcanzar?'),

  (DATE '2026-10-26', TIME '10:00', 'casos_de_uso', 'valor',
   'La factura que se emite tarde es la que se cobra tarde.',
   'Automatizar la emisión desde la orden confirmada acorta el ciclo de cobro sin contratar a nadie. El flujo de caja lo nota antes que la contabilidad.',
   '¿Cuántos días pasan entre que entregan y emiten la factura?'),

  (DATE '2026-10-28', TIME '10:00', 'behind_the_scenes', 'valor',
   'Trabajamos con las herramientas que la empresa ya paga antes de proponer una nueva.',
   'La mayoría de los equipos usa una fracción de lo que tiene contratado. Conectar bien lo existente suele resolver más que sumar otra suscripción.',
   '¿Cuántas herramientas pagan hoy que usan a menos de la mitad?'),

  (DATE '2026-10-30', TIME '10:00', 'prueba_social', 'conversion',
   'Octubre cierra y noviembre trae el pico de fin de año. Los procesos que hoy aguantan justo, en diciembre no aguantan.',
   'Preparar la operación antes del pico cuesta menos que apagar incendios durante. Los cuellos de botella ya se conocen, solo falta atacarlos con tiempo.',
   '¿Qué parte de su operación ya saben que va a sufrir en diciembre?')
),
planned AS (
  SELECT
    scheduled_date,
    scheduled_time,
    'meta'::text AS platform,
    -- prueba_social va en texto_largo: el compose omite el headline horneado y el
    -- mensaje lo carga el caption (politica 2026-07-17).
    CASE WHEN pillar = 'prueba_social' THEN 'texto_largo' ELSE 'imagen_copy' END::text AS format,
    pillar,
    post_type,
    headline || E'\n\n' || body || E'\n\n' || cta
      || CASE WHEN post_type = 'conversion'
              THEN E'\n\n👉 Agenda tu diagnóstico gratuito de 10 minutos.'
              ELSE '' END AS copy_text,
    -- Vacio a proposito: el Auditor deriva la escena del copy_text. Un prompt de
    -- mas de 20 chars aqui se usaria como fallback y pisaria esa derivacion.
    ''::text AS image_prompt,
    -- Set canonico 3-5 sin geo-lock (2026-07-17). Derivado de pillar/post_type en
    -- vez de escrito por fila, para que no pueda desalinearse.
    CASE
      WHEN post_type = 'conversion'
        THEN '#AutomatizaciónPymes #TransformaciónDigital #Emprendedores #Pymes'
      WHEN pillar IN ('casos_de_uso', 'prueba_social')
        THEN '#AutomatizaciónPymes #CasosDeÉxito #TransformaciónDigital'
      ELSE '#AutomatizaciónPymes #TransformaciónDigital #ProductividadPymes'
    END::text AS hashtags,
    -- Dominio limpio, sin UTMs ni fragment (2026-06-18).
    'https://jaagsolutions.com'::text AS cta_url
  FROM planned_raw
)
INSERT INTO content_plan (
  scheduled_date, scheduled_time, platform, format, pillar, post_type,
  vertical, copy_text, image_prompt, hashtags, cta_url, status
)
SELECT
  p.scheduled_date, p.scheduled_time, p.platform, p.format, p.pillar, p.post_type,
  'jaagsolutions_core', p.copy_text, p.image_prompt, p.hashtags, p.cta_url, 'pending'
FROM planned p
WHERE NOT EXISTS (
  SELECT 1 FROM content_plan cp
  WHERE cp.scheduled_date = p.scheduled_date
    AND cp.scheduled_time = p.scheduled_time
);

COMMIT;

-- Verificacion (debe devolver 33 filas pending, del 2026-08-17 al 2026-10-30):
-- SELECT scheduled_date, scheduled_time, pillar, post_type, format, status
-- FROM content_plan
-- WHERE scheduled_date BETWEEN DATE '2026-08-17' AND DATE '2026-10-30'
-- ORDER BY scheduled_date;
--
-- Runway (lo mismo que ahora vigila el monitor de las 08:15):
-- SELECT COUNT(*) AS posts, MAX(scheduled_date) AS hasta,
--        MAX(scheduled_date) - CURRENT_DATE AS dias
-- FROM content_plan WHERE status='pending' AND scheduled_date >= CURRENT_DATE;
