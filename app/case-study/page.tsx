"use client";
import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";
import { SAMPLE_TRANSACTIONS } from "../data/lumaData";

// Classify transactions for Phase 3/4 animation
const CLASSIFIED = SAMPLE_TRANSACTIONS.map((t) => {
  let category: string | null = null;
  let event: string | null = null;
  const acc = parseInt(t.account);
  if (acc >= 410000 && acc < 420000) category = "Ticketing";
  else if (acc >= 420000 && acc < 440000) category = "Sponsorship";
  else if (acc >= 430000 && acc < 440000) category = "F&B";
  else if (acc >= 440000 && acc < 490000) category = "Merchandise";
  else if (acc >= 510000 && acc < 520000) category = "Talent";
  else if (acc >= 520000 && acc < 530000) category = "Production";
  else if (acc >= 540000 && acc < 550000) category = "Operations";
  else if (acc >= 550000 && acc < 560000) category = "Marketing";

  const desc = t.description.toUpperCase();
  if (desc.includes("AFTERGLOW")) event = "Afterglow";
  else if (desc.includes("ECHO")) event = "Echo";
  else if (desc.includes("TIDELINE")) event = "Tideline";
  else if (desc.includes("NOVA")) event = "Nova";
  else if (desc.includes("AURORA")) event = "Aurora NYE";
  else event = "Afterglow"; // assign artist/vendor txns to Afterglow context

  return { ...t, category, event };
});

const HIGHLIGHT_IDS = ["T001", "T006", "T007", "T008", "T020", "T022", "T023"];

const ARCH_STEPS = [
  { label: "SOURCE", items: ["Accounting System", "Ticketing Data", "Budget & Forecast", "Event Data"], color: "#1E3A5F" },
  { label: "PIPELINE", items: ["Extract & Clean", "Normalize", "Validate", "Reconcile"], color: "#3D6098" },
  { label: "CLASSIFICATION", items: ["Event Mapping", "Revenue Category", "Cost Category", "Management Model"], color: "#5B7282" },
  { label: "MODEL", items: ["Event Economics", "Actual vs Budget", "Cash Flow", "Portfolio View"], color: "#264D82" },
  { label: "OUTPUTS", items: ["Executive Dashboard", "Event Analysis", "Monthly Report", "Management Narrative"], color: "#C9A84C" },
];

const SKILLS = [
  { title: "Finance", items: ["Financial statement analysis", "Management reporting", "Budgeting & forecasting", "Cash flow modeling", "Event profitability"] },
  { title: "Data", items: ["Transaction-level data", "Classification engine design", "Reconciliation architecture", "Data modeling", "Validation frameworks"] },
  { title: "Analytics & Automation", items: ["Variance analysis", "Event economics", "KPI design", "Automated extraction", "Repeatable reporting workflows"] },
];

