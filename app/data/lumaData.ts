export const EVENTS = [
  { code: "EC26",  name: "Echo",       year: 2026, date: "2026-03-14", days: 1, status: "completed", color: "#3B82F6", capacity: 8000  },
  { code: "AG26",  name: "Afterglow",  year: 2026, date: "2026-06-20", days: 2, status: "completed", color: "#F59E0B", capacity: 28000 },
  { code: "TL26",  name: "Tideline",   year: 2026, date: "2026-08-08", days: 2, status: "completed", color: "#14B8A6", capacity: 22000 },
  { code: "NV26",  name: "Nova",       year: 2026, date: "2026-11-07", days: 3, status: "active",    color: "#8B5CF6", capacity: 55000 },
  { code: "ANE26", name: "Aurora NYE", year: 2026, date: "2026-12-31", days: 1, status: "upcoming",  color: "#93C5FD", capacity: 4500  },
] as const;

export type EventCode = "EC26" | "AG26" | "TL26" | "NV26" | "ANE26";

export interface EventFinancials {
  ticketing: number; sponsorship: number; fnb: number; merchandise: number; other: number;
  talent: number; production: number; venue: number; operations: number; marketing: number;
  ticketingFees: number; otherDirect: number;
}

export const EVENT_FINANCIALS: Record<EventCode, {
  actual: EventFinancials;
  budget: EventFinancials;
  ticketsSold: number; budgetTickets: number;
  avgYield: number; budgetAvgYield: number;
}> = {
  EC26: {
    actual:  { ticketing: 854800, sponsorship: 76000, fnb: 27400, merchandise: 11800, other: 0,
               talent: 418000, production: 158000, venue: 64000, operations: 54000, marketing: 31000, ticketingFees: 8200, otherDirect: 6800 },
    budget:  { ticketing: 780000, sponsorship: 60000, fnb: 22000, merchandise: 8000, other: 0,
               talent: 400000, production: 148000, venue: 62000, operations: 52000, marketing: 38000, ticketingFees: 7500, otherDirect: 20500 },
    ticketsSold: 7240, budgetTickets: 7100, avgYield: 118, budgetAvgYield: 110,
  },
  AG26: {
    actual:  { ticketing: 3742000, sponsorship: 481000, fnb: 218000, merchandise: 109000, other: 0,
               talent: 1418000, production: 838000, venue: 421000, operations: 308000, marketing: 209000, ticketingFees: 99000, otherDirect: 7000 },
    budget:  { ticketing: 3480000, sponsorship: 420000, fnb: 195000, merchandise: 120000, other: 0,
               talent: 1380000, production: 810000, venue: 410000, operations: 298000, marketing: 228000, ticketingFees: 95000, otherDirect: 13000 },
    ticketsSold: 24600, budgetTickets: 26000, avgYield: 152, budgetAvgYield: 134,
  },
  TL26: {
    actual:  { ticketing: 2634000, sponsorship: 338000, fnb: 152000, merchandise: 76000, other: 0,
               talent: 1048000, production: 680000, venue: 358000, operations: 218000, marketing: 88000, ticketingFees: 51000, otherDirect: 7000 },
    budget:  { ticketing: 2800000, sponsorship: 360000, fnb: 160000, merchandise: 90000, other: 89000,
               talent: 1080000, production: 660000, venue: 350000, operations: 210000, marketing: 100000, ticketingFees: 55000, otherDirect: 0 },
    ticketsSold: 19100, budgetTickets: 20000, avgYield: 138, budgetAvgYield: 140,
  },
  NV26: {
    actual:  { ticketing: 4196000, sponsorship: 480000, fnb: 0, merchandise: 0, other: 0,
               talent: 342000, production: 345000, venue: 180000, operations: 0, marketing: 152000, ticketingFees: 0, otherDirect: 0 },
    budget:  { ticketing: 6171000, sponsorship: 800000, fnb: 380000, merchandise: 249000, other: 0,
               talent: 2850000, production: 1382000, venue: 618000, operations: 448000, marketing: 182000, ticketingFees: 70000, otherDirect: 0 },
    ticketsSold: 37400, budgetTickets: 55000, avgYield: 112, budgetAvgYield: 165,
  },
  ANE26: {
    actual:  { ticketing: 0, sponsorship: 0, fnb: 0, merchandise: 0, other: 0,
               talent: 0, production: 0, venue: 0, operations: 0, marketing: 0, ticketingFees: 0, otherDirect: 0 },
    budget:  { ticketing: 1058000, sponsorship: 175000, fnb: 68000, merchandise: 49000, other: 0,
               talent: 405000, production: 203000, venue: 135000, operations: 90000, marketing: 45000, ticketingFees: 22000, otherDirect: 0 },
    ticketsSold: 0, budgetTickets: 4500, avgYield: 0, budgetAvgYield: 235,
  },
};

