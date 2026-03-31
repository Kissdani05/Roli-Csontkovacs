import type { Booking } from "./db";

// ── Számlázz.hu Agent XML API ─────────────────────────────────────────────────
// Docs: https://docs.szamlazz.hu/
const SZAMLAZZ_URL = "https://www.szamlazz.hu/szamla/";

function isoDate(date?: Date): string {
  return (date ?? new Date()).toISOString().slice(0, 10);
}

function buildXml(b: Booking): string {
  const apiKey    = process.env.SZAMLAZZ_API_KEY ?? "";
  const itemName  = process.env.INVOICE_ITEM_NAME ?? "Csontkovács kezelés";
  const price     = parseInt(process.env.INVOICE_PRICE_GROSS ?? "10000", 10);
  const prefix    = process.env.INVOICE_PREFIX ?? "ROLI";
  const payMethod = process.env.INVOICE_PAY_METHOD ?? "Készpénz"; // Készpénz | Átutalás | Bankkártya
  const today     = isoDate();

  // TAM = tárgyi adómentes (egészségügyi szolgáltatás) → nettó = bruttó
  return `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.szamlazz.hu/xmlszamla https://www.szamlazz.hu/szamla/docs/xmlszamla.xsd">
  <beallitasok>
    <szamlaagentkulcs>${escXml(apiKey)}</szamlaagentkulcs>
    <eszamla>true</eszamla>
    <szamlaLetoltes>false</szamlaLetoltes>
    <valaszVerzio>2</valaszVerzio>
  </beallitasok>
  <fejlec>
    <keltDatum>${today}</keltDatum>
    <teljesitesDatum>${b.date}</teljesitesDatum>
    <fizetesiHataridoDatum>${today}</fizetesiHataridoDatum>
    <fizmod>${escXml(payMethod)}</fizmod>
    <penznem>HUF</penznem>
    <szamlaNyelve>hu</szamlaNyelve>
    <megjegyzes>${escXml(b.note ?? "")}</megjegyzes>
    <rendelesSzam>${b.id}</rendelesSzam>
    <dijbekero>false</dijbekero>
    <szamlaszamElotag>${escXml(prefix)}</szamlaszamElotag>
  </fejlec>
  <elado>
    <emailReplyto></emailReplyto>
    <emailTargy>Számla – Roli Csontkovács</emailTargy>
    <emailSzoveg>Mellékletben küldjük a számlát. Köszönjük!</emailSzoveg>
  </elado>
  <vevo>
    <nev>${escXml(b.billing_name ?? b.name)}</nev>
    <irsz>0000</irsz>
    <telepules>-</telepules>
    <cim>-</cim>
    <email>${escXml(b.billing_email ?? b.email ?? "")}</email>
    <sendEmail>${(b.billing_email ?? b.email) ? "true" : "false"}</sendEmail>
    <telefonszam>${escXml(b.billing_phone ?? b.phone)}</telefonszam>
    <megjegyzes></megjegyzes>
  </vevo>
  <tetelek>
    <tetel>
      <megnevezes>${escXml(itemName)}</megnevezes>
      <mennyiseg>1</mennyiseg>
      <mennyisegiEgyseg>alkalom</mennyisegiEgyseg>
      <nettoEgysegar>${price}</nettoEgysegar>
      <afakulcs>TAM</afakulcs>
      <nettoErtek>${price}</nettoErtek>
      <afaErtek>0</afaErtek>
      <bruttoErtek>${price}</bruttoErtek>
    </tetel>
  </tetelek>
</xmlszamla>`;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Számlakiállítás ──────────────────────────────────────────────────────────
// Visszatér a számlaszámmal, vagy null ha hiba
export async function createInvoice(b: Booking): Promise<string | null> {
  const apiKey = process.env.SZAMLAZZ_API_KEY;
  if (!apiKey) {
    console.warn("[szamlazz] SZAMLAZZ_API_KEY nincs beállítva — számla kihagyva.");
    return null;
  }

  // Ha már volt számla ehhez a foglaláshoz, ne állítsunk ki újat
  if (b.invoice_id) {
    console.log(`[szamlazz] Számla már létezik a foglaláshoz: ${b.invoice_id}`);
    return b.invoice_id;
  }

  const xml = buildXml(b);

  try {
    const form = new FormData();
    form.append(
      "action-xmlagentxmlfile",
      new Blob([xml], { type: "text/xml" }),
      "szamla.xml"
    );

    const res = await fetch(SZAMLAZZ_URL, { method: "POST", body: form });

    const text = await res.text();

    if (!res.ok) {
      console.error(`[szamlazz] HTTP ${res.status}:`, text.slice(0, 500));
      return null;
    }

    // valaszVerzio=2 → XML válasz (<xmlszamlavalasz>)
    // Egyszerű regex kinyerés — nincs szükség xml parser dependenciára
    const sikeres  = /<sikeres>(.*?)<\/sikeres>/i.exec(text)?.[1]?.trim();
    const szamlasz = /<szamlaszam>(.*?)<\/szamlaszam>/i.exec(text)?.[1]?.trim();
    const hibakod  = /<hibakod>(.*?)<\/hibakod>/i.exec(text)?.[1]?.trim();
    const hibauzenet = /<hibauzenet>(.*?)<\/hibauzenet>/i.exec(text)?.[1]?.trim();

    if (sikeres !== "true" || !szamlasz) {
      console.error(`[szamlazz] Sikertelen számla kiállítás (kód: ${hibakod}): ${hibauzenet}`);
      console.error("[szamlazz] Teljes válasz:", text.slice(0, 800));
      return null;
    }

    console.log(`[szamlazz] Számla kiállítva: ${szamlasz} → ${b.name} (booking #${b.id})`);
    return szamlasz;
  } catch (err) {
    console.error("[szamlazz] Hálózati hiba:", err);
    return null;
  }
}
