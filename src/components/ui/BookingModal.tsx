"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useBookingModal } from "./BookingModalContext";

type CalendarValue = Date | null | [Date | null, Date | null];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

function BookingForm({ onClose }: { onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", note: "" });
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [billingData, setBillingData] = useState({ name: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Visszafele nem lehet foglalni: mai napon már elmúlt időpontok letiltása
  function isSlotInPast(slot: string, date: Date): boolean {
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth()    === now.getMonth() &&
      date.getDate()     === now.getDate();
    if (!isToday) return false;
    const [h, m] = slot.split(":").map(Number);
    return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
  }

  const handleDateChange = async (value: CalendarValue) => {
    if (!(value instanceof Date)) return;
    setSelectedDate(value);
    setSelectedTime(null);
    setOccupiedSlots([]);
    setSlotsLoading(true);
    try {
      const dateStr = [
        value.getFullYear(),
        String(value.getMonth() + 1).padStart(2, "0"),
        String(value.getDate()).padStart(2, "0"),
      ].join("-");
      const res = await fetch(`/api/bookings/slots?date=${dateStr}`);
      const data = await res.json();
      setOccupiedSlots(data.occupiedSlots ?? []);
    } catch {
      setOccupiedSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    setApiError(null);

    // Dátum normalizálása YYYY-MM-DD formátumba
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, "0"),
      String(selectedDate.getDate()).padStart(2, "0"),
    ].join("-");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          note: formData.note,
          date: dateStr,
          time: selectedTime,
          ...(billingDifferent && {
            billingName: billingData.name,
            billingPhone: billingData.phone,
            billingEmail: billingData.email,
          }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setApiError((data as { error?: string }).error ?? "Hiba történt, kérlek próbáld újra.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setApiError("Hálózati hiba, kérlek ellenőrizd az internetkapcsolatot.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-6">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-medium text-primary">Köszönöm!</h2>
        <p className="text-muted leading-relaxed max-w-sm">
          Időpont kérelmedet megkaptam. Hamarosan visszahívlak az egyeztetéshez.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 px-8 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-dark transition-all duration-300 ease-in-out hover:-translate-y-0.5 shadow-[0_4px_20px_rgb(14,157,184,0.35)]"
        >
          Bezárás
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Modal fejléc */}
      <div className="px-6 sm:px-8 pt-8 pb-4 border-b border-border">
        <p className="text-accent font-semibold uppercase tracking-widest text-xs mb-1">
          Időpont kérése
        </p>
        <h2 className="text-2xl sm:text-3xl font-medium text-primary">
          Kérj időpontot online!
        </h2>
        <p className="mt-2 text-muted text-sm leading-relaxed">
          Válassz napot és időpontot, majd add meg az adataidat.
        </p>
      </div>

      {/* Modal törzs */}
      <div className="px-6 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start overflow-y-auto">

        {/* Naptár + időpontok */}
        <div className="bg-surface rounded-2xl p-5">
          <h3 className="text-primary font-semibold mb-4 text-sm uppercase tracking-wide">
            1. Válassz napot
          </h3>
          <div className="booking-calendar">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()}
              locale="hu-HU"
              tileDisabled={({ date }) =>
                date.getDay() === 0 || date.getDay() === 6
              }
              className="w-full rounded-xl border-0"
            />
          </div>

          {selectedDate && (
            <div className="mt-5">
              <h3 className="text-primary font-semibold mb-3 text-sm uppercase tracking-wide">
                2. Válassz időpontot
              </h3>
              {slotsLoading ? (
                <p className="text-sm text-muted">Időpontok betöltése...</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => {
                    const taken   = occupiedSlots.includes(slot);
                    const past    = selectedDate ? isSlotInPast(slot, selectedDate) : false;
                    const blocked = taken || past;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={blocked}
                        onClick={() => !blocked && setSelectedTime(slot)}
                        title={past ? "Ez az időpont már elmúlt" : taken ? "Ez az időpont már foglalt" : undefined}
                        className={`py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          blocked
                            ? "bg-border/50 text-muted/40 cursor-not-allowed line-through"
                            : selectedTime === slot
                            ? "bg-accent text-white shadow-[0_4px_16px_rgb(14,157,184,0.35)]"
                            : "bg-border text-muted hover:bg-accent/10 hover:text-accent"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kapcsolati adatok */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          aria-label="Időpontfoglalás űrlap"
        >
          <h3 className="text-primary font-semibold text-sm uppercase tracking-wide">
            3. Add meg adataidat
          </h3>

          <div className="flex flex-col gap-1">
            <label htmlFor="modal-booking-name" className="text-sm font-medium text-foreground">
              Teljes neve <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="modal-booking-name"
              type="text"
              required
              autoComplete="name"
              placeholder="Pl. Kovács Éva"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="modal-booking-phone" className="text-sm font-medium text-foreground">
              Telefonszám <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="modal-booking-phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+36 30 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="modal-booking-email" className="text-sm font-medium text-foreground">
              Email cím
            </label>
            <input
              id="modal-booking-email"
              type="email"
              autoComplete="email"
              placeholder="pl. nev@email.hu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="modal-booking-note" className="text-sm font-medium text-foreground">
              Megjegyzés (pl. panasz rövid leírása)
            </label>
            <textarea
              id="modal-booking-note"
              rows={3}
              placeholder="Röviden írd le a panaszodat..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          {/* Számlázási adatok */}
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                className="sr-only"
                checked={billingDifferent}
                onChange={(e) => setBillingDifferent(e.target.checked)}
              />
              <div className={`w-5 h-5 rounded border-2 transition-colors duration-200 flex items-center justify-center ${
                billingDifferent ? "bg-accent border-accent" : "border-border group-hover:border-accent/50"
              }`}>
                {billingDifferent && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-muted leading-snug">
              Foglalási adataim <span className="font-medium text-foreground">nem egyeznek meg</span> a számlázási adataimmal
            </span>
          </label>

          <AnimatePresence>
            {billingDifferent && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-4 border border-accent/30 rounded-xl p-4 bg-accent/5">
                  <p className="text-xs text-accent font-semibold uppercase tracking-wide">Šmlázási adatok</p>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="billing-name" className="text-sm font-medium text-foreground">
                      Név a számlára <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="billing-name"
                      type="text"
                      required={billingDifferent}
                      autoComplete="billing name"
                      placeholder="Pl. Kiss József"
                      value={billingData.name}
                      onChange={(e) => setBillingData({ ...billingData, name: e.target.value })}
                      className="border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="billing-phone" className="text-sm font-medium text-foreground">
                      Telefonszám a számlára <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="billing-phone"
                      type="tel"
                      required={billingDifferent}
                      autoComplete="billing tel"
                      placeholder="+36 30 123 4567"
                      value={billingData.phone}
                      onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
                      className="border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="billing-email" className="text-sm font-medium text-foreground">
                      Email cím a számlára
                    </label>
                    <input
                      id="billing-email"
                      type="email"
                      autoComplete="billing email"
                      placeholder="pl. nev@email.hu"
                      value={billingData.email}
                      onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                      className="border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedDate && selectedTime && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent font-medium">
              Kiválasztott időpont:{" "}
              {selectedDate.toLocaleDateString("hu-HU")} – {selectedTime}
            </div>
          )}

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedDate || !selectedTime || loading}
            className="w-full bg-accent text-white font-semibold py-3 rounded-full hover:bg-accent-dark transition-all duration-300 ease-in-out hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 active:scale-95 shadow-[0_4px_20px_rgb(14,157,184,0.35)]"
          >
            {loading ? "Küldés..." : "Időpont kérése elküldése →"}
          </button>

          <p className="text-xs text-muted text-center">
            Az adatokat kizárólag az időpont egyeztetéséhez használom.{" "}
            <a href="/adatkezeles" className="underline hover:text-primary transition-colors">
              Adatkezelési tájékoztató
            </a>
          </p>
        </form>
      </div>
    </>
  );
}

export default function BookingModal() {
  const { isOpen, close } = useBookingModal();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-background rounded-3xl shadow-[0_32px_80px_rgb(0,0,0,0.18)] pointer-events-auto">
              {/* Bezáró gomb */}
              <button
                type="button"
                onClick={close}
                aria-label="Bezárás"
                className="absolute top-4 right-4 z-10 p-2 rounded-full text-muted hover:text-primary hover:bg-surface transition-all duration-200"
              >
                <X strokeWidth={1.5} className="w-5 h-5" />
              </button>

              <BookingForm onClose={close} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