export function totalRevenue(f: EventFinancials) {
  return f.ticketing + f.sponsorship + f.fnb + f.merchandise + f.other;
}
export function totalCosts(f: EventFinancials) {
  return f.talent + f.production + f.venue + f.operations + f.marketing + f.ticketingFees + f.otherDirect;
}
export function contribution(f: EventFinancials) {
  return totalRevenue(f) - totalCosts(f);
}

export const MONTHLY_REVENUE = [
  { month: "Jan", actual: 142000,  budget: 120000  },
  { month: "Feb", actual: 318000,  budget: 280000  },
  { month: "Mar", actual: 1042000, budget: 940000  },
  { month: "Apr", actual: 680000,  budget: 640000  },
  { month: "May", actual: 1480000, budget: 1350000 },
  { month: "Jun", actual: 1820000, budget: 1680000 },
  { month: "Jul", actual: 810000,  budget: 880000  },
  { month: "Aug", actual: 1540000, budget: 1620000 },
  { month: "Sep", actual: 920000,  budget: 980000  },
  { month: "Oct", actual: null,    budget: 1240000 },
  { month: "Nov", actual: null,    budget: 2850000 },
  { month: "Dec", actual: null,    budget: 1280000 },
];

export const TICKET_TIERS: Record<EventCode, Array<{ tier: string; sold: number; budget: number; avgPrice: number }>> = {
  EC26: [
    { tier: "Early Bird GA", sold: 1820, budget: 1600, avgPrice: 79 },
    { tier: "GA Tier 1",     sold: 2640, budget: 2500, avgPrice: 99 },
    { tier: "GA Tier 2",     sold: 1920, budget: 1800, avgPrice: 119 },
    { tier: "Final Release", sold: 480,  budget: 600,  avgPrice: 145 },
    { tier: "VIP",           sold: 380,  budget: 600,  avgPrice: 285 },
  ],
  AG26: [
    { tier: "Early Bird GA", sold: 4800, budget: 5200, avgPrice: 99 },
    { tier: "GA Tier 1",     sold: 7200, budget: 7500, avgPrice: 129 },
    { tier: "GA Tier 2",     sold: 6100, budget: 6800, avgPrice: 149 },
    { tier: "Final Release", sold: 4200, budget: 4500, avgPrice: 175 },
    { tier: "VIP",           sold: 2300, budget: 2000, avgPrice: 310 },
  ],
  TL26: [
    { tier: "Early Bird GA", sold: 3600, budget: 4000, avgPrice: 95 },
    { tier: "GA Tier 1",     sold: 5800, budget: 6200, avgPrice: 119 },
    { tier: "GA Tier 2",     sold: 5200, budget: 5500, avgPrice: 139 },
    { tier: "Final Release", sold: 2900, budget: 2800, avgPrice: 165 },
    { tier: "VIP",           sold: 1600, budget: 1500, avgPrice: 290 },
  ],
  NV26: [
    { tier: "Early Bird GA", sold: 8200,  budget: 11000, avgPrice: 89 },
    { tier: "GA Tier 1",     sold: 12400, budget: 15000, avgPrice: 109 },
    { tier: "GA Tier 2",     sold: 10800, budget: 14000, avgPrice: 129 },
    { tier: "Final Release", sold: 4200,  budget: 9000,  avgPrice: 155 },
    { tier: "VIP",           sold: 1800,  budget: 6000,  avgPrice: 320 },
  ],
  ANE26: [
    { tier: "Early Bird GA", sold: 0, budget: 900,  avgPrice: 175 },
    { tier: "GA Tier 1",     sold: 0, budget: 1200, avgPrice: 225 },
    { tier: "GA Tier 2",     sold: 0, budget: 1100, avgPrice: 265 },
    { tier: "Final Release", sold: 0, budget: 700,  avgPrice: 320 },
    { tier: "VIP",           sold: 0, budget: 600,  avgPrice: 420 },
  ],
};

