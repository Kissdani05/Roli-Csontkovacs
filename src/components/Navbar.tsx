"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { href: "#szolgaltatasok", label: "Szolgáltatások" },
  { href: "#rolam", label: "Rólam" },
  { href: "#arak", label: "Árak" },
  { href: "#velemenyek", label: "Vélemények" },
  { href: "#idopontfoglalas", label: "Időpontfoglalás" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const close = () => setIsOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md"
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
          className="font-bold text-xl text-primary hover:text-primary-light transition-colors"
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
            <Link
              href="#idopontfoglalas"
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              Időpontot foglalok
            </Link>
          </li>
        </ul>

        {/* Hamburger gomb (mobil) */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-md focus-visible:outline-2 focus-visible:outline-accent"
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

      {/* Mobil menü – oldalról becsúszó overlay */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <ul className="flex flex-col items-center justify-center gap-8 h-full text-lg">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-medium text-foreground hover:text-primary transition-colors"
                onClick={close}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="#idopontfoglalas"
              className="px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-colors"
              onClick={close}
            >
              Időpontot foglalok
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
