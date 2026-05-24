# Content Automation Engine - Diseno Visual

**Proyecto:** JAAGSOLUTIONS - Producto comercial de automatizacion de contenido  
**Fecha:** 2026-05-24  
**Base real:** workflows n8n en produccion `Content Generator - Ideogram + Sharp Compose -> Telegram` y `Telegram Approval -> Meta + LinkedIn Publisher`

## Objetivo

Crear una composicion visual animada que convierta los dos workflows principales de n8n en un producto vendible: un motor de automatizacion de contenido que toma una estrategia editorial, genera piezas visuales con IA, conserva aprobacion humana y publica en canales sociales.

La pieza base sera un video comercial corto para redes sociales. El alcance actual no incluye modificar la landing, componentes web ni assets del sitio. Desde esta pieza se derivan un paquete de clips y artes para publicar en:

- LinkedIn
- Facebook
- Instagram
- WhatsApp / mensajes comerciales si se requiere

El storyboard estatico se usara solo como herramienta de produccion interna para ordenar escenas, prompts y aprobaciones visuales.
- Prompts reutilizables para generar escenas visuales de cada nodo

## Concepto Maestro

**Nombre comercial:** Content Automation Engine  
**Idea central:** de una idea a contenido publicado, con IA, control humano y distribucion multicanal.

**Mensaje principal:**

> Convierte tu plan editorial en contenido visual publicado automaticamente, sin perder control humano.

**Promesa comercial:**

JAAGSOLUTIONS implementa una fabrica de contenido automatizada donde el cliente conserva la decision final, pero elimina el trabajo repetitivo de generar imagenes, preparar formatos, revisar manualmente y publicar canal por canal.

## Tono Visual

El sistema debe sentirse como un producto B2B premium, no como un diagrama tecnico. La estetica combina:

- Laboratorio creativo moderno
- Paneles de automatizacion elegantes
- Lineas luminosas que conectan etapas
- Escenas humanas de aprobacion y control
- Salida multicanal hacia LinkedIn, Instagram y Facebook

La paleta recomendada mantiene la marca JAAGSOLUTIONS: navy profundo, azul electrico, blanco limpio, acentos cian/verde para estados correctos y coral/rojo suave para aprobacion/rechazo. Evitar que todo se vea como un dashboard oscuro generico; debe haber contraste entre creatividad, revision humana y publicacion.

## Estructura Narrativa Del Video

Duracion objetivo: 45-60 segundos.  
Formato maestro: 16:9, exportable tambien en 9:16 y 1:1.  
Ritmo: escenas de 4-6 segundos, transiciones por lineas de flujo.

### Escena 1 - La necesidad

**Copy en pantalla:** "Publicar contenido constante no deberia depender de tareas manuales."  
**Visual:** equipo pequeno revisando calendario editorial, redes sociales y tareas pendientes. Ambiente profesional, sin verse caotico.

**Prompt visual:**

```text
Professional editorial scene inside a modern Latin American SME office. A small marketing and operations team reviews a clean editorial calendar on a large table, with abstract social media cards and scheduling blocks represented as simple visual elements, no readable text. Premium B2B style, deep navy and cool blue palette with warm human lighting, cinematic composition, realistic photography, shallow depth of field, elegant and organized, no logos, no typography, no watermarks.
```

### Escena 2 - Entrada del plan editorial

**Copy en pantalla:** "El plan editorial entra al sistema."  
**Nodo real representado:** `Obtener posts pendientes` desde `content_plan`.

**Visual:** una base de datos/calendario se transforma en una linea de flujo. Debe transmitir fuente de verdad, no hoja de calculo manual.

**Prompt visual:**

```text
High-end product visualization of an editorial content plan becoming structured data. A glowing calendar grid and database-like blocks feed into a central automation stream made of clean luminous lines. Modern B2B automation aesthetic, deep navy background, cyan and white accents, subtle glass panels, no readable text, no numbers, no logos, no interface screenshots, polished commercial 3D style.
```

### Escena 3 - Motor creativo IA

**Copy en pantalla:** "IA convierte la idea en direccion creativa."  
**Nodos reales representados:** `Preparar prompt Auditor`, `Auditor de prompt (OpenAI)`, `Aplicar prompt mejorado`.

**Visual:** una idea de post entra a un nucleo creativo y salen referencias visuales refinadas.

**Prompt visual:**

```text
Creative AI direction engine inside a premium automation studio. A single content idea flows into a luminous neural core, generating refined visual mood frames around it: photography style, composition, lighting, brand mood, and format cues represented only as abstract image thumbnails without text. Human-tech atmosphere, elegant navy glass surfaces, cool blue light, warm highlights, cinematic commercial style, no readable text, no logos, no UI screenshots.
```

### Escena 4 - Generacion de imagen

**Copy en pantalla:** "La imagen se genera automaticamente."  
**Nodos reales representados:** `Ideogram + OCR - fallback seguro`.

**Visual:** una imagen profesional aparece desde particulas/luz, como asset social en produccion.

**Prompt visual:**

