# RUNBOOK — JAAGSOLUTIONS VPS Operations

> **LEER ANTES DE CUALQUIER CAMBIO EN PRODUCCIÓN.**
> Este documento describe el estado real del sistema, los procesos validados y las advertencias críticas.
> Actualizar este archivo cada vez que se cambie un proceso o se descubra un nuevo gotcha.

---

## ESTADO ACTUAL (2026-09-02)

| Servicio | URL | Estado |
|---------|-----|--------|
| Landing web | `https://jaagsolutions.com` | ✅ Live — Cloudflare Pages |
| n8n | `https://n8n.jaagsolutions.com` | ✅ Live — VPS Docker |
| PostgreSQL | interno | ✅ Live — tabla `content_plan` |
| Caddy | reverse proxy | ✅ Live — SSL Let's Encrypt |
| ~~Paperclip~~ | ~~`paperclip.jaagsolutions.com`~~ | ❌ **RETIRADO 2026-09-02** — ver sección 9 |
| Workflow content gen | Content Generator (Cron → Ideogram + OCR → Telegram) | ✅ Activo (`FjeJW9Qb8vNiDwz5`) |
| Workflow telegram approval | Telegram Approval → Meta + LinkedIn | ✅ Activo (`KduOBXYi3tuDG3fZ`) |
| Workflow leads | Formspree Lead → Paperclip Issue | ⏸️ **Desactivado** (`wGBj1gkmy1JoBfGP`) — su destino ya no existe |

**Los leads NO se perdieron al retirar Paperclip.** La Cloudflare Function hace dos
llamadas independientes: a Formspree (`await`, es la que responde al navegador y
dispara el correo a `jaagsolutions@gmail.com`) y a n8n (`context.waitUntil()`,
fire-and-forget con `.catch()`). Verificado E2E el 2026-09-02 antes y después del
retiro: ambas pruebas devolvieron `{"ok":true}` HTTP 200 y el correo llegó.

**⚠️ ACCIÓN REQUERIDA (pendiente desde mayo):** producción corre un `Content Generator`
de **30 nodos** mientras el repo tiene uno de **61**. El repo NO refleja producción.
Antes de importar nada, exportar primero desde producción para no perder cambios vivos.

**⚠️ `LINKEDIN_ORGANIZATION_URN` no existe en `deploy/.env`** (detectado 2026-09-02 por
el warning de `docker compose config`). El `docker-compose.yml` la referencia, así que
llega vacía al contenedor: la publicación en la **página de empresa** de LinkedIn no
puede estar funcionando. Los posts al perfil personal (`LINKEDIN_AUTHOR_URN`) sí.

**VPS:** Google Cloud `jaagsolutions-vps` — e2-medium Ubuntu 22.04 — IP `34.132.124.143` (actualizado 2026-09-02)  
**SSH:** `ssh jaagsolutions-vps` (atajo en `~/.ssh/config`, apunta a `app.jaagsolutions.com`) o `ssh -i C:\Users\jalva\.ssh\jaagsolutions_vps jaagsolutions@app.jaagsolutions.com`
**Clave SSH local:** `C:\Users\jalva\.ssh\jaagsolutions_vps` — exclusiva para este proyecto, fingerprint `SHA256:tbhHTHiJB+hazSUuVL4DiEAY+kjjz3d5HrWLq6oJxU4`

