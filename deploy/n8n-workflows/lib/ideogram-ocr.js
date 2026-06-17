// FUENTE CANÓNICA del nodo "Ideogram + OCR - fallback seguro" (id: code-ideogram-ocr)
// del workflow content-generator.json.
//
// Editar AQUÍ y luego inyectar al JSON con: python lib/sync-node-code.py
//
// Diseño (2026-06-17):
//   - Genera SOLO una escena humana/editorial vía Ideogram (sin texto).
//   - El "diagram mode" (overlay de nodos con hub 'n8n' + íconos de apps) fue
//     ELIMINADO de raíz: ya no se calcula diagram_type, y el compose ya no dibuja
//     diagramas. El texto de la pieza lo pone el overlay SVG del compose.
//   - Se conserva la red de seguridad: OCR (Google Vision) + anatomy QA (OpenAI),
//     con reintentos de seed nuevo. Como el concepto ya no invita texto, converge.
const https = require('https');
const prev = $input.first().json;
const MAX_ATTEMPTS = parseInt($env.IDEOGRAM_MAX_ATTEMPTS || '3', 10);
const HAS_PEOPLE = prev.has_people !== false;

function httpsPost(hostname, path, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), ...extraHeaders },
      timeout: 30000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON invalido: ' + data.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(bodyStr);
    req.end();
  });
}

// Fallback seguro: SIEMPRE escena humana/editorial (nunca redes de nodos ni teal abstracto).
// Reserva un lower-third calmo para el overlay de texto. Sin texto en la imagen.
function safeFallbackPrompt(item) {
  const humanScenes = [
    'Waist-up editorial portrait of a confident solo Latin American professional in their 30s at a modern standing desk in a bright minimal open-plan office, soft natural window light, calm and aspirational, premium real-photo style, plenty of clean space in the lower third for a text overlay, no text anywhere',
    'Group of three young Latin American professionals collaborating in a sleek modern office, seen slightly from the side, engaged and positive, warm soft ambient light, premium editorial photography, calm empty lower third for overlay, no readable text, no screens with text',
    'A young Latina entrepreneur working alone at a sunlit co-working space, side view at a standing desk, large windows with soft blurred city behind, confident relaxed posture, warm golden-hour light, premium editorial photography, calm lower third, no text anywhere',
    'A Latino business owner in his 40s standing thoughtfully in a bright modern office, looking toward soft daylight from tall windows, serene and self-assured, deep navy and warm neutral tones, premium editorial photography, calm lower third reserved for text, no text',
    'Group of four diverse Latin American professionals in a modern training room, seen from a slightly elevated angle, one gesturing toward a soft-lit blank wall, natural light, collaborative mood, premium cinematic, calm lower third for overlay, no readable text on any surface',
  ];
  const scene = humanScenes[Math.floor(Math.random() * humanScenes.length)];
  return scene + '. Brand: JAAGSOLUTIONS — B2B automation agency for Latin American SMEs. Subjects are plausibly Latin American. CRITICAL: absolutely no text, no letters, no numbers, no words, no watermarks, no logos, no UI, no readable screens anywhere in the image.';
}

function httpsPostMultipart(hostname, path, fields, extraHeaders) {
  return new Promise((resolve, reject) => {
    const boundary = '----v3b' + Math.random().toString(16).slice(2);
    let body = '';
    for (const k in fields) {
      body += '--' + boundary + '\r\nContent-Disposition: form-data; name="' + k + '"\r\n\r\n' + fields[k] + '\r\n';
    }
    body += '--' + boundary + '--\r\n';
    const buf = Buffer.from(body, 'utf8');
    const options = {
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary, 'Content-Length': buf.length, ...extraHeaders },
      timeout: 90000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON invalido (V3): ' + data.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(buf);
    req.end();
  });
}

async function generateIdeogram(prompt, aspectRatio, safeMode) {
  const seed = Math.floor(Math.random() * 2147483647);
  const styleTypes = safeMode ? ['GENERAL', 'GENERAL', 'REALISTIC'] : ['REALISTIC', 'REALISTIC', 'GENERAL', 'GENERAL'];
  const styleType = styleTypes[Math.floor(Math.random() * styleTypes.length)];
  const arMap = { ASPECT_3_4: '3x4', ASPECT_9_16: '9x16', ASPECT_1_1: '1x1', ASPECT_4_5: '4x5', ASPECT_16_9: '16x9', ASPECT_4_3: '4x3' };
  const v3Aspect = arMap[aspectRatio] || '3x4';
  return httpsPostMultipart('api.ideogram.ai', '/v1/ideogram-v3/generate', {
    prompt,
    aspect_ratio: v3Aspect,
    rendering_speed: 'TURBO',
    magic_prompt: 'OFF',
    seed: String(seed),
    style_type: styleType,
    // Solo se prohíbe TEXTO legible + anatomía/romántico/glamour. Los PROPS
    // (papel, pizarra, diagramas dibujados a mano con formas) están PERMITIDOS:
    // ilustran el mensaje y el guard de OCR cubre el texto accidental.
    negative_prompt: 'readable text, letters, numbers, words, typography, watermark, logo, caption, readable label, readable sign, readable signage, signature, written language, glyphs, brand names, store signs, product labels, background text, environmental signage, fake brand text, decorative lettering, labelled chart, axis labels, readable screen, readable dashboard, deformed hands, mutated hands, extra fingers, missing fingers, fused fingers, malformed fingers, too many fingers, distorted hands, mangled hands, twisted fingers, poorly drawn hands, low quality hands, bad anatomy, extra limbs, malformed limbs, disfigured, plastic skin, uncanny valley, doll-like, cgi face, artificial skin, deformed face, distorted proportions, wax figure, overly smooth skin, lifeless eyes, romantic, couple, lovers, intimate pose, seductive, flirtatious, romantic gaze, two people facing each other romantically, date scene, kissing, embracing, romance, amorous, lovingly gazing, two people alone, pair of people, two person scene, extreme close up hands, pen in hand foreground, finger pointing close up, glamour portrait, beauty shot, fashion photography, model headshot, posing for camera, glamour lighting, magazine cover, fashion model, beauty portrait, attractive model posing, vogue style, studio beauty portrait'
  }, { 'Api-Key': $env.IDEOGRAM_API_KEY });
}

