// ── Events ────────────────────────────────────────────────────────────────────

export type EventStatus = "completed" | "settling" | "upcoming";

export interface LumaEvent {
  code: string;
  name: string;
  date: string;          // YYYY-MM-DD (event day)
  presaleOpen: string;   // YYYY-MM-DD
  lastSettlement: string;// YYYY-MM-DD
  capacity: number;
  year: number;          // edition number
  status: EventStatus;
  color: string;
}

// ── Cash Balances ─────────────────────────────────────────────────────────────

export interface MonthlyBalance {
  month: string;   // "2026-01"
  balance: number; // authoritative closing balance (USD)
}

export interface CashConfig {
  authoritativeClose: number;   // Sep 30 balance sheet balance
  restrictedCash: number;       // security deposits, non-spendable
  asOf: string;                 // "2026-10-01"
}

// ── Forecast Transactions ─────────────────────────────────────────────────────

export type TxStatus = "confirmed" | "forecast" | "unconfirmed" | "pending_docs";
export type Negotiability = "non_negotiable" | "negotiable" | "na";

export interface ForecastTxn {
  id: string;
  expectedDate: string;    // YYYY-MM-DD
  counterparty: string;
  description: string;
  managementCategory: string;
  costItem: string;
  event: string | null;
  amount: number;          // positive = inflow, negative = outflow
  status: TxStatus;
  negotiability: Negotiability;
}

// ── GL Transactions ───────────────────────────────────────────────────────────

export type Confidence = "high" | "medium" | "low" | "needs_review";
export type SettlementType = "revenue" | "booking" | "payment";

export interface GLRow {
  id: string;
  date: string;
  account: string;
  accountName: string;
  amount: number;          // positive = cash out (cost), negative = cash in (revenue/inflow)
  vendor: string;
  eventRef: string | null; // raw event reference on the GL entry
  description: string;
  flowType: string;
  managementCategory: string;
  costItem: string;
  event: string | null;    // resolved event code
  confidence: Confidence;
  settlementType: SettlementType;
}

// ── Budget ────────────────────────────────────────────────────────────────────

export interface EventBudget {
  code: string;
  revenue: number;
  talent: number;
  production: number;
  operations: number;
  marketing: number;
  other: number;
  directCosts: number;
  contribution: number;
}

export interface CompanyBudget {
  overhead: number;    // annual corporate overhead budget
  selling: number;     // selling & marketing (company level)
  ebitda: number;
}

// ── Cash Engine ───────────────────────────────────────────────────────────────

export type Scenario =
  | "base"
  | "receipts_1w"
  | "receipts_2w"
  | "defer_costs"
  | "combined_2w";

export interface CashPoint {
  date: string;
  balance: number;
  txId?: string;
  isActual: boolean;
}

export interface WeekBucket {
  weekLabel: string;    // "Oct W1"
  weekStart: string;    // YYYY-MM-DD
  inflows: number;
  outflows: number;
  balance: number;
  isActual: boolean;
  isTrough?: boolean;
}

export interface MonthBucket {
  monthLabel: string;   // "Jan"
  month: string;        // "2026-01"
  inflows: number;
  outflows: number;
  balance: number;
  isActual: boolean;
}

export interface FundingStats {
  spendableCash: number;
  peakGap: number;
  deferrable: number;
  trueRequirement: number;
  firstNegativeLabel: string | null;
  troughLabel: string | null;
  troughBalance: number;
  endCash: number;
}

// ── Event Economics ───────────────────────────────────────────────────────────

export interface CostLedger {
  category: string;
  booked: number;
  paid: number;
  remaining: number;
}

export interface EventEconomics {
  code: string;
  revenueActual: number;      // accrual basis (recognized at event)
  revenueBillings: number;    // cash basis (ticket sales received)
  directCostsBooked: number;
  directCostsPaid: number;
  directCostsRemaining: number;
  contribution: number;
  ledgers: CostLedger[];
  ticketsSold: number;
  revenuePerAttendee: number;
  budgetRevenue: number;
  budgetContribution: number;
}

// ── Classification Demo ───────────────────────────────────────────────────────

export interface ClassifyRule {
  ruleId: string;
  description: string;
  match: string;
  result: string;
}

export interface ClassifyExample {
  raw: {
    date: string;
    account: string;
    vendor: string;
    ref: string | null;
    description: string;
    amount: string;
  };
  rules: ClassifyRule[];
  result: {
    event: string;
    category: string;
    item: string;
    confidence: string;
  };
}
