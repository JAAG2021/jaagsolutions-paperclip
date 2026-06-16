# Pipeline Automatizado de Contenido — Meta + LinkedIn + Telegram
**Issue:** JAAG-5 | Proyecto P2 Demand Engine MVP  
**Agente responsable:** A2 — Automation Builder  
**Aprobación:** A3 Growth Ops → A0 CEO  
**Fecha:** 2026-05-11

---

## Contexto

JAAGSOLUTIONS publica contenido en LinkedIn (cuenta personal Juan A. Alvarenga), Instagram y Facebook siguiendo la estrategia del Mes 1 (70% valor / 30% conversión). La fuente operacional del plan de contenido es PostgreSQL `content_plan`; A4 crea registros en esa tabla y n8n procesa exclusivamente esos registros.

Este pipeline elimina todos los pasos manuales excepto uno: la aprobación de cada post vía Telegram antes de publicar.

---

## Objetivo

Construir dos workflows n8n que, dado un plan de contenido en PostgreSQL:
1. Generan automáticamente la imagen con Ideogram API
2. Validan el texto de la imagen con Google Vision OCR
3. Envían el post a Telegram para aprobación humana (Juan)
4. Publican en Meta (FB + IG) y LinkedIn al aprobar

Un solo paso manual: tocar ✅ en Telegram desde el móvil.

---

## Arquitectura

### Componentes

| Componente | Rol |
|-----------|-----|
| PostgreSQL | Fuente de verdad del plan de contenido — tabla `content_plan` |
| n8n Workflow 1 | Cron diario — genera imágenes y envía a Telegram |
| n8n Workflow 2 | Webhook Telegram — recibe aprobación y publica |
| Ideogram API | Generación de imágenes con texto incluido |
| Google Vision API | OCR — valida que el texto de la imagen es correcto |
| Telegram Bot | Canal de aprobación humana |
| Meta Graph API | Publicación en Facebook Page + Instagram Business |
| LinkedIn API | Publicación en cuenta personal (OAuth 2.0) |
| Paperclip API | Log de posts publicados en issue JAAG-5 |

### Diagrama de flujo general

```
[PostgreSQL content_plan]
         ↓ (Cron 8 AM)
[Workflow 1: Content Generator]
  Ideogram → Vision OCR → Telegram checkpoint
         ↓ (Juan toca ✅ en móvil)
[Workflow 2: Telegram Approval Handler]
  Meta Graph API (FB + IG) + LinkedIn API
         ↓
[PostgreSQL] status = 'published'
[Paperclip] log en JAAG-5
```

---

## Modelo de datos

### Tabla `content_plan`

```sql
CREATE TABLE content_plan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME NOT NULL DEFAULT '10:00',
  platform        TEXT NOT NULL,
  -- 'linkedin' | 'instagram' | 'facebook' | 'meta'
  -- 'meta' = publicar en FB + IG simultáneamente (2 llamadas API)
  format          TEXT NOT NULL,
  -- 'imagen_copy' | 'carrusel' | 'texto_largo' | 'reel'
  pillar          TEXT NOT NULL,
  -- 'educacion' | 'casos_de_uso' | 'prueba_social' | 'behind_the_scenes'
  post_type       TEXT NOT NULL,
  -- 'valor' | 'conversion'
  copy_text       TEXT NOT NULL,
  image_prompt    TEXT NOT NULL,
  hashtags        TEXT,
  cta_url         TEXT,
  image_url       TEXT,
  -- URL publica generada por compose-image
  status          TEXT NOT NULL DEFAULT 'pending',
  -- pending → generating → review → approved → published | error
  retry_count     INTEGER NOT NULL DEFAULT 0,
  telegram_msg_id TEXT,
  published_at    TIMESTAMPTZ,
  error_log       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_plan_updated_at
  BEFORE UPDATE ON content_plan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Aspect ratio por platform + format

| platform | format | aspect_ratio Ideogram |
|----------|--------|-----------------------|
| linkedin | imagen_copy | ASPECT_4_5 |
| linkedin | texto_largo | ASPECT_4_5 |
| instagram | imagen_copy | ASPECT_1_1 |
| instagram | carrusel | ASPECT_1_1 |
| instagram | reel | ASPECT_9_16 |
| meta | imagen_copy | ASPECT_1_1 |
| facebook | imagen_copy | ASPECT_4_5 |

## Workflow 1 — Content Generator

**Trigger:** Cron diario 8:00 AM  
**Propósito:** Procesar posts con `status = 'pending'` que tocan hoy o mañana

### Nodos

```
1. [Cron] 0 8 * * *

2. [Postgres] SELECT
   WHERE status = 'pending'
   AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 2
   ORDER BY scheduled_date, scheduled_time
   LIMIT 10

3. [IF] rowCount > 0
   No → Stop
   Sí → continuar

4. [SplitInBatches] batchSize = 1

5. [Postgres] UPDATE content_plan
   SET status = 'generating'
   WHERE id = {{ $json.id }}

