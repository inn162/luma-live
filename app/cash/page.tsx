"use client";
import { CASH_FLOW, UPCOMING_PAYMENTS } from "../data/lumaData";
import { fmtUSD } from "../lib/utils";
import { KPICard } from "../components/KPICard";
import { SectionHeader } from "../components/SectionHeader";
import { EventBadge } from "../components/EventBadge";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, Cell,
} from "recharts";

const PAGE = { padding: "28px 32px", maxWidth: 1200, margin: "0 auto" };

const cashOnHand = 2096000;
const ytdCollected = CASH_FLOW.filter(m => !m.forecast).reduce((s, m) => s + Math.max(m.inflow ?? 0, 0), 0);
const upcomingTotal = UPCOMING_PAYMENTS.reduce((s, p) => s + Math.abs(p.amount), 0);
const forecastEndCash = CASH_FLOW[CASH_FLOW.length - 1].balance;

const EVENT_CASH_CYCLE = [
  { period: "Oct '25", description: "Early ticket sales begin", direction: "in",  symbol: "+$$$" },
  { period: "Dec '25", description: "Sponsorship deposit received",  direction: "in",  symbol: "+$$" },
  { period: "Jan '26", description: "Artist deposits paid",          direction: "out", symbol: "−$$$" },
  { period: "Mar–May", description: "Ticket sales accelerate",       direction: "in",  symbol: "+$$$$$" },
  { period: "Jun '26", description: "Event — production payments",   direction: "out", symbol: "−$$$$" },
  { period: "Jul '26", description: "Final vendor settlements",      direction: "out", symbol: "−$$" },
];

export default function CashPage() {
  return (
    <div style={PAGE}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Cash & Forecast</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>As of October 1, 2026 · Forecast through December</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        <KPICard label="Cash on Hand" value={fmtUSD(cashOnHand)} sub="As of Oct 1, 2026" />
        <KPICard label="YTD Collected" value={fmtUSD(ytdCollected)} sub="Jan–Sep 2026" />
        <KPICard label="Upcoming Outflows" value={fmtUSD(upcomingTotal)} sub="Next 90 days" positive={false} />
        <KPICard label="Forecast End Cash" value={fmtUSD(forecastEndCash)} delta="After Nova + Aurora NYE" positive={forecastEndCash > 0} />
      </div>

      {/* Cash Flow Chart */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px", marginBottom: 24 }}>
        <SectionHeader title="Monthly Cash Flow" subtitle="Net flow (bars) and running balance (line) · dashed = forecast" />
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={CASH_FLOW} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => fmtUSD(v, true)} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={56} />
            <Tooltip formatter={(v: unknown) => fmtUSD(Number(v))} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <ReferenceLine y={0} stroke="var(--border)" />
            <ReferenceLine x="Sep" stroke="#ccc" strokeDasharray="4 2" label={{ value: "Today →", position: "insideTopRight", fontSize: 10, fill: "var(--text-muted)" }} />
            <Bar dataKey="net" name="Net Cash Flow" radius={[2,2,0,0]} maxBarSize={28}>
              {CASH_FLOW.map((entry, i) => (
                <Cell key={i} fill={entry.net >= 0 ? "#16A34A" : "#DC2626"} opacity={entry.forecast ? 0.5 : 1} />
              ))}
            </Bar>
            <Line dataKey="balance" name="Running Balance" stroke="var(--navy)" strokeWidth={2}
              dot={false} strokeDasharray="0" connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Event Cash Cycle */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
          <SectionHeader title="Event Cash Cycle" subtitle="Afterglow 26 — cash timing vs event timing" />
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, fontStyle: "italic" }}>
              A transaction knows when it happened. Management needs to know what it belongs to.
            </div>
            {EVENT_CASH_CYCLE.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 64, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "var(--text-muted)", paddingTop: 1 }}>{step.period}</div>
                <div style={{ width: 2, background: "var(--border)", alignSelf: "stretch", flexShrink: 0, marginTop: 2, marginBottom: -8, borderRadius: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{step.description}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: step.direction === "in" ? "var(--positive)" : "var(--negative)", flexShrink: 0 }}>
                  {step.symbol}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payments */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
          <SectionHeader title="Upcoming Payments" subtitle="Forecast outflows — next 90 days" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date", "Description", "Amount", "Event"].map((h) => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: h === "Amount" ? "right" : "left", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {UPCOMING_PAYMENTS.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 8px", color: "var(--text-secondary)", fontWeight: 500, fontSize: 12 }}>{p.date}</td>
                  <td style={{ padding: "10px 8px" }}>{p.description}</td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: "var(--negative)" }}>{fmtUSD(p.amount)}</td>
                  <td style={{ padding: "10px 8px" }}><EventBadge code={p.event} size="sm" /></td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid var(--border)", background: "var(--surface)" }}>
                <td colSpan={2} style={{ padding: "10px 8px", fontWeight: 700, fontSize: 12 }}>Total</td>
                <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: "var(--negative)" }}>{fmtUSD(-upcomingTotal)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
