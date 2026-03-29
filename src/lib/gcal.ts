import { google } from "googleapis";
import type { Booking } from "./db";

// ── Auth (Service Account) ────────────────────────────────────────────────────
function getCalendar() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calId = process.env.GOOGLE_CALENDAR_ID;

  if (!email || !key || !calId) {
    console.warn("[gcal] Google Calendar env vars not configured — skipping.");
    return null;
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return { cal: google.calendar({ version: "v3", auth }), calId };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Combine YYYY-MM-DD + HH:MM into a local ISO datetime string for Budapest (UTC+1/+2) */
function toDateTime(date: string, time: string): string {
  // Use the local timezone string for Europe/Budapest
  return `${date}T${time}:00`;
}

// ── Create event ──────────────────────────────────────────────────────────────
export async function createCalendarEvent(booking: Booking): Promise<string | null> {
  const cfg = getCalendar();
  if (!cfg) return null;

  const { cal, calId } = cfg;

  // Session length: 60 minutes
  const [h, m] = booking.time.split(":").map(Number);
  const endH = Math.floor((h * 60 + m + 60) / 60) % 24;
  const endM = (h * 60 + m + 60) % 60;
  const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

  const timeZone = "Europe/Budapest";

  try {
    const res = await cal.events.insert({
      calendarId: calId,
      requestBody: {
        summary: `🦴 ${booking.name}`,
        description: [
          `Telefon: ${booking.phone}`,
          booking.email ? `E-mail: ${booking.email}` : "",
          booking.note  ? `Megjegyzés: ${booking.note}` : "",
        ].filter(Boolean).join("\n"),
        start: { dateTime: toDateTime(booking.date, booking.time), timeZone },
        end:   { dateTime: toDateTime(booking.date, endTime),      timeZone },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 1440 }, // 1 nap
            { method: "popup", minutes: 120  }, // 2 óra
            { method: "popup", minutes: 30   }, // 30 perc
            { method: "email", minutes: 1440 },
            { method: "email", minutes: 120  },
            { method: "email", minutes: 30   },
          ],
        },
      },
    });

    return res.data.id ?? null;
  } catch (err) {
    console.error("[gcal] Failed to create event:", err);
    return null;
  }
}

// ── Delete event ──────────────────────────────────────────────────────────────
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const cfg = getCalendar();
  if (!cfg) return;

  try {
    await cfg.cal.events.delete({ calendarId: cfg.calId, eventId });
  } catch (err) {
    console.error("[gcal] Failed to delete event:", err);
  }
}

// ── Update event (reschedule) ──────────────────────────────────────────────────
export async function updateCalendarEvent(eventId: string, booking: Booking): Promise<void> {
  const cfg = getCalendar();
  if (!cfg) return;

  const [h, m] = booking.time.split(":").map(Number);
  const endH = Math.floor((h * 60 + m + 60) / 60) % 24;
  const endM = (h * 60 + m + 60) % 60;
  const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  const timeZone = "Europe/Budapest";

  try {
    await cfg.cal.events.patch({
      calendarId: cfg.calId,
      eventId,
      requestBody: {
        summary: `🦴 ${booking.name}`,
        description: [
          `Telefon: ${booking.phone}`,
          booking.email ? `E-mail: ${booking.email}` : "",
          booking.note  ? `Megjegyzés: ${booking.note}` : "",
        ].filter(Boolean).join("\n"),
        start: { dateTime: toDateTime(booking.date, booking.time), timeZone },
        end:   { dateTime: toDateTime(booking.date, endTime),      timeZone },
      },
    });
  } catch (err) {
    console.error("[gcal] Failed to update event:", err);
  }
}