6. [Code] Calcular aspect_ratio según platform + format

7. [HTTP Request] POST https://api.ideogram.ai/generate
   Headers: Api-Key: {{ $env.IDEOGRAM_API_KEY }}
   Body: {
     "image_request": {
       "prompt": "{{ $json.image_prompt }}",
       "aspect_ratio": "{{ $json.aspect_ratio }}",
       "model": "V_2",
       "magic_prompt_option": "OFF"
     }
   }

8. [HTTP Request] GET imagen URL → Binary
   Descargar a /opt/jaagsolutions/content/{{ $json.id }}.jpg

9. [Postgres] UPDATE image_url = public URL returned by compose-image

10. [HTTP Request] POST https://vision.googleapis.com/v1/images:annotate
    ?key={{ $env.GOOGLE_VISION_API_KEY }}
    Body: TEXT_DETECTION sobre la imagen descargada

11. [Code] Validar OCR
    - Extraer texto detectado
    - Verificar que palabras clave del copy están presentes
    - Si ok → continuar
    - Si falla Y retry_count < 3 → ir al nodo 12
    - Si falla Y retry_count = 3 → ir al nodo 13

12. [Postgres] UPDATE retry_count = retry_count + 1, status = 'pending'
    → volver al nodo 7

13. [Postgres] UPDATE status = 'error', error_log = '...'
    → Stop (alertar por Telegram en mensaje diferente)

14. [Postgres] UPDATE status = 'review'

15. [Telegram] sendPhoto
    chat_id: {{ $env.TELEGRAM_CHAT_ID }}
    photo: binary de la imagen
    caption: |
      📅 *{{ scheduled_date }} {{ scheduled_time }}*
      📱 {{ platform | upper }} — {{ pillar }}
      
      {{ copy_text }}
      
      {{ hashtags }}
    reply_markup: inline_keyboard
      [✅ Aprobar](aprobar_{{ id }})  [❌ Rechazar](rechazar_{{ id }})

16. [Postgres] UPDATE telegram_msg_id = {{ message_id }}
```

---

## Workflow 2 — Telegram Approval Handler

**Trigger:** Webhook `POST /webhook/telegram-approval`  
**Propósito:** Recibir callback de Telegram y publicar o rechazar

### Configuración Telegram

El bot debe tener configurado el webhook apuntando a:
`https://n8n.jaagsolutions.com/webhook/telegram-approval`

### Nodos

```
1. [Webhook] POST /webhook/telegram-approval
   Recibe: { callback_query: { data: "aprobar_<uuid>", message: {...} } }

2. [Code] Parsear callback
   action = data.split('_')[0]   // 'aprobar' | 'rechazar'
   post_id = data.split('_')[1]  // UUID

3. [HTTP Request] POST api.telegram.org/bot.../answerCallbackQuery
   callback_query_id: {{ callback_query.id }}
   text: "Procesando..."

4. [Postgres] SELECT * FROM content_plan WHERE id = {{ post_id }}

5. [IF] action = 'aprobar'
   Sí → nodo 6
   No → nodo 14

── RAMA APROBAR ──

6. [IF] platform = 'linkedin'
   Sí → nodo 7
   No → nodo 9

7. [HTTP Request] POST https://api.linkedin.com/v2/ugcPosts
   Authorization: Bearer {{ $env.LINKEDIN_ACCESS_TOKEN }}
   Body: ugcPost con image upload + commentary

8. → nodo 11

9. [IF] platform IN ('meta', 'instagram', 'facebook')

   Facebook Page:
   9a. [HTTP] POST graph.facebook.com/{PAGE_ID}/photos
       ?published=false → obtener photo_id
   9b. [HTTP] POST graph.facebook.com/{PAGE_ID}/feed
       message + attached_media photo_id

   Instagram:
   9c. [HTTP] POST graph.facebook.com/{IG_USER_ID}/media
       image_url + caption → obtener creation_id
   9d. [HTTP] POST graph.facebook.com/{IG_USER_ID}/media_publish
       creation_id

10. → nodo 11

11. [Postgres] UPDATE
    SET status = 'published', published_at = NOW()
    WHERE id = {{ post_id }}

12. [HTTP] POST paperclip:3100/api/companies/{COMPANY_ID}/issues/{JAAG5_ID}/comments
    Authorization: Bearer {{ $env.PAPERCLIP_API_KEY }}
    body: "✅ Post publicado: {{ platform }} — {{ scheduled_date }}"

13. [Telegram] editMessageCaption
    chat_id + message_id
    caption: "✅ Publicado en {{ platform }} el {{ scheduled_date }}"

── RAMA RECHAZAR ──

14. [Postgres] UPDATE
    SET status = 'pending', retry_count = retry_count + 1
    WHERE id = {{ post_id }}

15. [Telegram] editMessageCaption
    caption: "❌ Rechazado — se regenerará en el próximo ciclo"
```

---

## Variables de entorno requeridas

Agregar a `deploy/.env` en el VPS:

