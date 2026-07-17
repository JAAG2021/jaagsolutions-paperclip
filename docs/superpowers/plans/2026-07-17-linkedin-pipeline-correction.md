# Corrección del pipeline LinkedIn — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir el pipeline de contenido JAAGSOLUTIONS: hashtags 3-5, un CTA por post (split por funnel), habilitar `texto_largo` para Prueba Social, pausar el vertical de seguros y reescribir el post del día.

**Architecture:** El contenido vive en la tabla Postgres `content_plan` (VPS). Hashtags/CTA/formato se fijan al sembrar (SQL en `deploy/sql/`). El publisher `telegram-approval.json` (4 builders) y el preview de `content-generator.json` arman el caption. `compose-image.js` hornea el headline. Los cambios se editan en el repo, se comitean, y se aplican en el VPS (SQL directo + re-import de workflows + rebuild de imagen n8n).

**Tech Stack:** PostgreSQL, n8n (workflows JSON), Node.js (`compose-image.js` con `sharp`), Docker Compose en VPS `34.41.171.138`.

## Global Constraints

- Toda migración SQL es **idempotente** y solo toca `status='pending' AND scheduled_date >= CURRENT_DATE`. Verbatim del spec.
- **Nunca publicar em dash** `—`/`–` → coma (defensa en profundidad ya existente; no romperla).
- **Link visible siempre** `https://jaagsolutions.com` (dominio limpio, sin UTMs).
- **Hashtags:** 3-5 por pieza, temáticos globales **sin geo-lock** (nada de `#PymesSV`/`#NegociosSV`; mercado pan-hispano LATAM+España). Regla nueva; reemplaza "8-15".
- **Un CTA por post:** `valor` = engagement sin link; `conversion` = link + CTA duro sin comment-bait.
- **Carrusel FUERA de alcance.** `texto_largo` = imagen de marca sin headline (no texto puro).
- **Import de workflows:** verificar el `id` activo contra `webhook_entity` antes de importar; el `id` baked-in del JSON debe coincidir con el workflow activo (Content Generator `FjeJW9Qb8vNiDwz5`, Telegram Approval `KduOBXYi3tuDG3fZ`). Ver `CONTENT_PIPELINE_SOURCE_OF_TRUTH.md`.
- **Prohibido** aplicar regex `<[^>]+>` sobre el JSON de workflows (borra nodos).
- Fecha de referencia: **2026-07-17**. Doc canónico: `docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md`.

**Nota de naturaleza operativa:** este plan modifica infraestructura de producción (SQL en DB viva, workflows n8n, imagen Docker). No hay suite de tests unitarios; la "verificación" de cada tarea es una query SQL o inspección del preview de Telegram con salida esperada. Los pasos de *aplicar en producción* van marcados `[PROD]` y deben confirmarse antes de ejecutarse.

---

## Comandos base (SSH al VPS)

```bash
# Ejecutar SQL contra la DB:
ssh -i ~/.ssh/jaagsolutions_vps jaagsolutions@34.41.171.138 \
  'docker exec -i deploy-postgres-1 sh -c '\''psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'\''' \
  < deploy/sql/<archivo>.sql

# Query rápida:
ssh -i ~/.ssh/jaagsolutions_vps jaagsolutions@34.41.171.138 \
  'docker exec deploy-postgres-1 sh -c '\''psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "<SQL>"'\'''
```

---

## Task 1: W4 — Pausar el vertical de seguros

**Files:**
- Modify: `deploy/docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md` (secciones "Cadencia" y "Elementos Obsoletos")

**Interfaces:**
- Consumes: nada.
- Produces: cadencia documentada core-only Lun/Mié/Vie; confirmación de que no hay filas `pending` seguros.

- [ ] **Step 1: Verificar que el carril seguros está seco [PROD, read-only]**

Run:
```bash
ssh -i ~/.ssh/jaagsolutions_vps jaagsolutions@34.41.171.138 \
  'docker exec deploy-postgres-1 sh -c '\''psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT count(*) FROM content_plan WHERE vertical='\''\'\'''\''seguros_servicio'\''\'\'''\'' AND status='\''\'\'''\''pending'\''\'\'''\'' AND scheduled_date >= CURRENT_DATE;"'\'''
```
Expected: `count = 0`. Si es >0, listar esas filas y decidir (probablemente cancelarlas: `status='error'` o borrarlas) antes de seguir.

