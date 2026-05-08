# RUNBOOK — JAAGSOLUTIONS VPS Operations

> **LEER ANTES DE CUALQUIER CAMBIO EN PRODUCCIÓN.**
> Este documento describe el estado real del sistema, los procesos validados y las advertencias críticas.
> Actualizar este archivo cada vez que se cambie un proceso o se descubra un nuevo gotcha.

---

## ESTADO ACTUAL (2026-05-08)

| Servicio | URL | Estado |
|---------|-----|--------|
| Landing web | `https://jaagsolutions.com` | ✅ Live — Cloudflare Pages |
| Paperclip | `https://paperclip.jaagsolutions.com` | ✅ Live — VPS Docker |
| n8n | `https://n8n.jaagsolutions.com` | ✅ Live — VPS Docker |
| Workflow leads | Formspree Lead → Paperclip Issue | ✅ Activo |

**VPS:** Google Cloud `jaagsolutions-vps` — e2-medium Ubuntu 22.04 — IP `34.41.171.138`
**Repo en VPS:** `/opt/jaagsolutions/repo` — branch `feature/jaagsolutions` — remote `origin` = `JAAG2021/jaagsolutions-paperclip`

---

## ADVERTENCIAS CRÍTICAS — LEER PRIMERO

### En el VPS
- ❌ `nano` y `vi` **NO están instalados**. Para editar archivos usar:
  ```bash
  echo 'VARIABLE=valor' >> /ruta/al/.env
  # Verificar con:
  grep VARIABLE /ruta/al/.env
  ```
- ❌ La **n8n REST API devuelve 401** aunque el API key sea válido — incompatibilidad con `N8N_BASIC_AUTH_ACTIVE=true`. Usar siempre el CLI de Docker para importar workflows (ver sección 2).
- ❌ El `.env` está en `/opt/jaagsolutions/repo/deploy/.env`, NO en `/opt/jaagsolutions/deploy/.env`.

### En git
- El branch `feature/jaagsolutions` hace tracking a `JAAG2021/jaagsolutions-paperclip` (remote `origin` en el VPS).
- Para enviar cambios locales al VPS: hacer push desde la máquina local con `git push jaag2021 feature/jaagsolutions`, luego `git pull` en el VPS.

### En Paperclip
- Si Paperclip falla con `EACCES permission denied`:
  ```bash
  sudo chown -R 1000:1000 /opt/jaagsolutions/paperclip-data
  sudo docker restart deploy-paperclip-1
  ```

---

## 1. CÓMO ACTUALIZAR EL WORKFLOW DE N8N

**Usar cuando:** se modifica `deploy/n8n-workflows/formspree-to-paperclip.json` u otro workflow.

### Paso 1 — Desde la máquina local: commit y push

```bash
# En la máquina local (worktree):
cd paperclip/.worktrees/jaagsolutions
git add deploy/n8n-workflows/
git commit -m "feat(n8n): descripción del cambio"
git push jaag2021 feature/jaagsolutions
```

### Paso 2 — En el VPS: pull y preparar el JSON

```bash
cd /opt/jaagsolutions/repo
git pull origin feature/jaagsolutions
```

Eliminar las tags del JSON antes de importar (las tags no existen en la DB y causan error `SQLITE_CONSTRAINT`):

```bash
python3 -c "
import json
d = json.load(open('deploy/n8n-workflows/formspree-to-paperclip.json'))
d.pop('tags', None)
json.dump(d, open('/tmp/workflow-import.json', 'w'))
"
```

### Paso 3 — Importar en n8n via CLI

```bash
docker cp /tmp/workflow-import.json deploy-n8n-1:/tmp/workflow-import.json
docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/workflow-import.json
```

Output esperado: `Successfully imported 1 workflow.`

### Paso 4 — Verificar en UI

Ir a `https://n8n.jaagsolutions.com` → confirmar que el workflow **"Formspree Lead → Paperclip Issue"** está **Active** (toggle verde). Si quedó inactivo, activarlo manualmente.

### ¿Por qué no se puede automatizar via REST API?

n8n tiene `N8N_BASIC_AUTH_ACTIVE=true` que bloquea el endpoint `/api/v1/` con 401 en todas las combinaciones de auth probadas (API key solo, basic auth solo, ambas juntas). El GitHub Action `sync-n8n.yml` existe en el repo pero está pendiente de solución. Mientras tanto, el proceso manual de 4 pasos es el camino validado.

---

## 2. CÓMO ACTUALIZAR EL SEED DE PAPERCLIP

**Usar cuando:** se agrega o modifica un agente, goal, proyecto o issue en `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json`.

### Paso 1 — Commit y push desde máquina local

```bash
git add Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json
git commit -m "feat(seed): descripción"
git push jaag2021 feature/jaagsolutions
```

### Paso 2 — En el VPS: pull y actualizar el JSON en el contenedor

El contenedor Paperclip usa el JSON baked en la imagen, NO el del host. Hay que copiarlo:

