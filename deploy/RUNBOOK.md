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

1. Clonar el repo privado JAAG ([Genesis-fenix/jaagsolutions-paperclip](https://github.com/Genesis-fenix/jaagsolutions-paperclip), rama acordada p. ej. `feature/jaagsolutions`) o copiar el árbol del proyecto.
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

1. Abrí `https://n8n.${DOMAIN}` (basic auth del `.env`).
2. **Workflows → Import from File** → `deploy/n8n-workflows/formspree-to-paperclip.json` (si ya tenías una versión antigua, reimportá o copiá el nodo **Validar webhook (secreto / firma)**).
3. Activá el workflow.
4. En `deploy/.env`, definí al menos:
   - `FORMSPREE_WEBHOOK_SECRET` — mismo valor que llegará por cabecera, firma HMAC o query (ver abajo).
   - `FORMSPREE_FORM_HASHID` (recomendado) — debe coincidir con el campo `form` del JSON del webhook (hashid del formulario en Formspree).
5. Reiniciá n8n: `cd deploy && docker compose --env-file .env restart n8n`.
6. Copiá la URL del webhook en **modo producción**, ej. `https://n8n.${DOMAIN}/webhook/formspree-lead` (el sufijo exacto lo muestra n8n).

### Cómo valida el nodo **Validar webhook (secreto / firma)**

Si `FORMSPREE_WEBHOOK_SECRET` está definido (recomendado en producción), el flujo acepta **una** de estas pruebas:

1. **Token en cabecera** (comparación en tiempo constante): coincide con el secreto en alguna de  
   `X-Paperclip-Webhook-Token`, `X-Formspree-Signature`, `X-Webhook-Secret`.
2. **HMAC sobre el cuerpo JSON** (si tu emisor firma así): cabecera `X-Hub-Signature-256` o `X-Formspree-Signature-SHA256` con valor `sha256=<hex>`, usando el mismo JSON que n8n tiene en `body` tras parsear. *Ojo:* si el emisor firma bytes crudos y n8n re-serializa, puede fallar; en ese caso usá token en cabecera o query.
3. **Query en la URL** del webhook: `?token=<secreto>` o `?secret=<secreto>`.

Si el secreto está **vacío**, el nodo solo escribe una advertencia en log y **no bloquea** (solo para desarrollo).

**Formspree:** el webhook documentado incluye `form`, `keys` y `submission`. Conviene fijar `FORMSPREE_FORM_HASHID` para que solo ese formulario dispare el flujo. Como el webhook “simple” no siempre permite cabeceras custom, suele usarse **URL con `?token=...`** (si Formspree lo conserva) o un **proxy/worker** delante de n8n que añada `X-Paperclip-Webhook-Token`.

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
