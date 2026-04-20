import { NextRequest, NextResponse } from "next/server";
import { insertBooking, getAllBookings, isSlotTaken, isSlotBlocked, isPhoneBlacklisted, isEmailBlacklisted } from "@/lib/db";
import {
  sendBookingPendingToCustomer,
  sendNewBookingToAdmin,
  sendAdminCreatedBookingToCustomer,
  sendAdminCreatedBookingToAdmin,
} from "@/lib/email";

export const dynamic = 'force-dynamic';

// POST /api/bookings – új foglalás mentése
export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen kérés formátum." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Érvénytelen adatok." }, { status: 400 });
  }

  const { name, phone, email, note, date, time, adminCreated, billingName, billingPhone, billingEmail } = body as Record<string, unknown>;

  // Kötelező mezők ellenőrzése
  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Kötelező mező: Teljes neve (min. 2 karakter)." }, { status: 422 });
  }
  if (typeof phone !== "string" || phone.trim().length < 6) {
    return NextResponse.json({ error: "Kötelező mező: Telefonszám." }, { status: 422 });
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Kötelező mező: Dátum (YYYY-MM-DD formátum)." }, { status: 422 });
  }
  if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "Kötelező mező: Időpont (HH:MM formátum)." }, { status: 422 });
  }
  if (email !== undefined && email !== "" && typeof email !== "string") {
    return NextResponse.json({ error: "Érvénytelen email cím." }, { status: 422 });
  }

  try {
    // Feketelistás-ellenőrzés
    if (await isPhoneBlacklisted(phone.trim())) {
      return NextResponse.json({ error: "Ez a telefonszám le van tiltva a rendszerből." }, { status: 403 });
    }
    if (typeof email === "string" && email.trim() && await isEmailBlacklisted(email.trim())) {
      return NextResponse.json({ error: "Ez az e-mail cím le van tiltva a rendszerből." }, { status: 403 });
    }

    // Blokkolt időpont ellenőrzés
    if (await isSlotBlocked(date, time)) {
      return NextResponse.json({ error: "Ez az időpont blokkolt, nem foglalható." }, { status: 409 });
    }

    // Ütközés ellenőrzés – ha az időpont már foglalt, visszautasítjuk
    if (await isSlotTaken(date, time)) {
      return NextResponse.json(
        { error: "Ez az időpont már foglalt. Kérlek válassz másikat." },
        { status: 409 }
      );
    }

    const booking = await insertBooking({
      name: name.trim(),
      phone: phone.trim(),
      email: typeof email === "string" ? email.trim() || undefined : undefined,
      note: typeof note === "string" ? note.trim() || undefined : undefined,
      date,
      time,
      billingName: typeof billingName === "string" ? billingName.trim() || undefined : undefined,
      billingPhone: typeof billingPhone === "string" ? billingPhone.trim() || undefined : undefined,
      billingEmail: typeof billingEmail === "string" ? billingEmail.trim() || undefined : undefined,
    });

    // ── Email küldés ────────────────────────────────────────────────────────
    if (adminCreated === true) {
      // Admin hozta létre: ügyfél kap megerősítési emailt, admin is kap másolatot
      void sendAdminCreatedBookingToCustomer(booking);
      void sendAdminCreatedBookingToAdmin(booking);
    } else {
      // Ügyfél foglalt: függőben visszaigazolás az ügyfélnek + értesítő az adminnak
      void sendBookingPendingToCustomer(booking);
      void sendNewBookingToAdmin(booking);
      // Naptárba csak elfogadás után kerül (PATCH → confirmed)
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Adatbázis hiba, kérlek próbáld újra." }, { status: 500 });
  }
}

// GET /api/bookings – összes foglalás (admin)
export async function GET() {
  try {
    const bookings = await getAllBookings();
    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}