```text
An AI image generation chamber creating a polished social media visual for a B2B automation brand. A blank luminous canvas transforms into a professional editorial photograph, surrounded by subtle particles and clean automation lines. Premium creative production environment, deep navy, cyan, white and soft coral accents, realistic but cinematic, no readable words inside the generated image, no logos, no watermarks.
```

### Escena 5 - Control de calidad

**Copy en pantalla:** "Control de calidad antes de mostrar la pieza."  
**Nodos reales representados:** OCR, validacion sin texto, fallback seguro.

**Visual:** la pieza pasa por un escaner elegante; check visual cuando esta limpia.

**Prompt visual:**

```text
Premium quality-control scan of a generated social media image. A clean visual asset passes through a transparent light scanner that checks composition, safety and absence of unwanted text. Subtle green approval glow, abstract OCR-like scanning beams without readable characters, modern B2B production lab, realistic 3D commercial style, no typography, no logos, no numbers.
```

### Escena 6 - Composicion final

**Copy en pantalla:** "El sistema adapta la pieza al formato social."  
**Nodos reales representados:** `compose-image.js`, Sharp/SVG, `Guardar image_path`.

**Visual:** imagen, copy y formato se ensamblan en una pieza final 4:5 o vertical. El copy se sugiere con bloques, no con texto legible dentro de la imagen generada.

**Prompt visual:**

```text
Elegant automated design composition scene. A generated image, caption blocks, brand color accents and social media format guides align into a finished premium content card. The card uses abstract placeholder lines instead of readable text. Clean layout mechanics, glass panels, cinematic lighting, polished SaaS product visualization, deep navy background with cyan and white highlights, no logos, no readable words.
```

### Escena 7 - Aprobacion humana

**Copy en pantalla:** "El control final sigue en manos humanas."  
**Nodos reales representados:** `Telegram - enviar para aprobacion`, botones aprobar/rechazar.

**Visual:** una persona revisa en movil una pieza lista, con dos acciones visuales claras: aprobar o regenerar. Puede mostrar iconos, no texto real.

**Prompt visual:**

```text
Human approval checkpoint for automated content. A business owner holds a smartphone showing a polished social media preview with two simple action buttons represented by a green check and a soft red refresh/reject icon, no readable text. Warm human hand detail, modern office background, premium B2B automation mood, shallow depth of field, cinematic lighting, clean and trustworthy.
```

### Escena 8 - Publicacion multicanal

**Copy en pantalla:** "Al aprobar, se publica en multiples canales."  
**Nodos reales representados:** LinkedIn personal, LinkedIn organizacion, Facebook Page, Instagram Business.

**Visual:** la pieza aprobada viaja por lineas hacia tarjetas sociales abstractas. Evitar logos si se quiere un asset evergreen; usar iconografia generica o nombres fuera de la imagen si hace falta.

**Prompt visual:**

```text
Approved content flowing from a central automation hub into multiple social publishing channels. One finished visual card duplicates into several elegant platform cards connected by luminous lines. Use generic social channel shapes and clean interface silhouettes without readable text or brand logos. Premium SaaS automation style, deep navy, cyan, white and green approval accents, high-end commercial 3D render, dynamic motion-ready composition.
```

### Escena 9 - Regeneracion si no cumple

**Copy en pantalla:** "Si no convence, se regenera sin romper el flujo."  
**Nodos reales representados:** rechazo, `retry_count`, `regenerate-single`.

**Visual:** una pieza vuelve al motor creativo por un circuito de mejora.

**Prompt visual:**

```text
Content regeneration loop in a premium automation system. A rejected creative asset smoothly returns through a glowing feedback loop into the AI creative engine, then emerges as a cleaner improved version. Elegant circular motion, soft coral rejection cue turning into green approval cue, no error chaos, modern B2B product visualization, no readable text, no logos, no UI screenshots.
```

### Escena 10 - Resultado comercial

**Copy en pantalla:** "Contenido constante, aprobado y publicado con menos friccion."  
**Visual:** dashboard de resultados abstracto: calendario lleno, piezas publicadas, equipo enfocado en estrategia.

**Prompt visual:**

```text
Final commercial outcome of an automated content engine. A modern business team reviews a calm growth dashboard and a filled editorial calendar, while polished social content cards float neatly in the background. The mood is controlled, creative and premium, with deep navy, cool blue, white and green accents. Realistic editorial photography blended with subtle SaaS interface elements, no readable text, no logos, no numbers, no watermarks.
```

## Traduccion De Nodos A Mensaje Comercial

### Workflow 1 - Content Generator

**Descripcion tecnica optimizada:** selecciona automaticamente el siguiente post pendiente, cambia su estado a generacion, calcula el formato visual correcto, mejora el prompt creativo con IA, genera imagen, valida que no contenga texto no deseado, compone la pieza final, la guarda y la envia a Telegram.

**Descripcion comercial:** convierte un plan editorial en una pieza visual lista para aprobacion, con IA creativa, control de calidad y formato profesional.

**Valor para cliente:** reduce trabajo manual de diseno, mantiene consistencia visual y prepara contenido antes de la fecha de publicacion.

### Workflow 2 - Telegram Approval + Publisher

