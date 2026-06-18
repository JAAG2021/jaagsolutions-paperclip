#!/usr/bin/env node
// Standalone compose-image — corre FUERA del sandbox de n8n (via Execute Command node)
// Uso: node /opt/n8n-scripts/compose-image.js <ruta-al-input.json>
// Input JSON: { image_url, post_id, copy_text, hashtags, platform, scheduled_date, aspect_ratio, output_dir }
// Output stdout: JSON { image_url, image_base64, composition_meta }
'use strict';

const sharp = require('sharp');
const fs = require('fs');
const https = require('https');
const http = require('http');

const inputFile = process.argv[2];
if (!inputFile) {
  process.stderr.write('ERROR: Usage: node compose-image.js <input-json-file>\n');
  process.exit(1);
}

let input;
try {
  input = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
} catch (e) {
  process.stderr.write('ERROR leyendo input: ' + e.message + '\n');
  process.exit(1);
}

const {
  image_url,
  copy_text,
  hashtags,
  platform,
  scheduled_date,
  aspect_ratio,
  output_dir = '/opt/jaagsolutions/content',
} = input;
const post_id = input.post_id || input.id;

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} descargando imagen`));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Modo diagrama (overlay hub-and-spoke con iconos de apps) ELIMINADO 2026-06-17.
// Ver: docs/superpowers/specs/CONTENT_PIPELINE_SOURCE_OF_TRUTH.md
function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function shortenHashtags(ht, max = 4) {
  if (!ht) return '';
  return String(ht).split(/\s+/).filter(t => t.startsWith('#')).slice(0, max).join(' ');
}

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

// IMPORTANTE: las claves de DIMS deben coincidir con los aspect_ratio que produce
// el workflow (`Calcular aspect_ratio`). Ideogram NO soporta ASPECT_4_5; por eso
// el workflow envía ASPECT_3_4 (0.75) y aquí lo mapeamos a las dimensiones finales
// 1080×1350 (4:5). El sharp resize cover con position 'top' croppea desde abajo
// los ~90px sobrantes — esa franja es la zona calma reservada por el Auditor para
// el overlay, por lo que no se pierde sujeto.
const DIMS = {
  ASPECT_1_1:  { w: 1080, h: 1080 },
  ASPECT_3_4:  { w: 1080, h: 1350 },  // Ideogram 3:4 → 4:5 final cropping bottom
  ASPECT_4_5:  { w: 1080, h: 1350 },  // alias backward-compat (uso manual/test)
  ASPECT_9_16: { w: 1080, h: 1920 },
};
const dims = DIMS[aspect_ratio] || DIMS.ASPECT_3_4;

const COLORS = {
  brandDeep:  '#0D1B2A',
  brandLight: '#E8F0FA',
  accent:     '#F5B800',
  white:      '#FFFFFF',
};

const PADDING = 60;
const LOGO_HEIGHT = 100;
const TEXT_BOX_HEIGHT = Math.round(dims.h * 0.38);
const TEXT_BOX_Y = dims.h - TEXT_BOX_HEIGHT;
const COPY_FONT_SIZE = dims.h >= 1500 ? 52 : (dims.h >= 1200 ? 46 : 42);
const COPY_LINE_HEIGHT = Math.round(COPY_FONT_SIZE * 1.25);
const HASHTAG_FONT_SIZE = Math.round(COPY_FONT_SIZE * 0.55);
const META_FONT_SIZE = 22;
const MAX_CHARS_PER_LINE = dims.h >= 1500 ? 28 : 26;

// Imagen solo muestra el headline (primer bloque antes del doble salto de línea).
// El cuerpo + CTA + hashtags van únicamente en el caption de la publicación.
// Strip defensivo de hashtags: cubre data vieja con hashtags embebidos en copy_text.
const headline = String(copy_text || '').split(/\n\n/)[0].replace(/#\S+/g, '').replace(/\s*[—–]\s*/g, ', ').replace(/\s+/g, ' ').trim();
const copyLines = wrapText(headline, MAX_CHARS_PER_LINE);
const MAX_LINES = Math.floor((TEXT_BOX_HEIGHT - 200) / COPY_LINE_HEIGHT);
const visibleLines = copyLines.slice(0, MAX_LINES);
if (copyLines.length > MAX_LINES) {
  visibleLines[visibleLines.length - 1] =
    visibleLines[visibleLines.length - 1].replace(/[.,;:!?]+$/, '') + '…';
}

const fechaStr = formatDate(scheduled_date);
const plataforma = String(platform || '').toUpperCase();

const textBlockHeight = visibleLines.length * COPY_LINE_HEIGHT;
const textStartY =
  TEXT_BOX_Y + Math.round((TEXT_BOX_HEIGHT - textBlockHeight) / 2) + COPY_FONT_SIZE;

const copyTspans = visibleLines
  .map((line, i) => `<tspan x="${PADDING}" dy="${i === 0 ? 0 : COPY_LINE_HEIGHT}">${escapeXml(line)}</tspan>`)
  .join('');

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
  <rect x="0" y="${TEXT_BOX_Y}" width="${dims.w}" height="${TEXT_BOX_HEIGHT}" fill="url(#bottomFade)"/>
  <rect x="${PADDING}" y="${textStartY - COPY_FONT_SIZE - 25}" width="80" height="6" fill="${COLORS.accent}" rx="3"/>
  <text x="${PADDING}" y="${textStartY}" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="${COPY_FONT_SIZE}" font-weight="700" fill="${COLORS.white}" xml:space="preserve">${copyTspans}</text>
  <text x="${dims.w - PADDING}" y="${dims.h - PADDING}" text-anchor="end" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="20" font-weight="500" fill="${COLORS.brandLight}" opacity="0.9">jaagsolutions.com</text>
</svg>`;

async function main() {
  const baseBuffer = await downloadBuffer(image_url);

  if (!fs.existsSync(output_dir)) fs.mkdirSync(output_dir, { recursive: true });
  const filePath = `${output_dir}/${post_id}.jpg`;

  // Overlay = solo logo + headline + barra dorada + url. Sin diagrama de nodos.
  const composedBuffer = await sharp(baseBuffer)
    // position 'top': cuando hay que cropear vertical (3:4 → 4:5), recorta desde
    // el bottom (zona calma reservada por el Auditor), preservando el sujeto
    // que el prompt posiciona en el top 62%.
    .resize(dims.w, dims.h, { fit: 'cover', position: 'top' })
    .composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
    ])
    .jpeg({ quality: 92, progressive: true })
    .toBuffer();

  fs.writeFileSync(filePath, composedBuffer);

  // URL pública para Meta/LinkedIn (necesitan descargar la imagen)
  const publicUrlBase = process.env.CONTENT_PUBLIC_URL || 'https://content.jaagsolutions.com';
  const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${post_id}.jpg`;

  process.stdout.write(JSON.stringify({
    image_url: publicUrl,
    image_path: filePath,
    image_base64: composedBuffer.toString('base64'),
    composition_meta: {
      dims,
      copy_lines: visibleLines.length,
      truncated: copyLines.length > MAX_LINES,
      file_size_kb: Math.round(composedBuffer.length / 1024),
    },
  }) + '\n');
}

main().catch(e => {
  process.stderr.write('ERROR: ' + e.message + '\n' + (e.stack || '') + '\n');
  process.exit(1);
});
