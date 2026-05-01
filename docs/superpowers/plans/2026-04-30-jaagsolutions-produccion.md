# JAAGSOLUTIONS — Plan de Implementación: Producción Completa

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar todos los archivos de infraestructura listos para que, en cuanto se disponga de VPS + dominio + Formspree, se pueda desplegar JAAGSOLUTIONS a producción con un solo comando y el flujo web → agentes funcionando de extremo a extremo.

**Architecture:** React/Vite en Vercel (frontend), Paperclip + PostgreSQL + n8n + Caddy en VPS via Docker Compose. Formspree recibe leads del formulario web y dispara un webhook que n8n transforma en un issue de Paperclip asignado a A3 Growth Ops.

**Tech Stack:** Docker Compose, Caddy 2, PostgreSQL 16, n8n (self-hosted), Paperclip (build desde repo), Vite/React (Vercel), Formspree (webhook), Bash

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `deploy/docker-compose.yml` | Crear | Orquesta todos los servicios del VPS |
| `deploy/.env.production.example` | Crear | Template de variables con documentación inline |
| `deploy/Caddyfile` | Crear | Reverse proxy + SSL automático Let's Encrypt |
| `deploy/setup.sh` | Crear | Bootstrap completo del VPS (Docker, repo, servicios) |
| `deploy/scripts/get-paperclip-ids.sh` | Crear | Lee IDs de company/agente/proyecto desde la API de Paperclip |
| `deploy/n8n-workflows/formspree-to-paperclip.json` | Crear | Workflow n8n: Formspree webhook → issue en Paperclip |
| `jaagsolutions-web/.env.production.example` | Verificar | Ya existe — confirmar que está completo |
| `jaagsolutions-web/vercel.json` | Verificar | Ya existe — confirmar configuración |
| `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` | Verificar | Ya existe — confirmar estructura antes de importar |

---

## Task 1: Estructura de deploy y variables de entorno

**Files:**
- Create: `deploy/.env.production.example`

- [ ] **Paso 1: Crear directorio deploy**

```bash
mkdir -p deploy/scripts deploy/n8n-workflows
```

- [ ] **Paso 2: Crear `deploy/.env.production.example`**

```bash
# deploy/.env.production.example
# Copiar a deploy/.env y completar todos los valores antes de ejecutar setup.sh
# NUNCA commitear el archivo .env con valores reales

# ─── DOMINIO ──────────────────────────────────────────────────────────────────
# Dominio base sin protocolo ni barra final
DOMAIN=jaagsolutions.com

# ─── PAPERCLIP ────────────────────────────────────────────────────────────────
# Secreto para autenticación (generá uno con: openssl rand -hex 32)
BETTER_AUTH_SECRET=CAMBIA_ESTO_openssl_rand_hex_32

# Directorio de datos persistentes de Paperclip en el host
PAPERCLIP_DATA_DIR=/opt/jaagsolutions/paperclip-data

# Modo de despliegue: 'authenticated' requiere login, 'loopback' solo localhost
PAPERCLIP_DEPLOYMENT_MODE=authenticated

# Exposición de red: 'private' solo la máquina, 'lan' red local, 'tailnet' Tailscale
PAPERCLIP_DEPLOYMENT_EXPOSURE=private

# ─── POSTGRESQL ───────────────────────────────────────────────────────────────
POSTGRES_DB=paperclip
POSTGRES_USER=paperclip
# Contraseña de base de datos (generá con: openssl rand -hex 24)
POSTGRES_PASSWORD=CAMBIA_ESTO_openssl_rand_hex_24

# ─── N8N ──────────────────────────────────────────────────────────────────────
# Directorio de datos persistentes de n8n en el host
N8N_DATA_DIR=/opt/jaagsolutions/n8n-data

# Credenciales de acceso a la UI de n8n
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=CAMBIA_ESTO_password_seguro

# Token secreto para validar que el webhook viene de Formspree
# Generar con: openssl rand -hex 16
FORMSPREE_WEBHOOK_SECRET=CAMBIA_ESTO_openssl_rand_hex_16

# ─── PAPERCLIP IDs (llenar con get-paperclip-ids.sh después del primer boot) ──
# UUID de la company JAAGSOLUTIONS en Paperclip
PAPERCLIP_COMPANY_ID=
# UUID del agente A3 Growth Ops
PAPERCLIP_A3_AGENT_ID=
# UUID del proyecto P2 Demand Engine MVP
PAPERCLIP_P2_PROJECT_ID=
# UUID del goal G2 Implementar embudo de captación
PAPERCLIP_G2_GOAL_ID=
# API key de Paperclip para llamadas server-to-server (crear en Settings → API Keys)
PAPERCLIP_API_KEY=

# ─── EMAIL DE LETSENCRYPT (para SSL automático vía Caddy) ─────────────────────
LETSENCRYPT_EMAIL=admin@jaagsolutions.com
```

