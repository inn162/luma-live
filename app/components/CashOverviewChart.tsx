"use client";

import { useState, useMemo } from "react";
import type { Scenario } from "../model/types";
import {
  CHART_COLORS,
  buildMonthlyBuckets,
  buildWeeklyBuckets,
  filterByPeriod,
  type PeriodBucket,
  type ViewGranularity,
  type ViewPeriod,
} from "../model/chartEngine";
import { fmtUSD } from "../lib/utils";

// ── Layout ────────────────────────────────────────────────────────────────────

const VW     = 760;
const PAD    = { left: 70, right: 70, top: 28, bottom: 42 };
const PLOT_H = 300;
const VH     = PAD.top + PLOT_H + PAD.bottom;

const INFLOW_COLOR  = "#236B58";
const OUTFLOW_COLOR = "#244C7B";

// ── Utilities ─────────────────────────────────────────────────────────────────

function niceTicks(min: number, max: number, count = 6): number[] {
  const range = max - min;
  if (range < 1) return [0];
  const rough = range / (count - 1);
  const exp   = Math.floor(Math.log10(Math.abs(rough) || 1));
  const pow   = Math.pow(10, exp);
  const step  = Math.ceil(rough / pow) * pow;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; ticks.length < count + 2 && v <= max + step * 0.5; v += step) {
    ticks.push(Math.round(v));
  }
  return ticks.filter((v) => v >= min - step * 0.1 && v <= max + step * 0.1);
}

