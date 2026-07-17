import { redirect } from "next/navigation";
import { Dashboard } from "../components/dashboard";
import { isSupabaseConfigured } from "../lib/config";
import { getCurrentUserContext } from "../lib/data/context";
import { getDashboardSnapshot } from "../lib/data/erp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) redirect("/auth/login");
  const user = await getCurrentUserContext({ required: true });
  if (!user) return null;
  const snapshot = await getDashboardSnapshot();
  return <Dashboard snapshot={snapshot} user={user} />;
}