- [ ] **Step 2: Actualizar la cadencia en el SOURCE_OF_TRUTH**

En la sección "Entrada De Contenido" (bloque "Cadencia vigente…"), reemplazar el carril de seguros por una nota de pausa. Cambiar el bloque a:

```text
Core JAAGSOLUTIONS (vertical='jaagsolutions_core') — cadencia vigente desde 2026-07-17:
  Lunes     10:00
  Miercoles 10:00
  Viernes   16:00

Seguros JAAGSOLUTIONS (vertical='seguros_servicio') — PAUSADO desde 2026-07-17:
  Motivo: expansion horizontal prematura (segundo ICP sobre perfil personal con
  alcance minimo, sin resultados). El lote 18-jun a 14-jul se agoto y NO se recarga.
  Codigo dormido (columna `vertical`, constraint y cortocircuito en
  prep-auditor-prompt.js se conservan). Reactivable en el futuro, idealmente como
  canal/pagina propia, no mezclado en el perfil personal core.
```

- [ ] **Step 3: Añadir seguros a "Elementos Obsoletos (NO usar / limpiar)"**

Agregar una viñeta:

```text
- **Carril de seguros (vertical='seguros_servicio')**: PAUSADO 2026-07-17. No recargar el
  carril Mar/Jue. Ver "Entrada De Contenido → Cadencia". Codigo conservado pero inactivo.
```

- [ ] **Step 4: Verificar coherencia del doc**

Run: `grep -n -i "seguros\|PAUSADO\|Lunes\|Martes" docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md | head -20`
Expected: la cadencia muestra Lun/Mié/Vie y seguros marcado PAUSADO; ninguna referencia vigente a Mar/Jue como carril activo.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md
git commit -m "content(w4): pausar vertical de seguros, cadencia core-only Lun/Mie/Vie"
```

---

## Task 2: W1 — Hashtags a 3-5

**Files:**
- Create: `deploy/sql/2026-07-17-hashtags-3-5.sql`
- Modify: `docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md` (regla de hashtags)

**Interfaces:**
- Consumes: tabla `content_plan` (columnas `pillar`, `post_type`, `vertical`, `hashtags`, `status`, `scheduled_date`).
- Produces: filas pending con 3-5 hashtags; regla documentada "3-5".

- [ ] **Step 1: Ver el estado ANTES [PROD, read-only]**

Run:
```bash
ssh -i ~/.ssh/jaagsolutions_vps jaagsolutions@34.41.171.138 \
  'docker exec deploy-postgres-1 sh -c '\''psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT scheduled_date, pillar, post_type, array_length(regexp_split_to_array(hashtags, '\''\'\'''\'' '\''\'\'''\''), 1) AS n_tags FROM content_plan WHERE status='\''\'\'''\''pending'\''\'\'''\'' AND scheduled_date >= CURRENT_DATE ORDER BY scheduled_date;"'\'''
```
Expected: la mayoría con `n_tags` 12-13 (estado a corregir).

- [ ] **Step 2: Escribir la migración SQL**

Create `deploy/sql/2026-07-17-hashtags-3-5.sql`:

```sql
-- deploy/sql/2026-07-17-hashtags-3-5.sql
-- Hashtags 3-5 temáticos globales sin geo-lock (revierte el set 12-13 de
-- 2026-06-17-fix-hashtags-softcta.sql). Mercado pan-hispano LATAM+España.
-- Idempotente: solo filas pending >= hoy.
-- Ejecutar dentro del container postgres deploy-postgres-1.

BEGIN;

-- core generico (educacion, behind_the_scenes) — post_type valor
UPDATE content_plan SET hashtags =
  '#AutomatizaciónPymes #TransformaciónDigital #ProductividadPymes'
WHERE vertical = 'jaagsolutions_core'
  AND pillar IN ('educacion','behind_the_scenes')
  AND post_type = 'valor'
  AND status = 'pending' AND scheduled_date >= CURRENT_DATE;

