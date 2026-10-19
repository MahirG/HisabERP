import { redirect } from "next/navigation";
import { Dashboard } from "../../components/dashboard";
import { getCurrentUserContext } from "../../lib/data/context";
import { getDashboardSnapshot } from "../../lib/data/erp";

export const dynamic = "force-dynamic";

export default async function WorkspaceHomePage() {
  const user = await getCurrentUserContext({ required: true });
  if (!user) redirect("/auth/login?next=%2Fworkspace-home");

  // Require strong administrator assurance before protected dashboard RPCs.
  // Otherwise RLS can reject the data request before users see their MFA step.
  if (user.mfaRequired && user.aal !== "aal2") {
    redirect("/account?verify=mfa&next=%2Fworkspace-home");
  }

  const snapshot = await getDashboardSnapshot();
  return <Dashboard snapshot={snapshot} user={user} />;
}
