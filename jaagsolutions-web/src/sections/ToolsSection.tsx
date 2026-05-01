import { Workflow, Database, MessageCircle, Brain, GitBranch } from "lucide-react";

type Tool = {
  name: string;
  desc: string;
  accentClass: string;
  CategoryIcon: React.ElementType;
  iconColor: string;
};

const tools: Tool[] = [
  { name: "n8n", desc: "Automatización", accentClass: "border-l-orange-400", CategoryIcon: Workflow, iconColor: "text-orange-300" },
  { name: "Make", desc: "Workflows", accentClass: "border-l-violet-400", CategoryIcon: GitBranch, iconColor: "text-violet-300" },
  { name: "Zapier", desc: "Integraciones", accentClass: "border-l-brand-400", CategoryIcon: Workflow, iconColor: "text-brand-400" },
  { name: "Notion", desc: "Gestión", accentClass: "border-l-gray-400", CategoryIcon: Database, iconColor: "text-gray-400" },
  { name: "Airtable", desc: "Base de datos", accentClass: "border-l-teal-400", CategoryIcon: Database, iconColor: "text-teal-400" },
  { name: "WhatsApp API", desc: "Mensajería", accentClass: "border-l-green-400", CategoryIcon: MessageCircle, iconColor: "text-green-400" },
  { name: "OpenAI", desc: "IA generativa", accentClass: "border-l-emerald-400", CategoryIcon: Brain, iconColor: "text-emerald-400" },
  { name: "Supabase", desc: "Backend", accentClass: "border-l-green-500", CategoryIcon: Database, iconColor: "text-green-500" },
];

export default function ToolsSection() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
          Tecnologías y herramientas que utilizamos
        </p>
        <p className="text-center text-gray-600 max-w-3xl mx-auto text-sm sm:text-base mb-10 leading-relaxed">
          No te vendemos licencias sueltas: integramos tu operación con las mejores piezas del mercado y te dejamos una arquitectura clara — <span className="font-semibold text-gray-800">consultoría primero, implementación después</span>.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {tools.map((t) => (
            <div
              key={t.name}
              className={`card-hover flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-white border-l-4 ${t.accentClass} group cursor-default`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-700 leading-tight">{t.name}</p>
                <t.CategoryIcon className={`w-3.5 h-3.5 ${t.iconColor} opacity-60 flex-shrink-0`} />
              </div>
              <p className="text-xs text-gray-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
