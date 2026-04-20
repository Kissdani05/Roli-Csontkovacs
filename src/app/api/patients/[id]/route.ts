import { NextRequest, NextResponse } from "next/server";
import { upsertPatient, updatePatientProfile, setBlacklist, getPatientByPhone } from "@/lib/db";

export const dynamic = 'force-dynamic';

// PATCH /api/patients/[id]
// Body: { phone, name, email?, birth_date?, notes?, blacklisted?, blacklist_reason? }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id) || id <= 0)
    return NextResponse.json({ error: "Érvénytelen azonosító." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 });
  }
  const data = body as Record<string, unknown>;

  try {
    if (data.birth_date !== undefined || data.notes !== undefined || data.name !== undefined || data.email !== undefined) {
      await updatePatientProfile(id, {
        name:       typeof data.name       === "string" ? data.name       : undefined,
        email:      typeof data.email      === "string" ? data.email      : undefined,
        birth_date: typeof data.birth_date === "string" ? data.birth_date : (data.birth_date === null ? null : undefined),
        notes:      typeof data.notes      === "string" ? data.notes      : (data.notes      === null ? null : undefined),
      });
    }
    if (data.blacklisted !== undefined) {
      await setBlacklist(
        id,
        !!data.blacklisted,
        typeof data.blacklist_reason === "string" ? data.blacklist_reason : null
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[PATCH /api/patients/${id}]`, err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}

// POST /api/patients/[id] — upsert by phone (id param is ignored, phone is the key)
// Body: { phone, name, email? }
export async function POST(
  request: NextRequest,
  _ctx: { params: Promise<{ id: string }> }
) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 });
  }
  const { phone, name, email } = body as Record<string, unknown>;
  if (typeof phone !== "string" || !phone.trim())
    return NextResponse.json({ error: "A telefonszám kötelező." }, { status: 422 });
  if (typeof name !== "string" || !name.trim())
    return NextResponse.json({ error: "A név kötelező." }, { status: 422 });
  try {
    const patient = await upsertPatient(phone.trim(), name.trim(), typeof email === "string" ? email.trim() : undefined);
    return NextResponse.json({ patient });
  } catch (err) {
    console.error("[POST /api/patients/upsert]", err);
    return NextResponse.json({ error: "Adatbázis hiba." }, { status: 500 });
  }
}
