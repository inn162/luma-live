"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ComposedChart,
  Line,
} from "recharts";
import { EVENTS } from "../data/events";
import { ALL_EVENT_ECONOMICS } from "../model/eventModel";
import { TICKET_BILLINGS_BY_MONTH } from "../data/budgetData";
import { fmtUSD, fmtPct, eventColor } from "../lib/utils";
import type { EventEconomics } from "../model/types";

function parseLocalDate(s: string): Date {
  const [yr, mo, dy] = s.split("-").map(Number);
  return new Date(yr, mo - 1, dy);
}

const MONTH_LABELS: Record<string, string> = {
  "2025-11": "Nov '25", "2026-01": "Jan", "2026-02": "Feb", "2026-03": "Mar",
  "2026-04": "Apr", "2026-05": "May", "2026-06": "Jun", "2026-07": "Jul",
  "2026-08": "Aug", "2026-09": "Sep",
};

export function EventEconomicsSection() {
  const [activeCode, setActiveCode] = useState("SOL26");
  const econ = ALL_EVENT_ECONOMICS[activeCode];
  const event = EVENTS.find((e) => e.code === activeCode)!;
  const color = eventColor(activeCode);

  return (
    <div>
      {/* Event tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {EVENTS.map((ev) => {
          const isActive = ev.code === activeCode;
          return (
            <button
              key={ev.code}
              onClick={() => setActiveCode(ev.code)}
              style={{
                padding: "7px 14px",
                border: `2px solid ${isActive ? eventColor(ev.code) : "#E2E8F0"}`,
                background: isActive ? `${eventColor(ev.code)}12` : "#fff",
                color: isActive ? eventColor(ev.code) : "#64748B",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: isActive ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {ev.name}
              <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.7 }}>{ev.code}</span>
            </button>
          );
        })}
      </div>

      {/* Event header */}
      <div style={{ marginBottom: 20, padding: "14px 20px", background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 8, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>{event.name}</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>
            {parseLocalDate(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            &nbsp;·&nbsp; Capacity {event.capacity.toLocaleString()}
            &nbsp;·&nbsp; Year {event.year}
          </div>
        </div>
        <StatusBadge status={event.status} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
          <MetaChip label="Presale opened" value={parseLocalDate(event.presaleOpen).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
          <MetaChip label="Final settlement" value={parseLocalDate(event.lastSettlement).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 28 }}>
        <EconKPI label="Revenue (Accrual)" value={fmtUSD(econ.revenueActual, true)} sub="Recognized at event date" color={color} />
        <EconKPI label="Budget Revenue" value={fmtUSD(econ.budgetRevenue, true)} sub="Per original plan" />
        <EconKPI
          label="vs Budget"
          value={fmtPct((econ.revenueActual - econ.budgetRevenue) / econ.budgetRevenue, true)}
          sub="Revenue variance"
          negative={econ.revenueActual < econ.budgetRevenue}
          positive={econ.revenueActual >= econ.budgetRevenue}
        />
        <EconKPI label="Tickets Sold" value={econ.ticketsSold.toLocaleString()} sub={`of ${event.capacity.toLocaleString()} capacity`} />
        <EconKPI label="Rev / Attendee" value={fmtUSD(econ.revenuePerAttendee)} sub="Average yield" />
        <EconKPI
          label="Contribution"
          value={fmtUSD(econ.contribution, true)}
          sub={`Margin: ${fmtPct(econ.revenueActual > 0 ? econ.contribution / econ.revenueActual : 0)}`}
          positive={econ.contribution > 0}
          negative={econ.contribution < 0}
        />
      </div>

      {/* Three cost ledgers */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Three Cost Ledgers</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
          <LedgerCard label="Booked" sub="P&L accrual charge" value={fmtUSD(econ.directCostsBooked, true)} color="#0F172A" />
          <LedgerCard label="Paid" sub="Cash settled" value={fmtUSD(econ.directCostsPaid, true)} color="#FF3EA5" />
          <LedgerCard
            label="Remaining"
            sub="AP outstanding"
            value={fmtUSD(econ.directCostsRemaining, true)}
            color={econ.directCostsRemaining > 0 ? "#D97706" : "#16A34A"}
          />
        </div>
        <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>
          Booked reflects P&L charge (accrual basis). Paid is cash out. Remaining = Booked minus Paid (accounts payable).
          These three numbers serve different management questions and <em>intentionally</em> don't reconcile.
        </p>
      </div>

      {/* Cost breakdown by category */}
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>Cost Breakdown by Category</SectionLabel>
        <CostBreakdownChart econ={econ} color={color} />
      </div>

      {/* Accrual vs cash timeline (only for events with billing data) */}
      {TICKET_BILLINGS_BY_MONTH[activeCode] && (
        <div>
          <SectionLabel>Revenue: Accrual vs Cash Collections</SectionLabel>
          <BillingsChart eventCode={activeCode} color={color} />
          <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>
            Bars show monthly ticket billings (cash received). The spike marks when revenue is <em>recognized</em> on
            the income statement — at event date, not at sale date. This timing gap is the core of accrual accounting.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function EconKPI({ label, value, sub, color, positive, negative }: {
  label: string; value: string; sub: string; color?: string; positive?: boolean; negative?: boolean;
}) {
  return (
    <div style={{ padding: "12px 14px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6 }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color: color ?? (positive ? "#16A34A" : negative ? "#DC2626" : "#0F172A") }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function LedgerCard({ label, sub, value, color }: { label: string; sub: string; value: string; color: string }) {
  return (
    <div style={{ padding: "14px 16px", background: "#fff", border: "2px solid #E2E8F0", borderRadius: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>{sub}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color }}>{value}</div>
    </div>
  );
}

function CostBreakdownChart({ econ, color }: { econ: EventEconomics; color: string }) {
  const data = econ.ledgers.map((l) => ({
    name: l.category,
    booked: l.booked / 1000,
    paid: l.paid / 1000,
    remaining: l.remaining / 1000,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `$${v}K`} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          formatter={(value: unknown, name: unknown) => [fmtUSD((value as number) * 1000, true), String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
          contentStyle={{ fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 6 }}
        />
        <Bar dataKey="booked" name="Booked" fill="#0F172A" opacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={24} />
        <Bar dataKey="paid" name="Paid" fill={color} opacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={24} />
        <Bar dataKey="remaining" name="Remaining" fill="#D97706" opacity={0.6} radius={[2, 2, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function BillingsChart({ eventCode, color }: { eventCode: string; color: string }) {
  const raw = TICKET_BILLINGS_BY_MONTH[eventCode] ?? [];
  const data = raw.map((d) => ({
    label: MONTH_LABELS[d.month] ?? d.month,
    billings: d.billings / 1000,
    accrual: d.accrual / 1000,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `$${v}K`} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          formatter={(value: unknown, name: unknown) => [fmtUSD((value as number) * 1000, true), String(name)]}
          contentStyle={{ fontSize: 12, border: "1px solid #E2E8F0", borderRadius: 6 }}
        />
        <Bar dataKey="billings" name="Cash Billings" fill={color} opacity={0.65} radius={[2, 2, 0, 0]} maxBarSize={30} />
        <Bar dataKey="accrual" name="Accrual Recognition" fill="#FF3EA5" opacity={0.8} radius={[2, 2, 0, 0]} maxBarSize={30} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" as const }}>
      <div style={{ fontSize: 9, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#334155", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    completed: { label: "Completed", color: "#16A34A" },
    settling: { label: "Settling", color: "#D97706" },
    upcoming: { label: "Upcoming", color: "#7C3AED" },
  };
  const s = map[status] ?? { label: status, color: "#94A3B8" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: `${s.color}18`, color: s.color, letterSpacing: "0.04em" }}>
      {s.label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: 10 }}>
      {children}
    </div>
  );
}