-- casos_de_uso / prueba_social — post_type valor
UPDATE content_plan SET hashtags =
  '#AutomatizaciónPymes #CasosDeÉxito #TransformaciónDigital'
WHERE vertical = 'jaagsolutions_core'
  AND pillar IN ('casos_de_uso','prueba_social')
  AND post_type = 'valor'
  AND status = 'pending' AND scheduled_date >= CURRENT_DATE;

-- cualquier conversion (independiente del pilar)
UPDATE content_plan SET hashtags =
  '#AutomatizaciónPymes #TransformaciónDigital #Emprendedores #Pymes'
WHERE vertical = 'jaagsolutions_core'
  AND post_type = 'conversion'
  AND status = 'pending' AND scheduled_date >= CURRENT_DATE;

COMMIT;

-- Verificacion:
-- SELECT scheduled_date, pillar, post_type, hashtags FROM content_plan
-- WHERE status='pending' AND scheduled_date >= CURRENT_DATE ORDER BY scheduled_date;
```

- [ ] **Step 3: Aplicar la migración [PROD]**

Confirmar antes de ejecutar. Run:
```bash
ssh -i ~/.ssh/jaagsolutions_vps jaagsolutions@34.41.171.138 \
  'docker exec -i deploy-postgres-1 sh -c '\''psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'\''' \
  < deploy/sql/2026-07-17-hashtags-3-5.sql
```
Expected: varias líneas `UPDATE N`, luego `COMMIT`.

- [ ] **Step 4: Ver el estado DESPUÉS [PROD, read-only]**

Repetir la query del Step 1. Expected: todas las filas pending con `n_tags` entre 3 y 4.

- [ ] **Step 5: Actualizar la regla en el SOURCE_OF_TRUTH**

En la sección "Mapa De Composición → Reglas de contenido vigentes" cambiar:
`hashtags 8-15 keyword-driven` → `hashtags 3-5 de nicho (set en 2026-07-17-hashtags-3-5.sql; supersede el 8-15 de 2026-06-17)`.
En "Elementos Obsoletos" agregar: `- **Set de hashtags 8-15** (2026-06-17-fix-hashtags-softcta.sql): superseded por 3-5 (2026-07-17).`

- [ ] **Step 6: Commit**

```bash
git add deploy/sql/2026-07-17-hashtags-3-5.sql docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md
git commit -m "content(w1): hashtags 3-5 de nicho (revierte set 12-13)"
```

---

## Task 3: W2 — CTA split por funnel (builders)

**Files:**
- Modify: `deploy/n8n-workflows/telegram-approval.json` (4 ocurrencias del builder)
- Modify: `deploy/n8n-workflows/content-generator.json` (1 preview builder)
- Modify: `docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md` (regla link/CTA)

**Interfaces:**
- Consumes: fila `content_plan` con `post_type` (`valor`|`conversion`), `cta_url`, `copy_text`, `hashtags`.
- Produces: caption con link **solo** en `conversion`. Los `valor` publican `[copy, hashtags]`.

- [ ] **Step 1: Confirmar el string exacto a reemplazar**

Run: `grep -c "const showCta = cta && !copy.includes(cta);" deploy/n8n-workflows/telegram-approval.json deploy/n8n-workflows/content-generator.json`
Expected: `telegram-approval.json:4` y `content-generator.json:1`.

- [ ] **Step 2: Editar los 4 builders de `telegram-approval.json`**

En `telegram-approval.json`, reemplazar **todas** las ocurrencias de:
```js
const showCta = cta && !copy.includes(cta);
```
por (la fila se llama `post` en este archivo):
```js
const showCta = post.post_type === 'conversion' && cta && !copy.includes(cta);
```

- [ ] **Step 3: Editar el preview de `content-generator.json`**

En `content-generator.json`, reemplazar la única ocurrencia de:
```js
const showCta = cta && !copy.includes(cta);
```
por (aquí la fila es `$json`):
```js
const showCta = $json.post_type === 'conversion' && cta && !copy.includes(cta);
```

- [ ] **Step 4: Verificar que los JSON siguen siendo válidos**

Run:
```bash
PYTHONIOENCODING=utf-8 python3 -c "import json; json.load(open('deploy/n8n-workflows/telegram-approval.json',encoding='utf-8')); json.load(open('deploy/n8n-workflows/content-generator.json',encoding='utf-8')); print('OK JSON valido')"
```
Expected: `OK JSON valido`. Y:
`grep -c "post.post_type === 'conversion'" deploy/n8n-workflows/telegram-approval.json` → `4`;
`grep -c "\$json.post_type === 'conversion'" deploy/n8n-workflows/content-generator.json` → `1`.

- [ ] **Step 5: Verificar el `id` activo antes de importar [PROD, read-only]**

Run:
```bash
ssh -i ~/.ssh/jaagsolutions_vps jaagsolutions@34.41.171.138 \
  'docker exec deploy-n8n-1 n8n list:workflow' 2>/dev/null | grep -i "approval\|generator"
