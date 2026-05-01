#!/usr/bin/env bash
# Resuelve UUIDs de company / A3 / P2 / G2 para rellenar deploy/.env (variables n8n).
#
# Uso:
#   export PAPERCLIP_API_KEY=tu_key
#   export PAPERCLIP_URL=http://127.0.0.1:3100   # opcional, por defecto localhost
#   bash deploy/scripts/get-paperclip-ids.sh
#
# Requiere: jq (apt install jq), Paperclip accesible y seed JAAGSOLUTIONS importado.

set -euo pipefail

PAPERCLIP_URL="${PAPERCLIP_URL:-http://127.0.0.1:3100}"
API_KEY="${PAPERCLIP_API_KEY:-}"

if [ -z "$API_KEY" ]; then
  echo "Error: definí PAPERCLIP_API_KEY (Settings → API Keys en Paperclip)."
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "Error: instalá jq (ej. apt install jq)."
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $API_KEY"

echo "==> Buscando company JAAGSOLUTIONS..."
COMPANY_JSON=$(curl -sf -H "$AUTH_HEADER" "$PAPERCLIP_URL/api/companies")
COMPANY_ID=$(echo "$COMPANY_JSON" | jq -r '.[] | select(.name == "JAAGSOLUTIONS") | .id')

if [ -z "$COMPANY_ID" ] || [ "$COMPANY_ID" = "null" ]; then
  echo "❌ Company JAAGSOLUTIONS no encontrada. Importá Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json primero."
  exit 1
fi
echo "   ✅ PAPERCLIP_COMPANY_ID=$COMPANY_ID"

echo "==> Agente A3 (Growth Ops)..."
AGENTS_JSON=$(curl -sf -H "$AUTH_HEADER" "$PAPERCLIP_URL/api/companies/$COMPANY_ID/agents")
A3_ID=$(echo "$AGENTS_JSON" | jq -r '.[] | select(.name == "Growth Ops") | .id')
if [ -z "$A3_ID" ] || [ "$A3_ID" = "null" ]; then
  echo "❌ No se encontró agente con name \"Growth Ops\"."
  exit 1
fi
echo "   ✅ PAPERCLIP_A3_AGENT_ID=$A3_ID"

echo "==> Proyecto P2 (Demand Engine MVP)..."
PROJECTS_JSON=$(curl -sf -H "$AUTH_HEADER" "$PAPERCLIP_URL/api/companies/$COMPANY_ID/projects")
P2_ID=$(echo "$PROJECTS_JSON" | jq -r '.[] | select(.name == "Demand Engine MVP") | .id')
if [ -z "$P2_ID" ] || [ "$P2_ID" = "null" ]; then
  echo "❌ Proyecto \"Demand Engine MVP\" no encontrado."
  exit 1
fi
echo "   ✅ PAPERCLIP_P2_PROJECT_ID=$P2_ID"

echo "==> Goal G2 (embudo de captación)..."
GOALS_JSON=$(curl -sf -H "$AUTH_HEADER" "$PAPERCLIP_URL/api/companies/$COMPANY_ID/goals")
G2_ID=$(echo "$GOALS_JSON" | jq -r '.[] | select(.title | test("^Implementar embudo")) | .id')
if [ -z "$G2_ID" ] || [ "$G2_ID" = "null" ]; then
  echo "❌ Goal G2 (título que empiece por \"Implementar embudo\") no encontrado."
  exit 1
fi
echo "   ✅ PAPERCLIP_G2_GOAL_ID=$G2_ID"

echo ""
echo "==> Copiá a deploy/.env:"
echo "---"
echo "PAPERCLIP_COMPANY_ID=$COMPANY_ID"
echo "PAPERCLIP_A3_AGENT_ID=$A3_ID"
echo "PAPERCLIP_P2_PROJECT_ID=$P2_ID"
echo "PAPERCLIP_G2_GOAL_ID=$G2_ID"
echo "---"
echo ""
echo "Luego: cd deploy && docker compose --env-file .env restart n8n"
