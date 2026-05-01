import CTAButton from "../components/CTAButton.tsx";
import AutomationFlowDiagram, { type AutomationFlowStep } from "../components/AutomationFlowDiagram.tsx";

type UseCase = {
  title: string;
  emoji: string;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  /** Historia concreta que ancla el caso (visible bajo el título). */
  scenario: string;
  flow: AutomationFlowStep[];
  /** Cifra o resultado corto (chip). */
  resultBadge: string;
  /** Texto del impacto en contexto sectorial. */
  resultText: string;
  resultIcon: string;
};

const useCases: UseCase[] = [
  {
    title: "Captación de Leads",
    emoji: "🎯",
    accentClass: "text-blue-600",
    borderClass: "border-blue-200",
    bgClass: "bg-blue-50",
    scenario:
      "Ejemplo: pequeña agencia recibe 30–80 leads/mes entre formulario web, anuncios y WhatsApp; hoy reparten en Excel y pierden follow-up.",
    flow: [
      {
        icon: "📝",
        label: "Entra el contacto",
        example: "María envía el formulario “Quiero una demo” desde tu campaña en Meta o la web.",
        tools: ["Formulario / web", "Meta Lead Ads · WhatsApp", "Make o n8n · Webhook"],
        color: "bg-blue-100 text-blue-800",
        tooltip:
          "El disparador puede ser formulario web, Meta Lead Ads o WhatsApp; todo entra al orquestador (Make o n8n) vía webhook para normalizar el lead.",
      },
      {
        icon: "🤖",
        label: "IA prioriza al instante",
        example: "El flujo etiqueta “alto potencial / sector X / urgente” antes de que abra el correo.",
        tools: ["OpenAI", "Make / n8n", "HubSpot · Pipedrive · Airtable"],
        color: "bg-indigo-100 text-indigo-800",
        tooltip:
          "OpenAI clasifica o resume según tus reglas; Make/n8n escribe campos y etapas en el CRM o base que ya uses, sin copiar a mano.",
      },
      {
        icon: "📅",
        label: "Se agenda sola la reunión",
        example: "María recibe link y elige horario; el comercial ve la cita en calendario sin ping-pong.",
        tools: ["Google / Microsoft Calendar", "Correo", "WhatsApp Business API"],
        color: "bg-violet-100 text-violet-800",
        tooltip:
          "Enlace de reserva o propuesta de horarios según disponibilidad real; recordatorios por correo o WhatsApp con plantillas aprobadas.",
      },
      {
        icon: "👤",
        label: "CRM listo para la llamada",
        example: "Abres el lead y ya ves origen, notas de IA y historial del touchpoint.",
        tools: ["Tu CRM actual", "Campos sincronizados", "Historial del lead"],
        color: "bg-purple-100 text-purple-800",
        tooltip:
          "Origen del lead, puntuación, citas y notas quedan en el mismo sistema que ya usa ventas — no hay “otro CRM” paralelo.",
      },
    ],
    resultBadge: "~+35% contacto efectivo",
    resultText:
      "Sector marketing y servicios: caso tipo “firma boutique” — más conversaciones reales con la misma inversión en media al no perder leads en la bandeja.",
    resultIcon: "📈",
  },
  {
    title: "Cotización a Cierre",
    emoji: "💼",
    accentClass: "text-emerald-600",
    borderClass: "border-emerald-200",
    bgClass: "bg-emerald-50",
    scenario:
      "Ejemplo: fabricante o distribuidor con 10–30 cotizaciones activas; versiones de PDF por correo y “¿ya lo firmaron?” en hilo interno.",
    flow: [
      {
        icon: "🔍",
        label: "Disparador en el CRM",
        example: "Un registro pasa a “cotización enviada” o llega un formulario B2B cualificado.",
        tools: ["Webhook", "HubSpot · Pipedrive · Zoho", "Hoja operativa (opcional)"],
        color: "bg-emerald-100 text-emerald-800",
        tooltip:
          "Cuando cambia una etapa o llega el formulario B2B, el flujo arranca solo; también podemos usar una hoja operativa como fuente temporal.",
      },
      {
        icon: "📄",
        label: "Propuesta armada en segundos",
        example: "PDF con precios, plazos y condiciones sale con datos del cliente ya cruzados.",
        tools: ["Plantilla Google / PDF", "Make / n8n", "DocuSign · Zapsign (firma)"],
        color: "bg-teal-100 text-teal-800",
        tooltip:
          "Fusionamos datos del CRM en plantilla PDF o documento y, si aplica, enviamos a firma electrónica; versiones únicas sin adjuntos duplicados.",
      },
      {
        icon: "✅",
        label: "Aprobación trazable",
        example: "El comprador marca OK en enlace; el vendedor ve el estado sin preguntar por chat.",
        tools: ["Estado en CRM", "Slack", "Correo equipo comercial"],
        color: "bg-cyan-100 text-cyan-800",
        tooltip:
          "Cuando el comprador firma o aprueba en el enlace, el estado vuelve al pipeline y avisa por Slack o correo al equipo comercial.",
      },
      {
        icon: "🎉",
        label: "Cierre registrado",
        example: "Se genera orden o factura borrador y el pipeline avanza a “ganado”.",
        tools: ["ERP ligero · facturación", "Webhook", "CRM · pipeline ganado"],
        color: "bg-green-100 text-green-800",
        tooltip:
          "Si tu stack lo permite, disparamos borrador de pedido/factura o actualizamos ERP con webhook; si no, al menos cerramos bien el CRM.",
      },
    ],
    resultBadge: "~−50% tiempo al cierre",
    resultText:
      "Distribución B2B: caso tipo “fabricante regional” — menos idas y venidas en correo y menos errores de versión de documento.",
    resultIcon: "⚡",
  },
  {
    title: "Cobranza Automatizada",
    emoji: "💰",
    accentClass: "text-orange-600",
    borderClass: "border-orange-200",
    bgClass: "bg-orange-50",
    scenario:
      "Ejemplo: PYME con facturas en hoja o ERP y cartera vencida; hoy el cobro depende de que alguien “se acuerde” de escribir.",
    flow: [
      {
        icon: "📅",
        label: "Detecta vencimiento",
        example: "A las 48 h del vencimiento el flujo sabe quién debe y cuánto.",
        tools: ["Google Sheets · Airtable", "Facturador (webhook)", "Make / n8n"],
        color: "bg-yellow-100 text-yellow-900",
        tooltip:
          "Consultamos vencimientos en hoja/base o recibimos aviso desde tu sistema de facturación; todo programable por horarios y zonas.",
      },
      {
        icon: "📱",
        label: "Mensaje cortés y firme",
        example: "WhatsApp o correo con link de pago y texto personalizado (“Factura #2041”).",
        tools: ["WhatsApp Business API", "Correo transaccional", "Link de pago"],
        color: "bg-orange-100 text-orange-900",
        tooltip:
          "Plantillas homologadas (opt-in / horarios) y link de cobro cuando exista pasarela; se registra respuesta para el siguiente escalado.",
      },
      {
        icon: "🔄",
        label: "Escalado si no responden",
        example: "A los 3 días otra versión del mensaje; a la semana alerta al responsable financiero.",
        tools: ["Reglas por intentos", "Alertas internas", "Equipo financiero"],
        color: "bg-red-100 text-red-900",
        tooltip:
          "Tras varios intentos sin pago notificamos a finanzas o responsable con etiqueta clara (“riesgo alto”) para decisión humana.",
      },
      {
        icon: "💳",
        label: "Pago reconciliado",
        example: "Cuando Stripe/Mercado Pago/confirman pago, la factura pasa a “cobrada”.",
        tools: ["Stripe · Mercado Pago", "Webhook pasarela", "Hoja / ERP contable"],
        color: "bg-green-100 text-green-900",
        tooltip:
          "Webhook del pasarela confirma pago → marcamos factura como cobrada en hoja, CRM o herramienta contable ligera.",
      },
    ],
    resultBadge: "~−40% cartera morosa",
    resultText:
      "Retail y multisucursal: mismo ritmo de facturación, menos saldo viejo porque el seguimiento no depende solo de personas.",
    resultIcon: "💹",
  },
  {
    title: "Mesa de Ayuda",
    emoji: "🛠️",
    accentClass: "text-purple-600",
    borderClass: "border-purple-200",
    bgClass: "bg-purple-50",
    scenario:
      "Ejemplo: clínica o academia recibe preguntas por WhatsApp, correo y formulario; todo termina mezclado y sin prioridad clara.",
    flow: [
      {
        icon: "📥",
        label: "Todo llega como ticket único",
        example: 'Un cliente escribe por WhatsApp: “No puedo entrar al campus” → ticket #892 con hilo.',
        tools: ["WhatsApp Cloud API", "Gmail API · formulario", "Zendesk · Freshdesk · tabla"],
        color: "bg-purple-100 text-purple-800",
        tooltip:
          "Unificamos canales en un solo formato de ticket (helpdesk conocido o tabla operativa); el cliente sigue usando WhatsApp o mail como siempre.",
      },
      {
        icon: "🏷️",
        label: "IA clasifica y prioriza",
        example: 'Etiquetas automáticas: “acceso plataforma / urgencia media” y cola correcta.',
        tools: ["Modelo IA", "Reglas SLA", "Make / n8n"],
        color: "bg-pink-100 text-pink-800",
        tooltip:
          "Clasificamos urgencia/tema antes del agente; reglas diferenciadas dentro y fuera de horario para no incumplir SLAs públicos.",
      },
      {
        icon: "👨‍💻",
        label: "El agente recibe lista clara",
        example: 'En el panel ve solo tickets de su skill y orden por tiempo de espera.',
        tools: ["Colas por skill", "Round-robin", "Slack alertas"],
        color: "bg-rose-100 text-rose-800",
        tooltip:
          "Asignación por colas o disponibilidad; si la cola se alarga podemos alertar en Slack antes de que el cliente espere demasiado.",
      },
      {
        icon: "⭐",
        label: "Cierre medible",
        example: 'Al resolver, envía mini encuesta (“¿Resolvieron tu problema?”).',
        tools: ["Encuesta WhatsApp / enlace", "CSAT", "Sheets · BI ligero"],
        color: "bg-green-100 text-green-800",
        tooltip:
          "Encuesta breve opcional tras el cierre; resultados pueden volcar a sheet o BI para ver tendencia de satisfacción.",
      },
    ],
    resultBadge: "~−55% tiempo a 1ª respuesta",
    resultText:
      "Salud y educación B2C: menos tickets “huérfanos” y primera respuesta más rápida en picos de inscripciones o citas.",
    resultIcon: "🎯",
  },
];