```bash
# Content Pipeline
IDEOGRAM_API_KEY=          # ideogram.ai → API → Create Key
GOOGLE_VISION_API_KEY=     # console.cloud.google.com → APIs → Vision → Credentials
TELEGRAM_BOT_TOKEN=        # @BotFather en Telegram → /newbot
TELEGRAM_CHAT_ID=          # ID del chat personal de Juan (usar @userinfobot)
META_PAGE_ACCESS_TOKEN=    # Meta for Developers → Graph API Explorer → token larga duración
META_PAGE_ID=              # ID de la Facebook Page de JAAGSOLUTIONS
META_IG_USER_ID=           # ID del Instagram Business account
LINKEDIN_ACCESS_TOKEN=     # LinkedIn Developer App → OAuth 2.0 → w_member_social
```

---

## Setup de APIs — pasos de obtención

### Ideogram API
1. Ir a `ideogram.ai` → cuenta `jaagsolutions@gmail.com`
2. Settings → API → Create API Key
3. Copiar key → `IDEOGRAM_API_KEY` en `.env`

### Google Vision API
1. `console.cloud.google.com` → proyecto existente (mismo que el VPS)
2. APIs & Services → Enable APIs → Cloud Vision API
3. Credentials → Create Credentials → API Key
4. Copiar → `GOOGLE_VISION_API_KEY` en `.env`

### Telegram Bot
1. Abrir Telegram → buscar `@BotFather` → `/newbot`
2. Nombre: `JAAGSOLUTIONS Content` / username: `jaagsolutions_content_bot`
3. Copiar token → `TELEGRAM_BOT_TOKEN` en `.env`
4. Enviar un mensaje al bot → buscar `@userinfobot` → obtener chat_id personal → `TELEGRAM_CHAT_ID`
5. Configurar webhook: `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://n8n.jaagsolutions.com/webhook/telegram-approval"`

### Meta Graph API
1. `developers.facebook.com` → cuenta `jaagsolutions@gmail.com`
2. My Apps → Create App → Business → conectar a JAAGSOLUTIONS Page
3. Graph API Explorer → seleccionar App → generar token con permisos:
   - `pages_manage_posts`, `pages_read_engagement`
   - `instagram_basic`, `instagram_content_publish`
4. Extender token a larga duración (60 días): Graph API Explorer → Access Token Debugger → Extend
5. `META_PAGE_ID`: Settings → Page Info → Page ID
6. `META_IG_USER_ID`: GET `/{META_PAGE_ID}?fields=instagram_business_account`

### LinkedIn API
1. `linkedin.com/developers` → cuenta personal Juan A. Alvarenga
2. Create App → nombre: `JAAGSOLUTIONS Automation`
3. Products → Request access: `Share on LinkedIn` + `Sign In with LinkedIn`
4. Auth → OAuth 2.0 settings → redirect URL: `https://n8n.jaagsolutions.com/oauth2/callback`
5. Scopes requeridos: `w_member_social`, `r_liteprofile`
6. En n8n: Credentials → LinkedIn OAuth2 API → Connect (flujo OAuth)

---

## Script de escritura para A4

**Archivo:** `deploy/scripts/insert-content-plan.py`

A4 ejecuta este script para agregar nuevos posts al plan. Acepta argumentos CLI o lee de stdin (JSON).

```bash
# Ejemplo de uso por A4:
python3 /paperclip/workspace/insert-content-plan.py \
  --date "2026-06-02" \
  --time "10:00" \
  --platform "linkedin" \
  --format "imagen_copy" \
  --pillar "educacion" \
  --type "valor" \
  --copy "Tu negocio puede hacer más sin contratar más..." \
  --prompt "Professional editorial image showing an abstract automation process..." \
  --hashtags "#automatizacion #pymes #n8n"
```

---

## Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `deploy/n8n-workflows/content-generator.json` | Workflow 1 — Cron + Ideogram + Vision + Telegram |
| `deploy/n8n-workflows/telegram-approval.json` | Workflow 2 — Webhook + Meta + LinkedIn |
| `deploy/scripts/insert-content-plan.py` | Script de inserción para A4 |
| `deploy/sql/content-plan-schema.sql` | DDL de la tabla + trigger |

---

## Criterios de aceptación

- [ ] Tabla `content_plan` creada en PostgreSQL de producción
- [ ] Posts futuros cargados directamente en `content_plan` con status correcto
- [ ] Workflow 1 activo: cron dispara, genera imagen, envía a Telegram
- [ ] Workflow 2 activo: ✅ Aprobar publica en Meta y LinkedIn; ❌ Rechazar reprograma
- [ ] OCR valida texto de imagen (reintenta hasta 3 veces si falla)
- [ ] Post publicado queda registrado en issue JAAG-5 de Paperclip
- [ ] Script `insert-content-plan.py` funcional para que A4 agregue contenido nuevo
- [ ] Variables de entorno documentadas y configuradas en `deploy/.env`
- [ ] Prueba E2E completa: row en DB → Telegram → aprobar → post visible en Meta y LinkedIn
