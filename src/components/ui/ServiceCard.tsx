interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <article className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3">
      <span className="text-4xl" role="img" aria-hidden="true">{icon}</span>
      <h3 className="text-base font-bold text-primary">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </article>
  );
}