export const AG26_CUMULATIVE = [
  { month: "Oct '25", actual: 1200,  forecast: 1500  },
  { month: "Nov '25", actual: 3800,  forecast: 4000  },
  { month: "Dec '25", actual: 6400,  forecast: 6200  },
  { month: "Jan '26", actual: 9100,  forecast: 9000  },
  { month: "Feb '26", actual: 12800, forecast: 13000 },
  { month: "Mar '26", actual: 16200, forecast: 16500 },
  { month: "Apr '26", actual: 19800, forecast: 20000 },
  { month: "May '26", actual: 22900, forecast: 23500 },
  { month: "Jun '26", actual: 24600, forecast: 26000 },
];

export const CASH_FLOW = [
  { month: "Jan", inflow: 142000,  outflow: -228000,  net: -86000,   balance: 1820000, forecast: false },
  { month: "Feb", inflow: 318000,  outflow: -182000,  net: 136000,   balance: 1956000, forecast: false },
  { month: "Mar", inflow: 1042000, outflow: -892000,  net: 150000,   balance: 2106000, forecast: false },
  { month: "Apr", inflow: 680000,  outflow: -520000,  net: 160000,   balance: 2266000, forecast: false },
  { month: "May", inflow: 1480000, outflow: -840000,  net: 640000,   balance: 2906000, forecast: false },
  { month: "Jun", inflow: 1820000, outflow: -2480000, net: -660000,  balance: 2246000, forecast: false },
  { month: "Jul", inflow: 810000,  outflow: -680000,  net: 130000,   balance: 2376000, forecast: false },
  { month: "Aug", inflow: 1540000, outflow: -1920000, net: -380000,  balance: 1996000, forecast: false },
  { month: "Sep", inflow: 920000,  outflow: -820000,  net: 100000,   balance: 2096000, forecast: false },
  { month: "Oct", inflow: 0,       outflow: 0,        net: -640000,  balance: 1456000, forecast: true  },
  { month: "Nov", inflow: 0,       outflow: 0,        net: -1820000, balance: -364000, forecast: true  },
  { month: "Dec", inflow: 0,       outflow: 0,        net: 2100000,  balance: 1736000, forecast: true  },
];

