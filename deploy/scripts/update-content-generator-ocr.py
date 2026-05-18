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
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print(f"✓ Workflow actualizado: {before} → {after} nodos ({after - before:+d})")
    print(f"  Conexiones: {len(conns)}")

if __name__ == '__main__':
    main()
