# Corrección del pipeline de contenido LinkedIn — JAAGSOLUTIONS

**Estado:** Aprobado (diseño) — 2026-07-17
**Autor:** Juan (inverjaag) + agente
**Alcance:** Operación de contenido JAAGSOLUTIONS en n8n (`content_plan` + workflows).
**Doc canónico relacionado:** `docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md` (se actualiza como parte de esta corrección).

---

## Contexto y motivación

Análisis de LinkedIn a 90 días: 6.178 impresiones, 2.337 personas alcanzadas, 8 clics
al link (CTR ~0,13%), 0 leads. El diagnóstico apuntó a que el pipeline se desvió de la
estrategia documentada y acumuló decisiones que se contradicen entre sí. Esta corrección
ataca cinco frentes concretos, todos verificados contra el código real del repo `deploy/`.

**Hallazgos de arquitectura que condicionan el diseño:**

- Los hashtags, CTA y formato se fijan **al sembrar** la fila en `content_plan` (SQL en
  `deploy/sql/`). No se generan: el `content-generator` lee `prev.hashtags` de la fila.
- El publisher (`telegram-approval.json`) tiene **4 builders idénticos** que arman el
  caption como `[copy_text, link, hashtags].join('\n\n')`. El preview de Telegram
  (`content-generator.json`) usa la misma lógica.
- `compose-image.js` **hornea el headline** (bloque 1 del `copy_text` antes del primer
  `\n\n`) sobre la imagen, más logo + barra dorada + URL.
- Regla vigente (SOURCE_OF_TRUTH 2026-06-18): **link en TODO post**. La regla previa
  "valor sin link" quedó obsoleta. Por eso hoy un post `valor` lleva DOS acciones:
  soft-CTA de comentarios (del fix de junio) **y** link → el "dos CTAs compitiendo".
- El vertical `seguros_servicio` (desde 2026-06-16) corre en carril propio Martes+Jueves;
  su lote (8 piezas, 18-jun a 14-jul) **ya venció**. El carril está seco hoy (17-jul).

---

## Objetivos

1. **Hashtags 3-5** por pieza (revertir el set de 12-13 del fix de junio).
2. **Un CTA por post** vía split por funnel: `valor` = solo engagement (sin link),
   `conversion` = link + CTA duro (sin comment-bait).
3. **Habilitar `texto_largo`** como formato real (además de `imagen_copy`), asignado a
   Prueba Social. Carrusel queda **fuera de alcance** (infra multi-slide diferida).
4. **Pausar el vertical de seguros** del todo → cadencia core-only Lun/Mié/Vie.
5. **Reescribir el post de hoy** aplicando las nuevas reglas.

**Fuera de alcance (explícito):** carrusel multi-slide, LinkedIn Ads / Company Page,
link en primer comentario, `texto_largo` como texto puro sin imagen, separar INVERJAAG.

---

## Diseño por work item

### W1 · Hashtags → 3-5

Nuevo SQL idempotente `deploy/sql/2026-07-17-hashtags-3-5.sql` que sobrescribe `hashtags`
en filas `status='pending' AND scheduled_date >= CURRENT_DATE`. Sets de nicho (dueños de
PYME en El Salvador siguen estos tags):

| Segmento | Hashtags (3-5) |
|---|---|
| core genérico (`educacion`, `behind_the_scenes`) | `#PymesSV #AutomatizaciónPymes #TransformaciónDigital` |
| `casos_de_uso` / `prueba_social` | `#AutomatizaciónPymes #CasosDeÉxito #PymesSV` |
| `post_type='conversion'` | `#AutomatizaciónPymes #TransformaciónDigital #PymesSV #NegociosSV` |

- `compose-image.js` ya recorta a 4 (`shortenHashtags`) — no se toca ahí.
- **No** se define set de seguros nuevo (el vertical se pausa; W4).
- Actualizar en `SOURCE_OF_TRUTH.md`: regla "hashtags 8-15" → "**3-5 de nicho**"; marcar
  los sets de `2026-06-17-fix-hashtags-softcta.sql` como **superseded**.

### W2 · CTA split por funnel

Cambiar la construcción del caption para que el **link se agregue solo en `conversion`**.

- **Archivos:** `deploy/n8n-workflows/telegram-approval.json` (los 4 builders) y el nodo
  "Telegram — enviar para aprobación" de `content-generator.json` (preview).
- **Regla nueva del builder:**
  `showCta = post_type === 'conversion' && cta && !copy.includes(cta)`
  (hoy es `showCta = cta && !copy.includes(cta)`, sin condición de `post_type`).
