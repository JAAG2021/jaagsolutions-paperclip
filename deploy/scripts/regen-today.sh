#!/usr/bin/env bash
# deploy/scripts/regen-today.sh
# Regenera imagen + caption de post(s) de content_plan en un solo comando.
#
# Flujo (igual al validado en la auditoría 2026-06-18):
#   1) reset del post a 'pending' (limpia image_url/retry_count/error_log/telegram_msg_id)
#   2) normaliza el contenido con el SQL idempotente (— -> coma, link limpio, hashtags)
#   3) borra el .jpg viejo compuesto
#   4) dispara el webhook regenerate-single (Content Generator debe estar ACTIVO)
#
# Uso (DENTRO del VPS):
#   ./regen-today.sh                        # todos los posts de HOY
#   ./regen-today.sh 2026-06-20             # todos los posts de esa fecha
#   ./regen-today.sh ed135115-7958-4373-... # un post puntual por id
#   ./regen-today.sh --no-clean             # omite el paso 2 (solo reset + regen)
#
# Requiere correr en el VPS: usa el container Postgres y el webhook de n8n.
# Ref: docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md
set -euo pipefail

PG="deploy-postgres-1"
CONTENT_DIR="/opt/jaagsolutions/content"
WEBHOOK="https://n8n.jaagsolutions.com/webhook/regenerate-single"
# SQL canónico de normalización de contenido (idempotente).
# Si una migración más nueva lo supersede, actualizar esta ruta.
CLEAN_SQL="/opt/jaagsolutions/repo/deploy/sql/2026-06-18-fix-emdash-link-hashtags-seguros.sql"

# ── Parseo de argumentos ────────────────────────────────────────────────────
CLEAN=1
SELECTOR=""
for arg in "$@"; do
  case "$arg" in
    --no-clean) CLEAN=0 ;;
    -h|--help)  sed -n '2,21p' "$0"; exit 0 ;;
    *)          SELECTOR="$arg" ;;
  esac
done

if [ -z "$SELECTOR" ]; then
  WHERE="scheduled_date = CURRENT_DATE"
  echo "▶ Target: posts de HOY"
elif [[ "$SELECTOR" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
  WHERE="id = '$SELECTOR'"
  echo "▶ Target: post id $SELECTOR"
elif [[ "$SELECTOR" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  WHERE="scheduled_date = '$SELECTOR'"
  echo "▶ Target: posts del $SELECTOR"
else
  echo "✖ Argumento no reconocido: '$SELECTOR' (espera fecha YYYY-MM-DD o UUID)" >&2
  exit 1
fi

# Helper: ejecuta SQL pasándolo por stdin (evita problemas de quoting con $POSTGRES_*)
run_sql() { docker exec -i "$PG" sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" '"$*"; }

# Verificación de que el container está arriba
if ! docker inspect -f '{{.State.Running}}' "$PG" 2>/dev/null | grep -q true; then
  echo "✖ El container '$PG' no está corriendo. ¿Estás en el VPS?" >&2
  exit 1
fi

# ── 1) Reset a pending ──────────────────────────────────────────────────────
echo "1) Reset a pending…"
printf '%s\n' "UPDATE content_plan SET status='pending', image_url=NULL, retry_count=0, error_log=NULL, telegram_msg_id=NULL WHERE $WHERE RETURNING id, platform, status;" \
  | run_sql

# ── 2) Normalizar contenido (idempotente) ───────────────────────────────────
if [ "$CLEAN" -eq 1 ]; then
  echo "2) Normalizando contenido ($CLEAN_SQL)…"
  run_sql < "$CLEAN_SQL"
else
  echo "2) (omitido por --no-clean)"
fi

# ── Verificación rápida antes de disparar ───────────────────────────────────
echo "→ Estado tras normalizar:"
printf '%s\n' "SELECT id, status, left(hashtags,40) AS hashtags, left(copy_text,80) AS copy FROM content_plan WHERE $WHERE;" \
  | run_sql -x

# ── 3) Borrar jpg viejo + 4) disparar webhook ───────────────────────────────
IDS=$(printf '%s\n' "SELECT id FROM content_plan WHERE $WHERE;" \
  | docker exec -i "$PG" sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -A')
if [ -z "$IDS" ]; then
  echo "✖ No hay posts para: $WHERE" >&2
  exit 1
fi

for id in $IDS; do
  rm -f "$CONTENT_DIR/$id.jpg" && echo "3) jpg borrado: $id"
  if curl -fsS -X POST "$WEBHOOK" -H 'Content-Type: application/json' -d "{\"post_id\":\"$id\"}" >/dev/null; then
    echo "4) regen disparado: $id"
  else
    echo "   ⚠ falló el webhook para $id (¿Content Generator activo?)" >&2
  fi
done

echo "✔ Listo. Revisa Telegram para aprobar la(s) tarjeta(s) nueva(s)."
