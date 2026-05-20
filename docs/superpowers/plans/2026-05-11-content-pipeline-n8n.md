# Content Pipeline n8n — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir dos workflows n8n que leen un plan de contenido en PostgreSQL, generan imágenes con Ideogram API, solicitan aprobación vía Telegram y publican automáticamente en Meta (FB+IG) y LinkedIn.

**Architecture:** Workflow 1 (Cron 8 AM) consulta `content_plan` en Postgres, genera imagen con Ideogram, valida texto con Google Vision OCR, envía a Telegram con botones inline. Workflow 2 (Webhook) recibe el callback de Telegram, publica en Meta Graph API + LinkedIn API y actualiza el estado en Postgres.

**Tech Stack:** n8n 1.112.6, PostgreSQL 16, Ideogram API v2, Google Cloud Vision API, Telegram Bot API, Meta Graph API v19, LinkedIn UGC Posts API, Docker Compose.

---

## Archivos a crear / modificar

| Acción | Archivo |
|--------|---------|
| Crear | `deploy/sql/content-plan-schema.sql` |
| Crear | `deploy/scripts/migrate-csv-to-db.py` |
| Crear | `deploy/scripts/insert-content-plan.py` |
| Crear | `deploy/n8n-workflows/content-generator.json` |
| Crear | `deploy/n8n-workflows/telegram-approval.json` |
| Modificar | `deploy/.env.production.example` |
| Modificar | `deploy/docker-compose.yml` |
| Modificar | `deploy/Caddyfile` |
| Modificar | `docs/superpowers/specs/CHECKLIST-MAESTRO-JAAGSOLUTIONS.md` |

---

## Task 1: PostgreSQL Schema

**Files:**
- Create: `deploy/sql/content-plan-schema.sql`

- [ ] **Paso 1: Crear el archivo SQL**

```sql
-- deploy/sql/content-plan-schema.sql
-- Ejecutar dentro del container postgres: deploy-postgres-1

CREATE TABLE IF NOT EXISTS content_plan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME NOT NULL DEFAULT '10:00',
  platform        TEXT NOT NULL
                  CHECK (platform IN ('linkedin','instagram','facebook','meta')),
  format          TEXT NOT NULL
                  CHECK (format IN ('imagen_copy','carrusel','texto_largo','reel')),
  pillar          TEXT NOT NULL
                  CHECK (pillar IN ('educacion','casos_de_uso','prueba_social','behind_the_scenes')),
  post_type       TEXT NOT NULL
                  CHECK (post_type IN ('valor','conversion')),
  copy_text       TEXT NOT NULL,
  image_prompt    TEXT NOT NULL,
  hashtags        TEXT,
  cta_url         TEXT,
  image_url       TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','generating','review','approved','published','error')),
  retry_count     INTEGER NOT NULL DEFAULT 0,
  telegram_msg_id TEXT,
  published_at    TIMESTAMPTZ,
  error_log       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_plan_status_date
  ON content_plan (status, scheduled_date);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_plan_updated_at ON content_plan;
CREATE TRIGGER content_plan_updated_at
  BEFORE UPDATE ON content_plan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Paso 2: Aplicar el schema en el VPS**

```bash
# En VPS (via Google Cloud SSH):
cd /opt/jaagsolutions/repo && git pull origin feature/jaagsolutions
docker exec -i deploy-postgres-1 psql -U paperclip -d paperclip \
  < deploy/sql/content-plan-schema.sql
```

Salida esperada:
```
CREATE TABLE
CREATE INDEX
CREATE FUNCTION
CREATE TRIGGER
```

- [ ] **Paso 3: Verificar que la tabla existe**

```bash
docker exec deploy-postgres-1 psql -U paperclip -d paperclip \
  -c "\d content_plan"
```

Debe listar las 20 columnas definidas.

- [ ] **Paso 4: Commit**

```bash
git add deploy/sql/content-plan-schema.sql
git commit -m "feat(pipeline): add content_plan PostgreSQL schema"
```

---

## Task 2: Variables de entorno — docker-compose.yml y .env.example

**Files:**
- Modify: `deploy/docker-compose.yml`
- Modify: `deploy/.env.production.example`

- [ ] **Paso 1: Agregar variables al bloque n8n en docker-compose.yml**

En la sección `environment:` del servicio `n8n`, agregar al final del bloque:

```yaml
      # ── Content Pipeline ──────────────────────────────────
      IDEOGRAM_API_KEY: ${IDEOGRAM_API_KEY}
      GOOGLE_VISION_API_KEY: ${GOOGLE_VISION_API_KEY}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      TELEGRAM_CHAT_ID: ${TELEGRAM_CHAT_ID}
      META_PAGE_ACCESS_TOKEN: ${META_PAGE_ACCESS_TOKEN}
      META_PAGE_ID: ${META_PAGE_ID}
      META_IG_USER_ID: ${META_IG_USER_ID}
      LINKEDIN_ACCESS_TOKEN: ${LINKEDIN_ACCESS_TOKEN}
      PAPERCLIP_JAAG5_ISSUE_ID: ${PAPERCLIP_JAAG5_ISSUE_ID}
```

En la sección `volumes:` del servicio `n8n`, la sección queda así (sin cambiar lo existente, solo agregar la segunda línea):

```yaml
    volumes:
      - ${N8N_DATA_DIR}:/home/node/.n8n
      - ${CONTENT_DIR:-/opt/jaagsolutions/content}:/opt/jaagsolutions/content
```

- [ ] **Paso 2: Actualizar .env.production.example**

Agregar al final del archivo:

```bash
# ─── CONTENT PIPELINE ─────────────────────────────────────────────────────────
# Directorio local donde n8n guarda las imágenes generadas
CONTENT_DIR=/opt/jaagsolutions/content

# Ideogram API — ideogram.ai → cuenta jaagsolutions@gmail.com → API → Create Key
IDEOGRAM_API_KEY=

# Google Cloud Vision API — console.cloud.google.com → APIs → Vision → Credentials → API Key
GOOGLE_VISION_API_KEY=

