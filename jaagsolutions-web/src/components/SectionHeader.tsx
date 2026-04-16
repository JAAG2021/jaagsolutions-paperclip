type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-gray-600">{subtitle}</p>}
    </div>
  );
}
