type Props = {
  tag?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
};

export function SectionHeader({ tag, title, subtitle, center = false }: Props) {
  return (
    <div className={center ? "text-center" : ""}>
      {tag && (
        <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-brand bg-blue-50 rounded-full">
          {tag}
        </span>
      )}
      <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-gray-600">{subtitle}</p>}
    </div>
  );
}
