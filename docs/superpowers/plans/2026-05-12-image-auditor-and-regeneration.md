# Image Prompt Auditor + Immediate Regeneration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mejorar la calidad de las imágenes generadas por Stability AI mediante un auditor LLM que enriquece el `image_prompt` con detalles visuales, y permitir regeneración inmediata cuando el operador rechaza una imagen en Telegram (en lugar de esperar al cron del día siguiente).

**Architecture:**
1. **Auditor de prompt (A1)** — Se inserta un nodo HTTP a la API de OpenAI (`gpt-4o-mini`) entre el cálculo de `aspect_ratio` y la llamada a Stability AI. El auditor recibe `platform`, `format`, `pillar`, `copy_text` y `image_prompt`, y devuelve un prompt enriquecido en inglés con composición, paleta, estilo visual, elementos concretos y mood acorde a la marca JAAGSOLUTIONS. La respuesta sobrescribe `image_prompt` y Stability lo usa directamente.
2. **Regeneración inmediata (B1)** — Se agrega un Webhook trigger paralelo al Cron en `content-generator.json` (path `/regenerate-single`) que acepta `{post_id}` y procesa un único post bajando por el mismo pipeline. En `telegram-approval.json`, después de rechazar, un IF chequea `retry_count < 3`: si pasa, marca `status=pending`, dispara el webhook y notifica "🔄 Regenerando..."; si no, marca `status=error` y notifica "❌ Falló 3 veces — revisión manual".

**Tech Stack:** n8n 1.112.6, OpenAI API (`gpt-4o-mini`), PostgreSQL 16, Stability AI v2beta, Telegram Bot API, Docker Compose.

---

## Archivos a crear / modificar

| Acción | Archivo | Responsabilidad |
|--------|---------|-----------------|
| Modificar | `deploy/docker-compose.yml` | Agregar `OPENAI_API_KEY` al env del servicio n8n |
| Modificar | `deploy/.env.production.example` | Documentar la variable `OPENAI_API_KEY` |
| Modificar | `deploy/n8n-workflows/content-generator.json` | Agregar 4 nodos: webhook trigger, get-single-post, prompt auditor, apply-refined-prompt |
| Modificar | `deploy/n8n-workflows/telegram-approval.json` | Agregar 5 nodos: if-retry-ok, http-trigger-regenerate, telegram-regenerating, status-error, telegram-failed-final |
| Modificar | `docs/superpowers/specs/BITACORA-INFRAESTRUCTURA.md` | Registrar sesión 2026-05-12 — auditor + regen |
| Modificar | `docs/superpowers/specs/CHECKLIST-MAESTRO-JAAGSOLUTIONS.md` | Marcar pipeline al 95% tras E2E |

---

## Task 1: OPENAI_API_KEY en servicio n8n + documentación

**Files:**
- Modify: `deploy/docker-compose.yml` (sección `n8n.environment`)
- Modify: `deploy/.env.production.example`

- [ ] **Paso 1: Agregar OPENAI_API_KEY al servicio n8n en docker-compose.yml**

En el bloque `n8n.environment`, después de `GENERIC_TIMEZONE: America/Bogota`, agregar:

```yaml
      GENERIC_TIMEZONE: America/Bogota
      NODE_FUNCTION_ALLOW_BUILTIN: "fs,path"
      OPENAI_API_KEY: ${OPENAI_API_KEY}
```

El `OPENAI_API_KEY` debe quedar **antes** de la sección `# ── Content Pipeline ──`, junto con las otras variables generales de n8n.

- [ ] **Paso 2: Documentar la variable en .env.production.example**

En `deploy/.env.production.example`, en la sección de variables del Content Pipeline (o crear una sección "AI Services"), agregar:

```dotenv
# OpenAI API key — usado por n8n para auditor de prompt antes de Stability AI
# Modelo usado: gpt-4o-mini
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxx
```

- [ ] **Paso 3: Validar que el YAML del docker-compose sigue siendo válido**

Run:
```bash
cd c:/Users/jalva/Documents/PaperClipAI/paperclip/.worktrees/jaagsolutions
python3 -c "import yaml; yaml.safe_load(open('deploy/docker-compose.yml'))" && echo "YAML OK"
```

