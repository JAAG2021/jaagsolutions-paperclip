// FUENTE CANÓNICA del nodo "Monitor: preparar alerta Telegram" (id: code-monitor-alert-text)
// del workflow content-generator.json.
//
// Editar AQUÍ y luego inyectar al JSON con: python lib/sync-node-code.py
// Tests: node --test lib/monitor-alert-text.test.js
//
// Entrada: filas del nodo "Monitor: posts atascados hoy". Dos clases de fila:
//   - posts con problema HOY (monitor_action null o 'auto-reset')
//   - EXACTAMENTE UNA fila agregada con monitor_action='runway' que reporta cuánta
//     agenda futura queda (siempre presente, incluso si no hay nada más que decir).
//
// 2026-08-14: se agregó el chequeo de runway. Antes el nodo abría con
// `if (!rows.length) return []`, así que una agenda VACÍA no generaba ninguna alerta:
// el pipeline llevaba 14 días sin publicar y el monitor callaba, porque solo miraba
// posts de HOY y con la agenda agotada no había ninguno. Ese era el punto ciego.

const RUNWAY_MIN_DIAS = 7;

const all = $input.all().map(i => i.json);
const runway = all.find(r => r.monitor_action === 'runway') || null;
const rows = all.filter(r => r.monitor_action !== 'runway');

const runwayPosts = runway ? Number(runway.runway_posts || 0) : 0;
const runwayDias = runway && runway.runway_days !== null && runway.runway_days !== undefined
  ? Number(runway.runway_days)
  : null;
// Sin fila de runway (query vieja) no se opina de agenda: se conserva el comportamiento previo.
const runwayBajo = runway !== null && (runwayPosts === 0 || runwayDias === null || runwayDias <= RUNWAY_MIN_DIAS);

if (!rows.length && !runwayBajo) return [];

const secciones = [];

if (rows.length) {
  const resetCount = rows.filter(r => r.monitor_action === 'auto-reset').length;
  const lines = rows.map(r => {
    const prefix = r.monitor_action === 'auto-reset' ? '[🔄 auto-reset] ' : '- ';
    const detail = r.error_log ? ' | ' + String(r.error_log).slice(0, 160) : '';
    return prefix + r.scheduled_time + ' ' + (r.platform || '').toUpperCase() + ' ' + r.pillar + ' | ' + r.status + (r.retry_count ? ' (retry:' + r.retry_count + ')' : '') + ' | ' + r.id + detail;
  });
  const encabezado = resetCount > 0
    ? resetCount + ' post(s) ATASCADOS en generating fueron RESETEADOS a pending.\nPosts de hoy pendientes/error/review-sin-msg:\n'
    : 'Posts de hoy atascados o con error:\n';
  secciones.push(encabezado + lines.join('\n') + '\n\nAccion: revisar content_plan / n8n executions antes de que se pierda la publicacion. Los [🔄 auto-reset] se reintentaran mañana a las 08:00.');
}

if (runwayBajo) {
  const detalle = runwayPosts === 0
    ? '🚨 AGENDA AGOTADA: quedan 0 posts pending en content_plan. El cron de las 08:00 no tiene nada que generar y NO va a avisar por su cuenta.'
    : '⚠️ AGENDA POR AGOTARSE: quedan ' + runwayPosts + ' post(s) pending, cobertura hasta ' + runway.runway_last_date + ' (' + runwayDias + ' dias).';
  secciones.push(detalle + '\nAccion: sembrar el siguiente lote en content_plan (ver deploy/sql/) con fechas FUTURAS: el cron solo toma scheduled_date = CURRENT_DATE, las fechas vencidas no se recuperan.');
}

return [{ json: { text: 'ALERTA post-cron JAAGSOLUTIONS 08:15\n\n' + secciones.join('\n\n') } }];
