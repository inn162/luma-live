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

  const BAR_H = 30;
  const LABEL_W = 220;
  const META_W = 90;
  const TRACK_W = 340;
  const GAP = 10;
  const totalH = steps.length * (BAR_H + GAP) + 60;
  const maxVal = Math.max(SPENDABLE_CASH, Math.abs(stats.troughBalance) + 400_000);
  const scale = TRACK_W / maxVal;
  const zeroX = LABEL_W + META_W;

  return (
    <div>
      {/* SVG bridge */}
      <div style={{ overflowX: "auto", marginBottom: 24 }}>
        <svg width={LABEL_W + META_W + TRACK_W + 80} height={totalH} style={{ display: "block" }}>
          {/* Zero axis */}
          <line x1={zeroX} y1={0} x2={zeroX} y2={totalH - 40} stroke="#E2E8F0" strokeWidth={1} />

          {steps.map((step, i) => {
            const y = i * (BAR_H + GAP) + 4;
            const isNeg = step.runningBalance < 0;
            const barColor =
              step.type === "start" ? "#FF3EA5" :
              step.type === "positive" ? "#16A34A" :
              "#DC2626";

            // Position of the running balance bar (absolute from zero)
            const bx = isNeg ? zeroX + step.runningBalance * scale : zeroX;
            const bw = Math.abs(step.runningBalance) * scale;

            // The delta arrow width (for non-start steps)
            const prevBalance = i === 0 ? 0 : steps[i - 1].runningBalance;
            const deltaW = Math.abs(step.value) * scale;
            const deltaX = step.value >= 0
              ? zeroX + Math.min(prevBalance, step.runningBalance) * scale
              : zeroX + step.runningBalance * scale;

            return (
              <g key={i}>
                {/* Label */}
                <text
                  x={LABEL_W - 8}
                  y={y + BAR_H / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={12}
                  fontWeight={600}
                  fill="#0F172A"
                >
                  {step.label}
                </text>
                <text
                  x={LABEL_W - 8}
                  y={y + BAR_H / 2 + 13}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={9}
                  fill="#94A3B8"
                >
                  {step.sub}
                </text>

                {/* Running balance bar (cumulative) */}
                <rect
                  x={isNeg ? zeroX + step.runningBalance * scale : zeroX}
                  y={y + 4}
                  width={Math.abs(step.runningBalance) * scale}
                  height={BAR_H - 8}
                  fill={i === 0 ? "#FF3EA5" : isNeg ? "#DC2626" : "#FF3EA5"}
                  opacity={0.18}
                  rx={2}
                />

                {/* Delta bar (the change this period) */}
                {i > 0 && (
                  <rect
                    x={deltaX}
                    y={y + 2}
                    width={deltaW}
                    height={BAR_H - 4}
                    fill={barColor}
                    opacity={0.75}
                    rx={2}
                  />
                )}

                {/* Start bar */}
                {i === 0 && (
                  <rect
                    x={zeroX}
                    y={y + 2}
                    width={SPENDABLE_CASH * scale}
                    height={BAR_H - 4}
                    fill="#FF3EA5"
                    opacity={0.75}
                    rx={2}
                  />
                )}

                {/* Running balance label */}
                <text
                  x={isNeg ? zeroX + step.runningBalance * scale - 6 : zeroX + step.runningBalance * scale + 6}
                  y={y + BAR_H / 2 + 1}
                  textAnchor={isNeg ? "end" : "start"}
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="var(--font-mono, monospace)"
                  fill={isNeg ? "#DC2626" : "#FF3EA5"}
                >
                  {fmtUSD(step.runningBalance, true)}
                </text>

                {/* Delta value in left column */}
                {i > 0 && (
                  <text
                    x={LABEL_W + META_W - 8}
                    y={y + BAR_H / 2 + 1}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontWeight={600}
                    fontFamily="var(--font-mono, monospace)"
                    fill={step.value >= 0 ? "#16A34A" : "#DC2626"}
                  >
                    {step.value >= 0 ? "+" : ""}{fmtUSD(step.value, true)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Trough annotation if negative balance */}
          {stats.peakGap > 0 && (
            <g>
              <text
                x={LABEL_W - 8}
                y={steps.length * (BAR_H + GAP) + 16}
                textAnchor="end"
                fontSize={10}
                fontWeight={700}
                fill="#DC2626"
              >
                Trough
              </text>
              <text
                x={LABEL_W - 8}
                y={steps.length * (BAR_H + GAP) + 28}
                textAnchor="end"
                fontSize={9}
                fill="#94A3B8"
              >
                {stats.troughLabel ?? "—"}
              </text>
              <text
                x={LABEL_W + META_W - 8}
                y={steps.length * (BAR_H + GAP) + 18}
                textAnchor="end"
                fontSize={12}
                fontWeight={700}
                fontFamily="var(--font-mono, monospace)"
                fill="#DC2626"
              >
                {fmtUSD(stats.troughBalance, true)}
              </text>
              {/* Trough gap bracket */}
              <rect
                x={zeroX + stats.troughBalance * scale}
                y={steps.length * (BAR_H + GAP) + 4}
                width={-stats.troughBalance * scale}
                height={16}
                fill="#DC2626"
                opacity={0.12}
                rx={2}
              />
              <line
                x1={zeroX + stats.troughBalance * scale}
                y1={steps.length * (BAR_H + GAP) + 4}
                x2={zeroX}
                y2={steps.length * (BAR_H + GAP) + 4}
                stroke="#DC2626"
                strokeWidth={1}
                strokeDasharray="3 2"
              />
              <text
                x={zeroX + stats.troughBalance * scale / 2}
                y={steps.length * (BAR_H + GAP) + 15}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill="#DC2626"
              >
                GAP: {fmtUSD(stats.peakGap, true)}
              </text>
            </g>
          )}
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
