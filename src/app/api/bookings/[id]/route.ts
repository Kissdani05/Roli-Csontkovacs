import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus, updateBooking, updateAppearance, updateInvoiceId, getBookingById, isSlotTaken, type BookingStatus } from "@/lib/db";
import { sendBookingConfirmedToCustomer, sendBookingCancelledToCustomer, sendBookingUpdatedToCustomer } from "@/lib/email";
import { createInvoice } from "@/lib/szamlazz";

const VALID_STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];

// PUT /api/bookings/[id] – foglalás adatainak módosítása
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Érvénytelen azonosító." }, { status: 400 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Érvénytelen kérés formátum." }, { status: 400 });
  }

  const { name, phone, email, note, date, time } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) return NextResponse.json({ error: "A név megadása kötelező." }, { status: 422 });
  if (typeof phone !== "string" || !phone.trim()) return NextResponse.json({ error: "A telefonszám megadása kötelező." }, { status: 422 });
  if (typeof date !== "string" || !date.trim()) return NextResponse.json({ error: "A dátum megadása kötelező." }, { status: 422 });
  if (typeof time !== "string" || !time.trim()) return NextResponse.json({ error: "Az időpont megadása kötelező." }, { status: 422 });

  const existing = getBookingById(id);
  if (!existing) return NextResponse.json({ error: "A foglalás nem található." }, { status: 404 });

  // Ütközés ellenőrzés – csak ha dátum vagy időpont változott, és más foglalás van ott
  const slotChanged = existing.date !== date || existing.time !== time;
  if (slotChanged) {
    if (isSlotTaken(date, time)) {
      return NextResponse.json({ error: "Ez az időpont már foglalt." }, { status: 409 });
    }
  }

  try {
    const oldSlot = `${existing.date}, ${existing.time}`;
    updateBooking(id, {
      name: (name as string).trim(),
      phone: (phone as string).trim(),
      email: typeof email === "string" && email.trim() ? email.trim() : undefined,
      note: typeof note === "string" && note.trim() ? note.trim() : undefined,
      date: date as string,
      time: time as string,
    });
    const updated = getBookingById(id)!;
    // Email + .ics küldés az ügyfélnek ha van email (státusztól függetlenül)
    if (updated.email) {
      void sendBookingUpdatedToCustomer(updated, slotChanged, slotChanged ? oldSlot : undefined);
    }
    return NextResponse.json({ success: true, booking: updated });
  } catch (err) {
    console.error(`[PUT /api/bookings/${id}]`, err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] – státusz módosítása
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);

  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Érvénytelen azonosító." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen kérés formátum." }, { status: 400 });
  }

  const { status, appeared } = body as Record<string, unknown>;

  // Megjelenés rögzítése
  if (appeared !== undefined) {
    if (typeof appeared !== "boolean") {
      return NextResponse.json({ error: "Az appeared mezőnek boolean értéknek kell lennie." }, { status: 422 });
    }
    const existing = getBookingById(id);
    if (!existing) return NextResponse.json({ error: "A foglalás nem található." }, { status: 404 });
    try {
      updateAppearance(id, appeared);
      const updated = getBookingById(id)!;
      // Ha megjelent (appeared=true) → számla kiállítás
      if (appeared === true) {
        void (async () => {
          const invoiceId = await createInvoice(updated);
          if (invoiceId) updateInvoiceId(id, invoiceId);
        })();
      }
      return NextResponse.json({ success: true, booking: getBookingById(id) });
    } catch (err) {
      console.error(`[PATCH /api/bookings/${id} appeared]`, err);
      return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
    }
  }

  if (typeof status !== "string" || !VALID_STATUSES.includes(status as BookingStatus)) {
    return NextResponse.json(
      { error: `Érvénytelen státusz. Lehetséges értékek: ${VALID_STATUSES.join(", ")}` },
      { status: 422 }
    );
  }

  const existing = getBookingById(id);
  if (!existing) {
    return NextResponse.json({ error: "A foglalás nem található." }, { status: 404 });
  }

  try {
    updateBookingStatus(id, status as BookingStatus);
    const updated = getBookingById(id)!;

    // ── Email küldés ────────────────────────────────────────────────────────
    if (status === "confirmed") void sendBookingConfirmedToCustomer(updated);
    if (status === "cancelled") void sendBookingCancelledToCustomer(updated);
    return NextResponse.json({ success: true, id, status });
  } catch (err) {
    console.error(`[PATCH /api/bookings/${id}]`, err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}
