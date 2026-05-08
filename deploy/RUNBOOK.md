# RUNBOOK — Activación JAAGSOLUTIONS (VPS + Vercel)

Seguí el orden cuando tengas **VPS**, **dominio** y **Formspree** listos. Preparar archivos de `deploy/` no requiere VPS; este documento es para el **go-live**.

## Prerrequisitos

- [ ] VPS (ej. Hetzner CX22, Ubuntu 22.04)
- [ ] Dominio
- [ ] Cuenta Formspree (formulario + webhook)
- [ ] (Opcional) Google Analytics 4

## 1. DNS sugerido

| Nombre | Tipo | Valor |
|--------|------|--------|
| `www` | CNAME | `cname.vercel-dns.com` (sitio en Vercel) |
| `@` | A | IP del VPS (para que Caddy atienda apex y redirija a `www`, ver `Caddyfile`) |
| `paperclip` | A | IP del VPS |
| `n8n` | A | IP del VPS |

Comprobar propagación: `dig +short paperclip.tudominio.com`

**Nota:** Si querés el apex sólo en Vercel, ajustá DNS y eliminá o cambiá el bloque `{$DOMAIN}` en `Caddyfile` para no competir con Vercel.

## 2. Primera vez en el VPS

1. Clonar el repo privado JAAG ([JAAG2021/jaagsolutions-paperclip](https://github.com/JAAG2021/jaagsolutions-paperclip), rama acordada p. ej. `feature/jaagsolutions`) o copiar el árbol del proyecto.
2. `cd deploy && cp .env.production.example .env`
3. Completar **todos** los valores en `.env` (secretos, `DOMAIN`, `PAPERCLIP_PUBLIC_URL`, rutas de datos).
4. Opcional: `bash setup.sh` (instala Docker, clona si configuraste `REPO_URL`, levanta compose). Si ya tenés el repo en el servidor, podés hacer sólo `docker compose --env-file .env up -d`.

Directorios de datos del host (`PAPERCLIP_DATA_DIR`, `N8N_DATA_DIR`) deben existir y ser persistentes.

## 3. Seed de empresa en Paperclip

1. Abrí `https://paperclip.${DOMAIN}` (o `http://127.0.0.1:3100` vía túnel/SSH).
2. Autenticación inicial según el flujo de Paperclip.
3. Importá `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json` desde la UI (**Portability / Import** según versión) o usá la CLI autenticada contra tu instancia (ver documentación de `paperclipai company import`).

Sin la company **JAAGSOLUTIONS**, el script `get-paperclip-ids.sh` no encontrará IDs.

## 4. API key

1. En Paperclip: **Settings → API Keys** (o ruta equivalente).
2. Creá una clave con permisos acordes a crear issues en la company.
3. Pegá el valor en `deploy/.env` como `PAPERCLIP_API_KEY`.

## 5. IDs para n8n

En el VPS (o donde Paperclip sea alcanzable):

```bash
export PAPERCLIP_API_KEY=...
export PAPERCLIP_URL=http://127.0.0.1:3100   # o la URL interna que uses
bash deploy/scripts/get-paperclip-ids.sh
```

Copiá las cuatro variables `PAPERCLIP_*_ID` a `deploy/.env` y reiniciá n8n:

```bash
cd deploy && docker compose --env-file .env restart n8n
```

## 6. Workflow n8n

### Opción A — Automática (recomendada)

Los workflows se sincronizan automáticamente vía GitHub Actions cuando se hace push al branch `feature/jaagsolutions` y cambia algún archivo en `deploy/n8n-workflows/`.

**Configuración única (solo la primera vez):**

1. Generar API key en n8n UI: **Settings → n8n API → Create API key**. Copiar el valor.
2. En el repo GitHub (`Genesis-fenix/paperclip`): **Settings → Secrets and variables → Actions → New repository secret**:
   - `JAAGSOLUTIONS_N8N_URL` = `https://n8n.jaagsolutions.com`
   - `JAAGSOLUTIONS_N8N_API_KEY` = `<la clave generada>`
3. También agregar `N8N_API_KEY=<clave>` en `deploy/.env` del VPS (para uso manual).

Tras configurar los secrets, **cualquier push que modifique `deploy/n8n-workflows/*.json`** ejecuta el workflow `Sync n8n workflows` automáticamente: descarga el JSON del repo, hace upsert en n8n y activa el workflow.

### Opción B — Manual (sin GitHub Actions)

Requiere la API key en `deploy/.env`:

```bash
cd /opt/jaagsolutions/repo
git pull origin feature/jaagsolutions
N8N_API_KEY=<tu_clave> bash deploy/scripts/sync-n8n-workflows.sh
```

### Validación del nodo de seguridad

El nodo **Validar webhook (secreto / firma)** usa comparación en tiempo constante (XOR) para evitar timing attacks. Acepta el secreto (`FORMSPREE_WEBHOOK_SECRET`) en:

1. **Cabecera** `X-Paperclip-Webhook-Token`, `X-Formspree-Signature` o `X-Webhook-Secret`
2. **Query string** `?token=<secreto>` o `?secret=<secreto>`

Si el secreto está vacío, solo escribe advertencia en log (solo para desarrollo).

## 7. Formspree

1. Integrations → **Webhook** → URL del paso anterior (incluí query `token` / `secret` si elegiste esa opción).
2. Guardá el `FORMSPREE_ID` del formulario para Vercel (`VITE_FORMSPREE_ID`).
3. Obtené el hashid del formulario para `FORMSPREE_FORM_HASHID` (campo `form` en el primer webhook de prueba en el historial de n8n o en el dashboard/API de Formspree).

## 8. Vercel

Seguí `jaagsolutions-web/DEPLOY-VERCEL.md` y redeploy tras definir variables.

## 9. Prueba end-to-end

- [ ] Enviar formulario en `www`.
- [ ] Ver entrada en Formspree / email de notificación.
- [ ] Ver ejecución OK en n8n (historial del workflow).
- [ ] Ver nuevo issue en Paperclip asignado a **Growth Ops** (A3), proyecto **Demand Engine MVP**, goal de embudo.

## Criterio “en producción”

- [ ] Sitio en HTTPS (Vercel).
- [ ] Paperclip y n8n en HTTPS vía Caddy.
- [ ] Seed importado y agentes visibles.
- [ ] Lead de prueba llega a issue en bandeja de A3.
