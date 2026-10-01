"use client";

import { useState } from "react";
import { CLASSIFY_EXAMPLES, DATA_QUALITY } from "../model/classifyEngine";

const CONFIDENCE_COLORS: Record<string, string> = {
  HIGH: "#16A34A",
  MEDIUM: "#D97706",
  LOW: "#DC2626",
};

export function SystemSection() {
  const [activeExample, setActiveExample] = useState(0);
  const example = CLASSIFY_EXAMPLES[activeExample];

  const pctHigh = Math.round((DATA_QUALITY.high / DATA_QUALITY.total) * 100);
  const pctMedium = Math.round((DATA_QUALITY.medium / DATA_QUALITY.total) * 100);
  const pctLow = Math.round((DATA_QUALITY.low / DATA_QUALITY.total) * 100);

  return (
    <div>
      {/* Principles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 36 }}>
        {[
          {
            icon: "01",
            title: "Single Source of Truth",
            body: "Every number in this system traces to one place. No independent hardcoded values in components. Change the data layer; the dashboard follows.",
          },
          {
            icon: "02",
            title: "Authoritative Overrides",
            body: "When a balance sheet closes, its verified balance overrides the GL walk. The GL reconstructs flows; the BS anchors the endpoint.",
          },
          {
            icon: "03",
            title: "Three Separate Questions",
            body: "P&L (accrual), Cash (bank), Payables (AP) are three ledgers answering three distinct questions. Conflating them is how decisions go wrong.",
          },
          {
            icon: "04",
            title: "Event Windows, Not FY",
            body: "Each event's economics span presale open through final settlement — often crossing two fiscal years. Framing by FY misallocates costs and revenue.",
          },
          {
            icon: "05",
            title: "Transaction-Level Forecast",
            body: "Each forward payment is typed: amount, date, counterparty, status, negotiability. Scenarios recompute the full cash walk from first principles.",
          },
          {
            icon: "06",
            title: "Deterministic Classification",
            body: "Every GL row passes through an explicit rule chain. Rules are inspectable, testable, and improvable without touching the visualization layer.",
          },
        ].map((p) => (
          <div key={p.icon} style={{ padding: "16px 18px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#FF3EA5", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "var(--font-mono, monospace)" }}>
              {p.icon}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>{p.body}</div>
          </div>
        ))}
      </div>

      {/* Classification engine demo */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: 12 }}>
          Classification Engine — Live Demo
        </div>

        {/* Example selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {CLASSIFY_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setActiveExample(i)}
              style={{
                padding: "5px 12px",
                border: `1px solid ${i === activeExample ? "#FF3EA5" : "#E2E8F0"}`,
                background: i === activeExample ? "#FFD6EB" : "#fff",
                color: i === activeExample ? "#FF3EA5" : "#64748B",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: i === activeExample ? 600 : 400,
                cursor: "pointer",
              }}
            >
              Row {i + 1}
              <span style={{ marginLeft: 6, fontSize: 9, fontFamily: "var(--font-mono, monospace)", opacity: 0.7 }}>
                {CONFIDENCE_COLORS[ex.result.confidence] ? (
                  <span style={{ color: CONFIDENCE_COLORS[ex.result.confidence] }}>
                    {ex.result.confidence}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Raw GL row */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: 8 }}>
              Raw GL Row
            </div>
            <div style={{ padding: "14px 16px", background: "#0F172A", borderRadius: 8, fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "#94A3B8", lineHeight: 1.8 }}>
              {Object.entries(example.raw).map(([k, v]) => (
                <div key={k}>
                  <span style={{ color: "#475569" }}>{k.padEnd(12)}</span>
                  <span style={{ color: v ? "#E2E8F0" : "#334155" }}>{v ?? "(none)"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules applied + result */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: 8 }}>
              Rules Applied
            </div>
            <div style={{ marginBottom: 12 }}>
              {example.rules.map((rule, j) => (
                <div key={j} style={{ padding: "8px 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 4, marginBottom: 4, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color: "#FF3EA5", flexShrink: 0, paddingTop: 2 }}>{rule.ruleId}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "#334155", fontWeight: 500 }}>{rule.description}</div>
                    <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>
                      Match: <em>{rule.match}</em> → <strong style={{ color: "#0F172A" }}>{rule.result}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: 8 }}>
              Classification Result
            </div>
            <div style={{
              padding: "12px 14px",
              background: "#fff",
              border: `2px solid ${CONFIDENCE_COLORS[example.result.confidence] ?? "#E2E8F0"}`,
              borderRadius: 6,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>Classified</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const,
                  color: CONFIDENCE_COLORS[example.result.confidence],
                  background: `${CONFIDENCE_COLORS[example.result.confidence]}18`,
                  padding: "2px 7px", borderRadius: 3,
                }}>
                  {example.result.confidence} CONFIDENCE
                </span>
              </div>
              {[
                { label: "Event", value: example.result.event },
                { label: "Category", value: example.result.category },
                { label: "Line Item", value: example.result.item },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", gap: 8, fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: "#94A3B8", width: 60 }}>{row.label}</span>
                  <span style={{ color: "#0F172A", fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data quality summary */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: 12 }}>
          Data Quality — {DATA_QUALITY.total} GL Rows
        </div>
        <div style={{ display: "flex", gap: 0, borderRadius: 6, overflow: "hidden", height: 24, marginBottom: 10 }}>
          <div style={{ width: `${(DATA_QUALITY.high / DATA_QUALITY.total) * 100}%`, background: "#16A34A" }} />
          <div style={{ width: `${(DATA_QUALITY.medium / DATA_QUALITY.total) * 100}%`, background: "#D97706" }} />
          <div style={{ width: `${(DATA_QUALITY.low / DATA_QUALITY.total) * 100}%`, background: "#DC2626" }} />
          <div style={{ width: `${(DATA_QUALITY.needsReview / DATA_QUALITY.total) * 100}%`, background: "#E2E8F0" }} />
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 11, flexWrap: "wrap" }}>
          <QualityLegend color="#16A34A" label="High confidence" count={DATA_QUALITY.high} total={DATA_QUALITY.total} />
          <QualityLegend color="#D97706" label="Medium" count={DATA_QUALITY.medium} total={DATA_QUALITY.total} />
          <QualityLegend color="#DC2626" label="Low" count={DATA_QUALITY.low} total={DATA_QUALITY.total} />
          <QualityLegend color="#E2E8F0" label="Needs review" count={DATA_QUALITY.needsReview} total={DATA_QUALITY.total} />
        </div>
      </div>
    </div>
  );
}

function QualityLegend({ color, label, count, total }: { color: string; label: string; count: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B" }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span>{label}</span>
      <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 600, color: "#0F172A" }}>
        {count} ({Math.round((count / total) * 100)}%)
      </span>
    </div>
  );
}
