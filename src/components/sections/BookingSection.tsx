"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type CalendarValue = Date | null | [Date | null, Date | null];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleDateChange = (value: CalendarValue) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setSelectedTime(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Backend/Server Action integrálás
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="idopontfoglalas" className="py-16 md:py-32 bg-primary">
        <div className="max-w-xl mx-auto text-center px-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Köszönöm!</h2>
          <p className="text-white/80 text-lg">
            Időpont kérelmedet megkaptam. Hamarosan visszahívlak az egyeztetéshez.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="idopontfoglalas"
      className="py-16 md:py-32 bg-primary"
      aria-labelledby="booking-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-2">
            Időpont kérése
          </p>
          <h2
            id="booking-heading"
            className="text-3xl sm:text-4xl font-medium text-white"
          >
            Kérj időpontot online!
          </h2>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Válassz napot és időpontot, majd add meg az adataidat. Visszahívlak az egyeztetéshez – az időpont a visszaigazolással véglegesül.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Naptár + időpontok */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">1. Válassz napot</h3>
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
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">2. Válassz időpontot</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedTime === slot
                          ? "bg-accent text-white shadow-md"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kapcsolati adatok + Submit */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-5"
            aria-label="Időpontfoglalás űrlap"
          >
            <h3 className="text-primary font-semibold text-lg">3. Add meg adataidat</h3>

            <div className="flex flex-col gap-1">
              <label htmlFor="booking-name" className="text-sm font-medium text-foreground">
                Teljes neve <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="booking-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Pl. Kovács Éva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="booking-phone" className="text-sm font-medium text-foreground">
                Telefonszám <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="booking-phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+36 30 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="booking-email" className="text-sm font-medium text-foreground">
                Email cím
              </label>
              <input
                id="booking-email"
                type="email"
                autoComplete="email"
                placeholder="pl. nev@email.hu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="booking-note" className="text-sm font-medium text-foreground">
                Megjegyzés (pl. panasz rövid leírása)
              </label>
              <textarea
                id="booking-note"
                rows={3}
                placeholder="Röviden írd le a panaszodat..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            {selectedDate && selectedTime && (
              <div className="bg-surface rounded-lg px-4 py-3 text-sm text-primary font-medium">
                Kiválasztott időpont: {selectedDate.toLocaleDateString("hu-HU")} – {selectedTime}
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              Időpont kérése elküldése →
            </button>

            <p className="text-xs text-muted text-center">
              Az adatokat kizárólag az időpont egyeztetéséhez használom.{" "}
              <a href="/adatkezeles" className="underline hover:text-primary">
                Adatkezelési tájékoztató
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