```bash
cd /opt/jaagsolutions/repo
git pull origin feature/jaagsolutions

sudo docker cp \
  /opt/jaagsolutions/repo/Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json \
  deploy-paperclip-1:/app/Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json
```

### Paso 3 — Ejecutar seed

```bash
cd /opt/jaagsolutions/repo
pnpm db:seed:jaagsolutions
```

Output esperado: `X creados, Y actualizados` (el seed es idempotente — correrlo dos veces no duplica datos).

### Verificar

Ir a `https://paperclip.jaagsolutions.com` → confirmar agentes/goals/proyectos en el dashboard.

---

## 3. CÓMO AGREGAR VARIABLES DE ENTORNO AL VPS

**Usar cuando:** se necesita agregar o cambiar una variable en `deploy/.env`.

```bash
# Agregar variable (sin nano/vi disponible):
echo 'NUEVA_VARIABLE=valor' >> /opt/jaagsolutions/repo/deploy/.env

# Verificar que quedó:
grep NUEVA_VARIABLE /opt/jaagsolutions/repo/deploy/.env

# Aplicar reiniciando el servicio afectado:
cd /opt/jaagsolutions/repo/deploy
docker compose --env-file .env restart <servicio>
# Servicios: paperclip | n8n | caddy | postgres
```

---

## 4. CÓMO HACER DEPLOY DE CAMBIOS EN LA LANDING

**Usar cuando:** se modifica cualquier archivo en `jaagsolutions-web/`.

Cloudflare Pages despliega automáticamente cuando detecta un push a `feature/jaagsolutions` en `JAAG2021/jaagsolutions-paperclip`.

```bash
# Desde máquina local:
cd paperclip/.worktrees/jaagsolutions
git add jaagsolutions-web/
git commit -m "feat: descripción"
git push jaag2021 feature/jaagsolutions
# CF Pages despliega automáticamente en ~2 min
```

**Verificar:** ir a `https://jaagsolutions.com` y confirmar el cambio. Revisar el log de deploy en Cloudflare Pages si hay error.

---

## 5. REINICIAR SERVICIOS

```bash
cd /opt/jaagsolutions/repo/deploy

# Ver estado de todos los contenedores:
docker compose --env-file .env ps

# Reiniciar un servicio específico:
docker compose --env-file .env restart paperclip
docker compose --env-file .env restart n8n

# Ver logs en tiempo real:
docker logs deploy-n8n-1 --tail 50 -f
docker logs deploy-paperclip-1 --tail 50 -f

# Reiniciar todo (último recurso):
docker compose --env-file .env down && docker compose --env-file .env up -d
```

---

## 6. IDs DE REFERENCIA (PRODUCCIÓN)

| Recurso | ID |
|---------|-----|
| Company JAAGSOLUTIONS | `113d415c-9970-413f-b0d8-f7a6217caf67` |
| Agente A3 (Growth Ops) | `fd1aaf10-d7a4-4d86-97a6-0a00f736e217` |
| Proyecto P2 (Demand Engine) | `56e5f62f-ee8e-4555-9e85-27057574752d` |
| Goal G2 | `b2197151-59d5-4f16-b4d3-4223c18da417` |
| Formspree Form ID | `xpqbzolp` |
| GA4 Property | `G-K92KJ1FRMH` |

---

## 7. PRUEBA E2E — VERIFICAR QUE EL FLUJO FUNCIONA

Ejecutar cada vez que se cambie el workflow de n8n o la CF Function:

1. Llenar el formulario en `https://jaagsolutions.com` con datos de prueba
2. Verificar email en `jaagsolutions@gmail.com` — debe llegar notificación de Formspree
3. En n8n UI → **Executions** — debe aparecer una ejecución exitosa reciente
4. En Paperclip → **Issues** — debe aparecer un nuevo issue asignado a Growth Ops (A3)

---

## 8. HISTORIAL DE GOTCHAS

| Problema | Causa | Solución |
|---------|-------|---------|
| `EACCES permission denied` en Paperclip | Permisos del directorio de datos | `sudo chown -R 1000:1000 /opt/jaagsolutions/paperclip-data` |
| `git pull` falla con "dubious ownership" | Repo clonado como root | `git config --global --add safe.directory /opt/jaagsolutions/repo` |
| n8n REST API devuelve 401 | `N8N_BASIC_AUTH_ACTIVE=true` bloquea `/api/v1/` | Usar CLI: `docker exec deploy-n8n-1 n8n import:workflow` |
| `import:workflow` falla con `SQLITE_CONSTRAINT` | El JSON tiene `tags` con IDs que no existen en DB | Quitar tags con `python3 -c "... d.pop('tags', None) ..."` antes de importar |
| Seed muestra "0 creados" | Contenedor usa JSON baked en imagen, no el del host | `sudo docker cp jaagsolutions-seed.json deploy-paperclip-1:/app/...` |
| `nano` / `vi` not found | No están instalados en el VPS | Usar `echo 'VAR=val' >> archivo` |
| `git pull` falla "not fast-forward" | Remote tiene commits más nuevos | `git pull --rebase origin feature/jaagsolutions` |
