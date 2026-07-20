# Safaricom M-Pesa Daraja configuration

HisabERP keeps Daraja application credentials server-only. They authenticate the OAuth token endpoint and are not interchangeable with the Hisab callback token.

## Required server variables

```env
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_DARAJA_ENV=sandbox
MPESA_CALLBACK_TOKEN=
```

`MPESA_CALLBACK_TOKEN` is generated and controlled by HisabTech. It protects the inbound callback URL and must be different from the Safaricom Consumer Secret.

The following values are required only when payment initiation is implemented and approved:

```env
MPESA_SHORTCODE=
MPESA_PASSKEY=
```

Do not prefix any of these values with `NEXT_PUBLIC_`. Do not commit them to GitHub or place them in browser forms.

## Connection validation

An authenticated finance user whose MFA policy is satisfied can request:

```text
GET /api/reconciliation/mpesa/status
```

The server requests a Daraja OAuth access token and returns only:

- whether credentials are configured
- sandbox or production environment
- connection success or failure
- token expiry duration
- validation timestamp

The access token and credentials are never returned. This check does not initiate STK Push, C2B, B2C or any financial transaction.

## Environment policy

Use `sandbox` until Safaricom approves the production application and provides the associated live shortcode, passkey and callback configuration. Switching to `production` changes only the Daraja base URL; it does not make incomplete merchant configuration valid.

## Rotation

Rotate a Consumer Key or Consumer Secret immediately when it has been pasted into chat, issue trackers, logs or other non-secret storage. Update the encrypted server variables and redeploy. The old credential pair should then be revoked from the Daraja portal.
