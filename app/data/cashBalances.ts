import type { MonthlyBalance, CashConfig } from "../model/types";

// Authoritative month-end balances sourced from the fictional balance sheet.
// These are bank-reconciled closing figures — the cash engine snaps to these.
export const MONTHLY_BALANCES: MonthlyBalance[] = [
  { month: "2026-01", balance: 1_720_000 },
  { month: "2026-02", balance: 1_680_000 },
  { month: "2026-03", balance: 1_840_000 },
  { month: "2026-04", balance: 1_680_000 },
  { month: "2026-05", balance: 2_080_000 },
  { month: "2026-06", balance: 1_960_000 },
  { month: "2026-07", balance: 2_240_000 },
  { month: "2026-08", balance: 2_020_000 },
  { month: "2026-09", balance: 2_180_000 },
];

// As of Oct 1, 2026:
//   Balance sheet closing (Sep 30): $2,180,000
//   Less: venue security deposits (Clearwater Venues — non-spendable): $340,000
//   = Spendable cash today: $1,840,000
export const CASH_CONFIG: CashConfig = {
  authoritativeClose: 2_180_000,
  restrictedCash: 340_000,
  asOf: "2026-10-01",
};

// Monthly aggregate cash flows for the actual period (used by the chart)
// Derived to be consistent with the authoritative closing balances above.
export const MONTHLY_ACTUALS = [
  { month: "2026-01", label: "Jan", inflows:  90_000, outflows: -190_000, closing: 1_720_000 },
  { month: "2026-02", label: "Feb", inflows: 220_000, outflows: -260_000, closing: 1_680_000 },
  { month: "2026-03", label: "Mar", inflows: 480_000, outflows: -320_000, closing: 1_840_000 },
  { month: "2026-04", label: "Apr", inflows: 280_000, outflows: -440_000, closing: 1_680_000 },
  { month: "2026-05", label: "May", inflows: 780_000, outflows: -380_000, closing: 2_080_000 },
  { month: "2026-06", label: "Jun", inflows: 440_000, outflows: -560_000, closing: 1_960_000 },
  { month: "2026-07", label: "Jul", inflows: 640_000, outflows: -360_000, closing: 2_240_000 },
  { month: "2026-08", label: "Aug", inflows: 420_000, outflows: -640_000, closing: 2_020_000 },
  { month: "2026-09", label: "Sep", inflows: 760_000, outflows: -600_000, closing: 2_180_000 },
];
