# Checklist — Plan producción JAAGSOLUTIONS (2026-04-30)

Referencia: [2026-04-30-jaagsolutions-produccion-design.md](./2026-04-30-jaagsolutions-produccion-design.md) y plan detallado en `docs/superpowers/plans/2026-04-30-jaagsolutions-produccion.md`.

**Disciplina:** al completar un paso operativo (cuentas, env vars, deploy), actualizar enseguida este archivo (y checklists relacionados). Regla del proyecto: `.cursor/rules/jaagsolutions-checklist-sync.mdc`.

## Entregables en repo (sin VPS / dominio / Formspree)

Aquí **Hecho** significa: el **archivo o guía está en el repo** y cubre lo previsto en el diseño. **No** significa que el deploy en Vercel, el enlace GitHub o el import del monorepo ya funcionen sin fricción; eso se trackea en **Pendiente** (Fase A, Vercel).

| Archivo | Estado |
|---------|--------|
| `deploy/.env.production.example` | Hecho — variables documentadas (incl. `PAPERCLIP_PUBLIC_URL`) |
| `deploy/docker-compose.yml` | Hecho — Paperclip (build context `..`), PostgreSQL 16, n8n (imagen fijada `n8nio/n8n:1.112.6`), Caddy; puertos `127.0.0.1:3100` y `5678` para checks locales |
| `deploy/Caddyfile` | Hecho — SSL LE, `paperclip` + `n8n` + redirección apex → `www` |
| `deploy/setup.sh` | Hecho — bootstrap Docker (sin referencia a script de seed inexistente) |
| `deploy/scripts/get-paperclip-ids.sh` | Hecho — company/agents/projects/goals vía API |
| `deploy/n8n-workflows/formspree-to-paperclip.json` | Hecho — nodo **Validar webhook (secreto / firma)** + lectura `submission` Formspree |
| `jaagsolutions-web/DEPLOY-VERCEL.md` | Hecho — guía *Preview + Formspree sin VPS* + checklist producción |
| `deploy/RUNBOOK.md` | Hecho — activación ordenada + nota DNS apex/www |
| `.gitignore` (`deploy/.env`) | Hecho |
| Repo canónico (privado) | [github.com/JAAG2021/jaagsolutions-paperclip](https://github.com/JAAG2021/jaagsolutions-paperclip) — `deploy/setup.sh` usa este remoto y rama `feature/jaagsolutions` por defecto |

## Pendiente (requiere tu entorno / cuentas)

### Fase A — Preview web + Formspree (sin VPS)

**Formspree (panel + formulario)**

- [x] Cuenta Formspree y formulario **JAAGSOLUTIONS — diagnóstico multipaso** creados (Integration → endpoint).
- [x] **Form ID** anotado para Vercel: `VITE_FORMSPREE_ID` = `xpqbzolp` (`https://formspree.io/f/xpqbzolp`).
- **Diferido (Fase B):** webhook Formspree → n8n — no configurar en Fase A; ver `deploy/RUNBOOK.md`.
- [ ] *Opcional:* Workflow (email de aviso por submission), Rules, o restricción de dominio compatible con `*.vercel.app` si tu plan lo exige.

**Vercel + prueba de envío**

- [ ] **1 — Proyecto:** import **JAAG2021/jaagsolutions-paperclip**, **Root Directory** `jaagsolutions-web`, rama `feature/jaagsolutions` si aplica (ver `jaagsolutions-web/DEPLOY-VERCEL.md`). Esperá un primer deploy (aunque falle o el form no envíe hasta tener la variable).
- [ ] **2 — Variable:** `VITE_FORMSPREE_ID` = `xpqbzolp` en **Settings → Environment Variables**; marcá **Preview** (y **Production** si usás esa rama). Luego **Redeploy** del último deployment (las `VITE_*` se inyectan en build).
- [ ] **3 — Prueba:** abrí la URL del deploy → completá el formulario → en DevTools **Network** verificá `POST` a `formspree.io` OK → en Formspree **Submissions** debe aparecer la entrada.

### Fase B — VPS + automatización (después)

- [ ] Opcional: en VPS, `export REPO_BRANCH=...` si usás otra rama que no sea `feature/jaagsolutions`
- [ ] Contratar VPS y fijar IP estable
- [ ] Comprar/configurar DNS (coherente con apex: VPS vs sólo Vercel — ver RUNBOOK)
- [ ] En Formspree: añadir **webhook** a n8n cuando el VPS esté activo (ver `deploy/RUNBOOK.md`)
- [ ] Variables `VITE_*` en Vercel (`VITE_FORMSPREE_ID`, `VITE_GA_ID`, `VITE_SITE_URL`, etc.)
- [ ] Import real del seed `jaagsolutions-seed.json` en la instancia Paperclip
- [ ] API key Paperclip + rellenar IDs con `get-paperclip-ids.sh` + `restart n8n`
- [ ] Definir `FORMSPREE_FORM_HASHID` y `FORMSPREE_WEBHOOK_SECRET` en `.env` de n8n; registrar URL (y `?token=` si aplica)
- [ ] Prueba E2E: formulario → Formspree → n8n → issue en Paperclip (A3)

## Verificación local opcional (mantenedor)

- `cd deploy && docker compose --env-file .env.production.example config` — puede advertir vars vacías; es esperado.
- Validar JSON del workflow: `python -m json.tool deploy/n8n-workflows/formspree-to-paperclip.json`

## Notas de implementación

- El API de creación de issues es `POST /api/companies/{companyId}/issues` (no `POST /api/issues`).
- Healthcheck Paperclip: `GET /api/health`.
- En el seed, el agente A3 tiene `name`: **Growth Ops** (el script filtra por ese nombre).
- **Webhook Formspree:** el payload usa `submission` para los campos del formulario; el nodo de construcción del issue lee `submission` → `fields` → raíz.
- **Validación:** comparación en tiempo constante (`crypto.timingSafeEqual`), binding opcional de `form`, HMAC opcional sobre JSON del body, o `?token=` / `?secret=` en la URL del webhook.
