begin;

create table if not exists public.hisab_billing_plans (
  code text primary key,
  name text not null,
  description text not null,
  monthly_amount_etb numeric(14,2) not null check (monthly_amount_etb > 0),
  annual_amount_etb numeric(14,2) not null check (annual_amount_etb > 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.hisab_billing_plans is 'Read-only HisabERP subscription catalogue. Stripe checkout values are also validated server-side.';

create table if not exists public.hisab_billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.hisab_billing_customers is 'Server-managed mapping between a Supabase user and a Stripe Customer.';

create table if not exists public.hisab_billing_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_code text not null references public.hisab_billing_plans(code),
  billing_cycle text not null check (billing_cycle in ('monthly','annual')),
  amount_etb numeric(14,2) not null check (amount_etb >= 0),
  currency text not null default 'ETB' check (currency = 'ETB'),
  provider text not null default 'stripe' check (provider = 'stripe'),
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status text not null check (status in ('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  last_invoice_status text,
  last_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.hisab_billing_subscriptions is 'Authoritative subscription state written only by verified Stripe webhook processing.';

create table if not exists public.hisab_billing_checkout_sessions (
  stripe_session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null references public.hisab_billing_plans(code),
  billing_cycle text not null check (billing_cycle in ('monthly','annual')),
  amount_etb numeric(14,2) not null check (amount_etb > 0),
  currency text not null default 'ETB' check (currency = 'ETB'),
  status text not null default 'open' check (status in ('open','complete','expired','failed')),
  stripe_customer_id text,
  stripe_subscription_id text,
  completed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hisab_billing_checkout_sessions_user_created_idx on public.hisab_billing_checkout_sessions(user_id, created_at desc);
comment on table public.hisab_billing_checkout_sessions is 'User-visible checkout progress. Completion is set from a verified Stripe webhook.';

create table if not exists public.hisab_billing_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null,
  status text not null default 'processing' check (status in ('processing','processed','failed')),
  attempts integer not null default 1 check (attempts > 0),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);
comment on table public.hisab_billing_webhook_events is 'Private idempotency and audit ledger for signed Stripe webhook events.';

alter table public.hisab_billing_plans enable row level security;
alter table public.hisab_billing_customers enable row level security;
alter table public.hisab_billing_subscriptions enable row level security;
alter table public.hisab_billing_checkout_sessions enable row level security;
alter table public.hisab_billing_webhook_events enable row level security;

revoke all on public.hisab_billing_plans from anon, authenticated;
revoke all on public.hisab_billing_customers from anon, authenticated;
revoke all on public.hisab_billing_subscriptions from anon, authenticated;
revoke all on public.hisab_billing_checkout_sessions from anon, authenticated;
revoke all on public.hisab_billing_webhook_events from anon, authenticated;
grant select on public.hisab_billing_plans to anon, authenticated;
grant select on public.hisab_billing_customers to authenticated;
grant select on public.hisab_billing_subscriptions to authenticated;
grant select on public.hisab_billing_checkout_sessions to authenticated;

 drop policy if exists "Public can read active Hisab billing plans" on public.hisab_billing_plans;
create policy "Public can read active Hisab billing plans"
on public.hisab_billing_plans for select
to anon, authenticated
using (is_active = true);

 drop policy if exists "Users can read their own Stripe customer mapping" on public.hisab_billing_customers;
create policy "Users can read their own Stripe customer mapping"
on public.hisab_billing_customers for select
to authenticated
using ((select auth.uid()) = user_id);

 drop policy if exists "Users can read their own Hisab subscription" on public.hisab_billing_subscriptions;
create policy "Users can read their own Hisab subscription"
on public.hisab_billing_subscriptions for select
to authenticated
using ((select auth.uid()) = user_id);

 drop policy if exists "Users can read their own checkout sessions" on public.hisab_billing_checkout_sessions;
create policy "Users can read their own checkout sessions"
on public.hisab_billing_checkout_sessions for select
to authenticated
using ((select auth.uid()) = user_id);

insert into public.hisab_billing_plans (code,name,description,monthly_amount_etb,annual_amount_etb,is_active,sort_order,updated_at)
values
  ('starter','Starter','Dependable digital records for small businesses.',1500,15000,true,10,now()),
  ('growth','Growth','Inventory, purchasing, invoicing and stronger operational controls.',4500,45000,true,20,now()),
  ('business','Business','Finance, reconciliation, branch and advanced management controls.',9500,95000,true,30,now())
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  monthly_amount_etb = excluded.monthly_amount_etb,
  annual_amount_etb = excluded.annual_amount_etb,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

commit;
