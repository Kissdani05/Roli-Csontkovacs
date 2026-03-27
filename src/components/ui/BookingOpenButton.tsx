"use client";

import { useBookingModal } from "./BookingModalContext";
import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline";
type Size = "sm" | "md" | "lg";

interface BookingOpenButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const baseClass =
  "inline-block font-semibold rounded-full transition-all duration-300 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:-translate-y-0.5 cursor-pointer";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-dark active:scale-95 shadow-[0_4px_20px_rgb(14,157,184,0.35)] hover:shadow-[0_8px_30px_rgb(14,157,184,0.45)]",
  outline:
    "border-2 border-accent text-accent hover:bg-accent hover:text-white active:scale-95",
};

const sizeClass: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function BookingOpenButton({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: BookingOpenButtonProps) {
  const { open } = useBookingModal();
  return (
    <button
      type="button"
      onClick={open}
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
