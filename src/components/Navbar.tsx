"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useBookingModal } from "@/components/ui/BookingModalContext";

const navLinks = [
  { href: "#rolam", label: "Rólam" },
  { href: "#szolgaltatasok", label: "Szolgáltatások" },
  { href: "#arak", label: "Árak" },
  { href: "#elotte-utana", label: "Előtte/Utána" },
  { href: "#gyik", label: "GYIK" },
  { href: "#velemenyek", label: "Vélemények" },
  { href: "#kapcsolat", label: "Kapcsolat" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { open: openBooking } = useBookingModal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const close = () => setIsOpen(false);
  const handleBookingClick = () => { close(); openBooking(); };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">

        {/* Main nav */}
        <header className={`transition-all duration-300 ${
          isOpen || scrolled
            ? "bg-white shadow-[0_1px_20px_rgba(13,27,42,0.08)]"
            : "bg-white/85 backdrop-blur-md"
        }`}>
          <nav
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
            aria-label="Főnavigáció"
          >
            {/* Logo */}
            <Link
              href="/"
              className="font-extrabold text-[1.15rem] tracking-tight text-primary hover:text-primary-light transition-colors z-10"
              onClick={close}
            >
              Roli <span className="text-accent">Csontkovács</span>
            </Link>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="relative text-sm font-medium text-muted hover:text-primary transition-colors group py-1"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-accent transition-all duration-300 group-hover:w-full" aria-hidden="true" />
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={handleBookingClick}
                  className="px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition-all duration-300 hover:-translate-y-px shadow-[0_2px_12px_rgba(14,157,184,0.28)] hover:shadow-[0_4px_20px_rgba(14,157,184,0.38)] cursor-pointer"
                >
                  Időpontot foglalok
                </button>
              </li>
            </ul>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-md focus-visible:outline-2 focus-visible:outline-accent z-10"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Menü bezárása" : "Menü megnyitása"}
            >
              <span className={`block h-0.5 w-6 bg-foreground transition-all duration-300 origin-center ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground transition-all duration-300 ${isOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground transition-all duration-300 origin-center ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </nav>
        </header>
      </div>

      {/* Mobile menu overlay */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`md:hidden fixed inset-0 z-40 bg-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="h-16 shrink-0" />

        <ul className="flex flex-col items-center justify-center gap-6 flex-1 text-xl">
          {navLinks.map((link, i) => (
            <li
              key={link.href}
              className={`transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
              style={{ transitionDelay: isOpen ? `${i * 60 + 100}ms` : "0ms" }}
            >
              <Link
                href={link.href}
                className="font-semibold text-foreground hover:text-accent transition-colors py-2 px-4 block"
                onClick={close}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li
            className={`mt-4 transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            style={{ transitionDelay: isOpen ? `${navLinks.length * 60 + 100}ms` : "0ms" }}
          >
            <button
              type="button"
              onClick={handleBookingClick}
              className="px-8 py-4 bg-accent text-white rounded-lg text-lg font-semibold hover:bg-accent-dark transition-all duration-300 shadow-[0_4px_20px_rgba(14,157,184,0.35)] cursor-pointer"
            >
              Időpontot foglalok
            </button>
          </li>
        </ul>

        <div className="pb-12 text-center text-sm text-muted">
          Roli Csontkovács · Józsa
        </div>
      </div>
    </>
  );
}
