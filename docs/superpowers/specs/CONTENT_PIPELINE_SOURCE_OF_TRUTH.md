# Content Pipeline Source Of Truth

**Estado:** Canonico  
**Ultima actualizacion:** 2026-06-18  
**Alcance:** Operacion de contenido JAAGSOLUTIONS en n8n.

> 🗺️ ¿Buscas dónde se arma algo o por qué salió mal? Salta directo a
> **"Mapa De Composición"** y **"Problemas Conocidos → Causa → Solución"** (al final).

---

## Regla Principal

```text
Si no esta en content_plan, no esta agendado.
```

La unica fuente operacional para publicaciones futuras es la tabla PostgreSQL `content_plan`.

Los documentos de estrategia explican contexto editorial. No agendan publicaciones.
Los archivos locales fuera de `content_plan` no son fuente viva.
Los workflows oficiales no deben leer calendarios paralelos ni listas hardcodeadas.

---

## Workflows Oficiales

| Workflow | Ruta repo | Rol |
|---|---|---|
| Content Generator | `deploy/n8n-workflows/content-generator.json` | Lee `content_plan`, genera imagen, valida y envia a Telegram. |
| Telegram Approval -> Publisher | `deploy/n8n-workflows/telegram-approval.json` | Recibe aprobacion/rechazo, publica y actualiza `content_plan`. |
| Formspree Lead -> Paperclip Issue | `deploy/n8n-workflows/formspree-to-paperclip.json` | Convierte leads del sitio en issues operativos. |

No debe existir otro workflow de publicacion de contenido en `deploy/n8n-workflows/`.

### IDs estables de workflow (anti-duplicados)

Cada JSON oficial lleva un campo `id` fijo que coincide con el workflow en n8n producción:

| Workflow | `id` n8n |
|---|---|
| Content Generator | `FjeJW9Qb8vNiDwz5` |
| Telegram Approval → Publisher | `KduOBXYi3tuDG3fZ` |
| Formspree Lead → Paperclip Issue | `wGBj1gkmy1JoBfGP` |

> ⚠️ **Corregido 2026-07-17:** el `id` de Telegram Approval → Publisher documentado antes
> (`KkMSaxsZ2KFZopzU`) estaba **desactualizado** y ya no es el workflow activo. Auditoria
> encontro 4 copias con el mismo nombre en la instancia (`KkMSaxsZ2KFZopzU`, `mu4Wqrrwk17hKbSk`,
> `J4NE9LD2lOidvnKd`, `KduOBXYi3tuDG3fZ`); solo `KduOBXYi3tuDG3fZ` esta activo y tiene el
> webhook `telegram-approval` (verificado en `webhook_entity`). Las otras 3 son duplicados
> **Inactive** pendientes de archivar (ver "Elementos Obsoletos"). Si vas a editar este
> workflow, verifica primero contra `webhook_entity`/`docker exec deploy-n8n-1 n8n list:workflow`
> cual id esta realmente activo antes de asumir el de esta tabla.

Con el `id` baked-in, `n8n import:workflow --input=<archivo>.json` **actualiza el workflow existente**, no crea copias.

**Procedimiento de import (correcto):**

```text
1. docker cp deploy/n8n-workflows/content-generator.json deploy-n8n-1:/tmp/wf.json
2. docker exec deploy-n8n-1 n8n import:workflow --input=/tmp/wf.json
3. Reactivar: el CLI SIEMPRE deja el workflow inactivo (ignora "active" del JSON).
   - Opción A (preferida): toggle Active en la UI de n8n.
   - Opción B: docker stop n8n → UPDATE workflow_entity SET active=1 WHERE id=... → docker start n8n.
```

- El JSON ya trae `tags: []` → NO requiere ninguna transformación previa.
- ⚠️ PROHIBIDO aplicar `re.sub(r'<[^>]+>', '', ...)` sobre el JSON: ese regex borra contenido de nodos y deja conexiones colgantes (incidente 2026-06-16, 6 nodos perdidos).
- El CLI no tiene `delete:workflow`. Para borrar duplicados: detener n8n, backup de `database.sqlite`, borrar con SQLite, `PRAGMA integrity_check`, reiniciar.

---

## Tabla Operacional

Schema:

```text
deploy/sql/content-plan-schema.sql
```

Campos minimos para que un post pueda entrar al cron:

| Campo | Requisito |
|---|---|
| `scheduled_date` | Fecha objetivo de publicacion. |
| `scheduled_time` | Hora objetivo de publicacion. |
| `platform` | `linkedin`, `instagram`, `facebook` o `meta`. |
| `format` | Formato valido del schema. |
| `pillar` | Pilar valido del schema. |
| `post_type` | `valor` o `conversion`. |
| `copy_text` | Copy final del post. |
| `image_prompt` | Prompt visual para generacion. |
| `hashtags` | Campo separado, no incrustado en `copy_text`. |
| `cta_url` | El caption SIEMPRE muestra `https://jaagsolutions.com` (dominio limpio, sin UTMs). Ver "Link y CTA — DOMINIO LIMPIO". |
| `status` | Debe ser `pending` para que el cron lo procese. |
| `vertical` | Etiqueta de vertical. Default `'jaagsolutions_core'`. Seguros usa `'seguros_servicio'`. Solo metadata/filtros (desde 2026-06-17 ya no afecta ruteo de generación). Columna formalizada en `deploy/sql/2026-06-17-add-vertical-column.sql`. |

---

## Entrada De Contenido

El unico script autorizado para agregar nuevos posts desde automatizacion o agente A4 es:

```text
deploy/scripts/insert-content-plan.py
```

El script inserta nuevas filas con `status = 'pending'`.

Para cargas operativas puntuales desde el VPS se permite ejecutar SQL directo contra
`content_plan`, siempre que inserte en la tabla oficial y no cree otra fuente viva.
La carga de agenda posterior a la auditoria 2026-05-25 esta en:

```text
deploy/sql/2026-05-25-seed-content-plan-operational-agenda.sql
```

Ese archivo es idempotente y solo sirve para poblar `content_plan`. Despues de
ejecutarlo, la fuente de verdad vuelve a ser exclusivamente la tabla.

Cadencia vigente desde 2026-07-17 (core-only):

```text
Core JAAGSOLUTIONS (vertical='jaagsolutions_core'):
  Lunes    10:00
  Miercoles 10:00
  Viernes  16:00

Seguros JAAGSOLUTIONS (vertical='seguros_servicio') — PAUSADO desde 2026-07-17:
  Motivo: expansion horizontal prematura. Segundo ICP (corredores de seguros)
  sobre el perfil personal con alcance minimo y sin resultados; diluia la senal
  del perfil y sumaba deuda tecnica. El lote 18-jun a 14-jul 2026 (8 piezas) se
  agoto y NO se recarga. No hay carril Martes/Jueves.
  Codigo dormido (columna `vertical`, constraint y cortocircuito en
  prep-auditor-prompt.js se conservan) — reactivable en el futuro, idealmente como
  canal/pagina propia, no mezclado en el perfil personal core.
```

La agenda usa `platform = 'meta'` porque el workflow oficial publica primero en
Facebook/Instagram y luego continua hacia LinkedIn. Usar `platform = 'linkedin'`
limita la salida a LinkedIn.

El SQL operativo completa todos los lunes, miercoles y viernes de junio y julio
2026, mas el arranque de la semana actual desde lunes 2026-05-25.

---

## Consulta Del Cron

El workflow `Content Generator` toma posts con esta logica:

```sql
SELECT *
FROM content_plan
WHERE status = 'pending'
AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 2
ORDER BY scheduled_date, scheduled_time
LIMIT 1;
```

Implicaciones:

- Una fila futura debe existir en `content_plan`.
- La fila debe estar en `pending`.
- Fechas vencidas no vuelven a entrar automaticamente.
- Estados `review`, `generating`, `published` o `error` requieren intervencion operativa.

---

## Verificacion Operativa

Ver lo que el cron puede procesar:

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, scheduled_date, scheduled_time, platform, pillar, status FROM content_plan WHERE status = '\''pending'\'' AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 2 ORDER BY scheduled_date, scheduled_time;"'
```

Ver agenda futura real:

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, scheduled_date, scheduled_time, platform, pillar, status FROM content_plan WHERE scheduled_date >= CURRENT_DATE ORDER BY scheduled_date, scheduled_time;"'
```

Ver estados atascados:

```bash
docker exec deploy-postgres-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, scheduled_date, scheduled_time, platform, pillar, status, error_log FROM content_plan WHERE status IN ('\''review'\'','\''generating'\'','\''error'\'') ORDER BY scheduled_date, scheduled_time;"'
```

---

## Modo Diagrama — ELIMINADO (2026-06-17)

El "modo diagrama" (overlay hub-and-spoke con nodo central — `'n8n'` para
automatización — más íconos de apps) fue **eliminado de raíz**. Producía piezas
genéricas que contradecían el mensaje y exponían marcas de terceros.

Cambios aplicados:

- `code-ideogram-ocr` ya **no** calcula `diagram_type` (se eliminó `_DIAGRAM_MAP`).
  Siempre devuelve `diagram_type: null`. Las escenas son humanas/editoriales: en
  intentos normales usa el `image_prompt` del Auditor; el fallback seguro también
  es humano. Se conserva la red de seguridad OCR + anatomy QA.
- `deploy/n8n-scripts/compose-image.js` ya **no** contiene `buildDiagramSVG` ni
  `createGradientBackground`. El overlay es solo logo + headline + barra + URL.
- Con esto, `vertical` ya no afecta el **modo** (el diagrama fue eliminado): todos
  los pilares/verticales siguen el mismo camino humano/editorial.
- **PERO (actualizado 2026-06-18)** `vertical` SÍ afecta el **concepto visual**:
  `vertical='seguros_servicio'` fuerza la escena de asesoría (corredor + clientes),
  ignorando el `_conceptMap` derivado del copy. Motivo: un copy de seguros que menciona
  "LinkedIn/redes sociales" disparaba el concepto social y arruinaba el tono. Además se
  quitó la directiva "printed photo cards" de ese concepto social. Fix en
  `prep-auditor-prompt.js` (cortocircuito por vertical).

### Alineación imagen ↔ copy (2026-06-17)

La imagen debe **ilustrar el mensaje del post**, no ser decoración genérica por pilar.

- El prompt del Auditor (`code-prep-auditor-prompt`) ahora **deriva el concepto
  visual del `copy_text`** (driver principal) en vez de usar la plantilla genérica
  por pilar del seed. Filosofía: *ilustrar concretamente, props permitidos, prohibir
  solo TEXTO legible*. Se eliminó la directiva previa de "abstract is always safer".
- `negative_prompt` (en `ideogram-ocr.js`) ya **no prohíbe props** (papel, pizarra,
  diagramas dibujados a mano con formas); solo prohíbe texto legible + anatomía
  deforme + poses románticas/glamour. El guard de OCR cubre texto accidental.
- Para nuevos posts, dejar `image_prompt` vacío o alineado al copy permite que el
  Auditor derive la escena; si trae un prompt específico (>20 chars) se usa como
  fallback.

### Link y CTA — DOMINIO LIMPIO (actualizado 2026-06-18) ⟵ SUPERSEDE UTMs

> ⚠️ Esta sección **reemplaza** la política de UTMs del 2026-06-17. Los UTMs en
> `cta_url` quedaron **OBSOLETOS**: en texto plano de redes no aportan atribución
> real y ensucian el copy (se veía una URL larga). Decisión de la auditoría 2026-06-18.

El caption final se arma en el publisher (`telegram-approval.json`, 4 builders idénticos)
y en el preview de Telegram (`content-generator.json`) como
`[copy_text, link, hashtags].join('\n\n')`. Reglas vigentes:

- **Link SOLO en `post_type='conversion'`** (actualizado 2026-07-17 — SPLIT POR FUNNEL).
  El builder añade el link únicamente en conversion:
  `showCta = post.post_type === 'conversion' && cta && !copy.includes(cta)` (en el
  preview de content-generator la fila es `$json`). Los posts **`valor` publican
  `[copy, hashtags]` sin link** (optimizan alcance/engagement; conservan su soft-CTA de
  comentarios). Un post = una sola acción. ⟵ REEMPLAZA "link en todo post" del 2026-06-18.
- **El link visible es SIEMPRE `https://jaagsolutions.com`**. Los builders recortan
  `?...` y `#...` del `cta_url` antes de mostrarlo: aunque la fila traiga UTMs o
  `#contacto`, en pantalla sale el dominio pelado.
- **`conversion`** mantiene su línea de CTA dura dentro del `copy_text`
  ("👉 Agenda tu diagnóstico gratuito de 10 minutos.").