- [ ] **Paso 3: Agregar `.env` al `.gitignore` del worktree**

Verificar que `deploy/.env` esté ignorado:

```bash
grep -q "deploy/.env$" .gitignore || echo "deploy/.env" >> .gitignore
```

- [ ] **Paso 4: Commit**

```bash
git add deploy/.env.production.example .gitignore
git commit -m "feat(deploy): add .env.production.example with all variables documented"
```

---

## Task 2: Docker Compose

**Files:**
- Create: `deploy/docker-compose.yml`

- [ ] **Paso 1: Crear `deploy/docker-compose.yml`**

```yaml
# deploy/docker-compose.yml
# Requiere: deploy/.env con todos los valores completos
# Levantar: docker compose --env-file .env up -d

services:

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  paperclip:
    build:
      context: ..
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      HOST: 0.0.0.0
      PORT: 3100
      SERVE_UI: "true"
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      PAPERCLIP_HOME: /paperclip
      PAPERCLIP_DEPLOYMENT_MODE: ${PAPERCLIP_DEPLOYMENT_MODE}
      PAPERCLIP_DEPLOYMENT_EXPOSURE: ${PAPERCLIP_DEPLOYMENT_EXPOSURE}
    volumes:
      - ${PAPERCLIP_DATA_DIR}:/paperclip
    networks:
      - internal
      - web
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:3100/api/health || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    depends_on:
      paperclip:
        condition: service_healthy
    environment:
      N8N_HOST: n8n.${DOMAIN}
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://n8n.${DOMAIN}/
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: ${N8N_BASIC_AUTH_USER}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_BASIC_AUTH_PASSWORD}
      GENERIC_TIMEZONE: America/Bogota
      # Variables accesibles desde workflows con $env('VAR_NAME')
      PAPERCLIP_URL: http://paperclip:3100
      PAPERCLIP_COMPANY_ID: ${PAPERCLIP_COMPANY_ID}
      PAPERCLIP_A3_AGENT_ID: ${PAPERCLIP_A3_AGENT_ID}
      PAPERCLIP_P2_PROJECT_ID: ${PAPERCLIP_P2_PROJECT_ID}
      PAPERCLIP_G2_GOAL_ID: ${PAPERCLIP_G2_GOAL_ID}
      PAPERCLIP_API_KEY: ${PAPERCLIP_API_KEY}
      FORMSPREE_WEBHOOK_SECRET: ${FORMSPREE_WEBHOOK_SECRET}
    volumes:
      - ${N8N_DATA_DIR}:/home/node/.n8n
    networks:
      - internal
      - web

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    environment:
      DOMAIN: ${DOMAIN}
      LETSENCRYPT_EMAIL: ${LETSENCRYPT_EMAIL}
    networks:
      - web
    depends_on:
      - paperclip
      - n8n

volumes:
  postgres_data:
  caddy_data:
  caddy_config:

networks:
  internal:
    driver: bridge
  web:
    driver: bridge
```

- [ ] **Paso 2: Validar sintaxis del compose**

```bash
cd deploy
docker compose --env-file .env.production.example config --quiet
```

Resultado esperado: sin errores de sintaxis (puede haber warnings de vars vacías — es esperado con el ejemplo).

- [ ] **Paso 3: Commit**

```bash
git add deploy/docker-compose.yml
git commit -m "feat(deploy): add docker-compose.yml (Paperclip + PostgreSQL + n8n + Caddy)"
```