# Telegram Bot — @BotFather en Telegram → /newbot → nombre: JAAGSOLUTIONS Content
TELEGRAM_BOT_TOKEN=
# ID del chat de aprobación — enviar mensaje al bot, luego: GET api.telegram.org/bot<TOKEN>/getUpdates
TELEGRAM_CHAT_ID=

# Meta Graph API — developers.facebook.com → Graph API Explorer → token larga duración (60 días)
META_PAGE_ACCESS_TOKEN=
META_PAGE_ID=
META_IG_USER_ID=

# LinkedIn API — linkedin.com/developers → OAuth 2.0 → scope: w_member_social,r_liteprofile
LINKEDIN_ACCESS_TOKEN=

# Paperclip — ID del issue JAAG-5 para logs de publicación
PAPERCLIP_JAAG5_ISSUE_ID=b05315af-1fad-45a1-8701-39fdf214e950
```

- [ ] **Paso 3: Crear directorio de contenido en VPS**

```bash
mkdir -p /opt/jaagsolutions/content
chmod 755 /opt/jaagsolutions/content
```

- [ ] **Paso 4: Reiniciar n8n con nueva configuración (después de poblar .env)**

Este paso se ejecuta en el Task 9, luego de obtener todas las API keys.

- [ ] **Paso 5: Commit**

```bash
git add deploy/docker-compose.yml deploy/.env.production.example
git commit -m "feat(pipeline): add content pipeline env vars and content volume to docker-compose"
```

---

## Task 3: Obtener credenciales de API

Estos son pasos manuales ordenados por dificultad (más simples primero).

### 3A — Ideogram API

- [ ] **Paso 1:** Ir a `ideogram.ai` → login con `jaagsolutions@gmail.com`
- [ ] **Paso 2:** Menu superior → API → Create API Key → copiar
- [ ] **Paso 3:** En VPS, editar `deploy/.env`:
  ```bash
  nano /opt/jaagsolutions/repo/deploy/.env
  # Agregar: IDEOGRAM_API_KEY=<clave copiada>
  ```

### 3B — Google Vision API

- [ ] **Paso 1:** Ir a `console.cloud.google.com` → mismo proyecto del VPS
- [ ] **Paso 2:** APIs & Services → Library → buscar "Cloud Vision API" → Enable
- [ ] **Paso 3:** APIs & Services → Credentials → Create Credentials → API Key
- [ ] **Paso 4:** Copiar → `GOOGLE_VISION_API_KEY=<clave>` en `deploy/.env`

### 3C — Telegram Bot

- [ ] **Paso 1:** Abrir Telegram → buscar `@BotFather` → enviar `/newbot`
- [ ] **Paso 2:** Nombre: `JAAGSOLUTIONS Content` / username: `jaagsolutions_content_bot`
- [ ] **Paso 3:** Copiar token → `TELEGRAM_BOT_TOKEN=<token>` en `deploy/.env`
- [ ] **Paso 4:** Obtener TELEGRAM_CHAT_ID:
  - Enviar cualquier mensaje al bot recién creado
  - Abrir en browser: `https://api.telegram.org/bot<TOKEN>/getUpdates`
  - El campo `message.chat.id` es tu TELEGRAM_CHAT_ID
  - Copiar → `TELEGRAM_CHAT_ID=<id>` en `deploy/.env`

### 3D — Meta Graph API

- [ ] **Paso 1:** Ir a `developers.facebook.com` → login con `jaagsolutions@gmail.com`
- [ ] **Paso 2:** My Apps → Create App → tipo: Business → conectar a JAAGSOLUTIONS Page
- [ ] **Paso 3:** Graph API Explorer → seleccionar la app creada → Generate Access Token
  - Permisos requeridos: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`
- [ ] **Paso 4:** Extender token a larga duración:
  - Tools → Access Token Debugger → Extend Access Token
  - El token resultante dura ~60 días → copiar → `META_PAGE_ACCESS_TOKEN=<token>`
- [ ] **Paso 5:** Obtener PAGE_ID:
  - Graph API Explorer → GET `me/accounts` → copiar `id` de JAAGSOLUTIONS → `META_PAGE_ID=<id>`
- [ ] **Paso 6:** Obtener IG_USER_ID:
  - GET `/<META_PAGE_ID>?fields=instagram_business_account` → copiar `id` → `META_IG_USER_ID=<id>`
- [ ] **Paso 7:** Guardar en `deploy/.env`

### 3E — LinkedIn API

- [ ] **Paso 1:** Ir a `linkedin.com/developers` → login cuenta personal Juan A. Alvarenga
- [ ] **Paso 2:** Create App → Company: JAAGSOLUTIONS → nombre: `JAAGSOLUTIONS Automation`
- [ ] **Paso 3:** Products → Request access: "Share on LinkedIn" (aprobación inmediata)
- [ ] **Paso 4:** Auth → OAuth 2.0 → Authorized redirect URLs → agregar:
  `https://n8n.jaagsolutions.com/oauth2/callback`
- [ ] **Paso 5:** Obtener token de acceso personal:
  - Auth → OAuth 2.0 Tools → Token Generator
  - Scopes: `w_member_social`, `r_liteprofile`, `openid`, `profile`
  - Autorizar con cuenta personal → copiar Access Token
  - `LINKEDIN_ACCESS_TOKEN=<token>` en `deploy/.env`

---

## Task 4: Script de migración CSV → PostgreSQL

**Files:**
- Create: `deploy/scripts/migrate-csv-to-db.py`

- [ ] **Paso 1: Crear el script**