- **`cta_url` en la DB**: `insert-content-plan.py` lo genera ya limpio (`CLEAN_LINK`).
  El SQL `2026-06-17-cta-by-posttype-utm.sql` fue editado para escribir dominio limpio
  (su nombre con "utm" es **histórico**; ya NO genera UTMs).
- **Tradeoff aceptado**: sin UTMs no hay atribución por red en estos links de texto
  plano. Si se quiere atribución en el futuro, usar un **link corto de marca** que
  redirija con UTMs del lado del sitio — NO reintroducir UTMs en el caption.

Artefactos: retrofit del lote pendiente en
`deploy/sql/2026-06-18-fix-emdash-link-hashtags-seguros.sql` (idempotente),
`insert-content-plan.py` (`CLEAN_LINK` + `sanitize_copy`).

### Guion largo (—) PROHIBIDO en publicación (2026-06-18)

Nunca debe publicarse `—`/`–`. Se reemplaza por **coma** en tres capas (defensa en
profundidad): inserción (`insert-content-plan.py` → `sanitize_copy`), headline horneado
(`compose-image.js`) y los 5 builders de caption (regex `/\s*[—–]\s*/g` reemplaza por coma).

### Fuente de verdad del código de los Code nodes

- El código de los Code nodes se edita en `deploy/n8n-workflows/lib/*.js` y se
  inyecta al JSON con `python deploy/n8n-workflows/lib/sync-node-code.py`
  (`--check` valida sin escribir). Mapa actual: `code-ideogram-ocr` →
  `ideogram-ocr.js`; `code-prep-auditor-prompt` → `prep-auditor-prompt.js`.
  Reemplaza al obsoleto `build-content-generator.py` (eliminado).
- El system prompt del Auditor vive **solo** en `prep-auditor-prompt.js` (la antigua
  `lib/auditor-system-prompt.md` fue eliminada por divergente).
- El compose canónico es `deploy/n8n-scripts/compose-image.js` (se despliega vía
  `Dockerfile.n8n`: `COPY n8n-scripts/ /opt/n8n-scripts/` → requiere rebuild de la
  imagen n8n). La antigua copia `lib/compose-image.js` fue eliminada.

---

## Mapa De Composición — Dónde Se Arma Cada Elemento

Tabla única de "quién genera qué" (para no recorrer archivos):

| Elemento | Fuente de verdad | Notas |
|---|---|---|
| Concepto/escena de la imagen | `lib/prep-auditor-prompt.js` → nodo `code-prep-auditor-prompt` | `_conceptMap` deriva el concepto del `copy_text`. `vertical='seguros_servicio'` fuerza escena de asesoría. Sincronizar al JSON con `lib/sync-node-code.py`. |
| Generación imagen (Ideogram) + OCR | `lib/ideogram-ocr.js` → nodo `code-ideogram-ocr` | `magic_prompt: OFF`. `negative_prompt` prohíbe solo texto legible + anatomía/glamour. |
| Texto horneado en la imagen (headline, logo, URL) | `deploy/n8n-scripts/compose-image.js` | Solo bloque 1 del copy. Reemplaza `—` por coma. **Si `format='texto_largo'`: se OMITE el headline + barra dorada + gradiente inferior; queda solo logo (arriba) + URL (abajo)** = imagen de marca limpia (el mensaje lo carga el caption, con gancho en línea 1). Cambios requieren rebuild de la imagen n8n (`Dockerfile.n8n`). |
| Caption publicado (LinkedIn member/org, Meta FB/IG) | `telegram-approval.json` (4 builders idénticos) | `[copy, link, hashtags].join`. Limpia `—` y recorta el link a dominio pelado. **Link solo si `post_type='conversion'`** (split por funnel, 2026-07-17). |
| Caption preview Telegram | `content-generator.json` (nodo "Telegram — enviar para aprobación") | Misma lógica que los publishers (link solo en conversion; la fila es `$json`). |
| copy_text / hashtags / cta_url (datos) | Tabla Postgres `content_plan` | Insertados por `insert-content-plan.py` o SQL en `deploy/sql/`. |
| Saneo en inserción | `deploy/scripts/insert-content-plan.py` | `sanitize_copy` (— → coma) + `build_cta_url` → `CLEAN_LINK`. |

