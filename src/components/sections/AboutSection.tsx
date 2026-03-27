import Image from "next/image";
import BookingOpenButton from "@/components/ui/BookingOpenButton";
import FadeInView from "@/components/ui/FadeInView";

export default function AboutSection() {
  return (
    <section
      id="rolam"
      className="py-16 md:py-32 bg-background"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Kép */}
          <FadeInView>
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
          </FadeInView>

          {/* Szöveg */}
          <FadeInView delay={0.2}>
          <div>
            <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">
              Rólam
            </p>
            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl font-medium text-primary mb-8"
            >
              Szia, Roli vagyok – <br className="hidden sm:block" />
              a te gerinced barátja
            </h2>
            <div className="space-y-5 text-muted leading-loose">
              <p>
                Tizenéves koromban én is szenvedtem gerincsérvessel. Hónapokig jártam
                orvostól orvosig, és mindenki azt mondta: &ldquo;éljek együtt
                vele.&rdquo; Egy csontkovács volt az, aki végül megoldotta – három
                alkalom alatt. Akkor döntöttem el, hogy én is ezt fogom csinálni.
              </p>
              <p>
                Azóta több mint 10 éve dolgozom Józsán. Minden páciensnél megkeresem
                a valódi okot – nem csak a tünetet kezelem. Mert a fájdalom mindig
                üzenetet hordoz, és azt kell megérteni és megszüntetni, nem elfedni.
              </p>
              <p>
                Ha idejössz, nem érzed majd magad &ldquo;következő páciens&rdquo;-nek.
                Időt szánok rád, meghallgatlak, és közösen tervezzük meg a gyógyulásodat.
              </p>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-foreground">
              {[
                "✅ Manuálterápiás oklevél – [Intézmény neve, év]",
                "✅ Csontkovács szakképesítés – [Intézmény neve, év]",
                "✅ Sportrehabilitációs továbbképzés – [év]",
                "✅ Gyógytornász asszisztens képesítés – [Intézmény neve, év]",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="mt-8">
              <BookingOpenButton size="lg">
                Foglalj ingyenes konzultációt →
              </BookingOpenButton>
            </div>
          </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
