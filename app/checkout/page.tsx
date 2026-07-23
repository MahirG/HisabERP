import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutExperience } from "../../components/checkout-experience";
import { getCurrentUserContext } from "../../lib/data/context";
import { getPricingPlan, type BillingInterval } from "../../lib/marketing-pricing";

export const metadata: Metadata = {
  title: "Secure subscription checkout",
  description: "Activate a HisabERP subscription using local Ethiopian payments, international cards, PayPal or verified bank transfer.",
};

function parseInterval(value: string | undefined): BillingInterval {
  return value === "monthly" || value === "quarterly" || value === "annual" ? value : "annual";
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string; interval?: string }> }) {
  const params = await searchParams;
  const plan = getPricingPlan(params.plan) ?? getPricingPlan("growth")!;
  const interval = parseInterval(params.interval);
  const checkoutPath = `/checkout?plan=${encodeURIComponent(plan.slug)}&interval=${encodeURIComponent(interval)}`;
  const user = await getCurrentUserContext();

  if (!user) redirect(`/auth/login?next=${encodeURIComponent(checkoutPath)}`);
  if (user.role !== "owner" && user.role !== "admin") redirect("/billing?error=billing-permission-required");
  if (user.mfaRequired && user.aal !== "aal2") redirect(`/account?next=${encodeURIComponent(checkoutPath)}&message=${encodeURIComponent("Verify administrator MFA before changing billing.")}`);

  return <CheckoutExperience user={{ fullName: user.fullName, email: user.email, organizationName: user.organizationName }} initialPlan={plan.checkoutEnabled ? plan.slug : "growth"} initialInterval={interval} />;
}
