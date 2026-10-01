"use client";
import { useState } from "react";
import { EVENTS, EVENT_FINANCIALS, TICKET_TIERS, AG26_CUMULATIVE, EventCode } from "../data/lumaData";
import { fmtUSD, fmtPct } from "../lib/utils";
import { KPICard } from "../components/KPICard";
import { SectionHeader } from "../components/SectionHeader";
import { EventBadge } from "../components/EventBadge";
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Cell,
} from "recharts";

const PAGE = { padding: "28px 32px", maxWidth: 1200, margin: "0 auto" };
const TIER_COLORS = ["#264D82","#3D6098","#5B7282","#70909C","#9A9A9A"];

export default function TicketingPage() {
  const [selected, setSelected] = useState<EventCode>("AG26");
  const fin = EVENT_FINANCIALS[selected];
  const ev = EVENTS.find((e) => e.code === selected)!;
  const tiers = TICKET_TIERS[selected];
  const sellThru = fin.ticketsSold > 0 ? fin.ticketsSold / ev.capacity : 0;
  const budgetSellThru = fin.budgetTickets / ev.capacity;

  // Cumulative chart: only available for AG26 currently
  const showCumulative = selected === "AG26";

  // Tier comparison data
  const tierData = tiers.map((t) => ({
    tier: t.tier.replace("Early Bird ", "EB ").replace("Final Release", "Final").replace("GA Tier ", "GA T"),
    sold: t.sold,
    budget: t.budget,
    avgPrice: t.avgPrice,
  }));

  return (
    <div style={PAGE}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Ticketing</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Sales trajectory, tier mix, and pace vs forecast</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <select value={selected} onChange={(e) => setSelected(e.target.value as EventCode)}
            style={{ fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", background: "#fff", cursor: "pointer" }}>
            {EVENTS.map((e) => <option key={e.code} value={e.code}>{e.name} {e.year}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <EventBadge code={selected} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Capacity: {ev.capacity.toLocaleString()}</span>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        <KPICard label="Capacity" value={ev.capacity.toLocaleString()} />
        <KPICard
          label="Tickets Sold"
          value={fin.ticketsSold > 0 ? fin.ticketsSold.toLocaleString() : "—"}
          delta={fin.ticketsSold > 0 ? `Budget: ${fin.budgetTickets.toLocaleString()}` : `Budget: ${fin.budgetTickets.toLocaleString()}`}
        />
        <KPICard
          label="Sell-Through"
          value={fin.ticketsSold > 0 ? fmtPct(sellThru) : "—"}
          delta={`Budget: ${fmtPct(budgetSellThru)}`}
          positive={fin.ticketsSold > 0 ? sellThru >= budgetSellThru : undefined}
        />
        <KPICard
          label="Avg Ticket Yield"
          value={fin.avgYield > 0 ? `$${fin.avgYield}` : "—"}
          delta={`Budget: $${fin.budgetAvgYield}`}
          positive={fin.avgYield > 0 ? fin.avgYield >= fin.budgetAvgYield : undefined}
        />
      </div>

      {/* Cumulative Sales Chart */}
      {showCumulative && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px", marginBottom: 24 }}>
          <SectionHeader title="Cumulative Ticket Sales — Afterglow 26" subtitle="Actual vs forecast from first sale to event date" />
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={AG26_CUMULATIVE} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v: unknown) => Number(v).toLocaleString()} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area dataKey="actual" name="Actual" fill="var(--navy)" fillOpacity={0.12} stroke="var(--navy)" strokeWidth={2} dot={false} />
              <Line dataKey="forecast" name="Forecast" stroke="var(--luma-gold)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {!showCumulative && fin.ticketsSold > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px", marginBottom: 24 }}>
          <SectionHeader title="Sales Progress" subtitle="Tickets sold vs budget" />
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
              <span>Sold: {fin.ticketsSold.toLocaleString()}</span>
              <span style={{ color: "var(--text-muted)" }}>Budget: {fin.budgetTickets.toLocaleString()} · Capacity: {ev.capacity.toLocaleString()}</span>
            </div>
            <div style={{ height: 10, background: "var(--luma-gray-100)", borderRadius: 5, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", height: "100%", width: `${(fin.budgetTickets/ev.capacity)*100}%`, background: "var(--luma-gray-200)", borderRadius: 5 }} />
              <div style={{ position: "absolute", height: "100%", width: `${sellThru*100}%`, background: "var(--navy)", borderRadius: 5 }} />
            </div>
          </div>
        </div>
      )}

      {/* Tier Breakdown */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
        <SectionHeader title="Ticket Tier Breakdown" subtitle="Sold vs budget by ticket type" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={tierData} layout="vertical" margin={{ top: 0, right: 80, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v:number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
            <YAxis dataKey="tier" type="category" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} width={90} />
            <Tooltip formatter={(v: unknown, name: unknown) => [Number(v).toLocaleString(), name === "sold" ? "Sold" : "Budget"]} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="budget" name="Budget" fill="var(--luma-gray-200)" radius={[0,2,2,0]} />
            <Bar dataKey="sold" name="Sold" fill="var(--navy)" radius={[0,2,2,0]}>
              {tierData.map((_, i) => <Cell key={i} fill={TIER_COLORS[i % TIER_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Avg price table */}
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tiers.map((t, i) => (
            <div key={t.tier} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 14px", fontSize: 12 }}>
              <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>{t.tier}</div>
              <div style={{ fontWeight: 700, color: TIER_COLORS[i % TIER_COLORS.length] }}>{fmtUSD(t.avgPrice)}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 10 }}>avg price</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
