import { useState } from "react";

type FaqItemProps = {
  question: string;
  answer: string;
};

export default function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full flex justify-between items-center py-5 text-left font-semibold text-gray-900 hover:text-brand-600 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="ml-4 text-xl text-brand-600">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="pb-5 text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}