async function checkOCR(imageUrl) {
  try {
    const resp = await httpsPost(
      'vision.googleapis.com',
      `/v1/images:annotate?key=${$env.GOOGLE_VISION_API_KEY}`,
      { requests: [{ image: { source: { imageUri: imageUrl } }, features: [{ type: 'TEXT_DETECTION', maxResults: 10 }] }] },
      {}
    );
    const annotations = resp.responses?.[0]?.textAnnotations || [];
    const description = annotations[0]?.description || '';
    return { hasText: description.length > 8, detectedText: description.slice(0, 200) };
  } catch (err) {
    console.log('[OCR] Vision API error - fail open: ' + err.message);
    return { hasText: false, detectedText: '' };
  }
}

async function checkAnatomy(imageUrl) {
  if (!$env.OPENAI_API_KEY) return { bad: false, reason: 'no-key' };
  try {
    const resp = await httpsPost('api.openai.com', '/v1/chat/completions', {
      model: 'gpt-4o-mini', max_tokens: 80, temperature: 0,
      messages: [{ role: 'user', content: [
        { type: 'text', text: 'You are a strict QA reviewer for marketing photos. Inspect ONLY human anatomy. Reply with compact JSON {"bad":true,"reason":"..."} or {"bad":false,"reason":""}. Set bad=true ONLY if a visible human hand, finger, arm or face is clearly deformed: wrong number of fingers, fused, extra or missing fingers, twisted or malformed hands or limbs, or a distorted face. If there are no people, hands are not visible, or anatomy looks natural, set bad=false. Be conservative; only flag clear deformities.' },
        { type: 'image_url', image_url: { url: imageUrl } }
      ] }]
    }, { 'Authorization': 'Bearer ' + $env.OPENAI_API_KEY });
    const txt = resp.choices?.[0]?.message?.content || '';
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return { bad: false, reason: 'no-json' };
    const verdict = JSON.parse(m[0]);
    return { bad: verdict.bad === true, reason: String(verdict.reason || '').slice(0, 120) };
  } catch (err) {
    console.log('[Anatomy] Vision API error - fail open: ' + err.message);
    return { bad: false, reason: 'api-error' };
  }
}

let cleanImageUrl = null;
let lastError = '';
let usedSafeFallback = false;

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const safeMode = attempt === MAX_ATTEMPTS;
  // Intentos normales: prompt del Auditor (escena humana). Último intento: fallback humano seguro.
  const prompt = safeMode ? safeFallbackPrompt(prev) : prev.image_prompt;
  usedSafeFallback = usedSafeFallback || safeMode;
  const resp = await generateIdeogram(prompt, prev.aspect_ratio, safeMode);
  const url = resp.data?.[0]?.url;
  if (!url) throw new Error('Ideogram sin URL en intento ' + attempt + ': ' + JSON.stringify(resp).slice(0, 300));
  const ocr = await checkOCR(url);
  if (ocr.hasText) {
    lastError = 'Intento ' + attempt + (safeMode ? ' fallback seguro' : '') + ': texto detectado - "' + ocr.detectedText.replace(/"/g, "'").slice(0, 100) + '"';
    console.log('[OCR] ' + lastError);
    continue;
  }
  if (HAS_PEOPLE) {
    const anatomy = await checkAnatomy(url);
    if (anatomy.bad) {
      lastError = 'Intento ' + attempt + (safeMode ? ' fallback seguro' : '') + ': anatomia deforme - "' + anatomy.reason.replace(/"/g, "'") + '"';
      console.log('[Anatomy] ' + lastError);
      continue;
    }
  }
  cleanImageUrl = url;
  console.log('[QA] Intento ' + attempt + (safeMode ? ' fallback seguro' : '') + ': imagen limpia (texto + anatomia OK)');
  break;
}

if (cleanImageUrl) {
  return [{ json: { ...prev, data: [{ url: cleanImageUrl }], used_safe_fallback: usedSafeFallback, diagram_type: null } }];
}
return [{ json: { ...prev, ocr_error: true, used_safe_fallback: usedSafeFallback, diagram_type: null, ocr_error_log: 'QA ' + MAX_ATTEMPTS + ' intentos fallidos (texto/anatomia). Ultimo: ' + lastError } }];
