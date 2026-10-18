# Biloo authentication email templates

Brand: **Biloo ERP, by Hisab Technologies**. These are production-style, mobile-responsive, table-layout transactional email templates for Supabase Auth. They intentionally use email-client-compatible inline CSS and a typographic Biloo wordmark that renders even when remote images are blocked.

## Install in Supabase (project `amwpbnczylbarqqcprev`)
Navigate to **Authentication → Email Templates**, then paste each HTML file and configure its subject:

- **confirmation** — `supabase/templates/confirmation.html` — subject: `Confirm your email`
- **recovery** — `supabase/templates/recovery.html` — subject: `Reset your Biloo password`
- **magic-link** — `supabase/templates/magic-link.html` — subject: `Your secure Biloo sign-in link`
- **invite** — `supabase/templates/invite.html` — subject: `You've been invited to Biloo`
- **email-change** — `supabase/templates/email-change.html` — subject: `Confirm your new email address`
- **reauthentication** — `supabase/templates/reauthentication.html` — subject: `Verify your Biloo security request`

These templates contain **live Supabase Go-template variables** (`{{ .ConfirmationURL }}` or `{{ .Token }}`). Do not replace them with static URLs or credentials.

### Required hosting and redirect configuration
1. In **Vercel → hisab/hisab-erp**, set `NEXT_PUBLIC_SUPABASE_URL=https://amwpbnczylbarqqcprev.supabase.co`; set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`) to the matching public key; set `NEXT_PUBLIC_APP_URL` to the canonical URL actually serving HisabERP. Rebuild production to apply environment variable changes.
2. In Supabase **Authentication → URL Configuration**, set the Site URL to that canonical production domain and allow its `/auth/finish`, `/auth/confirm` and `/auth/callback` paths. If redirect handling relies on Supabase-supported URL patterns, add only tightly scoped patterns needed for query parameters. Don't use blanket `**` host allowlists.
3. In **Authentication → SMTP Settings**, configure a verified company sender, custom SMTP credentials and proper SPF/DKIM/DMARC. Set sender display name to `Biloo ERP`. Supabase's limited built-in email service is not a production mail-delivery service. Never check credentials into Git.
4. Verify the Google OAuth provider setup and register Supabase's OAuth callback URL in Google Cloud: `https://amwpbnczylbarqqcprev.supabase.co/auth/v1/callback`.
5. **Supabase Auth email settings and templates are project-wide.** Make sure this Auth project is not serving unrelated brands before replacing existing templates.

### Verification checklist
- Existing password user signs in; cookies persist after navigation.
- Sign up -> confirmation email -> `/auth/finish` -> `/onboarding`.
- Forgot password -> recovery email -> `/auth/finish?next=/auth/reset-password` -> reset -> new password login.
- Magic link -> authenticated workspace with no duplicate account.
- Team invitation -> valid session and onboarding.
- Email change and security code follow single-use expiry policy.
- Gmail, Outlook, and mobile email appearance tested with images disabled, dark mode, and narrow screens.
- Auth logs show no email delivery errors; wrong credentials never disclose account existence.

### Source changes
`app/auth/finish` completes Supabase hash-fragment, PKCE code, or token-hash links client-side. Existing `/auth/confirm` token hash and `/auth/callback` OAuth handlers are retained. `lib/actions/email-auth.ts` records safe email-delivery error diagnostics without user PII and continues to give generic replies to prevent account enumeration.

Note: installing the repository files does **not** automatically install templates or SMTP in the Supabase dashboard. These must be applied in the actual project's Auth configuration.
