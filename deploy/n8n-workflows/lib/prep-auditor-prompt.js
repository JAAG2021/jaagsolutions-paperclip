const item = $input.first().json;
const pillar = (item.pillar || '').toLowerCase();

const variants = {
  educacion: [
    {p:true,  s:'Waist-up portrait of a confident solo Latina professional in her 30s at a modern standing desk, blurred colorful abstract dashboard glow behind her, bright minimal open-plan office, soft natural light, editorial real-photo style, hands not the focus.'},
    {p:true,  s:'Wide shot of a Latino consultant in his 40s presenting to a group of four attentive colleagues in a sleek boardroom, soft-lit blank display behind him, cinematic overhead lighting, cool slate tones, seen from the side.'},
    {p:true,  s:'A young Latina entrepreneur works alone at a sunlit cafe table, laptop open, warm golden-hour light through large windows behind her, candid and aspirational, framed from the chest up.'},
    {p:false, s:'Close detail of an elegant minimalist workspace, a sleek laptop, a ceramic cup and a small plant on a clean walnut desk, soft morning light, no people, no readable screens, calm premium mood.'},
    {p:true,  s:'A Latino executive in his 50s stands alone in a glass-walled corner office, city skyline through floor-to-ceiling windows at dusk, premium editorial photography, deep navy tones, silhouette-forward.'},
    {p:true,  s:'A Latina facilitator in her 30s leads a small workshop for three engaged colleagues in a bright modern training room, gesturing toward a soft-lit blank wall, natural light, group of four total, seen from the side, hands relaxed.'},
    {p:false, s:'Abstract knowledge concept, warm light rays passing through floating translucent geometric panels over a deep blue gradient, no people, cinematic depth, premium and clean.'},
    {p:true,  s:'A mature Latino business owner sits alone at a polished wood desk under a warm lamp, softly blurred bookshelves behind, evening atmosphere, intimate and accomplished, framed from the chest up, hands relaxed.'}
  ],
  social_proof: [
    {p:true,  s:'A confident solo Latina business owner in her 40s stands in her thriving modern studio or shop, relaxed posture, warm satisfied expression, soft daylight, shallow depth of field, framed from the chest up, aspirational.'},
    {p:true,  s:'Wide boardroom shot, five Latino professionals sit around a long table all turned toward a large soft-lit display showing abstract colored shapes on the back wall, people small in the frame, room and screen dominate, cool overhead lighting.'},
    {p:true,  s:'A solo Latino entrepreneur in his 30s stands proudly in front of his small modern warehouse or workshop at golden hour, the business in operation softly blurred behind him, warm tones, editorial, framed from the chest up.'},
    {p:true,  s:'Overhead bird-eye shot of a round meeting table with abstract colored flow shapes laid flat as the centerpiece, four Latino professionals around it all looking down at it, none facing each other, the table is the hero.'},
    {p:false, s:'Symbolic growth scene, a sleek upward-curving abstract sculpture of light and soft color over a clean dark surface, no people, premium and dynamic, cinematic.'},
    {p:false, s:'Abstract social proof concept, a clean dark wall covered with a softly glowing organic network of warm circular nodes connected by thin curved lines, no people, elegant and expansive, premium cinematic mood.'},
    {p:true,  s:'A satisfied mature Latino client sits relaxed in a bright modern office lounge, calm confident expression, large window with soft city bokeh behind, solo, framed from the chest up, warm accent light.'},
    {p:true,  s:'Wide modern workspace, a team of four Latino professionals gathered in a semicircle around a central glowing display table showing abstract automation flows, all looking toward it, overhead angle, process visualization centered.'}
  ],
  produccion: [
    {p:false, s:'Overhead view of a clean frosted-glass table with smooth colored process lines and small plain geometric markers, no people, no screens, no labels, calm premium workspace, soft daylight.'},
    {p:true,  s:'A solo Latino operations specialist in his 30s studies a minimalist process layout of colored cords on a large bright table, viewed from the side, hands relaxed at his sides, soft daylight, plain surfaces, no documents.'},
    {p:false, s:'Abstract automation scene, smooth blue and teal light trails flowing through simple geometric nodes over a clean dark surface, no interface panels, no charts, no numbers, no typography.'},
    {p:true,  s:'Wide modern workshop, three Latino professionals stand a step back from a transparent acrylic board showing abstract colored workflow lines as pure shapes, viewed from a medium distance, hands at sides, no symbols or labels.'},
    {p:false, s:'Close detail of elegant abstract machinery of light, softly glowing interlocking rings and curved rails in cool blue and warm amber, no people, premium tech mood, shallow depth of field.'},
    {p:true,  s:'A solo Latina engineer in her 30s in a cool blue-lit modern lab reviews a glowing abstract holographic process map, calm focused expression, framed from the chest up, no readable text.'},
    {p:true,  s:'Minimal process workshop, a large empty bright table with colored cords forming a clean route, three blurred professionals in the background, calm lower area for overlay, no readable details.'},
    {p:false, s:'Top-down flat-lay of a clean designer desk with abstract colored geometric tokens arranged along a curved path on a matte surface, no devices, no text, soft even light.'}
  ],
  promesa: [
    {p:true,  s:'A confident solo Latina entrepreneur in her 30s stands on a rooftop terrace at golden hour, arms slightly open, Latin American city skyline behind her, cinematic warm light.'},
    {p:true,  s:'A solo Latino business owner in his 40s stands at a floor-to-ceiling window at dawn looking out over the city, silhouette-forward, hopeful expansive mood.'},
    {p:true,  s:'A mid-40s Latino man in a well-fitted suit walks purposefully alone through a modern glass atrium, motion-blurred background, sharp subject, strong architectural lines.'},
    {p:false, s:'Wide aerial dawn shot of a modern Latin American city skyline, one warmly lit office window glowing in a high-rise tower, symbolic, expansive, no people, quiet ambition.'},
    {p:true,  s:'A solo Latina CEO in professional attire stands at a glass building entrance at sunrise reflected in the facade, aspirational editorial photography, framed from the chest up, hands relaxed.'},
    {p:false, s:'Abstract horizon of hope, a vast calm gradient sky from deep navy to warm amber over soft distant mountains, a single beam of light, no people, cinematic and serene.'},
    {p:true,  s:'Dramatic silhouette of a single confident business professional against a vivid orange-pink sunset sky, suspension bridge and city behind, aspirational and dynamic.'},
    {p:true,  s:'A group of four diverse Latino professionals walk forward together through a bright modern lobby toward large windows, seen from behind, motion and momentum, warm light ahead.'}
  ]
,
  seguros: [
    {p:true, s:'A Latino insurance broker seated and advising a small group of three to four attentive clients around a clean uncluttered table in a bright modern office, engagement shown through warm eye contact and calm smiles rather than gestures, ALL hands resting relaxed and spaced apart on the table (no raised hands, no pointing, no gestures), candid editorial not posing, soft daylight with warm amber accents, deep navy and cream palette, medium side angle with depth, generous calm lower area for text overlay.'},
    {p:true, s:'Over-the-shoulder editorial shot of an insurance advisor in calm conversation with a group of four seated clients in a sleek corporate meeting room, attention directed through posture and gaze, hands relaxed and mostly out of frame or resting still, no hand gestures, warm amber accent light over navy tones, candid professional, depth and negative space for overlay.'},
    {p:true, s:'A Latina insurance broker in calm conversation with a group of three to four clients in a warm modern office, everyone engaged through expressions and lean-in posture, hands resting quietly clasped or on the table (not gesturing, not crowded), seen from the side, soft daylight with amber warmth, premium editorial, calm area for overlay, no hands in foreground.'},
    {p:true, s:'Wide editorial shot of an insurance advisory meeting — a broker and a group of three to four clients seated around a modern table in a glass-walled office, trusting atmosphere conveyed by engaged faces and posture, hands at rest, seen from a slightly elevated angle so the table stays uncluttered, warm amber and navy palette, candid, generous calm space for overlay.'},
    {p:true, s:'An insurance advisory session in a bright modern boardroom, a broker and a group of three to five clients listening attentively, calm professional energy shown through engaged faces, hands relaxed and still with no gestures, seen from an overhead or side angle so no two people face each other directly and hands are not crowded, warm amber over deep navy, editorial premium, negative space for text.'},
    {p:true, s:'Medium editorial shot of an insurance broker and a group of four clients in a modern corporate lounge seating area, warm approachable conversation, attention through smiles and posture, hands resting on knees or armrests (not gesturing), seen from the side, soft amber light, deep navy backdrop, candid, calm area for overlay.'},
    {p:true, s:'A Latino insurance broker welcoming a group of three to four clients in a warm modern meeting area, relational trustworthy mood conveyed by warm expressions, hands relaxed at sides or resting (no handshake, no close-up hands, no gestures), candid in-context not posing, soft daylight with amber warmth, navy palette, depth, calm lower area for overlay.'},
    {p:true, s:'A Latina insurance advisor seated with a group of three to four clients around a clean uncluttered table in a bright modern office, attentive engaged faces, hands resting calmly and spaced apart on the table (not clustered, not gesturing), warm professional mood, side view with depth, amber accent over navy and cream tones, editorial premium, calm lower third for overlay.'}
  ]
};

