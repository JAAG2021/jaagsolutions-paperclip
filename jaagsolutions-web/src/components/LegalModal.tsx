import { useEffect } from "react";

type LegalModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function LegalModal({ title, onClose, children }: LegalModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        <div className="sticky top-0 bg-white rounded-t-2xl flex items-center justify-between px-8 py-5 border-b border-gray-100 z-10">
          <h2 id="legal-modal-title" className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-8 py-6 prose prose-gray max-w-none text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
