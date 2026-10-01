export function fmtUSD(n: number, compact = false): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const v = (abs / 1_000_000).toFixed(1);
    return `${sign}$${v}M`;
  }
  if (abs >= 1_000) {
    const v = Math.round(abs / 1000);
    return `${sign}$${v}K`;
  }
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}

export function fmtPct(n: number, showSign = false): string {
  const abs = (Math.abs(n) * 100).toFixed(1) + "%";
  if (!showSign) return abs;
  return (n >= 0 ? "+" : "-") + abs;
}

export function variancePct(actual: number, budget: number): number {
  if (budget === 0) return 0;
  return (actual - budget) / Math.abs(budget);
}

export function getEventColor(code: string): string {
  const map: Record<string, string> = {
    EC26: "#3B82F6", AG26: "#F59E0B", TL26: "#14B8A6", NV26: "#8B5CF6", ANE26: "#93C5FD",
  };
  return map[code] ?? "#9A9A9A";
}

export function getEventName(code: string): string {
  const map: Record<string, string> = {
    EC26: "Echo", AG26: "Afterglow", TL26: "Tideline", NV26: "Nova", ANE26: "Aurora NYE",
  };
  return map[code] ?? code;
}