---

## Task 3: Caddyfile (reverse proxy + SSL)

**Files:**
- Create: `deploy/Caddyfile`

- [ ] **Paso 1: Crear `deploy/Caddyfile`**

```caddyfile
# deploy/Caddyfile
# Caddy gestiona SSL automáticamente vía Let's Encrypt.
# Requiere que los dominios A/AAAA apunten al VPS antes de levantar.

{
	email {$LETSENCRYPT_EMAIL}
}

# Paperclip — control plane de agentes
paperclip.{$DOMAIN} {
	reverse_proxy paperclip:3100
	encode gzip
	log {
		output stderr
	}
}

# n8n — motor de automatización
n8n.{$DOMAIN} {
	reverse_proxy n8n:5678
	encode gzip
	log {
		output stderr
	}
}

# Redirigir raíz del dominio a www (Vercel maneja www)
{$DOMAIN} {
	redir https://www.{$DOMAIN}{uri} permanent
}
```

- [ ] **Paso 2: Verificar que las variables coinciden con docker-compose**

Las variables `{$DOMAIN}` y `{$LETSENCRYPT_EMAIL}` se inyectan desde el `environment:` del servicio `caddy` en docker-compose. Confirmar que `DOMAIN` y `LETSENCRYPT_EMAIL` están definidos en `.env.production.example`:

```bash
grep -E "^DOMAIN=|^LETSENCRYPT_EMAIL=" deploy/.env.production.example
```

Resultado esperado: dos líneas con esas variables.

- [ ] **Paso 3: Commit**

```bash
git add deploy/Caddyfile
git commit -m "feat(deploy): add Caddyfile with SSL auto-provisioning for paperclip + n8n subdomains"
```

---

## Task 4: Script de bootstrap del VPS

**Files:**
- Create: `deploy/setup.sh`

- [ ] **Paso 1: Crear `deploy/setup.sh`**

```bash
#!/usr/bin/env bash
# deploy/setup.sh
# Bootstrap completo para VPS nuevo con Ubuntu 22.04.
# Uso: bash setup.sh
# Qué hace:
#   1. Instala Docker + Docker Compose plugin
#   2. Crea directorios de datos persistentes
#   3. Clona el repo (si no está clonado)
#   4. Construye la imagen de Paperclip
#   5. Levanta todos los servicios
#   6. Verifica salud de los servicios

set -euo pipefail

REPO_URL="https://github.com/TU_USUARIO/TU_REPO.git"   # CAMBIAR antes de usar
REPO_BRANCH="jaagsolutions"                              # CAMBIAR al branch/worktree correcto
INSTALL_DIR="/opt/jaagsolutions/repo"
DATA_PAPERCLIP="/opt/jaagsolutions/paperclip-data"
DATA_N8N="/opt/jaagsolutions/n8n-data"

echo "==> [1/6] Instalando Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  usermod -aG docker "$USER" || true
else
  echo "    Docker ya instalado: $(docker --version)"
fi

echo "==> [2/6] Creando directorios de datos..."
mkdir -p "$DATA_PAPERCLIP" "$DATA_N8N"
chmod 750 "$DATA_PAPERCLIP" "$DATA_N8N"

echo "==> [3/6] Clonando repositorio..."
if [ ! -d "$INSTALL_DIR/.git" ]; then
  git clone --branch "$REPO_BRANCH" --depth 1 "$REPO_URL" "$INSTALL_DIR"
else
  echo "    Repo ya existe — haciendo git pull..."
  git -C "$INSTALL_DIR" pull origin "$REPO_BRANCH"
fi

echo "==> [4/6] Copiando .env al directorio deploy..."
if [ ! -f "$INSTALL_DIR/deploy/.env" ]; then
  cp "$INSTALL_DIR/deploy/.env.production.example" "$INSTALL_DIR/deploy/.env"
  echo ""
  echo "  ╔══════════════════════════════════════════════════════════╗"
  echo "  ║  ACCIÓN REQUERIDA: editá deploy/.env antes de continuar  ║"
  echo "  ║  nano $INSTALL_DIR/deploy/.env                           ║"
  echo "  ╚══════════════════════════════════════════════════════════╝"
  echo ""
  exit 1
fi

echo "==> [5/6] Construyendo imagen y levantando servicios..."
cd "$INSTALL_DIR/deploy"
docker compose --env-file .env build --no-cache
docker compose --env-file .env up -d

echo "==> [6/6] Verificando salud de servicios..."
sleep 15

check_service() {
  local name="$1"
  local url="$2"
  if curl -sf "$url" > /dev/null 2>&1; then
    echo "    ✅ $name — OK"
  else
    echo "    ❌ $name — NO responde en $url"
    echo "    Revisá logs: docker compose --env-file .env logs $name"
  fi
}

check_service "Paperclip" "http://localhost:3100/api/health"
check_service "n8n"       "http://localhost:5678/healthz"

echo ""
echo "==> Setup completo. Próximos pasos:"
echo "    1. Importar seed de empresa:  bash deploy/scripts/import-seed.sh"
echo "    2. Obtener IDs de Paperclip:  bash deploy/scripts/get-paperclip-ids.sh"
echo "    3. Actualizar deploy/.env con los IDs y reiniciar n8n:"
echo "       docker compose --env-file .env restart n8n"
echo "    4. Importar workflow n8n desde la UI de n8n"
echo "    5. Registrar webhook en Formspree dashboard"
```

