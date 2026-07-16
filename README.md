# Hisab ERP — Next.js

Hisab ERP is being migrated from a standalone HTML application into a modular Next.js App Router product with TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current architecture

- `/` — native responsive ERP dashboard
- `/modules` — phased ERP module catalogue
- `/modules/[slug]` — module capability and control definitions
- `/legacy` — compatibility route for the original standalone application

## ERP implementation phases

### Phase 1 — required foundation

Finance and accounting, sales and invoicing, purchasing and expenses, inventory and warehouse, customers and suppliers, reporting and analytics, security and approvals, and localization and compliance.

### Phase 2 — operational expansion

Human resources and payroll, fixed assets, and budgeting and projects.

### Phase 3 — growth platform

Secure integrations, APIs, webhooks and workflow automation.

The current module pages define capabilities and governance requirements. Persistent database models, authentication, permissions, transaction posting, forms and approvals will be implemented incrementally.