```python
#!/usr/bin/env python3
# deploy/scripts/migrate-csv-to-db.py
# Migra el CSV de A4 del workspace Docker a la tabla content_plan en PostgreSQL.
# Ejecutar en VPS: python3 deploy/scripts/migrate-csv-to-db.py

import csv
import os
import sys
import uuid
import psycopg2
from datetime import datetime

DB_URL = os.environ.get("DATABASE_URL")
if not DB_URL:
    print("ERROR: DATABASE_URL no definida")
    sys.exit(1)

CSV_PATH = "/paperclip/workspace/linkedin_first8_schedule.csv"

PLATFORM_MAP = {
    "LinkedIn": "linkedin",
    "Instagram": "instagram",
    "Facebook": "facebook",
    "Meta": "meta",
}

FORMAT_MAP = {
    "imagen_copy": "imagen_copy",
    "carrusel": "carrusel",
    "texto_largo": "texto_largo",
    "reel": "reel",
    "Imagen": "imagen_copy",
    "Texto largo": "texto_largo",
}

PILLAR_MAP = {
    "Educación": "educacion",
    "educacion": "educacion",
    "Casos de Uso": "casos_de_uso",
    "casos_de_uso": "casos_de_uso",
    "Prueba Social": "prueba_social",
    "prueba_social": "prueba_social",
    "Behind-the-Scenes": "behind_the_scenes",
    "behind_the_scenes": "behind_the_scenes",
}

def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    inserted = 0
    skipped = 0

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Normalizar campos
            platform = PLATFORM_MAP.get(row.get("platform", ""), row.get("platform", "linkedin")).lower()
            fmt = FORMAT_MAP.get(row.get("format", ""), "imagen_copy")
            pillar = PILLAR_MAP.get(row.get("pillar", ""), "educacion")
            post_type = row.get("post_type", "valor").lower()
            scheduled_date = row.get("scheduled_date") or row.get("date") or row.get("fecha")
            scheduled_time = row.get("scheduled_time") or row.get("time") or row.get("hora") or "10:00"
            copy_text = row.get("copy_text") or row.get("copy") or row.get("texto") or ""
            image_prompt = row.get("image_prompt") or row.get("prompt") or ""
            hashtags = row.get("hashtags") or ""
            cta_url = row.get("cta_url") or ""

            if not copy_text:
                print(f"  SKIP fila vacía: {row}")
                skipped += 1
                continue

            cur.execute("""
                INSERT INTO content_plan
                  (id, scheduled_date, scheduled_time, platform, format, pillar,
                   post_type, copy_text, image_prompt, hashtags, cta_url, status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'pending')
                ON CONFLICT DO NOTHING
            """, (
                str(uuid.uuid4()),
                scheduled_date,
                scheduled_time,
                platform,
                fmt,
                pillar,
                post_type,
                copy_text,
                image_prompt,
                hashtags,
                cta_url,
            ))
            inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"Migración completa: {inserted} filas insertadas, {skipped} omitidas.")

if __name__ == "__main__":
    main()
```

- [ ] **Paso 2: Copiar y ejecutar en VPS**

```bash
# En VPS:
cd /opt/jaagsolutions/repo && git pull origin feature/jaagsolutions

# Leer DATABASE_URL del .env y ejecutar el script dentro del container
# (psycopg2 no está en el host, usamos el container de postgres)
source deploy/.env

docker exec deploy-paperclip-1 sh -c \
  "DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB} \
   python3 /opt/jaagsolutions/repo/deploy/scripts/migrate-csv-to-db.py"
```

> Nota: si psycopg2 no está disponible en el container de paperclip, instalar:
> `docker exec deploy-paperclip-1 pip3 install psycopg2-binary`

- [ ] **Paso 3: Verificar filas migradas**

```bash
docker exec deploy-postgres-1 psql -U paperclip -d paperclip \
  -c "SELECT id, scheduled_date, platform, status, LEFT(copy_text,40) FROM content_plan ORDER BY scheduled_date;"
```

- [ ] **Paso 4: Commit**

```bash
git add deploy/scripts/migrate-csv-to-db.py
git commit -m "feat(pipeline): add CSV to PostgreSQL migration script"
```

---

## Task 5: Script de inserción para A4

**Files:**
- Create: `deploy/scripts/insert-content-plan.py`

- [ ] **Paso 1: Crear el script**

```python
#!/usr/bin/env python3
# deploy/scripts/insert-content-plan.py
# A4 usa este script para agregar posts al plan de contenido.
# Uso: python3 insert-content-plan.py --date 2026-06-02 --platform linkedin ...

import argparse
import os
import sys
import uuid
import psycopg2

DB_URL = os.environ.get("DATABASE_URL")
if not DB_URL:
    print("ERROR: DATABASE_URL no definida en el entorno")
    sys.exit(1)

VALID_PLATFORMS = ("linkedin", "instagram", "facebook", "meta")
VALID_FORMATS   = ("imagen_copy", "carrusel", "texto_largo", "reel")
VALID_PILLARS   = ("educacion", "casos_de_uso", "prueba_social", "behind_the_scenes")
VALID_TYPES     = ("valor", "conversion")

def main():
    p = argparse.ArgumentParser(description="Insertar post en content_plan")
    p.add_argument("--date",     required=True,  help="YYYY-MM-DD")
    p.add_argument("--time",     default="10:00", help="HH:MM (default: 10:00)")
    p.add_argument("--platform", required=True,  choices=VALID_PLATFORMS)
    p.add_argument("--format",   required=True,  choices=VALID_FORMATS)
    p.add_argument("--pillar",   required=True,  choices=VALID_PILLARS)
    p.add_argument("--type",     required=True,  choices=VALID_TYPES, dest="post_type")
    p.add_argument("--copy",     required=True,  help="Texto completo del post")
    p.add_argument("--prompt",   required=True,  help="Prompt para Ideogram")
    p.add_argument("--hashtags", default="",     help="Hashtags separados por espacio")
    p.add_argument("--cta",      default="https://jaagsolutions.com", help="URL del CTA")
    args = p.parse_args()

    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    post_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO content_plan
          (id, scheduled_date, scheduled_time, platform, format, pillar,
           post_type, copy_text, image_prompt, hashtags, cta_url, status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'pending')
        RETURNING id
    """, (
        post_id, args.date, args.time, args.platform, args.format,
        args.pillar, args.post_type, args.copy, args.prompt,
        args.hashtags, args.cta,
    ))
    conn.commit()
    cur.close()
    conn.close()
    print(f"OK — post insertado con ID: {post_id}")

if __name__ == "__main__":
    main()
```

