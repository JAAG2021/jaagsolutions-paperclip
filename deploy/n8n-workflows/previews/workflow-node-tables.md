# Tabla de nodos y colores definidos para canvas

Tabla adaptada a la paleta disponible de 7 colores del canvas.

## Leyenda

| Nombre del color | Tipo / uso | Código | Descripción |
|---|---|---|---|
| Oliva | Decisión / control de flujo | `#4A3F17` | IF, validación, split o control operativo del recorrido |
| Café | Archivo / composición | `#4B351F` | Imagen local, binario, compose-image.js, Sharp/SVG |
| Vino | Error / alerta | `#6A2D2D` | Fallo, error, alerta, posts atascados o revisión manual |
| Verde oscuro | Entrada / disparador | `#184B36` | Cron, webhook o punto de entrada |
| Azul marino | API externa / IA / Telegram | `#173656` | OpenAI, Ideogram, Meta, LinkedIn, HTTP o Telegram |
| Morado | Base de datos / estado | `#403A5C` | Lectura/escritura en content_plan o estados operativos |
| Gris | Lógica / transformación | `#4B5358` | Code node para preparar, parsear o transformar datos |

## Content Generator — Ideogram + Sharp Compose → Telegram

| Paso | Nodo | Qué hace | Nombre del color | Tipo / uso | Código color |
|---:|---|---|---|---|---|
| 01 | Cron 8 AM diario | Dispara el flujo principal todos los dias a las 8:00 AM. No recibe datos externos; solo inicia la busqueda del siguiente post pendiente en content_plan. | Verde oscuro | Entrada / disparador | `#184B36` |
| 02 | Obtener posts pendientes | Consulta PostgreSQL para traer un solo post con status pending programado para la fecha actual. Ordena por scheduled_time para procesar primero el contenido que toca antes. | Morado | Base de datos / estado | `#403A5C` |
| 03 | ¿Hay posts? | Verifica si la consulta devolvio un id. Si hay post, continua con la generacion. Si no hay filas, el workflow termina sin hacer cambios. | Oliva | Decisión / control de flujo | `#4A3F17` |
| 04 | Procesar 1 post a la vez | Nodo preparado para procesar posts uno por uno si la consulta devuelve varios registros. En este export el query usa LIMIT 1 y la ruta activa no pasa por este nodo. | Oliva | Decisión / control de flujo | `#4A3F17` |
| 05 | status = generating | Actualiza el registro a status generating. Este cambio marca que el post ya fue tomado por n8n y evita que quede como pendiente mientras se genera la pieza. | Morado | Base de datos / estado | `#403A5C` |
| 06 | Calcular aspect_ratio | Calcula el aspect_ratio que Ideogram acepta segun platform y format. La mayoria usa ASPECT_3_4 y luego compose-image.js adapta el arte final a formato social. | Gris | Lógica / transformación | `#4B5358` |
| 07 | Preparar prompt Auditor | Construye el brief visual para el auditor creativo. Usa el pilar del contenido, el copy y variantes de escena para pedir una direccion visual mas segura y consistente. | Gris | Lógica / transformación | `#4B5358` |
| 08 | Auditor de prompt (OpenAI) | Llama a OpenAI Chat Completions para refinar el prompt visual antes de generar la imagen. Su salida debe mejorar composicion, seguridad visual y consistencia B2B. | Azul marino | API externa / IA / Telegram | `#173656` |
| 09 | Aplicar prompt mejorado | Toma la respuesta del auditor y reemplaza image_prompt por el prompt refinado. Si OpenAI no devuelve contenido util, conserva el prompt original para no bloquear el flujo. | Gris | Lógica / transformación | `#4B5358` |
| 10 | Ideogram + OCR - fallback seguro | Genera imagenes con Ideogram y aplica QA automatico. Reintenta hasta 6 veces, usa fallback seguro desde el intento 3, revisa texto con Google Vision OCR y anatomia con OpenAI si hay API key. | Azul marino | API externa / IA / Telegram | `#173656` |
| 11 | ¿Error OCR? | Evalua si la generacion fallo por OCR/anatomia despues de los reintentos. True lleva a error operativo; False continua a composicion final. | Vino | Error / alerta | `#6A2D2D` |
| 12 | Preparar input compose | Prepara el archivo temporal /tmp/n8n_compose.json con los datos del post, URL de imagen limpia, copy, CTA y formato. Ese archivo alimenta el script de composicion. | Café | Archivo / composición | `#4B351F` |
| 13 | Exec: compose-image.js | Ejecuta compose-image.js dentro del contenedor n8n. El script usa Sharp/SVG para descargar la imagen base, adaptarla y producir la pieza final en disco. | Café | Archivo / composición | `#4B351F` |
| 14 | Componer imagen final (Sharp + SVG) | Lee el stdout del script de composicion, valida que haya salida y devuelve al workflow los campos finales como image_path e image_url. | Café | Archivo / composición | `#4B351F` |
| 15 | Guardar image_path | Guarda en content_plan la URL publica de la imagen final. Aunque el nodo se llama image_path, la query actual actualiza image_url. | Morado | Base de datos / estado | `#403A5C` |
| 16 | status = review | Cambia el post a status review. Desde este punto el contenido ya esta generado y queda pendiente de decision humana en Telegram. | Morado | Base de datos / estado | `#403A5C` |
| 17 | Preparar binario Telegram | Lee el archivo final desde image_path y lo adjunta como binario photo para Telegram. Tambien conserva los datos del post para construir caption y botones. | Café | Archivo / composición | `#4B351F` |
| 18 | Telegram — enviar para aprobación | Envia la imagen al chat de Telegram con caption, copy, CTA, hashtags y dos botones: Aprobar o Rechazar. Este es el punto de control humano. | Azul marino | API externa / IA / Telegram | `#173656` |
| 19 | ¿Falló Telegram send? | Revisa si la respuesta de Telegram contiene error. Si fallo el envio, se registra error en DB y se alerta; si fue exitoso, se guarda el message_id. | Vino | Error / alerta | `#6A2D2D` |
| 20 | Guardar telegram_msg_id | Guarda telegram_msg_id en content_plan. Ese id permite que el workflow de aprobacion edite luego el mismo mensaje al publicar o regenerar. | Morado | Base de datos / estado | `#403A5C` |
| 21 | DB: error Telegram send | Marca el post como error si Telegram sendPhoto fallo. Esto evita que el contenido quede en review sin mensaje visible para aprobar. | Vino | Error / alerta | `#6A2D2D` |
| 22 | Telegram: alerta fallo envío | Envia una alerta por Telegram indicando que no se pudo mandar el post para aprobacion. Sirve para intervencion operativa rapida. | Vino | Error / alerta | `#6A2D2D` |
| 23 | status=error (OCR) | Actualiza content_plan con status error y guarda el detalle del fallo de QA/OCR. Se usa cuando no se logro una imagen limpia despues de todos los intentos. | Vino | Error / alerta | `#6A2D2D` |
| 24 | Telegram: error OCR | Notifica por Telegram que la generacion fallo por OCR/anatomia. El operador sabe que el post requiere revision manual o ajuste de prompt. | Vino | Error / alerta | `#6A2D2D` |
| 25 | Webhook regenerar por ID | Recibe POST /webhook/regenerate-single desde el workflow de aprobacion cuando Juan rechaza una pieza y aun quedan reintentos disponibles. | Verde oscuro | Entrada / disparador | `#184B36` |
| 26 | Obtener post por ID | Busca en content_plan el post exacto indicado por body.post_id. Luego lo reinyecta en la misma ruta de generacion que usa el cron diario. | Morado | Base de datos / estado | `#403A5C` |
| 27 | Monitor post-cron 8:15 | Dispara un control automatico despues del cron principal. Su funcion es detectar si el proceso matutino dejo publicaciones atascadas. | Verde oscuro | Entrada / disparador | `#184B36` |
| 28 | Monitor: posts atascados hoy | Consulta posts de hoy en pending, generating, error o review sin telegram_msg_id. Es la lista de casos que necesitan atencion operativa. | Vino | Error / alerta | `#6A2D2D` |
| 29 | Monitor: preparar alerta Telegram | Convierte los posts atascados en un mensaje breve para Telegram. Si no hay filas, devuelve vacio y no dispara alerta. | Vino | Error / alerta | `#6A2D2D` |
| 30 | Telegram: alerta post-cron | Envia la alerta post-cron al chat de Telegram. Ayuda a detectar fallos silenciosos antes de que se pierda la ventana de publicacion. | Vino | Error / alerta | `#6A2D2D` |

