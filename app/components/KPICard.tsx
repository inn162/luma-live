interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  positive?: boolean;
}

export function KPICard({ label, value, sub, delta, positive }: KPICardProps) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "20px 24px", minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 4 }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 12, fontWeight: 600, color: positive === true ? "var(--positive)" : positive === false ? "var(--negative)" : "var(--text-muted)" }}>
          {delta}
        </div>
      )}
      {sub && !delta && (
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</div>
      )}
    </div>
  );
}
