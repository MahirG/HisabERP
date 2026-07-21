import type { Metadata } from "next";
import { Dashboard } from "../components/dashboard";
import { MarketingHome } from "../components/marketing-home";
import { isSupabaseConfigured } from "../lib/config";
import { getCurrentUserContext } from "../lib/data/context";
import { getDashboardSnapshot } from "../lib/data/erp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HisabERP — Business management for Ethiopia",
  description: "Run finance, sales, inventory, purchasing, payroll, invoicing and payment reconciliation from one secure HisabERP workspace.",
};

export default async function HomePage() {
  if (!isSupabaseConfigured()) return <MarketingHome />;

  const user = await getCurrentUserContext();
  if (!user) return <MarketingHome />;

  const snapshot = await getDashboardSnapshot();
  return <Dashboard snapshot={snapshot} user={user} />;
}
