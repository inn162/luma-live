"use client";

import type { Scenario } from "../model/types";
import { fmtUSD } from "../lib/utils";
import { ALL_SCENARIO_STATS, SPENDABLE_CASH, buildMonthlyChart } from "../model/cashEngine";

interface Props {
  scenario: Scenario;
}

export function FundingBridge({ scenario }: Props) {
  const stats = ALL_SCENARIO_STATS[scenario];
  const monthly = buildMonthlyChart(scenario);

  const octRow = monthly.find((m) => m.month === "2026-10");
  const novRow = monthly.find((m) => m.month === "2026-11");
  const decRow = monthly.find((m) => m.month === "2026-12");

  const octNet = octRow ? octRow.inflows + octRow.outflows : 0;
  const novNet = novRow ? novRow.inflows + novRow.outflows : 0;
  const decNet = decRow ? decRow.inflows + decRow.outflows : 0;

  const octClose = SPENDABLE_CASH + octNet;
  const novClose = octClose + novNet;
  const decClose = novClose + decNet;

  // Bridge steps from opening to trough to end
  const steps: Array<{
    label: string;
    sub: string;
    value: number;
    runningBalance: number;
    type: "start" | "positive" | "negative" | "trough" | "end";
  }> = [
    {
      label: "Spendable Cash",
      sub: "Oct 1 opening — excl. $340K restricted",
      value: SPENDABLE_CASH,
      runningBalance: SPENDABLE_CASH,
      type: "start",
    },
    {
      label: "October",
      sub: `Inflows ${fmtUSD(octRow?.inflows ?? 0, true)} · Outflows ${fmtUSD(Math.abs(octRow?.outflows ?? 0), true)}`,
      value: octNet,
      runningBalance: octClose,
      type: octNet >= 0 ? "positive" : "negative",
    },
    {
      label: "November",
      sub: `Inflows ${fmtUSD(novRow?.inflows ?? 0, true)} · Outflows ${fmtUSD(Math.abs(novRow?.outflows ?? 0), true)}`,
      value: novNet,
      runningBalance: novClose,
      type: novNet >= 0 ? "positive" : "negative",
    },
    {
      label: "December",
      sub: `Inflows ${fmtUSD(decRow?.inflows ?? 0, true)} · Outflows ${fmtUSD(Math.abs(decRow?.outflows ?? 0), true)}`,
      value: decNet,
      runningBalance: decClose,
      type: decNet >= 0 ? "positive" : "negative",
    },
  ];

  // Scale: zero at natural position based on max positive / max negative
  const MAX_POS = SPENDABLE_CASH;
  const MAX_NEG = Math.max(Math.abs(stats.troughBalance), 200_000);
  const TOTAL_RANGE = MAX_POS + MAX_NEG;

  const LABEL_W = 200;
  const DELTA_W = 76;
  const BAL_W = 72;
  const TRACK_W = 280;
  const TRACK_START = LABEL_W + DELTA_W + BAL_W;
  const BAR_H = 26;
  const GAP = 10;
  const SVG_W = TRACK_START + TRACK_W + 12;

  // x coordinate for a balance value (within the track)
  const xOf = (bal: number) =>
    TRACK_START + ((bal + MAX_NEG) / TOTAL_RANGE) * TRACK_W;
  const zeroX = xOf(0);

  // All rows including trough annotation
  const allRows = [
    ...steps,
    ...(stats.peakGap > 0
      ? [{ label: "Trough", sub: stats.troughLabel ?? "Dec 15", value: 0, runningBalance: stats.troughBalance, type: "trough" as const }]
      : []),
  ];
  const totalH = allRows.length * (BAR_H + GAP) + 20;

  return (
    <div>
      {/* SVG bridge */}
      <div style={{ overflowX: "auto", marginBottom: 24 }}>
        <svg width={SVG_W} height={totalH} style={{ display: "block" }}>
          {/* Zero axis */}
          <line x1={zeroX} y1={0} x2={zeroX} y2={totalH - 8} stroke="#E2E8F0" strokeWidth={1} />

          {allRows.map((step, i) => {
            const y = i * (BAR_H + GAP);
            const isTrough = step.type === "trough";
            const isNeg = step.runningBalance < 0;

            // Single balance bar — from zero to running balance
            const bLeft = Math.min(xOf(step.runningBalance), zeroX);
            const bRight = Math.max(xOf(step.runningBalance), zeroX);
            const bW = bRight - bLeft;
            const bColor = isTrough ? "#DC2626" : isNeg ? "#DC2626" : "#FF3EA5";

            return (
              <g key={i}>
                {/* Row label */}
                <text
                  x={LABEL_W - 6}
                  y={y + BAR_H / 2 - 4}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={isTrough ? 10 : 12}
                  fontWeight={isTrough ? 500 : 600}
                  fill={isTrough ? "#DC2626" : "#0F172A"}
                  fontStyle={isTrough ? "italic" : "normal"}
                >
                  {step.label}
                </text>
                <text
                  x={LABEL_W - 6}
                  y={y + BAR_H / 2 + 7}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={9}
                  fill="#94A3B8"
                >
                  {step.sub}
                </text>

                {/* Delta column (net change) */}
                {step.type !== "start" && !isTrough && step.value !== 0 && (
                  <text
                    x={LABEL_W + DELTA_W - 4}
                    y={y + BAR_H / 2 + 1}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontWeight={600}
                    fontFamily="var(--font-mono, monospace)"
                    fill={step.value > 0 ? "#16A34A" : "#DC2626"}
                  >
                    {step.value > 0 ? "+" : ""}{fmtUSD(step.value, true)}
                  </text>
                )}

                {/* Balance column (ending balance — fixed position, no floating) */}
                <text
                  x={LABEL_W + DELTA_W + BAL_W - 4}
                  y={y + BAR_H / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="var(--font-mono, monospace)"
                  fill={isTrough ? "#DC2626" : isNeg ? "#DC2626" : "#FF3EA5"}
                >
                  {fmtUSD(step.runningBalance, true)}
                </text>

                {/* Balance bar */}
                <rect
                  x={bLeft}
                  y={y + (isTrough ? 6 : 4)}
                  width={Math.max(bW, 2)}
                  height={isTrough ? BAR_H - 12 : BAR_H - 8}
                  fill={bColor}
                  opacity={isTrough ? 0.35 : 0.75}
                  rx={2}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary callouts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <SummaryStat
          label="Peak Gap"
          value={fmtUSD(stats.peakGap, true)}
          sub={stats.peakGap > 0 ? `Trough ${stats.troughLabel ?? "—"} — ${fmtUSD(stats.troughBalance, true)}` : "No gap in this scenario"}
          negative={stats.peakGap > 0}
        />
        <SummaryStat
          label="Deferrable"
          value={fmtUSD(stats.deferrable, true)}
          sub="Negotiable outflows that can shift 30 days"
          positive
        />
        <SummaryStat
          label="True Requirement"
          value={fmtUSD(stats.trueRequirement, true)}
          sub={stats.trueRequirement > 0 ? "External capital after deferrals" : "Gap fully covered by deferrals"}
          negative={stats.trueRequirement > 0}
          accent={stats.trueRequirement > 0}
        />
      </div>
    </div>
  );
}

function SummaryStat({ label, value, sub, positive, negative, accent }: {
  label: string; value: string; sub: string; positive?: boolean; negative?: boolean; accent?: boolean;
}) {
  return (
    <div style={{
      padding: "12px 16px",
      background: accent ? "#FFF1F2" : "#F8FAFC",
      border: `1px solid ${accent ? "#FECDD3" : "#E2E8F0"}`,
      borderRadius: 6,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94A3B8", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color: negative ? "#DC2626" : positive ? "#16A34A" : "#0F172A", marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#94A3B8" }}>{sub}</div>
    </div>
  );
}
