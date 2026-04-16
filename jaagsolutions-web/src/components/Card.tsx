import type { ReactNode } from "react";

type CardProps = {
  title: string;
  text: string;
  icon?: ReactNode;
};

export default function Card({ title, text, icon }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      {icon && <div className="mb-4 text-brand-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}
