const tools = [
  { name: "n8n", emoji: "🔄", desc: "Automatización" },
  { name: "Make", emoji: "⚙️", desc: "Workflows" },
  { name: "Zapier", emoji: "⚡", desc: "Integraciones" },
  { name: "Notion", emoji: "📋", desc: "Gestión" },
  { name: "Airtable", emoji: "🗄️", desc: "Base de datos" },
  { name: "WhatsApp API", emoji: "💬", desc: "Mensajería" },
  { name: "OpenAI", emoji: "🤖", desc: "IA generativa" },
  { name: "Supabase", emoji: "🐘", desc: "Backend" },
];

export default function ToolsSection() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
          Tecnologías y herramientas que utilizamos
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {tools.map((t) => (
            <div
              key={t.name}
              className="card-hover flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50 group cursor-default"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{t.emoji}</span>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-700 leading-tight">{t.name}</p>
                <p className="text-xs text-gray-400">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