**Descripcion tecnica optimizada:** recibe el callback de Telegram, interpreta aprobar/rechazar, publica en LinkedIn/Meta si se aprueba, actualiza estado como publicado, o regenera si se rechaza hasta un limite de intentos.

**Descripcion comercial:** permite aprobar desde el movil y publica automaticamente en los canales correctos, con regeneracion controlada si la pieza no cumple.

**Valor para cliente:** conserva control humano, elimina publicacion manual por canal y crea un proceso repetible.

## Versiones A Producir

### Video Comercial Maestro Para Redes

- Formato: 16:9, 1920x1080
- Duracion: 45-60 segundos
- Uso: LinkedIn y Facebook feed
- Contenido: 10 escenas narrativas con copy breve
- Estilo: cinematic SaaS/product video, no tutorial tecnico

### Version Vertical

- Formato: 9:16, 1080x1920
- Duracion: 30-45 segundos
- Uso: Instagram Reels, Facebook Reels, LinkedIn mobile y WhatsApp
- Adaptacion: menos texto, mas ritmo, CTA final claro

### Version Cuadrada

- Formato: 1:1, 1080x1080
- Duracion: 30-45 segundos
- Uso: publicaciones cuadradas en Instagram/Facebook y versiones recortadas para carrusel
- Adaptacion: composicion centrada, textos grandes, menos elementos laterales

## Copy Comercial Por Version

### Headline Principal

```text
Automatiza tu contenido sin perder control creativo.
```

### Subheadline

```text
De un plan editorial a publicaciones listas en LinkedIn, Instagram y Facebook, con IA, aprobacion humana y distribucion automatica.
```

### CTA

```text
Solicitar diagnostico de contenido automatizado
```

### Texto De Apoyo Para CTA

```text
Revisamos como produces contenido hoy y te proponemos un flujo automatizado para generar, aprobar y publicar con menos trabajo manual.
```

### Alternativas De Mensaje

```text
Tu calendario editorial convertido en publicaciones aprobadas y publicadas automaticamente.
```

```text
Contenido profesional, revision humana y publicacion multicanal desde un solo flujo.
```

```text
Un sistema real en produccion para crear, revisar y publicar contenido con IA.
```

## Guia De Animacion

Las transiciones deben representar flujo, no saltos sueltos:

- Lineas luminosas conectan cada escena
- Los nodos aparecen como estaciones de una fabrica creativa
- Los estados usan color: azul para procesamiento, verde para aprobado, coral para rechazo/regeneracion
- El movimiento debe ser suave, comercial y claro
- No usar exceso de dashboards, codigo o pantallas tecnicas

El video debe terminar con el sistema completo visible como una ruta:

```text
Plan editorial -> IA creativa -> Control de calidad -> Aprobacion humana -> Publicacion multicanal
```

## Reglas Visuales

- No mostrar secretos, tokens, URLs internas ni datos reales de clientes.
- No usar capturas reales de n8n como pieza principal; pueden aparecer solo como referencia secundaria si se requiere.
- Evitar texto dentro de imagenes generadas por IA; el texto comercial se agrega en edicion.
- Mantener al humano como punto de control, no como operador manual.
- Mostrar el producto como automatizacion creativa, no como "bot que publica solo".

## Propuesta De Produccion

### Fase 1 - Storyboard Estatico

Crear 10 imagenes base, una por escena, usando los prompts anteriores. Validar tono visual, claridad y consistencia.

### Fase 2 - Video Maestro

Animar las escenas con lineas de flujo, zooms suaves, transiciones de luz y copy en pantalla. Exportar 16:9 y 9:16.

### Fase 3 - Adaptaciones Sociales

Exportar versiones 16:9, 9:16 y 1:1 con safe zones para cada red. No modificar `jaagsolutions.com` ni componentes de la landing en este alcance.

### Fase 4 - Paquete De Publicacion

Preparar caption, hashtags, thumbnail/cover y texto corto para LinkedIn, Facebook e Instagram.

## Criterios De Aceptacion

- La pieza se entiende sin explicar n8n.
- Se reconocen claramente dos motores: generacion y aprobacion/publicacion.
- El cliente percibe un producto vendible, no una automatizacion interna.
- La aprobacion humana queda visible como ventaja de control.
- La pieza puede publicarse en LinkedIn, Facebook e Instagram sin rehacer el concepto.
- No se exponen datos sensibles ni detalles operativos innecesarios.

## Riesgos Y Mitigaciones

**Riesgo:** que el resultado parezca demasiado tecnico.  
**Mitigacion:** usar lenguaje de negocio y visuales de producto, no capturas de nodos.

**Riesgo:** que parezca que la IA publica sin supervision.  
**Mitigacion:** destacar Telegram/aprobacion humana como escena central.

**Riesgo:** que las imagenes IA incluyan texto falso.  
**Mitigacion:** prompts con prohibicion explicita de texto y agregar copy despues en edicion.

**Riesgo:** que las proporciones recorten informacion importante entre redes.  
**Mitigacion:** disenar primero con safe zones y exportar variantes 16:9, 9:16 y 1:1 desde el mismo storyboard.
