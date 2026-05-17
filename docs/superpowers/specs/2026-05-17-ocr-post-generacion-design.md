# OCR Post-Generación — Google Vision API
**Fecha:** 2026-05-17
**Issue:** Fix #7 deferred — Fase 2 Content Pipeline
**Agente responsable:** A2 — Automation Builder
**Workflow afectado:** Content Generator (`diB9nJOsjSzYbujt`)

---

## Contexto

El workflow Content Generator genera imágenes con Ideogram V_2 usando un `negative_prompt` explícito ("no text, no letters, no numbers...") y el Auditor de prompt (OpenAI) refuerza la instrucción de imagen sin texto. Sin embargo, Ideogram puede generar ocasionalmente imágenes con texto baked-in.

Sin esta validación, un post con texto en la imagen pasa directamente a compose-image.js, que agrega el overlay de copy — resultando en imagen con texto duplicado o ilegible, enviada a Telegram para aprobación y eventualmente publicada.

`GOOGLE_VISION_API_KEY` ya está configurada en `deploy/.env` y disponible en el contenedor n8n como `$env.GOOGLE_VISION_API_KEY`.

---

## Objetivo

Agregar validación OCR sobre la imagen raw de Ideogram antes de pasarla a compose-image.js. Si se detecta texto baked-in: regenerar automáticamente hasta 3 veces en la misma ejecución. Si los 3 intentos fallan: marcar el post como `error` en la DB y notificar por Telegram.

---

## Punto de inserción

Entre los nodos:
- `Aplicar prompt mejorado` (upstream — provee `image_prompt`, `aspect_ratio` y todo el post data)
- `Preparar input compose` (downstream — lee la URL de imagen y el post data)

El OCR debe aplicarse sobre la imagen **raw de Ideogram**, antes de que compose-image.js agregue el overlay de texto legítimo.

---

## Arquitectura

### Cambios al workflow

| Acción | Nodo | Detalle |
|--------|------|---------|
| REEMPLAZAR | `Ideogram — generar imagen (sin texto)` | Reemplazado por Code node combinado |
| AGREGAR | `IF: ¿Error OCR?` | Branch post-generación |
| AGREGAR | `Postgres: status=error (OCR)` | Marca error en DB |
| AGREGAR | `Telegram: notificar error OCR` | Aviso texto a Juan |

### Flujo resultante

```
[Aplicar prompt mejorado]
        ↓
[Code: Ideogram + OCR — 3 intentos]   ← REEMPLAZA HTTP Ideogram
        ↓
[IF: ¿Error OCR?]
    ├── TRUE  → [Postgres: status=error (OCR)]
    │                   ↓
    │           [Telegram: notificar error OCR]
    │                   ↓
    │           [Procesar 1 post a la vez]  (loop al siguiente)
    │
    └── FALSE → [Preparar input compose] → (flujo existente sin cambios)
```

---

## Especificación de nodos

### Code: Ideogram + OCR — 3 intentos

**Reemplaza:** `HTTP Request: Ideogram — generar imagen (sin texto)`

**Entradas disponibles:**
- `$input.first().json` → output de `Aplicar prompt mejorado` (contiene `image_prompt`, `aspect_ratio`, `id`, `copy_text`, `platform`, `pillar`, `hashtags`, `scheduled_date`, etc.)

**Variables de entorno usadas:**
- `$env.IDEOGRAM_API_KEY`
- `$env.GOOGLE_VISION_API_KEY`

**Lógica:**

