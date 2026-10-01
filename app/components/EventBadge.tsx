import { getEventColor, getEventName } from "../lib/utils";

interface EventBadgeProps {
  code: string;
  size?: "sm" | "md";
}

export function EventBadge({ code, size = "md" }: EventBadgeProps) {
  const color = getEventColor(code);
  const name = getEventName(code);
  const pad = size === "sm" ? "2px 8px" : "3px 10px";
  const fs = size === "sm" ? 10 : 11;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: color + "18", border: `1px solid ${color}40`,
      borderRadius: 4, padding: pad, fontSize: fs, fontWeight: 600,
      letterSpacing: "0.05em", color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {name}
    </span>
  );
}