Reglas de contenido vigentes: **guion largo** nunca (→ coma); **link** siempre
`https://jaagsolutions.com`; **hashtags** 3-5 temáticos globales, **sin geo-lock**
(nada de `#PymesSV`/`#NegociosSV`/`#SegurosElSalvador`: el mercado es pan-hispano
LATAM+España, no un país; tampoco ultra-genéricos que ahogan entre millones). Set
canónico en `2026-07-17-hashtags-3-5.sql` (supersede el 8-15 de
`2026-06-17-fix-hashtags-softcta.sql`); **imagen seguros** = escena de asesoría,
nunca tarjetas-foto.

---

## Problemas Conocidos → Causa → Solución

Auditoría de publicación 2026-06-18 (caso seguros `educacion`, post `ed135115…`,
publicado OK en LinkedIn + Instagram + Facebook):

| Síntoma | Causa raíz | Solución / dónde |
|---|---|---|
| Imagen con "tarjetas-foto" en post de seguros | La regla social del `_conceptMap` ("printed photo cards") ganaba porque el copy decía "LinkedIn", antes de la regla de seguros (corta en la 1.ª coincidencia) | Cortocircuito `vertical='seguros_servicio'` + quitar photo cards del concepto social — `prep-auditor-prompt.js` |
| Guion largo `—` en captions | `copy_text` traía `—` y ningún punto lo saneaba | Reemplazo a coma en inserción + 5 builders + headline |
| URL larga con UTMs en el caption | `cta_url` traía `?utm_...#contacto` y se mostraba crudo | Builders recortan `?`/`#`; fuente genera dominio limpio |
| Hashtag `#SegurosElSalvador` | Set seguros geo-bloqueado en el SQL de hashtags | Set keyword nuevo en `2026-06-17-fix-hashtags-softcta.sql` |
| Copy decía solo "LinkedIn" | Contenido de la fila (dato) | `Google y LinkedIn` → `Google y redes sociales` (SQL `2026-06-18-...`) |
| La migración SQL no tocó el post del día | El post estaba en `status='review'`; toda la migración filtra `status='pending'` | Resetear a `pending` y **re-correr** la migración (idempotente) ANTES de regenerar |
| Import de workflow creó duplicados en n8n | El `id` del JSON no coincidió con el workflow activo; los viejos quedaron `Inactive` | Dejar solo el nuevo `Active`; archivar los `Inactive`. Verificar `id` baked-in vs producción |
| Post marcado `published` en `content_plan` pero NUNCA salió en LinkedIn (solo Meta) | `LINKEDIN_ACCESS_TOKEN` expiró (401 `EXPIRED_ACCESS_TOKEN`, token OAuth de ~60 días sin renovar desde 2026-05-17). Todos los nodos de publicación LinkedIn tienen `continueOnFail: true` (desde `594ecd9f7`) y `status = published` corría sin condición después de la cadena LinkedIn, sin verificar si esta había fallado | Fix 2026-07-17: nodos `¿LinkedIn Org configurado?` → `Detectar fallo LinkedIn` → `¿LinkedIn OK?` insertados antes de `status = published`. Si LinkedIn falla, el post pasa a `status='error'` con el detalle en `error_log` (así lo agarra el monitor 08:15) y se dispara `Telegram — 🚨 LinkedIn falló` de inmediato. Renovar el token en LinkedIn Developer Portal (OAuth 2.0) y actualizar `LINKEDIN_ACCESS_TOKEN` en `deploy/.env` del VPS; no hay renovación automática configurada |

**Regenerar un post puntual:** `POST https://n8n.jaagsolutions.com/webhook/regenerate-single`
con body `{"post_id":"<uuid>"}` (requiere Content Generator **activo**). Antes: poner el
post en `pending`, limpiar `image_url/retry_count/error_log/telegram_msg_id`, borrar el
`.jpg` viejo en `/opt/jaagsolutions/content/<id>.jpg`.

**Atajo (un solo comando, en el VPS):** `deploy/scripts/regen-today.sh` encapsula todo el
flujo (reset → normalizar contenido → borrar jpg → disparar webhook).

```bash
./deploy/scripts/regen-today.sh                  # posts de HOY
./deploy/scripts/regen-today.sh 2026-06-20       # posts de esa fecha
./deploy/scripts/regen-today.sh <uuid>           # un post puntual
./deploy/scripts/regen-today.sh --no-clean       # solo reset + regen (sin normalizar)
```

