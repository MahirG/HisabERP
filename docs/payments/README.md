# Biloo ERP payments — implementation and activation

Implemented 2026-11-16. Provider activation is deliberately deferred. The gateway is disabled by default and no merchant credentials are included in source.

## Delivered flows

- Platform subscription checkout: ETB monthly/annual, one-time authorization, manual renewal, stable request keys and a payer-level reservation lock. Uncertain initialization stays pending; never blindly initialize a second charge.
- Exact reference, saved amount, currency, environment and payment-status checks against Chapa v1 verification. The API envelope's success flag cannot activate access.
- Raw-body HMAC authenticated webhooks, durable inbox, fenced 90-second processing leases, failed-event retry and idempotent settlement.
- Live access periods per verified payment. Renewals append; changes of plan start after already-paid periods. Start/end boundaries are enforced by the proxy. Refunds revoke only their period; stale success cannot reactivate refunded evidence. Existing user-based subscription ownership is retained.
- Billing history, CSV export (latest 1,000), printable receipt / save as PDF, in-app seven-day renewal notice, scheduled-period visibility and refund requests.
- Restricted platform operator page at `/billing/operations`. Requires an allowlisted auth UUID and AAL2 MFA. Refund approval records a decision; it does not move funds. Execute an approved refund in the merchant dashboard, then confirm its status by server verification. No client may mark it paid/refunded.
- Tenant payment center `/payments`: merchant settings, clearing account selection, full/partial invoice links, expiry and revocation, latest 100 collection attempts, latest 50 links, CSV export and finance-controlled posting.
- Invoice checkout uses ONLY the organization's own merchant credentials. It cannot fall back to the platform's key. Private links contain 256-bit random tokens; only SHA-256 hashes are stored. Payer pages show merchant, invoice number and requested amount, not customer contact data or invoice items. No indexing, caching or referrer leakage; keep links private.
- A verified collection goes to a review queue. Only finance approval creates the accounting receipt and balanced journal. Outstanding balance is checked again under lock; a changed/returned invoice cannot be over-allocated. Test collections never post live accounting.
- Provider-confirmed refunds/reversals of posted collections can create a separate idempotent reversal journal and reopen the invoice allocation. Original journal and provider evidence are preserved. Provider fees and net bank settlement are reconciled separately against the clearing account using the existing reconciliation workspace; gross collection approval does not certify a bank settlement.
- Authenticated reconciliation endpoint rechecks small batches, including successful payments for later reversals. Failed checks are rate-limited as well so they cannot starve other records. No scheduler is enabled by this commit.

## Database rollout

Apply `supabase/migrations/20261116145222_payment_operations.sql` to the EXISTING ERP Supabase project after a backup and staging validation. It is additive and depends on the already-deployed billing tables and catalogue (`hisab_billing_plans`) as well as existing sales/finance workflows. Do not run the historical `20260724_hisab_chapa_billing_foundation.sql` on an existing database: it drops historical Stripe-era tables. The retained repository history does not contain the original billing catalogue creation; do not blindly bootstrap a fresh database from this migration set.

The active Supabase connections inspected during implementation did not expose an ERP project. This migration has therefore been validated in an isolated PostgreSQL-compatible PGlite database using the real retained base, finance, sales, and billing migrations, but has NOT been applied to the hosted ERP database. The UI reports unavailable records rather than inventing empty payment state. Keep `BILLING_ENFORCEMENT_ENABLED=false` until migration and live acceptance checks are complete. Do not use a different product's database.

All new tables have RLS. Authenticated users can read their own subscription evidence or authorized organization collections; they cannot directly write provider states. Provider settlement and inbox functions are service-only. Tenant mutation RPCs check membership and role in the database in addition to application permission checks. Service-role keys and provider keys remain server-only.

## Connect the platform merchant later

Create and approve a Chapa merchant account. Set these SERVER variables using the hosting dashboard's secure fields, never chat or git:

- `CHAPA_SECRET_KEY`: your test secret initially.
- `CHAPA_WEBHOOK_SECRET`: raw-body signature webhook secret.
- `CHAPA_MODE=test` initially; `live` only with a live key and completed acceptance testing.
- `CHAPA_PAYMENTS_ENABLED=true` only when ready to begin provider testing. Default is false.
- `NEXT_PUBLIC_APP_URL=https://hisabtech.com`.
- `BILLING_ADMIN_USER_IDS`: comma-separated platform operator auth UUIDs. Those operators must use MFA. Organization admin status alone never grants platform billing operations.

Register subscription webhook `https://hisabtech.com/api/chapa/webhook` with raw-body HMAC signature authentication (`x-chapa-signature`). Automatic callback and browser return URLs are sent during initialization. Raw-body signatures are required; the legacy static secret digest is intentionally rejected. Current implementation targets the documented `https://api.chapa.co/v1` contract. Confirm the merchant's actual API version, key format, checkout origins, callback fields, signature scheme, mode field and refund behavior with official documentation before activating. Do not switch to v2 by changing the URL alone.

Test success produces a test receipt, never paid production access. Keep billing enforcement off during testing.

## Connect each invoice merchant later

1. In `/payments`, choose the business's display label, test/live environment and asset clearing account. Save settings while checkout is disabled.
2. Derive the credential prefix: `CHAPA_ORG_` + organization UUID without hyphens, uppercase. For UUID `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`, the variables are:
   - `CHAPA_ORG_AAAAAAAAAAAA4AAA8AAAAAAAAAAAAAAA_SECRET_KEY`
   - `CHAPA_ORG_AAAAAAAAAAAA4AAA8AAAAAAAAAAAAAAA_WEBHOOK_SECRET`
3. Install that business's own approved credentials securely on the server. Do not reuse the platform subscription account.
4. Register webhook `https://hisabtech.com/api/payments/chapa/webhook?merchant=ORGANIZATION_UUID`, using its own raw-body signature secret.
5. Enable the business setting and global `CHAPA_PAYMENTS_ENABLED` only for acceptance testing. Create a test invoice link and complete provider sandbox verification.
6. Test changed balances, partial payments, duplicate/reordered callbacks, expired/revoked links, timeout recovery, refunds and fee settlement. Do not change merchant keys or environment while payments remain unresolved.
7. Move that merchant to live only after confirming that funds reach its intended settlement account. Live provider settlement/refund checks require a real merchant and cannot be certified by local tests.

## Recovery and reconciliation scheduling

Set a long random server-only `CRON_SECRET`. An authorized scheduler can POST to `https://hisabtech.com/api/payments/reconcile` with `Authorization: Bearer <CRON_SECRET>`. Each invocation checks at most two subscription and two invoice attempts, oldest checked first, with 12-second provider timeouts and a 20-second verification cooldown. Schedule at an interval appropriate to transaction volume and hosting limits; no scheduling service or paid provider account is created here. Operator/customer status checks and authenticated webhooks also recover payment state.

If checkout initialization times out, its reserved reference stays pending until a provider check confirms a terminal state. This deliberately prevents duplicate charges. Do not manually change its state to retry. Use merchant support for an unresolved reference. Missing keys, missing database migrations and failed provider verification never imply payment success.

## Verification

- `npm run test:payments`: real SQL execution against PGlite plus runtime provider mocks; cents validation, raw signature tampering, environment mismatch, RLS, duplicate reservations, retry/lease fencing, access scheduling, refund terminality, invoice balance checks, one-time posting and balanced/idempotent reversals.
- `npm run typecheck`, `npm run build`, `npm run seo:check`.
- Full legacy suite is compared with unchanged repository HEAD; it has 123 pre-existing failures. Do not describe the entire suite as passing.
- A browser engine download failed in this workspace. Mobile/desktop browser interaction and real hosted Supabase / Chapa acceptance remain unverified. UI code uses server rendering, parallel independent queries, explicit labels, bounded tables, focus styles and responsive layouts; this is not a substitute for browser QA.

Out of scope for this credential-deferred release: automatic recurring debits, card storage, payouts/payroll transfers, foreign currency conversion, provider-initiated refund execution, email/SMS delivery automation, and additional live gateways. Existing statement import/fee reconciliation remains available. These are not shown as working integrations.