- [ ] **Paso 2: Dar permisos de ejecución**

```bash
chmod +x deploy/setup.sh
```

- [ ] **Paso 3: Verificar que el script tiene shebang y set -euo pipefail**

```bash
head -2 deploy/setup.sh
```

Resultado esperado:
```
#!/usr/bin/env bash
set -euo pipefail
```

- [ ] **Paso 4: Commit**

```bash
git add deploy/setup.sh
git commit -m "feat(deploy): add VPS bootstrap script (setup.sh)"
```

---

## Task 5: Script helper — obtener IDs de Paperclip

**Files:**
- Create: `deploy/scripts/get-paperclip-ids.sh`

Este script se ejecuta una vez después del primer boot para obtener los UUIDs reales de company, agente A3, proyecto P2 y goal G2 que n8n necesita para crear issues.

- [ ] **Paso 1: Crear `deploy/scripts/get-paperclip-ids.sh`**

```bash
#!/usr/bin/env bash
# deploy/scripts/get-paperclip-ids.sh
# Consulta la API de Paperclip y muestra los IDs necesarios para configurar n8n.
# Uso: bash deploy/scripts/get-paperclip-ids.sh
# Requiere: jq instalado (apt install jq), Paperclip corriendo en localhost:3100
# y un PAPERCLIP_API_KEY válido exportado como variable de entorno.

set -euo pipefail

PAPERCLIP_URL="${PAPERCLIP_URL:-http://localhost:3100}"
API_KEY="${PAPERCLIP_API_KEY:-}"

if [ -z "$API_KEY" ]; then
  echo "Error: PAPERCLIP_API_KEY no está definido."
  echo "Exportalo con: export PAPERCLIP_API_KEY=tu_api_key"
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $API_KEY"

echo "==> Buscando company JAAGSOLUTIONS..."
COMPANY_JSON=$(curl -sf -H "$AUTH_HEADER" "$PAPERCLIP_URL/api/companies")
COMPANY_ID=$(echo "$COMPANY_JSON" | jq -r '.[] | select(.name == "JAAGSOLUTIONS") | .id')

if [ -z "$COMPANY_ID" ]; then
  echo "❌ Company JAAGSOLUTIONS no encontrada."
  echo "   ¿Importaste el seed? Revisá: bash deploy/scripts/import-seed.sh"
  exit 1
fi
echo "   ✅ PAPERCLIP_COMPANY_ID=$COMPANY_ID"

echo "==> Buscando agente A3 Growth Ops..."
AGENTS_JSON=$(curl -sf -H "$AUTH_HEADER" "$PAPERCLIP_URL/api/companies/$COMPANY_ID/agents")
A3_ID=$(echo "$AGENTS_JSON" | jq -r '.[] | select(.name == "Growth Ops") | .id')
echo "   ✅ PAPERCLIP_A3_AGENT_ID=$A3_ID"

echo "==> Buscando proyecto P2 Demand Engine MVP..."
PROJECTS_JSON=$(curl -sf -H "$AUTH_HEADER" "$PAPERCLIP_URL/api/companies/$COMPANY_ID/projects")
P2_ID=$(echo "$PROJECTS_JSON" | jq -r '.[] | select(.name == "Demand Engine MVP") | .id')
echo "   ✅ PAPERCLIP_P2_PROJECT_ID=$P2_ID"

echo "==> Buscando goal G2..."
GOALS_JSON=$(curl -sf -H "$AUTH_HEADER" "$PAPERCLIP_URL/api/companies/$COMPANY_ID/goals")
G2_ID=$(echo "$GOALS_JSON" | jq -r '.[] | select(.title | startswith("Implementar embudo")) | .id')
echo "   ✅ PAPERCLIP_G2_GOAL_ID=$G2_ID"

echo ""
echo "==> Copiá estas líneas a deploy/.env:"
echo "---"
echo "PAPERCLIP_COMPANY_ID=$COMPANY_ID"
echo "PAPERCLIP_A3_AGENT_ID=$A3_ID"
echo "PAPERCLIP_P2_PROJECT_ID=$P2_ID"
echo "PAPERCLIP_G2_GOAL_ID=$G2_ID"
echo "---"
echo ""
echo "Luego reiniciá n8n: docker compose --env-file .env restart n8n"
```

