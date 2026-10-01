import type { ForecastTxn, Scenario, FundingStats, MonthBucket } from "./types";
import { FORECAST_TXNS } from "../data/forecastTxns";
import { CASH_CONFIG, MONTHLY_ACTUALS } from "../data/cashBalances";

const SPENDABLE_CASH = CASH_CONFIG.authoritativeClose - CASH_CONFIG.restrictedCash; // 1,840,000

// ── Scenario engine ───────────────────────────────────────────────────────────

function shiftDate(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function applyScenario(txns: ForecastTxn[], scenario: Scenario): ForecastTxn[] {
  return txns.map((tx) => {
    if (scenario === "base") return tx;

    const isInflow = tx.amount > 0;
    const isNegotiable = tx.negotiability === "negotiable";

    const delayDays: Record<Scenario, number> = {
      base: 0, receipts_1w: 7, receipts_2w: 14, receipts_3w: 21,
      defer_costs: 0, combined_2w: 14,
    };

    if (isInflow && delayDays[scenario] > 0) {
      return { ...tx, expectedDate: shiftDate(tx.expectedDate, delayDays[scenario]) };
    }

    if (isNegotiable && (scenario === "defer_costs" || scenario === "combined_2w")) {
      return { ...tx, expectedDate: shiftDate(tx.expectedDate, 30) };
    }

    return tx;
  });
}

// ── Cash walk ─────────────────────────────────────────────────────────────────

interface WalkPoint {
  date: string;
  balance: number;
  amount: number;
  txId: string;
  description: string;
  managementCategory: string;
  event: string | null;
  isInflow: boolean;
}

export function walkCash(scenario: Scenario = "base"): WalkPoint[] {
  const adjusted = applyScenario(FORECAST_TXNS, scenario);
  const sorted = [...adjusted].sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));

  let balance = SPENDABLE_CASH;
  return sorted.map((tx) => {
    balance += tx.amount;
    return {
      date: tx.expectedDate,
      balance,
      amount: tx.amount,
      txId: tx.id,
      description: tx.description,
      managementCategory: tx.managementCategory,
      event: tx.event,
      isInflow: tx.amount > 0,
    };
  });
}

// ── Funding stats ─────────────────────────────────────────────────────────────

export function fundingStats(scenario: Scenario = "base"): FundingStats {
  const walk = walkCash(scenario);

  let minBalance = SPENDABLE_CASH;
  let firstNegativeDate: string | null = null;
  let troughDate: string | null = null;

  for (const pt of walk) {
    if (pt.balance < minBalance) {
      minBalance = pt.balance;
      troughDate = pt.date;
    }
    if (pt.balance < 0 && firstNegativeDate === null) {
      firstNegativeDate = pt.date;
    }
  }

  const peakGap = Math.max(0, -minBalance);
  const deferrable = FORECAST_TXNS
    .filter((tx) => tx.negotiability === "negotiable" && tx.amount < 0)
    .reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const trueRequirement = Math.max(0, peakGap - deferrable);
  const endCash = walk[walk.length - 1]?.balance ?? SPENDABLE_CASH;

  function labelDate(d: string | null): string | null {
    if (!d) return null;
    // Parse as local date (split avoids UTC-midnight timezone shift)
    const [yr, mo, dy] = d.split("-").map(Number);
    const date = new Date(yr, mo - 1, dy);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return {
    spendableCash: SPENDABLE_CASH,
    peakGap,
    deferrable,
    trueRequirement,
    firstNegativeLabel: labelDate(firstNegativeDate),
    troughLabel: labelDate(troughDate),
    troughBalance: minBalance,
    endCash,
  };
}

// ── Monthly chart data ────────────────────────────────────────────────────────

// Builds unified actual + forecast monthly chart data for the main cash chart.
// Actual months: sourced from MONTHLY_ACTUALS (authoritative balances).
// Forecast months (Oct–Dec): aggregated from forecast transactions.

function monthKey(date: string): string {
  return date.slice(0, 7); // "2026-10"
}

const MONTH_LABELS: Record<string, string> = {
  "2026-01": "Jan", "2026-02": "Feb", "2026-03": "Mar", "2026-04": "Apr",
  "2026-05": "May", "2026-06": "Jun", "2026-07": "Jul", "2026-08": "Aug",
  "2026-09": "Sep", "2026-10": "Oct", "2026-11": "Nov", "2026-12": "Dec",
};

export function buildMonthlyChart(scenario: Scenario = "base"): MonthBucket[] {
  // Actual months from authoritative data
  const actuals: MonthBucket[] = MONTHLY_ACTUALS.map((m) => ({
    monthLabel: m.label,
    month: m.month,
    inflows: m.inflows,
    outflows: m.outflows,
    balance: m.closing,
    isActual: true,
  }));

  // Forecast months: aggregate from scenario-adjusted transactions
  const adjusted = applyScenario(FORECAST_TXNS, scenario);
  const forecastMonths = ["2026-10", "2026-11", "2026-12"];

  const forecastBuckets: MonthBucket[] = forecastMonths.map((month) => {
    const txns = adjusted.filter((tx) => monthKey(tx.expectedDate) === month);
    const inflows = txns.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);
    const outflows = txns.filter((tx) => tx.amount < 0).reduce((s, tx) => s + tx.amount, 0);
    return {
      monthLabel: MONTH_LABELS[month] ?? month,
      month,
      inflows,
      outflows,
      balance: 0, // computed below
      isActual: false,
    };
  });

  // Walk the balance forward from Sep closing
  let balance = MONTHLY_ACTUALS[MONTHLY_ACTUALS.length - 1].closing;
  for (const fb of forecastBuckets) {
    balance += fb.inflows + fb.outflows;
    fb.balance = balance;
  }

  return [...actuals, ...forecastBuckets];
}

