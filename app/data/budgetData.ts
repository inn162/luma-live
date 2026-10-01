import type { EventBudget, CompanyBudget } from "../model/types";

export const EVENT_BUDGETS: Record<string, EventBudget> = {
  COV26: {
    code: "COV26",
    revenue: 600_000,
    talent: 190_000,
    production: 130_000,
    operations: 75_000,
    marketing: 50_000,
    other: 0,
    directCosts: 445_000,
    contribution: 155_000,
  },
  SOL26: {
    code: "SOL26",
    revenue: 3_000_000,
    talent: 640_000,
    production: 740_000,
    operations: 300_000,
    marketing: 180_000,
    other: 0,
    directCosts: 1_860_000,
    contribution: 1_140_000,
  },
  HBR26: {
    code: "HBR26",
    revenue: 1_280_000,
    talent: 330_000,
    production: 300_000,
    operations: 160_000,
    marketing: 110_000,
    other: 0,
    directCosts: 900_000,
    contribution: 380_000,
  },
  MRD26: {
    code: "MRD26",
    revenue: 2_400_000,
    talent: 580_000,
    production: 700_000,
    operations: 360_000,
    marketing: 160_000,
    other: 0,
    directCosts: 1_800_000,
    contribution: 600_000,
  },
  VRT26: {
    code: "VRT26",
    revenue: 1_580_000,
    talent: 480_000,
    production: 380_000,
    operations: 280_000,
    marketing: 80_000,
    other: 100_000,
    directCosts: 1_320_000,
    contribution: 260_000,
  },
};

export const COMPANY_BUDGET: CompanyBudget = {
  overhead: 1_280_000,
  selling: 0,
  ebitda: 1_255_000, // Σ contributions − overhead
};

// Actuals for completed events (sourced from GL aggregates)
export const EVENT_ACTUALS: Record<string, { revenue: number; directCosts: number; contribution: number; ticketsSold: number }> = {
  COV26: { revenue: 642_000,   directCosts: 480_000,   contribution: 162_000,  ticketsSold: 3_200 },
  SOL26: { revenue: 3_180_000, directCosts: 1_840_000, contribution: 1_340_000, ticketsSold: 21_500 },
  HBR26: { revenue: 1_200_000, directCosts: 840_000,   contribution: 360_000,  ticketsSold: 7_800 },
  MRD26: { revenue: 2_240_000, directCosts: 1_820_000, contribution: 420_000,  ticketsSold: 12_800 },
  VRT26: { revenue: 960_000,   directCosts: 520_000,   contribution: 440_000,  ticketsSold: 3_400 }, // YTD only (event not held)
};

// Ticket billings (cash received) vs accrual (recognized at event) by month
// Used for accrual-vs-cash revenue chart
export const TICKET_BILLINGS_BY_MONTH: Record<string, Array<{ month: string; billings: number; accrual: number }>> = {
  SOL26: [
    { month: "2025-11", billings: 156_000,   accrual: 0 },
    { month: "2026-01", billings: 448_000,   accrual: 0 },
    { month: "2026-02", billings: 0,          accrual: 0 },
    { month: "2026-04", billings: 620_000,   accrual: 0 },
    { month: "2026-05", billings: 550_000,   accrual: 0 },
    { month: "2026-06", billings: 646_000,   accrual: 3_180_000 }, // ← recognized at event
  ],
  MRD26: [
    { month: "2026-04", billings: 198_000,   accrual: 0 },
    { month: "2026-06", billings: 660_000,   accrual: 0 },
    { month: "2026-09", billings: 782_000,   accrual: 2_240_000 }, // ← recognized at event
  ],
};
