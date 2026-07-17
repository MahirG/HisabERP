# Implementation status

## Implemented in the production foundation

- Supabase SSR authentication utilities and protected routes
- Company onboarding, branches, memberships and role model
- PostgreSQL schema with RLS tenant isolation
- Persistent docked ERP navigation with inside-workspace route changes
- Customers, products, warehouses and stock balances
- Double-entry accounts, journal entries and immutable posted journals and lines
- Atomic sales invoice posting with VAT, receivable, revenue, COGS and inventory movement
- Append-only audit events and approval-request foundation
- Live/demo data access layer
- Functional customer, inventory, invoice and report screens
- Cookie-backed first-render language selection
- Dynamic localized date and greeting
- CSP, security headers, rate-limit fallback, error pages and health endpoint
- CI checks, schema tests, backup instructions and legacy safety warning

## Finance & Accounting — Phase 1 complete

- Finance overview with profit and loss, balance-sheet position and trial-balance validation
- Expanded chart of accounts with cash, bank, tax, fixed-asset and depreciation classifications
- Secure creation of organization-scoped finance accounts
- Balanced manual journal posting through a role-checked atomic RPC
- Customer receipts, supplier payments and expense posting
- Open-invoice receipt allocation and invoice status updates
- Input and output VAT configuration and net tax position
- Fixed-asset registration and acquisition posting
- Monthly straight-line depreciation with duplicate-period prevention
- Open, soft-closed and locked accounting periods
- Period-lock enforcement on all journal-based operational posting
- Audit events for account, journal, payment, asset, depreciation and closing actions
- Finance RPCs restricted to authenticated users with explicit actor, tenant and role validation
- Covering indexes for new finance foreign keys and operational lookup paths

## Requires project-owner configuration

- Add or verify Vercel environment variables for the Hisab Technologies Supabase project
- Configure email confirmation and redirect URLs
- Enable MFA and production backup/PITR policies
- Enable leaked-password protection in Supabase Auth
- Verify Benaiah font redistribution rights
- Obtain professional Ethiopian accounting and tax review before statutory use

## Next operational modules

Purchasing/AP documents, supplier master records, bank statement import and reconciliation, credit notes/returns, multi-warehouse transfers, payroll, budget approvals and production integrations should build on this foundation in separate reviewed releases.