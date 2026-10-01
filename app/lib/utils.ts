export function fmtUSD(n: number, compact = false): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (compact) {
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}$${Math.round(abs / 1000)}K`;
    return `${sign}$${Math.round(abs).toLocaleString()}`;
  }
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}

export function fmtK(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.round(abs / 1000)}K`;
}

export function fmtPct(n: number, showSign = false): string {
  const s = (Math.abs(n) * 100).toFixed(1) + "%";
  if (!showSign) return s;
  return (n >= 0 ? "+" : "-") + s;
}

export function variancePct(actual: number, budget: number): number {
  if (budget === 0) return 0;
  return (actual - budget) / Math.abs(budget);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function sumBy<T>(arr: T[], fn: (x: T) => number): number {
  return arr.reduce((s, x) => s + fn(x), 0);
}

export const EVENT_COLORS: Record<string, string> = {
  COV26: "#7C3AED",
  SOL26: "#D97706",
  HBR26: "#0891B2",
  MRD26: "#059669",
  VRT26: "#DB2777",
};

export const EVENT_NAMES: Record<string, string> = {
  COV26: "Cove",
  SOL26: "Solaris",
  HBR26: "Harbor",
  MRD26: "Meridian",
  VRT26: "Vertigo NYE",
};

export function eventColor(code: string): string {
  return EVENT_COLORS[code] ?? "#6B7280";
}

export function eventName(code: string): string {
  return EVENT_NAMES[code] ?? code;
}
