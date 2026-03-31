import Image from "next/image";
import CTAButton from "@/components/ui/CTAButton";
import BookingOpenButton from "@/components/ui/BookingOpenButton";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Roli csontkovács kezelés közben"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Directional gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#060F1B]/92 via-[#09182A]/72 to-[#09182A]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060F1B]/55 via-transparent to-transparent" />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-40 pb-16">
          <div className="max-w-2xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-accent shrink-0" aria-hidden="true" />
              <p className="text-accent text-sm font-semibold uppercase tracking-[0.2em]">
                Okleveles Manuálterapeuta &amp; Csontkovács · Józsa
              </p>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold text-white leading-[1.05] tracking-tight mb-8">
              Fájdalomtól<br />
              <span className="text-accent">szabadon.</span>
            </h1>

            {/* Sub-copy */}
            <p className="text-xl text-white/75 leading-relaxed mb-10 max-w-xl">
              Roli vagyok, csontkovács és manuálterapeuta Józsán. Megkeresem
              a fájdalmad valódi okát, és természetes úton megszüntetem –
              gyógyszer nélkül.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <BookingOpenButton size="lg">
                Foglalj időpontot →
              </BookingOpenButton>
              <CTAButton href="#rolam" variant="outline" size="lg">
                Ismerj meg
              </CTAButton>
            </div>

          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-10 border-t border-white/10 bg-[#0D1B2A]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {[
              { num: "10+", label: "Év tapasztalat" },
              { num: "500+", label: "Elégedett páciens" },
              { num: "5.0 ★", label: "Google értékelés" },
              { num: "100%", label: "Természetes módszer" },
            ].map((stat) => (
              <div key={stat.num} className="py-5 px-6 text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">{stat.num}</p>
                <p className="text-[11px] text-white/50 mt-0.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
