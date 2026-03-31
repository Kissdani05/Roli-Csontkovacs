import BookingOpenButton from "@/components/ui/BookingOpenButton";
import FadeInView from "@/components/ui/FadeInView";

interface PricingPlan {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Alap kezelés",
    price: "12 000 Ft",
    duration: "60 perc",
    description: "Egyszeri alkalom – állapotfelmérés és első kezelés egy alkalommal.",
    features: [
      "Teljes körű felmérés",
      "Manuális kezelés",
      "Mozgásterápiai tanácsadás",
      "Házifeladat-terv",
    ],
  },
  {
    name: "Gerinc-rehabilitációs program",
    price: "54 000 Ft",
    duration: "5 × 60 perc",
    description: "5 alkalmas program – az akut panaszok megszüntetéséhez és a stabilitás kialakításához.",
    features: [
      "Minden, ami az alap kezelésben",
      "10% megtakarítás",
      "Rugalmas időpontok",
      "Telefonos konzultáció kezelések között",
      "Személyre szabott otthoni gyakorlatsor",
    ],
    highlighted: true,
  },
  {
    name: "Krónikus fájdalom megszüntetése",
    price: "96 000 Ft",
    duration: "10 × 60 perc",
    description: "10 alkalmas program – tartós megoldás régóta fennálló, visszatérő panaszokra.",
    features: [
      "Minden, ami az 5 alkalmas programban",
      "20% megtakarítás",
      "Elsőbbségi időpontfoglalás",
      "Havi haladásértékelő és felülvizsgálat",
      "Email/Messenger tanácsadás a program alatt",
    ],
  }
];

export default function PricingSection() {
  return (
    <section
      id="arak"
      className="pt-6 pb-20 md:pt-8 md:pb-36 bg-background"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-accent shrink-0" aria-hidden="true" />
            <p className="text-accent font-semibold uppercase tracking-[0.18em] text-xs">Árak &amp; Csomagok</p>
            <div className="h-px w-8 bg-accent shrink-0" aria-hidden="true" />
          </div>
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight"
          >
            Átlátható árazás, nincsenek rejtett költségek
          </h2>
          <p className="mt-5 text-muted max-w-xl mx-auto leading-relaxed text-[15px]">
            Válaszd ki a számodra megfelelő csomagot. Kérdésed van? Hívj bátran!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <FadeInView key={plan.name} delay={i * 0.12}>
            <article
              className={`relative rounded-2xl p-8 flex flex-col gap-6 border transition-all duration-300 ease-in-out ${
                plan.highlighted
                  ? "bg-primary text-white border-primary shadow-[0_20px_60px_rgba(26,75,130,0.28)] scale-105"
                  : "bg-white text-foreground border-border shadow-sm hover:shadow-[0_12px_40px_rgba(13,27,42,0.08)] hover:-translate-y-1"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                  Legjobb ajánlat
                </span>
              )}

              <div>
                <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-primary"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlighted ? "text-white/65" : "text-muted"}`}>
                  {plan.duration}
                </p>
              </div>

              <div>
                <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-accent" : "text-primary"}`}>
                  {plan.price}
                </span>
              </div>

              <p className={`text-sm leading-relaxed ${plan.highlighted ? "text-white/75" : "text-muted"}`}>
                {plan.description}
              </p>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.highlighted ? "text-white/90" : "text-foreground"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <BookingOpenButton
                variant={plan.highlighted ? "outline" : "primary"}
                size="md"
                className={
                  plan.highlighted
                    ? "border-white text-white hover:bg-white hover:text-primary w-full text-center"
                    : "w-full text-center"
                }
              >
                Foglalok időpontot
              </BookingOpenButton>
            </article>
            </FadeInView>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-8">
          * Az árak tájékoztató jellegűek. Egyéni konzultáció alapján pontosítjuk.
        </p>
      </div>
    </section>
  );
}
