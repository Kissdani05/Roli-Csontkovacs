interface ReviewCardProps {
  quote: string;
  name: string;
  location?: string;
  stars?: number;
}

export default function ReviewCard({ quote, name, location, stars = 5 }: ReviewCardProps) {
  return (
    <article className="bg-background rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border hover:shadow-[0_16px_48px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col gap-4">
      {/* Csillagok */}
      <div className="flex gap-1" aria-label={`${stars} csillag az 5-ből`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill={i < stars ? "#34D399" : "#e2e8f0"}
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z" />
          </svg>
        ))}
      </div>

      {/* Idézet */}
      <blockquote className="text-sm text-muted leading-relaxed flex-1 italic">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Név + helyszín */}
      <div>
        <p className="text-sm font-semibold text-primary">— {name}</p>
        {location && (
          <p className="text-xs text-muted mt-0.5">{location}</p>
        )}
      </div>
    </article>
  );
}
