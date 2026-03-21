import CTAButton from "@/components/ui/CTAButton";

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
      className="py-20 bg-surface"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">
            Árak &amp; Csomagok
          </p>
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary"
          >
            Átlátható árazás, nincsenek rejtett költségek
          </h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Válaszd ki a számodra megfelelő csomagot. Kérdésed van? Hívj bátran!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col gap-6 border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-primary text-white border-primary shadow-2xl scale-105"
                  : "bg-white text-foreground border-border shadow-sm hover:shadow-md"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                  Legjobb ajánlat
                </span>
              )}

              <div>
                <h3
                  className={`text-xl font-bold mb-1 ${
                    plan.highlighted ? "text-white" : "text-primary"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.highlighted ? "text-white/70" : "text-muted"
                  }`}
                >
                  {plan.duration}
                </p>
              </div>

              <div>
                <span
                  className={`text-4xl font-extrabold ${
                    plan.highlighted ? "text-accent" : "text-primary"
                  }`}
                >
                  {plan.price}
                </span>
              </div>

              <p
                className={`text-sm leading-relaxed ${
                  plan.highlighted ? "text-white/80" : "text-muted"
                }`}
              >
                {plan.description}
              </p>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${
                      plan.highlighted ? "text-white/90" : "text-foreground"
                    }`}
                  >
                    <span
                      className={plan.highlighted ? "text-accent" : "text-accent"}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <CTAButton
                href="#idopontfoglalas"
                variant={plan.highlighted ? "outline" : "primary"}
                size="md"
                className={
                  plan.highlighted
                    ? "border-white text-white hover:bg-white hover:text-primary w-full text-center"
                    : "w-full text-center"
                }
              >
                Foglalok időpontot
              </CTAButton>
            </article>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-8">
          * Az árak tájékoztató jellegűek. Egyéni konzultáció alapján pontosítjuk.
        </p>
      </div>
    </section>
  );
}
