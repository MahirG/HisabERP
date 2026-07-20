import { unstable_noStore as noStore } from "next/cache";
import { isSupabaseConfigured } from "../config";
import { getDarajaConfigurationStatus } from "../reconciliation/mpesa-daraja";
import { createClient } from "../supabase/server";
import { getCurrentUserContext } from "./context";
import { demoReconciliation } from "./reconciliation-demo";
import type { ReconciliationSnapshot } from "./reconciliation-types";

export async function getReconciliationSnapshot(): Promise<ReconciliationSnapshot> {
  noStore();
  if (!isSupabaseConfigured()) return demoReconciliation;

  const context = await getCurrentUserContext({ required: true });
  const supabase = await createClient();
  const [{ data, error }, daraja] = await Promise.all([
    supabase.rpc("get_reconciliation_snapshot", {
      target_organization_id: context!.organizationId,
    }),
    getDarajaConfigurationStatus(context!.organizationId),
  ]);

  if (error || !data) {
    throw new Error(`Unable to load reconciliation: ${error?.message ?? "Unknown error"}`);
  }

  return {
    ...(data as Omit<ReconciliationSnapshot, "mode" | "organizationName" | "daraja">),
    mode: "live",
    organizationName: context!.organizationName,
    daraja,
  };
}