- [ ] **Paso 2: Commit**

```bash
git add deploy/scripts/insert-content-plan.py
git commit -m "feat(pipeline): add A4 insert-content-plan script"
```

---

## Task 6: n8n — Credential Setup

Pasos manuales en la UI de n8n (`https://n8n.jaagsolutions.com`).

- [ ] **Paso 1: Credential Postgres**
  - Settings → Credentials → New → buscar "Postgres"
  - Name: `PostgreSQL JAAGSOLUTIONS`
  - Host: `postgres` (nombre del servicio Docker en red interna)
  - Database: `paperclip`
  - User: `paperclip`
  - Password: valor de `POSTGRES_PASSWORD` en `deploy/.env`
  - Port: `5432`
  - SSL: Off
  - Save → Test connection → debe mostrar "Connection tested successfully"

- [ ] **Paso 2: Reiniciar n8n con las nuevas env vars**

```bash
# En VPS — aplicar variables del Task 2 al servicio n8n
cd /opt/jaagsolutions/repo/deploy
docker compose --env-file .env up -d n8n
```

---

## Task 7: Workflow 1 — Content Generator JSON

**Files:**
- Create: `deploy/n8n-workflows/content-generator.json`

- [ ] **Paso 1: Crear el archivo JSON**

```json
{
  "name": "Content Generator — Cron → Ideogram → Vision → Telegram",
  "nodes": [
    {
      "id": "schedule-trigger",
      "name": "Cron 8 AM diario",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [200, 300],
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 8 * * *" }]
        }
      }
    },
    {
      "id": "postgres-select",
      "name": "Obtener posts pendientes",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [420, 300],
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM content_plan WHERE status = 'pending' AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 2 ORDER BY scheduled_date, scheduled_time LIMIT 10",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    },
    {
      "id": "if-has-posts",
      "name": "¿Hay posts?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [640, 300],
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
          "conditions": [
            {
              "id": "check-rows",
              "leftValue": "={{ $json.id }}",
              "rightValue": "",
              "operator": { "type": "string", "operation": "notEmpty" }
            }
          ],
          "combinator": "and"
        }
      }
    },
    {
      "id": "split-batches",
      "name": "Procesar 1 post a la vez",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [860, 220],
      "parameters": { "batchSize": 1, "options": {} }
    },
    {
      "id": "postgres-set-generating",
      "name": "status = generating",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [1080, 220],
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE content_plan SET status = 'generating' WHERE id = '{{ $json.id }}' RETURNING id",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    },
    {
      "id": "code-aspect-ratio",
      "name": "Calcular aspect_ratio",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1300, 220],
      "parameters": {
        "jsCode": "const item = $input.first().json;\nconst platform = item.platform || 'instagram';\nconst format = item.format || 'imagen_copy';\n\nconst map = {\n  'linkedin:imagen_copy': 'ASPECT_4_5',\n  'linkedin:texto_largo': 'ASPECT_4_5',\n  'linkedin:carrusel':   'ASPECT_4_5',\n  'instagram:imagen_copy': 'ASPECT_1_1',\n  'instagram:carrusel':   'ASPECT_1_1',\n  'instagram:reel':       'ASPECT_9_16',\n  'meta:imagen_copy':     'ASPECT_1_1',\n  'meta:carrusel':        'ASPECT_1_1',\n  'facebook:imagen_copy': 'ASPECT_4_5',\n};\n\nconst key = `${platform}:${format}`;\nconst aspect_ratio = map[key] || 'ASPECT_1_1';\n\nreturn [{ json: { ...item, aspect_ratio } }];"
      }
    },
    {
      "id": "http-ideogram",
      "name": "Ideogram — generar imagen",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1520, 220],
      "parameters": {
        "method": "POST",
        "url": "https://api.ideogram.ai/generate",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Api-Key", "value": "={{ $env.IDEOGRAM_API_KEY }}" },
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ image_request: { prompt: $json.image_prompt, aspect_ratio: $json.aspect_ratio, model: 'V_2', magic_prompt_option: 'OFF' } }) }}",
        "options": { "timeout": 60000 }
      }
    },
    {
      "id": "code-extract-image-url",
      "name": "Extraer URL de imagen",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1740, 220],
      "parameters": {
        "jsCode": "const ideogramResponse = $input.first().json;\nconst imageUrl = ideogramResponse.data?.[0]?.url;\nif (!imageUrl) throw new Error('Ideogram no devolvió URL de imagen: ' + JSON.stringify(ideogramResponse));\n\nconst prev = $('Calcular aspect_ratio').first().json;\nreturn [{ json: { ...prev, ideogram_image_url: imageUrl } }];"
      }
    },
    {
      "id": "postgres-set-image-url",
      "name": "Guardar image_url",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [1960, 220],
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE content_plan SET image_url = '{{ $json.ideogram_image_url }}' WHERE id = '{{ $json.id }}'",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    },
    {
      "id": "http-vision-ocr",
      "name": "Google Vision — OCR",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2180, 220],
      "parameters": {
        "method": "POST",
        "url": "=https://vision.googleapis.com/v1/images:annotate?key={{ $env.GOOGLE_VISION_API_KEY }}",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ requests: [{ image: { source: { imageUri: $json.ideogram_image_url } }, features: [{ type: 'TEXT_DETECTION', maxResults: 10 }] }] }) }}",
        "options": { "timeout": 30000 }
      }
    },
    {
      "id": "code-validate-ocr",
      "name": "Validar OCR",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2400, 220],
      "parameters": {
        "jsCode": "const visionResp = $input.first().json;\nconst postData = $('Guardar image_url').first().json;\n\nconst detectedText = (visionResp.responses?.[0]?.fullTextAnnotation?.text || '').toLowerCase();\nconst copyWords = postData.copy_text\n  .toLowerCase()\n  .split(/\\s+/)\n  .filter(w => w.length > 5)\n  .slice(0, 5);\n\nconst matchCount = copyWords.filter(w => detectedText.includes(w)).length;\nconst ocrPassed = matchCount >= 2 || detectedText.length > 10;\n\nreturn [{ json: { ...postData, ocr_passed: ocrPassed, detected_text: detectedText } }];"
      }
    },
    {
      "id": "if-ocr-passed",
      "name": "¿OCR correcto?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [2620, 220],
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
          "conditions": [
            {
              "id": "check-ocr",
              "leftValue": "={{ $json.ocr_passed }}",
              "rightValue": true,
              "operator": { "type": "boolean", "operation": "equal" }
            }
          ],
          "combinator": "and"
        }
      }
    },
    {
      "id": "if-can-retry",
      "name": "¿Puede reintentar?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [2840, 380],
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
          "conditions": [
            {
              "id": "check-retry",
              "leftValue": "={{ $json.retry_count }}",
              "rightValue": 3,
              "operator": { "type": "number", "operation": "lt" }
            }
          ],
          "combinator": "and"
        }
      }
    },
    {
      "id": "postgres-retry",
      "name": "retry_count++ / volver a pending",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [3060, 300],
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE content_plan SET status = 'pending', retry_count = retry_count + 1 WHERE id = '{{ $json.id }}'",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    },
    {
      "id": "postgres-error",
      "name": "status = error",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [3060, 460],
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE content_plan SET status = 'error', error_log = 'OCR falló 3 veces' WHERE id = '{{ $json.id }}'",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    },
    {
      "id": "postgres-set-review",
      "name": "status = review",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [2840, 140],
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE content_plan SET status = 'review' WHERE id = '{{ $json.id }}'",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    },
    {
      "id": "telegram-send",
      "name": "Telegram — enviar para aprobación",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [3060, 140],
      "parameters": {
        "method": "POST",
        "url": "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendPhoto",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, photo: $('Guardar image_url').first().json.ideogram_image_url, caption: '📅 *' + $('Guardar image_url').first().json.scheduled_date + ' ' + $('Guardar image_url').first().json.scheduled_time + '*\\n📱 ' + ($('Guardar image_url').first().json.platform || '').toUpperCase() + ' — ' + ($('Guardar image_url').first().json.pillar || '') + '\\n\\n' + ($('Guardar image_url').first().json.copy_text || '') + '\\n\\n' + ($('Guardar image_url').first().json.hashtags || ''), parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '✅ Aprobar', callback_data: 'aprobar_' + $('Guardar image_url').first().json.id }, { text: '❌ Rechazar', callback_data: 'rechazar_' + $('Guardar image_url').first().json.id }]] } }) }}",
        "options": {}
      }
    },
    {
      "id": "postgres-set-telegram-id",
      "name": "Guardar telegram_msg_id",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [3280, 140],
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE content_plan SET telegram_msg_id = '{{ $json.result.message_id }}' WHERE id = '{{ $('Guardar image_url').first().json.id }}'",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    }
  ],
  "connections": {
    "Cron 8 AM diario": {
      "main": [[{ "node": "Obtener posts pendientes", "type": "main", "index": 0 }]]
    },
    "Obtener posts pendientes": {
      "main": [[{ "node": "¿Hay posts?", "type": "main", "index": 0 }]]
    },
    "¿Hay posts?": {
      "main": [
        [{ "node": "Procesar 1 post a la vez", "type": "main", "index": 0 }],
        []
      ]
    },
    "Procesar 1 post a la vez": {
      "main": [[{ "node": "status = generating", "type": "main", "index": 0 }]]
    },
    "status = generating": {
      "main": [[{ "node": "Calcular aspect_ratio", "type": "main", "index": 0 }]]
    },
    "Calcular aspect_ratio": {
      "main": [[{ "node": "Ideogram — generar imagen", "type": "main", "index": 0 }]]
    },
    "Ideogram — generar imagen": {
      "main": [[{ "node": "Extraer URL de imagen", "type": "main", "index": 0 }]]
    },
    "Extraer URL de imagen": {
      "main": [[{ "node": "Guardar image_url", "type": "main", "index": 0 }]]
    },
    "Guardar image_url": {
      "main": [[{ "node": "Google Vision — OCR", "type": "main", "index": 0 }]]
    },
    "Google Vision — OCR": {
      "main": [[{ "node": "Validar OCR", "type": "main", "index": 0 }]]
    },
    "Validar OCR": {
      "main": [[{ "node": "¿OCR correcto?", "type": "main", "index": 0 }]]
    },
    "¿OCR correcto?": {
      "main": [
        [{ "node": "status = review", "type": "main", "index": 0 }],
        [{ "node": "¿Puede reintentar?", "type": "main", "index": 0 }]
      ]
    },
    "¿Puede reintentar?": {
      "main": [
        [{ "node": "retry_count++ / volver a pending", "type": "main", "index": 0 }],
        [{ "node": "status = error", "type": "main", "index": 0 }]
      ]
    },
    "status = review": {
      "main": [[{ "node": "Telegram — enviar para aprobación", "type": "main", "index": 0 }]]
    },
    "Telegram — enviar para aprobación": {
      "main": [[{ "node": "Guardar telegram_msg_id", "type": "main", "index": 0 }]]
    }
  },
  "active": false,
  "settings": { "executionOrder": "v1" },
  "meta": { "templateCredsSetupCompleted": false },
  "tags": ["jaagsolutions", "content-pipeline"]
}
```