> ⚠️ **LA IP EXTERNA ES EFÍMERA.** Cambia sola cada vez que la VM se detiene o
> reinicia (era `34.41.171.138`; pasó a `34.132.124.143` en el reinicio del
> 2026-07-31 por disco lleno). **Nunca uses la IP a pelo en configuración
> permanente.** Tras cualquier reinicio: actualizar el registro A `app` en
> Cloudflare (DNS only) y todo lo demás — SSH incluido — sigue funcionando,
> porque apunta al nombre `app.jaagsolutions.com`, no a la IP.
>
> Para reservar la IP y que deje de cambiar: Compute Engine → Direcciones IP
> externas → cambiar `Efímera` a `Estática` (ojo: una IP estática *sin* VM
> asociada sí se factura).
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
- ✅ **CORREGIDO 2026-09-02: la n8n REST API SÍ funciona.** El gotcha anterior
  ("devuelve 401 aunque el API key sea válido") es **falso**. Verificado en vivo:
  `GET /api/v1/workflows` con la cabecera `X-N8N-API-KEY` responde **HTTP 200**.
  La clave está en `N8N_API_KEY` dentro de `deploy/.env`. Hay que llamarla desde
  el propio VPS a `http://127.0.0.1:5678` (el puerto está publicado solo en
  loopback), no a través de Caddy. Ejemplo:
  ```bash
  K=$(sudo grep -oP '(?<=^N8N_API_KEY=).*' /opt/jaagsolutions/repo/deploy/.env)
  curl -s -H "X-N8N-API-KEY: $K" http://127.0.0.1:5678/api/v1/workflows?limit=50
  curl -s -X DELETE -H "X-N8N-API-KEY: $K" http://127.0.0.1:5678/api/v1/workflows/<ID>
  ```
  Esto habilita automatizar altas/bajas de workflows sin el proceso manual.
- ❌ El `.env` está en `/opt/jaagsolutions/repo/deploy/.env`, NO en `/opt/jaagsolutions/deploy/.env`.

### En git
- El branch `feature/jaagsolutions` hace tracking a `JAAG2021/jaagsolutions-paperclip` (remote `origin` en el VPS).
- Para enviar cambios locales al VPS: hacer push desde la máquina local con `git push jaag2021 feature/jaagsolutions`, luego `git pull` en el VPS.

### En Paperclip — RETIRADO 2026-09-02

❌ **Paperclip ya no corre en este VPS.** No busques `deploy-paperclip-1`, ni
`/opt/jaagsolutions/paperclip-data`, ni `paperclip.jaagsolutions.com`: no existen.
La **sección 2** de este runbook (seed) quedó obsoleta.

Motivo del retiro: la auditoría del 2026-09-02 verificó que ningún workflow activo
lo consumía. Además su `depends_on: paperclip: service_healthy` impedía arrancar n8n
si Paperclip fallaba el healthcheck — riesgo puro sobre el servicio que sí importa.
Liberó ~4 GB de disco (el VPS pasó de 63% a 41%).

Lo que se conserva: el esquema y los datos de Paperclip siguen dentro de la BD
`paperclip` de Postgres (no se borró nada de la BD), y hay respaldo completo en
`C:\Users\jalva\Documents\JAAG-BACKUP-2026-09-02\` (`paperclip-data.tar.gz` +
`postgres-full.sql.gz`).

Para restaurarlo: recuperar el bloque `paperclip:` del historial de git en
`deploy/docker-compose.yml`, el vhost en `deploy/Caddyfile`, el registro DNS
`paperclip` en Cloudflare, y reactivar el workflow `wGBj1gkmy1JoBfGP`.

### En automatizacion de contenido
- A4 no debe publicar ni regenerar contenido por fuera del pipeline aprobado.
- A2 es el dueno tecnico de workflows n8n, credenciales, webhooks, OCR y alertas.
- A1 sincronizaba Paperclip semanalmente con publicaciones reales (sin efecto desde el retiro del 2026-09-02).
- A3 traduce resultados de contenido a demanda comercial.
- Todo cambio productivo debe quedar reflejado en `CHECKLIST-MAESTRO-JAAGSOLUTIONS.md`.

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

> **OBSOLETO — corregido 2026-09-02.** Esta sección afirmaba que
> `N8N_BASIC_AUTH_ACTIVE=true` bloqueaba `/api/v1/` con 401 en toda combinación de
> auth. **Es falso.** La API responde 200 con la cabecera `X-N8N-API-KEY` llamando
> a `http://127.0.0.1:5678` desde el propio VPS (el 401 original probablemente
> venía de llamar a través de Caddy, donde sí aplica el basic auth).
>
> El proceso manual de 4 pasos sigue siendo válido y es el más probado para
> **importar** workflows, pero ya no es el único camino: listar, borrar y activar
> se pueden automatizar. El GitHub Action `sync-n8n.yml` es viable de retomar.

