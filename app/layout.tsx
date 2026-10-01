import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "./components/TopNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Luma Live — Management Dashboard",
  description: "Portfolio case study: automated management reporting for a multi-event live entertainment company.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <TopNav />
        <main style={{ flex: 1 }}>{children}</main>
      </body>
    </html>
  );
}
