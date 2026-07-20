import { DarajaCredentialPanel } from "../../components/daraja-credential-panel";
import { ReconciliationWorkspace } from "../../components/reconciliation-workspace";
import { can, getCurrentUserContext } from "../../lib/data/context";
import { getReconciliationSnapshot } from "../../lib/data/reconciliation";

export const metadata = {
  title: "Bank and Mobile-Money Reconciliation",
  description: "Bank statement, Telebirr and Safaricom M-Pesa settlement matching with controlled accounting posting.",
};

export const dynamic = "force-dynamic";

export default async function ReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const [params, snapshot, user] = await Promise.all([
    searchParams,
    getReconciliationSnapshot(),
    getCurrentUserContext({ required: true }),
  ]);
  const finance = Boolean(user && can(user, "manage_finance"));
  const importing = Boolean(user && (can(user, "manage_finance") || can(user, "manage_sales")));

  return (
    <>
      <ReconciliationWorkspace
        snapshot={snapshot}
        success={params.success}
        canConfigure={finance}
        canImport={importing}
        canPost={finance}
      />
      <DarajaCredentialPanel status={snapshot.daraja} canConfigure={finance} />
    </>
  );
}
