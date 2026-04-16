import { useState } from "react";
import { useForm } from "react-hook-form";
import SectionHeader from "../components/SectionHeader.tsx";
import CTAButton from "../components/CTAButton.tsx";

type FormData = {
  nombre: string;
  empresa: string;
  cargo: string;
  email: string;
  whatsapp: string;
  sector: string;
  rango: string;
  proceso: string;
};

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID as string | undefined;

export default function ContactFormSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>();

  const [submitError, setSubmitError] = useState(false);

  async function onSubmit(data: FormData) {
    setSubmitError(false);
    try {
      if (FORMSPREE_ID) {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("form error");
      }

      // Track conversion event if GA is configured
      const gaId = import.meta.env.VITE_GA_ID as string | undefined;
      if (gaId && typeof window !== "undefined" && "gtag" in window) {
        (window as { gtag: (...args: unknown[]) => void }).gtag("event", "form_submit", {
          event_category: "conversion",
          event_label: "diagnostico",
        });
      }

      reset();
    } catch {
      setSubmitError(true);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — copy */}
          <div>
            <SectionHeader
              title="Solicita tu diagnostico empresarial"
              subtitle="Cuentanos tu proceso actual y te proponemos una ruta clara de implementacion."
            />
            <div className="space-y-4 mt-8">
              {[
                { icon: "⏱", text: "Respuesta en menos de 24 horas" },
                { icon: "🎯", text: "Diagnostico sin costo ni compromiso" },
                { icon: "🔒", text: "Tus datos solo se usan para contactarte" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-gray-700">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            {isSubmitSuccessful ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitud recibida</h3>
                <p className="text-gray-600">Gracias. Recibimos tu solicitud y te contactaremos en breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register("nombre", { required: "Campo obligatorio" })}
                      placeholder="Nombre completo *"
                      className={inputClass}
                    />
                    {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register("empresa", { required: "Campo obligatorio" })}
                      placeholder="Empresa *"
                      className={inputClass}
                    />
                    {errors.empresa && <p className={errorClass}>{errors.empresa.message}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    {...register("cargo")}
                    placeholder="Cargo"
                    className={inputClass}
                  />
                  <div>
                    <input
                      {...register("email", {
                        required: "Campo obligatorio",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Email invalido" },
                      })}
                      type="email"
                      placeholder="Email corporativo *"
                      className={inputClass}
                    />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    {...register("whatsapp")}
                    placeholder="WhatsApp"
                    className={inputClass}
                  />
                  <input
                    {...register("sector")}
                    placeholder="Sector de la empresa"
                    className={inputClass}
                  />
                </div>
                <select {...register("rango")} className={inputClass}>
                  <option value="">Rango de inversion (opcional)</option>
                  <option value="menos-1k">Menos de $1,000 USD</option>
                  <option value="1k-5k">$1,000 – $5,000 USD</option>
                  <option value="5k-15k">$5,000 – $15,000 USD</option>
                  <option value="mas-15k">Mas de $15,000 USD</option>
                </select>
                <div>
                  <textarea
                    {...register("proceso", { required: "Campo obligatorio" })}
                    placeholder="Describe brevemente el proceso que quieres mejorar *"
                    rows={4}
                    className={inputClass}
                  />
                  {errors.proceso && <p className={errorClass}>{errors.proceso.message}</p>}
                </div>

                {submitError && (
                  <p className="text-sm text-red-600">
                    Ocurrio un problema al enviar. Intenta nuevamente o escribenos por WhatsApp.
                  </p>
                )}

                <CTAButton type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar solicitud"}
                </CTAButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
