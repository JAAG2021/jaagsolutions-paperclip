#!/usr/bin/env python3
"""
Migra el workflow "Content Generator" del esquema viejo (Stability + Vision/OCR)
al nuevo (Ideogram + Sharp Compose), preservando ID y credenciales del workflow
visible para el usuario en la UI.

Uso:
  python3 migrate-content-generator.py              # solo migra (no borra nada)
  python3 migrate-content-generator.py --cleanup    # migra + borra duplicados zombi

Requiere variables en /opt/jaagsolutions/repo/deploy/.env:
  N8N_URL       (default https://n8n.jaagsolutions.com)
  N8N_API_KEY
"""
import json
import os
import subprocess
import sys
from pathlib import Path

CLEANUP = "--cleanup" in sys.argv

SCRIPT_DIR = Path(__file__).resolve().parent
DEPLOY_DIR = SCRIPT_DIR.parent
ENV_FILE = DEPLOY_DIR / ".env"
NEW_WF_PATH = DEPLOY_DIR / "n8n-workflows" / "content-generator.json"


def load_env():
    if not ENV_FILE.exists():
        return
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env()
N8N_URL = os.environ.get("N8N_URL", "https://n8n.jaagsolutions.com").rstrip("/")
N8N_API_KEY = os.environ.get("N8N_API_KEY")
if not N8N_API_KEY:
    sys.exit("ERROR: N8N_API_KEY no definida en deploy/.env")


def api(method, path, body=None):
    cmd = ["curl", "-sS", "-w", "\n%{http_code}", "-X", method,
           "-H", f"X-N8N-API-KEY: {N8N_API_KEY}",
           "-H", "Accept: application/json"]
    if body is not None:
        cmd += ["-H", "Content-Type: application/json",
                "--data-binary", json.dumps(body, ensure_ascii=False)]
    cmd.append(f"{N8N_URL}/api/v1{path}")
    r = subprocess.run(cmd, capture_output=True, text=True)
    parts = r.stdout.rsplit("\n", 1)
    body_str, code = (parts[0], parts[1].strip()) if len(parts) > 1 else (r.stdout, "?")
    if not code.startswith("2"):
        print(f"[api] {method} {path} → HTTP {code}\n{body_str}", file=sys.stderr)
        sys.exit(1)
    return json.loads(body_str) if body_str.strip() else None


# 1. Listar workflows
print("[1/7] Listando workflows...")
all_wf = api("GET", "/workflows")["data"]
print(f"      Total: {len(all_wf)}")

content_gens = [w for w in all_wf if "Content Generator" in w["name"]]
print(f"      'Content Generator': {len(content_gens)}")
if not content_gens:
    sys.exit("ERROR: No hay workflows 'Content Generator' en n8n")

# 2. Fetch full details (para timestamps y credenciales)
print("[2/7] Cargando detalles de cada Content Generator...")
details = []
for w in content_gens:
    full = api("GET", f"/workflows/{w['id']}")
    has_creds = any(n.get("credentials") for n in full.get("nodes", []))
    details.append({
        "id": w["id"],
        "name": w["name"],
        "active": w["active"],
        "updatedAt": full.get("updatedAt") or "",
        "has_creds": has_creds,
        "full": full,
    })

details.sort(key=lambda d: d["updatedAt"], reverse=True)

print("\n      Ranking por updatedAt desc:")
for d in details[:10]:
    flags = []
    if d["active"]:
        flags.append("ACTIVE")
    if d["has_creds"]:
        flags.append("creds")
    print(f"        {d['updatedAt']}  {d['id']}  [{','.join(flags) or 'empty'}]  {d['name']}")

# 3. Pick target: más reciente con credenciales (excluye el nuevo creado por sync sin creds)
candidates = [d for d in details if d["has_creds"]]
if not candidates:
    sys.exit("ERROR: Ningún Content Generator tiene credenciales configuradas")

target = candidates[0]
print(f"\n[3/7] Target seleccionado: {target['id']}  ({target['name']})")

# 4. Construir mapa de credenciales del target (source de credenciales)
cred_by_type = {}
cred_by_name = {}
for node in target["full"]["nodes"]:
    if node.get("credentials"):
        cred_by_type[node["type"]] = node["credentials"]
        cred_by_name[node["name"]] = node["credentials"]
print(f"      Credenciales detectadas en {len(cred_by_name)} nodos del target")

# 5. Leer nuevo workflow JSON
print(f"[4/7] Leyendo {NEW_WF_PATH.name}...")
with NEW_WF_PATH.open(encoding="utf-8") as f:
    new_wf = json.load(f)

# 6. Inyectar credenciales en los nodos correspondientes del nuevo workflow
print("[5/7] Inyectando credenciales en los nodos del nuevo workflow...")
matched = 0
for node in new_wf["nodes"]:
    creds = cred_by_name.get(node["name"]) or cred_by_type.get(node["type"])
    if creds:
        node["credentials"] = creds
        matched += 1
        print(f"        ✓ {node['name']}  ({node['type']})")
print(f"      {matched} nodos con credenciales asignadas")

# 7. PUT: reemplazar contenido del target preservando ID
clean_body = {
    "name": new_wf["name"],
    "nodes": new_wf["nodes"],
    "connections": new_wf["connections"],
    "settings": new_wf.get("settings") or {"executionOrder": "v1"},
}

print(f"[6/7] Actualizando workflow {target['id']}...")
# Desactivar primero (n8n no permite PUT a activos)
if target["active"]:
    api("POST", f"/workflows/{target['id']}/deactivate")
api("PUT", f"/workflows/{target['id']}", clean_body)
print(f"      ✓ Contenido reemplazado (nombre nuevo: {clean_body['name']})")

# Activar
api("POST", f"/workflows/{target['id']}/activate")
print(f"      ✓ Activado")

# 8. Cleanup de TODOS los demás Content Generator (mantener solo el target)
duplicates = [d for d in details if d["id"] != target["id"]]
print(f"[7/7] Cleanup duplicados (todo 'Content Generator' excepto target):")
print(f"      Target a preservar: {target['id']}  {clean_body['name']}")
print(f"      Candidatos a borrar: {len(duplicates)}")
for d in duplicates:
    print(f"        - {d['id']}  active={d['active']}  has_creds={d['has_creds']}  {d['name']}")

if CLEANUP:
    print(f"\n      --cleanup activo → borrando...")
    deleted = 0
    for d in duplicates:
        # Si está activo, desactivar antes de borrar (evita huérfanos de webhooks/cron)
        if d["active"]:
            api("POST", f"/workflows/{d['id']}/deactivate")
        api("DELETE", f"/workflows/{d['id']}")
        print(f"        ✗ borrado {d['id']}  {d['name']}")
        deleted += 1
    print(f"      ✓ {deleted} duplicados borrados")
else:
    print(f"\n      [DRY-RUN] No se borró nada. Para borrarlos, re-ejecuta con --cleanup")

print("\n[✓] Migración completa.")
print(f"    Workflow final:  {target['id']}")
print(f"    Nombre:          {clean_body['name']}")
print(f"    Activo:          sí")
print(f"    UI:              refresca https://n8n.jaagsolutions.com para verlo")