```
Expected: confirmar que Telegram Approval activo = `KduOBXYi3tuDG3fZ` y Content Generator = `FjeJW9Qb8vNiDwz5` (coinciden con el `id` baked-in del JSON). Si no coinciden, resolver duplicados según el RUNBOOK antes de importar.

- [ ] **Step 6: Desplegar los workflows al VPS e importar [PROD]**

Confirmar antes. `git push` desde local, `git pull` en el VPS, luego para cada workflow:
```bash
# en el VPS (o via ssh):
docker cp deploy/n8n-workflows/telegram-approval.json deploy-n8n-1:/tmp/wf.json
docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/wf.json
docker cp deploy/n8n-workflows/content-generator.json deploy-n8n-1:/tmp/wf2.json
docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/wf2.json
```
Reactivar ambos (el CLI los deja inactivos): toggle Active en la UI de n8n. Expected: ambos `Active`, sin duplicados nuevos.

- [ ] **Step 7: Verificación funcional del split**

Regenerar (o disparar preview de) un post `valor` y uno `conversion` pendientes y revisar el mensaje de Telegram:
- `valor` → el caption **NO** contiene `jaagsolutions.com`.
- `conversion` → el caption **SÍ** contiene `jaagsolutions.com` y "Agenda tu diagnóstico".
Expected: ningún post con las dos acciones a la vez.

- [ ] **Step 8: Actualizar el SOURCE_OF_TRUTH**

En "Link y CTA — DOMINIO LIMPIO" cambiar la primera viñeta:
`Link en TODO post (valor y conversion)…` → `Link SOLO en post_type='conversion'. Los 'valor' publican [copy, hashtags] sin link (optimizan alcance/engagement). Regla vigente desde 2026-07-17.`
En "Elementos Obsoletos" **quitar** la viñeta `"valor sin link" … obsoleta` (vuelve a ser regla vigente) y en su lugar poner: `- **"link en todo post"** (2026-06-18): superseded por "link solo en conversion" (2026-07-17).`
En "Mapa De Composición", ajustar la fila "Caption publicado" para notar el condicional por `post_type`.

- [ ] **Step 9: Commit**

```bash
git add deploy/n8n-workflows/telegram-approval.json deploy/n8n-workflows/content-generator.json docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md
git commit -m "content(w2): CTA split por funnel — link solo en conversion"
```

---

## Task 4: W3a — Formato texto_largo (asignación + render)

**Files:**
- Create: `deploy/sql/2026-07-17-prueba-social-texto-largo.sql`
- Modify: `deploy/n8n-scripts/compose-image.js` (rama por `format`)
- Modify: `docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md`

**Interfaces:**
- Consumes: fila con `format`, `pillar`, `copy_text`.
- Produces: `prueba_social` pendientes con `format='texto_largo'`; imagen sin headline horneado cuando `format==='texto_largo'`.

- [ ] **Step 1: Escribir la migración de formato**

Create `deploy/sql/2026-07-17-prueba-social-texto-largo.sql`:

```sql
-- deploy/sql/2026-07-17-prueba-social-texto-largo.sql
-- Prueba Social pasa a formato texto_largo (narrativa con gancho).
-- Idempotente: solo filas pending >= hoy.

BEGIN;

