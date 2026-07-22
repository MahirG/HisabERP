import { Dashboard } from "../components/dashboard";
import { MarketingHome } from "../components/marketing-home";
import { getCurrentUserContext } from "../lib/data/context";
import { getDashboardSnapshot } from "../lib/data/erp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUserContext();
  if (!user) return <MarketingHome />;
  const snapshot = await getDashboardSnapshot();
  return <Dashboard snapshot={snapshot} user={user} />;
}
