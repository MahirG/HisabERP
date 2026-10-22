export type MarketingComparison = {
  slug: string;
  number: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  summary: string;
  alternativeLabel: string;
  hisabLabel: string;
  bestFor: string;
  caution: string;
  rows: Array<{ capability: string; alternative: string; hisab: string; why: string }>;
  decisionQuestions: string[];
  nextStep: string;
  reviewed?: string;
  scope?: string;
  sources?: Array<{ label: string; url: string }>;
  alternativeFit?: string;
  limitations?: string;
};

export const marketingComparisons: MarketingComparison[] = [
{
  "slug": "biloo-vs-odoo",
  "number": "06",
  "eyebrow": "Biloo vs Odoo · Ethiopia",
  "title": "Biloo vs Odoo for Ethiopian businesses",
  "shortTitle": "Biloo vs Odoo",
  "summary": "Compare product scope, hosting choices, implementation responsibilities and cost questions before choosing ERP for an Ethiopian business.",
  "alternativeLabel": "Odoo",
  "hisabLabel": "Biloo ERP",
  "bestFor": "Owners and operations teams comparing a focused Biloo deployment with a configurable Odoo implementation.",
  "caution": "Published by Hisab Technologies, the maker of Biloo. This is a buying framework, not an independent ranking or a claim that the products have identical scope.",
  "reviewed": "2026-10-22",
  "scope": "Odoo edition and hosting matter. The hosting discussion references the Odoo 19.0 documentation; it does not claim 19.0 is the latest release. Community, Enterprise, Online, Odoo.sh and on-premise deployments must be evaluated separately. Confirm your proposed version, installed applications and local implementation with the vendor.",
  "rows": [
    {
      "capability": "Product scope",
      "alternative": "Odoo publishes a broad suite of business applications; inclusion depends on the edition and implementation.",
      "hisab": "Biloo presents connected sales, purchasing, inventory, finance and reporting workflows.",
      "why": "Demonstrate your actual transactions in both products. A module name alone does not establish equivalent behavior."
    },
    {
      "capability": "Hosting",
      "alternative": "Official documentation describes Odoo Online, Odoo.sh and on-premise approaches.",
      "hisab": "The current Biloo product is a hosted browser-based workspace.",
      "why": "Confirm connectivity, administration, backups, recovery and export responsibilities in writing."
    },
    {
      "capability": "Customization",
      "alternative": "Available customization paths depend on hosting, edition and implementation scope.",
      "hisab": "Custom integrations and workflows require a separate scope assessment.",
      "why": "Ask who maintains changes, what upgrades involve and what happens when requirements change."
    },
    {
      "capability": "Ethiopian requirements",
      "alternative": "Request a demonstration of the exact localization and installed modules being offered.",
      "hisab": "Review ETB records, branch workflows and the current English-language interface.",
      "why": "Neither this comparison nor a local vendor address proves statutory compliance."
    },
    {
      "capability": "Cost comparison",
      "alternative": "Use the current official pricing and an itemized implementation quote; no Odoo price is reproduced here.",
      "hisab": "Published ETB plans list user and branch limits; migration and custom work can add cost.",
      "why": "Compare the same users, branches, support period and migration scope."
    },
    {
      "capability": "Support and rollout",
      "alternative": "Confirm responsibilities between the platform, partner and your internal team.",
      "hisab": "Discuss onboarding and separately scoped migration with Hisab Technologies.",
      "why": "Choose based on accountable delivery, training and proven workflow fit."
    }
  ],
  "decisionQuestions": [
    "Which edition, version, applications and hosting model are included in the quotation?",
    "Can each vendor run the same invoice, stock movement, partial payment and management report?",
    "What costs recur, and what is excluded from setup, migration and support?",
    "Which localization, export and continuity requirements remain unverified?"
  ],
  "nextStep": "Use the same requirements and sample records in both demonstrations.",
  "alternativeFit": "Odoo may be the stronger choice when its wider application ecosystem or a particular implementation partner's proven solution meets requirements beyond Biloo's verified scope. Confirm this with a demonstration of the quoted configuration.",
  "limitations": "Biloo is not presented here as a replacement for every Odoo application. Offline operation, advanced manufacturing, additional interface languages, integrations and statutory reporting require separate validation. Hisab Technologies does not claim Odoo affiliation through this page.",
  "sources": [
    {
      "label": "Odoo editions — official comparison",
      "url": "https://www.odoo.com/page/editions"
    },
    {
      "label": "Odoo 19.0 hosting documentation",
      "url": "https://www.odoo.com/documentation/19.0/administration/hosting.html"
    },
    {
      "label": "Odoo official pricing",
      "url": "https://www.odoo.com/pricing"
    }
  ]
},
{
  "slug": "biloo-vs-erpnext",
  "number": "07",
  "eyebrow": "Biloo vs ERPNext · Ethiopia",
  "title": "Biloo vs ERPNext for Ethiopian businesses",
  "shortTitle": "Biloo vs ERPNext",
  "summary": "Evaluate a hosted Biloo workspace alongside an ERPNext implementation using your workflows, technical capacity and total operating cost.",
  "alternativeLabel": "ERPNext",
  "hisabLabel": "Biloo ERP",
  "bestFor": "Businesses assessing implementation ownership, customization needs and the operational cost of an ERP deployment.",
  "caution": "Published by the maker of Biloo. ERPNext has capabilities that may better fit your organization; confirm scope with the provider you are evaluating.",
  "reviewed": "2026-10-22",
  "scope": "The ERPNext product overview is the source for the broad product and open-source model described here. This is not a version-specific feature-parity audit. Confirm the proposed release, installed apps, hosting and implementation contract.",
  "rows": [
    {
      "capability": "Application coverage",
      "alternative": "The official ERPNext overview includes accounting, procurement, stock, manufacturing, projects and other business areas.",
      "hisab": "Evaluate Biloo's currently presented sales, inventory, purchasing, finance and reporting modules.",
      "why": "Use representative work rather than assuming both products implement every named module in the same way."
    },
    {
      "capability": "Source and customization",
      "alternative": "ERPNext is presented by Frappe as open-source business software.",
      "hisab": "Biloo custom requirements are assessed with Hisab Technologies; no open-source equivalence is claimed.",
      "why": "Determine whether source access, developer ownership or a managed service is important to your team."
    },
    {
      "capability": "Operating cost",
      "alternative": "Open-source licensing does not remove hosting, configuration, training or maintenance work.",
      "hisab": "Published ETB subscriptions and separately scoped implementation work define the commercial discussion.",
      "why": "Compare the full operating period and responsibilities, not a license headline."
    },
    {
      "capability": "Local requirements",
      "alternative": "Ask the proposed implementer to prove the localization and installed applications you need.",
      "hisab": "Review ETB records, branch setup and current English-language workflows.",
      "why": "Verify local requirements independently instead of treating country targeting as certification."
    },
    {
      "capability": "Implementation ownership",
      "alternative": "Agree who manages hosting, upgrades, extensions and support for your chosen deployment.",
      "hisab": "Agree onboarding, migration, support and integration scope with Hisab Technologies.",
      "why": "A named owner and acceptance plan matter whichever platform you select."
    }
  ],
  "decisionQuestions": [
    "Do we need source access or a specific ERPNext application?",
    "Who will operate hosting, backups, upgrades and customizations?",
    "Can both vendors reconcile our sample customer balances and stock counts?",
    "What implementation, internal staff and support costs are missing from the quote?"
  ],
  "nextStep": "Choose a deployment model and test your highest-risk workflow before choosing a vendor.",
  "alternativeFit": "ERPNext may be the better fit when open-source control, its published application coverage or an implementer's established solution is central to the project. Evaluate actual deployment and maintenance capacity.",
  "limitations": "This page does not establish parity with ERPNext manufacturing, projects or other specialist applications. Biloo scope, export requirements, offline continuity and country-specific statutory processes need a focused assessment.",
  "sources": [
    {
      "label": "ERPNext official product overview",
      "url": "https://frappe.io/erpnext"
    },
    {
      "label": "ERPNext official documentation",
      "url": "https://docs.frappe.io/erpnext"
    }
  ]
},
  {
    slug: "excel",
    number: "01",
    eyebrow: "Biloo vs spreadsheets",
    title: "Biloo vs Excel for daily business management",
    shortTitle: "Biloo vs Excel",
    summary: "Compare flexible spreadsheets with a controlled, multi-user operating workspace for sales, inventory, finance and reporting.",
    alternativeLabel: "Excel or spreadsheets",
    hisabLabel: "Biloo",
    bestFor: "Businesses that have outgrown one-person files, repeated formulas and manual consolidation.",
    caution: "Excel remains useful for ad-hoc analysis and exports. The comparison is about using spreadsheets as the primary transaction system.",
    rows: [
      { capability: "Daily transactions", alternative: "Entered into separate files or sheets", hisab: "Recorded in connected operational modules", why: "Sales, stock, customer balances and reports can update from the same controlled records." },
      { capability: "Multiple users", alternative: "Possible, but conflicts and version control require discipline", hisab: "Designed around organization users and permissions", why: "Teams can work in the same system without passing files between departments." },
      { capability: "Audit history", alternative: "Cell and file history varies by storage method", hisab: "Business and authentication events are recorded", why: "Owners can investigate who performed important actions and when." },
      { capability: "Validation", alternative: "Depends on formulas, protected cells and user discipline", hisab: "Forms and business rules constrain operational input", why: "Structured entry reduces accidental format and formula errors." },
      { capability: "Reporting", alternative: "Built manually from formulas, pivots or copied data", hisab: "Operational reports use the same underlying records", why: "Management does not need to rebuild the business picture every reporting period." },
      { capability: "Mobile workflow", alternative: "Possible, but large sheets can be difficult to operate", hisab: "Responsive workflows are designed for business tasks", why: "Users can focus on the action rather than navigating a large workbook." },
    ],
    decisionQuestions: ["How many people edit the same business records?", "How often are reports rebuilt manually?", "Can you explain which file is the current source of truth?", "Do spreadsheet errors affect stock, cash or customer balances?"],
    nextStep: "Move master data and opening balances first, then run a controlled parallel period before retiring operational spreadsheets.",
  },
  {
    slug: "notebooks",
    number: "02",
    eyebrow: "Biloo vs paper records",
    title: "Biloo vs notebooks and handwritten ledgers",
    shortTitle: "Biloo vs notebooks",
    summary: "Understand what changes when sales, expenses, debts and inventory move from paper into a searchable, role-controlled workspace.",
    alternativeLabel: "Notebooks and ledgers",
    hisabLabel: "Biloo",
    bestFor: "Businesses that need faster lookup, clearer balances and less dependence on one physical record book.",
    caution: "Paper can remain a temporary continuity method, but it should not be presented as synchronized or automatically recoverable.",
    rows: [
      { capability: "Record lookup", alternative: "Manual page-by-page search", hisab: "Searchable records and filtered lists", why: "Teams can find a customer, invoice or product without locating the correct book first." },
      { capability: "Business visibility", alternative: "Totals are calculated periodically", hisab: "Dashboards and reports summarize recorded activity", why: "Owners can review the current position without waiting for manual recapture." },
      { capability: "Physical risk", alternative: "Books can be lost, damaged or unavailable", hisab: "Cloud-hosted application records with configured continuity processes", why: "Access is not tied to one physical object, although backup operations still require verification." },
      { capability: "Permissions", alternative: "Anyone holding the book may see its contents", hisab: "Organization roles and administrator controls", why: "Sensitive payroll, finance and security functions can be separated from daily operations." },
      { capability: "Corrections", alternative: "Cross-outs and rewritten pages", hisab: "Structured updates and audit evidence for important actions", why: "The business can investigate changes without relying only on handwriting." },
      { capability: "Branch consolidation", alternative: "Books must be transported or summarized", hisab: "Branches can operate within one organization model", why: "Management can compare activity without manually combining physical ledgers." },
    ],
    decisionQuestions: ["How long does it take to find an old transaction?", "What happens if a notebook is damaged or misplaced?", "Can owners see branch performance before books are collected?", "Who can read or alter sensitive records?"],
    nextStep: "Define a cutover date, capture opening balances and active master data, then preserve old books as historical evidence rather than retyping every page.",
  },
  {
    slug: "separate-tools",
    number: "03",
    eyebrow: "Biloo vs disconnected apps",
    title: "Biloo vs separate accounting, inventory and sales tools",
    shortTitle: "Biloo vs separate tools",
    summary: "Compare specialized applications that do not share records with one connected ERP workspace.",
    alternativeLabel: "Separate business tools",
    hisabLabel: "Biloo",
    bestFor: "Teams repeatedly copying customers, products, payments or totals between different systems.",
    caution: "A specialized tool may remain stronger for a narrow advanced use case. Integration or coexistence should be evaluated rather than assumed.",
    rows: [
      { capability: "Customer records", alternative: "Duplicated across sales and accounting tools", hisab: "Shared customer and supplier records", why: "Contact details and balances do not need to be maintained in several places." },
      { capability: "Inventory impact", alternative: "Sales may require separate stock updates", hisab: "Sales, purchasing and inventory workflows are connected", why: "Operational activity can contribute to the same stock picture." },
      { capability: "Reconciliation", alternative: "Exports and manual matching between systems", hisab: "Payments and business records can be reviewed in one workspace", why: "Exceptions become easier to identify when related records are visible together." },
      { capability: "User access", alternative: "Different accounts and permission models", hisab: "One organization and role model", why: "Administration is simpler when access is managed from one workspace." },
      { capability: "Reporting", alternative: "Management combines exports from multiple sources", hisab: "Reports draw from connected ERP records", why: "The business spends less time aligning dates, names and totals." },
      { capability: "Change management", alternative: "Several vendors, interfaces and support processes", hisab: "One implementation path for core operations", why: "Training and operational standards can be organized around one product." },
    ],
    decisionQuestions: ["Which records are entered more than once?", "How many exports are required to close the month?", "Can two systems disagree about stock or customer debt?", "Which specialized tools are genuinely required after migration?"],
    nextStep: "Map the system of record for each data type, retain necessary specialist tools and migrate duplicated core operations in controlled phases.",
  },
  {
    slug: "desktop-software",
    number: "04",
    eyebrow: "Cloud ERP vs desktop software",
    title: "Biloo cloud workspace vs traditional desktop software",
    shortTitle: "Cloud vs desktop",
    summary: "Compare browser-based access and centralized deployment with software installed and maintained on individual computers.",
    alternativeLabel: "Desktop software",
    hisabLabel: "Biloo cloud workspace",
    bestFor: "Businesses that need controlled access from multiple locations and do not want every workstation managed separately.",
    caution: "Cloud access depends on internet availability and provider operations. Local continuity and export procedures should be part of implementation planning.",
    rows: [
      { capability: "Access", alternative: "Usually tied to installed computers or a local network", hisab: "Browser-based access for authorized users", why: "Teams can work from supported devices without installing the full application on each one." },
      { capability: "Updates", alternative: "Installed or coordinated across machines", hisab: "Application releases are deployed centrally", why: "Users receive the same product version without manual workstation updates." },
      { capability: "Remote branches", alternative: "May require VPN, remote desktop or data transfer", hisab: "Branches connect to the same hosted workspace", why: "Organizations can avoid moving separate database files between locations." },
      { capability: "Infrastructure", alternative: "Local server, workstation and backup responsibilities", hisab: "Hosted application with shared platform responsibilities", why: "The customer still manages users and data quality while Biloo manages application delivery." },
      { capability: "Offline work", alternative: "Can continue when a local device and database are available", hisab: "Requires connectivity for current web workflows", why: "Internet resilience should be assessed honestly before rollout." },
      { capability: "Security model", alternative: "Depends heavily on local network and device administration", hisab: "Application controls plus hosting-platform controls", why: "Security responsibilities are divided between Biloo, providers and the customer." },
    ],
    decisionQuestions: ["Do users need access outside one office?", "Who currently installs updates and verifies backups?", "How reliable is connectivity at each branch?", "What data export or continuity process is required?"],
    nextStep: "Assess connectivity and device readiness by location, test the browser workflow and document an operational continuity plan before cutover.",
  },
  {
    slug: "small-business-vs-enterprise",
    number: "05",
    eyebrow: "Right-sized ERP evaluation",
    title: "Biloo for growing businesses vs large enterprise ERP suites",
    shortTitle: "Growing business vs enterprise ERP",
    summary: "Evaluate implementation depth, complexity and operating fit instead of choosing software only by the length of its feature list.",
    alternativeLabel: "Large enterprise ERP suite",
    hisabLabel: "Biloo",
    bestFor: "Small and medium businesses seeking connected controls without a large transformation program.",
    caution: "Organizations with complex global consolidation, deep industry manufacturing or extensive statutory requirements may need specialist enterprise platforms or integrations.",
    rows: [
      { capability: "Implementation scope", alternative: "Often multi-department and highly configurable", hisab: "Focused rollout around core business operations", why: "The project can prioritize immediate control problems before expanding." },
      { capability: "Administration", alternative: "May require dedicated specialists and consultants", hisab: "Designed for owners, managers and operational administrators", why: "The organization can manage common workflows without a large internal ERP team." },
      { capability: "Localization", alternative: "Global foundation with country-specific projects", hisab: "Product positioning centered on Ethiopian businesses", why: "ETB, local support context and multilingual access are part of the core proposition." },
      { capability: "Customization", alternative: "Broad configuration and extension ecosystems", hisab: "Controlled product modules and evaluated integrations", why: "A narrower product can be easier to operate but may not cover every specialist requirement." },
      { capability: "Cost structure", alternative: "Licensing, implementation and specialist support can be substantial", hisab: "Published ETB launch plans with separately scoped services", why: "Prospects can evaluate subscription and implementation components more transparently." },
      { capability: "Best fit", alternative: "Large, complex and multinational organizations", hisab: "Growing Ethiopian businesses and multi-branch teams", why: "Fit should be judged by operating requirements, not brand size." },
    ],
    decisionQuestions: ["Which requirements are essential in the next twelve months?", "Does the business have a dedicated ERP administration team?", "Are global consolidation or advanced manufacturing capabilities mandatory?", "Would a phased implementation reduce risk?"],
    nextStep: "Create a requirements matrix, classify each item as essential or optional and validate the highest-risk workflows in a focused demonstration.",
  },
];

export function getMarketingComparison(slug: string) {
  return marketingComparisons.find((comparison) => comparison.slug === slug);
}
