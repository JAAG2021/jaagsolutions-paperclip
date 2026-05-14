#!/usr/bin/env bash
# Sync all JSON files in deploy/n8n-workflows/ to the running n8n instance via REST API.
# Supports upsert (create-or-update) and activates each workflow after sync.
#
# Usage:
#   bash deploy/scripts/sync-n8n-workflows.sh
#
# Required env vars (or defined in deploy/.env):
#   N8N_API_KEY   — API key generada en n8n UI: Settings → n8n API → Create API key
#   N8N_URL       — URL base de n8n (default: https://n8n.jaagsolutions.com)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$(dirname "$SCRIPT_DIR")/.env"

# Auto-cargar deploy/.env si existe (en VPS local)
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

N8N_URL="${N8N_URL:-https://n8n.jaagsolutions.com}"
N8N_API_KEY="${N8N_API_KEY:?ERROR: N8N_API_KEY no definida. Generarla en n8n UI: Settings → n8n API → Create API key}"

WORKFLOWS_DIR="$(dirname "$SCRIPT_DIR")/n8n-workflows"

# ── Dependencias ──────────────────────────────────────────────────────────────
if ! command -v jq >/dev/null 2>&1; then
  echo "[n8n-sync] jq no encontrado. Instalando..."
  sudo apt-get update -qq && sudo apt-get install -y jq
fi
command -v curl >/dev/null 2>&1 || { echo "[n8n-sync] ERROR: curl requerido."; exit 1; }

# ── Helper ────────────────────────────────────────────────────────────────────
# Llama a la n8n REST API con el API key en el header.
n8n_api() {
  curl -sf \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    -H "Accept: application/json" \
    "$@"
}

# ── Verificar conectividad ────────────────────────────────────────────────────
echo "[n8n-sync] Verificando conexión a ${N8N_URL}..."
if ! n8n_api "${N8N_URL}/api/v1/workflows" >/dev/null; then
  echo "[n8n-sync] ERROR: No se pudo conectar a ${N8N_URL}/api/v1/workflows"
  echo "[n8n-sync]   Verificar que N8N_URL y N8N_API_KEY sean correctos."
  exit 1
fi
echo "[n8n-sync] Conexión OK."

# ── Listar workflows existentes (para upsert) ─────────────────────────────────
ALL_WORKFLOWS=$(n8n_api "${N8N_URL}/api/v1/workflows")

# ── Procesar cada JSON ────────────────────────────────────────────────────────
shopt -s nullglob
json_files=("$WORKFLOWS_DIR"/*.json)
if [[ ${#json_files[@]} -eq 0 ]]; then
  echo "[n8n-sync] No se encontraron archivos JSON en ${WORKFLOWS_DIR}"
  exit 0
fi

for json_file in "${json_files[@]}"; do
  filename="$(basename "$json_file")"
  wf_name=$(jq -r '.name' "$json_file")
  echo ""
  echo "[n8n-sync] ▶ ${wf_name} (${filename})"

  # Buscar por nombre en la lista ya descargada (evita una llamada por workflow)
  wf_id=$(echo "$ALL_WORKFLOWS" | jq -r --arg n "$wf_name" \
    '.data[] | select(.name == $n) | .id' | head -1)

  # Cuerpo limpio: el n8n public API rechaza campos extra (tags, pinData, etc.)
  # Solo acepta: name, nodes, connections, settings, staticData
  clean_body=$(jq 'del(.id, .meta, .active, .tags, .pinData, .versionId, .triggerCount, .createdAt, .updatedAt)' "$json_file")

  if [[ -n "$wf_id" ]]; then
    echo "[n8n-sync]   Encontrado id=${wf_id} → desactivar → actualizar → activar"

    # Desactivar antes de actualizar (evita conflictos de webhook)
    n8n_api -X POST "${N8N_URL}/api/v1/workflows/${wf_id}/deactivate" >/dev/null || true

    # Obtener credenciales existentes de cada nodo para no perderlas al hacer PUT
    existing_nodes=$(n8n_api "${N8N_URL}/api/v1/workflows/${wf_id}" | jq '.nodes // []')

    # Fusionar credenciales del workflow en n8n en el nuevo body:
    # Si un nodo del repo no tiene credentials, se preservan las de n8n.
    merged_body=$(echo "$clean_body" | jq \
      --argjson existing "$existing_nodes" \
      '.nodes = [.nodes[] | . as $new |
        ($existing[] | select(.name == $new.name)) as $cur |
        if ($new.credentials == null or $new.credentials == {}) and ($cur.credentials != null)
        then $new + {credentials: $cur.credentials}
        else $new
        end
      ]')

    # Actualizar nodos y conexiones
    n8n_api -X PUT "${N8N_URL}/api/v1/workflows/${wf_id}" \
      -H "Content-Type: application/json" \
      --data-binary <(echo "$merged_body") >/dev/null

    echo "[n8n-sync]   Actualizado (credenciales preservadas)."
  else
    echo "[n8n-sync]   No encontrado → creando..."
    # POST sin -f para capturar el body de error si el API rechaza el request
    create_resp=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      -X POST "${N8N_URL}/api/v1/workflows" \
      --data-binary "$clean_body")
    http_status=$(echo "$create_resp" | grep -oE 'HTTP_STATUS:[0-9]+' | cut -d: -f2)
    body=$(echo "$create_resp" | sed 's/HTTP_STATUS:[0-9]*$//')
    if [[ "$http_status" != "200" && "$http_status" != "201" ]]; then
      echo "[n8n-sync]   ❌ Error al crear (HTTP $http_status):"
      echo "$body" | jq . 2>/dev/null || echo "$body"
      exit 1
    fi
    wf_id=$(echo "$body" | jq -r '.id')
    echo "[n8n-sync]   Creado id=${wf_id}."
  fi

  # Activar
  n8n_api -X POST "${N8N_URL}/api/v1/workflows/${wf_id}/activate" >/dev/null
  echo "[n8n-sync]   ✓ Activo"
done

echo ""
echo "[n8n-sync] ✅ Todos los workflows sincronizados y activos."