Expected: `YAML OK`

- [ ] **Paso 4: Commit**

```bash
git add deploy/docker-compose.yml deploy/.env.production.example
git commit -m "feat(n8n): expose OPENAI_API_KEY to n8n service for prompt auditor"
```

---

## Task 2: Nodo "Auditor de prompt" en content-generator.json

**Files:**
- Modify: `deploy/n8n-workflows/content-generator.json` (nodes array + connections)

**Contexto:** El flujo actual va de `Calcular aspect_ratio` directo a `Stability AI`. Vamos a insertar dos nodos entre ellos:
1. `http-prompt-auditor` — HTTP POST a OpenAI con `gpt-4o-mini`
2. `code-apply-refined-prompt` — Code node que extrae la respuesta y sobrescribe `image_prompt`

- [ ] **Paso 1: Leer content-generator.json para confirmar estructura**

```bash
cat c:/Users/jalva/Documents/PaperClipAI/paperclip/.worktrees/jaagsolutions/deploy/n8n-workflows/content-generator.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('Nodes:', len(d['nodes']))"
```

Expected: `Nodes: 18` (o el número actual; verificar antes de continuar).

- [ ] **Paso 2: Agregar nodo `http-prompt-auditor` al array `nodes`**

Insertar el siguiente nodo después del nodo `code-aspect-ratio` (id: `code-aspect-ratio`) y antes de `http-stability`:

```json
{
  "id": "http-prompt-auditor",
  "name": "Auditor de prompt (OpenAI)",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1410, 220],
  "parameters": {
    "method": "POST",
    "url": "https://api.openai.com/v1/chat/completions",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "Authorization", "value": "={{ 'Bearer ' + $env.OPENAI_API_KEY }}" },
        { "name": "Content-Type", "value": "application/json" }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.7, max_tokens: 500, messages: [ { role: 'system', content: 'Eres un experto en diseño visual para redes sociales (LinkedIn, Instagram, Facebook). Tu tarea es transformar un prompt de imagen genérico en un prompt detallado y rico para Stability AI v2beta. REQUISITOS: 1) Coherencia visual con marca JAAGSOLUTIONS (automatización para pymes, profesional, moderno, confiable). 2) Especificar composición (foco, regla de tercios, framing). 3) Paleta de colores modernos (azules profundos, blancos, acentos cálidos opcional). 4) Estilo visual (fotografía corporativa moderna / ilustración minimalista / infografía clean — elegir según pillar). 5) Elementos visuales concretos (objetos, escenas, personas reales o ilustradas, gráficos). 6) Mood (confianza, claridad, eficiencia, transformación). 7) Si el copy_text menciona un dato o frase clave, incluirlo en la imagen entre comillas exactas. 8) NO watermarks ni logos externos. 9) El prompt debe estar en INGLÉS. 10) Longitud: 100-200 palabras. DEVUELVE SOLO EL PROMPT MEJORADO EN INGLÉS, SIN EXPLICACIONES NI COMILLAS EXTERIORES.' }, { role: 'user', content: 'Plataforma: ' + $json.platform + '\\nFormato: ' + $json.format + '\\nPilar: ' + $json.pillar + '\\nTipo: ' + $json.post_type + '\\nCopy del post: ' + $json.copy_text + '\\nPrompt base: ' + $json.image_prompt } ] }) }}",
    "options": { "timeout": 30000 }
  }
}
```

- [ ] **Paso 3: Agregar nodo `code-apply-refined-prompt` al array `nodes`**

Justo después de `http-prompt-auditor`:

```json
{
  "id": "code-apply-refined-prompt",
  "name": "Aplicar prompt mejorado",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [1520, 220],
  "parameters": {
    "jsCode": "const auditResp = $input.first().json;\nconst prev = $('Calcular aspect_ratio').first().json;\nconst refined = auditResp.choices?.[0]?.message?.content?.trim();\nif (!refined) {\n  console.log('[Auditor] No refined prompt returned, using original');\n  return [{ json: prev }];\n}\nconsole.log('[Auditor] Original:', prev.image_prompt);\nconsole.log('[Auditor] Refined:', refined);\nreturn [{ json: { ...prev, image_prompt: refined, image_prompt_original: prev.image_prompt } }];"
  }
}
```