const pillarMap = {
  educacion: 'educacion', experto: 'educacion', conocimiento: 'educacion',
  social_proof: 'social_proof', casos: 'social_proof', testimonial: 'social_proof', casos_de_uso: 'social_proof', prueba_social: 'social_proof',
  produccion: 'produccion', behind_scenes: 'produccion', proceso: 'produccion', herramienta: 'produccion', behind_the_scenes: 'produccion',
  promesa: 'promesa', vision: 'promesa', aspiracion: 'promesa'
};

const _vertical = (item.vertical || '').toLowerCase();
const key = (_vertical === 'seguros_servicio') ? 'seguros' : (pillarMap[pillar] || 'educacion');
const pool = variants[key];
const noPeople = pool.filter(v => !v.p); const withPeople = pool.filter(v => v.p); const chosen = (noPeople.length && withPeople.length) ? (Math.random() < 0.65 ? noPeople[Math.floor(Math.random() * noPeople.length)] : withPeople[Math.floor(Math.random() * withPeople.length)]) : pool[Math.floor(Math.random() * pool.length)]; const scene = chosen.s; const has_people = chosen.p; const _pick = a => a[Math.floor(Math.random() * a.length)]; const shot = _pick(['wide establishing shot', 'medium editorial shot', 'intimate close composition', 'overhead angle', 'low dramatic angle', 'over-the-shoulder framing']); const palette = _pick(['cool slate and deep navy with a single warm amber accent', 'soft monochrome blue-grey with crisp white highlights', 'warm golden-hour tones over cool shadows', 'clean off-white and pale teal minimalist palette', 'moody deep navy with an electric blue accent']); const tod = _pick(['early morning soft light', 'bright midday daylight', 'golden-hour glow', 'cool blue dusk']); const mood = _pick(['calm and premium', 'energetic and modern', 'quiet and aspirational', 'focused and precise', 'warm and human']);

