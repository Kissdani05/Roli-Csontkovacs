import type { ReactNode } from "react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <article className="bg-background rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border hover:shadow-[0_16px_48px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 ease-in-out flex flex-col gap-4">
      <div className="w-10 h-10 text-accent" aria-hidden="true">{icon}</div>
      <h3 className="text-base font-semibold text-primary leading-snug">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </article>
  );
}