```
const https = require('https');
const prev = $input.first().json;
const MAX_ATTEMPTS = 3;

function httpsPost(hostname, path, body, headers) → Promise<object>
  // wrapper sobre https.request con soporte JSON

async function generateIdeogram(prompt, aspectRatio):
  seed = random int 0..2147483647
  styleType = aleatorio ponderado: REALISTIC 50% / GENERAL 33% / 3D_RENDER 17%
  POST api.ideogram.ai/generate con:
    prompt, aspect_ratio, model=V_2, magic_prompt_option=OFF,
    seed, style_type, negative_prompt (igual al nodo actual)
  retorna data[0].url

async function checkOCR(imageUrl):
  POST vision.googleapis.com/v1/images:annotate?key={VISION_KEY} con:
    image.source.imageUri = imageUrl
    features = [{ type: TEXT_DETECTION, maxResults: 10 }]
  extrae responses[0].textAnnotations[0].description
  retorna { hasText: description.length > 2, detectedText: description }
  si Vision API falla: retorna { hasText: false, detectedText: '' }  // fail open

loop attempt = 1..3:
  url = await generateIdeogram(prev.image_prompt, prev.aspect_ratio)
  si url vacía: throw Error('Ideogram sin URL en intento N')
  ocr = await checkOCR(url)
  si !ocr.hasText:
    imageUrl = url  // imagen limpia
    break
  log: '[OCR] Intento N: texto detectado — "..."'
  lastError = 'Intento N: texto detectado — "..."'

si imageUrl encontrada:
  return [{ json: { ...prev, data: [{ url: imageUrl }] } }]
sino:
  return [{ json: { ...prev, ocr_error: true, ocr_error_log: 'OCR: 3 intentos fallidos. Último: ...' } }]
```

**Output éxito:** `{ ...prevData, data: [{ url: cleanImageUrl }] }`
Formato idéntico al nodo HTTP de Ideogram — `Preparar input compose` no necesita cambios.

**Output error:** `{ ...prevData, ocr_error: true, ocr_error_log: '...' }`

**Umbral de rechazo:** `text_annotations[0].description.length > 2`
Descarta falsos positivos de caracteres únicos (un solo símbolo en imagen real).

**Vision API falla:** fail open — se loguea el error y se considera la imagen como limpia. El OCR no debe bloquear el flujo por fallas externas.

---

### IF: ¿Error OCR?

**Condición:** `{{ $json.ocr_error }}` is `true`

- **TRUE** → rama de error
- **FALSE** → `Preparar input compose` (flujo existente)

---

### Postgres: status=error (OCR)

```sql
UPDATE content_plan
SET status = 'error',
    error_log = '{{ $json.ocr_error_log }}'
WHERE id = '{{ $json.id }}'
```

---

### Telegram: notificar error OCR

**Método:** `sendMessage` (texto, sin foto)
**URL:** `https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendMessage`
**Body:**

```
chat_id: {{ $env.TELEGRAM_CHAT_ID }}
text:
⚠️ Error OCR — post no procesado
📅 {scheduled_date} | {platform} — {pillar}
🔍 Texto detectado en 3 intentos: "{ocr_error_log}"
🆔 {id}

Acción: revisar manualmente en content_plan o resetear para reintentar.
parse_mode: (ninguno — texto plano)
```

---

## Consideraciones y restricciones

**URLs de Ideogram:** temporales (~24h). El OCR se ejecuta inmediatamente tras la generación — sin riesgo de expiración.

**`retry_count` en DB:** no se usa para el loop OCR (es interno al Code node). Permanece disponible para otras fallas futuras del flujo.

**Comportamiento de `Preparar input compose`:** sin cambios. Sigue leyendo `$input.first().json.data[0].url` y `$('Calcular aspect_ratio').first().json` para el post data.

**Costo estimado OCR:** ~$0 (free tier Google Vision: 1000 imágenes/mes). Generación Ideogram: $0.08/imagen × máximo 3 = $0.24 por post en peor caso.

**Ruta de retorno en error:** desde `Telegram: notificar error OCR` → `Procesar 1 post a la vez` para continuar con el siguiente post del batch.

---

## Criterios de aceptación

- [ ] Code node reemplaza el HTTP node de Ideogram sin romper `Preparar input compose`
- [ ] En imagen limpia: flujo continúa normalmente, ningún cambio observable
- [ ] En imagen con texto (intento 1 o 2): regenera automáticamente sin intervención
- [ ] En 3 intentos fallidos: `content_plan.status = 'error'`, `error_log` con detalle del texto detectado
- [ ] En 3 intentos fallidos: mensaje Telegram recibido en el chat de Juan con ID del post y texto detectado
- [ ] Vision API caída: imagen pasa igual (fail open), log en consola n8n
- [ ] Workflow transplantado a n8n producción vía REST API (preservando ID `diB9nJOsjSzYbujt`)
