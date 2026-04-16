import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

type FaqItemProps = {
  question: string;
  answer: string;
};

export default function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`border-b border-gray-200 last:border-b-0 transition-colors duration-200 ${open ? "bg-brand-50/40" : ""}`}>
      <button
        className="w-full flex justify-between items-center py-5 text-left font-semibold text-gray-900 hover:text-brand-600 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-brand-500 flex-shrink-0 ml-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
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
