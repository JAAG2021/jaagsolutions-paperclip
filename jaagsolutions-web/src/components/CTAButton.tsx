import type { ReactNode } from "react";
import { trackEvent } from "../hooks/analytics.ts";

type CTAButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  gaLabel?: string;
};

export default function CTAButton({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  className = "",
  disabled,
  gaLabel,
}: CTAButtonProps) {
  const base = "inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 px-6 py-3 text-base";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    secondary: "border-2 border-brand-600 text-brand-600 hover:bg-brand-50",
    text: "text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline px-0 py-0",
  };
  const classes = `${base} ${variants[variant]} ${className}`;

  const label = gaLabel ?? (typeof children === "string" ? children : undefined);

  function handleClick() {
    trackEvent("cta_click", { event_label: label ?? "cta", variant });
    onClick?.();
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={handleClick}>
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled ? true : undefined}
      className={`${classes} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
