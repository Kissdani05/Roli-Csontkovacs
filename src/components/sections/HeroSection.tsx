import Image from "next/image";
import CTAButton from "@/components/ui/CTAButton";

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
      <div className="absolute inset-0 bg-primary/70" />

      {/* Tartalom */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-3xl mx-auto pt-16">
        <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-4">
          Csontkovács &amp; Manuálterapeuta · Józsa
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          Élj fájdalom nélkül –{" "}
          <span className="text-accent">természetes módon</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/85 mb-10 leading-relaxed">
          Derék-, nyak- és ízületi panaszaid kezelése szakértő kézzel,
          gyógyszermentes megközelítéssel. Gyere el és érezd a változást!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <CTAButton href="#idopontfoglalas" size="lg">
            Foglalj időpontot →
          </CTAButton>
          <CTAButton href="#rolam" variant="outline" size="lg">
            Ismerj meg
          </CTAButton>
        </div>
      </div>

      {/* Lefelé nyíl */}
      <a
        href="#szolgaltatasok"
        aria-label="Görgess le a szolgáltatásokhoz"
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
