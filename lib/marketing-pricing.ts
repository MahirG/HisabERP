export type BillingInterval = "monthly" | "quarterly" | "annual";

export type PricingPlan = {
  slug: "starter" | "growth" | "business" | "enterprise";
  name: string;
  audience: string;
  monthlyEtb: number | null;
  quarterlyEtb: number | null;
  annualEtb: number | null;
  trialDays: number;
  badge?: string;
  users: string;
  branches: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  checkoutEnabled: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    audience: "Small businesses establishing dependable digital records",
    monthlyEtb: 1500,
    quarterlyEtb: 4500,
    annualEtb: 15000,
    trialDays: 14,
    users: "Up to 2 users",
    branches: "1 business location",
    description: "A focused operating workspace for sales, expenses, customer balances and essential reporting.",
    features: ["Sales and transaction records", "Expense tracking", "Customer and supplier records", "Receivables and payables", "Basic dashboard and reports", "English and Amharic access", "Email support"],
    cta: "Start 14-day trial",
    href: "/auth/email-sign-up?plan=starter",
    checkoutEnabled: true,
  },
  {
    slug: "growth",
    name: "Growth",
    audience: "Growing teams that need inventory, purchasing and stronger controls",
    monthlyEtb: 4500,
    quarterlyEtb: 13500,
    annualEtb: 45000,
    trialDays: 14,
    badge: "Most popular",
    users: "Up to 8 users",
    branches: "Up to 2 locations",
    description: "Connect sales, inventory, purchasing, invoicing, customer credit and advanced operational reporting.",
    features: ["Everything in Starter", "Inventory and warehouse controls", "Purchasing and supplier obligations", "Invoices and collection follow-up", "Advanced operational reports", "Role-based user access", "Priority onboarding support"],
    cta: "Start 14-day trial",
    href: "/auth/email-sign-up?plan=growth",
    checkoutEnabled: true,
  },
  {
    slug: "business",
    name: "Business",
    audience: "Established companies coordinating departments and branches",
    monthlyEtb: 9500,
    quarterlyEtb: 28500,
    annualEtb: 95000,
    trialDays: 14,
    users: "Up to 25 users",
    branches: "Up to 5 locations",
    description: "A wider management system for finance, reconciliation, HR, permissions, branches and executive reporting.",
    features: ["Everything in Growth", "Finance and cash-flow workspaces", "Bank and payment reconciliation", "HR and payroll workspace", "Multi-branch reporting", "Advanced roles and approvals", "Guided implementation and migration"],
    cta: "Start Business trial",
    href: "/auth/email-sign-up?plan=business",
    checkoutEnabled: true,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    audience: "Larger organizations with custom workflows, integrations or support requirements",
    monthlyEtb: null,
    quarterlyEtb: null,
    annualEtb: null,
    trialDays: 0,
    users: "Custom user capacity",
    branches: "Custom organization structure",
    description: "A scoped implementation for complex operations, integrations, migration, governance and dedicated support.",
    features: ["Custom module configuration", "Integration and API planning", "Complex data migration", "Custom roles and approval flows", "Dedicated implementation management", "Service-level and support planning", "Commercial terms based on scope"],
    cta: "Talk to enterprise sales",
    href: "/request-demo?plan=enterprise",
    checkoutEnabled: false,
  },
];

export const pricingAddOns = [
  { label: "Additional user", price: "ETB 350 / month", detail: "Added to Starter, Growth or Business" },
  { label: "Additional branch", price: "ETB 1,000 / month", detail: "Includes branch-aware reporting and access" },
  { label: "Guided data migration", price: "From ETB 5,000 once", detail: "Final price depends on data quality and volume" },
  { label: "Custom integration", price: "Scoped quotation", detail: "For payments, external systems, APIs or specialized workflows" },
];

export const paymentMethodGroups = [
  {
    label: "Local digital payments",
    methods: ["Telebirr", "M-PESA", "CBE Birr", "AwashBirr", "Coopay-Ebirr"],
  },
  {
    label: "International payments",
    methods: ["Visa", "Mastercard", "International debit or credit card", "PayPal"],
  },
  {
    label: "Bank transfer",
    methods: ["Commercial Bank of Ethiopia", "Awash Bank", "Bank of Abyssinia"],
  },
] as const;

export function getPricingPlan(slug: string | null | undefined) {
  return pricingPlans.find((plan) => plan.slug === slug) ?? null;
}

export function getPlanAmount(plan: PricingPlan, interval: BillingInterval) {
  if (interval === "monthly") return plan.monthlyEtb;
  if (interval === "quarterly") return plan.quarterlyEtb;
  return plan.annualEtb;
}

export function getIntervalMonths(interval: BillingInterval) {
  if (interval === "monthly") return 1;
  if (interval === "quarterly") return 3;
  return 12;
}
