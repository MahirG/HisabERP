# Biloo ERP brand migration

The Hisab ERP application foundation is now presented as **Biloo ERP**, a Biloo Group product.

## Brand system

- Midnight Graphite: `#0F172A`
- Royal Sapphire Blue: `#1E3A8A`
- Ivory White: `#F8FAFC`
- Product name: **Biloo ERP**
- Planned application URL: `https://erp.biloogroup.com`

## What remains technically unchanged

Database migrations, organization tenancy, Row Level Security, accounting posting logic, audit history, Supabase configuration interfaces, and internal compatibility keys remain intact. This prevents a visual rebrand from becoming a data migration.

## Production requirements

Before moving authentication traffic to the Biloo domain, configure the new Site URL and callback URLs in Supabase and Google OAuth, then validate login, onboarding, organization isolation, and write operations in a staging environment.