// ── Driver tree helpers ───────────────────────────────────────────────────────

export interface DriverNode {
  label: string;
  amount: number;
  children: DriverNode[];
  txId?: string;
  event?: string | null;
  counterparty?: string;
  date?: string;
  status?: string;
  negotiability?: string;
}

// Builds inflow/outflow driver tree for a selected forecast month.
export function buildDriverTree(month: string, scenario: Scenario = "base"): { inflows: DriverNode; outflows: DriverNode } {
  const adjusted = applyScenario(FORECAST_TXNS, scenario);
  const txns = adjusted.filter((tx) => monthKey(tx.expectedDate) === month);

  function groupByCategory(list: ForecastTxn[]): DriverNode[] {
    const byCategory: Record<string, ForecastTxn[]> = {};
    for (const tx of list) {
      const key = tx.managementCategory;
      if (!byCategory[key]) byCategory[key] = [];
      byCategory[key].push(tx);
    }
    return Object.entries(byCategory).map(([cat, items]) => ({
      label: cat,
      amount: items.reduce((s, t) => s + t.amount, 0),
      children: items.map((t) => ({
        label: t.costItem,
        amount: t.amount,
        children: [],
        txId: t.id,
        event: t.event,
        counterparty: t.counterparty,
        date: t.expectedDate,
        status: t.status,
        negotiability: t.negotiability,
      })),
    }));
  }

  const inflowTxns = txns.filter((t) => t.amount > 0);
  const outflowTxns = txns.filter((t) => t.amount < 0);

  return {
    inflows: {
      label: "Inflows",
      amount: inflowTxns.reduce((s, t) => s + t.amount, 0),
      children: groupByCategory(inflowTxns),
    },
    outflows: {
      label: "Outflows",
      amount: outflowTxns.reduce((s, t) => s + t.amount, 0),
      children: groupByCategory(outflowTxns),
    },
  };
}

// Pre-computed funding stats for all scenarios (used by the comparison table)
export const ALL_SCENARIO_STATS: Record<Scenario, FundingStats> = {
  base: fundingStats("base"),
  receipts_1w: fundingStats("receipts_1w"),
  receipts_2w: fundingStats("receipts_2w"),
  receipts_3w: fundingStats("receipts_3w"),
  defer_costs: fundingStats("defer_costs"),
  combined_2w: fundingStats("combined_2w"),
};

export { SPENDABLE_CASH };
