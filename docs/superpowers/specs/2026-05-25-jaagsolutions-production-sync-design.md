# JAAGSOLUTIONS - Production Sync Operating Model

**Fecha:** 2026-05-25  
**Estado:** Activo  
**Source of truth:** `Proyect_JAAGSOLUTIONS/jaagsolutions-seed.json`, `docs/superpowers/specs/CHECKLIST-MAESTRO-JAAGSOLUTIONS.md`, `deploy/RUNBOOK.md`

Este documento corrige la desincronizacion entre lo que ya esta en produccion y lo que Paperclip mostraba como pendiente. El objetivo es que JAAGSOLUTIONS opere con agentes conectados, tareas reales y workflows de contenido respetados.

---

## 1. Estado productivo reconocido

Se reconoce como produccion activa:

- Landing `https://jaagsolutions.com` live.
- Paperclip `https://paperclip.jaagsolutions.com` live.
- n8n `https://n8n.jaagsolutions.com` live.
- Workflow leads activo: Formspree Lead -> Paperclip Issue.
- Workflow contenido activo: Content Generator -> Telegram Approval -> Meta + LinkedIn Publisher.
- Pipeline de contenido validado E2E desde 2026-05-17.
- Posts publicados en FB + IG + LinkedIn durante las ultimas dos semanas via pipeline.

Por tanto, las tareas de setup de contenido ya completadas deben permanecer en `done` y el trabajo vivo debe pasar a operacion, monitoreo y mejora controlada.

---

## 2. Contrato obligatorio del workflow de contenido

Ningun agente debe publicar o regenerar contenido fuera de este contrato:

```text
content_plan
  -> Content Generator
  -> Ideogram + Auditor + OCR + compose-image
  -> Telegram approval
  -> Meta + LinkedIn Publisher
  -> FB + IG + LinkedIn
```

Reglas obligatorias:

- Todo post nuevo entra por `content_plan` o por el procedimiento aprobado en `deploy/RUNBOOK.md`.
- `copy_text` siempre usa 3 bloques: headline, cuerpo y CTA.
- `hashtags` van en campo separado; no se incrustan dentro de `copy_text`.
- `cta_url` debe existir; fallback aprobado: `https://jaagsolutions.com`.
- La imagen no debe incluir texto generado por IA ni pantallas con texto legible.
- Toda publicacion pasa por aprobacion humana en Telegram.
- Si un post queda en `pending`, `generating`, `review` o `error`, A4 no fuerza la publicacion: escala a A2.
- Los workflow IDs activos no se cambian sin plan de rollback:
  - Content Generator: `diB9nJOsjSzYbujt`
  - Telegram Approval -> Publisher: `EAfkZIDiZ1KqTPmJ`
  - Formspree Lead -> Paperclip Issue: `wGBj1gkmy1JoBfGP`

---

## 3. Agentes y responsabilidades de produccion

### A0 - CEO JAAGSOLUTIONS

Responsable de gobernanza.

- Aprueba cambios criticos en produccion.
- Aprueba presupuesto, campanas pagadas, pricing y promesas comerciales.
- Revisa metricas semanales de contenido, leads, costos y riesgos.
- Bloquea cambios sin evidencia o sin rollback.

### A1 - PM Delivery Lead

Responsable de sincronizacion operativa.

- Mantiene Paperclip alineado con la realidad.
- Cierra tareas completadas con evidencia.
- Crea issues vivos para bloqueos, monitoreo y proximas acciones.
- Coordina A2, A3 y A4 cuando una publicacion depende de workflow, contenido y objetivo comercial.

### A2 - Automation Builder

Responsable tecnico del pipeline.

- Mantiene n8n, credenciales, logs, webhooks y `content_plan`.
- Monitorea errores OCR, reintentos, estados atascados y alertas post-cron.
- Despliega cambios siguiendo `deploy/RUNBOOK.md`.
- Valida E2E despues de cualquier import de workflows.

### A3 - Growth Ops

Responsable de demanda y conversion.

- Traduce contenido publicado en aprendizaje comercial.
- Mide leads, clicks, reuniones y oportunidades.
- Coordina prioridades editoriales con A4.
- Escala campanas pagadas al CEO antes de activar presupuesto.

### A4 - Social & Content Lead

Responsable editorial dentro del workflow aprobado.

- Mantiene calendario editorial y cola `content_plan`.
- Produce copy, prompts e ideas respetando el formato obligatorio.
- Prevalida posts antes de cron.
- Reporta publicaciones, metricas y bloqueos.
- No publica manualmente por fuera del pipeline.

---

## 4. Issues que quedan vivos

Estos son los issues operativos que sostienen la produccion:

| Issue | Agente | Estado inicial | Cadencia |
|---|---|---|---|
| Desplegar y validar hardening content pipeline 2026-05-20 | A2 | todo | Una vez |
| Operar calendario editorial semanal desde content_plan | A4 | todo | Semanal |
| Monitorear health diario de workflows n8n de contenido | A2 | todo | Diario |
| Sincronizar Paperclip con publicaciones reales cada semana | A1 | todo | Semanal |
| Reporte semanal de contenido, leads y aprendizaje comercial | A3 | todo | Semanal |
| Prevalidar cola content_plan antes de cada cron de publicacion | A4 | todo | Por publicacion |
| Mantener aprobacion humana Telegram y reglas de regeneracion | A4 | todo | Continuo |

El issue historico `Pipeline automatizado de contenido - Meta + LinkedIn + Telegram approval` queda en `done` porque el E2E ya fue validado en produccion.

---

## 5. Protocolo semanal de sincronizacion

Cada semana A1 ejecuta este cierre:

1. Revisar `content_plan` y redes publicadas.
2. Comparar contra `CHECKLIST-MAESTRO-JAAGSOLUTIONS.md`.
3. Cerrar en Paperclip lo que ya esta completado con comentario de evidencia.
4. Mover a `blocked` solo lo que necesita decision o credenciales.
5. Crear nuevos issues solo si hay una accion concreta y asignable.
6. Confirmar que A2, A3 y A4 tienen proximas acciones claras.

Comentario recomendado para cierres:

```text
Sincronizado con produccion. Evidencia: workflow/post/fecha revisado en content_plan, n8n y redes. Estado real confirmado en CHECKLIST-MAESTRO-JAAGSOLUTIONS.md.
```

---

## 6. Criterio de 100% produccion

JAAGSOLUTIONS se considera 100% en produccion cuando:

- Paperclip tiene seed actualizado y aplicado.
- A4 tiene mandato de workflow en sus capabilities.
- P4 `Content Automation Production Ops` existe y tiene issues vivos.
- Los issues antiguos de setup completado estan en `done`.
- El hardening 2026-05-20 esta importado y validado en n8n.
- Existe reporte semanal de contenido/leads.
- El checklist maestro y el runbook estan actualizados despues de cada cambio productivo.
