import Image from "next/image";
import CTAButton from "@/components/ui/CTAButton";
import BookingOpenButton from "@/components/ui/BookingOpenButton";
import FadeInView from "@/components/ui/FadeInView";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Háttérkép */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Roli csontkovács józsai rendelőjében kezelés közben"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Sötétítő réteg */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Tartalom */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-3xl mx-auto pt-16">
        <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-4 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">
          Okleveles Manuálterapeuta &amp; Csontkovács · Józsa
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight mb-8">
          Eleged van a fájdalomból,{" "}
          <span className="text-accent [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]">ami korlátoz minden nap?</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/85 mb-12 leading-loose">
          Roli vagyok, okleveles manuálterapeuta Józsán. Segítek visszaállítani
          tested egyensúlyát, hogy újra fájdalommentesen mozoghass –{" "}
          gyógyszer nélkül, természetes úton.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <BookingOpenButton size="lg">
            Foglalj időpontot →
          </BookingOpenButton>
          <CTAButton href="#rolam" variant="outline" size="lg">
            Ismerj meg
          </CTAButton>
        </div>
      </div>

      {/* Lefelé nyíl */}
      <a
        href="#rolam"
        aria-label="Görgess le a Rólam szekcióhoz"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-accent transition-colors animate-bounce"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
}
