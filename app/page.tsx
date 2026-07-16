import { Dashboard } from "../components/dashboard";
import { getDashboardSnapshot } from "../lib/data/erp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot();
  return <Dashboard snapshot={snapshot} />;
}
