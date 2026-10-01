"use client";
import {
  EVENTS, EVENT_FINANCIALS, MONTHLY_REVENUE,
  totalRevenue, contribution, EventCode,
} from "./data/lumaData";
import { fmtUSD, fmtPct, variancePct } from "./lib/utils";
import { KPICard } from "./components/KPICard";
import { SectionHeader } from "./components/SectionHeader";
import { EventBadge } from "./components/EventBadge";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts";

const COMPLETED: EventCode[] = ["EC26", "AG26", "TL26"];
const EVENT_MONTHS: Record<string, string> = { Mar: "EC26", Jun: "AG26", Aug: "TL26", Nov: "NV26", Dec: "ANE26" };

const ytdRevenue = COMPLETED.reduce((s, c) => s + totalRevenue(EVENT_FINANCIALS[c].actual), 0);
const ytdBudget  = COMPLETED.reduce((s, c) => s + totalRevenue(EVENT_FINANCIALS[c].budget), 0);
const ytdContrib = COMPLETED.reduce((s, c) => s + contribution(EVENT_FINANCIALS[c].actual), 0);
const ytdTickets = COMPLETED.reduce((s, c) => s + EVENT_FINANCIALS[c].ticketsSold, 0);

const chartData = MONTHLY_REVENUE.map((m) => ({
  ...m,
  displayActual:   m.actual ?? undefined,
  displayForecast: m.actual === null ? m.budget : undefined,
}));

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {fmtUSD(p.value)}</div>
      ))}
      {label && EVENT_MONTHS[label] && <div style={{ marginTop: 6 }}><EventBadge code={EVENT_MONTHS[label]} size="sm" /></div>}
    </div>
  );
}

const PAGE = { padding: "28px 32px", maxWidth: 1200, margin: "0 auto" };

export default function OverviewPage() {
  return (
    <div style={PAGE}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Portfolio Overview</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>As of October 1, 2026 · 3 events completed, 2 upcoming</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        <KPICard label="Revenue YTD" value={fmtUSD(ytdRevenue)} delta={`${fmtPct(variancePct(ytdRevenue, ytdBudget), true)} vs budget`} positive={ytdRevenue >= ytdBudget} />
        <KPICard label="Budget Variance" value={fmtUSD(ytdRevenue - ytdBudget)} delta={fmtPct(variancePct(ytdRevenue, ytdBudget), true)} positive={ytdRevenue >= ytdBudget} />
        <KPICard label="Event Contribution" value={fmtUSD(ytdContrib)} delta={`${fmtPct(ytdContrib / ytdRevenue)} margin`} />
        <KPICard label="Tickets Sold" value={ytdTickets.toLocaleString()} sub="Echo · Afterglow · Tideline" />
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px 24px 16px", marginBottom: 32 }}>
        <SectionHeader title="Monthly Revenue" subtitle="Actual vs budget · Jan–Dec 2026" />
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => fmtUSD(v, true)} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={52} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="displayActual" name="Actual" fill="var(--navy)" radius={[2,2,0,0]} maxBarSize={32} />
            <Bar dataKey="displayForecast" name="Forecast" fill="var(--luma-gray-200)" radius={[2,2,0,0]} maxBarSize={32} />
            <Line dataKey="budget" name="Budget" stroke="var(--luma-gold)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
            <ReferenceLine x="Sep" stroke="#ccc" label={{ value: "Today →", position: "insideTopRight", fontSize: 10, fill: "var(--text-muted)" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 12px" }}>
          <SectionHeader title="Event Performance" />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              {["Event", "Status", "Capacity", "Tickets Sold", "Sell-Through", "Revenue", "vs Budget", "Contribution"].map((h) => (
                <th key={h} style={{ padding: "8px 16px", textAlign: h === "Event" || h === "Status" ? "left" : "right", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--text-muted)", background: "var(--surface)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((ev) => {
              const code = ev.code as EventCode;
              const fin = EVENT_FINANCIALS[code];
              const rev = totalRevenue(fin.actual);
              const budRev = totalRevenue(fin.budget);
              const contrib = contribution(fin.actual);
              const varPct = variancePct(rev, budRev);
              const sellThru = fin.ticketsSold > 0 ? `${((fin.ticketsSold / ev.capacity) * 100).toFixed(1)}%` : "—";
              const statusMap: Record<string, { label: string; color: string; icon: string }> = {
                completed: { label: "Completed", color: "var(--positive)", icon: "✓" },
                active:    { label: "Active",    color: "#D97706",          icon: "⟳" },
                upcoming:  { label: "Upcoming",  color: "var(--text-muted)", icon: "○" },
              };
              const st = statusMap[ev.status as string];
              return (
                <tr key={code} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px" }}><EventBadge code={code} /></td>
                  <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 11, fontWeight: 600, color: st.color }}>{st.icon} {st.label}</span></td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text-secondary)" }}>{ev.capacity.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>{fin.ticketsSold > 0 ? fin.ticketsSold.toLocaleString() : "—"}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>{sellThru}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>{rev > 0 ? fmtUSD(rev) : "—"}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: varPct >= 0 ? "var(--positive)" : "var(--negative)" }}>
                    {rev > 0 ? fmtPct(varPct, true) : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text-secondary)" }}>{contrib > 0 ? fmtUSD(contrib) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