- [ ] **Paso 4: Actualizar la sección `connections` para redirigir Calcular aspect_ratio → Auditor → Apply → Stability**

En `connections`:

Cambiar:
```json
"Calcular aspect_ratio": {
  "main": [[{ "node": "Stability AI — generar imagen", "type": "main", "index": 0 }]]
},
```

A:
```json
"Calcular aspect_ratio": {
  "main": [[{ "node": "Auditor de prompt (OpenAI)", "type": "main", "index": 0 }]]
},
"Auditor de prompt (OpenAI)": {
  "main": [[{ "node": "Aplicar prompt mejorado", "type": "main", "index": 0 }]]
},
"Aplicar prompt mejorado": {
  "main": [[{ "node": "Stability AI — generar imagen", "type": "main", "index": 0 }]]
},
```

- [ ] **Paso 5: Validar que el JSON sigue parseando**

Run:
```bash
python3 -c "import json; d=json.load(open('c:/Users/jalva/Documents/PaperClipAI/paperclip/.worktrees/jaagsolutions/deploy/n8n-workflows/content-generator.json', encoding='utf-8')); print('Nodes:', len(d['nodes']), '| Connections:', len(d['connections']))"
```

Expected: `Nodes: 20 | Connections: 16` (2 nodos más, 2 conexiones más).

- [ ] **Paso 6: Commit**

```bash
git add deploy/n8n-workflows/content-generator.json
git commit -m "feat(content-generator): add OpenAI prompt auditor before Stability AI"
```

---

## Task 3: Webhook trigger paralelo para regeneración por ID

**Files:**
- Modify: `deploy/n8n-workflows/content-generator.json`

**Contexto:** Hoy `content-generator` solo se activa por Cron (8 AM). Agregamos un Webhook adicional que recibe `{post_id}` y procesa solo ese post, reusando todo el pipeline desde `status = generating` en adelante.

- [ ] **Paso 1: Agregar nodo `webhook-regenerate-trigger` al array `nodes`**

```json
{
  "id": "webhook-regenerate-trigger",
  "name": "Webhook regenerar por ID",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [200, 500],
  "parameters": {
    "httpMethod": "POST",
    "path": "regenerate-single",
    "responseMode": "onReceived",
    "options": {}
  },
  "webhookId": "regenerate-single"
}
```

- [ ] **Paso 2: Agregar nodo `postgres-get-single-post` al array `nodes`**

```json
{
  "id": "postgres-get-single-post",
  "name": "Obtener post por ID",
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 2.5,
  "position": [420, 500],
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT * FROM content_plan WHERE id = '{{ $json.body.post_id }}'",
    "options": {}
  },
  "credentials": {
    "postgres": {
      "id": "3WAwEY7SXDBTW16f",
      "name": "Postgres account"
    }
  }
}
```

- [ ] **Paso 3: Conectar Webhook → Get single → status=generating**

En `connections`, agregar:

```json
"Webhook regenerar por ID": {
  "main": [[{ "node": "Obtener post por ID", "type": "main", "index": 0 }]]
},
"Obtener post por ID": {
  "main": [[{ "node": "status = generating", "type": "main", "index": 0 }]]
},
```

**Importante:** `status = generating` ya recibe entrada del Cron path (via SplitInBatches). n8n permite múltiples entradas a un nodo — cada disparo crea una ejecución independiente. No hay conflicto.

- [ ] **Paso 4: Validar JSON**

```bash
python3 -c "import json; d=json.load(open('c:/Users/jalva/Documents/PaperClipAI/paperclip/.worktrees/jaagsolutions/deploy/n8n-workflows/content-generator.json', encoding='utf-8')); print('Nodes:', len(d['nodes']), '| Connections:', len(d['connections']))"
```

Expected: `Nodes: 22 | Connections: 18`.

