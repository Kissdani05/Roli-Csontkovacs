interface ReviewCardProps {
  quote: string;
  name: string;
  location?: string;
  stars?: number;
}

export default function ReviewCard({ quote, name, location, stars = 5 }: ReviewCardProps) {
  return (
    <article className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-[0_12px_40px_rgba(13,27,42,0.08)] hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col gap-4 relative overflow-hidden">
      {/* Decorative quote mark */}
      <svg className="absolute top-4 right-5 w-8 h-8 text-surface" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>

      {/* Stars */}
      <div className="flex gap-0.5" aria-label={`${stars} csillag az 5-ből`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
            fill={i < stars ? "#34D399" : "#e2e8f0"} className="w-4 h-4" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-sm text-muted leading-relaxed flex-1 italic">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Attribution */}
      <div className="border-t border-border pt-3">
        <p className="text-sm font-semibold text-primary">{name}</p>
        {location && <p className="text-xs text-muted mt-0.5">{location}</p>}
      </div>
    </article>
  );
}