export const SAMPLE_TRANSACTIONS = [
  { id: "T001", date: "10/14/25", description: "AFTERGLOW EARLY BIRD GA TICKET",   account: "410100", amount:  99.00,      event: null as string | null, category: null as string | null },
  { id: "T002", date: "10/14/25", description: "AFTERGLOW EARLY BIRD GA TICKET",   account: "410100", amount:  99.00,      event: null, category: null },
  { id: "T003", date: "10/15/25", description: "AFTERGLOW EARLY BIRD GA TICKET",   account: "410100", amount:  99.00,      event: null, category: null },
  { id: "T004", date: "11/03/25", description: "ECHO EARLY BIRD TICKET",           account: "410100", amount:  79.00,      event: null, category: null },
  { id: "T005", date: "11/18/25", description: "ECHO EARLY BIRD TICKET",           account: "410100", amount:  79.00,      event: null, category: null },
  { id: "T006", date: "12/02/25", description: "AXIOM BEVERAGES SPONSORSHIP DEP",  account: "420200", amount:  40000.00,   event: null, category: null },
  { id: "T007", date: "12/08/25", description: "NORTHPOINT CAPITAL SPONSOR DEP",   account: "420100", amount:  75000.00,   event: null, category: null },
  { id: "T008", date: "01/17/26", description: "MERIDIAN SOUND CO ARTIST DEPOSIT", account: "510300", amount: -85000.00,   event: null, category: null },
  { id: "T009", date: "01/22/26", description: "APEX STAGE SYSTEMS DEPOSIT",       account: "520100", amount: -42000.00,   event: null, category: null },
  { id: "T010", date: "02/04/26", description: "ECHO GA TIER 1 TICKET",            account: "410110", amount:  99.00,      event: null, category: null },
  { id: "T011", date: "02/14/26", description: "ECHO VIP PACKAGE",                 account: "410130", amount:  285.00,     event: null, category: null },
  { id: "T012", date: "03/02/26", description: "AFTERGLOW VIP TICKET",             account: "410120", amount:  349.00,     event: null, category: null },
  { id: "T013", date: "03/14/26", description: "ECHO FESTIVAL — MERIDIAN SOUND",   account: "520300", amount: -28000.00,   event: null, category: null },
  { id: "T014", date: "03/14/26", description: "ECHO FESTIVAL — APEX STAGE",       account: "520100", amount: -38000.00,   event: null, category: null },
  { id: "T015", date: "03/14/26", description: "ECHO FESTIVAL — SECURITY STAFF",   account: "540100", amount: -18000.00,   event: null, category: null },
  { id: "T016", date: "03/18/26", description: "ECHO MERCH SETTLEMENT",            account: "440100", amount:  11800.00,   event: null, category: null },
  { id: "T017", date: "04/10/26", description: "AFTERGLOW GA TIER 1 TICKET",       account: "410110", amount:  129.00,     event: null, category: null },
  { id: "T018", date: "04/22/26", description: "CRESTLINE MEDIA — PAID MEDIA",     account: "550100", amount: -45000.00,   event: null, category: null },
  { id: "T019", date: "05/08/26", description: "AFTERGLOW VIP TICKET",             account: "410130", amount:  310.00,     event: null, category: null },
  { id: "T020", date: "05/19/26", description: "REDWAVE ARTIST — FINAL PAYMENT",   account: "510100", amount: -220000.00,  event: null, category: null },
  { id: "T021", date: "06/01/26", description: "AFTERGLOW FINAL RELEASE GA",       account: "410115", amount:  175.00,     event: null, category: null },
  { id: "T022", date: "06/12/26", description: "PRISM PRODUCTIONS STAGE FINAL",    account: "520100", amount: -380000.00,  event: null, category: null },
  { id: "T023", date: "06/20/26", description: "AFTERGLOW F&B CONCESSION SHARE",   account: "430100", amount:  218000.00,  event: null, category: null },
  { id: "T024", date: "06/24/26", description: "AFTERGLOW MERCH SETTLEMENT",       account: "440100", amount:  109000.00,  event: null, category: null },
  { id: "T025", date: "07/08/26", description: "APEX STAGE SYSTEMS BALANCE PMT",   account: "520100", amount: -88000.00,   event: null, category: null },
  { id: "T026", date: "07/14/26", description: "TIDELINE GA TIER 1 TICKET",        account: "410110", amount:  119.00,     event: null, category: null },
  { id: "T027", date: "08/08/26", description: "TIDELINE F&B CONCESSION SHARE",    account: "430100", amount:  152000.00,  event: null, category: null },
  { id: "T028", date: "08/20/26", description: "NOVA EARLY BIRD GA TICKET",        account: "410100", amount:  89.00,      event: null, category: null },
  { id: "T029", date: "09/05/26", description: "NOVA GA TIER 1 TICKET",            account: "410110", amount:  109.00,     event: null, category: null },
  { id: "T030", date: "09/22/26", description: "NOVA ARTIST DEPOSIT — HEADLINER",  account: "510300", amount: -180000.00,  event: null, category: null },
];

export const UPCOMING_PAYMENTS = [
  { date: "Oct 15", description: "Nova — Artist Deposit 2",     amount: -380000, event: "NV26" },
  { date: "Oct 28", description: "Nova — Production Advance",   amount: -210000, event: "NV26" },
  { date: "Nov 10", description: "Nova — Venue Final Payment",  amount: -440000, event: "NV26" },
  { date: "Nov 14", description: "Nova — Security & Staffing",  amount: -185000, event: "NV26" },
  { date: "Dec 05", description: "Aurora NYE — Artist Deposit", amount: -125000, event: "ANE26" },
];