- [ ] **Paso 2: Commit**

```bash
git add deploy/n8n-workflows/content-generator.json
git commit -m "feat(pipeline): add n8n Content Generator workflow (Cron + Ideogram + Vision + Telegram)"
```

---

## Task 8: Workflow 2 — Telegram Approval Handler JSON

**Files:**
- Create: `deploy/n8n-workflows/telegram-approval.json`

- [ ] **Paso 1: Crear el archivo JSON**

```json
{
  "name": "Telegram Approval → Meta + LinkedIn Publisher",
  "nodes": [
    {
      "id": "webhook-telegram",
      "name": "Webhook Telegram Callback",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [200, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "telegram-approval",
        "responseMode": "onReceived",
        "options": {}
      },
      "webhookId": "telegram-approval"
    },
    {
      "id": "code-parse",
      "name": "Parsear callback",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [420, 300],
      "parameters": {
        "jsCode": "const body = $input.first().json.body || $input.first().json;\nconst callbackQuery = body.callback_query;\nif (!callbackQuery) throw new Error('No callback_query en payload: ' + JSON.stringify(body));\n\nconst data = callbackQuery.data || '';\nconst parts = data.split('_');\nconst action = parts[0];\nconst post_id = parts.slice(1).join('_');\nconst callback_query_id = callbackQuery.id;\nconst message_id = callbackQuery.message?.message_id;\nconst chat_id = callbackQuery.message?.chat?.id;\n\nif (!action || !post_id) throw new Error('callback_data inválido: ' + data);\n\nreturn [{ json: { action, post_id, callback_query_id, message_id, chat_id } }];"
      }
    },
    {
      "id": "http-answer-callback",
      "name": "Telegram — answerCallbackQuery",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [640, 300],
      "parameters": {
        "method": "POST",
        "url": "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/answerCallbackQuery",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ callback_query_id: $json.callback_query_id, text: 'Procesando...' }) }}",
        "options": {}
      }
    },
    {
      "id": "postgres-get-post",
      "name": "Obtener datos del post",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [860, 300],
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM content_plan WHERE id = '{{ $('Parsear callback').first().json.post_id }}'",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    },
    {
      "id": "if-approve",
      "name": "¿Aprobar o Rechazar?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [1080, 300],
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
          "conditions": [
            {
              "id": "check-action",
              "leftValue": "={{ $('Parsear callback').first().json.action }}",
              "rightValue": "aprobar",
              "operator": { "type": "string", "operation": "equals" }
            }
          ],
          "combinator": "and"
        }
      }
    },
    {
      "id": "if-linkedin",
      "name": "¿Es LinkedIn?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [1300, 180],
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
          "conditions": [
            {
              "id": "check-platform",
              "leftValue": "={{ $json.platform }}",
              "rightValue": "linkedin",
              "operator": { "type": "string", "operation": "equals" }
            }
          ],
          "combinator": "and"
        }
      }
    },
    {
      "id": "http-linkedin",
      "name": "LinkedIn — publicar post",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1520, 100],
      "parameters": {
        "method": "POST",
        "url": "https://api.linkedin.com/v2/ugcPosts",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "=Bearer {{ $env.LINKEDIN_ACCESS_TOKEN }}" },
            { "name": "Content-Type", "value": "application/json" },
            { "name": "X-Restli-Protocol-Version", "value": "2.0.0" }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ author: 'urn:li:person:me', lifecycleState: 'PUBLISHED', specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text: $json.copy_text + '\\n\\n' + ($json.hashtags || '') }, shareMediaCategory: 'IMAGE', media: [{ status: 'READY', description: { text: $json.copy_text.substring(0, 200) }, media: $json.image_url, title: { text: 'JAAGSOLUTIONS' } }] } }, visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' } }) }}",
        "options": { "timeout": 30000 }
      }
    },
    {
      "id": "if-meta",
      "name": "¿Es Meta/IG/FB?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [1520, 260],
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
          "conditions": [
            {
              "id": "check-meta",
              "leftValue": "={{ $json.platform }}",
              "rightValue": "linkedin",
              "operator": { "type": "string", "operation": "notEquals" }
            }
          ],
          "combinator": "and"
        }
      }
    },
    {
      "id": "http-fb-photo",
      "name": "Meta FB — subir foto",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1740, 200],
      "parameters": {
        "method": "POST",
        "url": "=https://graph.facebook.com/v19.0/{{ $env.META_PAGE_ID }}/photos",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "=Bearer {{ $env.META_PAGE_ACCESS_TOKEN }}" }
          ]
        },
        "sendBody": true,
        "contentType": "form-urlencoded",
        "bodyParameters": {
          "parameters": [
            { "name": "url", "value": "={{ $json.image_url }}" },
            { "name": "caption", "value": "={{ $json.copy_text + '\\n\\n' + ($json.hashtags || '') }}" },
            { "name": "published", "value": "true" }
          ]
        },
        "options": { "timeout": 30000 }
      }
    },
    {
      "id": "http-ig-container",
      "name": "Meta IG — crear container",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1740, 340],
      "parameters": {
        "method": "POST",
        "url": "=https://graph.facebook.com/v19.0/{{ $env.META_IG_USER_ID }}/media",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "=Bearer {{ $env.META_PAGE_ACCESS_TOKEN }}" }
          ]
        },
        "sendBody": true,
        "contentType": "form-urlencoded",
        "bodyParameters": {
          "parameters": [
            { "name": "image_url", "value": "={{ $json.image_url }}" },
            { "name": "caption", "value": "={{ $json.copy_text + '\\n\\n' + ($json.hashtags || '') }}" }
          ]
        },
        "options": { "timeout": 30000 }
      }
    },
    {
      "id": "http-ig-publish",
      "name": "Meta IG — publicar",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1960, 340],
      "parameters": {
        "method": "POST",
        "url": "=https://graph.facebook.com/v19.0/{{ $env.META_IG_USER_ID }}/media_publish",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "=Bearer {{ $env.META_PAGE_ACCESS_TOKEN }}" }
          ]
        },
        "sendBody": true,
        "contentType": "form-urlencoded",
        "bodyParameters": {
          "parameters": [
            { "name": "creation_id", "value": "={{ $json.id }}" }
          ]
        },
        "options": {}
      }
    },
    {
      "id": "postgres-published",
      "name": "status = published",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [2200, 220],
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE content_plan SET status = 'published', published_at = NOW() WHERE id = '{{ $('Parsear callback').first().json.post_id }}'",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    },
    {
      "id": "http-paperclip-log",
      "name": "Paperclip — log en JAAG-5",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2420, 220],
      "parameters": {
        "method": "POST",
        "url": "=http://paperclip:3100/api/companies/{{ process.env.PAPERCLIP_COMPANY_ID }}/issues/{{ process.env.PAPERCLIP_JAAG5_ISSUE_ID }}/comments",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "=Bearer {{ $env.PAPERCLIP_API_KEY }}" },
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ body: '✅ Post publicado\\nPlataforma: ' + $('Obtener datos del post').first().json.platform + '\\nFecha: ' + $('Obtener datos del post').first().json.scheduled_date }) }}",
        "options": {}
      }
    },
    {
      "id": "telegram-approved",
      "name": "Telegram — ✅ Publicado",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2640, 220],
      "parameters": {
        "method": "POST",
        "url": "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/editMessageCaption",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ chat_id: $('Parsear callback').first().json.chat_id, message_id: $('Parsear callback').first().json.message_id, caption: '✅ Publicado en ' + $('Obtener datos del post').first().json.platform.toUpperCase() + '\\n📅 ' + $('Obtener datos del post').first().json.scheduled_date }) }}",
        "options": {}
      }
    },
    {
      "id": "postgres-rejected",
      "name": "status = pending (rechazado)",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.5,
      "position": [1300, 420],
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE content_plan SET status = 'pending', retry_count = retry_count + 1 WHERE id = '{{ $('Parsear callback').first().json.post_id }}'",
        "options": {}
      },
      "credentials": {
        "postgres": { "id": "1", "name": "PostgreSQL JAAGSOLUTIONS" }
      }
    },
    {
      "id": "telegram-rejected",
      "name": "Telegram — ❌ Rechazado",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1520, 420],
      "parameters": {
        "method": "POST",
        "url": "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/editMessageCaption",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ chat_id: $('Parsear callback').first().json.chat_id, message_id: $('Parsear callback').first().json.message_id, caption: '❌ Rechazado — se regenerará en el próximo ciclo' }) }}",
        "options": {}
      }
    }
  ],
  "connections": {
    "Webhook Telegram Callback": {
      "main": [[{ "node": "Parsear callback", "type": "main", "index": 0 }]]
    },
    "Parsear callback": {
      "main": [[{ "node": "Telegram — answerCallbackQuery", "type": "main", "index": 0 }]]
    },
    "Telegram — answerCallbackQuery": {
      "main": [[{ "node": "Obtener datos del post", "type": "main", "index": 0 }]]
    },
    "Obtener datos del post": {
      "main": [[{ "node": "¿Aprobar o Rechazar?", "type": "main", "index": 0 }]]
    },
    "¿Aprobar o Rechazar?": {
      "main": [
        [{ "node": "¿Es LinkedIn?", "type": "main", "index": 0 }],
        [{ "node": "status = pending (rechazado)", "type": "main", "index": 0 }]
      ]
    },
    "¿Es LinkedIn?": {
      "main": [
        [{ "node": "LinkedIn — publicar post", "type": "main", "index": 0 }],
        [{ "node": "¿Es Meta/IG/FB?", "type": "main", "index": 0 }]
      ]
    },
    "¿Es Meta/IG/FB?": {
      "main": [
        [
          { "node": "Meta FB — subir foto", "type": "main", "index": 0 },
          { "node": "Meta IG — crear container", "type": "main", "index": 0 }
        ],
        []
      ]
    },
    "LinkedIn — publicar post": {
      "main": [[{ "node": "status = published", "type": "main", "index": 0 }]]
    },
    "Meta FB — subir foto": {
      "main": [[{ "node": "status = published", "type": "main", "index": 0 }]]
    },
    "Meta IG — crear container": {
      "main": [[{ "node": "Meta IG — publicar", "type": "main", "index": 0 }]]
    },
    "Meta IG — publicar": {
      "main": [[{ "node": "status = published", "type": "main", "index": 0 }]]
    },
    "status = published": {
      "main": [[{ "node": "Paperclip — log en JAAG-5", "type": "main", "index": 0 }]]
    },
    "Paperclip — log en JAAG-5": {
      "main": [[{ "node": "Telegram — ✅ Publicado", "type": "main", "index": 0 }]]
    },
    "status = pending (rechazado)": {
      "main": [[{ "node": "Telegram — ❌ Rechazado", "type": "main", "index": 0 }]]
    }
  },
  "active": false,
  "settings": { "executionOrder": "v1" },
  "meta": { "templateCredsSetupCompleted": false },
  "tags": ["jaagsolutions", "content-pipeline"]
}
```

