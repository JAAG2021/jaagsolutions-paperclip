// Code node: "Componer imagen final"
// Input: salida de Ideogram con data[0].url + datos del post (vía $('Calcular aspect_ratio'))
// Output: { ...post, image_url: filePath, image_base64 }
//
// Hace:
//   1. Descarga la imagen base de Ideogram (escena visual sin texto)
//   2. Compone overlay SVG con:
//        - Logo + tagline JAAGSOLUTIONS (top)
//        - Caja semitransparente inferior para legibilidad
//        - copy_text en español (text wrapping manual)
//        - Hashtags compactos (si caben)
//        - Plataforma + fecha (esquina)
//   3. Guarda JPG final en /opt/jaagsolutions/content/<id>.jpg
//
// Requiere en docker-compose.yml:
//   N8N_FUNCTION_ALLOW_EXTERNAL: "sharp"
//   o equivalente: NODE_FUNCTION_ALLOW_EXTERNAL: "sharp"

const sharp = require('sharp');
const fs = require('fs');

const ideogramResp = $input.first().json;
const prev = $('Calcular aspect_ratio').first().json;

const imageUrl = ideogramResp.data?.[0]?.url;
if (!imageUrl) {
  throw new Error('Ideogram no devolvió imagen: ' + JSON.stringify(ideogramResp).slice(0, 500));
}

// Dimensiones por aspect ratio Ideogram
const DIMS = {
  ASPECT_1_1:  { w: 1080, h: 1080 },
  ASPECT_4_5:  { w: 1080, h: 1350 },
  ASPECT_9_16: { w: 1080, h: 1920 },
};
const dims = DIMS[prev.aspect_ratio] || DIMS.ASPECT_1_1;

// Paleta JAAGSOLUTIONS
const COLORS = {
  brandDeep:   '#0D1B2A',  // azul corporativo profundo
  brandMid:    '#1B3A6B',  // azul medio
  brandLight:  '#E8F0FA',  // off-white frío
  accent:      '#F5B800',  // dorado para destacar
  white:       '#FFFFFF',
};

// ─── Helpers ──────────────────────────────────────────────────────────
function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Wrap simple por número de caracteres por línea (estimado)
// fontSize 44px ≈ ~24 chars/línea a 1080px width con padding
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

// Limita hashtags a los primeros N para que quepan
function shortenHashtags(hashtags, max = 4) {
  if (!hashtags) return '';
  const tags = String(hashtags).split(/\s+/).filter(t => t.startsWith('#')).slice(0, max);
  return tags.join(' ');
}

