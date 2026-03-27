"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useBookingModal } from "@/components/ui/BookingModalContext";

const navLinks = [
  { href: "#rolam", label: "Rólam" },
  { href: "#szolgaltatasok", label: "Szolgáltatások" },
  { href: "#arak", label: "Árak" },
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

  // Megakadályozza a body görgetését nyitott menü esetén
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const handleBookingClick = () => {
    close();
    openBooking();
  };

  return (
    <>
      {/* Header – mindig legfelül (z-50) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isOpen || scrolled
            ? "bg-white shadow-md"
            : "bg-white/70 backdrop-blur-sm"
        }`}
      >
        <nav
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
          aria-label="Főnavigáció"
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-bold text-xl text-primary hover:text-primary-light transition-colors z-10"
            onClick={close}
          >
            Roli <span className="text-accent">Csontkovács</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={handleBookingClick}
                className="px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-dark transition-all duration-300 ease-in-out hover:-translate-y-0.5 shadow-[0_4px_20px_rgb(14,157,184,0.35)] cursor-pointer"
              >
                Időpontot foglalok
              </button>
            </li>
          </ul>

          {/* Hamburger gomb (mobil) */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-md focus-visible:outline-2 focus-visible:outline-accent z-10"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Menü bezárása" : "Menü megnyitása"}
          >
            <span
              className={`block h-0.5 w-6 bg-foreground transition-all duration-300 origin-center ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground transition-all duration-300 ${
                isOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground transition-all duration-300 origin-center ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Mobil menü – önálló teljes képernyős overlay (z-40, a header mögött) */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`md:hidden fixed inset-0 z-40 bg-background flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Felső padding a headernek */}
        <div className="h-16 shrink-0" />

        <ul className="flex flex-col items-center justify-center gap-6 flex-1 text-xl">
          {navLinks.map((link, i) => (
            <li
              key={link.href}
              className={`transition-all duration-300 ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
              style={{ transitionDelay: isOpen ? `${i * 60 + 100}ms` : "0ms" }}
            >
              <Link
                href={link.href}
                className="font-medium text-foreground hover:text-accent transition-colors py-2 px-4 block"
                onClick={close}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li
            className={`mt-4 transition-all duration-300 ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{ transitionDelay: isOpen ? `${navLinks.length * 60 + 100}ms` : "0ms" }}
          >
            <button
              type="button"
              onClick={handleBookingClick}
              className="px-8 py-4 bg-accent text-white rounded-full text-lg font-semibold hover:bg-accent-dark transition-all duration-300 ease-in-out shadow-[0_4px_20px_rgb(14,157,184,0.35)] cursor-pointer"
            >
              Időpontot foglalok
            </button>
          </li>
        </ul>

        {/* Dekoratív divider alul */}
        <div className="pb-12 text-center text-sm text-muted">
          Roli Csontkovács · Józsa
        </div>
      </div>
    </>
  );
}
