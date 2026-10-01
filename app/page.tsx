"use client";

import { useState, useRef, useEffect } from "react";
import type { Scenario } from "./model/types";
import { ALL_SCENARIO_STATS, SPENDABLE_CASH } from "./model/cashEngine";
import { fmtUSD } from "./lib/utils";
import { KPICard } from "./components/KPICard";
import { CashFlowChart } from "./components/CashFlowChart";
import { FundingBridge } from "./components/FundingBridge";
import { ScenarioLab } from "./components/ScenarioLab";
import { CashDriverTree } from "./components/CashDriverTree";
import { EventEconomicsSection } from "./components/EventEconomicsSection";
import { SystemSection } from "./components/SystemSection";

const NAV_SECTIONS = [
  { id: "cash-overview", label: "Cash Overview" },
  { id: "funding-analysis", label: "Funding Analysis" },
  { id: "cash-drivers", label: "Cash Drivers" },
  { id: "event-economics", label: "Event Economics" },
  { id: "how-it-works", label: "How It Works" },
];

export default function Home() {
  const [scenario, setScenario] = useState<Scenario>("base");
  const [activeSection, setActiveSection] = useState("cash-overview");
  const stats = ALL_SCENARIO_STATS[scenario];

  // Intersection observer for active nav
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div style={{ background: "#4A214F", color: "#fff", padding: "72px 0 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#FF3EA5", marginBottom: 20, fontFamily: "var(--font-mono, monospace)" }}>
            LUMA LIVE — Management Information System
          </div>

          <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Will we need more cash?<br />
            <span style={{ color: "#FF3EA5" }}>How much. When. Why.</span>
          </h1>

          <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 640, lineHeight: 1.7, marginBottom: 32 }}>
            A transaction-level cash forecasting system for a live event business.
            Five events, three cost ledgers, six scenario paths, one coherent picture of liquidity risk
            — built from first principles, not a spreadsheet.
          </p>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Events in 2026", value: "5" },
              { label: "Forecast transactions", value: "27" },
              { label: "GL rows classified", value: "89" },
              { label: "Scenarios modeled", value: "6" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" as const }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-mono, monospace)", color: "#fff", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#B8A0C0", marginTop: 3, letterSpacing: "0.04em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              "#transaction-level-forecast",
              "#three-cost-ledgers",
              "#scenario-analysis",
              "#accrual-vs-cash",
              "#funding-gap-engine",
              "#deterministic-classification",
            ].map((tag) => (
              <span key={tag} style={{ fontSize: 11, color: "#C8A8D8", background: "#3B1040", padding: "4px 10px", borderRadius: 3, fontFamily: "var(--font-mono, monospace)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky Nav ───────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky" as const,
        top: 0,
        zIndex: 100,
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 32px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", height: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#111111", marginRight: 24, letterSpacing: "0.04em", flexShrink: 0 }}>
            LUMA LIVE
          </span>
          <div style={{ display: "flex", gap: 0, overflowX: "auto" as const }}>
            {NAV_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  fontSize: 12,
                  fontWeight: activeSection === s.id ? 600 : 400,
                  color: activeSection === s.id ? "#FF3EA5" : "#64748B",
                  padding: "0 14px",
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  borderBottom: activeSection === s.id ? "2px solid #FF3EA5" : "2px solid transparent",
                  textDecoration: "none",
                  whiteSpace: "nowrap" as const,
                  transition: "color 0.15s",
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#94A3B8", flexShrink: 0, paddingLeft: 12 }}>
            As of Oct 1, 2026
          </div>
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px 80px" }}>

        {/* ── Section 1: Cash Overview ──────────────────────────────────────── */}
        <section id="cash-overview" className="section-anchor" style={{ paddingTop: 48 }}>
          <SectionHeader
            number="01"
            title="Cash Overview"
            sub="Actual Jan–Sep 2026 from authoritative balance sheet. Oct–Dec from transaction-level forecast."
          />

          {/* Scenario selector strip */}
          <ScenarioStrip scenario={scenario} onSelect={setScenario} />

          {/* KPI band */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10, marginBottom: 28 }}>
            <KPICard
              label="Spendable Cash"
              value={fmtUSD(SPENDABLE_CASH, true)}
              sub="Oct 1 opening — excl. $340K restricted"
              large
            />
            <KPICard
              label="Funding Gap"
              value={fmtUSD(stats.peakGap, true)}
              sub={stats.firstNegativeLabel ? `First negative: ${stats.firstNegativeLabel}` : "No gap in this scenario"}
              delta={stats.peakGap > 0 ? `Trough: ${fmtUSD(stats.troughBalance, true)}` : undefined}
              deltaPositive={false}
            />
            <KPICard
              label="Deferrable"
              value={fmtUSD(stats.deferrable, true)}
              sub="Negotiable outflows that can shift"
              deltaPositive
            />
            <KPICard
              label="True Requirement"
              value={fmtUSD(stats.trueRequirement, true)}
              sub={stats.trueRequirement > 0 ? "External capital if no mitigation" : "Gap fully covered by deferrals"}
              accent={stats.trueRequirement > 0}
              delta={stats.trueRequirement > 0 ? "Capital needed" : "Self-serviceable"}
              deltaPositive={stats.trueRequirement === 0}
            />
          </div>

          <Card>
            <CashFlowChart scenario={scenario} />
          </Card>

          <Annotation>
            December payroll ($280K, non-negotiable) lands on top of the November overhang — driving the trough to
            {" "}{fmtUSD(stats.troughBalance, true)} on Dec 15. The headliner fee, venue balance, and stage deposit
            in November are all non-negotiable. True capital need after deferring negotiable items:
            {" "}{fmtUSD(stats.trueRequirement, true)}.
          </Annotation>
        </section>

        <Divider />

        {/* ── Section 2: Funding Analysis ───────────────────────────────────── */}
        <section id="funding-analysis" className="section-anchor" style={{ paddingTop: 48 }}>
          <SectionHeader
            number="02"
            title="Funding Analysis"
            sub="Walk from opening spendable cash to the trough, decomposed by month and negotiability."
          />

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 12 }}>
              Cash Bridge — {scenarioLabel(scenario)}
            </div>
            <Card>
              <FundingBridge scenario={scenario} />
            </Card>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 12 }}>
              Scenario Lab — 6 Paths Modeled
            </div>
            <Card>
              <ScenarioLab selected={scenario} onChange={setScenario} />
            </Card>
          </div>

          <Annotation>
            "Deferrable" outflows are payments classified as <em>negotiable</em> at the transaction level:
            the security advance and logistics deposit can shift 30 days without contractual penalty.
            The headliner fee, venue balance, and payroll are non-negotiable — they cannot be deferred.
          </Annotation>
        </section>

        <Divider />

        {/* ── Section 3: Cash Drivers ───────────────────────────────────────── */}
        <section id="cash-drivers" className="section-anchor" style={{ paddingTop: 48 }}>
          <SectionHeader
            number="03"
            title="Cash Drivers"
            sub="Transaction-level drill-down by month. Each payment carries: date, counterparty, status, negotiability."
          />

          <Card>
            <CashDriverTree scenario={scenario} />
          </Card>

          <Annotation>
            Every line in the forecast is a typed transaction — not a category bucket or monthly estimate.
            Scenarios don't interpolate: they recompute the full cash walk from shifted dates.
          </Annotation>
        </section>

        <Divider />

        {/* ── Section 4: Event Economics ────────────────────────────────────── */}
        <section id="event-economics" className="section-anchor" style={{ paddingTop: 48 }}>
          <SectionHeader
            number="04"
            title="Event Economics"
            sub="Per-event P&L framed by economic window (presale open through final settlement), not fiscal year."
          />

          <Card>
            <EventEconomicsSection />
          </Card>

          <Annotation>
            The accrual vs cash revenue chart shows why income statements and bank accounts tell different stories.
            Ticket sales hit the bank account in waves over months; revenue is recognized in a single line at event date.
            The gap between the two is the float that funds forward event deposits.
          </Annotation>
        </section>

        <Divider />

        {/* ── Section 5: How It Works ───────────────────────────────────────── */}
        <section id="how-it-works" className="section-anchor" style={{ paddingTop: 48 }}>
          <SectionHeader
            number="05"
            title="How It Works"
            sub="Architecture principles, classification engine, and data quality surface."
          />

          <Card>
            <SystemSection />
          </Card>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111111" }}>LUMA LIVE</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Portfolio project — all data is entirely fictional</div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#94A3B8" }}>
            <span>Next.js 15 + TypeScript</span>
            <span>Recharts</span>
            <span>Zero external data dependencies</span>
          </div>
        </footer>

      </main>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function SectionHeader({ number, title, sub }: { number: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color: "#FF3EA5" }}>{number}</span>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      <p style={{ fontSize: 13, color: "#64748B", maxWidth: 600 }}>{sub}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "24px 28px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#F1F5F9", margin: "8px 0 0" }} />;
}

