import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">

          {/* Branding */}
          <div>
            <h2 className="text-xl font-bold mb-3">
              Roli <span className="text-accent">Csontkovács</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Csontkovász és manuálterapeuta Debrecen–Józsán. Fájdalommentes életet segítek elérni.
            </p>
          </div>

          {/* Kapcsolat */}
          <div>
            <h3 className="font-semibold text-base mb-3 text-accent">Kapcsolat</h3>
            <address className="not-italic text-sm text-white/80 space-y-2">
              <p>4225 Debrecen-Józsa, Példa utca 1.</p>
              <p>
                <a
                  href="tel:+36301234567"
                  className="hover:text-accent transition-colors"
                >
                  +36 30 123 4567
                </a>
              </p>
              <p>
                <a
                  href="mailto:roli@rolicsontkovacs.hu"
                  className="hover:text-accent transition-colors"
                >
                  roli@rolicsontkovacs.hu
                </a>
              </p>
            </address>
          </div>

          {/* Gyors linkek */}
          <div>
            <h3 className="font-semibold text-base mb-3 text-accent">Gyors linkek</h3>
            <nav aria-label="Lábléc navigáció">
              <ul className="text-sm text-white/80 space-y-2">
                <li>
                  <Link href="#szolgaltatasok" className="hover:text-accent transition-colors">
                    Szolgáltatások
                  </Link>
                </li>
                <li>
                  <Link href="#rolam" className="hover:text-accent transition-colors">
                    Rólam
                  </Link>
                </li>
                <li>
                  <Link href="#arak" className="hover:text-accent transition-colors">
                    Árak
                  </Link>
                </li>
                <li>
                  <Link href="#idopontfoglalas" className="hover:text-accent transition-colors">
                    Időpontfoglalás
                  </Link>
                </li>
                <li>
                  <Link href="/aszf" className="hover:text-accent transition-colors">
                    ÁSZF
                  </Link>
                </li>
                <li>
                  <Link href="/adatkezeles" className="hover:text-accent transition-colors">
                    Adatkezelési tájékoztató
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 text-center text-xs text-white/50">
          © {year} Roli Csontkovács. Minden jog fenntartva.
        </div>
      </div>
    </footer>
  );
}
