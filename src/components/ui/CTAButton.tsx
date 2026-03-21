import Link from "next/link";
import { type AnchorHTMLAttributes } from "react";

type Variant = "primary" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
}

const baseClass =
  "inline-block font-semibold rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-dark active:scale-95 shadow-md hover:shadow-lg",
  outline:
    "border-2 border-accent text-accent hover:bg-accent hover:text-white active:scale-95",
};

const sizeClass: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function CTAButton({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
