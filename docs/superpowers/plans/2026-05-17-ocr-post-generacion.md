# OCR Post-Generación — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el nodo HTTP de Ideogram en el workflow Content Generator por un Code node que valida OCR (Google Vision) en la misma ejecución, con 3 reintentos automáticos y notificación Telegram en error.

**Architecture:** Un Python script modifica `content-generator.json` programáticamente (evita errores de escaping manual en el jsCode). El JSON actualizado se transplanta a n8n producción vía REST API preservando el workflow ID `diB9nJOsjSzYbujt`.

**Tech Stack:** n8n workflow JSON, Node.js `https` builtin, Google Vision API v1, Ideogram API v1, n8n REST API, Python 3 (modificación de JSON)

---

### Task 1: Verificar Google Vision API key en producción

**Files:** ninguno — verificación operacional via curl en VPS

- [ ] **Step 1: Probar Vision con imagen que tiene texto**

En el VPS:

```bash
VISION_KEY=$(grep GOOGLE_VISION_API_KEY /opt/jaagsolutions/repo/deploy/.env | cut -d= -f2)

curl -s -X POST \
  "https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"requests":[{"image":{"source":{"imageUri":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Hello_World_Brian_Kernighan_1978.jpg/320px-Hello_World_Brian_Kernighan_1978.jpg"}},"features":[{"type":"TEXT_DETECTION","maxResults":10}]}]}' \
  | python3 -c "import sys,json; r=json.load(sys.stdin); a=r.get('responses',[{}])[0].get('textAnnotations',[]); print('Texto detectado:', repr(a[0]['description'][:80]) if a else 'ERROR: ningún texto')"
```

Resultado esperado: `Texto detectado: 'main()\n{\n...'` (la imagen contiene código C).
Si aparece `"error"` en el JSON: la key no es válida — detener.

- [ ] **Step 2: Probar Vision con imagen sin texto**

```bash
VISION_KEY=$(grep GOOGLE_VISION_API_KEY /opt/jaagsolutions/repo/deploy/.env | cut -d= -f2)

curl -s -X POST \
  "https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"requests":[{"image":{"source":{"imageUri":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"}},"features":[{"type":"TEXT_DETECTION","maxResults":10}]}]}' \
  | python3 -c "import sys,json; r=json.load(sys.stdin); a=r.get('responses',[{}])[0].get('textAnnotations',[]); d=(a[0]['description'] if a else ''); print('hasText:', len(d)>2, '| desc:', repr(d[:30]))"
```

Resultado esperado: `hasText: False | desc: ''` (imagen de montaña, sin texto significativo).

---

### Task 2: Crear script Python de modificación del workflow JSON

**Files:**
- Create: `deploy/scripts/update-content-generator-ocr.py`

- [ ] **Step 1: Crear el script**

Crear `deploy/scripts/update-content-generator-ocr.py` con el siguiente contenido:

