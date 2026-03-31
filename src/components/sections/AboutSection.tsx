import Image from "next/image";
import BookingOpenButton from "@/components/ui/BookingOpenButton";
import FadeInView from "@/components/ui/FadeInView";

export default function AboutSection() {
  return (
    <section
      id="rolam"
      className="py-20 md:py-36 bg-background"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* Photo */}
          <FadeInView>
            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto lg:mx-0">
              {/* Offset background frame */}
              <div className="absolute inset-0 rounded-2xl bg-surface translate-x-4 translate-y-4" aria-hidden="true" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full">
                <Image
                  src="/images/roli-portrait.jpg"
                  alt="Roli csontkovács józsai rendelőjében"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
              </div>
              {/* Experience badge */}
              <div className="absolute -bottom-5 -right-5 bg-primary text-white px-5 py-3 rounded-xl shadow-xl flex flex-col items-center">
                <span className="text-2xl font-extrabold text-accent leading-none">10+</span>
                <span className="text-[11px] text-white/75 mt-0.5 uppercase tracking-wider">év tapasztalat</span>
              </div>
            </div>
          </FadeInView>

          {/* Text */}
          <FadeInView delay={0.15}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-accent shrink-0" aria-hidden="true" />
                <p className="text-accent font-semibold uppercase tracking-[0.18em] text-xs">
                  Rólam
                </p>
              </div>
              <h2
                id="about-heading"
                className="text-3xl sm:text-4xl font-extrabold text-primary leading-tight tracking-tight mb-8"
              >
                Szia, Roli vagyok –<br className="hidden sm:block" />
                a te gerinced barátja
              </h2>
              <div className="space-y-5 text-muted leading-relaxed text-[15px]">
                <p>
                  Tizenéves koromban én is szenvedtem gerincsérvessel. Hónapokig jártam
                  orvostól orvosig, és mindenki azt mondta: <em>&ldquo;éljek együtt
                  vele.&rdquo;</em> Egy csontkovács volt az, aki végül megoldotta – három
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

              {/* Credential badges */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  "Manuálterápiás oklevél",
                  "Csontkovács szakképesítés",
                  "Sportrehabilitációs továbbképzés",
                  "Gyógytornász asszisztens képesítés",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 bg-surface rounded-lg px-3.5 py-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent shrink-0" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
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
