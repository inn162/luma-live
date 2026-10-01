"use client";

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  deltaPositive?: boolean;
  accent?: boolean;
  muted?: boolean;
  large?: boolean;
}

export function KPICard({ label, value, sub, delta, deltaPositive, accent, muted, large }: KPICardProps) {
  return (
    <div style={{
      padding: large ? "20px 24px" : "16px 20px",
      background: accent ? "var(--accent)" : "var(--surface)",
      border: accent ? "none" : "1px solid var(--border)",
      borderRadius: 6,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: accent ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>
        {label}
      </div>
      <div style={{ fontSize: large ? 28 : 22, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", letterSpacing: "-0.02em", color: accent ? "#fff" : muted ? "var(--text-muted)" : "var(--text-primary)", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: accent ? "rgba(255,255,255,0.65)" : "var(--text-muted)" }}>
          {sub}
        </div>
      )}
      {delta && (
        <div style={{ fontSize: 11, fontWeight: 500, color: deltaPositive ? "var(--positive)" : "var(--negative)" }}>
          {delta}
        </div>
      )}
    </div>
  );
}
