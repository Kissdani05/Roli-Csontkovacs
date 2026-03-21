import ServiceCard from "@/components/ui/ServiceCard";

const services = [
  {
    icon: "🌅",
    title: "Reggeli merevség a derékban",
    description:
      "Nehezen kelsz fel reggel, mert a derékad beáll? Néhány célzott kezeléssel megszüntetjük az izomszabályozás zavarát, és újra rugalmasan indulhatsz napnak.",
  },
  {
    icon: "💻",
    title: "Munkából hazaérve hasogató hátfájdalom",
    description:
      "Az íróasztalnál töltött órák felhalmozzák a feszültséget a nyaki és háti izmokban. Az egész gerinc tehermentesítésével tartós könnyebbséget érsz el.",
  },
  {
    icon: "⚡",
    title: "Zsibbadó kéz, szúró nyakfájalom",
    description:
      "Ha ülés közben vagy éjjel zsibbad a kezed, a nyaki csigolyák szoríthatnak egy ideggyököt. Ez pontosan az a probléma, amit manuálterápiával meg tudok oldani.",
  },
  {
    icon: "🏃",
    title: "Sportolás közbeni fájdalom vagy régi sérülés",
    description:
      "Futás, edzés közben fáj a csípőd vagy a térded? Régi bokasérülés miatt nem mered megtolni magad? Rehabilitálom a sérülést és megelőzöm a visszaesést.",
  },
  {
    icon: "🤰",
    title: "Terhesség alatti és utáni derék- és medencefájdalom",
    description:
      "A terhesség megváltoztatja a testsúly eloszlását és a medence ízületeit. Kíméletes, biztonságos technikákkal segítek a fájdalommentes terhességben és a szülés utáni felépülésben.",
  },
  {
    icon: "🧘",
    title: "Fejfájás, amit nem old meg a fájdalomcsillapító",
    description:
      "A visszatérő feszültséges fejfájás és migrén sok esetben a nyaki izmok és csigolyák problémájából ered – nem az agyadból. A forrást kezelem, nem a tünetet.",
  },
  {
    icon: "🪑",
    title: "Görbe tartás, előreesett váll",
    description:
      "Az évek óta begörnyedve töltött munka látszik a tartásodon? Nem esztétikai kérdés – ez fájdalmak forrása. Strukturált tartáskorrekcióval visszahozom az egyenes gerincet.",
  },
  {
    icon: "👴",
    title: "Időskorúak mozgáskorlátozottsága",
    description:
      "Az ízületi kopás és csontritkulás nem jelenti azt, hogy fájdalommal kell élni. Gyengéd módszerekkel javítom a mozgékonyságot és csökkentem a fájdalmat.",
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
