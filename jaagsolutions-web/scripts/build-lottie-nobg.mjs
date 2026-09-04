/**
 * Genera las variantes `-nobg` de los `.lottie` del hero.
 *
 * Los archivos que exporta LottieFiles traen capas de fondo pensadas para verse
 * aisladas (un rectángulo negro, un disco blanco). Montadas sobre el degradado
 * del hero esas capas estorban, así que acá se apagan.
 *
 * Se les pone opacidad 0 en vez de borrarlas: quitarlas del array rompe el
 * indexado que usan las capas hijas (`parent`). La opacidad 0 tampoco desactiva
 * el hit-testing, así que las state machines siguen reaccionando al puntero.
 *
 * Uso:  node scripts/build-lottie-nobg.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import JSZip from "jszip";

/** Marca de tiempo constante para que la salida sea reproducible byte a byte. */
const FIXED_DATE = new Date("2026-01-01T00:00:00Z");

const TARGETS = [
  {
    src: "public/lottie/hover-interaction.lottie",
    out: "public/lottie/hover-interaction-nobg.lottie",
    // `Shape Layer 1` es la placa negra; `Main hover area` es el rectángulo gris
    // que define el área de detección del puntero (sólo era invisible porque el
    // negro lo tapaba).
    hide: ["Shape Layer 1", "Main hover area"],
  },
  {
    src: "public/lottie/automated-workflows.lottie",
    out: "public/lottie/automated-workflows-nobg.lottie",
    // `bg` es el disco blanco sobre el que se dibuja el flujo.
    hide: ["bg"],
  },
];

for (const { src, out, hide } of TARGETS) {
  const zipIn = await JSZip.loadAsync(readFileSync(src));
  const animPath = Object.keys(zipIn.files).find(
    (f) => !zipIn.files[f].dir && f.endsWith(".json") && f !== "manifest.json" && !f.startsWith("s/"),
  );
  if (!animPath) throw new Error(`No encontré la animación dentro de ${src}`);

  const anim = JSON.parse(await zipIn.file(animPath).async("string"));
  for (const nm of hide) {
    const layer = anim.layers.find((l) => l.nm === nm);
    if (!layer) throw new Error(`No encontré la capa "${nm}" en ${src}`);
    layer.ks.o = { a: 0, k: 0, ix: 11 };
  }

  // Ojo: las rutas dentro del .lottie van con "/". Empaquetar con utilidades que
  // escriban "\" (p. ej. Compress-Archive de PowerShell) produce un archivo que
  // el player carga sin error pero deja en blanco.
  const zipOut = new JSZip();
  for (const path of Object.keys(zipIn.files)) {
    if (zipIn.files[path].dir) continue;
    zipOut.file(
      path,
      path === animPath ? JSON.stringify(anim) : await zipIn.file(path).async("nodebuffer"),
      // Fecha fija y sin entradas de directorio: ambas cosas hacen falta para que
      // la salida sea reproducible. Sin ellas cada corrida escribe timestamps
      // nuevos y git ve los `.lottie` como modificados con contenido idéntico
      // (las carpetas implícitas se sellan con la hora actual). El `.lottie`
      // original tampoco trae entradas de directorio.
      { date: FIXED_DATE, createFolders: false },
    );
  }

  writeFileSync(out, await zipOut.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log(`${out} ← ${src} (capas ocultas: ${hide.join(", ")})`);
}