function fmtAxis(v: number): string {
  const abs  = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${v}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { scenario: Scenario }

export function CashOverviewChart({ scenario }: Props) {
  const [granularity, setGranularity] = useState<ViewGranularity>("monthly");
  const [period,      setPeriod]      = useState<ViewPeriod>("6M");
  const [hoverIdx,    setHoverIdx]    = useState<number | null>(null);

  const allBuckets = useMemo(
    () => granularity === "monthly" ? buildMonthlyBuckets(scenario) : buildWeeklyBuckets(scenario),
    [granularity, scenario]
  );
  const data = useMemo(() => filterByPeriod(allBuckets, period), [allBuckets, period]);

  const n      = data.length;
  const plotW  = VW - PAD.left - PAD.right;
  const slotW  = plotW / Math.max(n, 1);
  const barW   = Math.max(2, Math.min(28, slotW * 0.65));
  const xOf    = (i: number) => PAD.left + (i + 0.5) * slotW;
  const plotX0 = PAD.left;
  const plotX1 = VW - PAD.right;
  const plotY0 = PAD.top;
  const plotY1 = PAD.top + PLOT_H;

  // ── Left axis: cash balance ────────────────────────────────────────────────
  const closings  = data.map((d) => d.closingBalance);
  const rawBalMax = closings.length ? Math.max(...closings) : 2_500_000;
  const rawBalMin = closings.length ? Math.min(...closings, 0) : -1_000_000;
  const spread    = rawBalMax - rawBalMin || 1;
  const balMax    = rawBalMax + spread * 0.14;
  const balMin    = rawBalMin - spread * 0.14;
  const balRange  = balMax - balMin;
  const yBal      = (v: number) => plotY0 + PLOT_H * (1 - (v - balMin) / balRange);
  const balTicks  = niceTicks(balMin, balMax, 6).filter((v) => v >= balMin && v <= balMax);

  // ── Right axis: inflows / outflows — symmetric linear scale ───────────────
  const maxIn   = data.length ? Math.max(...data.map((d) => d.totalInflows))             : 1_000_000;
  const maxOut  = data.length ? Math.max(...data.map((d) => Math.abs(d.totalOutflows)))  : 1_000_000;
  const flowMag = Math.max(maxIn, maxOut) * 1.18;
  // pixels per unit of flow value (symmetric above/below zero)
  const halfH    = PLOT_H / 2;
  const flowPx   = halfH / (flowMag || 1);
  const y0Flow   = plotY0 + halfH;
  const yFlow    = (v: number) => y0Flow - v * flowPx;
  const flowTicks = niceTicks(-flowMag, flowMag, 7).filter((v) => v >= -flowMag && v <= flowMag);

  // ── Actual/forecast split ─────────────────────────────────────────────────
  let lastActualIdx = -1;
  for (let i = 0; i < n; i++) { if (data[i].isActual) lastActualIdx = i; }
  const hasBoundary    = lastActualIdx >= 0 && lastActualIdx < n - 1;
  const separatorX     = hasBoundary ? (xOf(lastActualIdx) + xOf(lastActualIdx + 1)) / 2 : null;
  const hasAnyForecast = data.some((d) => !d.isActual);
  const hasAnyActual   = data.some((d) =>  d.isActual);

  // ── Trough ────────────────────────────────────────────────────────────────
  let troughIdx = 0;
  for (let i = 1; i < n; i++) {
    if (data[i].closingBalance < data[troughIdx].closingBalance) troughIdx = i;
  }
  const troughNeg = n > 0 && data[troughIdx].closingBalance < 0;

  // ── Label visibility ───────────────────────────────────────────────────────
  const showLabel = (i: number) => {
    if (granularity === "monthly") return true;
    if (period === "3M") return true;
    if (period === "6M") return i % 2 === 0;
    return data[i]?.label?.includes("W1") ?? false;
  };

  if (n === 0) return (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 13 }}>
      No data for selected period.
    </div>
  );

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <SegmentedControl
          options={[{ value: "monthly", label: "Monthly" }, { value: "weekly", label: "Weekly" }]}
          value={granularity}
          onChange={(v) => { setGranularity(v as ViewGranularity); setHoverIdx(null); }}
        />
        <SegmentedControl
          options={[{ value: "3M", label: "3M" }, { value: "6M", label: "6M" }, { value: "12M", label: "12M" }]}
          value={period}
          onChange={(v) => { setPeriod(v as ViewPeriod); setHoverIdx(null); }}
        />
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", marginBottom: 12, alignItems: "center" }}>
        <LegendSwatch color={INFLOW_COLOR}  label="Total inflows" />
        <LegendSwatch color={OUTFLOW_COLOR} label="Total outflows" />
        <Divlet />
        <LegendLine color={CHART_COLORS.actualBalance}   label="Actual balance" dashed={false} />
        <LegendLine color={CHART_COLORS.forecastBalance} label="Forecast balance" dashed />
      </div>

      {/* Chart */}
      <div style={{ position: "relative" }}>
        {hoverIdx !== null && data[hoverIdx] && (
          <Tooltip bucket={data[hoverIdx]} xPct={xOf(hoverIdx) / VW} />
        )}

        <div style={{ overflowX: "auto" }}>
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            style={{ width: "100%", minWidth: 480, height: "auto", display: "block" }}
            onMouseLeave={() => setHoverIdx(null)}
          >

            {/* Plot area background */}
            <rect x={plotX0} y={plotY0} width={plotW} height={PLOT_H} fill="#FAFBFC" />

            {/* ── Left axis: balance gridlines + labels ─────────────────── */}
            {balTicks.map((v) => {
              const y = yBal(v);
              if (y < plotY0 - 2 || y > plotY1 + 2) return null;
              const isZero = v === 0;
              return (
                <g key={`bt${v}`}>
                  <line x1={plotX0} y1={y} x2={plotX1} y2={y}
                    stroke={isZero ? "#CBD5E1" : "#ECEEF2"}
                    strokeWidth={isZero ? 1.2 : 0.6} />
                  <text x={plotX0 - 6} y={y + 3.5} textAnchor="end"
                    style={{ fontSize: 8.5, fill: isZero ? "#64748B" : "#94A3B8", fontFamily: "monospace" }}>
                    {fmtAxis(v)}
                  </text>
                </g>
              );
            })}

            {/* Left axis title */}
            <text
              x={11} y={plotY0 + PLOT_H / 2}
              textAnchor="middle"
              transform={`rotate(-90, 11, ${plotY0 + PLOT_H / 2})`}
              style={{ fontSize: 7, fill: "#94A3B8", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              CASH BALANCE
            </text>

            {/* ── Right axis: flow labels ───────────────────────────────── */}
            {flowTicks.map((v) => {
              const y = yFlow(v);
              if (y < plotY0 - 2 || y > plotY1 + 2) return null;
              return (
                <text key={`ft${v}`} x={plotX1 + 6} y={y + 3.5} textAnchor="start"
                  style={{ fontSize: 8.5, fill: v === 0 ? "#64748B" : "#94A3B8", fontFamily: "monospace" }}>
                  {fmtAxis(v)}
                </text>
              );
            })}

            {/* Right axis title */}
            <text
              x={VW - 10} y={plotY0 + PLOT_H / 2}
              textAnchor="middle"
              transform={`rotate(90, ${VW - 10}, ${plotY0 + PLOT_H / 2})`}
              style={{ fontSize: 7, fill: "#94A3B8", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              INFLOWS / OUTFLOWS
            </text>

            {/* Flow zero reference (right scale) */}
            <line x1={plotX0} y1={y0Flow} x2={plotX1} y2={y0Flow}
              stroke="#E2E8F0" strokeWidth={0.8} strokeDasharray="3 3" />

            {/* ── Actual/forecast separator ─────────────────────────────── */}
            {separatorX !== null && (
              <>
                <line x1={separatorX} y1={plotY0} x2={separatorX} y2={plotY1}
                  stroke="#D1D5DB" strokeWidth={1} strokeDasharray="4 3" />
                {hasAnyActual && (
                  <text x={separatorX - 7} y={plotY0 + 12} textAnchor="end"
                    style={{ fontSize: 7.5, fill: "#94A3B8", fontFamily: "monospace" }}>
                    ACTUAL
                  </text>
                )}
                {hasAnyForecast && (
                  <text x={separatorX + 7} y={plotY0 + 12}
                    style={{ fontSize: 7.5, fill: "#94A3B8", fontFamily: "monospace" }}>
                    FORECAST
                  </text>
                )}
              </>
            )}

            {/* ── Bars (behind balance line) ───────────────────────────── */}
            {data.map((d, i) => {
              const bx      = xOf(i) - barW / 2;
              const opacity = d.isActual ? 1.0 : 0.72;
              const inH  = Math.min(Math.max(0, d.totalInflows * flowPx), y0Flow - plotY0);
              const outH = Math.min(Math.max(0, Math.abs(d.totalOutflows) * flowPx), plotY1 - y0Flow);
              return (
                <g key={`bar${i}`}>
                  {inH > 0.5 && (
                    <rect x={bx} y={y0Flow - inH} width={barW} height={inH}
                      fill={INFLOW_COLOR} opacity={opacity} />
                  )}
                  {outH > 0.5 && (
                    <rect x={bx} y={y0Flow} width={barW} height={outH}
                      fill={OUTFLOW_COLOR} opacity={opacity} />
                  )}
                  {/* Hover hit target */}
                  <rect
                    x={xOf(i) - slotW / 2} y={plotY0}
                    width={slotW} height={PLOT_H}
                    fill="transparent"
                    onMouseEnter={() => setHoverIdx(i)}
                    style={{ cursor: "default" }}
                  />
                </g>
              );
            })}

            {/* Hover column highlight */}
            {hoverIdx !== null && (
              <rect
                x={xOf(hoverIdx) - slotW / 2} y={plotY0}
                width={slotW} height={PLOT_H}
                fill="rgba(0,0,0,0.028)" pointerEvents="none" />
            )}

            {/* ── Balance lines (on top of bars) ───────────────────────── */}

            {/* Actual line */}
            {hasAnyActual && (() => {
              const pts = data
                .map((d, i) => d.isActual ? `${xOf(i).toFixed(1)},${yBal(d.closingBalance).toFixed(1)}` : null)
                .filter(Boolean);
              return pts.length >= 2 ? (
                <polyline points={pts.join(" ")} fill="none"
                  stroke={CHART_COLORS.actualBalance} strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round" />
              ) : null;
            })()}

            {/* Actual dots */}
            {data.map((d, i) => d.isActual ? (
              <circle key={`ad${i}`} cx={xOf(i)} cy={yBal(d.closingBalance)}
                r={n > 25 ? 1.8 : 3.5}
                fill={CHART_COLORS.actualBalance}
                stroke="#fff" strokeWidth={n > 25 ? 0 : 1.5} />
            ) : null)}

            {/* Forecast line — connects from last actual */}
            {hasAnyForecast && (() => {
              const idxs: number[] = [];
              if (lastActualIdx >= 0) idxs.push(lastActualIdx);
              data.forEach((d, i) => { if (!d.isActual) idxs.push(i); });
              if (idxs.length < 2) return null;
              const pts = idxs.map((i) => `${xOf(i).toFixed(1)},${yBal(data[i].closingBalance).toFixed(1)}`);
              return (
                <polyline points={pts.join(" ")} fill="none"
                  stroke={CHART_COLORS.forecastBalance} strokeWidth={2.5}
                  strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" />
              );
            })()}

            {/* Forecast dots */}
            {data.map((d, i) => !d.isActual ? (
              <circle key={`fd${i}`} cx={xOf(i)} cy={yBal(d.closingBalance)}
                r={n > 25 ? 1.4 : 2.8}
                fill={CHART_COLORS.forecastBalance}
                stroke="#fff" strokeWidth={n > 25 ? 0 : 1.5} />
            ) : null)}

            {/* Trough annotation */}
            {troughNeg && (() => {
              const tx = xOf(troughIdx);
              const ty = yBal(data[troughIdx].closingBalance);
              const up = ty + 54 > plotY1;
              const labelY = up ? ty - 30 : ty + 36;
              const label  = fmtAxis(data[troughIdx].closingBalance);
              const lblW   = label.length * 6.2 + 10;
              return (
                <g>
                  <line x1={tx} y1={up ? ty - 5 : ty + 5}
                    x2={tx} y2={up ? ty - 18 : ty + 18}
                    stroke={CHART_COLORS.fundingGap} strokeWidth={1} />
                  <rect
                    x={tx - lblW / 2} y={labelY - 11}
                    width={lblW} height={16} rx={3}
                    fill={CHART_COLORS.fundingGap} />
                  <text x={tx} y={labelY + 1}
                    textAnchor="middle"
                    style={{ fontSize: 10, fill: "#fff", fontFamily: "monospace", fontWeight: 700 }}>
                    {label}
                  </text>
                </g>
              );
            })()}

            {/* Plot border */}
            <rect x={plotX0} y={plotY0} width={plotW} height={PLOT_H}
              fill="none" stroke="#E5E7EB" strokeWidth={0.5} />

            {/* ── X-axis labels ─────────────────────────────────────────── */}
            {data.map((d, i) => showLabel(i) ? (
              <text key={`xl${i}`} x={xOf(i)} y={plotY1 + 14} textAnchor="middle"
                style={{ fontSize: 8.5, fill: "#94A3B8", fontFamily: "monospace" }}>
                {d.label}
              </text>
            ) : null)}

          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Shared helper components ───────────────────────────────────────────────────

function SegmentedControl({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "inline-flex", background: "#F1F5F9", borderRadius: 6, padding: 2, gap: 1 }}>
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          fontSize: 10, fontFamily: "var(--font-mono, monospace)",
          fontWeight: opt.value === value ? 700 : 400,
          padding: "4px 10px", borderRadius: 4, border: "none",
          background: opt.value === value ? "#283044" : "transparent",
          color:      opt.value === value ? "#fff"    : "#6B7280",
          cursor: "pointer", transition: "background 0.1s, color 0.1s",
        }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280", fontFamily: "var(--font-mono, monospace)" }}>
      <span style={{ width: 8, height: 8, background: color, borderRadius: 2, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function LegendLine({ color, label, dashed }: { color: string; label: string; dashed: boolean }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280", fontFamily: "var(--font-mono, monospace)" }}>
      <svg width="18" height="8" style={{ flexShrink: 0 }}>
        <line x1="0" y1="4" x2="18" y2="4" stroke={color} strokeWidth="2.5"
          strokeDasharray={dashed ? "5 3" : undefined} />
      </svg>
      {label}
    </span>
  );
}

function Divlet() {
  return <span style={{ width: 1, height: 12, background: "#E5E7EB", alignSelf: "center" }} />;
}

function Tooltip({ bucket, xPct }: { bucket: PeriodBucket; xPct: number }) {
  const isRight = xPct > 0.62;
  const posStyle: React.CSSProperties = {
    position: "absolute",
    top: 2,
    ...(isRight
      ? { right: `${(1 - xPct + 0.02) * 100}%` }
      : { left: `${(xPct + 0.01) * 100}%` }),
    zIndex: 10,
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    padding: "11px 14px",
    fontSize: 11,
    fontFamily: "var(--font-mono, monospace)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.09)",
    minWidth: 198,
    pointerEvents: "none",
    whiteSpace: "nowrap" as const,
  };

  return (
    <div style={posStyle}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: "#111", fontSize: 11 }}>
        {bucket.label} · {bucket.isActual ? "Actual" : "Forecast"}
      </div>

      {/* Inflows */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ color: INFLOW_COLOR, fontWeight: 600, marginBottom: 3 }}>
          ↑ Inflows: {fmtUSD(bucket.totalInflows, true)}
        </div>
        <div style={{ paddingLeft: 10, fontSize: 10, color: "#6B7280", lineHeight: 1.75 }}>
          <div>Operating revenue: {fmtUSD(bucket.opRevenue, true)}</div>
          <div>Sponsorships: {fmtUSD(bucket.sponsorships, true)}</div>
          <div>Other inflows: {fmtUSD(bucket.otherInflows, true)}</div>
        </div>
      </div>

      {/* Outflows */}
      <div style={{ marginBottom: 7 }}>
        <div style={{ color: OUTFLOW_COLOR, fontWeight: 600, marginBottom: 3 }}>
          ↓ Outflows: {fmtUSD(Math.abs(bucket.totalOutflows), true)}
        </div>
        <div style={{ paddingLeft: 10, fontSize: 10, color: "#6B7280", lineHeight: 1.75 }}>
          <div>Payroll & operations: {fmtUSD(Math.abs(bucket.payrollOps), true)}</div>
          <div>Events & production: {fmtUSD(Math.abs(bucket.eventsProd), true)}</div>
          <div>Other expenses: {fmtUSD(Math.abs(bucket.otherExpenses), true)}</div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 7, lineHeight: 1.85 }}>
        <div style={{ color: bucket.netFlow >= 0 ? INFLOW_COLOR : OUTFLOW_COLOR }}>
          Net cash flow: {bucket.netFlow >= 0 ? "+" : ""}{fmtUSD(bucket.netFlow, true)}
        </div>
        <div style={{ color: "#283044", fontWeight: 700 }}>
          Closing balance: {fmtUSD(bucket.closingBalance, true)}
        </div>
      </div>
    </div>
  );
}
