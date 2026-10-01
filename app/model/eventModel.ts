import type { EventEconomics, CostLedger } from "./types";
import { GL_ROWS } from "../data/glTransactions";
import { EVENT_BUDGETS, EVENT_ACTUALS } from "../data/budgetData";
import { EVENTS } from "../data/events";

// ── Three cost ledgers ────────────────────────────────────────────────────────
// Booked  = sum of booking/accrual entries (what the P&L charges)
// Paid    = sum of payment entries (actual cash out)
// Remaining = Booked − Paid (AP outstanding)
// These three serve different management questions and deliberately don't reconcile.

function costLedgersForEvent(eventCode: string): CostLedger[] {
  const rows = GL_ROWS.filter(
    (r) => r.event === eventCode && r.settlementType !== "revenue"
  );

  const categories = [...new Set(rows.map((r) => r.managementCategory))];

  return categories.map((cat) => {
    const catRows = rows.filter((r) => r.managementCategory === cat);
    const booked = catRows
      .filter((r) => r.settlementType === "booking")
      .reduce((s, r) => s + r.amount, 0);
    const paid = catRows
      .filter((r) => r.settlementType === "payment")
      .reduce((s, r) => s + r.amount, 0);
    return {
      category: cat,
      booked,
      paid,
      remaining: booked - paid,
    };
  });
}

// ── Event economics ───────────────────────────────────────────────────────────

export function buildEventEconomics(eventCode: string): EventEconomics {
  const actuals = EVENT_ACTUALS[eventCode];
  const budget = EVENT_BUDGETS[eventCode];
  const event = EVENTS.find((e) => e.code === eventCode);

  if (!actuals || !budget || !event) {
    throw new Error(`Unknown event: ${eventCode}`);
  }

  const ledgers = costLedgersForEvent(eventCode);
  const booked = ledgers.reduce((s, l) => s + l.booked, 0);
  const paid = ledgers.reduce((s, l) => s + l.paid, 0);
  const remaining = booked - paid;

  // For upcoming events, revenue is billings (cash collected so far)
  const revenueActual = event.status !== "upcoming" ? actuals.revenue : 0;
  const revenueBillings = actuals.revenue; // For completed events equals accrual; for upcoming, YTD billings

  return {
    code: eventCode,
    revenueActual,
    revenueBillings,
    directCostsBooked: booked,
    directCostsPaid: paid,
    directCostsRemaining: remaining,
    contribution: revenueActual - booked,
    ledgers,
    ticketsSold: actuals.ticketsSold,
    revenuePerAttendee: actuals.ticketsSold > 0 ? Math.round(revenueActual / actuals.ticketsSold) : 0,
    budgetRevenue: budget.revenue,
    budgetContribution: budget.contribution,
  };
}

// ── Accrual vs cash revenue timeline ─────────────────────────────────────────
// Returns monthly data for the "Revenue: accrual vs cash" chart for a given event.

export function accrualVsCashTimeline(eventCode: string): Array<{
  month: string;
  label: string;
  billings: number;
  cumulativeBillings: number;
  accrual: number;
}> {
  const revenueRows = GL_ROWS.filter(
    (r) => r.event === eventCode && r.settlementType === "revenue"
  );

  // Group by month
  const byMonth: Record<string, number> = {};
  for (const row of revenueRows) {
    const month = row.date.slice(0, 7);
    byMonth[month] = (byMonth[month] ?? 0) + Math.abs(row.amount);
  }

  // Find the event date for marking accrual recognition
  const event = EVENTS.find((e) => e.code === eventCode);
  const eventMonth = event?.date.slice(0, 7) ?? "";

  const months = Object.keys(byMonth).sort();
  let cumulative = 0;

  const LABELS: Record<string, string> = {
    "2025-10": "Oct '25", "2025-11": "Nov '25", "2025-12": "Dec '25",
    "2026-01": "Jan", "2026-02": "Feb", "2026-03": "Mar", "2026-04": "Apr",
    "2026-05": "May", "2026-06": "Jun", "2026-07": "Jul", "2026-08": "Aug",
    "2026-09": "Sep", "2026-10": "Oct",
  };

  return months.map((month) => {
    cumulative += byMonth[month];
    return {
      month,
      label: LABELS[month] ?? month,
      billings: byMonth[month],
      cumulativeBillings: cumulative,
      accrual: month === eventMonth ? (EVENT_ACTUALS[eventCode]?.revenue ?? 0) : 0,
    };
  });
}

// ── Event P&L for all events ──────────────────────────────────────────────────

export const ALL_EVENT_ECONOMICS: Record<string, EventEconomics> = Object.fromEntries(
  ["COV26", "SOL26", "HBR26", "MRD26", "VRT26"].map((code) => [
    code,
    buildEventEconomics(code),
  ])
);
