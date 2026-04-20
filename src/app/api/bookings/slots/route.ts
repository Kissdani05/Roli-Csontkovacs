import { NextRequest, NextResponse } from "next/server";
import { getOccupiedSlots, getBlockedSlots } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET /api/bookings/slots?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Érvénytelen dátum formátum (YYYY-MM-DD)." }, { status: 400 });
  }

  try {
    const bookedSlots  = await getOccupiedSlots(date);
    const blockedSlots = await getBlockedSlots(date);
    const occupiedSlots = Array.from(new Set([...bookedSlots, ...blockedSlots]));
    return NextResponse.json({ occupiedSlots });
  } catch (err) {
    console.error("[GET /api/bookings/slots]", err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}
