import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { motionTokens, springs } from "../lib/motion-tokens.ts";

type IsoIconProps = {
  /** El glyph de lucide-react que ya se usa en el resto del sitio — no se
   * inventa un pictograma nuevo, solo el contenedor isométrico. */
  icon: LucideIcon;
  /** Color base; las tres caras se derivan con distinta opacidad sobre el
   * mismo tono, no con colores sueltos, para que el set quede consistente. */
  tint: string;
  className?: string;
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

/** Cada cara dibuja su contorno (blueprint) y luego rellena — como el
 * `blueprint-grid`/`viewfinder` del hero, la pieza se "levanta" a mano
 * en vez de aparecer ya terminada. */
function facetVariants(targetOpacity: number): Variants {
  return {
    hidden: { pathLength: 0, opacity: 1, fillOpacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      fillOpacity: targetOpacity,
      transition: {
        pathLength: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth },
        fillOpacity: { duration: motionTokens.duration.normal, delay: motionTokens.duration.slow * 0.6 },
      },
    },
  };
}

const glyphVariants: Variants = {
  hidden: { opacity: 0, scale: motionTokens.scale.subtle },
  visible: { opacity: 1, scale: 1, transition: { ...springs.gentle, delay: 0.35 } },
};

/**
 * Ícono isométrico propio: un bloque de 3 caras con la misma geometría en
 * los 6 usos del sitio (Servicios + Casos de uso), solo cambia el color y el
 * glyph. Reemplaza los círculos planos de Lucide/emoji por algo con más peso
 * — inspirado en las tarjetas de función de graphify.com, pero con los
 * íconos que ya existían en el código, no un set nuevo de ilustraciones.
 */
export default function IsoIcon({ icon: Icon, tint, className = "" }: IsoIconProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={`relative shrink-0 ${className}`} aria-hidden="true">
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <polygon points="32,6 58,20 32,34 6,20" fill={tint} />
          <polygon points="6,20 32,34 32,58 6,44" fill={tint} fillOpacity="0.72" />
          <polygon points="58,20 32,34 32,58 58,44" fill={tint} fillOpacity="0.5" />
        </svg>
        <Icon
          className="absolute left-1/2 top-[46%] h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 text-white"
          strokeWidth={2.25}
        />
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 ${className}`} aria-hidden="true">
      <motion.svg
        viewBox="0 0 64 64"
        className="h-full w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
        variants={containerVariants}
      >
        <motion.polygon
          points="32,6 58,20 32,34 6,20"
          fill={tint}
          stroke={tint}
          strokeWidth={1}
          strokeLinejoin="round"
          variants={facetVariants(1)}
        />
        <motion.polygon
          points="6,20 32,34 32,58 6,44"
          fill={tint}
          stroke={tint}
          strokeWidth={1}
          strokeLinejoin="round"
          variants={facetVariants(0.72)}
        />
        <motion.polygon
          points="58,20 32,34 32,58 58,44"
          fill={tint}
          stroke={tint}
          strokeWidth={1}
          strokeLinejoin="round"
          variants={facetVariants(0.5)}
        />
      </motion.svg>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
        variants={glyphVariants}
        className="absolute left-1/2 top-[46%] h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2"
      >
        <Icon className="h-full w-full text-white" strokeWidth={2.25} />
      </motion.div>
    </div>
  );
}