```python
#!/usr/bin/env python3
"""
Modifica content-generator.json:
- Elimina nodo HTTP de Ideogram (http-stability)
- Agrega Code node con lógica Ideogram+OCR (3 intentos)
- Agrega IF, Postgres error y Telegram error
- Actualiza conexiones

Ejecutar desde la raíz del repo:
  python3 deploy/scripts/update-content-generator-ocr.py
"""
import json, os, sys

WORKFLOW_PATH = os.path.join(os.path.dirname(__file__), '..', 'n8n-workflows', 'content-generator.json')

OCR_JSCODE = """const https = require('https');
const prev = $input.first().json;
const MAX_ATTEMPTS = 3;

function httpsPost(hostname, path, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), ...extraHeaders },
      timeout: 30000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON inválido: ' + data.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(bodyStr);
    req.end();
  });
}

async function generateIdeogram(prompt, aspectRatio) {
  const seed = Math.floor(Math.random() * 2147483647);
  const styleTypes = ['REALISTIC','REALISTIC','REALISTIC','GENERAL','GENERAL','3D_RENDER'];
  const styleType = styleTypes[Math.floor(Math.random() * 6)];
  return httpsPost('api.ideogram.ai', '/generate', {
    image_request: {
      prompt, aspect_ratio: aspectRatio, model: 'V_2',
      magic_prompt_option: 'OFF', seed, style_type: styleType,
      negative_prompt: 'text, letters, numbers, words, watermark, logo, caption, label, sign, typography, readable text, signage, signature, written language'
    }
  }, { 'Api-Key': $env.IDEOGRAM_API_KEY });
}

async function checkOCR(imageUrl) {
  try {
    const resp = await httpsPost(
      'vision.googleapis.com',
      `/v1/images:annotate?key=${$env.GOOGLE_VISION_API_KEY}`,
      { requests: [{ image: { source: { imageUri: imageUrl } }, features: [{ type: 'TEXT_DETECTION', maxResults: 10 }] }] },
      {}
    );
    const annotations = resp.responses?.[0]?.textAnnotations || [];
    const description = annotations[0]?.description || '';
    return { hasText: description.length > 2, detectedText: description.slice(0, 200) };
  } catch (err) {
    console.log('[OCR] Vision API error — fail open: ' + err.message);
    return { hasText: false, detectedText: '' };
  }
}

let cleanImageUrl = null;
let lastError = '';

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const resp = await generateIdeogram(prev.image_prompt, prev.aspect_ratio);
  const url = resp.data?.[0]?.url;
  if (!url) throw new Error(`Ideogram sin URL en intento ${attempt}: ` + JSON.stringify(resp).slice(0, 300));
  const ocr = await checkOCR(url);
  if (!ocr.hasText) {
    cleanImageUrl = url;
    console.log(`[OCR] Intento ${attempt}: imagen limpia ✓`);
    break;
  }
  lastError = `Intento ${attempt}: texto detectado — "${ocr.detectedText.replace(/"/g, "'").slice(0, 100)}"`;
  console.log('[OCR] ' + lastError);
}

