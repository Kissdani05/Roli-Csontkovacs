import nodemailer from "nodemailer";
import type { Booking } from "./db";

// ── Transporter (lazy singleton) ─────────────────────────────────────────────
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[email] SMTP env vars not configured — emails will be skipped.");
    return null;
  }

  _transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  return _transporter;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const HU_MONTHS = [
  "január","február","március","április","május","június",
  "július","augusztus","szeptember","október","november","december",
];
function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}. ${HU_MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}.`;
}
function fmtSlot(iso: string, time: string): string {
  return `${fmtDate(iso)}, ${time}`;
}

const FROM  = () => process.env.SMTP_FROM  ?? "Roli Csontkovács <noreply@example.com>";
const ADMIN = () => process.env.ADMIN_EMAIL ?? "";

// ── Base email wrapper ─────────────────────────────────────────────────────
function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{margin:0;padding:0;background:#F4F8FB;font-family:sans-serif;color:#2d3748}
  .card{max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07)}
  .header{background:#1A4B82;padding:28px 32px}
  .header h1{margin:0;color:#fff;font-size:20px;font-weight:700}
  .header p{margin:4px 0 0;color:#C3D4E3;font-size:13px}
  .body{padding:28px 32px}
  .body p{margin:0 0 14px;font-size:15px;line-height:1.6}
  .slot{display:inline-block;background:#E7F1F8;color:#1A4B82;font-weight:700;font-size:18px;padding:10px 20px;border-radius:10px;margin:8px 0 18px}
  .table{width:100%;border-collapse:collapse;margin:14px 0}
  .table td{padding:8px 10px;font-size:14px;border-bottom:1px solid #E7F1F8}
  .table td:first-child{color:#4C6579;width:120px}
  .badge-green{display:inline-block;background:#d1fae5;color:#065f46;padding:5px 14px;border-radius:20px;font-weight:700;font-size:14px}
  .badge-red{display:inline-block;background:#fee2e2;color:#991b1b;padding:5px 14px;border-radius:20px;font-weight:700;font-size:14px}
  .footer{background:#F4F8FB;padding:18px 32px;font-size:12px;color:#4C6579;border-top:1px solid #E7F1F8}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>Roli Csontkovács</h1>
    <p>${title}</p>
  </div>
  <div class="body">${body}</div>
  <div class="footer">Ha kérdésed van, keress bátran. — Roli</div>
</div>
</body>
</html>`;
}

// ── Send helper ────────────────────────────────────────────────────────────
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!to) return;
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({ from: FROM(), to, subject, html });
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
  }
}

// ── 1. Ügyfél visszaigazolás (függőben) ──────────────────────────────────────
export async function sendBookingPendingToCustomer(b: Booking): Promise<void> {
  if (!b.email) return;
  const html = wrap("Foglalás visszaigazolás", `
    <p>Kedves <strong>${b.name}</strong>!</p>
    <p>Megkaptuk foglalásodat az alábbi időpontra:</p>
    <div class="slot">📅 ${fmtSlot(b.date, b.time)}</div>
    <p>Hamarosan felveszem veled a kapcsolatot és visszaigazolom az időpontot.</p>
    <p>Addig is, ha bármilyen kérdésed van, keress bátran.</p>
    <p>Üdvözlettel,<br/><strong>Roli</strong></p>
  `);
  await send(b.email, "✉️ Foglalásod megérkezett — hamarosan visszajelzek", html);
}