// Formatear fecha en español
function formatDate(scheduledDate) {
  if (!scheduledDate) return '';
  try {
    const d = new Date(scheduledDate);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch (e) {
    return '';
  }
}

// ─── Layout dinámico según aspect ratio ───────────────────────────────
const PADDING = 60;
const LOGO_HEIGHT = 100;

// Caja de texto inferior: 38% de la altura
const TEXT_BOX_HEIGHT = Math.round(dims.h * 0.38);
const TEXT_BOX_Y = dims.h - TEXT_BOX_HEIGHT;

// Tamaños de fuente según altura
const COPY_FONT_SIZE = dims.h >= 1500 ? 52 : (dims.h >= 1200 ? 46 : 42);
const COPY_LINE_HEIGHT = Math.round(COPY_FONT_SIZE * 1.25);
const HASHTAG_FONT_SIZE = Math.round(COPY_FONT_SIZE * 0.55);
const META_FONT_SIZE = 22;

// Wrap copy text
const MAX_CHARS_PER_LINE = dims.h >= 1500 ? 28 : 26;
const copyLines = wrapText(prev.copy_text, MAX_CHARS_PER_LINE);
// Truncar si excede el espacio
const MAX_LINES = Math.floor((TEXT_BOX_HEIGHT - 200) / COPY_LINE_HEIGHT);
const visibleLines = copyLines.slice(0, MAX_LINES);
if (copyLines.length > MAX_LINES) {
  // Añadir elipsis al final de la última línea visible
  visibleLines[visibleLines.length - 1] = visibleLines[visibleLines.length - 1].replace(/[.,;:!?]+$/, '') + '…';
}

const hashtagsLine = shortenHashtags(prev.hashtags, 4);
const fechaStr = formatDate(prev.scheduled_date);
const plataforma = String(prev.platform || '').toUpperCase();

// ─── Construir SVG overlay ────────────────────────────────────────────
// Posición Y inicial del bloque de texto: centrado vertical dentro de la caja
const textBlockHeight = visibleLines.length * COPY_LINE_HEIGHT + (hashtagsLine ? HASHTAG_FONT_SIZE + 20 : 0);
const textStartY = TEXT_BOX_Y + Math.round((TEXT_BOX_HEIGHT - textBlockHeight) / 2) + COPY_FONT_SIZE;

const copyTspans = visibleLines.map((line, i) =>
  `<tspan x="${PADDING}" dy="${i === 0 ? 0 : COPY_LINE_HEIGHT}">${escapeXml(line)}</tspan>`
).join('');

const hashtagsY = textStartY + visibleLines.length * COPY_LINE_HEIGHT + 10;
const hashtagsTspan = hashtagsLine
  ? `<text x="${PADDING}" y="${hashtagsY}" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="${HASHTAG_FONT_SIZE}" font-weight="500" fill="${COLORS.accent}" opacity="0.95">${escapeXml(hashtagsLine)}</text>`
  : '';

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

  <!-- Fade superior para legibilidad del logo -->
  <rect x="0" y="0" width="${dims.w}" height="${LOGO_HEIGHT + 40}" fill="url(#topFade)"/>

  <!-- Logo + tagline (top-left) -->
  <text x="${PADDING}" y="60" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="34" font-weight="800" fill="${COLORS.white}" letter-spacing="1.5">JAAG<tspan fill="${COLORS.accent}">·</tspan>SOLUTIONS</text>
  <text x="${PADDING}" y="92" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="18" font-weight="400" fill="${COLORS.brandLight}" opacity="0.9">Automatización inteligente para pymes</text>

  <!-- Plataforma + fecha (top-right) -->
  <text x="${dims.w - PADDING}" y="60" text-anchor="end" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="${META_FONT_SIZE}" font-weight="600" fill="${COLORS.accent}" letter-spacing="2">${escapeXml(plataforma)}</text>
  <text x="${dims.w - PADDING}" y="88" text-anchor="end" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="${META_FONT_SIZE - 4}" font-weight="400" fill="${COLORS.brandLight}" opacity="0.85">${escapeXml(fechaStr)}</text>

  <!-- Fade inferior degradado azul para el copy -->
  <rect x="0" y="${TEXT_BOX_Y}" width="${dims.w}" height="${TEXT_BOX_HEIGHT}" fill="url(#bottomFade)"/>

  <!-- Barra de acento dorada -->
  <rect x="${PADDING}" y="${textStartY - COPY_FONT_SIZE - 25}" width="80" height="6" fill="${COLORS.accent}" rx="3"/>

  <!-- Copy principal -->
  <text x="${PADDING}" y="${textStartY}" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="${COPY_FONT_SIZE}" font-weight="700" fill="${COLORS.white}" xml:space="preserve">${copyTspans}</text>

  ${hashtagsTspan}

  <!-- CTA mini bottom-right -->
  <text x="${dims.w - PADDING}" y="${dims.h - PADDING}" text-anchor="end" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="20" font-weight="500" fill="${COLORS.brandLight}" opacity="0.9">jaagsolutions.com</text>
</svg>`;

// ─── Descargar imagen base ────────────────────────────────────────────
let baseBuffer;
try {
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error(`Ideogram URL HTTP ${resp.status}`);
  baseBuffer = Buffer.from(await resp.arrayBuffer());
} catch (e) {
  throw new Error('No se pudo descargar imagen Ideogram: ' + e.message);
}

// ─── Composit con Sharp ───────────────────────────────────────────────
const contentDir = '/opt/jaagsolutions/content';
if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
const filePath = `${contentDir}/${prev.id}.jpg`;

let composedBuffer;
try {
  composedBuffer = await sharp(baseBuffer)
    .resize(dims.w, dims.h, { fit: 'cover', position: 'centre' })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 92, progressive: true })
    .toBuffer();
} catch (e) {
  throw new Error('Error en composición Sharp/SVG: ' + e.message + ' | SVG len: ' + svg.length);
}

fs.writeFileSync(filePath, composedBuffer);

return [{
  json: {
    ...prev,
    image_url: filePath,
    image_base64: composedBuffer.toString('base64'),
    composition_meta: {
      dims,
      copy_lines: visibleLines.length,
      truncated: copyLines.length > MAX_LINES,
      file_size_kb: Math.round(composedBuffer.length / 1024),
    },
  },
}];
