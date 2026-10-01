import type { LumaEvent } from "../model/types";

export const EVENTS: LumaEvent[] = [
  {
    code: "COV26",
    name: "Cove",
    date: "2026-04-19",
    presaleOpen: "2025-10-20",
    lastSettlement: "2026-05-20",
    capacity: 3200,
    year: 2,
    status: "completed",
    color: "#7C3AED",
  },
  {
    code: "SOL26",
    name: "Solaris",
    date: "2026-06-07",
    presaleOpen: "2025-11-15",
    lastSettlement: "2026-07-31",
    capacity: 22000,
    year: 6,
    status: "completed",
    color: "#D97706",
  },
  {
    code: "HBR26",
    name: "Harbor",
    date: "2026-07-26",
    presaleOpen: "2026-02-10",
    lastSettlement: "2026-09-10",
    capacity: 8500,
    year: 3,
    status: "completed",
    color: "#0891B2",
  },
  {
    code: "MRD26",
    name: "Meridian",
    date: "2026-09-20",
    presaleOpen: "2026-03-20",
    lastSettlement: "2026-11-30",
    capacity: 14000,
    year: 1,
    status: "settling",
    color: "#059669",
  },
  {
    code: "VRT26",
    name: "Vertigo NYE",
    date: "2026-12-31",
    presaleOpen: "2026-07-04",
    lastSettlement: "2027-02-15",
    capacity: 5500,
    year: 2,
    status: "upcoming",
    color: "#DB2777",
  },
];

export function getEvent(code: string): LumaEvent | undefined {
  return EVENTS.find((e) => e.code === code);
}