### 1.bis CÓMO ACTUALIZAR UN WORKFLOW QUE USA CREDENCIALES (Postgres, OAuth, etc.)

**Usar cuando:** se cambia un workflow con nodos que dependen de credenciales (Postgres, Telegram OAuth, Meta Graph, etc.) y aparece error `Credential with ID "X" does not exist`.

**Causa raíz:** Los IDs de credenciales **no son portables entre instancias n8n**. Un JSON exportado de otra instancia trae IDs que no existen en producción.

#### Paso 1 — Obtener IDs reales de credenciales en producción

```bash
docker exec deploy-n8n-1 n8n export:credentials --all --pretty --output=/tmp/creds.json
docker exec deploy-n8n-1 cat /tmp/creds.json
```

Buscar el `id` y `name` de la credencial deseada (ej. `Postgres account` → ID actual: `3WAwEY7SXDBTW16f`).

#### Paso 2 — Hardcodear en el JSON del workflow

En el repo local, agregar el bloque `credentials` a cada nodo que use la credencial:

```json
{
  "id": "postgres-get-post",
  "name": "Obtener datos del post",
  "type": "n8n-nodes-base.postgres",
  "parameters": { ... },
  "credentials": {
    "postgres": {
      "id": "3WAwEY7SXDBTW16f",
      "name": "Postgres account"
    }
  }
}
```

#### Paso 3 — Commit y push

```bash
git add deploy/n8n-workflows/<workflow>.json
git commit -m "fix(n8n): hardcodear ID de credencial Postgres"
git push
```

#### Paso 4 — En VPS: archivar workflow viejo + re-importar

```bash
cd /opt/jaagsolutions/repo && git pull
```

