"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Scenario } from "../model/types";
import { buildMonthlyChart } from "../model/cashEngine";
import { fmtUSD } from "../lib/utils";

interface Props {
  scenario: Scenario;
}

const ACTUAL_COLOR = "#94A3B8";
const INFLOW_COLOR = "#16A34A";
const OUTFLOW_COLOR = "#DC2626";
const LINE_COLOR_ACTUAL = "#FF3EA5";
const LINE_COLOR_FORECAST = "#7657FF";

export function CashFlowChart({ scenario }: Props) {
  const data = buildMonthlyChart(scenario);

  // Only show flow bars for forecast months — actual months are authoritative from the balance sheet
  const chartData = data.map((m) => ({
    label: m.monthLabel,
    inflows: m.isActual ? undefined : m.inflows / 1000,
    outflows: m.isActual ? undefined : Math.abs(m.outflows) / 1000,
    balance: m.balance / 1000,
    isActual: m.isActual,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = chartData.find((c) => c.label === label);
    return (
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 6, padding: "10px 14px", fontSize: 12, minWidth: 180 }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: "#0F172A" }}>{label} {d?.isActual ? "(Actual)" : "(Forecast)"}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16, color: p.color }}>
            <span>{p.name}</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 600 }}>
              {p.dataKey === "balance" ? fmtUSD(p.value * 1000, true) : fmtUSD(p.value * 1000, true)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
        <LegendItem color={INFLOW_COLOR} label="Inflows (forecast)" />
        <LegendItem color={OUTFLOW_COLOR} label="Outflows (forecast)" />
        <LegendItem color={LINE_COLOR_ACTUAL} label="Balance (actual)" line />
        <LegendItem color={LINE_COLOR_FORECAST} label="Balance (forecast)" line dashed />
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#94A3B8", alignSelf: "center" }}>
          Actual months show balance line only — authoritative from balance sheet
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 56, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          {/* Left axis: balance line */}
          <YAxis
            yAxisId="balance"
            orientation="left"
            tickFormatter={(v) => `$${v}K`}
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          {/* Right axis: flows bars — independent scale so bars are visible */}
          <YAxis
            yAxisId="flows"
            orientation="right"
            tickFormatter={(v) => `$${Math.abs(v)}K`}
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine yAxisId="balance" y={0} stroke="#CBD5E1" strokeWidth={1} />
          {/* Forecast region highlight */}
          {chartData.map((d, i) =>
            !d.isActual ? (
              <ReferenceLine key={i} yAxisId="balance" x={d.label} stroke="#F3F4FF" strokeWidth={36} strokeOpacity={0.5} />
            ) : null
          )}
          <Bar yAxisId="flows" dataKey="inflows" name="Inflows" fill={INFLOW_COLOR} opacity={0.75} radius={[2, 2, 0, 0]} maxBarSize={28} />
          <Bar yAxisId="flows" dataKey="outflows" name="Outflows" fill={OUTFLOW_COLOR} opacity={0.75} radius={[2, 2, 0, 0]} maxBarSize={28} />
          <Line
            yAxisId="balance"
            dataKey="balance"
            name="Closing Balance"
            stroke={LINE_COLOR_ACTUAL}
            strokeWidth={2}
            dot={(props: any) => {
              const isActual = chartData[props.index]?.isActual;
              return (
                <circle
                  key={props.index}
                  cx={props.cx}
                  cy={props.cy}
                  r={3}
                  fill={isActual ? LINE_COLOR_ACTUAL : LINE_COLOR_FORECAST}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              );
            }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 8, fontSize: 11, color: "#94A3B8", textAlign: "center" }}>
        Bar axis: monthly flows &nbsp;·&nbsp; Line axis: month-end closing balance &nbsp;·&nbsp; Values in $000s
      </div>
    </div>
  );
}

function LegendItem({ color, label, line, dashed }: { color: string; label: string; line?: boolean; dashed?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748B" }}>
      {line ? (
        <svg width={20} height={10}>
          <line x1={0} y1={5} x2={20} y2={5} stroke={color} strokeWidth={2} strokeDasharray={dashed ? "4 2" : undefined} />
        </svg>
      ) : (
        <div style={{ width: 10, height: 10, borderRadius: 2, background: color, opacity: 0.8 }} />
      )}
      {label}
    </div>
  );
}