function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const phase2 = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);
  const phase3 = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);
  const phase4 = useTransform(scrollYProgress, [0.6, 0.72], [0, 1]);
  const phase5 = useTransform(scrollYProgress, [0.78, 0.9], [0, 1]);

  return (
    <div ref={ref} style={{ height: "400vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#0A0A0A" }}>
        <div style={{ width: "100%", maxWidth: 900, padding: "0 32px" }}>

          {/* Phase 1 — Dense transactions */}
          <motion.div style={{ opacity: useTransform(scrollYProgress, [0, 0.12, 0.38, 0.44], [1, 1, 1, 0]) }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#aaa", lineHeight: 1.9, columns: 2, columnGap: 32 }}>
              {SAMPLE_TRANSACTIONS.slice(0, 28).map((t) => {
                const isHighlight = HIGHLIGHT_IDS.includes(t.id);
                return (
                  <motion.div key={t.id} style={{ opacity: useTransform(phase2, [0, 1], [1, isHighlight ? 1 : 0.1]), breakInside: "avoid" }}>
                    <span style={{ color: "#555" }}>{t.date}</span>
                    {"  "}
                    <span style={{ color: isHighlight ? "#fff" : "#888" }}>{t.description.slice(0, 30).padEnd(30)}</span>
                    {"  "}
                    <span style={{ color: t.amount >= 0 ? "#16A34A" : "#DC2626" }}>
                      {t.amount >= 0 ? "+" : ""}{t.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Phase 2 label */}
          <motion.div style={{ position: "absolute", left: 32, top: "50%", transform: "translateY(-60px)", opacity: useTransform(scrollYProgress, [0.18, 0.32, 0.38, 0.44], [0, 1, 1, 0]) }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, maxWidth: 280 }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>
                A transaction knows<br />when it happened.
              </div>
              <div style={{ color: "#888" }}>Management needs to know<br />what it belongs to.</div>
            </div>
          </motion.div>

          {/* Phase 3 — Categories */}
          <motion.div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: useTransform(scrollYProgress, [0.44, 0.52, 0.68, 0.76], [0, 1, 1, 0]) }}>
            <div style={{ width: "100%", maxWidth: 860, padding: "0 32px" }}>
              <motion.div style={{ opacity: phase3, textAlign: "center", marginBottom: 28 }}>
                <div style={{ color: "#888", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Classification Engine</div>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
                  Every transaction mapped to a management category.
                </div>
              </motion.div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "TICKETING", color: "#3B82F6", txns: ["AFTERGLOW EARLY BIRD GA", "ECHO GA TIER 1 TICKET", "AFTERGLOW VIP TICKET", "NOVA EARLY BIRD GA"] },
                  { label: "TALENT", color: "#8B5CF6", txns: ["MERIDIAN SOUND CO ARTIST DEP", "REDWAVE ARTIST — FINAL PMT", "NOVA ARTIST DEPOSIT"] },
                  { label: "PRODUCTION", color: "#5B7282", txns: ["APEX STAGE SYSTEMS DEPOSIT", "ECHO FESTIVAL — APEX STAGE", "PRISM PRODUCTIONS FINAL"] },
                ].map((group) => (
                  <motion.div key={group.label} style={{ opacity: phase3, background: group.color + "18", border: `1px solid ${group.color}40`, borderRadius: 8, padding: "14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: group.color, marginBottom: 10 }}>{group.label}</div>
                    {group.txns.map((tx) => (
                      <div key={tx} style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace", marginBottom: 4 }}>{tx}</div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Phase 4 — Events */}
          <motion.div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: useTransform(scrollYProgress, [0.76, 0.84, 0.92, 0.97], [0, 1, 1, 0]) }}>
            <div style={{ width: "100%", maxWidth: 860, padding: "0 32px" }}>
              <motion.div style={{ opacity: phase4, textAlign: "center", marginBottom: 24 }}>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
                  Categories mapped to the event they economically belong to.
                </div>
                <div style={{ color: "#888", fontSize: 12, marginTop: 6 }}>Regardless of when the transaction was posted.</div>
              </motion.div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { code: "EC26", name: "Echo", color: "#3B82F6", rev: "$970K", cost: "$740K", contrib: "$230K" },
                  { code: "AG26", name: "Afterglow", color: "#F59E0B", rev: "$4.6M", cost: "$3.3M", contrib: "$1.25M" },
                  { code: "TL26", name: "Tideline", color: "#14B8A6", rev: "$3.2M", cost: "$2.45M", contrib: "$750K" },
                ].map((ev) => (
                  <motion.div key={ev.code} style={{ opacity: phase4, background: "#1a1a1a", border: `1px solid ${ev.color}50`, borderRadius: 8, padding: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: ev.color }}>{ev.name}</span>
                    </div>
                    {[["Revenue", ev.rev, "#16A34A"], ["Direct Costs", ev.cost, "#DC2626"], ["Contribution", ev.contrib, ev.color]].map(([label, value, color]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "#888" }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

const S = { padding: "80px 0" };
const CONTAINER = { maxWidth: 800, margin: "0 auto", padding: "0 32px" };

export default function CaseStudyPage() {
  return (
    <div style={{ background: "#0A0A0A", color: "#FAFAFA" }}>

      {/* Hero */}
      <section style={{ ...S, minHeight: "80vh", display: "flex", alignItems: "center" }}>
        <div style={CONTAINER}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#C9A84C", marginBottom: 24, textTransform: "uppercase" }}>
            Finance × Data × Automation
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 24 }}>
            From transactions<br />to decisions.
          </h1>
          <p style={{ fontSize: 18, color: "#888", lineHeight: 1.6, maxWidth: 540, marginBottom: 48 }}>
            Building an automated management reporting system<br />for a multi-event live entertainment business.
          </p>
          <div style={{ borderTop: "1px solid #222", paddingTop: 24, maxWidth: 540 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 10 }}>
              Fictionalized Case Study
            </div>
            <p style={{ fontSize: 12, color: "#666", lineHeight: 1.7 }}>
              This case study recreates the analytical architecture of a reporting system I built during an internship.
              All company names, events, financial figures, and transactions are entirely fictional and created for this portfolio.
              The methodology reflects the type of analytical work I performed.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section style={{ ...S, background: "#111" }}>
        <div style={CONTAINER}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", marginBottom: 24 }}>The Problem</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 24, letterSpacing: "-0.02em" }}>
            Financial data existed.<br />Management information didn&apos;t.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 40 }}>
            <div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.8 }}>
                Transactions were organized for accounting purposes — by date, by account, by period.
                That&apos;s useful for bookkeeping. It&apos;s not useful for running a multi-event business.
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.8 }}>
                Leadership needed to understand the economics of individual events: profitability, budget variance,
                ticket trajectory, cash timing. The data existed. The view didn&apos;t.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 48, padding: "24px 28px", background: "#1a1a1a", borderLeft: "3px solid #C9A84C", borderRadius: "0 6px 6px 0" }}>
            <p style={{ fontSize: 15, fontStyle: "italic", color: "#ddd", lineHeight: 1.7 }}>
              &ldquo;A transaction knows when it happened. Management needs to know what it belongs to.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Scroll Story */}
      <ScrollStory />

      {/* System Architecture */}
      <section style={{ ...S, background: "#F9F9F9", color: "#111" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#C9A84C", textTransform: "uppercase", marginBottom: 12 }}>System Architecture</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>The transformation pipeline</h2>
            <p style={{ fontSize: 14, color: "#888", marginTop: 12, maxWidth: 480, margin: "12px auto 0" }}>
              A finance and analytics system — not a software engineering diagram.
              Each layer adds meaning to the data below it.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
            {ARCH_STEPS.map((step, i) => (
              <div key={step.label} style={{ flex: 1, position: "relative" }}>
                <div style={{ background: "#fff", border: "1px solid #E8E8E8", borderRadius: 8, padding: "20px 16px", height: "100%", marginRight: i < ARCH_STEPS.length - 1 ? 0 : 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: step.color, marginBottom: 14, borderBottom: `2px solid ${step.color}`, paddingBottom: 8 }}>
                    {step.label}
                  </div>
                  {step.items.map((item) => (
                    <div key={item} style={{ fontSize: 11, color: "#555", marginBottom: 8, lineHeight: 1.4 }}>{item}</div>
                  ))}
                </div>
                {i < ARCH_STEPS.length - 1 && (
                  <div style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", zIndex: 2, color: "#C9A84C", fontSize: 16, fontWeight: 700 }}>›</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, textAlign: "center", padding: "24px", background: "#fff", border: "1px solid #E8E8E8", borderRadius: 8 }}>
            <p style={{ fontSize: 14, fontStyle: "italic", color: "#555" }}>
              The dashboard is not simply a visualization layer. Every number is traceable to the transactions that produced it.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard CTA */}
      <section style={{ ...S, background: "#0A0A0A", textAlign: "center" }}>
        <div style={CONTAINER}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#C9A84C", textTransform: "uppercase", marginBottom: 16 }}>The Result</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>An executive management dashboard.</h2>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
            Portfolio overview, event-level P&L, ticketing trajectory, revenue mix, and cash forecast — all from the same underlying transaction data.
          </p>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#C9A84C", color: "#0A0A0A", fontWeight: 700, fontSize: 13,
            padding: "14px 28px", borderRadius: 6, textDecoration: "none", letterSpacing: "0.04em",
          }}>
            Open Dashboard →
          </Link>
        </div>
      </section>

      {/* What I Built */}
      <section style={{ ...S, background: "#111" }}>
        <div style={CONTAINER}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#C9A84C", textTransform: "uppercase", marginBottom: 40, textAlign: "center" }}>What This Demonstrates</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
            {SKILLS.map((s) => (
              <div key={s.title}>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.04em", color: "#fff", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #333" }}>{s.title}</div>
                {s.items.map((item) => (
                  <div key={item} style={{ fontSize: 12, color: "#888", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#C9A84C", marginTop: 1 }}>—</span>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
