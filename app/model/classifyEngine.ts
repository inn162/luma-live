import type { ClassifyExample } from "./types";

// Deterministic classification rule set for the interactive demo.
// These are fictional rules for LUMA LIVE — NOT derived from any real company.

export const CLASSIFY_EXAMPLES: ClassifyExample[] = [
  {
    raw: {
      date: "Oct 22, 2026",
      account: "5200-210",
      vendor: "Apex Stage Systems",
      ref: "VRT-2026",
      description: "Stage rigging deposit — New Year's venue",
      amount: "$48,200",
    },
    rules: [
      { ruleId: "R01", description: "Account 5200-xxx range", match: "Account 5200-210", result: "Direct Event Cost" },
      { ruleId: "R07", description: "Vendor contains 'Stage'", match: "Apex Stage Systems", result: "Production & Venue > Stage Build" },
      { ruleId: "R15", description: "Ref matches VRT-2026", match: "VRT-2026", result: "Event: Vertigo NYE (VRT26)" },
    ],
    result: { event: "Vertigo NYE (VRT26)", category: "Production & Venue", item: "Stage Build", confidence: "HIGH" },
  },
  {
    raw: {
      date: "Sep 15, 2026",
      account: "4200-010",
      vendor: "Waveline Communications",
      ref: "MRD-2026",
      description: "Presenting sponsor — full settlement",
      amount: "($480,000)",
    },
    rules: [
      { ruleId: "R02", description: "Account 4200-xxx range", match: "Account 4200-010", result: "Revenue — Sponsorship" },
      { ruleId: "R20", description: "Vendor in sponsor roster", match: "Waveline Communications", result: "Sponsorship Revenue" },
      { ruleId: "R15", description: "Ref matches MRD-2026", match: "MRD-2026", result: "Event: Meridian (MRD26)" },
    ],
    result: { event: "Meridian (MRD26)", category: "Sponsorship", item: "Sponsorship Revenue", confidence: "HIGH" },
  },
  {
    raw: {
      date: "Aug 10, 2026",
      account: "5100-110",
      vendor: "Cascade Artist Management",
      ref: "MRD-2026",
      description: "International acts — balance payment",
      amount: "$380,000",
    },
    rules: [
      { ruleId: "R03", description: "Account 5100-xxx range", match: "Account 5100-110", result: "Direct Event Cost — Talent" },
      { ruleId: "R09", description: "Vendor in talent agency roster", match: "Cascade Artist Management", result: "Talent > Artist Fee" },
      { ruleId: "R15", description: "Ref matches MRD-2026", match: "MRD-2026", result: "Event: Meridian (MRD26)" },
    ],
    result: { event: "Meridian (MRD26)", category: "Talent", item: "Artist Fee", confidence: "HIGH" },
  },
  {
    raw: {
      date: "Sep 30, 2026",
      account: "6200-020",
      vendor: "Various SaaS vendors",
      ref: null,
      description: "Q3 software subscriptions — ticketing, CRM, project mgmt",
      amount: "$14,000",
    },
    rules: [
      { ruleId: "R05", description: "Account 6200-xxx range", match: "Account 6200-020", result: "Overhead — Technology" },
      { ruleId: "R22", description: "Description contains 'software' or 'subscriptions'", match: "Q3 software subscriptions", result: "Technology > SaaS & Tools" },
      { ruleId: "R30", description: "No event ref on row", match: "(no ref)", result: "Event: None — Corporate Overhead" },
    ],
    result: { event: "None (Corporate)", category: "Technology", item: "SaaS & Tools", confidence: "MEDIUM" },
  },
  {
    raw: {
      date: "Jul 15, 2026",
      account: "6400-040",
      vendor: "Various",
      ref: null,
      description: "Office supplies & miscellaneous",
      amount: "$3,200",
    },
    rules: [
      { ruleId: "R05", description: "Account 6400-xxx range", match: "Account 6400-040", result: "Overhead — Admin" },
      { ruleId: "R30", description: "No event ref, description vague", match: "Various / miscellaneous", result: "Needs Review — low confidence" },
    ],
    result: { event: "None (Corporate)", category: "Corporate Overhead", item: "Admin & Office", confidence: "LOW" },
  },
];

// Data quality summary (synthetic)
export const DATA_QUALITY = {
  total: 89,
  high: 74,
  medium: 9,
  low: 4,
  needsReview: 2,
};
