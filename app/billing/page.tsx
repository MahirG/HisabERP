import type { Metadata } from "next";
import { BillingDashboard } from "../../components/billing-dashboard";
import { getBillingOverview } from "../../lib/billing/server";
import { getCurrentUserContext } from "../../lib/data/context";

export const metadata: Metadata = {
  title: "Billing center",
  description: "Manage the HisabERP subscription, payment orders, renewals and invoices for your organization.",
};

function relatedPlan(value: unknown) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value && typeof value === "object" ? value : null;
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ status?: string; payment?: string; error?: string }> }) {
  const [user, params] = await Promise.all([getCurrentUserContext({ required: true }), searchParams]);
  if (!user) return null;
  const overview = await getBillingOverview(user);

  const subscriptionData = overview.subscription as Record<string, unknown> | null;
  const normalized = {
    ...overview,
    subscription: subscriptionData ? {
      ...subscriptionData,
      plan: relatedPlan(subscriptionData.billing_plans),
      billing_plans: undefined,
    } : null,
    orders: overview.orders.map((item) => {
      const record = item as Record<string, unknown>;
      return { ...record, plan: relatedPlan(record.billing_plans), billing_plans: undefined };
    }),
    invoices: overview.invoices.map((item) => {
      const record = item as Record<string, unknown>;
      return { ...record, plan: relatedPlan(record.billing_plans), billing_plans: undefined };
    }),
  };

  return <BillingDashboard overview={normalized as any} canManage={user.role === "owner" || user.role === "admin"} paymentStatus={params.status} errorCode={params.error} />;
}