// ── Concepto visual DERIVADO DEL COPY (driver creativo principal) ──────────
// 2026-06-17: la imagen debe ILUSTRAR el mensaje del post, con props reales.
// Lo único prohibido es TEXTO legible (lo cubre el negative_prompt + OCR guard).
const copyLower = (item.copy_text || '').toLowerCase();
const _imagePromptDB = (item.image_prompt || '').trim();
const _conceptMap = [
  { re: /redes sociales|red social|instagram|facebook|linkedin|publicar|publicacion|contenido|seguidores|algoritmo|organico|engagement|social media/, concept: 'planning a content strategy like a professional team — a marketer or small group at a modern office sketching a content calendar of empty boxes on a glass board or large notebook (pure boxes, arrows and dots, absolutely no letters or numbers), or arranging plain blank sticky notes in a clean grid on a wall, focused strategic mood, premium corporate editorial. ABSOLUTELY NO literal printed photographs, photo prints, polaroids or photo cards anywhere in the frame — the visual is the act of strategic planning, not photos on a table' },
  { re: /automatiz|workflow|proceso|sistema|flujo|inteligencia artif|integrac|herramienta|ejercicio|antes de/, concept: 'mapping a process by hand BEFORE touching any tool — a person at a table or glass board drawing a simple flow of boxes and arrows using shapes and lines only (absolutely no letters or numbers), thoughtful planning mood, the act of designing the workflow on paper is the hero of the image' },
  { re: /resultado|crecer|crecimiento|venta|cliente|ingreso|roi|escalar|duplicar/, concept: 'tangible business growth — a confident small-business owner standing in their thriving workspace, or reviewing a simple upward hand-drawn curve sketched on paper (a pure line shape, no numbers), warm sense of achievement' },
  { re: /tiempo|ahorra|eficien|productiv|rapido|lento|manual|horas/, concept: 'reclaiming wasted time — a clear before/after feel of a cluttered busy desk transforming into a calm tidy organized workspace, with a clock or hourglass as a prop, the relief of saved time' },
  { re: /datos|analytic|metrica|dashboard|reporte|insight|kpi|medir|cronometr/, concept: 'making sense of information — a person studying a simple hand-drawn chart on paper or a glass board (bars or a single line as pure shapes, no numbers, no axis labels), thoughtful and clear' },
  { re: /equipo|colabor|juntos|comunidad|partner|alianza/, concept: 'team collaboration — a group of three to four professionals gathered around a shared hand-drawn sketch or simple shape diagram, engaged and pointing at it together at natural distance (hands relaxed, no foreground close-ups), cohesive and warm' },
  { re: /corredor|seguro|cobertura|ramo|renovaci|cartera|prospecto|asesor|riesgo/, concept: 'insurance advisory relationship and trust — a Latino insurance broker advising a small group of three to four clients in a modern professional office, warm relational atmosphere through engaged faces and lean-in posture (NOT hand gestures), hands relaxed and at rest, the human advisory relationship is the protagonist, candid corporate editorial (NOT a glamour portrait), deep navy and amber palette, side or overhead view with an uncluttered table, NEVER solo, NEVER exactly two people' },
];
let _derivedConcept = '';
for (const { re, concept } of _conceptMap) { if (re.test(copyLower)) { _derivedConcept = concept; break; } }
// VERTICAL MANDA SOBRE EL COPY: en seguros, la imagen SIEMPRE es la escena de asesoría
// corporativa (confianza/relación), aunque el copy mencione "LinkedIn/redes sociales"
// (que de otro modo dispararía el concepto social y arruinaría el tono empresarial).
if (_vertical === 'seguros_servicio') {
  const _seg = _conceptMap.find(c => c.re.source.includes('corredor'));
  if (_seg) _derivedConcept = _seg.concept;
}
// El concepto derivado del copy MANDA; el image_prompt del seed solo es fallback.
const primaryConcept = _derivedConcept
  || (_imagePromptDB && _imagePromptDB.length > 20 ? _imagePromptDB : null)
  || ('modern Latin American B2B environment — ' + key + ' theme');

