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
  diagram_type,
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

// ── Programmatic gradient background (replaces Ideogram for diagram mode) ──
async function createGradientBackground(diagramType, dims) {
  const ACCENT = {
    social_media: '#7B1FA2',  // purple-magenta (social)
    automation:   '#BF360C',  // deep orange (n8n brand)
    results:      '#E65100',  // amber-gold (growth)
    efficiency:   '#00695C',  // teal (clarity)
    data:         '#0D47A1',  // deep blue (data)
    team:         '#4E342E',  // warm brown (people)
  };
  const accent = ACCENT[diagramType] || '#1A2744';
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dims.w}" height="${dims.h}">
    <defs>
      <radialGradient id="g1" cx="50%" cy="38%" r="65%">
        <stop offset="0%"   stop-color="${accent}"  stop-opacity="0.55"/>
        <stop offset="55%"  stop-color="#0A1628"    stop-opacity="0.80"/>
        <stop offset="100%" stop-color="#050C18"    stop-opacity="1.00"/>
      </radialGradient>
      <radialGradient id="g2" cx="15%" cy="80%" r="45%">
        <stop offset="0%"   stop-color="${accent}"  stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#050C18"    stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${dims.w}" height="${dims.h}" fill="#060D1B"/>
    <rect width="${dims.w}" height="${dims.h}" fill="url(#g1)"/>
    <rect width="${dims.w}" height="${dims.h}" fill="url(#g2)"/>
  </svg>`;
  return sharp(Buffer.from(bgSvg)).png().toBuffer();
}

// ── Node Diagram SVG ──────────────────────────────────────────────────
function buildDiagramSVG(diagramType, dims) {
  const CONFIGS = {
    social_media: {
      center: { lines: ['TU', 'EMPRESA'], fill: '#0D1B2A', stroke: '#F5B800', textColor: '#F5B800' },
      nodes: [
        { lines: ['IG'],   fill: '#E1306C', angle: -90 },
        { lines: ['LI'],   fill: '#0A66C2', angle: -18 },
        { lines: ['FB'],   fill: '#1877F2', angle:  54 },
        { lines: ['WA'],   fill: '#25D366', angle: 126 },
        { lines: ['TK'],   fill: '#444444', angle: 198 },
      ],
    },
    automation: {
      center: { lines: ['n8n'], fill: '#FF6D5A', stroke: '#FFFFFF', textColor: '#FFFFFF' },
      nodes: [
        { lines: ['MAIL'], fill: '#4285F4', angle: -90 },
        { lines: ['WA'],   fill: '#25D366', angle: -18 },
        { lines: ['CRM'],  fill: '#FF7043', angle:  54 },
        { lines: ['GS'],   fill: '#34A853', angle: 126 },
        { lines: ['CAL'],  fill: '#1A73E8', angle: 198 },
      ],
    },
    results: {
      center: { lines: ['META'], fill: '#0D1B2A', stroke: '#F5B800', textColor: '#F5B800' },
      nodes: [
        { lines: ['Leads'],  fill: '#F5B800', angle: -90 },
        { lines: ['Ventas'], fill: '#4CAF50', angle:   0 },
        { lines: ['Clnts'],  fill: '#2196F3', angle:  90 },
        { lines: ['ROI'],    fill: '#E91E63', angle: 180 },
      ],
    },
    efficiency: {
      center: { lines: ['PROC'], fill: '#00796B', stroke: '#80CBC4', textColor: '#FFFFFF' },
      nodes: [
        { lines: ['Tiempo'],  fill: '#00BCD4', angle: -90 },
        { lines: ['Errores'], fill: '#66BB6A', angle:   0 },
        { lines: ['Costos'],  fill: '#FFA726', angle:  90 },
        { lines: ['Output'],  fill: '#AB47BC', angle: 180 },
      ],
    },
    data: {
      center: { lines: ['DATA'], fill: '#1565C0', stroke: '#82B1FF', textColor: '#FFFFFF' },
      nodes: [
        { lines: ['Ventas'], fill: '#0288D1', angle: -90 },
        { lines: ['Web'],    fill: '#E65100', angle: -18 },
        { lines: ['Redes'],  fill: '#AD1457', angle:  54 },
        { lines: ['Email'],  fill: '#2E7D32', angle: 126 },
        { lines: ['CRM'],    fill: '#6A1B9A', angle: 198 },
      ],
    },
    team: {
      center: { lines: ['EQUIPO'], fill: '#0D1B2A', stroke: '#F5B800', textColor: '#F5B800' },
      nodes: [
        { lines: ['CEO'],   fill: '#1565C0', angle:  -90 },
        { lines: ['Vntas'], fill: '#2E7D32', angle:  -30 },
        { lines: ['Ops'],   fill: '#E65100', angle:   30 },
        { lines: ['Mktg'],  fill: '#AD1457', angle:   90 },
        { lines: ['Tech'],  fill: '#00796B', angle:  150 },
        { lines: ['Sup.'],  fill: '#6A1B9A', angle: -150 },
      ],
    },
  };

  const cfg = CONFIGS[diagramType];
  if (!cfg) return null;

  const cx      = Math.round(dims.w / 2);
  const cy      = Math.round(dims.h * 0.36);
  const spokeR  = Math.round(dims.w * 0.235);
  const hubR    = Math.round(dims.w * 0.038);
  const nodeR   = Math.round(dims.w * 0.025);
  const baseFs  = Math.round(dims.w * 0.028);
  const lineW   = Math.max(2, Math.round(dims.w * 0.002));
  const toRad   = d => d * Math.PI / 180;

  // SVG icon fragments — designed in ±7 unit space, centered at origin
  // Render with: <g transform="translate(x,y) scale(nodeR/14)">ICON</g>
  const SVGICONS = {
    IG: `<rect x="-7" y="-5.5" width="14" height="11" rx="3" fill="none" stroke="white" stroke-width="1.4"/>
         <circle cy="0.3" r="3.5" fill="none" stroke="white" stroke-width="1.4"/>
         <circle cx="5" cy="-4" r="1.4" fill="white"/>`,
    LI: `<circle cx="-4.5" cy="-5.5" r="2" fill="white"/>
         <rect x="-6" y="-2.5" width="3" height="9.5" fill="white"/>
         <path d="M-2,-2.5 L0.5,-2.5 L0.5,-1 C1,-2 2.5,-3 4,-3 C6,-3 7,-1.5 7,1.5 L7,7 L4.5,7 L4.5,2 C4.5,0.5 4,-1 3,-1 C2,-1 2,0.5 2,2 L2,7 L-0.5,7 L-0.5,-2.5 Z" fill="white"/>`,
    FB: `<path d="M1.5,-7 C3.5,-7 5,-6 5,-4 L2.5,-4 C2.5,-5 2,-5.5 1.5,-5.5 C1,-5.5 0.5,-5 0.5,-4 L0.5,-2.5 L4.5,-2.5 L4,0 L0.5,0 L0.5,7 L-2,7 L-2,0 L-4,0 L-4,-2.5 L-2,-2.5 L-2,-4 C-2,-6.5 -0.5,-7 1.5,-7 Z" fill="white"/>`,
    WA: `<path d="M0,-7 C-4,-7 -7,-4 -7,0 C-7,2.5 -5.5,4.5 -3,5.5 L-3.5,8 L-0.5,6.5 C-0.2,6.5 0,7 0,7 C4,7 7,4 7,0 C7,-4 4,-7 0,-7 Z" fill="none" stroke="white" stroke-width="1.4"/>
          <circle r="2" fill="white"/>`,
    TK: `<path d="M2,-7 C5,-6.5 7,-4 7,-1 L4.5,-1 C4.5,-3 3,-4.5 2,-5 L2,3 C2,5 0.5,7 -1.5,7 C-3.5,7 -5,5.5 -5,3.5 C-5,1.5 -3.5,0 -1.5,0 C-1,0 -0.5,0.1 0,0.3 L0,-2 C-0.5,-2.1 -1,-2 -1.5,-2 C-4.5,-2 -7,0.5 -7,3.5 C-7,6.5 -4.5,9 -1.5,9 C1.5,9 4,6.5 4,3.5 L4,-7 Z" fill="white"/>`,
    MAIL: `<rect x="-7" y="-5" width="14" height="10" rx="2" fill="none" stroke="white" stroke-width="1.4"/>
           <path d="M-7,-5 L0,2 L7,-5" fill="none" stroke="white" stroke-width="1.4"/>`,
    GS: `<rect x="-6" y="-6" width="12" height="12" rx="2" fill="none" stroke="white" stroke-width="1.2"/>
         <line x1="-6" y1="-2" x2="6" y2="-2" stroke="white" stroke-width="1"/>
         <line x1="-6" y1="2" x2="6" y2="2" stroke="white" stroke-width="1"/>
         <line x1="-2" y1="-6" x2="-2" y2="6" stroke="white" stroke-width="1"/>
         <line x1="2" y1="-6" x2="2" y2="6" stroke="white" stroke-width="1"/>`,
    CAL: `<rect x="-7" y="-5" width="14" height="12" rx="2" fill="none" stroke="white" stroke-width="1.3"/>
          <line x1="-7" y1="-1" x2="7" y2="-1" stroke="white" stroke-width="1"/>
          <line x1="-3.5" y1="-7" x2="-3.5" y2="-3" stroke="white" stroke-width="1.5"/>
          <line x1="3.5" y1="-7" x2="3.5" y2="-3" stroke="white" stroke-width="1.5"/>`,
    CRM: `<circle cy="-3.5" r="3.5" fill="none" stroke="white" stroke-width="1.4"/>
          <path d="M-7,7 C-7,2 7,2 7,7" fill="none" stroke="white" stroke-width="1.4"/>`,
    WA2: `<text y="3" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" font-weight="800" fill="white">WA</text>`,
  };

  const nodePos = cfg.nodes.map(n => ({
    ...n,
    x: Math.round(cx + spokeR * Math.cos(toRad(n.angle))),
    y: Math.round(cy + spokeR * Math.sin(toRad(n.angle))),
  }));

  const s = [];
  s.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${dims.w}" height="${dims.h}" viewBox="0 0 ${dims.w} ${dims.h}">`);
  s.push(`<defs>
    <radialGradient id="dvig" cx="${cx}" cy="${Math.round(dims.h * 0.36)}" r="${Math.round(dims.w * 0.52)}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#000000" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>`);
  s.push(`<rect width="${dims.w}" height="${dims.h}" fill="url(#dvig)"/>`);

  // Connection lines
  for (const { x, y } of nodePos) {
    s.push(`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#F0A030" stroke-width="1.5" stroke-opacity="0.60" stroke-dasharray="${lineW * 5} ${lineW * 2}"/>`);
  }

  // Hub circle — semi-transparent dark with amber border
  s.push(`<circle cx="${cx}" cy="${cy}" r="${hubR}" fill="rgba(8,12,30,0.72)" stroke="#F0A030" stroke-width="2"/>`);
  // Hub label
  const hfs = Math.round(Math.min(baseFs * 0.80, hubR * 0.40));
  const hlh = Math.round(hfs * 1.25);
  const hly = cy - ((cfg.center.lines.length - 1) * hlh / 2) + Math.round(hfs * 0.38);
  cfg.center.lines.forEach((line, i) => {
    s.push(`<text x="${cx}" y="${hly + i * hlh}" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="${hfs}" font-weight="800" fill="${cfg.center.textColor}">${escapeXml(line)}</text>`);
  });

  // Peripheral nodes
  const iconScale = (nodeR / 7).toFixed(3);
  for (const { lines, fill, x, y } of nodePos) {
    s.push(`<circle cx="${x}" cy="${y}" r="${nodeR}" fill="rgba(8,12,30,0.58)" stroke="#F0A030" stroke-width="1.5" stroke-opacity="0.80"/>`);
    const iconKey = lines[0];
    if (SVGICONS[iconKey]) {
      s.push(`<g transform="translate(${x},${y}) scale(${iconScale})">${SVGICONS[iconKey]}</g>`);
    } else {
      const nfs = Math.round(baseFs * 0.72);
      const nlh = Math.round(nfs * 1.25);
      const nly = y - ((lines.length - 1) * nlh / 2) + Math.round(nfs * 0.38);
      lines.forEach((line, i) => {
        s.push(`<text x="${x}" y="${nly + i * nlh}" text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif" font-size="${nfs}" font-weight="700" fill="white">${escapeXml(line)}</text>`);
      });
    }
  }

  s.push('</svg>');
  return Buffer.from(s.join(''));
}

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
const headline = String(copy_text || '').split(/\n\n/)[0].replace(/#\S+/g, '').replace(/\s+/g, ' ').trim();
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

  const diagramBuf = diagram_type ? buildDiagramSVG(diagram_type, dims) : null;

  const composedBuffer = await sharp(baseBuffer)
    // position 'top': cuando hay que cropear vertical (3:4 → 4:5), recorta desde
    // el bottom (zona calma reservada por el Auditor), preservando el sujeto
    // que el prompt posiciona en el top 62%.
    .resize(dims.w, dims.h, { fit: 'cover', position: 'top' })
    .composite([
      ...(diagramBuf ? [{ input: diagramBuf, top: 0, left: 0 }] : []),
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
