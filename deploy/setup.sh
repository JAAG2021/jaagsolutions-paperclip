#!/usr/bin/env bash
# Bootstrap para VPS nuevo (Ubuntu 22.04+).
# Uso desde el directorio deploy del repo:
#   sudo bash setup.sh
# O clonando primero el repo en /opt/jaagsolutions/repo y ejecutando desde deploy/.
#
# Antes de usar: edita REPO_URL y REPO_BRANCH (o exportalas en el entorno).

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Genesis-fenix/jaagsolutions-paperclip.git}"
REPO_BRANCH="${REPO_BRANCH:-feature/jaagsolutions}"
INSTALL_DIR="${INSTALL_DIR:-/opt/jaagsolutions/repo}"
DATA_PAPERCLIP="${DATA_PAPERCLIP:-/opt/jaagsolutions/paperclip-data}"
DATA_N8N="${DATA_N8N:-/opt/jaagsolutions/n8n-data}"

echo "==> [1/6] Instalando Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  usermod -aG docker "${SUDO_USER:-$USER}" 2>/dev/null || true
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
  echo "    Repo ya existe — git pull..."
  git -C "$INSTALL_DIR" fetch origin "$REPO_BRANCH"
  git -C "$INSTALL_DIR" checkout "$REPO_BRANCH"
  git -C "$INSTALL_DIR" pull origin "$REPO_BRANCH"
fi

echo "==> [4/6] Preparando deploy/.env..."
if [ ! -f "$INSTALL_DIR/deploy/.env" ]; then
  cp "$INSTALL_DIR/deploy/.env.production.example" "$INSTALL_DIR/deploy/.env"
  echo ""
  echo "  ╔══════════════════════════════════════════════════════════╗"
  echo "  ║  ACCIÓN REQUERIDA: completá deploy/.env y volvé a ejecutar ║"
  echo "  ║  nano $INSTALL_DIR/deploy/.env                          ║"
  echo "  ╚══════════════════════════════════════════════════════════╝"
  echo ""
  exit 1
fi

echo "==> [5/6] Build e inicio de servicios..."
cd "$INSTALL_DIR/deploy"
docker compose --env-file .env build
docker compose --env-file .env up -d

echo "==> [6/6] Comprobaciones rápidas..."
sleep 15

check_service() {
  local name="$1"
  local url="$2"
  if curl -sf "$url" >/dev/null 2>&1; then
    echo "    ✅ $name — OK"
  else
    echo "    ❌ $name — no responde en $url"
    echo "       Logs: docker compose --env-file .env logs $name"
  fi
}

check_service "paperclip" "http://127.0.0.1:3100/api/health"
check_service "n8n" "http://127.0.0.1:5678/healthz"

echo ""
echo "==> Siguientes pasos (detalle en deploy/RUNBOOK.md):"
echo "    1. Importar seed JAAGSOLUTIONS en Paperclip (UI o CLI)."
echo "    2. Crear API key en Paperclip y ponerla en deploy/.env"
echo "    3. bash deploy/scripts/get-paperclip-ids.sh  →  pegar IDs en .env  →  docker compose restart n8n"
echo "    4. Importar deploy/n8n-workflows/formspree-to-paperclip.json en n8n y activarlo"
echo "    5. Registrar URL del webhook en Formspree"