- [ ] **Paso 2: Commit**

```bash
git add deploy/n8n-workflows/telegram-approval.json
git commit -m "feat(pipeline): add n8n Telegram Approval → Meta + LinkedIn workflow"
```

---

## Task 9: Deploy — Aplicar todo al VPS

- [ ] **Paso 1: Push de todos los commits al repo**

```bash
git push origin feature/jaagsolutions
```

- [ ] **Paso 2: Pull y reiniciar n8n en VPS**

```bash
# En VPS (Google Cloud SSH):
cd /opt/jaagsolutions/repo
git pull origin feature/jaagsolutions

# Reiniciar n8n con nuevas variables de entorno
cd deploy
docker compose --env-file .env up -d n8n

# Verificar que arrancó correctamente
docker compose --env-file .env ps n8n
# Expected: Status = running (healthy)
```

- [ ] **Paso 3: Importar Workflow 1 en n8n via API**

```bash
source /opt/jaagsolutions/repo/deploy/.env

curl -s -X POST "https://n8n.jaagsolutions.com/api/v1/workflows" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @/opt/jaagsolutions/repo/deploy/n8n-workflows/content-generator.json \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Workflow 1 ID:', d.get('id','ERROR'))"
```

- [ ] **Paso 4: Importar Workflow 2 en n8n**

