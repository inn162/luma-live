interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-primary)" }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</p>
      )}
    </div>
  );
}
