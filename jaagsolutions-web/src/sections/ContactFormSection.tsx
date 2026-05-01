import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CTAButton from "../components/CTAButton.tsx";

type FormData = {
  nombre: string;
  email: string;
  empresa: string;
  sitio_web: string;
  tamano_equipo: string;
  dolor_proceso: string;
  herramientas_actual: string;
  presupuesto: string;
  timeline: string;
  whatsapp: string;
  recurso_pdf: boolean;
};

const STEPS_COPY = ["Contexto del negocio", "Tu mayor fricción hoy", "Inversión y timing"] as const;

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID as string | undefined;

const STEP_FIELDS: (keyof FormData)[][] = [
  ["nombre", "email", "empresa", "tamano_equipo"],
  ["dolor_proceso"],
  ["presupuesto", "timeline"],
];

export default function ContactFormSection() {
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    defaultValues: {
      sitio_web: "",
      herramientas_actual: "",
      whatsapp: "",
      nombre: "",
      email: "",
      empresa: "",
      tamano_equipo: "",
      dolor_proceso: "",
      presupuesto: "",
      timeline: "",
      recurso_pdf: true,
    },
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    if (import.meta.env.PROD && !FORMSPREE_ID?.trim()) {
      console.error(
        "[contact] Falta VITE_FORMSPREE_ID: configura el ID en Vercel para recibir leads.",
      );
    }
  }, []);

  async function onSubmit(data: FormData) {
    setSubmitError(false);
    try {
      const payload = {
        nombre: data.nombre,
        email: data.email,
        empresa: data.empresa,
        sitio_web: data.sitio_web,
        tamano_equipo: data.tamano_equipo,
        dolor_proceso: data.dolor_proceso,
        herramientas_actual: data.herramientas_actual,
        presupuesto: data.presupuesto,
        timeline: data.timeline,
        whatsapp: data.whatsapp,
        recurso_pdf: data.recurso_pdf ? "Sí — PDF 5 flujos automatización PYME" : "No solicitado",
        tipo_solicitud: "diagnostico_multipaso",
      };

      const formId = FORMSPREE_ID?.trim();
      if (import.meta.env.PROD && !formId) {
        throw new Error("missing VITE_FORMSPREE_ID");
      }
      if (formId) {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("form error");
      }

      const gaId = import.meta.env.VITE_GA_ID as string | undefined;
      if (gaId && typeof window !== "undefined" && "gtag" in window) {
        (window as { gtag: (...args: unknown[]) => void }).gtag("event", "form_submit", {
          event_category: "conversion",
          event_label: "diagnostico_multipaso",
        });
      }

      reset();
      setStepIndex(0);
    } catch (err) {
      setSubmitError(true);
      throw err;
    }
  }

  async function goNext() {
    const keys = STEP_FIELDS[stepIndex];
    const ok = await trigger(keys, { shouldFocus: true });
    if (ok && stepIndex < STEPS_COPY.length - 1) setStepIndex((s) => s + 1);
  }

  function goPrev() {
    setStepIndex((s) => Math.max(0, s - 1));
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm";
  const selectClass = `${inputClass} bg-white`;

  return (
    <section id="contacto" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wide border border-brand-100 mb-3">
              Diagnóstico cualificado
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Diseñemos tu ruta de eficiencia
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Paso a paso — sin interrogatorio intimidante — para que lleguemos mejor preparados a tu primera reunión estratégica.
            </p>
            <ul className="space-y-4 text-gray-700 text-sm">
              <li className="flex gap-3">
                <span className="text-xl">⏱</span>
                <span>Réplica en menos de <strong className="text-gray-900">24&nbsp;h</strong> coordinando siguiente paso útil para vos.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">🎯</span>
                <span>Filtramos curiosidades y priorizamos dueños que traen proceso concreto y margen donde automatizar marca diferencia.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">📑</span>
                <span>
                  <strong className="text-gray-900">Lead magnet:</strong> el PDF gratuito sobre{" "}
                  <em>5&nbsp;flujos clave para PYMEs</em> lo enviamos por correo al confirmar el diagnóstico{" "}
                  (podés pedir que no entre en el último paso).
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-inner">
            {isSubmitSuccessful ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4" aria-hidden>
                  ✅
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">¡Recibimos tu solicitud!</h3>
                <p className="text-gray-600 leading-relaxed">
                  Analizaremos tus respuestas y te escribimos en menos de{" "}
                  <strong className="text-gray-900">24&nbsp;h</strong> para agendar la{" "}
                  <strong className="text-gray-900">sesión estratégica</strong>. Si solicitaste recurso gratis, llegará al correo cuando respondamos tu caso de punta a punta (revisá spam).
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                <div className="flex gap-2">
                  {STEPS_COPY.map((label, idx) => (
                    <div key={label} className="flex flex-1 flex-col min-w-0">
                      <span
                        className={`text-[0.625rem] font-bold uppercase tracking-wide truncate ${idx === stepIndex ? "text-brand-600" : "text-gray-400"}`}
                        title={label}
                      >
                        {label}
                      </span>
                      <div className={`h-1 rounded-full mt-1 ${idx <= stepIndex ? "bg-brand-600" : "bg-gray-200"}`} />
                    </div>
                  ))}
                </div>

                <div role="group" aria-labelledby="step-contexto-heading" hidden={stepIndex !== 0}>
                  <h3 id="step-contexto-heading" className="sr-only">
                    Paso 1 · Contexto
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <input
                        {...register("nombre", { required: "Indicá cómo llamarte" })}
                        placeholder="Nombre completo *"
                        autoComplete="name"
                        className={inputClass}
                      />
                      {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
                    </div>
                    <div>
                      <input
                        {...register("email", {
                          required: "Correo obligatorio",
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Email inválido",
                          },
                        })}
                        type="email"
                        autoComplete="email"
                        placeholder="Email corporativo (@empresa)  · * "
                        className={inputClass}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                      <p className="mt-1 text-[0.7rem] text-gray-400">
                        Los dominios públicos están bien; el corporativo acelera la priorización cuando hay alta demanda.
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <input {...register("empresa", { required: "Nombre de la empresa *" })} placeholder="Nombre de empresa *" className={inputClass} />
                        {errors.empresa && <p className="mt-1 text-xs text-red-600">{errors.empresa.message}</p>}
                      </div>
                      <div>
                        <input
                          {...register("sitio_web", {
                            validate: (v) =>
                              !v?.trim()
                                ? true
                                : /^https?:\/\/.+/i.test(v.trim()) ||
                                    /^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v.trim())
                                  ? true
                                  : "URL válida https://… o dominio tipo mitienda.mx",
                          })}
                          placeholder="Sitio web (opcional)"
                          className={inputClass}
                          autoCapitalize="off"
                        />
                        {errors.sitio_web && <p className="mt-1 text-xs text-red-600">{errors.sitio_web.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Tamaño del equipo
                      </label>
                      <select {...register("tamano_equipo", { required: "Necesitamos tamaño orientativo del equipo *" })} className={selectClass}>
                        <option value="">Seleccioná tamaño típico *</option>
                        <option value="1-5">1 – 5</option>
                        <option value="6-20">6 – 20</option>
                        <option value="21-50">21 – 50</option>
                        <option value="50+">50+</option>
                      </select>
                      {errors.tamano_equipo && <p className="mt-1 text-xs text-red-600">{errors.tamano_equipo.message}</p>}
                    </div>
                  </div>
                </div>

                <div role="group" aria-labelledby="step-friccion-heading" hidden={stepIndex !== 1}>
                  <h3 id="step-friccion-heading" className="sr-only">
                    Paso 2 · Fricción
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        ¿Qué proceso te quita más tiempo hoy?
                      </label>
                      <select {...register("dolor_proceso", { required: "Elegí categoría cercana al dolor mayor *" })} className={selectClass}>
                        <option value="">Seleccioná un foco inicial *</option>
                        <option value="ventas-leads">Ventas / Captación leads</option>
                        <option value="facturacion-cobranza">Facturación · Cobranza · Pagos</option>
                        <option value="atencion-cliente">Atención al cliente · Soporte</option>
                        <option value="operaciones-internas">Operaciones internas / Backoffice</option>
                      </select>
                      {errors.dolor_proceso && <p className="mt-1 text-xs text-red-600">{errors.dolor_proceso.message}</p>}
                    </div>
                    <div>
                      <textarea
                        {...register("herramientas_actual")}
                        rows={4}
                        placeholder='Herramientas típicas: Excel, Sheets, CRM (nombre), WhatsApp Business, correo Gmail/Outlook… (Opcional)'
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                    <input
                      {...register("whatsapp")}
                      type="tel"
                      placeholder="WhatsApp (opcional — aceleramos coordinación rápida)"
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div role="group" aria-labelledby="step-comp-heading" hidden={stepIndex !== 2}>
                  <h3 id="step-comp-heading" className="sr-only">
                    Paso 3 · Inversión
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Rango de inversión estimado (solo orientativo)
                      </label>
                      <select {...register("presupuesto", { required: "Seleccioná rango aproximado *" })} className={selectClass}>
                        <option value="">Rango alineado a tu etapa · *</option>
                        <option value="<500">&lt; USD&nbsp;500 · Explorador (Starter cercano)</option>
                        <option value="500-1500">USD&nbsp;500 – 1.500 · PYME típico en Growth</option>
                        <option value=">1500-medida">&gt; USD&nbsp;1.500 · Escala · solución integral</option>
                      </select>
                      {errors.presupuesto && <p className="mt-1 text-xs text-red-600">{errors.presupuesto.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Urgencia
                      </label>
                      <select {...register("timeline", { required: "Indicá el timing esperado *" })} className={selectClass}>
                        <option value="">¿Qué tan pronto necesitás tenerlo funcionando? *</option>
                        <option value="inmediato">Inmediato (este mes)</option>
                        <option value="1-3meses">1 – 3 meses</option>
                        <option value="investigacion">Solo explorando / benchmarking</option>
                      </select>
                      {errors.timeline && <p className="mt-1 text-xs text-red-600">{errors.timeline.message}</p>}
                    </div>
                    <label className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 border border-brand-100 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" {...register("recurso_pdf")} className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                      <span>
                        <strong className="text-gray-900">Enviame el PDF gratuito</strong> &quot;5 flujos de automatización que toda PYME debe tener&quot; junto con el seguimiento del diagnóstico.
                      </span>
                    </label>
                  </div>
                </div>

                {submitError && (
                  <p className="text-sm text-red-600">
                    {import.meta.env.PROD && !FORMSPREE_ID?.trim()
                      ? "El envío no está configurado en el servidor (falta ID de formulario). Volvé a intentar más tarde o escribinos por WhatsApp."
                      : "Ocurrió un error al enviar. Intentá de nuevo o escribinos por WhatsApp."}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center pt-2">
                  {stepIndex > 0 ? (
                    <button type="button" onClick={goPrev} className="text-sm font-semibold text-gray-600 hover:text-brand-700">
                      ← Volver
                    </button>
                  ) : (
                    <span className="hidden sm:block text-xs text-transparent select-none">.</span>
                  )}
                  <div className="flex gap-3 flex-wrap">
                    {stepIndex < STEPS_COPY.length - 1 ? (
                      <CTAButton type="button" variant="primary" onClick={() => { void goNext(); }} className="min-w-[8rem]" disabled={isSubmitting}>
                        Siguiente
                      </CTAButton>
                    ) : (
                      <CTAButton type="submit" variant="primary" className="min-w-[12rem] sm:min-w-[14rem]" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando…" : "Quiero mi plan de automatización"}
                      </CTAButton>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