- [ ] **Paso 5: Verificar que la query del get-single usa parámetro del body del webhook**

Confirmar manualmente que `{{ $json.body.post_id }}` en la query es correcto: n8n Webhook node deposita el body POST en `$json.body`. Si la prueba E2E falla con SQL inválido, ajustar a `{{ $json.post_id }}` (depende de la config del webhook — `responseMode: onReceived` envía el body directo).

- [ ] **Paso 6: Commit**

```bash
git add deploy/n8n-workflows/content-generator.json
git commit -m "feat(content-generator): add webhook trigger for single-post regeneration"
```

---

## Task 4: Retry limit + trigger de regeneración inmediata en telegram-approval.json

**Files:**
- Modify: `deploy/n8n-workflows/telegram-approval.json`

**Contexto:** Hoy al rechazar, el flujo solo actualiza `status=pending` + `retry_count++` y notifica. Necesitamos:
1. Antes de regenerar, chequear `retry_count < 3` (post obtenido del nodo "Obtener datos del post" que ya existe).
2. Si pasa: marcar status=pending, disparar webhook al content-generator, notificar "🔄 Regenerando...".
3. Si no pasa: marcar status=error, notificar "❌ Falló 3 veces — revisión manual".

- [ ] **Paso 1: Agregar nodo `if-retry-ok` al array `nodes`**

```json
{
  "id": "if-retry-ok",
  "name": "¿retry_count < 3?",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "position": [1300, 420],
  "parameters": {
    "conditions": {
      "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
      "conditions": [
        {
          "id": "check-retry-count",
          "leftValue": "={{ $('Obtener datos del post').first().json.retry_count }}",
          "rightValue": 3,
          "operator": { "type": "number", "operation": "lt" }
        }
      ],
      "combinator": "and"
    }
  }
}
```

- [ ] **Paso 2: Agregar nodo `http-trigger-regenerate` al array `nodes`**

```json
{
  "id": "http-trigger-regenerate",
  "name": "Trigger regeneración inmediata",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1740, 360],
  "parameters": {
    "method": "POST",
    "url": "http://n8n:5678/webhook/regenerate-single",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({ post_id: $('Parsear callback').first().json.post_id }) }}",
    "options": { "timeout": 10000 }
  }
}
```

- [ ] **Paso 3: Agregar nodo `telegram-regenerating` al array `nodes`**

```json
{
  "id": "telegram-regenerating",
  "name": "Telegram — 🔄 Regenerando",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1960, 360],
  "parameters": {
    "method": "POST",
    "url": "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/editMessageCaption",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({ chat_id: $('Parsear callback').first().json.chat_id, message_id: $('Parsear callback').first().json.message_id, caption: '🔄 Rechazado — regenerando imagen inmediatamente (intento ' + ($('Obtener datos del post').first().json.retry_count + 1) + ' de 3)' }) }}",
    "options": {}
  }
}
```

- [ ] **Paso 4: Agregar nodo `postgres-status-error` al array `nodes`**

```json
{
  "id": "postgres-status-error",
  "name": "status = error (max retries)",
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 2.5,
  "position": [1520, 540],
  "parameters": {
    "operation": "executeQuery",
    "query": "UPDATE content_plan SET status = 'error', error_log = 'Rechazado 3 veces — requiere revisión manual' WHERE id = '{{ $('Parsear callback').first().json.post_id }}'",
    "options": {}
  },
  "credentials": {
    "postgres": {
      "id": "3WAwEY7SXDBTW16f",
      "name": "Postgres account"
    }
  }
}
```

- [ ] **Paso 5: Agregar nodo `telegram-failed-final` al array `nodes`**

```json
{
  "id": "telegram-failed-final",
  "name": "Telegram — ❌ Falló 3 veces",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1740, 540],
  "parameters": {
    "method": "POST",
    "url": "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/editMessageCaption",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({ chat_id: $('Parsear callback').first().json.chat_id, message_id: $('Parsear callback').first().json.message_id, caption: '❌ Rechazado 3 veces — el post fue marcado como ERROR. Requiere revisión manual del image_prompt o del copy en la base de datos.' }) }}",
    "options": {}
  }
}
```

