import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return NextResponse.json({ error: "SMTP_USER vagy SMTP_PASS hiányzik a .env.local-ból" }, { status: 500 });
  }

  const info = {
    smtp_user: user,
    smtp_pass_length: pass.length,
    smtp_pass_prefix: pass.slice(0, 4),
    smtp_pass_suffix: pass.slice(-2),
    has_spaces: pass.includes(" "),
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    return NextResponse.json({ ok: true, message: "Gmail SMTP kapcsolat OK!", config: info });
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string; responseCode?: number; response?: string };
    return NextResponse.json({
      ok: false,
      config: info,
      error: {
        message: e.message,
        code: e.code,
        responseCode: e.responseCode,
        response: e.response,
      },
    }, { status: 500 });
  }
}