### Gotchas de operación (consola)

- La consola **"SSH en el navegador" de GCP ya te deja DENTRO del VPS**: NO ejecutes
  `ssh jaagsolutions-vps` ahí (abre un SSH anidado a sí mismo). Corre los comandos directo.
- En **PowerShell local**, las rutas van `C:\...` (no `/c/...`, que es sintaxis Git Bash).
- `git push jaag2021 feature/jaagsolutions` (local) **antes** del `git pull` en el VPS.

---

## Elementos Obsoletos (NO usar / limpiar)

- **UTMs en `cta_url`** (política 2026-06-17): superseded por dominio limpio (2026-06-18).
- **"link en todo post"** (regla 2026-06-18): superseded por **split por funnel**
  (2026-07-17): link SOLO en `conversion`, `valor` sin link. Ver "Link y CTA".
- Nombre de archivo `2026-06-17-cta-by-posttype-utm.sql`: histórico; su contenido ya
  NO genera UTMs (genera dominio limpio).
- **Content Generator — duplicado RESUELTO 2026-07-17**: la auditoría encontró que el
  workflow ACTIVO era un duplicado congelado `v9UQ8ubdYv6htihI` (creado 06-18 13:34),
  mientras el canónico `FjeJW9Qb8vNiDwz5` (última edición 06-18 14:23, con el preview y las
  correcciones buenas) estaba **inactivo**. Es decir: desde el 18-jun corría la versión
  vieja. Consolidado: se desactivó y renombró el dup a `ZZ_OBSOLETE - Content Generator
  (dup 06-18...)`, se reimportó el repo al canónico `FjeJW9Qb8vNiDwz5` (recupera las 31
  sticky notes que el live había perdido) y se reactivó. **Único Content Generator activo =
  `FjeJW9Qb8vNiDwz5`.** Lección: `n8n import` matchea por `id` baked-in; si el activo no es
  ese `id`, el import actualiza el inactivo y el cambio no surte efecto. Verificar SIEMPRE
  el activo por API (`GET /workflows?limit=50`, campo `active`) antes de importar.
- Workflows n8n **Inactive** duplicados (Telegram Approval 17-jun): archivar para no
  confundir cuál es el vivo.
- **Telegram Approval → Publisher tiene 3 copias `Inactive` adicionales** encontradas en
  la auditoría 2026-07-17: `KkMSaxsZ2KFZopzU` (el que este doc daba por canónico, ya no
  lo es), `mu4Wqrrwk17hKbSk`, `J4NE9LD2lOidvnKd`. El único `Active` con el webhook
  `telegram-approval` real es `KduOBXYi3tuDG3fZ`. Pendiente: archivar las 3 inactivas.
- `LINKEDIN_ORGANIZATION_URN` está **vacío** en `deploy/.env` de producción (2026-07-17):
  la rama "LinkedIn Org — publicar post" no puede funcionar hasta que se cargue ese valor.
  El nodo `¿LinkedIn Org configurado?` la salta cuando está vacío para no generar alertas
  falsas, pero eso significa que hoy **no se publica en la página/organización de LinkedIn**,
  solo en el perfil personal (`LINKEDIN_AUTHOR_URN`).
- **Set de hashtags 8-15** (`2026-06-17-fix-hashtags-softcta.sql`) y los tags con geo-lock
  `#PymesSV`/`#NegociosSV`: superseded por 3-5 temáticos globales sin geo
  (`2026-07-17-hashtags-3-5.sql`, 2026-07-17).
- **Carril de seguros (vertical='seguros_servicio')**: PAUSADO 2026-07-17. No recargar el
  carril Martes/Jueves. Ver "Entrada De Contenido → Cadencia". Codigo conservado pero
  inactivo (no habra filas nuevas con ese vertical). Verificado 2026-07-17: 0 filas pending.
- Ya eliminados (no recrear): `modo diagrama`, `build-content-generator.py`,
  `lib/auditor-system-prompt.md`, `lib/compose-image.js`.

---

## Politica De Limpieza

No se aceptan workflows de publicacion paralelos.
No se aceptan listas hardcodeadas de posts dentro de workflows.
No se aceptan calendarios externos como fuente viva.
No se aceptan scripts de importacion que creen otra ruta de agenda.
