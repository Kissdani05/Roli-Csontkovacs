import type { ReactNode } from "react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <article className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-[0_12px_40px_rgba(26,75,130,0.10)] hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col gap-4 group">
      <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300 shrink-0" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-primary leading-snug">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </article>
  );
}
