# Content Pipeline Source Of Truth

**Estado:** Canonico  
**Ultima actualizacion:** 2026-06-16  
**Alcance:** Operacion de contenido JAAGSOLUTIONS en n8n.

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
| Telegram Approval → Publisher | `KkMSaxsZ2KFZopzU` |
| Formspree Lead → Paperclip Issue | `wGBj1gkmy1JoBfGP` |

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
| `cta_url` | URL de CTA, fallback `https://jaagsolutions.com`. |
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

Cadencia vigente desde 2026-05-25 hasta 2026-07-31:

```text
Core JAAGSOLUTIONS (vertical='jaagsolutions_core'):
  Lunes    10:00
  Miercoles 10:00
  Viernes  16:00

Seguros JAAGSOLUTIONS (vertical='seguros_servicio') — desde 2026-06-16:
  Martes   10:00  (carril propio, no toca el core)
  Jueves   10:00  (ACTIVO desde 2026-06-18 — expansion aprobada tras piloto OK)
  Lote cargado: 18-jun a 14-jul 2026 (8 piezas imagen_copy, embudo A/B/C + conversion).
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
- Con esto, `vertical` ya **no afecta el ruteo** (antes `seguros_servicio` se
  exceptuaba del modo diagrama). Ahora todos los pilares/verticales siguen el
  mismo camino humano/editorial.

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

### CTA por post_type + UTMs (2026-06-17)

El caption final se arma en el publisher (`telegram-approval.json`) como
`copy_text` + (link CTA) + `hashtags`. Reglas:

- **`valor`**: engagement, SIN link. El publisher solo añade `cta_url` si
  `post_type = 'conversion'`.
- **`conversion`**: lleva una línea de CTA dura en el `copy_text`
  ("👉 Agenda tu diagnóstico gratuito de 10 minutos.") y el publisher añade el
  `cta_url` con destino al formulario de diagnóstico.
- **Destino conversión**: el sitio es one-page; NO existe `/diagnostico`. El destino
  es `https://jaagsolutions.com/?<utms>#contacto` (los UTMs van ANTES del `#`).
  Si se crea una landing dedicada, cambiar `base`/`anchor` en el seed, el SQL de
  retrofit y `insert-content-plan.py`.
- **UTMs** (atribución): `utm_source=<platform>`, `utm_medium=social`,
  `utm_campaign=<pillar>`, `utm_content=<YYYYMMDD>`, `utm_term=<post_type>`.
  Caveat: una fila `platform='meta'` también cross-postea a LinkedIn con
  `utm_source=meta`; para atribución por red exacta habría que mover los UTMs al
  publisher (por nodo). Hoy es capa de datos (cero cambios de topología).

Artefactos: `deploy/sql/2026-06-17-cta-by-posttype-utm.sql` (retrofit pendientes,
idempotente), seed `2026-05-25-...sql` (nuevos), `insert-content-plan.py` (`--cta`
vacío = auto con UTMs).

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

## Politica De Limpieza

No se aceptan workflows de publicacion paralelos.
No se aceptan listas hardcodeadas de posts dentro de workflows.
No se aceptan calendarios externos como fuente viva.
No se aceptan scripts de importacion que creen otra ruta de agenda.
