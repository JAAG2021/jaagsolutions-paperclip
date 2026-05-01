import { ChevronRight } from "lucide-react";

export type AutomationFlowStep = {
  icon: string;
  /** Título del paso (una línea). */
  label: string;
  /** Ejemplo concreto que el cliente entiende al instante (visible). */
  example?: string;
  /** Herramientas o piezas típicas (visibles como etiquetas); adaptables al stack del cliente. */
  tools?: string[];
  /** Clases Tailwind para fondo y texto del nodo, p. ej. `bg-blue-100 text-blue-700` */
  color: string;
  /** Explicación ampliada (desplegable, no escondida tras un ícono suelto). */
  tooltip?: string;
};

type Props = {
  steps: AutomationFlowStep[];
  /** Identificador estable para `id` accesible (p. ej. título del caso de uso) */
  diagramId: string;
  /** Accessible name del diagrama completo */
  regionLabel?: string;
  className?: string;
};

/**
 * Flujo en columna: ejemplo visible + herramientas en chips + detalle técnico opción explícita.
 */
export default function AutomationFlowDiagram({
  steps,
  diagramId,
  regionLabel = "Flujo del proceso automatizado",
  className = "",
}: Props) {
  if (!steps.length) return null;

  const linearDescription = steps.map((s) => s.label).join(" → ");
  const descId = `flow-desc-${slugId(diagramId)}`;

  return (
    <div
      role="region"
      aria-label={regionLabel}
      className={`relative rounded-xl border border-dashed border-gray-200/90 bg-gradient-to-br from-gray-50/95 to-white px-4 py-4 sm:px-5 ${className}`}
    >
      <p id={descId} className="sr-only">
        Secuencia: {linearDescription}
      </p>

      <ol className="m-0 list-none space-y-0 p-0" aria-describedby={descId}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li key={`${step.label}-${index}`} className="relative flex gap-3 sm:gap-4">
              <div className="flex w-9 shrink-0 flex-col items-center sm:w-10" aria-hidden>
                <span className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-[0.6875rem] font-extrabold text-white shadow-sm ring-2 ring-brand-500/25 sm:size-9 sm:text-xs">
                  {index + 1}
                </span>
                {!isLast && (
                  <span className="mt-1 w-0.5 flex-1 min-h-[1.25rem] rounded-full bg-gradient-to-b from-brand-400/80 to-brand-200/40" />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-4 sm:pb-5">
                <div
                  className={`rounded-xl border border-white/80 px-3.5 py-3 shadow-sm sm:px-4 sm:py-3.5 ${step.color}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none select-none sm:text-[1.75rem]" aria-hidden>
                      {step.icon}
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[0.78rem] font-bold leading-snug text-balance sm:text-sm">{step.label}</p>
                      {step.example && (
                        <p className="mt-1.5 border-l-2 border-current/25 pl-2.5 text-[0.65rem] font-medium leading-relaxed text-gray-800/95 sm:text-[0.6875rem]">
                          <span className="font-extrabold text-gray-900/90">Ej. </span>
                          {step.example}
                        </p>
                      )}
                    </div>
                  </div>

                  {step.tools && step.tools.length > 0 && (
                    <div className="mt-3 border-t border-current/15 pt-2.5" role="list" aria-label="Herramientas típicas en este paso">
                      <p className="mb-1.5 text-[0.625rem] font-extrabold uppercase tracking-wide text-gray-800/85">
                        Suele conectarse con
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {step.tools.map((t) => (
                          <span
                            key={t}
                            role="listitem"
                            className="inline-flex rounded-md border border-gray-900/10 bg-white/90 px-2 py-1 text-[0.65rem] font-semibold text-gray-800 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.tooltip && (
                    <details className="mt-2.5 overflow-hidden rounded-lg border border-black/10 bg-black/[0.06] open:[&_summary_svg]:rotate-90">
                      <summary className="flex cursor-pointer list-none items-center gap-1 px-2.5 py-2 text-[0.65rem] font-bold text-gray-900/95 hover:bg-black/[0.04] [&::-webkit-details-marker]:hidden">
                        <ChevronRight
                          aria-hidden
                          className="size-3.5 shrink-0 text-brand-700 transition-transform duration-200 opacity-90"
                          strokeWidth={2.5}
                        />
                        Cómo encaja cada pieza (opcional)
                      </summary>
                      <p className="border-t border-black/10 px-2.5 py-2 text-[0.65rem] font-medium leading-relaxed text-gray-800">{step.tooltip}</p>
                    </details>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function slugId(s: string) {
  const base = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "flow";
}