export default function UseCasesSection() {
  return (
    <section id="casos" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block mb-3 px-4 py-1 text-xs font-bold tracking-widest uppercase text-brand-600 bg-brand-50 rounded-full border border-brand-100">
            Casos de uso
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Flujos que ya{" "}
            <span className="gradient-text">funcionan en PYMEs</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Lee el orden 1→4: en cada paso verás un <span className="font-semibold text-gray-700">ejemplo de negocio</span> y, debajo,{" "}
            <span className="font-semibold text-gray-700">las piezas que solemos conectar</span> (Make, n8n, CRM, WhatsApp…). Lo adaptamos a lo que ya usas;
            el desplegable solo amplía el detalle técnico si lo necesitas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {useCases.map((uc, i) => (
            <div
              key={uc.title}
              className={`card-hover animate-fade-in-up-d${Math.min(i + 1, 4)} bg-white rounded-2xl border ${uc.borderClass} shadow-sm overflow-hidden flex flex-col`}
            >
              <div className={`${uc.bgClass} px-6 py-4 border-b ${uc.borderClass}`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0 leading-none">{uc.emoji}</span>
                  <div className="min-w-0">
                    <h3 className={`text-lg font-bold ${uc.accentClass}`}>{uc.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">{uc.scenario}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="inline-flex h-1 w-8 rounded-full bg-brand-500/70" aria-hidden />
                  Cómo se ve el flujo (4 pasos)
                </p>
                <AutomationFlowDiagram
                  steps={uc.flow}
                  diagramId={uc.title}
                  regionLabel={`Flujo automatizado: ${uc.title}`}
                />
              </div>

              <div className="mx-6 mb-5 bg-gray-900 rounded-xl px-4 py-3.5 flex gap-3">
                <span className="text-2xl shrink-0">{uc.resultIcon}</span>
                <div className="min-w-0">
                  <p className="text-xs text-sky-300/90 uppercase tracking-wide font-semibold">
                    Lo que vieron clientes tipo tú
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2">
                    <span className="inline-flex shrink-0 items-center rounded-md bg-sky-400/25 px-2.5 py-1 text-xs font-extrabold tracking-tight text-sky-50 ring-1 ring-sky-300/35">
                      {uc.resultBadge}
                    </span>
                    <span className="text-sm font-semibold leading-snug text-white">{uc.resultText}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <CTAButton href="#contacto" variant="primary">
            Quiero ese flujo en mi empresa →
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
