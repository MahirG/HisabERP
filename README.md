# Hisab ERP — production foundation

Hisab ERP is a multilingual Next.js application for Ethiopian businesses. The native application now includes a production-oriented Supabase/PostgreSQL foundation while retaining the original HTML prototype at `/legacy` as a clearly marked demonstration.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Without Supabase variables the application runs in **safe demo mode** using sample data. Live write actions are disabled.

## Enable live mode

1. Create a Supabase project.
2. Run the three ordered SQL files in `supabase/migrations/` (`001_schema`, `002_workflows`, then `003_policies`).
3. Add the public Supabase URL and publishable key to `.env.local` and Vercel.
4. Add the production `/auth/callback` URL to Supabase Auth redirects.
5. Create an account and finish organization onboarding.

## Google OAuth configuration

Google sign-in is handled by Supabase Auth. Keep the Google OAuth client secret only in the Supabase dashboard—never commit it to GitHub or expose it as a public environment variable.

For the production Google **Web application** OAuth client, configure:

**Authorized JavaScript origins**

```text
https://www.hisabtech.com
https://hisabtech.com
http://localhost:3000
```

**Authorized redirect URIs**

```text
https://amwpbnczylbarqqcprev.supabase.co/auth/v1/callback
```

In Supabase **Authentication → URL Configuration**, use `https://www.hisabtech.com` as the production Site URL and allow these application redirects:

```text
https://www.hisabtech.com/auth/callback
https://hisabtech.com/auth/callback
http://localhost:3000/auth/callback
```

After changing Google OAuth settings, start a completely new sign-in attempt from the HisabERP login page. Do not reuse an old Google error or callback tab because its OAuth state may have expired.

## Production architecture

- Next.js App Router and React Server Components
- Supabase Auth using cookie-based SSR clients
- PostgreSQL with organization-level Row Level Security
- Double-entry journals and atomic invoice posting
- Append-only audit events
- English, Amharic and Tigrinya with server-resolved language cookies
- CSP/security headers, route protection, health checks and CI

## Main routes

- `/` dashboard using live data when authenticated
- `/customers` customer directory and creation
- `/inventory` stock and product creation
- `/sales/invoices/new` atomic sales invoice posting
- `/finance/journals` accounting journal review
- `/modules` ERP roadmap
- `/docs/setup` deployment checklist
- `/legacy` browser-only demonstration; never use for real data

## Validation

```bash
npm run typecheck
npm test
npm run build
```

Read `SECURITY.md`, `docs/IMPLEMENTATION_STATUS.md` and `docs/BACKUP_AND_RECOVERY.md` before production use.
