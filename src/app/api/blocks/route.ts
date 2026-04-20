import { NextRequest, NextResponse } from "next/server";
import { getAllBlocks, insertBlock } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET /api/blocks
export async function GET() {
  try {
    const blocks = getAllBlocks();
    return NextResponse.json({ blocks });
  } catch (err) {
    console.error("[GET /api/blocks]", err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}

// POST /api/blocks – { date, time, reason }
export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Érvénytelen kérés formátum." }, { status: 400 });
  }
  const { date, time, reason } = body as Record<string, unknown>;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return NextResponse.json({ error: "Érvénytelen dátum." }, { status: 422 });
  if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time))
    return NextResponse.json({ error: "Érvénytelen időpont." }, { status: 422 });
  const reasonStr = typeof reason === "string" && reason.trim() ? reason.trim() : "Blokkolt";
  try {
    const block = insertBlock(date, time, reasonStr);
    return NextResponse.json({ block }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/blocks]", err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}