if (cleanImageUrl) {
  return [{ json: { ...prev, data: [{ url: cleanImageUrl }] } }];
}
return [{ json: { ...prev, ocr_error: true, ocr_error_log: `OCR 3 intentos fallidos. Último: ${lastError}` } }];"""

TELEGRAM_JSON_BODY = (
    "={{ JSON.stringify({ "
    "chat_id: $env.TELEGRAM_CHAT_ID, "
    "text: '⚠️ Error OCR — post no procesado\\n"
    "📅 ' + $json.scheduled_date + ' | ' + ($json.platform||'') + ' — ' + ($json.pillar||'') + '\\n"
    "🔍 ' + ($json.ocr_error_log||'') + '\\n"
    "🆔 ' + ($json.id||'') + '\\n\\n"
    "Acción: revisar en content_plan o resetear para reintentar.' "
    "}) }}"
)

NEW_NODES = [
    {
        "id": "code-ideogram-ocr",
        "name": "Ideogram + OCR — 3 intentos",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1740, 220],
        "parameters": {"jsCode": OCR_JSCODE}
    },
    {
        "id": "if-ocr-error",
        "name": "¿Error OCR?",
        "type": "n8n-nodes-base.if",
        "typeVersion": 2,
        "position": [1960, 60],
        "parameters": {
            "conditions": {
                "options": {"caseSensitive": False, "leftValue": "", "typeValidation": "loose"},
                "conditions": [{
                    "id": "check-ocr-error",
                    "leftValue": "={{ String($json.ocr_error) }}",
                    "rightValue": "true",
                    "operator": {"type": "string", "operation": "equals"}
                }],
                "combinator": "and"
            }
        }
    },
    {
        "id": "postgres-ocr-error",
        "name": "status=error (OCR)",
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.5,
        "position": [2200, 60],
        "parameters": {
            "operation": "executeQuery",
            "query": "UPDATE content_plan SET status = 'error', error_log = '{{ $json.ocr_error_log }}' WHERE id = '{{ $json.id }}'",
            "options": {}
        },
        "credentials": {"postgres": {"id": "3WAwEY7SXDBTW16f", "name": "Postgres account"}}
    },
    {
        "id": "telegram-ocr-error",
        "name": "Telegram: error OCR",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [2440, 60],
        "parameters": {
            "method": "POST",
            "url": "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendMessage",
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": TELEGRAM_JSON_BODY,
            "options": {}
        }
    }
]

NEW_CONNECTIONS = {
    "Ideogram + OCR — 3 intentos": {
        "main": [[{"node": "¿Error OCR?", "type": "main", "index": 0}]]
    },
    "¿Error OCR?": {
        "main": [
            [{"node": "status=error (OCR)", "type": "main", "index": 0}],
            [{"node": "Preparar input compose", "type": "main", "index": 0}]
        ]
    },
    "status=error (OCR)": {
        "main": [[{"node": "Telegram: error OCR", "type": "main", "index": 0}]]
    },
    "Telegram: error OCR": {
        "main": [[{"node": "Procesar 1 post a la vez", "type": "main", "index": 0}]]
    }
}

def main():
    with open(WORKFLOW_PATH, encoding='utf-8') as f:
        wf = json.load(f)

    before = len(wf['nodes'])

    # 1. Eliminar nodo HTTP Ideogram
    wf['nodes'] = [n for n in wf['nodes'] if n['id'] != 'http-stability']
    assert len(wf['nodes']) == before - 1, "http-stability no encontrado"

    # 2. Agregar nuevos nodos
    wf['nodes'].extend(NEW_NODES)

    # 3. Actualizar conexiones
    conns = wf['connections']
    conns.pop('Ideogram — generar imagen (sin texto)', None)
    conns['Aplicar prompt mejorado'] = {
        "main": [[{"node": "Ideogram + OCR — 3 intentos", "type": "main", "index": 0}]]
    }
    conns.update(NEW_CONNECTIONS)

    with open(WORKFLOW_PATH, 'w', encoding='utf-8') as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)

    after = len(wf['nodes'])
    print(f"✓ Workflow actualizado: {before} → {after} nodos ({after - before:+d})")
    print(f"  Conexiones: {len(conns)}")

if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Verificar que el script se creó correctamente**

```bash
python3 -c "import ast; ast.parse(open('deploy/scripts/update-content-generator-ocr.py').read()); print('Syntax OK')"
```

Esperado: `Syntax OK`

---

### Task 3: Ejecutar el script y verificar el JSON resultante

**Files:**
- Modify: `deploy/n8n-workflows/content-generator.json`

- [ ] **Step 1: Hacer backup del JSON actual**

```bash
cp deploy/n8n-workflows/content-generator.json deploy/n8n-workflows/content-generator.json.bak
```

- [ ] **Step 2: Ejecutar el script de modificación**

```bash
python3 deploy/scripts/update-content-generator-ocr.py
```

Resultado esperado:
```
✓ Workflow actualizado: 20 → 23 nodos (+3)
  Conexiones: 18
```

- [ ] **Step 3: Verificar nodos en el JSON resultante**

```bash
python3 -c "
import json
with open('deploy/n8n-workflows/content-generator.json') as f:
    wf = json.load(f)
names = [n['name'] for n in wf['nodes']]
checks = [
    ('Ideogram + OCR — 3 intentos', True),
    ('¿Error OCR?', True),
    ('status=error (OCR)', True),
    ('Telegram: error OCR', True),
    ('Ideogram — generar imagen (sin texto)', False),
]
for name, should_exist in checks:
    exists = name in names
    status = '✓' if exists == should_exist else '✗ ERROR'
    print(f'{status} {name}: {\"presente\" if exists else \"ausente\"}')
"
```

Resultado esperado: todas las líneas con `✓`.

- [ ] **Step 4: Verificar conexiones críticas**

```bash
python3 -c "
import json
with open('deploy/n8n-workflows/content-generator.json') as f:
    wf = json.load(f)
c = wf['connections']
print('Aplicar prompt mejorado →', c.get('Aplicar prompt mejorado',{}).get('main',[[]])[0][0]['node'] if c.get('Aplicar prompt mejorado') else 'MISSING')
print('Ideogram+OCR →', c.get('Ideogram + OCR — 3 intentos',{}).get('main',[[]])[0][0]['node'] if c.get('Ideogram + OCR — 3 intentos') else 'MISSING')
err_branches = c.get('¿Error OCR?',{}).get('main',[])
print('¿Error OCR? TRUE →', err_branches[0][0]['node'] if len(err_branches)>0 and err_branches[0] else 'MISSING')
print('¿Error OCR? FALSE →', err_branches[1][0]['node'] if len(err_branches)>1 and err_branches[1] else 'MISSING')
print('Telegram:error →', c.get('Telegram: error OCR',{}).get('main',[[]])[0][0]['node'] if c.get('Telegram: error OCR') else 'MISSING')
"
```

Resultado esperado:
```
Aplicar prompt mejorado → Ideogram + OCR — 3 intentos
Ideogram+OCR → ¿Error OCR?
¿Error OCR? TRUE → status=error (OCR)
¿Error OCR? FALSE → Preparar input compose
Telegram:error → Procesar 1 post a la vez
```

- [ ] **Step 5: Eliminar backup si todo está correcto**

```bash
rm deploy/n8n-workflows/content-generator.json.bak
```

---

### Task 4: Commit y push

**Files:**
- `deploy/scripts/update-content-generator-ocr.py` (nuevo)
- `deploy/n8n-workflows/content-generator.json` (modificado)

- [ ] **Step 1: Commit**

```bash
git add deploy/scripts/update-content-generator-ocr.py \
        deploy/n8n-workflows/content-generator.json

git commit -m "$(cat <<'EOF'
feat(content-gen): OCR post-generación — Google Vision 3 intentos

Reemplaza nodo HTTP Ideogram por Code node combinado que valida OCR
(Google Vision TEXT_DETECTION) en la misma ejecución, hasta 3 intentos.
Agrega rama de error con Postgres + Telegram notification.

Fix #7 deferred — Fase 2 Content Pipeline

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2: Push**

```bash
git push origin feature/jaagsolutions
```

---

### Task 5: Transplant a n8n producción via REST API

**Files:** ninguno — operacional en VPS

- [ ] **Step 1: git pull en VPS**

```bash
cd /opt/jaagsolutions/repo && git pull origin feature/jaagsolutions
```

Verificar que aparece `content-generator.json` en los archivos modificados del pull.

- [ ] **Step 2: Verificar ID del workflow activo**

```bash
N8N_API_KEY=$(grep N8N_API_KEY /opt/jaagsolutions/repo/deploy/.env | cut -d= -f2)

curl -s "https://n8n.jaagsolutions.com/api/v1/workflows/diB9nJOsjSzYbujt" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('ID:', d.get('id'), '| Nodos actuales:', len(d.get('nodes',[])))"
```

Resultado esperado: `ID: diB9nJOsjSzYbujt | Nodos actuales: 20`

- [ ] **Step 3: PUT workflow actualizado**

```bash
N8N_API_KEY=$(grep N8N_API_KEY /opt/jaagsolutions/repo/deploy/.env | cut -d= -f2)

python3 -c "
import json
with open('/opt/jaagsolutions/repo/deploy/n8n-workflows/content-generator.json') as f:
    wf = json.load(f)
body = {k: wf[k] for k in ['name','nodes','connections','settings'] if k in wf}
print(json.dumps(body))
" | curl -s -X PUT \
  "https://n8n.jaagsolutions.com/api/v1/workflows/diB9nJOsjSzYbujt" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json" \
  --data-binary @- \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK — Nodos:', len(d.get('nodes',[])), '| Active:', d.get('active'))"
```

Resultado esperado: `OK — Nodos: 23 | Active: False`

- [ ] **Step 4: Activar workflow**

```bash
N8N_API_KEY=$(grep N8N_API_KEY /opt/jaagsolutions/repo/deploy/.env | cut -d= -f2)

curl -s -X POST \
  "https://n8n.jaagsolutions.com/api/v1/workflows/diB9nJOsjSzYbujt/activate" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Active:', d.get('active'), '| ID:', d.get('id'))"
```

Resultado esperado: `Active: True | ID: diB9nJOsjSzYbujt`

---

### Task 6: Verificar E2E en producción

**Files:** ninguno — verificación operacional

- [ ] **Step 1: Verificar que el post de prueba está dentro de la ventana del cron**

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, scheduled_date, status FROM content_plan WHERE id='\''0927ed25-dc58-4c5d-aef4-77475d694af9'\'';"'
```

Si `scheduled_date` es anterior a hoy, actualizarlo:

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "UPDATE content_plan SET scheduled_date=CURRENT_DATE WHERE id='\''0927ed25-dc58-4c5d-aef4-77475d694af9'\'';"'
```

- [ ] **Step 2: Reset del post de prueba**

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "UPDATE content_plan SET status='\''pending'\'', image_url=NULL, retry_count=0, error_log=NULL WHERE id='\''0927ed25-dc58-4c5d-aef4-77475d694af9'\''; SELECT id, status, error_log FROM content_plan WHERE id='\''0927ed25-dc58-4c5d-aef4-77475d694af9'\'';"' && rm -f /opt/jaagsolutions/content/0927ed25-dc58-4c5d-aef4-77475d694af9.jpg
```

Resultado esperado: `UPDATE 1` + row con `status = pending`.

- [ ] **Step 3: Ejecutar workflow manualmente desde n8n UI**

En `https://n8n.jaagsolutions.com` → buscar "Content Generator" → botón "Execute Workflow".

Observar la ejecución en el canvas. El nodo `Ideogram + OCR — 3 intentos` tomará ~20-60s (Ideogram + Vision). Verificar que queda verde.

- [ ] **Step 4: Revisar logs del Code node**

En n8n → Executions → última ejecución → click en nodo `Ideogram + OCR — 3 intentos` → pestaña "Output" o "Logs".

Buscar alguna de estas líneas:
- `[OCR] Intento 1: imagen limpia ✓` → primera imagen pasó OCR
- `[OCR] Intento 1: texto detectado — "..."` → hubo texto, probó de nuevo

- [ ] **Step 5: Verificar resultado en DB**

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, status, image_url, error_log FROM content_plan WHERE id='\''0927ed25-dc58-4c5d-aef4-77475d694af9'\'';"'
```

Resultado esperado: `status = review` + `image_url` con URL pública (flujo happy path).

Si `status = error`: revisar `error_log` — debe contener `"OCR 3 intentos fallidos"` y llegar mensaje Telegram.

- [ ] **Step 6: Reset post a estado original y actualizar CHECKLIST**

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "UPDATE content_plan SET status='\''pending'\'', image_url=NULL, retry_count=0, error_log=NULL, scheduled_date='\''2026-05-12'\'' WHERE id='\''0927ed25-dc58-4c5d-aef4-77475d694af9'\''; SELECT id, scheduled_date, status FROM content_plan WHERE id='\''0927ed25-dc58-4c5d-aef4-77475d694af9'\'';"' && rm -f /opt/jaagsolutions/content/0927ed25-dc58-4c5d-aef4-77475d694af9.jpg
```

En `docs/superpowers/specs/CHECKLIST-MAESTRO-JAAGSOLUTIONS.md`, marcar:
```
- [x] **OCR post-generación (Fix #7 deferred)** — ✅ Completado 2026-05-17
```
