# Biloo Website — two-way inquiry email

The public **Contact us** menu and **Book a walkthrough** share the secure `/request-demo` form. In production, submissions are stored in `public.demo_requests` subject to existing Supabase RLS. The server action independently attempts two transactional emails:

1. Admin notification to **mahir@hisabtech.com**, with the submitted name, company, contact details, requirements, and a direct reply link.
2. A branded acknowledgment to the customer's entered email, including the request reference and expected next step.

Email provider acceptance is not an inbox-delivery guarantee; bounced/delayed messages should be monitored at the provider. The UI distinguishes accepted admin and customer sends from database-only storage and failures. Automated receipt emails should never claim a specific response SLA.

## Required Vercel configuration

In [hisab/hisab-erp](https://vercel.com/hisab/hisab-erp/settings/environment-variables), set:

- `RESEND_API_KEY` as **Encrypted/Sensitive**, only in environments where real mail delivery is desired.
- `DEMO_EMAIL_FROM` to `Biloo ERP <notifications@hisabtech.com>` (optional; this is the default).

First verify ownership of `hisabtech.com` with Resend, including the provider's requested DKIM/SPF DNS records and DMARC alignment. Verify the sender before enabling production. Never commit or paste secret values in GitHub, logs, tickets, or messages.

**Hostinger Mail mailbox access alone is not a server-side email provider credential for Vercel**. The Hostinger Mail ChatGPT connector can read/send from connected mailboxes manually but cannot be silently used as a production API key. This application uses Resend's outbound transactional email API; alternatively implement an authenticated SMTP transport using protected credentials if changing providers.

After adding the key, **redeploy the current main commit** so Vercel picks up the environment variable. Submit a single controlled test with a mailbox you own and verify both message IDs and inbox placement. Check provider event logs for accepted/delivered/bounced.

## Failure scenarios

- No key: request is saved, UI says admin/customer email was not sent. Urgent contact link is shown.
- DB fails but email accepted: UI reports the email was accepted; do not claim DB save.
- Provider fails but DB stores: UI shows request saved, and customers can use mailto as fallback.
- Both fail: show error; never claim request received.
- Trapped honeypot submissions: no email and no fake submitted success.

## Security

- Never put `RESEND_API_KEY` in `NEXT_PUBLIC_*`.
- Use independent idempotency keys for business and customer emails based on per-form submission ID.
- Escape all untrusted customer-supplied strings in HTML emails; use email address as a validated Reply-To.
- Form validation and Supabase RLS stay in place; consider IP-based rate limiting and abuse monitoring if the form receives spam.
