"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Overview",  href: "/" },
  { label: "Events",    href: "/events" },
  { label: "Ticketing", href: "/ticketing" },
  { label: "Revenue",   href: "/revenue" },
  { label: "Cash",      href: "/cash" },
];

export function TopNav() {
  const pathname = usePathname();
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "#fff", borderBottom: "1px solid var(--border)",
      height: 50, display: "flex", alignItems: "center",
      padding: "0 32px", gap: 0,
    }}>
      {/* Gold accent + wordmark */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginRight: 40 }}>
        <span style={{ width: 3, height: 22, background: "var(--luma-gold)", borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.14em", color: "var(--text-primary)", textTransform: "uppercase" }}>
          Luma Live
        </span>
      </Link>

      {/* Main nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        {NAV_LINKS.map(({ label, href }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              fontSize: 12, fontWeight: active ? 700 : 500,
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              textDecoration: "none", padding: "0 12px", height: 50,
              display: "flex", alignItems: "center",
              borderBottom: active ? "2px solid var(--luma-gold)" : "2px solid transparent",
              transition: "color 0.15s, border-color 0.15s",
            }}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Case Study link */}
      <Link href="/case-study" style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
        color: "var(--luma-gold)", textDecoration: "none",
        border: "1px solid var(--luma-gold)", borderRadius: 4,
        padding: "5px 12px",
      }}>
        Case Study
      </Link>
    </nav>
  );
}