const systemPrompt = `You are a senior art director for B2B brand JAAGSOLUTIONS (an agency that builds automation systems for Latin American SMEs). Your job: read the social post copy and design ONE rich Ideogram prompt for an image that ILLUSTRATES THE POST'S CORE IDEA, so a viewer senses what the post is about from the picture alone, before reading any caption.

HOW TO WORK:
- Identify the concrete idea or metaphor in the post copy (e.g. "mapping a process before using tools", "chasing overdue payments by hand", "measuring wasted time") and depict THAT literally and human — real props, real action — not a generic office and not an abstract glow.
- Props are ENCOURAGED when they illustrate the idea: paper with hand-drawn boxes and arrows, a simple flow sketched on a glass board, sticky shapes on a wall, a clock or hourglass, a tidy-vs-cluttered desk. SHOW the message.

THE ONLY HARD VISUAL BAN — NO READABLE TEXT:
The image must contain ZERO readable text: no letters, no numbers, no words, no typography, no logos, no brand marks, no readable signage, no readable screens. This is the single thing quality control rejects.
"No readable text" does NOT mean "no props": a notebook, whiteboard, paper or sketch is welcome AS LONG AS the markings are pure SHAPES — boxes, arrows, dots, curved lines — never letters or numbers. Draw diagrams as abstract shapes, never labelled charts. The JAAGSOLUTIONS logo is added later in post-processing, never inside the image.

COMPOSITION RULES:
1. NEGATIVE SPACE: keep the BOTTOM 38% of the frame visually calm (plain surface, wall, gradient, soft bokeh) for a text overlay; main subject in the TOP 62%.
2. PEOPLE COUNT: never exactly 2 people (two-person shots read as romantic). Use a solo subject OR a group of 3-5, seen from the side, behind, or overhead — never two people facing each other.
3. HANDS: hands may appear when they illustrate the action (e.g. drawing on paper) but at natural MEDIUM distance — never an extreme foreground close-up of hands, fingers or a pen. Keep anatomy plausible.
4. CORPORATE EDITORIAL, NOT GLAMOUR: real people working in context, mid-action — never a beauty/fashion/magazine-cover portrait or someone posing for the camera. The IDEA is the protagonist, not a person's looks.
5. BRAND MOOD: confident, modern, clean, human. Cool palette (deep navy, slate, off-white) with a warm amber accent. Soft natural professional light.
6. ETHNICITY: subjects plausibly Latin American.

CREATIVE DIRECTION FOR THIS RENDER (make each regeneration visibly different): shot = ${shot}; palette = ${palette}; lighting = ${tod}; mood = ${mood}.

PRIMARY VISUAL CONCEPT (main directive — build the image around this idea derived from the copy): "${primaryConcept}". Use the following only as a loose reference for shot type, framing and lighting, NOT for subject matter: "${scene}".

STYLE DESCRIPTORS to include: "professional editorial photography", "cinematic lighting", "shallow depth of field", "ultra-detailed", "soft natural light", "color grading slightly cool with warm highlights".

NEGATIVE INSTRUCTIONS to include in the prompt: "no readable text, no letters, no numbers, no words, no typography, no logos, no watermarks, no readable signage, no readable screens, no labelled charts; no extreme close-up hands, no pointing fingers in foreground, no handshakes, no deformed hands, no extra fingers; no romantic or intimate posing, no two-person composition, no two people facing each other; no glamour or beauty portrait".

LENGTH: 90-160 words, concrete and sensory. OUTPUT: return ONLY the final Ideogram prompt in English, one paragraph, no preamble, no quotes.`;

return [{ json: { ...item, auditor_system_prompt: systemPrompt, scene_variant: scene, has_people, primary_concept: primaryConcept, creative_axes: { shot, palette, tod, mood } } }];