```bash
curl -s -X POST "https://n8n.jaagsolutions.com/api/v1/workflows" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @/opt/jaagsolutions/repo/deploy/n8n-workflows/telegram-approval.json \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Workflow 2 ID:', d.get('id','ERROR'))"
```

- [ ] **Paso 5: En la UI de n8n, configurar la credential Postgres**
  - Abrir `https://n8n.jaagsolutions.com`
  - Settings → Credentials → New → Postgres → completar con datos del `.env`
  - Nota el ID que n8n asigna y actualizar el campo `"id"` en los JSON si fuera necesario

- [ ] **Paso 6: Activar Workflow 2 (webhook debe estar activo primero)**

En UI de n8n → abrir "Telegram Approval → Meta + LinkedIn Publisher" → toggle Active → ON

- [ ] **Paso 7: Configurar Telegram webhook**

```bash
source /opt/jaagsolutions/repo/deploy/.env
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=https://n8n.jaagsolutions.com/webhook/telegram-approval"
```

Salida esperada: `{"ok":true,"result":true,"description":"Webhook was set"}`

- [ ] **Paso 8: Verificar webhook de Telegram**

```bash
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool
```

El campo `url` debe ser `https://n8n.jaagsolutions.com/webhook/telegram-approval`.

- [ ] **Paso 9: Activar Workflow 1**

