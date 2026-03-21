import ReviewCard from "@/components/ui/ReviewCard";

const reviews = [
  {
    quote:
      "Évekig szenvedtem derékfájással. Roli három kezelés után megszüntette a fájdalmamat. Hihetetlen! Mindenkinek ajánlom.",
    name: "Kovács Éva",
    stars: 5,
  },
  {
    quote:
      "Nyaki fájdalmam és a fejfájásos rohamaim megszűntek. Profizmus és empátia – ez jellemzi Rolit. Hálás vagyok!",
    name: "Nagy Péter",
    stars: 5,
  },
  {
    quote:
      "Sportolóként sokat számít a gyors rehabilitáció. Roli segítségével 2 héttel korábban térhettem vissza az edzéshez.",
    name: "Tóth Márton",
    stars: 5,
  },
  {
    quote:
      "Féltem az első kezeléstől, de Roli megnyugtatott és mindent elmagyarázott. Azóta rendszeresen járok hozzá.",
    name: "Szabó Katalin",
    stars: 5,
  },
  {
    quote:
      "Anyukámat vittem el idős kori ízületi fájdalmaival. Csodaszép eredmény, már sétálni is könnyebben tud.",
    name: "Horváth Zoltán",
    stars: 5,
  },
  {
    quote:
      "Irodai munkából fakadó gerinc- és vállproblémáim kezeltte. Roli szakértelme és személyessége egyedülálló.",
    name: "Kiss Réka",
    stars: 5,
  },
];

export default function ReviewsSection() {
  return (
    <section
      id="velemenyek"
      className="py-20 bg-white"
      aria-labelledby="reviews-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">
            Mit mondanak rólam?
          </p>
          <h2
            id="reviews-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary"
          >
            Vendégeim tapasztalatai
          </h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Több száz elégedett vendég bizalmát élvezem. Olvasd el, mit tapasztaltak!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <ReviewCard key={r.name} {...r} />
          ))}
        </div>

        {/* Google Reviews badge */}
        <div className="text-center mt-10">
          <p className="text-muted text-sm">
            Vélemények forrása:{" "}
            <span className="font-semibold text-primary">Google Értékelések</span>{" "}
            · Átlag:{" "}
            <span className="font-extrabold text-accent">5.0 / 5.0</span>
          </p>
        </div>
      </div>
    </section>
  );
}