UPDATE content_plan SET format = 'texto_largo'
WHERE pillar = 'prueba_social'
  AND format = 'imagen_copy'
  AND status = 'pending' AND scheduled_date >= CURRENT_DATE;

COMMIT;

-- Verificacion:
-- SELECT scheduled_date, pillar, format FROM content_plan
-- WHERE status='pending' AND scheduled_date >= CURRENT_DATE ORDER BY scheduled_date;
```

- [ ] **Step 2: Añadir la rama texto_largo en `compose-image.js`**

En `deploy/n8n-scripts/compose-image.js`, tras la línea que calcula `const headline = ...` (línea ~131), leer el `format` del input y construir el SVG condicionalmente. Modificar la desestructuración del input (línea ~27) para incluir `format`:

```js
const {
  image_url,
  copy_text,
  hashtags,
  platform,
  scheduled_date,
  aspect_ratio,
  format,
  output_dir = '/opt/jaagsolutions/content',
} = input;
```

Y reemplazar la construcción `const svg = ...` (líneas ~151-170) por una versión que omite el bloque de headline + barra dorada y atenúa el gradiente inferior cuando `format === 'texto_largo'`:

```js
const isTextoLargo = format === 'texto_largo';

// Bloque inferior (headline + barra + gradiente): solo en formatos con headline horneado.
const bottomBlock = isTextoLargo ? '' : `
  <rect x="0" y="${TEXT_BOX_Y}" width="${dims.w}" height="${TEXT_BOX_HEIGHT}" fill="url(#bottomFade)"/>
  <rect x="${PADDING}" y="${textStartY - COPY_FONT_SIZE - 25}" width="80" height="6" fill="${COLORS.accent}" rx="3"/>
  <text x="${PADDING}" y="${textStartY}" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="${COPY_FONT_SIZE}" font-weight="700" fill="${COLORS.white}" xml:space="preserve">${copyTspans}</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dims.w}" height="${dims.h}" viewBox="0 0 ${dims.w} ${dims.h}">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COLORS.brandDeep}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${COLORS.brandDeep}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COLORS.brandDeep}" stop-opacity="0"/>
      <stop offset="35%" stop-color="${COLORS.brandDeep}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${COLORS.brandDeep}" stop-opacity="0.97"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${dims.w}" height="${LOGO_HEIGHT + 40}" fill="url(#topFade)"/>
  <text x="${PADDING}" y="60" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="34" font-weight="800" fill="${COLORS.white}" letter-spacing="1.5">JAAG<tspan fill="${COLORS.accent}">·</tspan>SOLUTIONS</text>
  <text x="${PADDING}" y="92" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="18" font-weight="400" fill="${COLORS.brandLight}" opacity="0.9">Automatización inteligente para pymes</text>
  ${bottomBlock}
  <text x="${dims.w - PADDING}" y="${dims.h - PADDING}" text-anchor="end" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="20" font-weight="500" fill="${COLORS.brandLight}" opacity="0.9">jaagsolutions.com</text>
</svg>`;
```

- [ ] **Step 3: Probar `compose-image.js` en local con un input texto_largo**

Create un input de prueba y correr el script (requiere `node` + `sharp` disponibles; si no, hacer esta prueba en el VPS tras el deploy). Run:
```bash
cat > /tmp/tl_test.json <<'JSON'
{"image_url":"https://picsum.photos/1080/1350","post_id":"tl-test","copy_text":"Gancho de prueba en la primera linea.\n\nCuerpo del post.","hashtags":"#PymesSV","platform":"linkedin","scheduled_date":"2026-07-18","aspect_ratio":"ASPECT_3_4","format":"texto_largo","output_dir":"/tmp"}
JSON
node deploy/n8n-scripts/compose-image.js /tmp/tl_test.json
```
Expected: JSON de salida con `image_path=/tmp/tl-test.jpg`. Abrir el `.jpg`: muestra logo arriba + URL abajo, **sin** headline horneado ni barra dorada ni caja oscura inferior.

- [ ] **Step 4: Confirmar que `imagen_copy` NO cambió**

Repetir Step 3 con `"format":"imagen_copy"`. Expected: la imagen **sí** tiene el headline horneado + barra dorada (comportamiento intacto).

- [ ] **Step 5: Aplicar la migración de formato [PROD]**

Confirmar antes. Run:
```bash
ssh -i ~/.ssh/jaagsolutions_vps jaagsolutions@34.41.171.138 \
  'docker exec -i deploy-postgres-1 sh -c '\''psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'\''' \
  < deploy/sql/2026-07-17-prueba-social-texto-largo.sql