- Resultado:
  - `valor` → caption `[copy_text, hashtags]` (conserva el soft-CTA de comentarios que
    ya vive en `copy_text`; **sin** link).
  - `conversion` → caption `[copy_text, link, hashtags]` (conserva "👉 Agenda tu
    diagnóstico" en `copy_text`; único con link; **sin** comment-bait).
- El código de los Code nodes se edita en `deploy/n8n-workflows/lib/*.js` cuando exista el
  builder ahí; si los 4 builders están inline en el JSON, editarlos de forma idéntica y
  re-importar con `id` baked-in (ver procedimiento de import del SOURCE_OF_TRUTH).
- Actualizar `SOURCE_OF_TRUTH.md`: revertir "link en todo post" → "**link solo en
  `conversion`; `valor` = engagement sin link**". Mover "valor sin link" de "Obsoletos"
  a regla vigente.

### W3 · Formato `texto_largo`

**Asignación de formato.** SQL que pasa a `format='texto_largo'` las filas
`pillar='prueba_social' AND status='pending' AND scheduled_date >= CURRENT_DATE`
(pilar que la estrategia original asignó a texto largo con gancho).

**Render.** `deploy/n8n-scripts/compose-image.js`: si `format === 'texto_largo'`,
**omitir el bloque `<text>` del headline horneado y su barra dorada asociada** (la barra
va justo encima del headline). Se conserva el logo arriba y la URL abajo (imagen de marca
limpia). El gradiente inferior (`bottomFade`) se **atenúa o elimina** para esta rama, ya
que sin headline no cubre texto y una caja oscura vacía se vería mal. Requiere rebuild de
la imagen n8n (`Dockerfile.n8n`).

**Copy.** Los `texto_largo` se reescriben como narrativa: **gancho fuerte en la línea 1**
(lo que LinkedIn muestra antes de "ver más") → desarrollo/historia → insight → cierre
según `post_type` (engagement si `valor`, CTA duro si `conversion`). El gancho va en el
`copy_text`, no horneado en la imagen.

**Decisión registrada:** `texto_largo` = **caption largo + imagen de marca sin headline**
(no texto puro). Mantiene el publisher intacto (sigue adjuntando 1 imagen) y la
consistencia visual de marca.

### W4 · Pausar seguros

- **No recargar** el carril seguros (lote 18-jun→14-jul ya vencido; carril seco).
- Verificar que no queden filas `pending` con `vertical='seguros_servicio' AND
  scheduled_date >= CURRENT_DATE`. Si las hubiera, decidir caso por caso (probablemente
  ninguna).
- **Cadencia futura:** core-only **Lunes/Miércoles/Viernes**. Se eliminan los slots
  Martes/Jueves de seguros. No se reabsorben en más posts core (baja a 3/semana).
- **Código dormido:** se conserva la columna `vertical`, el constraint y los cortocircuitos
  en `prep-auditor-prompt.js`. No se ejecutan porque no habrá filas con ese vertical.
  Reactivable en el futuro (idealmente como canal propio, no mezclado en el perfil personal).
- Actualizar `SOURCE_OF_TRUTH.md`: sección de cadencia → seguros **PAUSADO** (con fecha y
  motivo: expansión horizontal prematura, sin resultados, diluía alcance del perfil).

### W5 · Reescribir el post de hoy

1. Leer vía SSH la fila de hoy:
   `SELECT id, format, pillar, post_type, vertical, status, copy_text, hashtags, cta_url
    FROM content_plan WHERE scheduled_date = CURRENT_DATE ORDER BY scheduled_time;`
   Si hoy ya está `published`, tomar la próxima `pending`.
2. Reescribir `copy_text` aplicando: gancho en línea 1, patrón **dolor → solución →
   métrica** (referencia: "De 3 horas a 18 minutos"), **un solo CTA** según `post_type`
   (sin comment-bait + link a la vez), sin em dash (—→coma), 3-5 hashtags del set W1.
3. `UPDATE` de la fila. Si está en `review`/`generating`, resetear a `pending` y limpiar
   `image_url/retry_count/error_log/telegram_msg_id` + borrar el `.jpg` viejo, luego
   regenerar con `regen-today.sh` para que vuelva a pasar por aprobación en Telegram.

---

## Orden de implementación sugerido

1. W4 (pausar seguros) — decisión de datos, sin dependencias.
2. W1 (hashtags SQL) — idempotente, aislado.
3. W2 (builders CTA split) — toca workflows; requiere re-import + verificar `id` activo.
4. W3 (texto_largo: SQL + compose-image + copy) — requiere rebuild de imagen n8n.
5. W5 (post de hoy) — al final, ya con las reglas nuevas vigentes.
6. Actualizar `SOURCE_OF_TRUTH.md` con todos los cambios (W1, W2, W3, W4).

## Verificación

- **W1:** `SELECT pillar, post_type, hashtags FROM content_plan WHERE status='pending' AND
  scheduled_date >= CURRENT_DATE;` → cada fila con 3-5 hashtags del set correcto.
- **W2:** en un `valor` de prueba, el caption preview de Telegram **no** contiene
  `jaagsolutions.com`; en un `conversion`, sí. Ningún post lleva las dos acciones.
- **W3:** una fila `texto_largo` regenerada produce imagen **sin** headline horneado;
  `format` de `prueba_social` pendientes = `texto_largo`.
- **W4:** `SELECT count(*) FROM content_plan WHERE vertical='seguros_servicio' AND status
  ='pending' AND scheduled_date >= CURRENT_DATE;` = 0. No hay slots Mar/Jue nuevos.
- **W5:** la fila de hoy tiene copy reescrito, un solo CTA, 3-5 hashtags, y pasa por
  Telegram para aprobación.

## Riesgos

- **Re-import de workflows crea duplicados** si el `id` no coincide con el activo. Mitigación:
  verificar `id` activo contra `webhook_entity` antes de importar (ver SOURCE_OF_TRUTH).
- **Rebuild de imagen n8n** (W3) requiere `Dockerfile.n8n` + reinicio; coordinar ventana.
- **Regla superseded que revive:** W2 reactiva "valor sin link". Documentar bien para que
  una auditoría futura no la vuelva a marcar obsoleta por error.