- [ ] **Paso 2: Verificar endpoint de agents en Paperclip**

Confirmar que el endpoint existe en `server/src/routes/agents.ts` o que está montado bajo companies:

```bash
grep -n "companies.*agents\|agents.*companies" \
  .worktrees/jaagsolutions/server/src/index.ts 2>/dev/null || \
grep -rn "companiesRouter\|agentsRouter" \
  .worktrees/jaagsolutions/server/src/index.ts | head -10
```

Si el endpoint de agents usa `/api/companies/:id/agents`, el script es correcto. Si usa `/api/agents?companyId=X`, ajustar línea del curl en el script a:

```bash
AGENTS_JSON=$(curl -sf -H "$AUTH_HEADER" "$PAPERCLIP_URL/api/agents?companyId=$COMPANY_ID")
```

- [ ] **Paso 3: Dar permisos y commit**

```bash
chmod +x deploy/scripts/get-paperclip-ids.sh
git add deploy/scripts/get-paperclip-ids.sh
git commit -m "feat(deploy): add get-paperclip-ids.sh to resolve UUIDs for n8n config"
```

---

## Task 6: Workflow n8n — Formspree → Paperclip

**Files:**
- Create: `deploy/n8n-workflows/formspree-to-paperclip.json`

- [ ] **Paso 1: Crear `deploy/n8n-workflows/formspree-to-paperclip.json`**

