import { useState, useRef, useId } from "react";
import { ChevronDown } from "lucide-react";

type FaqItemProps = {
  question: string;
  answer: string;
};

export default function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const buttonId = `faq-btn-${uid}`;
  const panelId = `faq-panel-${uid}`;

  return (
    <div className={`border-b border-gray-200 last:border-b-0 transition-colors duration-200 ${open ? "bg-brand-50/40" : ""}`}>
      <button
        id={buttonId}
        className="w-full flex justify-between items-center py-5 text-left font-semibold text-gray-900 hover:text-brand-600 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{question}</span>
        <ChevronDown
          aria-hidden="true"
          className={`w-5 h-5 text-brand-500 flex-shrink-0 ml-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        ref={bodyRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{
          maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 300}px` : "0px",
        }}
      >
        <p className="pb-5 text-gray-600 leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  );
}