function Annotation({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.7, borderLeft: "2px solid #E5E7EB", paddingLeft: 12, marginBottom: 0 }}>
      {children}
    </p>
  );
}

const SCENARIO_LABELS: Record<Scenario, string> = {
  base: "Base Case",
  receipts_1w: "Receipts −1 Week",
  receipts_2w: "Receipts −2 Weeks",
  receipts_3w: "Receipts −3 Weeks",
  defer_costs: "Defer Negotiable Costs",
  combined_2w: "Combined −2 Weeks",
};

function scenarioLabel(s: Scenario) {
  return SCENARIO_LABELS[s];
}

function ScenarioStrip({ scenario, onSelect }: { scenario: Scenario; onSelect: (s: Scenario) => void }) {
  const scenarios: Scenario[] = ["base", "receipts_1w", "receipts_2w", "receipts_3w", "defer_costs", "combined_2w"];
  const TAGS: Record<Scenario, { label: string; color: string }> = {
    base: { label: "Base", color: "#FF3EA5" },
    receipts_1w: { label: "Stress", color: "#D97706" },
    receipts_2w: { label: "Stress", color: "#D97706" },
    receipts_3w: { label: "Severe", color: "#DC2626" },
    defer_costs: { label: "Mitigate", color: "#16A34A" },
    combined_2w: { label: "Combined", color: "#7657FF" },
  };

  return (
    <div style={{
      display: "flex",
      gap: 6,
      marginBottom: 16,
      padding: "10px 12px",
      background: "#F8FAFC",
      borderRadius: 8,
      flexWrap: "wrap",
      alignItems: "center",
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginRight: 4 }}>
        Scenario
      </span>
      {scenarios.map((s) => {
        const t = TAGS[s];
        const isActive = scenario === s;
        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            style={{
              fontSize: 11,
              fontWeight: isActive ? 700 : 400,
              padding: "4px 10px",
              borderRadius: 4,
              border: `1px solid ${isActive ? t.color : "#E2E8F0"}`,
              background: isActive ? `${t.color}14` : "#fff",
              color: isActive ? t.color : "#64748B",
              cursor: "pointer",
            }}
          >
            {SCENARIO_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}