```
Expected: `UPDATE N` (N = nº de prueba_social pendientes), `COMMIT`.

- [ ] **Step 6: Rebuild de la imagen n8n con el nuevo compose-image [PROD]**

`compose-image.js` se despliega vía `Dockerfile.n8n`. Confirmar antes. En el VPS: `git pull`, luego rebuild + restart del servicio n8n (`docker compose build n8n && docker compose up -d n8n` en `deploy/`). Expected: n8n arranca; `docker exec deploy-n8n-1 cat /opt/n8n-scripts/compose-image.js | grep -c isTextoLargo` → `>=1`.

- [ ] **Step 7: Actualizar el SOURCE_OF_TRUTH**

En "Mapa De Composición", fila "Texto horneado en la imagen": añadir "Si `format='texto_largo'`: se OMITE el headline + barra; queda logo + URL (imagen de marca). Requiere rebuild n8n." Añadir nota de que `prueba_social` usa `texto_largo` (narrativa con gancho en línea 1).

- [ ] **Step 8: Commit**

```bash
git add deploy/sql/2026-07-17-prueba-social-texto-largo.sql deploy/n8n-scripts/compose-image.js docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md
git commit -m "content(w3a): habilitar texto_largo (prueba_social sin headline horneado)"
```

---

## Task 5: W3b — Reescribir copies de prueba_social como narrativa

**Files:**
- Modify: filas `content_plan` con `pillar='prueba_social'` (datos en DB, vía SQL de update por `id`)

**Interfaces:**
- Consumes: filas `texto_largo` (Task 4) con `copy_text` actual (formato imagen_copy: headline corto + cuerpo).
- Produces: `copy_text` reescrito como narrativa con gancho en línea 1.

- [ ] **Step 1: Leer las filas prueba_social pendientes [PROD, read-only]**

Run:
```bash
ssh -i ~/.ssh/jaagsolutions_vps jaagsolutions@34.41.171.138 \
  'docker exec deploy-postgres-1 sh -c '\''psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT id, scheduled_date, post_type, copy_text FROM content_plan WHERE pillar='\''\'\'''\''prueba_social'\''\'\'''\'' AND status='\''\'\'''\''pending'\''\'\'''\'' AND scheduled_date >= CURRENT_DATE ORDER BY scheduled_date;"'\'''
```
Expected: lista de filas con su `id` y copy actual.

- [ ] **Step 2: Reescribir cada copy siguiendo la plantilla texto_largo**

Para cada fila, redactar `copy_text` nuevo con esta estructura (sin em dash, gancho fuerte en la 1.ª línea que sea lo que se ve antes de "ver más"):

```text
Linea 1: gancho concreto (dolor o dato sorprendente).
[linea en blanco]
Desarrollo: la historia / el problema real de una PYME.
[linea en blanco]
Insight: que cambio y por que (patron dolor -> solucion -> metrica cuando aplique).
[linea en blanco]
Cierre segun post_type:
  - valor:      pregunta de engagement (ej. "Cuentanos en los comentarios como lo resuelves hoy.")
  - conversion: "👉 Agenda tu diagnostico gratuito de 10 minutos." (el link lo pone el builder)
