type Props = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
};

export function CTAButton({ label, href, variant = "primary", className = "" }: Props) {
  const base = "inline-block px-6 py-3 rounded-lg font-semibold transition-colors duration-200 text-center";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "bg-white text-brand border border-brand hover:bg-blue-50",
    outline: "border-2 border-white text-white hover:bg-white hover:text-brand",
  };
  return (
    <a href={href} className={`${base} ${variants[variant]} ${className}`}>
      {label}
    </a>
  );
}
