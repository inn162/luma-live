"use client";

import { useState } from "react";
import type { Scenario } from "../model/types";
import { buildDriverTree, type DriverNode } from "../model/cashEngine";
import { fmtUSD, eventName, eventColor } from "../lib/utils";

const FORECAST_MONTHS = [
  { key: "2026-10", label: "October 2026" },
  { key: "2026-11", label: "November 2026" },
  { key: "2026-12", label: "December 2026" },
];

interface Props {
  scenario: Scenario;
}

export function CashDriverTree({ scenario }: Props) {
  const [activeMonth, setActiveMonth] = useState("2026-11"); // Nov — the critical month

  const tree = buildDriverTree(activeMonth, scenario);

  return (
    <div>
      {/* Month tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {FORECAST_MONTHS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMonth(m.key)}
            style={{
              padding: "6px 14px",
              border: `1px solid ${activeMonth === m.key ? "#FF3EA5" : "#E2E8F0"}`,
              background: activeMonth === m.key ? "#FFD6EB" : "#fff",
              color: activeMonth === m.key ? "#FF3EA5" : "#64748B",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: activeMonth === m.key ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {m.label}
          </button>
        ))}
        {activeMonth === "2026-11" && (
          <span style={{ fontSize: 11, color: "#DC2626", alignSelf: "center", marginLeft: 8, fontWeight: 500 }}>
            Critical — funding gap month
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <TreePanel node={tree.inflows} isInflow />
        <TreePanel node={tree.outflows} isInflow={false} />
      </div>

      {activeMonth === "2026-11" && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 6, fontSize: 12, color: "#92400E" }}>
          <strong>November cash gap anatomy:</strong> $1,360K in non-negotiable outflows (headliner $480K, venue $320K, stage $280K, payroll $280K) hit within 10 days. Net: −$560K trough before any mitigation.
        </div>
      )}
    </div>
  );
}

function TreePanel({ node, isInflow }: { node: DriverNode; isInflow: boolean }) {
  const color = isInflow ? "#16A34A" : "#DC2626";
  const totalAmt = node.amount;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #E2E8F0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{isInflow ? "Inflows" : "Outflows"}</div>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color }}>
          {fmtUSD(totalAmt, true)}
        </div>
      </div>

      {node.children.length === 0 && (
        <div style={{ fontSize: 12, color: "#94A3B8", padding: "12px 0" }}>No {isInflow ? "inflows" : "outflows"} this month.</div>
      )}

      {node.children.map((category, i) => (
        <CategoryRow key={i} node={category} isInflow={isInflow} total={Math.abs(totalAmt)} />
      ))}
    </div>
  );
}

function CategoryRow({ node, isInflow, total }: { node: DriverNode; isInflow: boolean; total: number }) {
  const [open, setOpen] = useState(true);
  const pct = total > 0 ? Math.abs(node.amount) / total : 0;
  const color = isInflow ? "#16A34A" : "#DC2626";

  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left" as const,
        }}
      >
        <span style={{ fontSize: 10, color: "#94A3B8", width: 10, flexShrink: 0 }}>{open ? "▼" : "▶"}</span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#334155" }}>{node.label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color }}>
          {fmtUSD(node.amount, true)}
        </span>
      </button>

      {/* Bar */}
      <div style={{ marginLeft: 18, marginBottom: 4 }}>
        <div style={{ height: 3, background: "#F1F5F9", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct * 100}%`, background: color, opacity: 0.6, borderRadius: 2 }} />
        </div>
      </div>

      {/* Child transactions */}
      {open && node.children.map((tx, j) => (
        <TxRow key={j} node={tx} isInflow={isInflow} />
      ))}
    </div>
  );
}

function TxRow({ node, isInflow }: { node: DriverNode; isInflow: boolean }) {
  const color = isInflow ? "#16A34A" : "#DC2626";
  const isNegotiable = node.negotiability === "negotiable";
  const dateLabel = node.date ? (() => {
    const [yr, mo, dy] = node.date!.split("-").map(Number);
    return new Date(yr, mo - 1, dy).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  })() : "";

  return (
    <div style={{
      marginLeft: 18,
      marginBottom: 4,
      padding: "7px 10px",
      background: "#FAFAFA",
      border: "1px solid #F1F5F9",
      borderRadius: 4,
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
          {node.counterparty ?? node.label}
        </div>
        <div style={{ fontSize: 10, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
          {node.label}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" as const }}>
          {dateLabel && (
            <Tag color="#64748B">{dateLabel}</Tag>
          )}
          {node.event && (
            <Tag color={eventColor(node.event)} bg>
              {eventName(node.event)}
            </Tag>
          )}
          {node.status && (
            <Tag color={node.status === "confirmed" ? "#16A34A" : node.status === "expected" ? "#D97706" : "#94A3B8"}>
              {node.status}
            </Tag>
          )}
          {isNegotiable && (
            <Tag color="#7C3AED">deferrable</Tag>
          )}
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color, flexShrink: 0, paddingTop: 2 }}>
        {fmtUSD(node.amount ?? 0, true)}
      </div>
    </div>
  );
}

function Tag({ color, bg, children }: { color: string; bg?: boolean; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase" as const,
      padding: "1px 5px",
      borderRadius: 3,
      background: bg ? `${color}22` : "#F1F5F9",
      color: bg ? color : "#94A3B8",
    }}>
      {children}
    </span>
  );
}
