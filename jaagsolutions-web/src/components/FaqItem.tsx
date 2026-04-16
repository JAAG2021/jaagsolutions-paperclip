import { useState } from "react";

type Props = {
  question: string;
  answer: string;
};

export function FaqItem({ question, answer }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full flex justify-between items-center py-5 text-left font-semibold text-gray-900 hover:text-brand transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="ml-4 text-brand text-xl">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="pb-5 text-gray-600">{answer}</p>}
    </div>
  );
}
