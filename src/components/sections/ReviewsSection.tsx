import ReviewCard from "@/components/ui/ReviewCard";
import FadeInView from "@/components/ui/FadeInView";

const reviews = [
  {
    quote:
      "3 éve cipeltük a derékfájásomat, gondoltam, már csak a műtét segít. Félve mentem el Rolihoz, de ő már az első kezelésen elmagyarázta, mi a valódi ok. 5 alkalom után teljesen fájdalommentesen kelek reggel. Ezt nem hagyhatom szó nélkül – mindenkinek ajánlom!",
    name: "K. Éva, 47 éves",
    location: "Debrecen",
    stars: 5,
  },
  {
    quote:
      "Heti rendszerességgel kaptam fejfájást. Orvostól orvosig jártam, mindenki tablettát adott. Roli volt az első, aki megkereste az okot: a nyaki izmaim szorítottak egy ideget. Két kezelés után a fejfájások 90%-ban megszűntek.",
    name: "N. Péter, 38 éves",
    location: "Józsa",
    stars: 5,
  },
  {
    quote:
      "Bokasérülésem után abbahagytam a futást, féltem, hogy soha nem lesz olyan mint régen. Roli nemcsak a bokámat kezelte, hanem az egész kompenzációs láncot. 6 hét alatt visszatértem a versenyfelkészüléshez.",
    name: "T. Márton, 29 éves",
    location: "Hajdúböszörmény",
    stars: 5,
  },
  {
    quote:
      "Terhesség alatt olyan erős medencefájdalmam volt, hogy nehezen tudtam járni. Roli kíméletes, biztonságos technikákkal hozta rendbe a medencémet. Azonnal éreztem a különbséget. Szülés után is visszamentem hozzá.",
    name: "Sz. Katalin, 32 éves",
    location: "Debrecen",
    stars: 5,
  },
  {
    quote:
      "Az édesanyám 72 éves, és térdfájdalma miatt alig tudott lépcsőt mászni. Nem hittük, hogy sokat segíthet, de 4 kezelés után önállóan jár fel az emeletre. Roli türelme és szakértelme idős pácienseknél is csodákat tesz.",
    name: "H. Zoltán, 44 éves",
    location: "Nyíregyháza",
    stars: 5,
  },
  {
    quote:
      "8 évig dolgoztam görnyedve a számítógép előtt, a vállam és nyakam állandóan fájt. Próbáltam masszázst, gyógytornát, semmi sem segített tartósan. Roli 3 alkalom alatt megoldotta, amit eddig senki sem tudott.",
    name: "K. Réka, 35 éves",
    location: "Debrecen",
    stars: 5,
  },
];

export default function ReviewsSection() {
  return (
    <section
      id="velemenyek"
      className="py-20 md:py-36 bg-surface"
      aria-labelledby="reviews-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-accent shrink-0" aria-hidden="true" />
            <p className="text-accent font-semibold uppercase tracking-[0.18em] text-xs">Mit mondanak rólam?</p>
            <div className="h-px w-8 bg-accent shrink-0" aria-hidden="true" />
          </div>
          <h2
            id="reviews-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight"
          >
            Vendégeim tapasztalatai
          </h2>
          <p className="mt-5 text-muted max-w-xl mx-auto leading-relaxed text-[15px]">
            Több száz elégedett vendég bizalmát élvezem. Olvasd el, mit tapasztaltak!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <FadeInView key={r.name} delay={i * 0.08}>
              <ReviewCard quote={r.quote} name={r.name} location={r.location} stars={r.stars} />
            </FadeInView>
          ))}
        </div>

        {/* Google badge */}
        <div className="text-center mt-10">
          <p className="text-muted text-sm">
            Vélemények forrása:{" "}
            <span className="font-semibold text-primary">Google Értékelések</span>{" "}
            &middot; Átlag:{" "}
            <span className="font-extrabold text-accent">5.0 / 5.0</span>
          </p>
        </div>
      </div>
    </section>
  );
}
