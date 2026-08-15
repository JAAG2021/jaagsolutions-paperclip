// Tests del Code node "Monitor: preparar alerta Telegram" (id: code-monitor-alert-text).
//
// Correr:  node --test deploy/n8n-workflows/lib/monitor-alert-text.test.js
//
// El archivo bajo prueba es el cuerpo crudo del Code node. Lo ejecutamos igual que
// n8n en modo "Run Once for All Items": el cuerpo corre con $input en scope y hace
// `return` de los items de salida. Por eso se evalúa con `new Function` en vez de
// importarse — así el test cubre EXACTAMENTE el código que se inyecta al JSON.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const SRC = fs.readFileSync(
  path.join(import.meta.dirname, 'monitor-alert-text.js'),
  'utf8',
);

function runMonitorNode(rows) {
  const $input = { all: () => rows.map((json) => ({ json })) };
  return new Function('$input', SRC)($input);
}

// La fila de runway que el CTE agregado devuelve SIEMPRE (una sola, marcada).
const runwayRow = (over = {}) => ({
  id: null,
  scheduled_date: null,
  scheduled_time: null,
  platform: null,
  pillar: null,
  status: null,
  retry_count: null,
  error_log: null,
  monitor_action: 'runway',
  runway_posts: 20,
  runway_days: 45,
  runway_last_date: '2026-10-30',
  ...over,
});

// Una fila de post con problema (pending/error/atascado) del día de hoy.
const postRow = (over = {}) => ({
  id: 'ed135115-0000-4000-8000-000000000001',
  scheduled_date: '2026-08-17',
  scheduled_time: '10:00',
  platform: 'meta',
  pillar: 'educacion',
  status: 'pending',
  retry_count: 0,
  error_log: null,
  monitor_action: null,
  runway_posts: null,
  runway_days: null,
  runway_last_date: null,
  ...over,
});

test('alerta cuando la agenda futura esta vacia', () => {
  const out = runMonitorNode([
    runwayRow({ runway_posts: 0, runway_days: null, runway_last_date: null }),
  ]);

  assert.equal(out.length, 1, 'la agenda vacia DEBE producir alerta');
  assert.match(out[0].json.text, /agenda/i);
  assert.match(out[0].json.text, /sin agenda|0 post/i);
});

test('alerta cuando quedan 7 dias o menos de agenda', () => {
  const out = runMonitorNode([
    runwayRow({ runway_posts: 3, runway_days: 5, runway_last_date: '2026-08-19' }),
  ]);

  assert.equal(out.length, 1, 'runway <= 7 dias DEBE producir alerta');
  assert.match(out[0].json.text, /agenda/i);
  assert.match(out[0].json.text, /5 d/i);
});

test('sin alerta cuando el runway esta sano y no hay posts atascados', () => {
  const out = runMonitorNode([runwayRow()]);

  assert.deepEqual(out, [], 'todo sano NO debe mandar Telegram diario');
});

test('alerta de posts atascados aunque el runway este sano', () => {
  const out = runMonitorNode([
    postRow({ status: 'error', error_log: 'Telegram sendPhoto failed' }),
    runwayRow(),
  ]);

  assert.equal(out.length, 1);
  assert.match(out[0].json.text, /educacion/);
  assert.match(out[0].json.text, /error/);
});

test('la fila de runway nunca se lista como si fuera un post', () => {
  const out = runMonitorNode([postRow(), runwayRow()]);

  assert.equal(out.length, 1);
  const listLines = out[0].json.text
    .split('\n')
    .filter((l) => l.startsWith('- ') || l.startsWith('[🔄 auto-reset] '));
  assert.equal(listLines.length, 1, 'solo el post real se lista, no el runway');
});

test('reporta los auto-reset del monitor junto al runway sano', () => {
  const out = runMonitorNode([
    postRow({ monitor_action: 'auto-reset', retry_count: 1 }),
    runwayRow(),
  ]);

  assert.equal(out.length, 1);
  assert.match(out[0].json.text, /auto-reset/);
  assert.match(out[0].json.text, /retry:1/);
});
