"use client";
import { EVENT_FINANCIALS, totalRevenue, EventCode } from "../data/lumaData";
import { fmtUSD } from "../lib/utils";
import { SectionHeader } from "../components/SectionHeader";
import { EventBadge } from "../components/EventBadge";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const PAGE = { padding: "28px 32px", maxWidth: 1200, margin: "0 auto" };
const COMPLETED: EventCode[] = ["EC26", "AG26", "TL26"];
const STREAM_COLORS = { Ticketing: "#1E3A5F", Sponsorship: "#3D6098", "F&B": "#14B8A6", Merchandise: "#C9A84C" };

// Revenue by stream — actual vs budget (completed only)
const streamData = [
  { stream: "Ticketing",   actual: COMPLETED.reduce((s,c) => s + EVENT_FINANCIALS[c].actual.ticketing, 0),   budget: COMPLETED.reduce((s,c) => s + EVENT_FINANCIALS[c].budget.ticketing, 0) },
  { stream: "Sponsorship", actual: COMPLETED.reduce((s,c) => s + EVENT_FINANCIALS[c].actual.sponsorship, 0), budget: COMPLETED.reduce((s,c) => s + EVENT_FINANCIALS[c].budget.sponsorship, 0) },
  { stream: "F&B",         actual: COMPLETED.reduce((s,c) => s + EVENT_FINANCIALS[c].actual.fnb, 0),         budget: COMPLETED.reduce((s,c) => s + EVENT_FINANCIALS[c].budget.fnb, 0) },
  { stream: "Merchandise", actual: COMPLETED.reduce((s,c) => s + EVENT_FINANCIALS[c].actual.merchandise, 0), budget: COMPLETED.reduce((s,c) => s + EVENT_FINANCIALS[c].budget.merchandise, 0) },
];

// Stacked by event
const eventStackData = COMPLETED.map((code) => {
  const f = EVENT_FINANCIALS[code].actual;
  return { event: code, Ticketing: f.ticketing, Sponsorship: f.sponsorship, "F&B": f.fnb, Merchandise: f.merchandise };
});

// Revenue per attendee
const rpaData = COMPLETED.map((code) => {
  const fin = EVENT_FINANCIALS[code];
  const rev = totalRevenue(fin.actual);
  const budRev = totalRevenue(fin.budget);
  return {
    event: code,
    actual: fin.ticketsSold > 0 ? Math.round(rev / fin.ticketsSold) : 0,
    budget: fin.budgetTickets > 0 ? Math.round(budRev / fin.budgetTickets) : 0,
  };
});

export default function RevenuePage() {
  return (
    <div style={PAGE}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Revenue Mix</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Completed events · Echo, Afterglow, Tideline</p>
      </div>

      {/* Revenue by Stream */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px", marginBottom: 24 }}>
        <SectionHeader title="Revenue by Stream" subtitle="Actual vs budget — completed events" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={streamData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="stream" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => fmtUSD(v, true)} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={52} />
            <Tooltip formatter={(v: unknown) => fmtUSD(Number(v))} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="budget" name="Budget" fill="var(--luma-gray-200)" radius={[2,2,0,0]} maxBarSize={32} />
            <Bar dataKey="actual" name="Actual" fill="var(--navy)" radius={[2,2,0,0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stacked by Event */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px", marginBottom: 24 }}>
        <SectionHeader title="Revenue by Event" subtitle="Stream composition for completed events" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={eventStackData} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tickFormatter={(v:number) => fmtUSD(v,true)} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="event" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={60}
              tickFormatter={(v: string) => ({ EC26: "Echo", AG26: "Afterglow", TL26: "Tideline" }[v] ?? v)} />
            <Tooltip formatter={(v: unknown, name: unknown) => [fmtUSD(Number(v)), String(name)]} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            {(Object.keys(STREAM_COLORS) as (keyof typeof STREAM_COLORS)[]).map((k) => (
              <Bar key={k} dataKey={k} stackId="a" fill={STREAM_COLORS[k]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue per Attendee */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
        <SectionHeader title="Revenue per Attendee" subtitle="Actual vs budget — completed events" />
        <div style={{ marginTop: 16 }}>
          {rpaData.map((row) => {
            const max = Math.max(...rpaData.map((r) => Math.max(r.actual, r.budget)));
            return (
              <div key={row.event} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 100, flexShrink: 0 }}><EventBadge code={row.event} size="sm" /></div>
                <div style={{ flex: 1 }}>
                  {/* Budget line */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: `${(row.budget / max) * 100}%`, height: 4, background: "var(--luma-gray-200)", borderRadius: 2 }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>Budget ${row.budget}</span>
                  </div>
                  {/* Actual line */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: `${(row.actual / max) * 100}%`, height: 8, background: "var(--navy)", borderRadius: 2 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>${row.actual}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
