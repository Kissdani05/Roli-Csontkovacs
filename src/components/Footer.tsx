import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="kapcsolat" className="bg-[#0D1B2A] text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">

          {/* Branding */}
          <div>
            <h2 className="text-xl font-extrabold mb-3 tracking-tight">
              Roli <span className="text-accent">Csontkovács</span>
            </h2>
            <p className="text-white/55 text-sm leading-relaxed">
              Csontkovác és manuálterapeuta Debrecen&nbsp;–&nbsp;Józsán.<br />
              Fájdalommentes életet segítek elérni – természetes úton.
            </p>
          </div>

          {/* Kapcsolat */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-accent uppercase tracking-widest">Kapcsolat</h3>
            <address className="not-italic text-sm text-white/65 space-y-2.5">
              <p className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true">
                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                </svg>
                4225 Debrecen-Józsa, Példa utca 1.
              </p>
              <p>
                <a href="tel:+36301234567" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent shrink-0" aria-hidden="true">
                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                  </svg>
                  +36 30 123 4567
                </a>
              </p>
              <p>
                <a href="mailto:roli@rolicsontkovacs.hu" className="flex items-center gap-2 hover:text-accent transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent shrink-0" aria-hidden="true">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                  roli@rolicsontkovacs.hu
                </a>
              </p>
            </address>
          </div>

          {/* Gyors linkek */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-accent uppercase tracking-widest">Gyors linkek</h3>
            <nav aria-label="Lábléc navigáció">
              <ul className="text-sm text-white/65 space-y-2">
                {[
                  { href: "#szolgaltatasok", label: "Szolgáltatások" },
                  { href: "#rolam", label: "Rólam" },
                  { href: "#arak", label: "Árak" },
                  { href: "#idopontfoglalas", label: "Időpontfoglalás" },
                  { href: "/aszf", label: "ÁSZF" },
                  { href: "/adatkezeles", label: "Adatkezelési tájékoztató" },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Google Map */}
        <div className="mb-10 rounded-xl overflow-hidden opacity-85">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2693.5!2d21.6167!3d47.6333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDM4JzAwLjAiTiAyMcKwMzcnMDAuMCJF!5e0!3m2!1shu!2shu!4v1234567890"
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Roli Csontkovács rendelője a térképen – Józsa, Debrecen"
            className="w-full"
          />
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-xs text-white/35">
          © {year} Roli Csontkovács. Minden jog fenntartva.
        </div>
      </div>
    </footer>
  );
}