En n8n UI (https://n8n.jaagsolutions.com): abrir el workflow viejo → ⚙️ → **Archive** (n8n moderno no tiene Delete; Archive libera el webhook path).

Luego en VPS:

```bash
python3 -c "
import json
d = json.load(open('deploy/n8n-workflows/<workflow>.json'))
d.pop('tags', None)
json.dump(d, open('/tmp/<workflow>.json', 'w'))
"
docker cp /tmp/<workflow>.json deploy-n8n-1:/tmp/<workflow>.json
docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/<workflow>.json
```

#### Paso 5 — Activar y verificar

En n8n UI: activar el nuevo workflow (toggle verde). Abrir cualquier nodo Postgres → "Credential to connect with" debe mostrar el nombre correcto **sin tocar nada en la UI**.

**No re-seleccionar credenciales en la UI** — los cambios manuales en la UI no son confiables. La fuente de verdad es el JSON del repo.

---

---

## 1.ter CÓMO DESPLEGAR HARDENING CONTENT PIPELINE 2026-05-20

**Usar cuando:** se quiera aplicar el fix de alerta OCR, fallback visual seguro, monitor post-cron 08:15 y captions con `cta_url`.

### Paso 1 — Importar Content Generator

Antes de importar, en n8n UI archivar el workflow activo anterior **Content Generator — Ideogram + Sharp Compose → Telegram** para liberar el webhook `regenerate-single`. No borrar credenciales.

```bash
cd /opt/jaagsolutions/repo
git pull origin feature/jaagsolutions

python3 -c "
import json
d = json.load(open('deploy/n8n-workflows/content-generator.json'))
d.pop('tags', None)
json.dump(d, open('/tmp/content-generator.json', 'w'))
"
docker cp /tmp/content-generator.json deploy-n8n-1:/tmp/content-generator.json
docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/content-generator.json
```

En n8n UI: confirmar que **Content Generator — Ideogram + Sharp Compose → Telegram** quede activo. Si se crea duplicado, archivar el anterior y activar el importado.

### Paso 2 — Importar Telegram Approval

Antes de importar, en n8n UI archivar el workflow activo anterior **Telegram Approval → Meta + LinkedIn Publisher** para liberar el webhook `telegram-approval`.

```bash
python3 -c "
import json
d = json.load(open('deploy/n8n-workflows/telegram-approval.json'))
d.pop('tags', None)
json.dump(d, open('/tmp/telegram-approval.json', 'w'))
"
docker cp /tmp/telegram-approval.json deploy-n8n-1:/tmp/telegram-approval.json
docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/telegram-approval.json
```

En n8n UI: confirmar que **Telegram Approval → Meta + LinkedIn Publisher** quede activo y que el webhook `telegram-approval` siga apuntando al workflow activo.

### Paso 3 — Prevalidar post May 21

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -x -c "SELECT id, scheduled_date, scheduled_time, platform, pillar, status, cta_url, image_prompt, error_log FROM content_plan WHERE id='\''9dd90ed3-ea31-4f0d-a9dc-cdb77a1202b1'\'';"'
```

Si el `image_prompt` menciona `dashboard`, `screen`, `laptop`, `keyboard`, `document`, `chart`, `graph`, `whiteboard` o texto visual, reemplazarlo antes del cron:

```bash
docker exec -i deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' <<'SQLEOF'
UPDATE content_plan
SET image_prompt = $$Professional editorial photo for JAAGSOLUTIONS: two Latino business consultants reviewing an abstract automation process made only of smooth colored lines and plain circular nodes on a clean glass conference table. Modern warm office, soft natural light, calm empty lower area for overlay. No screens, no laptops, no keyboards, no documents, no signage, no charts, no graphs, no letters, no numbers, no symbols, no typography.$$,
    cta_url = COALESCE(NULLIF(cta_url, ''), 'https://jaagsolutions.com'),
    status = 'pending',
    image_url = NULL,
    retry_count = 0,
    error_log = NULL,
    telegram_msg_id = NULL
WHERE id = '9dd90ed3-ea31-4f0d-a9dc-cdb77a1202b1'
RETURNING id, scheduled_date, scheduled_time, platform, pillar, status, cta_url;
SQLEOF
rm -f /opt/jaagsolutions/content/9dd90ed3-ea31-4f0d-a9dc-cdb77a1202b1.jpg
```

### Paso 4 — Validar señales esperadas

- Telegram preview debe incluir `https://jaagsolutions.com` entre copy y hashtags.
- Si OCR falla, Telegram debe recibir mensaje `ERROR OCR - post no procesado` con ID, fecha, canal, pilar y `error_log`.
- A las 08:15 `America/Santiago`, si hay posts de hoy en `pending`, `generating` o `error`, debe llegar alerta `ALERTA post-cron JAAGSOLUTIONS 08:15`.

---

## 2. CÓMO ACTUALIZAR EL SEED DE PAPERCLIP — ⛔ OBSOLETO (2026-09-02)

> **NO EJECUTAR.** Paperclip fue retirado del VPS el 2026-09-02. Los comandos de
> esta sección fallarán (`No such container: deploy-paperclip-1`). Se conserva
> solo como referencia por si algún día se restaura el servicio.

**Usar cuando:** se agrega o modifica un agente, goal, proyecto o issue en `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json`.

**Estado esperado desde 2026-05-25:** el seed debe cargar 5 agentes, 6 goals, 4 proyectos y 21 issues. Si el dashboard muestra menos, Paperclip esta desincronizado y hay que re-ejecutar esta seccion.

### Verificacion local previa

```bash
node -e "const s=require('./Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json'); console.log({agents:s.agents.length, goals:s.goals.length, projects:s.projects.length, issues:s.issues.length})"
```

Output esperado:

```text
{ agents: 5, goals: 6, projects: 4, issues: 21 }
```

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

### Alternativa API - sincronizador v2

Si Paperclip esta accesible por API y tienes un token valido, puedes aplicar la sincronizacion sin entrar directo a la DB:

```bash
cd /opt/jaagsolutions/repo
PAPERCLIP_API_URL=https://paperclip.jaagsolutions.com \
PAPERCLIP_API_KEY=<token> \
node scripts/sync-jaagsolutions-production.mjs --apply --wake
```

Primero se puede simular sin cambios:

```bash
PAPERCLIP_API_URL=https://paperclip.jaagsolutions.com \
PAPERCLIP_API_KEY=<token> \
node scripts/sync-jaagsolutions-production.mjs
```

Este script actualiza agentes, goals, proyectos e issues desde `jaagsolutions-seed.json`, agrega comentario de evidencia cuando cierra issues a `done` y opcionalmente despierta a los agentes con `--wake`.

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
# Servicios: n8n | caddy | postgres   (paperclip retirado 2026-09-02)
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

Ejecutar cada vez que se cambie la CF Function o el flujo de leads.

**Sin abrir el navegador** (así se validó el 2026-09-02):

```bash
curl -s -w "\n>>> HTTP %{http_code}\n" -X POST https://jaagsolutions.com/api/lead \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"nombre":"PRUEBA E2E","email":"inverjaag@gmail.com",
       "empresa":"PRUEBA - IGNORAR","sitio_web":"https://jaagsolutions.com",
       "tamano_equipo":"1-5","dolor_proceso":"prueba tecnica",
       "herramientas_actual":"","presupuesto":"","timeline":"","whatsapp":"",
       "recurso_pdf":"No solicitado","diagnostico_express":"prueba, no responder",
       "tipo_solicitud":"diagnostico_multipaso"}'
```

**Resultado esperado:** `{"next":"/thanks","ok":true}` con **HTTP 200**, y correo de
Formspree en `jaagsolutions@gmail.com` en menos de un minuto.

Ese 200 viene de Formspree, no de n8n: es la única rama que el navegador espera.
La rama a n8n es `context.waitUntil()` fire-and-forget con `.catch()` — puede fallar
entera sin que el visitante ni el correo se enteren. Por eso, desde el retiro de
Paperclip (workflow `wGBj1gkmy1JoBfGP` desactivado) el webhook de n8n devuelve 404 y
**no pasa nada**: 0 ejecuciones con error, verificado.

> ⚠️ Cada prueba envía un correo real y consume una entrada de la cuota de Formspree.

---

## 8. HISTORIAL DE GOTCHAS

| Problema | Causa | Solución |
|---------|-------|---------|
| `EACCES permission denied` en Paperclip | Permisos del directorio de datos | `sudo chown -R 1000:1000 /opt/jaagsolutions/paperclip-data` |
| `git pull` falla con "dubious ownership" | Repo clonado como root | `git config --global --add safe.directory /opt/jaagsolutions/repo` |
| n8n REST API devuelve 401 | `N8N_BASIC_AUTH_ACTIVE=true` bloquea `/api/v1/` | Usar CLI: `docker exec deploy-n8n-1 n8n import:workflow` |
| `import:workflow` falla con `SQLITE_CONSTRAINT` | El JSON tiene `tags` con IDs que no existen en DB | Quitar tags con `python3 -c "... d.pop('tags', None) ..."` antes de importar |
| Seed muestra "0 creados" | Contenedor usa JSON baked en imagen, no el del host | `sudo docker cp jaagsolutions-seed.json deploy-paperclip-1:/app/...` |
| `nano` / `vi` not found (2026-05-09) | No estaban instalados en el VPS | Usar `echo 'VAR=val' >> archivo` o Python heredoc |
| `git pull` falla "not fast-forward" | Remote tiene commits más nuevos | `git pull --rebase origin feature/jaagsolutions` |
| `Credential with ID "1" does not exist for type "postgres"` | El JSON del workflow trae el ID de credencial de otra instancia n8n | Obtener ID real con `docker exec deploy-n8n-1 n8n export:credentials --all --pretty` y hardcodearlo en el bloque `credentials` de cada nodo |
| Re-asignar credencial en UI no persiste | Al ejecutar workflow, n8n usa el ID baked en JSON al momento de importar | Fix definitivo es en el JSON + re-importar (no en UI) |
| `SyntaxError: Unexpected character '→'` en Code node | El preview de evaluación de n8n se guardó como parte del código | Borrar todo lo que aparezca después de la expresión válida; `→` no debe estar en el código fuente |
| `Cannot find module 'fs'` en Code node | n8n bloquea built-ins de Node por defecto | Agregar `NODE_FUNCTION_ALLOW_BUILTIN: "fs,path"` al `environment:` de n8n en docker-compose.yml |
| `Your local changes would be overwritten by merge` (docker-compose.yml) | VPS tiene cambios locales sin commitear | `git stash push <file>` → `git pull` → `git stash pop` → resolver duplicados con `sed -i '<LINE>d' <file>` |
| `Ctrl+W` en SSH del navegador cierra la pestaña | Atajo del navegador tiene prioridad sobre nano | Navegar con flechas/Page Down; usar `grep -n` antes para saber a qué línea ir |
| No aparece opción Delete en menú de workflow n8n | n8n moderno reemplazó Delete por Archive (soft-delete) | Usar Archive (libera el webhook path). **El CLI NO tiene `delete:workflow`** (verificado 2026-09-02: `Error: Command "delete:workflow" not found`) — para borrado permanente usar la REST API: `curl -X DELETE -H "X-N8N-API-KEY: $K" http://127.0.0.1:5678/api/v1/workflows/<ID>` |
| `callback_data inválido` en Telegram callback parser | Separador `_` vs `:` mismatch entre nodo emisor y receptor | Usar `data.split('_')` + `parts.slice(1).join('_')` porque UUIDs contienen `-` pero no `_` |
| Imagen guardada como `image_path` pero schema usa `image_url` | Inconsistencia entre plan y schema | El schema es la fuente de verdad; renombrar todas las referencias para coincidir |
| `SplitInBatches v3` ejecuta "Node executed successfully" pero sin output — pipeline mudo | Output index 0 = "done" (post-loop), index 1 = "loop" (per-batch). Si conectas al 0, el pipeline solo corre cuando ya no hay items | Conectar nodos de proceso al output **index 1**. Los nodos terminales hacen loopback al input 0 de SplitInBatches |
| Error "invalid syntax" en nodo HTTP Request con `jsonBody` | La expresión JS tiene saltos de línea reales (byte `0x0A`) dentro de strings con comillas simples `'...'`. JS no permite literales multilinea así | Reemplazar saltos de línea por `\n` (escape). Buscar con `grep -c $'\n'` si hay duda |
| "Bearer undefined" en preview de n8n para `$env.OPENAI_API_KEY` | El navegador no tiene acceso a las env vars del servidor n8n — el preview es cosmético | Verificar con `docker exec deploy-n8n-1 env \| grep OPENAI_API_KEY`. Si la variable existe ahí, el runtime funcionará aunque el preview muestre "undefined" |
| Google Vision OCR: `Bad request — Request must specify image and features` | `$json.image_base64` llega vacío porque el nodo Postgres anterior (`Guardar image_path`) reemplaza el stream con `{success:true}`. Los datos de imagen se pierden al pasar por cualquier nodo `executeQuery` | Referenciar el nodo upstream directamente: `$('Guardar imagen en disco').item.json.image_base64`. Regla general: después de un nodo Postgres, usar `$('NodoAnterior').item.json.campo` para acceder a datos previos |
| Commit local pusheado a worktree pero VPS no recibe el fix con `git pull` | `git push` al remote `jaag2021` no fue ejecutado antes del `git pull` en VPS — el commit solo existe en el worktree local | Siempre hacer `git push jaag2021 feature/jaagsolutions` desde la máquina local ANTES de correr `git pull` en el VPS. Verificar con `git log --oneline origin/feature/jaagsolutions..HEAD` — si muestra commits, aún no fueron pusheados |
| Pegar `ssh jaagsolutions-vps` en la consola "SSH en el navegador" de GCP pide fingerprint y queda colgado | La consola del navegador YA está dentro del VPS; ese `ssh` abre un SSH anidado del VPS a sí mismo (IP interna `10.128.0.2`) | Responder `no`/Ctrl+C y correr los comandos directo. El `ssh jaagsolutions-vps` solo aplica desde la PC local |
| Un `UPDATE ... WHERE status='pending'` no toca el post de hoy | El post pasó por el loop de rechazo/regeneración y quedó en `status='review'` (o `error`), no `pending` | Resetear a `pending` (limpiar `image_url/retry_count/error_log/telegram_msg_id`) y re-correr el SQL (idempotente) antes de regenerar |
| `import:workflow` deja workflows duplicados (uno nuevo + el viejo) | El `id` del JSON no coincidió con el workflow activo en n8n | Activar solo el nuevo; archivar el viejo `Inactive`. Verificar `id` baked-in del JSON contra producción |
