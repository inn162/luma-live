"use client";
import { useState } from "react";
import { EVENTS, EVENT_FINANCIALS, totalRevenue, totalCosts, contribution, EventCode } from "../data/lumaData";
import { fmtUSD, fmtPct, variancePct } from "../lib/utils";
import { KPICard } from "../components/KPICard";
import { SectionHeader } from "../components/SectionHeader";
import { EventBadge } from "../components/EventBadge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";

const PAGE = { padding: "28px 32px", maxWidth: 1200, margin: "0 auto" };

const WATERFALL_COLORS: Record<string, string> = {
  Revenue: "#16A34A", Talent: "#1E3A5F", Production: "#3D6098", Venue: "#5B7282",
  Operations: "#70909C", Marketing: "#264D82", Other: "#9A9A9A", Contribution: "#C9A84C",
};

export default function EventsPage() {
  const [selected, setSelected] = useState<EventCode>("AG26");
  const fin = EVENT_FINANCIALS[selected];
  const ev = EVENTS.find((e) => e.code === selected)!;

  const rev   = totalRevenue(fin.actual);
  const costs = totalCosts(fin.actual);
  const contrib = contribution(fin.actual);
  const budRev = totalRevenue(fin.budget);
  const budCosts = totalCosts(fin.budget);
  const budContrib = budRev - budCosts;

  const isCompleted = ev.status === "completed";

  // Waterfall data
  const waterfallRows = [
    { name: "Revenue",    value: rev, base: 0 },
    { name: "Talent",     value: -fin.actual.talent, base: rev - fin.actual.talent },
    { name: "Production", value: -fin.actual.production, base: rev - fin.actual.talent - fin.actual.production },
    { name: "Venue",      value: -fin.actual.venue, base: rev - fin.actual.talent - fin.actual.production - fin.actual.venue },
    { name: "Operations", value: -fin.actual.operations, base: rev - fin.actual.talent - fin.actual.production - fin.actual.venue - fin.actual.operations },
    { name: "Marketing",  value: -fin.actual.marketing, base: rev - fin.actual.talent - fin.actual.production - fin.actual.venue - fin.actual.operations - fin.actual.marketing },
    { name: "Other",      value: -(fin.actual.ticketingFees + fin.actual.otherDirect), base: contrib + fin.actual.ticketingFees + fin.actual.otherDirect },
    { name: "Contribution", value: contrib, base: 0 },
  ];

  // Revenue mix
  const revStreams = [
    { name: "Ticketing",    value: fin.actual.ticketing },
    { name: "Sponsorship",  value: fin.actual.sponsorship },
    { name: "F&B",          value: fin.actual.fnb },
    { name: "Merchandise",  value: fin.actual.merchandise },
  ].filter((r) => r.value > 0);

  // Variance table
  const varianceRows = [
    { cat: "Ticketing",   actual: fin.actual.ticketing,    budget: fin.budget.ticketing },
    { cat: "Sponsorship", actual: fin.actual.sponsorship,  budget: fin.budget.sponsorship },
    { cat: "F&B",         actual: fin.actual.fnb,          budget: fin.budget.fnb },
    { cat: "Talent",      actual: -fin.actual.talent,      budget: -fin.budget.talent },
    { cat: "Production",  actual: -fin.actual.production,  budget: -fin.budget.production },
    { cat: "Venue",       actual: -fin.actual.venue,       budget: -fin.budget.venue },
    { cat: "Operations",  actual: -fin.actual.operations,  budget: -fin.budget.operations },
    { cat: "Marketing",   actual: -fin.actual.marketing,   budget: -fin.budget.marketing },
  ].filter((r) => r.budget !== 0 || r.actual !== 0);

  return (
    <div style={PAGE}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Event Economics</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Revenue, costs, and contribution by event</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value as EventCode)}
            style={{ fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", background: "#fff", cursor: "pointer" }}
          >
            {EVENTS.map((e) => <option key={e.code} value={e.code}>{e.name} {e.year}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <EventBadge code={selected} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{ev.date} · {ev.days}-day event · {ev.capacity.toLocaleString()} capacity</span>
        {!isCompleted && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#D97706", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 4, padding: "2px 8px" }}>
            {ev.status === "active" ? "⟳ In Progress — showing budget" : "○ Upcoming — showing budget"}
          </span>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        <KPICard label="Total Revenue" value={isCompleted ? fmtUSD(rev) : fmtUSD(budRev)} delta={isCompleted ? `${fmtPct(variancePct(rev, budRev), true)} vs budget` : "Budget"} positive={isCompleted ? rev >= budRev : undefined} />
        <KPICard label="Direct Costs" value={isCompleted ? fmtUSD(costs) : fmtUSD(budCosts)} delta={isCompleted ? `${fmtPct(variancePct(costs, budCosts), true)} vs budget` : "Budget"} positive={isCompleted ? costs <= budCosts : undefined} />
        <KPICard label="Contribution" value={isCompleted ? fmtUSD(contrib) : fmtUSD(budContrib)} delta={isCompleted ? `${fmtPct(contrib / rev)} margin` : `${fmtPct(budContrib / budRev)} budgeted margin`} positive={isCompleted ? contrib >= budContrib : undefined} />
        <KPICard label="Avg Ticket Yield" value={fin.avgYield > 0 ? `$${fin.avgYield}` : `$${fin.budgetAvgYield}`} delta={fin.avgYield > 0 ? `Budget $${fin.budgetAvgYield}` : "Budget"} positive={fin.avgYield > 0 ? fin.avgYield >= fin.budgetAvgYield : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Waterfall */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
          <SectionHeader title="Revenue → Contribution" subtitle={isCompleted ? "Actual" : "Budget"} />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={waterfallRows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => fmtUSD(v, true)} tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={52} />
              <Tooltip formatter={(v: unknown) => fmtUSD(Number(v))} />
              <Bar dataKey="base" stackId="a" fill="transparent" />
              <Bar dataKey="value" stackId="a" radius={[2,2,0,0]}>
                {waterfallRows.map((entry) => (
                  <Cell key={entry.name} fill={WATERFALL_COLORS[entry.name] ?? "#999"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Mix */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
          <SectionHeader title="Revenue Mix" subtitle={isCompleted ? "Actual breakdown" : "Budget breakdown"} />
          <div style={{ marginTop: 12 }}>
            {(isCompleted ? revStreams : [
              { name: "Ticketing", value: fin.budget.ticketing },
              { name: "Sponsorship", value: fin.budget.sponsorship },
              { name: "F&B", value: fin.budget.fnb },
              { name: "Merchandise", value: fin.budget.merchandise },
            ].filter(r => r.value > 0)).map((r) => {
              const total = isCompleted ? rev : budRev;
              const pct = r.value / total;
              return (
                <div key={r.name} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                    <span style={{ color: "var(--text-muted)" }}>{fmtUSD(r.value)} · {fmtPct(pct)}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--luma-gray-100)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct * 100}%`, background: "var(--navy)", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Variance Table */}
      {isCompleted && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px 12px" }}>
            <SectionHeader title="Actual vs Budget" subtitle="Line-by-line variance" />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                {["Category", "Actual", "Budget", "Variance", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 16px", textAlign: h === "Category" ? "left" : "right", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--text-muted)", background: "var(--surface)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {varianceRows.map((row) => {
                const vAmt = row.actual - row.budget;
                const vPct = row.budget !== 0 ? vAmt / Math.abs(row.budget) : 0;
                const fav = vAmt >= 0;
                return (
                  <tr key={row.cat} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 16px", fontWeight: 500 }}>{row.cat}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>{fmtUSD(Math.abs(row.actual))}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", color: "var(--text-muted)" }}>{fmtUSD(Math.abs(row.budget))}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: fav ? "var(--positive)" : "var(--negative)" }}>
                      {fmtPct(Math.abs(vPct), true).replace("+", fav ? "+" : "-")}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: fav ? "var(--positive)" : "var(--negative)" }}>
                      {fav ? "▲ Favorable" : "▼ Unfavorable"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