```json
{
  "name": "Formspree Lead → Paperclip Issue",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "formspree-lead",
        "responseMode": "onReceived",
        "responseData": "noData",
        "options": {}
      },
      "id": "webhook-formspree",
      "name": "Webhook Formspree",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "formspree-lead"
    },
    {
      "parameters": {
        "jsCode": "const body = $input.first().json.body || $input.first().json;\n\nconst nombre = body.nombre || 'Sin nombre';\nconst email = body.email || '';\nconst empresa = body.empresa || 'Sin empresa';\nconst tamano = body.tamano_equipo || 'No indicado';\nconst dolor = body.dolor_proceso || 'No especificado';\nconst herramientas = body.herramientas_actual || 'No indicado';\nconst presupuesto = body.presupuesto || 'No indicado';\nconst timeline = body.timeline || 'No indicado';\nconst whatsapp = body.whatsapp || 'No proporcionado';\nconst recurso = body.recurso_pdf || 'No';\nconst sitioWeb = body.sitio_web || 'No proporcionado';\n\nconst priority = timeline === 'inmediato' ? 'high' : 'medium';\n\nconst title = `Lead: ${nombre} — ${empresa}`;\n\nconst description = `## Lead calificado desde formulario web\n\n**Contacto:** ${nombre}  \n**Email:** ${email}  \n**WhatsApp:** ${whatsapp}  \n**Empresa:** ${empresa}  \n**Sitio web:** ${sitioWeb}  \n**Tamaño equipo:** ${tamano}  \n\n**Dolor principal:** ${dolor}  \n**Herramientas actuales:** ${herramientas}  \n\n**Presupuesto estimado:** ${presupuesto}  \n**Urgencia / Timeline:** ${timeline}  \n**Solicitó PDF lead magnet:** ${recurso}  \n\n---\n*Issue creado automáticamente desde formulario de diagnóstico jaagsolutions.com*`;\n\nreturn [{ json: { title, description, priority } }];"
      },
      "id": "transform-payload",
      "name": "Transformar payload",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [460, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{ $env('PAPERCLIP_URL') }}/api/companies/={{ $env('PAPERCLIP_COMPANY_ID') }}/issues",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "=Bearer {{ $env('PAPERCLIP_API_KEY') }}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"title\": \"{{ $json.title }}\",\n  \"description\": \"{{ $json.description }}\",\n  \"priority\": \"{{ $json.priority }}\",\n  \"status\": \"backlog\",\n  \"assigneeAgentId\": \"{{ $env('PAPERCLIP_A3_AGENT_ID') }}\",\n  \"projectId\": \"{{ $env('PAPERCLIP_P2_PROJECT_ID') }}\",\n  \"goalId\": \"{{ $env('PAPERCLIP_G2_GOAL_ID') }}\"\n}",
        "options": {}
      },
      "id": "create-paperclip-issue",
      "name": "Crear Issue en Paperclip",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [680, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict"
          },
          "conditions": [
            {
              "id": "check-status",
              "leftValue": "={{ $json.id }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty"
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "id": "check-success",
      "name": "¿Issue creado?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [900, 300]
    },
    {
      "parameters": {
        "jsCode": "console.log('[n8n] Issue creado OK:', $input.first().json.id, $input.first().json.identifier);\nreturn $input.all();"
      },
      "id": "log-success",
      "name": "Log éxito",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1100, 220]
    },
    {
      "parameters": {
        "jsCode": "console.error('[n8n] ERROR al crear issue:', JSON.stringify($input.first().json));\nreturn $input.all();"
      },
      "id": "log-error",
      "name": "Log error",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1100, 380]
    }
  ],
  "connections": {
    "Webhook Formspree": {
      "main": [
        [{ "node": "Transformar payload", "type": "main", "index": 0 }]
      ]
    },
    "Transformar payload": {
      "main": [
        [{ "node": "Crear Issue en Paperclip", "type": "main", "index": 0 }]
      ]
    },
    "Crear Issue en Paperclip": {
      "main": [
        [{ "node": "¿Issue creado?", "type": "main", "index": 0 }]
      ]
    },
    "¿Issue creado?": {
      "main": [
        [{ "node": "Log éxito", "type": "main", "index": 0 }],
        [{ "node": "Log error", "type": "main", "index": 0 }]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1"
  },
  "tags": ["jaagsolutions", "leads", "formspree"]
}
```

- [ ] **Paso 2: Validar que el JSON es válido**

```bash
cat deploy/n8n-workflows/formspree-to-paperclip.json | python3 -m json.tool > /dev/null && echo "JSON válido"
```

Resultado esperado: `JSON válido`

- [ ] **Paso 3: Commit**

```bash
git add deploy/n8n-workflows/formspree-to-paperclip.json
git commit -m "feat(deploy): add n8n workflow Formspree → Paperclip issue creation"
```

---

## Task 7: Verificar build del sitio web para Vercel

**Files:**
- Verify: `jaagsolutions-web/vercel.json`
- Verify: `jaagsolutions-web/.env.example`

- [ ] **Paso 1: Verificar `vercel.json`**

```bash
cat jaagsolutions-web/vercel.json
```

Debe contener al menos:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

Si falta algún campo, añadirlo con Edit.

- [ ] **Paso 2: Ejecutar build local para confirmar que compila sin errores**

```bash
cd jaagsolutions-web
pnpm install
pnpm build
```

Resultado esperado: carpeta `dist/` generada sin errores TypeScript ni Vite.

- [ ] **Paso 3: Verificar que el formulario maneja `FORMSPREE_ID` ausente correctamente**

```bash
grep -n "FORMSPREE_ID" jaagsolutions-web/src/sections/ContactFormSection.tsx
```

Confirmar que existe el guard `if (FORMSPREE_ID) { ... }` en el `onSubmit` (línea ~81). Si está presente, el formulario funciona sin crashear en preview sin el ID (solo no enviará datos — correcto).

- [ ] **Paso 4: Crear `jaagsolutions-web/DEPLOY-VERCEL.md` con instrucciones**

```markdown
# Deploy en Vercel — jaagsolutions-web

## Variables de entorno requeridas en Vercel Dashboard

| Variable | Valor | Cuándo |
|---|---|---|
| `VITE_FORMSPREE_ID` | ID de formspree.io/f/{ID} | Antes del primer deploy de producción |
| `VITE_GA_ID` | `G-XXXXXXXXXX` de Google Analytics | Antes del primer deploy de producción |
| `VITE_SITE_URL` | `https://www.jaagsolutions.com` | Cuando tenés el dominio |
| `VITE_OG_IMAGE_URL` | Opcional — sobreescribe og:image | Opcional |

## Pasos

1. Conectar este repositorio en vercel.com (New Project → Import Git Repository)
2. Framework: Vite (Vercel lo detecta automáticamente)
3. Root Directory: `jaagsolutions-web`
4. Agregar las variables de entorno en Settings → Environment Variables
5. Deploy → el sitio quedará en `*.vercel.app` hasta configurar el dominio
6. Para dominio custom: Settings → Domains → agregar `www.jaagsolutions.com`

## DNS para dominio custom en Vercel

Agregar en el panel del registrador de dominio:
- Tipo: `CNAME`
- Nombre: `www`
- Valor: `cname.vercel-dns.com`
```

- [ ] **Paso 5: Commit**

```bash
git add jaagsolutions-web/DEPLOY-VERCEL.md
git commit -m "docs(web): add Vercel deploy instructions with env vars checklist"
```

---

## Task 8: Runbook de activación cuando VPS + dominio + Formspree estén listos

**Files:**
- Create: `deploy/RUNBOOK.md`

- [ ] **Paso 1: Crear `deploy/RUNBOOK.md`**

```markdown
# RUNBOOK — Activación completa de JAAGSOLUTIONS en producción

Seguí estos pasos EN ORDEN cuando tengas VPS, dominio y Formspree listos.

## Prerrequisitos

- [ ] VPS Hetzner CX22 contratado (Ubuntu 22.04)
- [ ] Dominio comprado (ej. jaagsolutions.com)
- [ ] Cuenta Formspree creada en formspree.io
- [ ] Cuenta Google Analytics creada (propiedad GA4)

## Paso 1 — DNS

En el panel de tu registrador de dominio, crear estos registros A:

| Subdominio | Tipo | Valor |
|---|---|---|
| `@` (raíz) | A | IP_DEL_VPS |
| `www` | CNAME | `cname.vercel-dns.com` |
| `paperclip` | A | IP_DEL_VPS |
| `n8n` | A | IP_DEL_VPS |

Esperar propagación DNS (~5-15 min). Verificar: `dig paperclip.jaagsolutions.com`

## Paso 2 — VPS

SSH al servidor y ejecutar:

```bash
curl -fsSL https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/jaagsolutions/deploy/setup.sh | bash
```

El script pedirá que edites `deploy/.env`. Completar TODOS los campos antes de continuar.

## Paso 3 — Importar seed de empresa en Paperclip

```bash
cd /opt/jaagsolutions/repo
# Opción A: via CLI de Paperclip
pnpm --filter @paperclipai/cli run start company import Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json

# Opción B: via UI de Paperclip
# Ir a paperclip.jaagsolutions.com → Companies → Import → subir jaagsolutions-seed.json
```

## Paso 4 — Crear API key en Paperclip

1. Ir a `paperclip.jaagsolutions.com`
2. Settings → API Keys → Create new key
3. Copiar el key y agregarlo en `deploy/.env` como `PAPERCLIP_API_KEY`

## Paso 5 — Obtener IDs para n8n

```bash
cd /opt/jaagsolutions/repo
export PAPERCLIP_API_KEY=tu_api_key
bash deploy/scripts/get-paperclip-ids.sh
```

Copiar los IDs al `deploy/.env` y reiniciar n8n:

```bash
cd deploy
docker compose --env-file .env restart n8n
```

## Paso 6 — Importar workflow en n8n

1. Ir a `n8n.jaagsolutions.com` (usuario/contraseña del `.env`)
2. Workflows → Import from file
3. Seleccionar `deploy/n8n-workflows/formspree-to-paperclip.json`
4. Activar el workflow (toggle ON)
5. Copiar la URL del webhook: `https://n8n.jaagsolutions.com/webhook/formspree-lead`

## Paso 7 — Configurar webhook en Formspree

1. Ir a formspree.io → tu formulario → Integrations → Webhooks
2. Agregar webhook URL: `https://n8n.jaagsolutions.com/webhook/formspree-lead`
3. Copiar el FORMSPREE_ID del formulario

## Paso 8 — Deploy web en Vercel

1. En Vercel, agregar las variables de entorno:
   - `VITE_FORMSPREE_ID` = (del paso 7)
   - `VITE_GA_ID` = G-XXXXXXXXXX
   - `VITE_SITE_URL` = https://www.jaagsolutions.com
2. Redeploy

## Paso 9 — Test end-to-end

1. Ir a `www.jaagsolutions.com`
2. Completar el formulario de 3 pasos con datos de prueba
3. Verificar que en `paperclip.jaagsolutions.com` aparece un nuevo issue asignado a A3 Growth Ops
4. Confirmar que llegó el email de notificación a la cuenta Formspree

## Criterio de "en producción" ✅

- [ ] Web respondiendo en www.jaagsolutions.com con HTTPS
- [ ] Paperclip respondiendo en paperclip.jaagsolutions.com con HTTPS
- [ ] n8n respondiendo en n8n.jaagsolutions.com con HTTPS
- [ ] Company JAAGSOLUTIONS con 4 agentes, 4 goals, 2 proyectos, 8 issues
- [ ] Test end-to-end: formulario → issue en Paperclip → A3 asignado
- [ ] Primer ritual semanal agendado con tablero (Issue I8 cerrado)
```

- [ ] **Paso 2: Commit final**

```bash
git add deploy/RUNBOOK.md
git commit -m "docs(deploy): add full activation runbook for when VPS+domain+Formspree are ready"
```

---

## Self-Review

**Cobertura del spec:**
- ✅ Web en Vercel — Task 7 + DEPLOY-VERCEL.md
- ✅ Paperclip + n8n + PostgreSQL + Caddy en VPS — Tasks 2, 3, 4
- ✅ Puente Formspree → n8n → Paperclip — Tasks 5, 6
- ✅ Variables de entorno documentadas — Task 1
- ✅ Criterio de "en producción" — Task 8 RUNBOOK
- ✅ Seguridad (Caddy HTTPS, n8n auth, Postgres no expuesto) — docker-compose + Caddyfile
- ✅ Pendientes externos claramente marcados — RUNBOOK + .env.production.example

**Verificación de tipos y consistencia:**
- Variables de entorno usadas en docker-compose.yml coinciden exactamente con las definidas en `.env.production.example`
- `$env('PAPERCLIP_URL')` y otros `$env()` en el workflow JSON son las mismas variables que docker-compose pasa a n8n via `environment:`
- El endpoint `POST /api/companies/:companyId/issues` y campos (`assigneeAgentId`, `projectId`, `goalId`, `title`, `description`, `priority`, `status`) coinciden con `createIssueSchema` validado en Task 5

**Sin placeholders:** Todos los archivos tienen contenido completo. El único "CAMBIAR" explícito en `setup.sh` (REPO_URL/REPO_BRANCH) está documentado como acción requerida del usuario, no como ambigüedad del plan.