## Telegram Approval → Meta + LinkedIn Publisher

| Paso | Nodo | Qué hace | Nombre del color | Tipo / uso | Código color |
|---:|---|---|---|---|---|
| 01 | Webhook Telegram Callback | Recibe el callback de Telegram cuando el operador toca Aprobar o Rechazar en el mensaje del post. Es la entrada publica del flujo de decision. | Verde oscuro | Entrada / disparador | `#184B36` |
| 02 | Parsear callback | Extrae action y post_id desde callback_data. Tambien guarda callback_query_id, message_id y chat_id para responder y editar el mensaje original. | Azul marino | API externa / IA / Telegram | `#173656` |
| 03 | Telegram — answerCallbackQuery | Responde a Telegram con answerCallbackQuery para cerrar el estado de carga del boton. El usuario ve que la accion esta siendo procesada. | Azul marino | API externa / IA / Telegram | `#173656` |
| 04 | Obtener datos del post | Busca en content_plan el post aprobado o rechazado. Desde aqui el workflow recupera platform, copy_text, image_path, hashtags, retry_count y metadata. | Morado | Base de datos / estado | `#403A5C` |
| 05 | ¿Aprobar o Rechazar? | Separa la decision humana. Si action es aprobar, avanza a publicacion. Si action es rechazar, entra al control de reintentos y regeneracion. | Oliva | Decisión / control de flujo | `#4A3F17` |
| 06 | ¿Es LinkedIn? | Detecta si platform es linkedin. Si es LinkedIn, salta directo a la cadena de publicacion LinkedIn; si no, pasa primero por Meta/IG/FB. | Oliva | Decisión / control de flujo | `#4A3F17` |
| 07 | ¿Es Meta/IG/FB? | Valida la ruta no-LinkedIn. Todo platform distinto de linkedin se trata como publicacion Meta: Facebook Page e Instagram Business antes de continuar a LinkedIn. | Oliva | Decisión / control de flujo | `#4A3F17` |
| 08 | Leer imagen (FB) | Lee desde disco la imagen final del post para usarla como binario en la subida a Facebook. La ruta se basa en el post_id. | Café | Archivo / composición | `#4B351F` |
| 09 | Meta FB — subir foto | Sube la imagen a la Facebook Page usando Meta Graph API. Incluye caption construido desde copy_text, CTA y hashtags. | Azul marino | API externa / IA / Telegram | `#173656` |
| 10 | Meta IG — crear container | Crea el media container de Instagram Business con la URL publica de la imagen y el caption. Es el paso previo obligatorio antes de publicar en IG. | Azul marino | API externa / IA / Telegram | `#173656` |
| 11 | Esperar IG container | Espera unos segundos para que Meta termine de procesar el container. Evita errores de media_publish cuando el asset aun no esta disponible. | Gris | Lógica / transformación | `#4B5358` |
| 12 | Meta IG — publicar | Publica el container en Instagram Business mediante media_publish. Al terminar, la ruta continua hacia LinkedIn para completar distribucion multicanal. | Azul marino | API externa / IA / Telegram | `#173656` |
| 13 | LinkedIn — register upload | Registra en LinkedIn un asset de imagen y obtiene uploadUrl y asset URN. Es necesario antes de subir el binario y crear el post. | Azul marino | API externa / IA / Telegram | `#173656` |
| 14 | Leer imagen (LinkedIn) | Lee la imagen final desde disco para la subida a LinkedIn personal. Usa el mismo archivo generado por el workflow de contenido. | Café | Archivo / composición | `#4B351F` |
| 15 | LinkedIn — subir imagen | Sube el binario de imagen al uploadUrl devuelto por LinkedIn. Este paso deja el asset listo para publicarse en un UGC post. | Azul marino | API externa / IA / Telegram | `#173656` |
| 16 | LinkedIn — publicar post | Publica el post en el perfil personal configurado por LINKEDIN_AUTHOR_URN. El texto combina copy, CTA si falta en el copy y hashtags. | Azul marino | API externa / IA / Telegram | `#173656` |
| 17 | LinkedIn Org — register upload | Registra un segundo asset para la organizacion de LinkedIn. Separa la publicacion personal de la publicacion corporativa. | Azul marino | API externa / IA / Telegram | `#173656` |
| 18 | Leer imagen (LinkedIn Org) | Lee nuevamente la imagen final para subirla como asset de la organizacion. Mantiene el mismo creativo aprobado. | Café | Archivo / composición | `#4B351F` |
| 19 | LinkedIn Org — subir imagen | Sube la imagen al uploadUrl del asset de LinkedIn Organization. Prepara el recurso multimedia para la publicacion corporativa. | Azul marino | API externa / IA / Telegram | `#173656` |
| 20 | LinkedIn Org — publicar post | Publica el post en la organizacion configurada por LINKEDIN_ORGANIZATION_URN. Completa la salida LinkedIn corporativa. | Azul marino | API externa / IA / Telegram | `#173656` |
| 21 | status = published | Marca el registro como published y guarda published_at. Este es el cierre operacional en content_plan despues de publicar en los canales. | Morado | Base de datos / estado | `#403A5C` |
| 22 | Telegram — ✅ Publicado | Edita el mensaje original de Telegram para mostrar que el post fue publicado. Da confirmacion visible al operador sin crear un nuevo mensaje. | Azul marino | API externa / IA / Telegram | `#173656` |
| 23 | ¿retry_count < 3? | En la rama de rechazo, revisa si retry_count es menor que 3. Si aun hay margen, regenera; si no, manda el post a error manual. | Oliva | Decisión / control de flujo | `#4A3F17` |
| 24 | status = pending (rechazado) | Cuando se rechaza y quedan intentos, vuelve el post a pending e incrementa retry_count. Esto habilita una nueva generacion controlada. | Morado | Base de datos / estado | `#403A5C` |
| 25 | Trigger regeneración inmediata | Llama al webhook interno /webhook/regenerate-single del Content Generator con el post_id. Asi dispara regeneracion inmediata sin esperar al proximo cron. | Azul marino | API externa / IA / Telegram | `#173656` |
| 26 | Telegram — 🔄 Regenerando | Edita el mensaje de Telegram indicando que la pieza se esta regenerando. Mantiene al operador informado dentro del mismo hilo de aprobacion. | Azul marino | API externa / IA / Telegram | `#173656` |
| 27 | status = error (max retries) | Si el post fue rechazado 3 veces, lo marca como error y registra que requiere revision manual. Evita un loop infinito de regeneracion. | Vino | Error / alerta | `#6A2D2D` |
| 28 | Telegram — ❌ Falló 3 veces | Edita Telegram para avisar que el post fallo despues de 3 rechazos. El siguiente paso ya no es automatico: requiere intervencion humana. | Vino | Error / alerta | `#6A2D2D` |