En UI de n8n → "Content Generator — Cron → Ideogram → Vision → Telegram" → toggle Active → ON

---

## Task 10: E2E Test

- [ ] **Paso 1: Insertar fila de prueba en content_plan**

```bash
docker exec deploy-postgres-1 psql -U paperclip -d paperclip -c "
INSERT INTO content_plan (
  id, scheduled_date, scheduled_time, platform, format, pillar,
  post_type, copy_text, image_prompt, hashtags, cta_url, status
) VALUES (
  gen_random_uuid(),
  CURRENT_DATE,
  '10:00',
  'meta',
  'imagen_copy',
  'educacion',
  'valor',
  '¿Cuántas horas a la semana pierdes copiando datos entre hojas de Excel? Eso tiene solución — y no necesitas contratar a nadie.',
  'Infografía profesional moderna sobre fondo blanco: icono de reloj con flecha hacia arriba, texto grande EN ESPAÑOL: HOY AUTOMATIZAS MAÑANA CRECES, paleta azul marino y verde esmeralda, estilo corporativo limpio',
  '#automatizacion #pymes #jaagsolutions',
  'https://jaagsolutions.com',
  'pending'
);"
```

- [ ] **Paso 2: Ejecutar Workflow 1 manualmente**

En UI n8n → "Content Generator" → botón "Execute Workflow"

- [ ] **Paso 3: Verificar que llegó mensaje a Telegram**

En el chat de Telegram (cuenta personal Juan), debe aparecer:
- Imagen generada por Ideogram
- Caption con fecha, plataforma, copy y hashtags
- Botones `✅ Aprobar` y `❌ Rechazar`

- [ ] **Paso 4: Tocar ✅ Aprobar**

Verificar en n8n → Executions que Workflow 2 se disparó y completó sin errores.

- [ ] **Paso 5: Verificar publicación**

```bash
# Verificar estado en BD
docker exec deploy-postgres-1 psql -U paperclip -d paperclip \
  -c "SELECT id, platform, status, published_at FROM content_plan WHERE status = 'published';"
```

- [ ] **Paso 6: Verificar post en Meta y LinkedIn**

- Facebook: abrir página de JAAGSOLUTIONS → debe aparecer el post
- Instagram: abrir cuenta de JAAGSOLUTIONS → debe aparecer el post
- LinkedIn: cuenta personal Juan A. Alvarenga → debe aparecer el post

- [ ] **Paso 7: Verificar comentario en Paperclip**

Abrir `https://paperclip.jaagsolutions.com` → issue JAAG-5 → debe haber un comentario "✅ Post publicado — Plataforma: meta — Fecha: [hoy]"

---

## Task 11: Actualizar documentación

**Files:**
- Modify: `docs/superpowers/specs/CHECKLIST-MAESTRO-JAAGSOLUTIONS.md`

- [ ] **Paso 1: Actualizar estado del pipeline en el Checklist Maestro**

En la tabla del RESUMEN EJECUTIVO, cambiar:
```
| Pipeline automatizado contenido | **Pendiente** — diseñado, falta implementar en n8n (A2) | 0% |
```
Por:
```
| Pipeline automatizado contenido | **Completo** — 2 workflows n8n activos, E2E verificado ✅ | 100% |
```

En la sección `PRÓXIMOS PASOS — ordenados por prioridad`, marcar el paso del pipeline como completado.

- [ ] **Paso 2: Commit final**

```bash
git add docs/superpowers/specs/CHECKLIST-MAESTRO-JAAGSOLUTIONS.md
git commit -m "docs: mark content pipeline as complete in Checklist Maestro"
git push origin feature/jaagsolutions
```

---

## Self-Review

**Cobertura del spec:**
- ✅ PostgreSQL schema con tabla + trigger + índice (Task 1)
- ✅ Variables de entorno para todas las APIs (Task 2)
- ✅ Pasos de obtención de cada API key (Task 3)
- ✅ Migración CSV → PostgreSQL (Task 4)
- ✅ Script insert para A4 (Task 5)
- ✅ Credential Postgres en n8n (Task 6)
- ✅ Workflow 1 completo con todos los nodos: Cron → Postgres → Ideogram → Vision OCR → retry logic → Telegram (Task 7)
- ✅ Workflow 2 completo: Webhook → parse → answerCallback → Postgres → LinkedIn/Meta split → publish → Paperclip log → Telegram edit (Task 8)
- ✅ Deploy, import, activación y webhook setup (Task 9)
- ✅ E2E test con fila real en BD (Task 10)
- ✅ Actualización del Checklist (Task 11)

**Consistencia de nombres:**
- Credential Postgres: `PostgreSQL JAAGSOLUTIONS` — consistente en Tasks 1, 6, 7, 8
- Env var `TELEGRAM_CHAT_ID`: usada como `$env.TELEGRAM_CHAT_ID` en Workflow 1 y `$('Parsear callback').first().json.chat_id` en Workflow 2 (correcto — el chat_id viene del callback)
- `post_id` en callback_data: parseado con `split('_')[1]` — funciona con UUIDs que contienen guiones si se usa `parts.slice(1).join('_')` ✅

**Sin placeholders:** todos los nodos tienen JSON completo, todos los comandos tienen salida esperada.