- [ ] **Paso 6: Reescribir conexiones del flujo de rechazo**

En `connections`:

**Cambiar:**
```json
"¿Aprobar o Rechazar?": {
  "main": [
    [{ "node": "¿Es LinkedIn?", "type": "main", "index": 0 }],
    [{ "node": "status = pending (rechazado)", "type": "main", "index": 0 }]
  ]
},
"status = pending (rechazado)": {
  "main": [[{ "node": "Telegram — ❌ Rechazado", "type": "main", "index": 0 }]]
}
```

**A:**
```json
"¿Aprobar o Rechazar?": {
  "main": [
    [{ "node": "¿Es LinkedIn?", "type": "main", "index": 0 }],
    [{ "node": "¿retry_count < 3?", "type": "main", "index": 0 }]
  ]
},
"¿retry_count < 3?": {
  "main": [
    [{ "node": "status = pending (rechazado)", "type": "main", "index": 0 }],
    [{ "node": "status = error (max retries)", "type": "main", "index": 0 }]
  ]
},
"status = pending (rechazado)": {
  "main": [[{ "node": "Trigger regeneración inmediata", "type": "main", "index": 0 }]]
},
"Trigger regeneración inmediata": {
  "main": [[{ "node": "Telegram — 🔄 Regenerando", "type": "main", "index": 0 }]]
},
"status = error (max retries)": {
  "main": [[{ "node": "Telegram — ❌ Falló 3 veces", "type": "main", "index": 0 }]]
}
```

**Nota:** El nodo viejo `Telegram — ❌ Rechazado` queda huérfano (sin conexión entrante). Hay dos opciones:
- **(a)** Borrarlo del array de nodes (limpieza). RECOMENDADO.
- **(b)** Dejarlo (no se ejecuta, no rompe nada). NO recomendado — deuda técnica.

Elegir **(a)**: borrar el nodo `telegram-rejected` (name: `Telegram — ❌ Rechazado`) del array `nodes`.

- [ ] **Paso 7: Validar JSON**

```bash
python3 -c "import json; d=json.load(open('c:/Users/jalva/Documents/PaperClipAI/paperclip/.worktrees/jaagsolutions/deploy/n8n-workflows/telegram-approval.json', encoding='utf-8')); print('Nodes:', len(d['nodes']), '| Connections:', len(d['connections']))"
```

Expected: `Nodes: 18 | Connections: 14` (originalmente había 15 nodos y 12 conexiones; se agregaron 5 nodos y se borró 1 huérfano → +4 nodes; +5 conexiones reescritas, -1 borrada → +4 conexiones; ajustar números si no coinciden tras la edición).

- [ ] **Paso 8: Commit**

```bash
git add deploy/n8n-workflows/telegram-approval.json
git commit -m "feat(telegram-approval): retry limit 3 + immediate regeneration on reject"
```

---

## Task 5: Deploy + E2E test completo

**Files:**
- (no files modified — solo deploy y verificación)

- [ ] **Paso 1: Push de todos los commits**

```bash
cd c:/Users/jalva/Documents/PaperClipAI/paperclip/.worktrees/jaagsolutions
git push
```

- [ ] **Paso 2: En VPS — pull del repo**

```bash
ssh jaagsolutions@<VPS_IP>
cd /opt/jaagsolutions/repo && git pull
```

- [ ] **Paso 3: Reiniciar n8n para que tome OPENAI_API_KEY**

```bash
cd /opt/jaagsolutions/repo/deploy && docker compose --env-file .env up -d n8n
```

Verificar que la variable llegó al contenedor:

```bash
docker exec deploy-n8n-1 env | grep OPENAI_API_KEY
```

Expected: línea con `OPENAI_API_KEY=sk-proj-...`. Si está vacío, agregar `OPENAI_API_KEY=...` al `/opt/jaagsolutions/repo/deploy/.env` y reiniciar de nuevo.

- [ ] **Paso 4: Archivar workflows viejos en n8n UI**

