"use client";

import type { Scenario, FundingStats } from "../model/types";
import { ALL_SCENARIO_STATS } from "../model/cashEngine";
import { fmtUSD } from "../lib/utils";

const SCENARIOS: { id: Scenario; label: string; sub: string; tag: string; tagColor: string }[] = [
  {
    id: "base",
    label: "Base Case",
    sub: "All inflows and outflows on scheduled dates",
    tag: "Baseline",
    tagColor: "#FF3EA5",
  },
  {
    id: "receipts_1w",
    label: "Receipts −1 Wk",
    sub: "All inflows delayed 7 days (collection slippage)",
    tag: "Stress",
    tagColor: "#D97706",
  },
  {
    id: "receipts_2w",
    label: "Receipts −2 Wks",
    sub: "All inflows delayed 14 days",
    tag: "Stress",
    tagColor: "#D97706",
  },
  {
    id: "receipts_3w",
    label: "Receipts −3 Wks",
    sub: "All inflows delayed 21 days",
    tag: "Severe",
    tagColor: "#DC2626",
  },
  {
    id: "defer_costs",
    label: "Defer Costs",
    sub: "Negotiable outflows pushed 30 days",
    tag: "Mitigation",
    tagColor: "#16A34A",
  },
  {
    id: "combined_2w",
    label: "Combined −2 Wks",
    sub: "Receipts −14 days + defer negotiable costs",
    tag: "Stress + Mitigation",
    tagColor: "#7657FF",
  },
];

interface Props {
  selected: Scenario;
  onChange: (s: Scenario) => void;
}

export function ScenarioLab({ selected, onChange }: Props) {
  const baseStats = ALL_SCENARIO_STATS["base"];

  return (
    <div>
      {/* Scenario buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, marginBottom: 28 }}>
        {SCENARIOS.map((s) => {
          const stats = ALL_SCENARIO_STATS[s.id];
          const isActive = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              style={{
                padding: "14px 16px",
                background: isActive ? "#FFD6EB" : "#FAFAFA",
                border: `1.5px solid ${isActive ? "#FF3EA5" : "#E2E8F0"}`,
                borderRadius: 8,
                textAlign: "left" as const,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#FF3EA5" : "#0F172A" }}>{s.label}</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: s.tagColor, background: `${s.tagColor}18`, padding: "2px 6px", borderRadius: 3 }}>
                  {s.tag}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 10 }}>{s.sub}</div>
              <div style={{ display: "flex", gap: 12 }}>
                <MiniStat
                  label="Gap"
                  value={fmtUSD(stats.peakGap, true)}
                  bad={stats.peakGap > 0}
                />
                <MiniStat
                  label="Req'd"
                  value={fmtUSD(stats.trueRequirement, true)}
                  bad={stats.trueRequirement > 0}
                  accent={stats.trueRequirement > 0}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
              <th style={{ textAlign: "left" as const, padding: "8px 12px", fontWeight: 600, color: "#64748B", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Scenario</th>
              <th style={{ textAlign: "right" as const, padding: "8px 12px", fontWeight: 600, color: "#64748B", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Peak Gap</th>
              <th style={{ textAlign: "right" as const, padding: "8px 12px", fontWeight: 600, color: "#64748B", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Deferrable</th>
              <th style={{ textAlign: "right" as const, padding: "8px 12px", fontWeight: 600, color: "#64748B", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>True Req't</th>
              <th style={{ textAlign: "right" as const, padding: "8px 12px", fontWeight: 600, color: "#64748B", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>End Cash</th>
              <th style={{ textAlign: "center" as const, padding: "8px 12px", fontWeight: 600, color: "#64748B", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>vs Base</th>
            </tr>
          </thead>
          <tbody>
            {SCENARIOS.map((s) => {
              const stats = ALL_SCENARIO_STATS[s.id];
              const isActive = selected === s.id;
              const deltaReq = stats.trueRequirement - baseStats.trueRequirement;
              return (
                <tr
                  key={s.id}
                  onClick={() => onChange(s.id)}
                  style={{
                    borderBottom: "1px solid #F1F5F9",
                    background: isActive ? "#FFD6EB" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "10px 12px", fontWeight: isActive ? 600 : 400, color: isActive ? "#FF3EA5" : "#0F172A" }}>
                    {s.label}
                  </td>
                  <MonoCell value={fmtUSD(stats.peakGap, true)} negative={stats.peakGap > 0} />
                  <MonoCell value={fmtUSD(stats.deferrable, true)} positive />
                  <MonoCell value={fmtUSD(stats.trueRequirement, true)} negative={stats.trueRequirement > 0} bold />
                  <MonoCell value={fmtUSD(stats.endCash, true)} negative={stats.endCash < 0} />
                  <td style={{ padding: "10px 12px", textAlign: "center" as const }}>
                    {s.id === "base" ? (
                      <span style={{ fontSize: 10, color: "#94A3B8" }}>—</span>
                    ) : (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "var(--font-mono, monospace)",
                        color: deltaReq > 0 ? "#DC2626" : deltaReq < 0 ? "#16A34A" : "#94A3B8",
                      }}>
                        {deltaReq === 0 ? "=" : `${deltaReq > 0 ? "+" : ""}${fmtUSD(deltaReq, true)}`}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "#94A3B8" }}>
        "True Req't" = peak gap minus deferrals. All charts above update to the selected scenario. Click a scenario to select it.
      </div>
    </div>
  );
}

function MiniStat({ label, value, bad, accent }: { label: string; value: string; bad?: boolean; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color: bad ? "#DC2626" : "#16A34A" }}>
        {value}
      </div>
    </div>
  );
}

function MonoCell({ value, negative, positive, bold }: { value: string; negative?: boolean; positive?: boolean; bold?: boolean }) {
  return (
    <td style={{
      padding: "10px 12px",
      textAlign: "right" as const,
      fontFamily: "var(--font-mono, monospace)",
      fontSize: 12,
      fontWeight: bold ? 700 : 500,
      color: negative ? "#DC2626" : positive ? "#16A34A" : "#475569",
    }}>
      {value}
    </td>
  );
}
