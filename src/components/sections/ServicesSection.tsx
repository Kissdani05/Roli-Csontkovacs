import ServiceCard from "@/components/ui/ServiceCard";

const services = [
  {
    icon: "🦴",
    title: "Derékfájás kezelése",
    description:
      "Manuális technikákkal oldja fel a lumbális gerinc feszültségét és helyreállítja a mozgástartományt.",
  },
  {
    icon: "🧠",
    title: "Nyakfájás és fejfájás",
    description:
      "Nyaki csigolyák korrekciója, izomfeszültség oldása – enyhíti a migrénes és feszültséges fejfájást.",
  },
  {
    icon: "🦵",
    title: "Ízületi panaszok",
    description:
      "Váll-, csípő-, térd- és bokaízületek mozgékonyságának javítása manuálterápiával.",
  },
  {
    icon: "🧘",
    title: "Tartáskorrekció",
    description:
      "Helytelen testtartásból fakadó fájdalmak megszüntetése, megelőző kezelési terv kidolgozása.",
  },
  {
    icon: "⚡",
    title: "Oszteopátia",
    description:
      "A test egészét figyelembe vevő holisztikus szemléletű kezelés – csontok, izmok, fascia.",
  },
  {
    icon: "🏃",
    title: "Sportolók kezelése",
    description:
      "Sportsérülések utáni rehabilitáció, teljesítménynövelés, megelőző mozgásterápiai tanácsadás.",
  },
  {
    icon: "🤰",
    title: "Kismama kezelés",
    description:
      "Terhesség alatti és szülés utáni mozgásszervi panaszok kíméletes, biztonságos kezelése.",
  },
  {
    icon: "👴",
    title: "Időskorúak terápiája",
    description:
      "Arthritis, csontritkulás melletti mozgásmegőrzés, fájdalomcsökkentés gyengéd módszerekkel.",
  },
];

export default function ServicesSection() {
  return (
    <section
      id="szolgaltatasok"
      className="py-20 bg-surface"
      aria-labelledby="services-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">
            Miben segíthetek?
          </p>
          <h2
            id="services-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary"
          >
            Milyen panaszokkal fordulhatsz hozzám?
          </h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Széles körű tapasztalattal rendelkezem az alábbi panaszok kezelésében.
            Ha nem látod a tiédet, hívj bátran!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