## Formspree Lead → Paperclip Issue

| Paso | Nodo | Qué hace | Nombre del color | Tipo / uso | Código color |
|---:|---|---|---|---|---|
| 01 | Webhook Formspree | Recibe el POST del formulario web enviado por Formspree. Es el punto de entrada para leads comerciales desde jaagsolutions.com. | Verde oscuro | Entrada / disparador | `#184B36` |
| 02 | Validar webhook (secreto / firma) | Valida el origen del webhook usando FORMSPREE_WEBHOOK_SECRET, headers o query token. Tambien puede verificar FORMSPREE_FORM_HASHID si esta configurado. | Gris | Lógica / transformación | `#4B5358` |
| 03 | Construir issue Paperclip | Normaliza los campos del formulario y construye el issue de Paperclip: titulo, descripcion, prioridad, agente asignado, proyecto y goal comercial. | Gris | Lógica / transformación | `#4B5358` |
| 04 | POST Paperclip issue | Hace POST a la API de Paperclip con Authorization Bearer. Crea el issue dentro de la company configurada para que el equipo lo trabaje. | Azul marino | API externa / IA / Telegram | `#173656` |
| 05 | ¿Issue creado? | Comprueba si Paperclip devolvio un id de issue. Si existe, la creacion fue exitosa; si no, envia la ejecucion a la rama de error. | Oliva | Decisión / control de flujo | `#4A3F17` |
| 06 | Log éxito | Registra en logs que el issue fue creado correctamente. Ayuda a auditar que el lead entro al sistema operativo. | Gris | Lógica / transformación | `#4B5358` |
| 07 | Log error | Registra en error log la respuesta recibida cuando Paperclip no crea el issue. Sirve para diagnosticar auth, payload o fallos de API. | Vino | Error / alerta | `#6A2D2D` |
