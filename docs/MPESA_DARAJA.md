# Safaricom M-Pesa Daraja integration

HisabERP separates three different credential classes:

1. **Consumer Key** — used with the Consumer Secret to request a short-lived Daraja OAuth access token.
2. **Consumer Secret** — used only in server-side Basic authentication for the OAuth token endpoint.
3. **Hisab callback token** — a separate random secret appended to or sent with the M-Pesa callback URL. It is not a Safaricom Consumer Secret.

## Secure storage

The preferred setup stores each organization's Daraja credentials in Supabase Vault under tenant-scoped names. Only the Supabase `service_role` can call the credential reader and writer RPCs. Authenticated browser clients cannot query Vault, retrieve decrypted values, or call the secret RPCs.

Environment variables remain an optional single-tenant fallback:

```env
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_DARAJA_ENV=sandbox
MPESA_CALLBACK_TOKEN=
```

Never prefix any of these values with `NEXT_PUBLIC_` and never commit them to Git.

## OAuth validation

The reconciliation page provides an MFA- and finance-permission-protected form. It can auto-detect the credential environment by testing Safaricom sandbox first and production second. Validation performs only an OAuth token request. It does not initiate STK Push, C2B, B2C, reversal, balance, or transaction-status operations.

Hisab caches access tokens in server memory until shortly before expiry. Access tokens are never written to the database, returned to the browser, or included in connection-check evidence.

## Callback security

The callback endpoint is:

```text
https://www.hisabtech.com/api/reconciliation/mpesa/callback?source=<source-reference>&token=<hisab-callback-token>
```

The source reference must identify exactly one active M-Pesa reconciliation source. Hisab resolves that source's organization, retrieves the organization's separate callback token from Vault, performs a constant-time comparison, normalizes the provider event, and stores it idempotently. Callback ingestion cannot post journals; an authorized finance user must confirm reconciliation matches.

## Additional details still required for payment initiation

OAuth credentials alone do not enable customer charges. STK Push or other payment initiation requires the approved Safaricom product, shortcode or till, Lipa na M-Pesa passkey where applicable, transaction type, callback registration, and production go-live approval.
