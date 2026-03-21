"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Fájni fog a kezelés?",
    answer:
      "A legtöbb embertől ezt hallom először! Az igazság az, hogy a kezelés általában nem fájdalmas. Előfordulhat egy kis nyomásérzet vagy reccsenés, de ez teljesen normális és ártalmatlan. A fájdalomhatárod figyelembevételével dolgozom – ha valami kellemetlennek érzed, mindig szólj és módosítom a technikát.",
  },
  {
    question: "Mit vegyek fel a kezelésre?",
    answer:
      "Kényelmes, laza ruházatot javaslok – pl. sport nadrág és póló. Kerüld a szűk farmert vagy a merev öltözéket, mert ezek akadályozhatják a mozgásvizsgálatot. Cipőt és zoknit le kell venni a kezelés során.",
  },
  {
    question: "Kell vinnem korábbi orvosi leleteket, röntgent?",
    answer:
      "Ha van korábbi MRI, röntgen vagy más lelet a panaszoddal kapcsolatban, mindenképpen hozd magaddal – sokat segít az állapotfelmérésben. Ha nincs, az sem probléma, mert saját vizsgálattal is pontosan fel tudom mérni a helyzetet.",
  },
  {
    question: "Hány kezelés szükséges?",
    answer:
      "Ez egyénenként változik. Akut (friss) panaszoknál már 1-3 kezelés látványos javulást hozhat. Krónikus, régóta fennálló problémáknál 5-10 alkalom javasolt. Az első kezelés után együtt megbeszéljük az egyéni kezelési tervet.",
  },
  {
    question: "Mikor NEM ajánlott a kezelés?",
    answer:
      "Csontritkulás előrehaladott esetén, friss csonttörés, aktív gyulladás, daganatos betegség vagy vérzékenység esetén nem végzek kezelést. Ha bizonytalan vagy, konzultálj előbb az orvosoddal, illetve vedd fel velem a kapcsolatot és közösen döntjük el.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="gyik"
      className="py-20 bg-white"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">
            Kérdések &amp; Válaszok
          </p>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary"
          >
            Gyakran Ismételt Kérdések
          </h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Első alkalommal sokakban merülnek fel kérdések. Íme a leggyakoribbak –
            ha a tiédet nem látod, hívj bátran!
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-border rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left font-semibold text-primary hover:bg-surface transition-colors"
              >
                <span>{faq.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === i ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-5 text-sm text-muted leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