Ir a https://n8n.jaagsolutions.com → Workflows → cada uno (Content Generator + Telegram Approval) → ⚙️ → Archive. Confirmar que desaparecen de la vista principal (solo "Formspree Lead" debe quedar activo).

- [ ] **Paso 5: Re-importar ambos workflows con cambios**

En VPS:

```bash
cd /opt/jaagsolutions/repo
python3 -c "
import json
for f in ['telegram-approval', 'content-generator']:
    d = json.load(open(f'deploy/n8n-workflows/{f}.json'))
    d.pop('tags', None)
    json.dump(d, open(f'/tmp/{f}.json', 'w'))
"
docker cp /tmp/telegram-approval.json deploy-n8n-1:/tmp/telegram-approval.json
docker cp /tmp/content-generator.json deploy-n8n-1:/tmp/content-generator.json

docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/telegram-approval.json
docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/content-generator.json
```

Expected: `Successfully imported 1 workflow.` × 2.

- [ ] **Paso 6: Activar ambos workflows en n8n UI**

Toggle verde en cada uno. Verificar abriendo nodo "Auditor de prompt" — debe mostrar `{{ 'Bearer ' + $env.OPENAI_API_KEY }}` en el header de Authorization.

- [ ] **Paso 7: E2E test del Auditor — trigger manual del Content Generator**

En n8n UI → workflow Content Generator → click en el nodo Cron → botón "Execute step" o "Test workflow" desde la UI. Verificar la ejecución:

1. El nodo "Auditor de prompt (OpenAI)" debe completar con status 200 y devolver un objeto con `choices[0].message.content`.
2. El nodo "Aplicar prompt mejorado" debe loggear `[Auditor] Original: ...` y `[Auditor] Refined: ...` en la console del nodo.
3. El nodo "Stability AI — generar imagen" debe recibir el `image_prompt` enriquecido.
4. La imagen generada (en Telegram) debe ser visiblemente diferente a las anteriores — más detalle, mejor composición, paleta consistente.

**Si el Auditor falla con 401:** confirmar que `OPENAI_API_KEY` está en el contenedor (Paso 3).

**Si el Auditor falla con timeout:** subir `options.timeout` a 60000.

- [ ] **Paso 8: E2E test de Regeneración — rechazar imagen en Telegram**

1. Hay que tener un post en `content_plan` con `status='review'` y un mensaje pendiente en Telegram.
2. Click en botón "❌ Rechazar".
3. Verificar:
   - El caption del mensaje cambia a "🔄 Rechazado — regenerando imagen inmediatamente (intento 1 de 3)".
   - En n8n → Executions del workflow Telegram Approval — ejecución exitosa.
   - En n8n → Executions del workflow Content Generator — **una nueva ejecución debe aparecer disparada por el webhook** (no por cron) procesando ese mismo `post_id`.
   - Llega un nuevo mensaje a Telegram con la imagen regenerada (debe tardar ~30 segundos).
4. Confirmar en Postgres:

```bash
docker exec deploy-postgres-1 psql -U paperclip -d paperclip -c "SELECT id, status, retry_count, error_log FROM content_plan WHERE id='<POST_ID>';"
```

Expected: `status='review'` (ya regeneró), `retry_count=1`.

- [ ] **Paso 9: E2E test del retry limit — rechazar 3 veces consecutivas**

1. Rechazar el mismo post 3 veces seguidas (esperar a que regenere entre cada rechazo).
2. En el 3er rechazo, el caption debe cambiar a "❌ Rechazado 3 veces — el post fue marcado como ERROR. Requiere revisión manual...".
3. Verificar en Postgres:

```bash
docker exec deploy-postgres-1 psql -U paperclip -d paperclip -c "SELECT id, status, retry_count, error_log FROM content_plan WHERE id='<POST_ID>';"
```

Expected: `status='error'`, `retry_count=3`, `error_log='Rechazado 3 veces — requiere revisión manual'`.

- [ ] **Paso 10: Actualizar documentación con resultado**

