"use client";
import { useState, useMemo } from "react";

type BookingStatus = "pending" | "confirmed" | "cancelled";
type Booking = {
  id: number; date: string; time: string;
  name: string; phone: string; email: string | null; note: string | null;
  status: BookingStatus; appeared: number | null; created_at: string;
};

type PeriodType = "month" | "week";

// ── Idő helpers ───────────────────────────────────────────────────────────────
const HU_MONTHS = [
  "január","február","március","április","május","június",
  "július","augusztus","szeptember","október","november","december",
];

function getMonthRange(offset: number): [string, string] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}

function getWeekRange(offset: number): [string, string] {
  const now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // hétfő = 0
  const mon = new Date(now);
  mon.setDate(now.getDate() - day + offset * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return [mon.toISOString().slice(0, 10), sun.toISOString().slice(0, 10)];
}

function fmtPeriod(type: PeriodType, offset: number): string {
  if (type === "month") {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return `${d.getFullYear()}. ${HU_MONTHS[d.getMonth()]}`;
  }
  const [s, e] = getWeekRange(offset);
  const fmt = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${HU_MONTHS[parseInt(m, 10) - 1].slice(0, 3)} ${parseInt(d, 10)}.`;
  };
  return `${fmt(s)} – ${fmt(e)}`;
}

// ── SVG Kördiagram ────────────────────────────────────────────────────────────
function PieChart({ slices }: { slices: { value: number; color: string; label: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <p className="text-sm text-[#4C6579] py-4">Nincs adat az időszakban.</p>;

  // Ha az egyik szelet 100%, egész kört rajzolunk (nincs arc edge case)
  const paths: { d: string; color: string; pct: number; idx: number }[] = [];
  let start = -Math.PI / 2;
  const cx = 70; const cy = 70; const r = 60;

  for (let i = 0; i < slices.length; i++) {
    const pct = slices[i].value / total;
    const angle = pct * 2 * Math.PI;
    if (pct === 1) {
      // Full circle as two arcs
      paths.push({
        d: `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`,
        color: slices[i].color, pct, idx: i,
      });
    } else {
      const end = start + angle;
      const x1 = cx + r * Math.cos(start); const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);   const y2 = cy + r * Math.sin(end);
      const large = angle > Math.PI ? 1 : 0;
      paths.push({
        d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
        color: slices[i].color, pct, idx: i,
      });
      start = end;
    }
  }

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="2" />
        ))}
      </svg>
      <div className="flex flex-col gap-3">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[#4C6579]">{s.label}</span>
            <span className="font-bold text-[#1A4B82] tabular-nums">
              {Math.round((s.value / total) * 100)}%
            </span>
            <span className="text-[#4C6579] text-xs tabular-nums">({s.value} fő)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat kártya ───────────────────────────────────────────────────────────────
function StatCard({
  icon, title, value, sub, color, alert,
}: {
  icon: string; title: string; value: string | number;
  sub?: string; color: string; alert?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#C3D4E3] p-5">
      <div className="flex items-start gap-3 mb-1">
        <span className="text-2xl leading-none">{icon}</span>
        <div className="min-w-0">
          <div className="text-[11px] text-[#4C6579] font-semibold uppercase tracking-wide leading-tight">
            {title}
          </div>
          <div className="text-3xl font-black mt-0.5 tabular-nums" style={{ color }}>
            {value}
          </div>
          {sub && <div className="text-xs text-[#4C6579] mt-0.5">{sub}</div>}
        </div>
      </div>
      {alert && (
        <div className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-1.5">
          ⚠️ {alert}
        </div>
      )}
    </div>
  );
}

// ── Fő komponens ─────────────────────────────────────────────────────────────
export default function AnalyticsPanel({ bookings }: { bookings: Booking[] }) {
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [offset, setOffset] = useState(0);

  const [rangeStart, rangeEnd] =
    periodType === "month" ? getMonthRange(offset) : getWeekRange(offset);

  const stats = useMemo(() => {
    // Időszak foglalásai
    const inPeriod = bookings.filter(b => b.date >= rangeStart && b.date <= rangeEnd);
    const notCancelled = inPeriod.filter(b => b.status !== "cancelled");

    // Lemondási arány (pending kizárva — csak végleges állású)
    const decided = inPeriod.filter(b => b.status !== "pending");
    const cancelled = inPeriod.filter(b => b.status === "cancelled");
    const cancellationRate = decided.length > 0
      ? Math.round((cancelled.length / decided.length) * 100) : 0;

    // No-show arány (csak amihez van megjelenés-rögzítés)
    const confirmed = inPeriod.filter(b => b.status === "confirmed");
    const withAppeared = confirmed.filter(b => b.appeared !== null);
    const noShows = withAppeared.filter(b => b.appeared === 0);
    const noShowRate = withAppeared.length > 0
      ? Math.round((noShows.length / withAppeared.length) * 100) : 0;

    // Új vs. visszatérő (egyedi telefonszám alapján)
    const uniquePhonesInPeriod = [...new Set(notCancelled.map(b => b.phone))];
    let newCount = 0; let returningCount = 0;
    for (const phone of uniquePhonesInPeriod) {
      const hadBefore = bookings.some(
        b => b.phone === phone && b.date < rangeStart && b.status !== "cancelled"
      );
      if (hadBefore) returningCount++; else newCount++;
    }

    // Elveszett páciensek: 2+ látogatás, 6+ hónapja nem jött
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixAgo = sixMonthsAgo.toISOString().slice(0, 10);
    const today  = new Date().toISOString().slice(0, 10);

    const phoneStats = new Map<string, { name: string; lastDate: string; count: number }>();
    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      const cur = phoneStats.get(b.phone);
      if (!cur) { phoneStats.set(b.phone, { name: b.name, lastDate: b.date, count: 1 }); }
      else { phoneStats.set(b.phone, {
        name: b.name,
        lastDate: b.date > cur.lastDate ? b.date : cur.lastDate,
        count: cur.count + 1,
      }); }
    }
    const lostPatients = [...phoneStats.values()]
      .filter(p => p.count >= 2 && p.lastDate < sixAgo && p.lastDate <= today)
      .sort((a, b) => b.count - a.count);

    // Top kliensek — elmúlt 12 hónap
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const yearAgo = oneYearAgo.toISOString().slice(0, 10);

    const topMap = new Map<string, { name: string; count: number }>();
    for (const b of bookings) {
      if (b.status === "cancelled" || b.date < yearAgo) continue;
      const cur = topMap.get(b.phone);
      if (!cur) topMap.set(b.phone, { name: b.name, count: 1 });
      else topMap.set(b.phone, { name: b.name, count: cur.count + 1 });
    }
    const topClients = [...topMap.values()].sort((a, b) => b.count - a.count).slice(0, 8);

    return {
      inPeriodCount: notCancelled.length,
      cancellationRate, cancelledCount: cancelled.length, decidedCount: decided.length,
      noShowRate, noShowCount: noShows.length, withAppearedCount: withAppeared.length,
      newCount, returningCount,
      lostPatients,
      topClients,
    };
  }, [bookings, rangeStart, rangeEnd]);

  const noShowColor   = stats.noShowRate >= 5      ? "#dc2626" : stats.noShowRate >= 2      ? "#d97706" : "#059669";
  const cancelColor   = stats.cancellationRate >= 15 ? "#dc2626" : stats.cancellationRate >= 8  ? "#d97706" : "#059669";
  const lostColor     = stats.lostPatients.length > 5  ? "#dc2626" : stats.lostPatients.length > 0 ? "#d97706" : "#059669";

  return (
    <div className="space-y-6">

      {/* ── Időszak választó ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Nézet: hónap / hét */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-[#C3D4E3] shadow-sm">
          {(["month", "week"] as PeriodType[]).map(t => (
            <button key={t}
              onClick={() => { setPeriodType(t); setOffset(0); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${periodType === t ? "bg-[#1A4B82] text-white shadow-sm" : "text-[#4C6579] hover:bg-[#E7F1F8]"}`}>
              {t === "month" ? "Hónap" : "Hét"}
            </button>
          ))}
        </div>

        {/* Navigáció */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-[#C3D4E3] px-2 py-1 shadow-sm">
          <button onClick={() => setOffset(o => o - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#1A4B82] hover:bg-[#E7F1F8] font-bold text-lg">
            ‹
          </button>
          <span className="text-sm font-semibold text-[#1A4B82] min-w-[160px] text-center px-1">
            {fmtPeriod(periodType, offset)}
          </span>
          <button onClick={() => setOffset(o => Math.min(0, o + 1))}
            className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-lg transition-all
              ${offset >= 0 ? "text-[#C3D4E3] cursor-default" : "text-[#1A4B82] hover:bg-[#E7F1F8]"}`}>
            ›
          </button>
        </div>

        <span className="text-xs text-[#4C6579] bg-white border border-[#C3D4E3] rounded-lg px-3 py-1.5 shadow-sm">
          {stats.inPeriodCount} foglalás az időszakban
        </span>
      </div>

      {/* ── 4 stat kártya ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="❌" title="Lemondási arány"
          value={`${stats.cancellationRate}%`}
          sub={`${stats.cancelledCount} lemondás / ${stats.decidedCount} végleges`}
          color={cancelColor}
          alert={stats.cancellationRate >= 15 ? "Magas lemondási arány — érdemes bevezetni előre-foglalás visszaigazolást." : undefined}
        />
        <StatCard
          icon="🚫" title="No-show arány"
          value={`${stats.noShowRate}%`}
          sub={`${stats.noShowCount} nem jelent meg / ${stats.withAppearedCount} rögzített`}
          color={noShowColor}
          alert={stats.noShowRate >= 5 ? "5% felett van — érdemes e-mail emlékeztetőt bevezetni." : undefined}
        />
        <StatCard
          icon="🆕" title="Új vendégek"
          value={stats.newCount}
          sub={`${stats.returningCount} visszatérő ebben az időszakban`}
          color="#1A4B82"
        />
        <StatCard
          icon="👻" title="Elveszett páciensek"
          value={stats.lostPatients.length}
          sub="2+ látogatás, 6+ hónapja nem jött"
          color={lostColor}
          alert={stats.lostPatients.length > 3 ? "Fontold meg egy visszacsalogató üzenet küldését." : undefined}
        />
      </div>

      {/* ── Két oszlop: pie + top kliensek ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Új vs. visszatérő kördiagram */}
        <div className="bg-white rounded-2xl border border-[#C3D4E3] p-6">
          <div className="font-bold text-[#1A4B82] mb-1">Új vs. visszatérő vendégek</div>
          <div className="text-xs text-[#4C6579] mb-4">Egyedi páciensek az időszakban</div>
          <PieChart slices={[
            { value: stats.returningCount, color: "#1A4B82", label: "Visszatérő" },
            { value: stats.newCount,       color: "#0E9DB8", label: "Új vendég" },
          ]} />
          {stats.newCount > 0 && stats.returningCount < stats.newCount && (
            <div className="mt-4 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3 py-2">
              ⚠️ Több az új vendég, mint a visszatérő — érdemes odafigyelni az utánkövetésre.
            </div>
          )}
        </div>

        {/* Top kliensek */}
        <div className="bg-white rounded-2xl border border-[#C3D4E3] p-6">
          <div className="font-bold text-[#1A4B82] mb-1">Top kliensek</div>
          <div className="text-xs text-[#4C6579] mb-4">Legtöbbet visszajáró páciensek az elmúlt 12 hónapban</div>
          {stats.topClients.length === 0
            ? <p className="text-sm text-[#4C6579]">Nincs elég adat.</p>
            : (
              <div className="space-y-3">
                {stats.topClients.map((c, i) => {
                  const pct = Math.round((c.count / (stats.topClients[0]?.count || 1)) * 100);
                  return (
                    <div key={i} className="flex items-center gap-3 group">
                      <span className="text-xs font-bold text-[#4C6579] w-5 text-right tabular-nums shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-sm font-semibold text-[#1A4B82] truncate min-w-0 flex-1">
                        {c.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 h-2 rounded-full bg-[#E7F1F8] overflow-hidden">
                          <div className="h-full rounded-full bg-[#1A4B82] transition-all"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#1A4B82] tabular-nums w-14 text-right">
                          {c.count}× volt
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
      </div>

      {/* ── Elveszett páciensek lista ───────────────────────────────────── */}
      {stats.lostPatients.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#C3D4E3] p-6">
          <div className="font-bold text-[#1A4B82] mb-1">Elveszett páciensek részletei</div>
          <div className="text-xs text-[#4C6579] mb-4">
            2 vagy több látogatás, de {">"}6 hónapja nem foglalt — {stats.lostPatients.length} fő
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {stats.lostPatients.map((p, i) => {
              const [y, m] = p.lastDate.split("-");
              const lastFmt = `${y}. ${HU_MONTHS[parseInt(m, 10) - 1]}`;
              return (
                <div key={i} className="bg-[#F4F8FB] rounded-xl border border-[#C3D4E3] p-3">
                  <div className="text-sm font-semibold text-[#1A4B82] truncate">{p.name}</div>
                  <div className="text-xs text-[#4C6579] mt-1">{p.count} látogatás összesen</div>
                  <div className="text-xs text-[#4C6579]">Utoljára: {lastFmt}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
