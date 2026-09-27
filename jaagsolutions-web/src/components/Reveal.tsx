import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { motionTokens } from "../lib/motion-tokens.ts";

type RevealProps = HTMLMotionProps<"div"> & {
  /** Retraso en segundos, para escalonar varios `Reveal` en una misma grilla. */
  delay?: number;
  /** Distancia de entrada en px (eje Y). */
  distance?: number;
};

/**
 * Reemplaza el par `useScrollReveal()` + clases `.reveal`/`.is-in`: cada
 * instancia observa su propio viewport (vía `whileInView` de motion) en vez
 * de depender de un estado compartido por sección.
 */
export default function Reveal({
  delay = 0,
  distance = motionTokens.distance.lg,
  children,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : distance, filter: reduce ? "blur(0px)" : "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.easing.smooth,
        delay: reduce ? 0 : delay,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
