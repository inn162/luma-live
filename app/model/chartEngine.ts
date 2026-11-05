import type { Scenario } from "./types";
import { FORECAST_TXNS } from "../data/forecastTxns";
import { MONTHLY_ACTUALS, CASH_CONFIG } from "../data/cashBalances";
import { applyScenario } from "./cashEngine";

// ── Color system ──────────────────────────────────────────────────────────────

export const CHART_COLORS = {
  opRevenue:       "#236B58",
  sponsorships:    "#55A68A",
  otherInflows:    "#B2DCC9",
  payrollOps:      "#244C7B",
  eventsProd:      "#5B85B6",
  otherExpenses:   "#A9C4DF",
  actualBalance:   "#283044",
  forecastBalance: "#7861D8",
  fundingGap:      "#F52D94",
  zeroline:        "#CBD5E1",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type ViewGranularity = "monthly" | "weekly";
export type ViewPeriod = "3M" | "6M" | "12M";

export interface PeriodBucket {
  label: string;
  periodStart: string;  // YYYY-MM-DD
  periodEnd: string;    // YYYY-MM-DD
  isActual: boolean;
  opRevenue: number;    // positive
  sponsorships: number; // positive
  otherInflows: number; // positive
  totalInflows: number; // positive
  payrollOps: number;    // negative
  eventsProd: number;    // negative
  otherExpenses: number; // negative
  totalOutflows: number; // negative
  netFlow: number;
  openingBalance: number;
  closingBalance: number;
}

// ── Category mapping ──────────────────────────────────────────────────────────

function mapInflowCat(cat: string): "opRevenue" | "sponsorships" | "otherInflows" {
  if (["Ticketing", "F&B Revenue", "Merch Revenue"].includes(cat)) return "opRevenue";
  if (cat === "Sponsorship") return "sponsorships";
  return "otherInflows";
}

function mapOutflowCat(cat: string): "payrollOps" | "eventsProd" | "otherExpenses" {
  if (["Payroll & People", "Corporate Overhead", "Marketing"].includes(cat)) return "payrollOps";
  if (["Production & Venue", "Event Operations", "Talent"].includes(cat)) return "eventsProd";
  return "otherExpenses";
}

// ── Actual monthly category breakdown ────────────────────────────────────────
// Reconciles exactly with MONTHLY_ACTUALS inflows/outflows.

const ACTUAL_CATS = [
  // month,          opRevenue  sponsorships  otherInflows | payrollOps  eventsProd  otherExpenses
  { month: "2026-01", opRevenue:  50_000, sponsorships:  25_000, otherInflows:  15_000, payrollOps: 130_000, eventsProd:  40_000, otherExpenses:  20_000 },
  { month: "2026-02", opRevenue: 130_000, sponsorships:  70_000, otherInflows:  20_000, payrollOps: 140_000, eventsProd:  90_000, otherExpenses:  30_000 },
  { month: "2026-03", opRevenue: 290_000, sponsorships: 160_000, otherInflows:  30_000, payrollOps: 150_000, eventsProd: 140_000, otherExpenses:  30_000 },
  { month: "2026-04", opRevenue: 200_000, sponsorships:  60_000, otherInflows:  20_000, payrollOps: 150_000, eventsProd: 260_000, otherExpenses:  30_000 },
  { month: "2026-05", opRevenue: 540_000, sponsorships: 200_000, otherInflows:  40_000, payrollOps: 160_000, eventsProd: 190_000, otherExpenses:  30_000 },
  { month: "2026-06", opRevenue: 280_000, sponsorships: 130_000, otherInflows:  30_000, payrollOps: 170_000, eventsProd: 360_000, otherExpenses:  30_000 },
  { month: "2026-07", opRevenue: 420_000, sponsorships: 180_000, otherInflows:  40_000, payrollOps: 160_000, eventsProd: 170_000, otherExpenses:  30_000 },
  { month: "2026-08", opRevenue: 260_000, sponsorships: 130_000, otherInflows:  30_000, payrollOps: 170_000, eventsProd: 440_000, otherExpenses:  30_000 },
  { month: "2026-09", opRevenue: 490_000, sponsorships: 230_000, otherInflows:  40_000, payrollOps: 170_000, eventsProd: 400_000, otherExpenses:  30_000 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const SPENDABLE_CASH = CASH_CONFIG.authoritativeClose - CASH_CONFIG.restrictedCash;

function daysInMonthNum(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function daysInMonthStr(monthStr: string): string {
  const [y, m] = monthStr.split("-").map(Number);
  return String(daysInMonthNum(y, m)).padStart(2, "0");
}

function dayStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getFixedWeeks(year: number, month: number): { start: number; end: number; label: string }[] {
  const dim = daysInMonthNum(year, month);
  const ml  = MONTH_SHORT[month - 1];
  return [
    { start: 1,  end: 7,   label: `${ml} W1` },
    { start: 8,  end: 14,  label: `${ml} W2` },
    { start: 15, end: 21,  label: `${ml} W3` },
    { start: 22, end: dim, label: `${ml} W4` },
  ];
}

// ── Monthly buckets ───────────────────────────────────────────────────────────

export function buildMonthlyBuckets(scenario: Scenario = "base"): PeriodBucket[] {
  // Actual months (Jan–Sep)
  const janOpening = MONTHLY_ACTUALS[0].closing - (MONTHLY_ACTUALS[0].inflows + MONTHLY_ACTUALS[0].outflows);

  const actuals: PeriodBucket[] = MONTHLY_ACTUALS.map((m, i) => {
    const cats    = ACTUAL_CATS[i];
    const opening = i === 0 ? janOpening : MONTHLY_ACTUALS[i - 1].closing;
    return {
      label:        m.label,
      periodStart:  `${m.month}-01`,
      periodEnd:    `${m.month}-${daysInMonthStr(m.month)}`,
      isActual:     true,
      opRevenue:    cats.opRevenue,
      sponsorships: cats.sponsorships,
      otherInflows: cats.otherInflows,
      totalInflows: m.inflows,
      payrollOps:   -cats.payrollOps,
      eventsProd:   -cats.eventsProd,
      otherExpenses:-cats.otherExpenses,
      totalOutflows: m.outflows,
      netFlow:       m.inflows + m.outflows,
      openingBalance: opening,
      closingBalance: m.closing,
    };
  });

  // Forecast months (Oct–Dec) — walk from spendable cash
  const adjusted  = applyScenario(FORECAST_TXNS, scenario);
  const fMonths   = ["2026-10", "2026-11", "2026-12"];
  const fLabels: Record<string, string> = { "2026-10": "Oct", "2026-11": "Nov", "2026-12": "Dec" };

  let balance = SPENDABLE_CASH;

  const forecasts: PeriodBucket[] = fMonths.map((month) => {
    const txns = adjusted.filter((tx) => tx.expectedDate.slice(0, 7) === month);
    let opRevenue = 0, sponsorships = 0, otherInflows = 0;
    let payrollOps = 0, eventsProd = 0, otherExpenses = 0;

    for (const tx of txns) {
      if (tx.amount > 0) {
        const cat = mapInflowCat(tx.managementCategory);
        if (cat === "opRevenue")    opRevenue    += tx.amount;
        else if (cat === "sponsorships") sponsorships += tx.amount;
        else                        otherInflows += tx.amount;
      } else {
        const cat = mapOutflowCat(tx.managementCategory);
        if (cat === "payrollOps")   payrollOps   += tx.amount;
        else if (cat === "eventsProd")   eventsProd   += tx.amount;
        else                        otherExpenses += tx.amount;
      }
    }

    const totalInflows  = opRevenue + sponsorships + otherInflows;
    const totalOutflows = payrollOps + eventsProd + otherExpenses;
    const opening = balance;
    balance += totalInflows + totalOutflows;

    return {
      label:        fLabels[month] ?? month,
      periodStart:  `${month}-01`,
      periodEnd:    `${month}-${daysInMonthStr(month)}`,
      isActual:     false,
      opRevenue, sponsorships, otherInflows, totalInflows,
      payrollOps, eventsProd, otherExpenses, totalOutflows,
      netFlow:        totalInflows + totalOutflows,
      openingBalance: opening,
      closingBalance: balance,
    };
  });

  return [...actuals, ...forecasts];
}

// ── Weekly buckets ────────────────────────────────────────────────────────────

// Distribute monthly actual amounts into 4 fixed weeks per month.
// Last week gets exact remainder to prevent rounding drift.
// After each month, snap to authoritative closing balance.

const WEEK_WEIGHTS = {
  opRevenue:    [0.20, 0.30, 0.30, 0.20],
  sponsorships: [0.60, 0.00, 0.40, 0.00],  // lumpy: advance week 1, balance week 3
  otherInflows: [0.25, 0.25, 0.25, 0.25],
  payrollOps:   [0.08, 0.60, 0.17, 0.15],  // payroll dominates week 2
  eventsProd:   [0.15, 0.30, 0.35, 0.20],
  otherExpenses:[0.25, 0.25, 0.25, 0.25],
} as const;

export function buildWeeklyBuckets(scenario: Scenario = "base"): PeriodBucket[] {
  const buckets: PeriodBucket[] = [];

  // Jan 1 opening (back-calculated from Jan closing and Jan net flow)
  let running = MONTHLY_ACTUALS[0].closing - (MONTHLY_ACTUALS[0].inflows + MONTHLY_ACTUALS[0].outflows);

  // ── Actual months ─────────────────────────────────────────────────────────
  for (let mi = 0; mi < MONTHLY_ACTUALS.length; mi++) {
    const m    = MONTHLY_ACTUALS[mi];
    const cats = ACTUAL_CATS[mi];
    const [year, monthNum] = m.month.split("-").map(Number);
    const weeks = getFixedWeeks(year, monthNum);

    type CatKey = keyof typeof WEEK_WEIGHTS;
    const catKeys: CatKey[] = ["opRevenue","sponsorships","otherInflows","payrollOps","eventsProd","otherExpenses"];
    const catTotals: Record<CatKey, number> = {
      opRevenue:    cats.opRevenue,
      sponsorships: cats.sponsorships,
      otherInflows: cats.otherInflows,
      payrollOps:   cats.payrollOps,
      eventsProd:   cats.eventsProd,
      otherExpenses:cats.otherExpenses,
    };

    // Track per-category running sums for exact-remainder computation
    const catAccum: Record<CatKey, number> = {
      opRevenue: 0, sponsorships: 0, otherInflows: 0,
      payrollOps: 0, eventsProd: 0, otherExpenses: 0,
    };

    for (let wi = 0; wi < 4; wi++) {
      const week   = weeks[wi];
      const isLast = wi === 3;

      const weekCats: Record<CatKey, number> = {} as Record<CatKey, number>;
      for (const key of catKeys) {
        const total = catTotals[key];
        const amt   = isLast
          ? total - catAccum[key]
          : Math.round(WEEK_WEIGHTS[key][wi] * total);
        weekCats[key]    = amt;
        catAccum[key]   += amt;
      }

      // Inflows are stored positive; outflows are stored negative
      const opRevenue    = weekCats.opRevenue;
      const sponsorships = weekCats.sponsorships;
      const otherInflows = weekCats.otherInflows;
      const payrollOps   = -weekCats.payrollOps;
      const eventsProd   = -weekCats.eventsProd;
      const otherExpenses= -weekCats.otherExpenses;

      const totalInflows  = opRevenue + sponsorships + otherInflows;
      const totalOutflows = payrollOps + eventsProd + otherExpenses;
      const netFlow = totalInflows + totalOutflows;
      const opening = running;
      running += netFlow;

      buckets.push({
        label:        week.label,
        periodStart:  dayStr(year, monthNum, week.start),
        periodEnd:    dayStr(year, monthNum, week.end),
        isActual:     true,
        opRevenue, sponsorships, otherInflows, totalInflows,
        payrollOps, eventsProd, otherExpenses, totalOutflows,
        netFlow, openingBalance: opening, closingBalance: running,
      });
    }

    // Snap to authoritative month-end closing to eliminate rounding drift
    if (Math.abs(m.closing - running) > 0) {
      const last = buckets[buckets.length - 1];
      last.closingBalance = m.closing;
      last.netFlow += m.closing - running;
    }
    running = m.closing;
  }

  // ── Forecast weeks (Oct–Dec) ──────────────────────────────────────────────
  const adjusted = applyScenario(FORECAST_TXNS, scenario);
  running = SPENDABLE_CASH;

  for (let monthNum = 10; monthNum <= 12; monthNum++) {
    const year  = 2026;
    const weeks = getFixedWeeks(year, monthNum);

    for (const week of weeks) {
      const startStr = dayStr(year, monthNum, week.start);
      const endStr   = dayStr(year, monthNum, week.end);

      const weekTxns = adjusted.filter(
        (tx) => tx.expectedDate >= startStr && tx.expectedDate <= endStr
      );

      let opRevenue = 0, sponsorships = 0, otherInflows = 0;
      let payrollOps = 0, eventsProd = 0, otherExpenses = 0;

      for (const tx of weekTxns) {
        if (tx.amount > 0) {
          const cat = mapInflowCat(tx.managementCategory);
          if (cat === "opRevenue")     opRevenue    += tx.amount;
          else if (cat === "sponsorships") sponsorships += tx.amount;
          else                         otherInflows += tx.amount;
        } else {
          const cat = mapOutflowCat(tx.managementCategory);
          if (cat === "payrollOps")    payrollOps   += tx.amount;
          else if (cat === "eventsProd")    eventsProd   += tx.amount;
          else                         otherExpenses += tx.amount;
        }
      }

      const totalInflows  = opRevenue + sponsorships + otherInflows;
      const totalOutflows = payrollOps + eventsProd + otherExpenses;
      const netFlow = totalInflows + totalOutflows;
      const opening = running;
      running += netFlow;

      buckets.push({
        label:        week.label,
        periodStart:  startStr,
        periodEnd:    endStr,
        isActual:     false,
        opRevenue, sponsorships, otherInflows, totalInflows,
        payrollOps, eventsProd, otherExpenses, totalOutflows,
        netFlow, openingBalance: opening, closingBalance: running,
      });
    }
  }

  return buckets;
}

// ── Period filtering ──────────────────────────────────────────────────────────

export function filterByPeriod(buckets: PeriodBucket[], period: ViewPeriod): PeriodBucket[] {
  if (period === "12M") return buckets;
  const cutoff = period === "3M" ? "2026-10-01" : "2026-07-01";
  return buckets.filter((b) => b.periodEnd >= cutoff);
}