```

Regla: NO incrustar hashtags ni link en `copy_text` (van en sus campos). NO usar `—`.

- [ ] **Step 3: Escribir y aplicar los updates por id [PROD]**

Crear `deploy/sql/2026-07-17-prueba-social-copies.sql` con un `UPDATE` por fila:
`UPDATE content_plan SET copy_text = $$<narrativa nueva>$$ WHERE id = '<uuid>';`
(dollar-quoting para evitar escapes; envolver todo en `BEGIN; … COMMIT;`). Confirmar antes y aplicarlo vía el comando base de SSH (redirigiendo el archivo a `psql`).

- [ ] **Step 4: Verificar [PROD, read-only]**

Repetir la query del Step 1. Expected: cada `copy_text` empieza con el gancho nuevo, sin `—`, con el cierre correcto por `post_type`.

- [ ] **Step 5: Regenerar imágenes de esas filas [PROD]**

Para que tomen el nuevo render sin headline, resetear/regenerar con `regen-today.sh <fecha|uuid>` (limpia jpg + dispara webhook). Confirmar antes. Expected: cada post vuelve a Telegram para aprobación con imagen de marca sin headline.

- [ ] **Step 6: Commit (registro del cambio de contenido)**

Los datos viven en la DB, pero dejar traza del SQL aplicado:
```bash
git add deploy/sql/2026-07-17-prueba-social-copies.sql
git commit -m "content(w3b): reescribir prueba_social como narrativa texto_largo"
```

---

## Task 6: W5 — Reescribir el post de hoy

**Files:**
- Modify: fila `content_plan` de hoy (o próxima pending), vía SQL por `id`
- Create: `deploy/sql/2026-07-17-rewrite-today.sql` (traza)

**Interfaces:**
- Consumes: fila de `scheduled_date = CURRENT_DATE` (o la próxima pending).
- Produces: `copy_text` reescrito con un solo CTA, gancho, 3-5 hashtags.

- [ ] **Step 1: Leer el post de hoy [PROD, read-only]**

Run:
```bash
ssh -i ~/.ssh/jaagsolutions_vps jaagsolutions@34.41.171.138 \
  'docker exec deploy-postgres-1 sh -c '\''psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -x -c "SELECT id, scheduled_date, format, pillar, post_type, vertical, status, copy_text, hashtags, cta_url FROM content_plan WHERE scheduled_date = CURRENT_DATE ORDER BY scheduled_time;"'\'''
```
Expected: la fila de hoy. Si `status='published'`, tomar la próxima pending (`scheduled_date > CURRENT_DATE ... LIMIT 1`).

- [ ] **Step 2: Reescribir el copy**

Redactar `copy_text` nuevo: gancho en línea 1, patrón **dolor → solución → métrica** (referencia "De 3 horas a 18 minutos"), un solo cierre según `post_type` (valor = engagement, conversion = CTA duro), sin `—`, sin comment-bait + link a la vez. Hashtags 3-5 del set de Task 2 según `pillar`/`post_type`.

- [ ] **Step 3: Escribir y aplicar el update [PROD]**

Crear `deploy/sql/2026-07-17-rewrite-today.sql` con:
`UPDATE content_plan SET copy_text=$$<copy nuevo>$$, hashtags='#... #... #...' WHERE id='<uuid>';`
(envuelto en `BEGIN; … COMMIT;`). Confirmar antes y aplicarlo vía el comando base de SSH.

- [ ] **Step 4: Resetear a pending y regenerar si estaba en review/generating [PROD]**

Si la fila no estaba `pending`: `regen-today.sh <uuid>` (resetea, limpia jpg, dispara webhook). Confirmar antes. Expected: el post vuelve a Telegram para aprobación.

- [ ] **Step 5: Verificar [PROD, read-only]**

Repetir Step 1. Expected: copy reescrito, un solo CTA, 3-5 hashtags, sin `—`.

- [ ] **Step 6: Commit (traza)**

```bash
git add deploy/sql/2026-07-17-rewrite-today.sql
git commit -m "content(w5): reescribir post del dia (un CTA, gancho, 3-5 hashtags)"
```

---

## Cierre

- [ ] **Verificación global [PROD, read-only]:** correr las queries de verificación del spec (secciones W1-W5) y confirmar: 3-5 hashtags, ningún post con dos acciones, prueba_social en texto_largo sin headline, 0 filas pending de seguros, post de hoy reescrito.
- [ ] **Push final** de la rama `feature/jaagsolutions` y confirmar que el VPS quedó sincronizado (`git pull` aplicado, workflows importados+activos, imagen n8n rebuildeada).
- [ ] Marcar el spec como implementado en `docs/superpowers/specs/2026-07-17-linkedin-pipeline-correction-design.md` (una línea de estado).
