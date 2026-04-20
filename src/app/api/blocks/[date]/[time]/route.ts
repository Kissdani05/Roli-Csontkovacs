import { NextRequest, NextResponse } from "next/server";
import { removeBlock } from "@/lib/db";

export const dynamic = 'force-dynamic';

// DELETE /api/blocks/[date]/[time]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string; time: string }> }
) {
  const { date, time } = await params;
  try {
    removeBlock(date, decodeURIComponent(time));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/blocks]", err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}