// ── 2. Admin értesítő (új foglalás, ügyfél által) ─────────────────────────────
export async function sendNewBookingToAdmin(b: Booking): Promise<void> {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const html = wrap("Új foglalás érkezett", `
    <p>Új időpontfoglalás érkezett a weboldalon.</p>
    <div class="slot">📅 ${fmtSlot(b.date, b.time)}</div>
    <table class="table">
      <tr><td>Név</td><td><strong>${b.name}</strong></td></tr>
      <tr><td>Telefon</td><td>${b.phone}</td></tr>
      <tr><td>E-mail</td><td>${b.email ?? "—"}</td></tr>
      ${b.note ? `<tr><td>Megjegyzés</td><td><em>${b.note}</em></td></tr>` : ""}
    </table>
    <p>Lépj be az admin felületre a megerősítéshez.</p>
  `);
  await send(adminEmail, `📬 Új foglalás: ${b.name} – ${fmtSlot(b.date, b.time)}`, html);
}

// ── 3. Ügyfél: megerősítve ────────────────────────────────────────────────────
export async function sendBookingConfirmedToCustomer(b: Booking): Promise<void> {
  if (!b.email) return;
  const html = wrap("Időpontod megerősítve", `
    <p>Kedves <strong>${b.name}</strong>!</p>
    <p>Örömmel értesítelek, hogy megerősítettem az időpontodat:</p>
    <div class="slot">✅ ${fmtSlot(b.date, b.time)}</div>
    <p><span class="badge-green">Megerősítve</span></p>
    <p>Várlak az időpontban! Ha valami közbejön, kérlek jelezd előre.</p>
    <p>Üdvözlettel,<br/><strong>Roli</strong></p>
  `);
  await send(b.email, "✅ Időpontod megerősítve", html);
}

// ── 4. Ügyfél: elutasítva ─────────────────────────────────────────────────────
export async function sendBookingCancelledToCustomer(b: Booking): Promise<void> {
  if (!b.email) return;
  const html = wrap("Időpontod visszautasítva", `
    <p>Kedves <strong>${b.name}</strong>!</p>
    <p>Sajnos az alábbi időpontot nem tudom megerősíteni:</p>
    <div class="slot">❌ ${fmtSlot(b.date, b.time)}</div>
    <p><span class="badge-red">Visszautasítva</span></p>
    <p>Foglalj nyugodtan új időpontot a weboldalon, szívesen várlak!</p>
    <p>Üdvözlettel,<br/><strong>Roli</strong></p>
  `);
  await send(b.email, "❌ Időpontod visszautasítva", html);
}

// ── 5. Ügyfél: admin hozta létre az időpontot ────────────────────────────────
export async function sendAdminCreatedBookingToCustomer(b: Booking): Promise<void> {
  if (!b.email) return;
  const html = wrap("Időpontot rögzítettem számodra", `
    <p>Kedves <strong>${b.name}</strong>!</p>
    <p>Rögzítettem egy időpontot számodra:</p>
    <div class="slot">📅 ${fmtSlot(b.date, b.time)}</div>
    <p><span class="badge-green">Megerősítve</span></p>
    <p>Ha valami közbejön, kérlek jelezd előre.</p>
    <p>Üdvözlettel,<br/><strong>Roli</strong></p>
  `);
  await send(b.email, `📅 Időpontod: ${fmtSlot(b.date, b.time)}`, html);
}

// ── 6. Admin értesítő (admin hozta létre) ────────────────────────────────────
export async function sendAdminCreatedBookingToAdmin(b: Booking): Promise<void> {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const html = wrap("Időpont létrehozva (admin)", `
    <p>Az admin felületen új időpontot hoztak létre:</p>
    <div class="slot">📅 ${fmtSlot(b.date, b.time)}</div>
    <table class="table">
      <tr><td>Név</td><td><strong>${b.name}</strong></td></tr>
      <tr><td>Telefon</td><td>${b.phone}</td></tr>
      <tr><td>E-mail</td><td>${b.email ?? "—"}</td></tr>
      ${b.note ? `<tr><td>Megjegyzés</td><td><em>${b.note}</em></td></tr>` : ""}
    </table>
  `);
  await send(adminEmail, `🗓️ Admin foglalás: ${b.name} – ${fmtSlot(b.date, b.time)}`, html);
}
