import Image from "next/image";
import CTAButton from "@/components/ui/CTAButton";

export default function AboutSection() {
  return (
    <section
      id="rolam"
      className="py-20 bg-white"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Kép */}
          <div className="relative aspect-[4/5] w-full max-w-sm mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/images/roli-portrait.jpg"
              alt="Roli csontkovács józsai rendelőjében"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
            />
            {/* Kis dekoratív badge */}
            <div className="absolute bottom-4 right-4 bg-accent text-white text-sm font-bold px-4 py-2 rounded-full shadow-md">
              10+ év tapasztalat
            </div>
          </div>

          {/* Szöveg */}
          <div>
            <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">
              Rólam
            </p>
            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl font-extrabold text-primary mb-6"
            >
              Szia, Roli vagyok – <br className="hidden sm:block" />
              a te gerinced barátja
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                Több mint 10 éve segítek az embereknek, hogy visszanyerjék mozgékonyságukat
                és megszabaduljanak a krónikus fájdalomtól. Csontkovász és manuálterapeuta
                képesítéssel rendelkezem, folyamatosan fejlesztem tudásomat.
              </p>
              <p>
                Hiszem, hogy a test egy egységes rendszer – nem csak a tünetet kezelem,
                hanem megkeresem és megszüntetem a valódi okot. Holisztikus szemléletemnek
                köszönhetően tartós eredményeket érek el.
              </p>
              <p>
                Józsán dolgozom, ahol barátságos, nyugodt környezetben fogadlak.
                Az első konzultáció ingyenes, ahol megismerkedünk és megbeszéljük a
                kezelési tervet.
              </p>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-foreground">
              {[
                "✅ Csontkovász szakképesítés",
                "✅ Manuálterápiás oklevél",
                "✅ Sportmasszőr képesítés",
                "✅ Rendszeres szakmai továbbképzések",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="mt-8">
              <CTAButton href="#idopontfoglalas" size="lg">
                Foglalj ingyenes konzultációt →
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