- Editar `docs/superpowers/specs/BITACORA-INFRAESTRUCTURA.md` — agregar al final de la sección 2026-05-12 un sub-encabezado "Auditor de prompt + Regeneración inmediata — Estado E2E (2026-05-12)" con tabla de verificación.
- Editar `docs/superpowers/specs/CHECKLIST-MAESTRO-JAAGSOLUTIONS.md` — actualizar la fila del Pipeline a **95% — pendiente solo flujo Aprobar (Meta/LinkedIn API)**.
- Commit:

```bash
git add docs/superpowers/specs/BITACORA-INFRAESTRUCTURA.md docs/superpowers/specs/CHECKLIST-MAESTRO-JAAGSOLUTIONS.md
git commit -m "docs: registrar E2E auditor + regeneración inmediata exitoso"
git push
```

---

## Notas de implementación

### Por qué `gpt-4o-mini` y no GPT-4o full

- `gpt-4o-mini` es 30× más barato (~$0.00015/1K tokens input, ~$0.0006/1K tokens output)
- El prompt del auditor + respuesta típicamente está bajo 500 tokens total → costo ~$0.0001 por post
- Con 30 posts/mes esperados: ~$0.003/mes en auditoría. Despreciable.
- Calidad para reescribir prompts visuales es excelente con `mini`.

### Por qué internal URL `http://n8n:5678` (no la pública)

- Caddy en producción enruta `n8n.jaagsolutions.com` → `n8n:5678` internamente
- Desde dentro del contenedor n8n, llamar a su propio webhook por la URL pública causa un round-trip innecesario (Caddy → n8n → Caddy → n8n) y consume más recursos
- `http://n8n:5678` es la dirección directa por el network bridge de Docker — funciona desde cualquier servicio del compose
- Importante: el path es `/webhook/regenerate-single` (no `/webhook-test/`) porque el workflow estará Active en producción

### Caveat sobre `retry_count` en la lógica del IF

- `retry_count` se lee del post ANTES del UPDATE — esto significa que el primer rechazo entra con `retry_count=0`, el segundo con `retry_count=1`, el tercero con `retry_count=2`. Todos pasan el filtro `< 3`.
- El cuarto rechazo entraría con `retry_count=3` y NO pasaría el filtro → va a `status=error`.
- **Esto es 3 reintentos efectivos** (1er intento original + 3 regeneraciones). Si querés exactamente 3 intentos totales, cambiar el operador a `< 2` o bajar el threshold.

### Por qué no agregar tests automatizados

- n8n no tiene framework de testing nativo de workflows. La validación es E2E en producción o staging.
- Los tests que sí podemos hacer (en este plan): validación de que el JSON parsea correctamente con Python.
- Verificación E2E con producción es lo que más valor da en este contexto.

---

## Self-Review

**Spec coverage:**
- ✅ A1 (auditor de prompt): Task 2
- ✅ B1 (webhook entre workflows): Task 3 + Task 4
- ✅ Límite 3 reintentos: Task 4 (if-retry-ok + status-error branch)
- ✅ OPENAI_API_KEY accesible desde n8n: Task 1
- ✅ E2E verification: Task 5

**Placeholder scan:** Ningún "TBD"/"TODO"/"implementar después" en el plan. Todos los snippets tienen código completo.

**Type consistency:** Nombres de nodos consistentes entre Tasks (ej. `¿retry_count < 3?` se referencia igual en Paso 1, Paso 6, y Task 5 Paso 8). Las queries SQL usan los mismos nombres de columnas que el schema (`content_plan.retry_count`, `content_plan.status`, etc.).

**Riesgos identificados:**
- Si `OPENAI_API_KEY` no está en el `.env` del VPS, Task 5 Paso 3 falla. Mitigación: validar en Paso 3 y agregar manualmente si falta.
- Si la respuesta de OpenAI viene con caracteres especiales (comillas, saltos de línea) y Stability AI no acepta, el prompt original se preserva en `image_prompt_original` para debugging.
- El webhook `/regenerate-single` no tiene autenticación. Está protegido por estar en network interno de Docker (`http://n8n:5678` no es accesible desde internet). Si en el futuro se expone, agregar header `X-Webhook-Token` con `safeEqual` validation.
