import { NextResponse } from "next/server";
import { getAllPatients } from "@/lib/db";

// GET /api/patients
export async function GET() {
  try {
    const patients = getAllPatients();
    return NextResponse.json({ patients });
  } catch (err) {
    console.error("[GET /api/patients]", err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}
