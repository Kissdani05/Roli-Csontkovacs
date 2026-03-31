"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const pairs = [
  { before: "/images/before-1.png", after: "/images/after-1.png", label: "1. eset" },
  { before: "/images/before-2.png", after: "/images/after-2.png", label: "2. eset" },
  { before: "/images/before-3.png", after: "/images/after-3.png", label: "3. eset" },
  { before: "/images/before-4.png", after: "/images/after-4.png", label: "4. eset" },
];

export default function BeforeAfterSection() {
  const [current, setCurrent] = useState(0);
  const directionRef = useRef(1); // 1 = forward, -1 = back

  const go = (index: number) => {
    directionRef.current = index > current ? 1 : -1;
    setCurrent(index);
  };
  const prev = () => go((current - 1 + pairs.length) % pairs.length);
  const next = () => go((current + 1) % pairs.length);

  const leftIdx = (current - 1 + pairs.length) % pairs.length;
  const rightIdx = (current + 1) % pairs.length;

  const variants = {
    enter: (dir: number) => ({ x: dir * 120, opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir * -120, opacity: 0, scale: 0.92 }),
  };

  return (
    <section
      id="elotte-utana"
      className="pt-2 pb-6 md:pt-3 md:pb-8 bg-background overflow-hidden"
      aria-labelledby="ba-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-accent shrink-0" aria-hidden="true" />
            <p className="text-accent font-semibold uppercase tracking-[0.18em] text-xs">Eredmények</p>
            <div className="h-px w-8 bg-accent shrink-0" aria-hidden="true" />
          </div>
          <h2
            id="ba-heading"
            className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight"
          >
            Előtte &amp; Utána
          </h2>
          <p className="mt-5 text-muted max-w-xl mx-auto leading-relaxed text-[15px]">
            A képek valódi páciensek beleegyezésével készültek. Az eredmények egyénenként eltérhetnek.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative flex items-center justify-center gap-4">

          {/* Left ghost card */}
          <div
            className="hidden sm:block w-48 lg:w-64 shrink-0 rounded-2xl overflow-hidden opacity-40 scale-90 origin-right cursor-pointer select-none transition-all duration-300 hover:opacity-60"
            onClick={prev}
            aria-hidden="true"
          >
            <PairCard pair={pairs[leftIdx]} />
          </div>

          {/* Prev arrow */}
          <button onClick={prev} aria-label="Előző" className="absolute left-0 sm:hidden z-10 w-10 h-10 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-primary hover:bg-surface transition-colors">
            <ChevronLeftIcon />
          </button>
          <button onClick={prev} aria-label="Előző" className="hidden sm:flex absolute left-[calc(50%-340px)] lg:left-[calc(50%-400px)] z-10 w-11 h-11 rounded-full bg-white border border-border shadow-md items-center justify-center text-primary hover:bg-surface transition-colors">
            <ChevronLeftIcon />
          </button>

          {/* Center card — AnimatePresence for proper enter/exit */}
          <div className="w-full max-w-sm sm:max-w-lg shrink-0 relative" style={{ minHeight: 0 }}>
            <AnimatePresence initial={false} custom={directionRef.current} mode="popLayout">
              <motion.div
                key={current}
                custom={directionRef.current}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
                className="rounded-2xl overflow-hidden shadow-xl border border-border w-full"
              >
                <PairCard pair={pairs[current]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next arrow */}
          <button onClick={next} aria-label="Következő" className="absolute right-0 sm:hidden z-10 w-10 h-10 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-primary hover:bg-surface transition-colors">
            <ChevronRightIcon />
          </button>
          <button onClick={next} aria-label="Következő" className="hidden sm:flex absolute right-[calc(50%-340px)] lg:right-[calc(50%-400px)] z-10 w-11 h-11 rounded-full bg-white border border-border shadow-md items-center justify-center text-primary hover:bg-surface transition-colors">
            <ChevronRightIcon />
          </button>

          {/* Right ghost card */}
          <div
            className="hidden sm:block w-48 lg:w-64 shrink-0 rounded-2xl overflow-hidden opacity-40 scale-90 origin-left cursor-pointer select-none transition-all duration-300 hover:opacity-60"
            onClick={next}
            aria-hidden="true"
          >
            <PairCard pair={pairs[rightIdx]} />
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {pairs.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`${i + 1}. eset`}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-6 h-2 bg-accent" : "w-2 h-2 bg-border hover:bg-accent/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PairCard({ pair }: { pair: (typeof pairs)[0] }) {
  return (
    <>
      <div className="grid grid-cols-2 text-center text-[10px] font-bold uppercase tracking-widest">
        <span className="py-1.5 bg-[#eef4fa] text-muted">Előtte</span>
        <span className="py-1.5 bg-accent text-white">Utána</span>
      </div>
      <div className="grid grid-cols-2">
        <div className="relative aspect-[2/3] bg-surface">
          <Image
            src={pair.before}
            alt={`${pair.label} – előtte`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        </div>
        <div className="relative aspect-[2/3] bg-surface border-l border-border">
          <Image
            src={pair.after}
            alt={`${pair.label} – utána`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        </div>
      </div>
      <div className="py-2.5 px-4 bg-white text-center">
        <p className="text-sm font-semibold text-primary">{pair.label}</p>
      </div>
    </>
  );
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
