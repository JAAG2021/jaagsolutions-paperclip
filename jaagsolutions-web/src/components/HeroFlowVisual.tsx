import { useEffect, useState } from "react";
import { MessageCircle, Sparkles, Workflow, CheckCircle2, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import IsoIcon from "./IsoIcon.tsx";
import { motionTokens, springs } from "../lib/motion-tokens.ts";

type FlowStep = {
  icon: LucideIcon;
  tint: string;
  label: string;
  sub: string;
};

/** Reemplaza el Lottie de stock (etiquetas en inglés sin relación con
 * JAAGSOLUTIONS, tipo "AI matching"/"LinkedIn Search") por el mecanismo real
 * que describimos en el copy del hero: una tarea entra, la IA la prioriza,
 * se ejecuta sola y queda resuelta — con las mismas piezas (Make/n8n/OpenAI)
 * que ya aparecen en el stack de abajo. */
const FLOW_STEPS: FlowStep[] = [
  { icon: MessageCircle, tint: "#38bdf8", label: "Llega la tarea", sub: "WhatsApp · Meta Ads · Formulario" },
  { icon: Sparkles, tint: "#a78bfa", label: "La IA prioriza", sub: "OpenAI clasifica y decide" },
  { icon: Workflow, tint: "#34d399", label: "Se ejecuta sola", sub: "Make · n8n" },
  { icon: CheckCircle2, tint: "#facc15", label: "Queda resuelta", sub: "CRM actualizado, sin intervención" },
];

/** Mismo ritmo que usaba el recorrido automático del Lottie anterior. */
const CYCLE_MS = 1800;

const VISUAL_ALT =
  "Animación de flujos automatizados: una tarea entra por WhatsApp, Meta o un formulario; la IA la prioriza; se ejecuta sola vía Make o n8n; y queda resuelta con el CRM actualizado.";

export default function HeroFlowVisual({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      timer = setInterval(() => setActive((i) => (i + 1) % FLOW_STEPS.length), CYCLE_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
    };
    const handleVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reduce]);

  return (
    <div
      role="img"
      aria-label={VISUAL_ALT}
      className={`rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6 sm:py-5 ${className}`}
    >
      <ol className="m-0 list-none p-0">
        {FLOW_STEPS.map((step, i) => {
          const isActive = i === active;
          const isLast = i === FLOW_STEPS.length - 1;
          return (
            <li key={step.label} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <motion.div
                  className="relative"
                  animate={reduce ? undefined : { scale: isActive ? 1.08 : 1 }}
                  transition={springs.gentle}
                >
                  <IsoIcon icon={step.icon} tint={step.tint} className="h-11 w-11 sm:h-12 sm:w-12" />
                  {!reduce && isActive && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full"
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.6 }}
                      transition={{ duration: motionTokens.duration.crawl, ease: motionTokens.easing.smooth }}
                      style={{ backgroundColor: step.tint }}
                    />
                  )}
                </motion.div>
                {!isLast && (
                  <div className="relative my-1 h-8 w-px overflow-hidden bg-white/15 sm:h-9">
                    {!reduce && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-2.5 rounded-full bg-white/70"
                        animate={{ y: ["-10%", "130%"] }}
                        transition={{
                          duration: 1.1,
                          repeat: Infinity,
                          ease: motionTokens.easing.linear,
                          delay: i * 0.28,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 pb-5 last:pb-0">
                <p className="text-sm font-bold leading-snug text-white sm:text-base">{step.label}</p>
                <p className="mt-0.5 text-xs text-blue-200/70 sm:text-[0.8rem]">{step.sub}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
