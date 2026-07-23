-- HisabERP billing and payment platform.
-- Adds public plan catalogue, organization subscriptions, provider orders,
-- invoices, bank-transfer review, webhook idempotency and trial lifecycle.

create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  audience text not null,
  description text not null,
  trial_days integer not null default 14 check (trial_days between 0 and 90),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  limits jsonb not null default '{}'::jsonb check (jsonb_typeof(limits) = 'object'),
  is_public boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_plan_prices (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.billing_plans(id) on delete cascade,
  billing_interval text not null check (billing_interval in ('monthly', 'quarterly', 'annual')),
  interval_months integer not null check (interval_months in (1, 3, 12)),
  currency char(3) not null default 'ETB',
  amount numeric(14,2) not null check (amount > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, billing_interval, currency)
);

create table if not exists public.billing_settings (
  singleton boolean primary key default true check (singleton),
  seller_name text not null default 'Hisab Technologies',
  seller_email text not null default 'info@hisabtech.com',
  seller_phone text not null default '+251 924 093 037',
  seller_country_code char(2) not null default 'ET',
  seller_tin text,
  vat_registered boolean not null default false,
  vat_number text,
  tax_label text not null default 'VAT',
  tax_rate_bps integer not null default 1500 check (tax_rate_bps between 0 and 10000),
  grace_days integer not null default 7 check (grace_days between 0 and 60),
  bank_transfer_instructions text not null default 'Create the order, use the formal invoice sent by HisabTech for bank account details, then submit the transfer reference and receipt for review.',
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_payment_channels (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  provider text not null,
  kind text not null check (kind in ('hosted_checkout', 'bank_transfer')),
  display_name text not null,
  description text not null,
  currency char(3) not null default 'ETB',
  account_name text,
  account_number text,
  instructions text,
  is_enabled boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.billing_plans(id),
  billing_interval text not null default 'monthly' check (billing_interval in ('monthly', 'quarterly', 'annual')),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'grace_period', 'suspended', 'cancelled', 'expired')),
  provider text,
  provider_customer_reference text,
  started_at timestamptz,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  last_payment_order_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_payment_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.billing_subscriptions(id) on delete set null,
  plan_id uuid not null references public.billing_plans(id),
  billing_interval text not null check (billing_interval in ('monthly', 'quarterly', 'annual')),
  provider text not null check (provider in ('chapa', 'bank_transfer')),
  status text not null default 'created' check (status in ('created', 'pending', 'pending_review', 'configuration_required', 'paid', 'failed', 'cancelled', 'expired', 'refunded', 'reversed')),
  tx_ref text not null unique,
  provider_reference text,
  checkout_url text,
  currency char(3) not null default 'ETB',
  subtotal numeric(14,2) not null check (subtotal >= 0),
  tax_amount numeric(14,2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(14,2) not null check (total_amount >= 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  paid_at timestamptz,
  failure_reason text,
  payment_method text,
  provider_payload jsonb not null default '{}'::jsonb check (jsonb_typeof(provider_payload) = 'object'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_subscriptions
  drop constraint if exists billing_subscriptions_last_payment_order_id_fkey;
alter table public.billing_subscriptions
  add constraint billing_subscriptions_last_payment_order_id_fkey
  foreign key (last_payment_order_id) references public.billing_payment_orders(id) on delete set null;

create sequence if not exists public.billing_invoice_number_seq start with 1001;

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique default ('HIS-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.billing_invoice_number_seq')::text, 6, '0')),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.billing_subscriptions(id) on delete set null,
  payment_order_id uuid unique references public.billing_payment_orders(id) on delete set null,
  plan_id uuid not null references public.billing_plans(id),
  billing_interval text not null check (billing_interval in ('monthly', 'quarterly', 'annual')),
  status text not null default 'open' check (status in ('draft', 'open', 'paid', 'void', 'refunded')),
  currency char(3) not null default 'ETB',
  subtotal numeric(14,2) not null,
  tax_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null,
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  paid_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  customer_snapshot jsonb not null default '{}'::jsonb,
  seller_snapshot jsonb not null default '{}'::jsonb,
  line_items jsonb not null default '[]'::jsonb check (jsonb_typeof(line_items) = 'array'),
  provider text,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_bank_transfer_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  payment_order_id uuid not null references public.billing_payment_orders(id) on delete cascade,
  channel_slug text not null references public.billing_payment_channels(slug),
  transfer_reference text not null,
  amount numeric(14,2) not null check (amount > 0),
  receipt_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payment_order_id, transfer_reference)
);

create table if not exists public.billing_events (
  id bigint generated always as identity primary key,
  provider text not null,
  event_key text not null unique,
  event_type text not null,
  tx_ref text,
  payment_order_id uuid references public.billing_payment_orders(id) on delete set null,
  processing_status text not null default 'received' check (processing_status in ('received', 'processed', 'ignored', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.billing_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.billing_subscriptions(id) on delete cascade,
  notification_type text not null check (notification_type in ('trial_ending', 'trial_ended', 'renewal_due', 'payment_failed', 'grace_period', 'suspended')),
  title text not null,
  body text not null,
  due_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (subscription_id, notification_type, due_at)
);

create index if not exists billing_plan_prices_lookup_idx on public.billing_plan_prices(plan_id, billing_interval, currency) where is_active;
create index if not exists billing_subscriptions_status_idx on public.billing_subscriptions(status, current_period_end, trial_ends_at);
create index if not exists billing_payment_orders_org_created_idx on public.billing_payment_orders(organization_id, created_at desc);
create index if not exists billing_payment_orders_status_idx on public.billing_payment_orders(status, expires_at);
create index if not exists billing_invoices_org_issued_idx on public.billing_invoices(organization_id, issued_at desc);
create index if not exists billing_bank_submissions_org_idx on public.billing_bank_transfer_submissions(organization_id, created_at desc);
create index if not exists billing_events_tx_ref_idx on public.billing_events(tx_ref, received_at desc);
create index if not exists billing_notifications_org_idx on public.billing_notifications(organization_id, read_at, created_at desc);

create or replace function public.billing_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.billing_set_updated_at() from public, anon, authenticated;

DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'billing_plans', 'billing_plan_prices', 'billing_settings', 'billing_payment_channels',
    'billing_subscriptions', 'billing_payment_orders', 'billing_invoices',
    'billing_bank_transfer_submissions'
  ]
  LOOP
    EXECUTE format('drop trigger if exists %I on public.%I', target_table || '_updated_at', target_table);
    EXECUTE format('create trigger %I before update on public.%I for each row execute function public.billing_set_updated_at()', target_table || '_updated_at', target_table);
  END LOOP;
END $$;

insert into public.billing_settings(singleton)
values (true)
on conflict (singleton) do nothing;

insert into public.billing_plans(slug, name, audience, description, trial_days, features, limits, sort_order)
values
  ('starter', 'Starter', 'Small businesses establishing dependable digital records', 'A focused operating workspace for sales, expenses, customer balances and essential reporting.', 14,
   '["Sales and transaction records","Expense tracking","Customer and supplier records","Receivables and payables","Basic dashboard and reports","English and Amharic access","Email support"]'::jsonb,
   '{"users":2,"branches":1,"modules":["sales","expenses","customers","suppliers","basic-reports"]}'::jsonb, 10),
  ('growth', 'Growth', 'Growing teams that need inventory, purchasing and stronger controls', 'Connect sales, inventory, purchasing, invoicing, customer credit and advanced operational reporting.', 14,
   '["Everything in Starter","Inventory and warehouse controls","Purchasing and supplier obligations","Invoices and collection follow-up","Advanced operational reports","Role-based user access","Priority onboarding support"]'::jsonb,
   '{"users":8,"branches":2,"modules":["sales","expenses","customers","suppliers","inventory","purchasing","invoicing","advanced-reports"]}'::jsonb, 20),
  ('business', 'Business', 'Established companies coordinating departments and branches', 'A wider management system for finance, reconciliation, HR, permissions, branches and executive reporting.', 14,
   '["Everything in Growth","Finance and cash-flow workspaces","Bank and payment reconciliation","HR and payroll workspace","Multi-branch reporting","Advanced roles and approvals","Guided implementation and migration"]'::jsonb,
   '{"users":25,"branches":5,"modules":["all-standard"]}'::jsonb, 30),
  ('enterprise', 'Enterprise', 'Larger organizations with custom workflows, integrations or support requirements', 'A scoped implementation for complex operations, integrations, migration, governance and dedicated support.', 0,
   '["Custom module configuration","Integration and API planning","Complex data migration","Custom roles and approval flows","Dedicated implementation management","Service-level and support planning","Commercial terms based on scope"]'::jsonb,
   '{"users":null,"branches":null,"modules":["custom"]}'::jsonb, 40)
on conflict (slug) do update set
  name = excluded.name,
  audience = excluded.audience,
  description = excluded.description,
  trial_days = excluded.trial_days,
  features = excluded.features,
  limits = excluded.limits,
  sort_order = excluded.sort_order,
  is_public = true,
  is_active = true;

insert into public.billing_plan_prices(plan_id, billing_interval, interval_months, currency, amount)
select p.id, price.billing_interval, price.interval_months, 'ETB', price.amount
from public.billing_plans p
join (values
  ('starter', 'monthly', 1, 1500::numeric),
  ('starter', 'quarterly', 3, 4500::numeric),
  ('starter', 'annual', 12, 15000::numeric),
  ('growth', 'monthly', 1, 4500::numeric),
  ('growth', 'quarterly', 3, 13500::numeric),
  ('growth', 'annual', 12, 45000::numeric),
  ('business', 'monthly', 1, 9500::numeric),
  ('business', 'quarterly', 3, 28500::numeric),
  ('business', 'annual', 12, 95000::numeric)
) as price(plan_slug, billing_interval, interval_months, amount) on price.plan_slug = p.slug
on conflict (plan_id, billing_interval, currency) do update set
  interval_months = excluded.interval_months,
  amount = excluded.amount,
  is_active = true;

insert into public.billing_payment_channels(slug, provider, kind, display_name, description, currency, instructions, is_enabled, sort_order, metadata)
values
  ('chapa', 'chapa', 'hosted_checkout', 'Secure digital checkout', 'Telebirr, M-PESA, CBE Birr, AwashBirr, Ethiopian bank channels, international cards and PayPal through Chapa hosted checkout.', 'ETB', 'Complete the payment in the secure Chapa checkout and return to HisabTech for server verification.', true, 10, '{"methods":["telebirr","mpesa","cbebirr","awashbirr","card","paypal"]}'::jsonb),
  ('cbe-bank-transfer', 'manual', 'bank_transfer', 'Commercial Bank of Ethiopia', 'Manual bank transfer reviewed by HisabTech finance.', 'ETB', 'Use the CBE account details on the formal invoice, include the Hisab payment reference, and submit proof for review.', true, 20, '{}'::jsonb),
  ('awash-bank-transfer', 'manual', 'bank_transfer', 'Awash Bank', 'Manual bank transfer reviewed by HisabTech finance.', 'ETB', 'Use the Awash Bank account details on the formal invoice, include the Hisab payment reference, and submit proof for review.', true, 30, '{}'::jsonb),
  ('abyssinia-bank-transfer', 'manual', 'bank_transfer', 'Bank of Abyssinia', 'Manual bank transfer reviewed by HisabTech finance.', 'ETB', 'Use the Bank of Abyssinia account details on the formal invoice, include the Hisab payment reference, and submit proof for review.', true, 40, '{}'::jsonb)
on conflict (slug) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  instructions = excluded.instructions,
  metadata = excluded.metadata,
  is_enabled = excluded.is_enabled,
  sort_order = excluded.sort_order;

create or replace function public.billing_create_trial_for_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  starter_plan_id uuid;
  configured_trial_days integer;
begin
  select id, trial_days into starter_plan_id, configured_trial_days
  from public.billing_plans
  where slug = 'starter' and is_active
  limit 1;

  if starter_plan_id is not null then
    insert into public.billing_subscriptions(
      organization_id, plan_id, billing_interval, status,
      trial_started_at, trial_ends_at, created_by
    ) values (
      new.id, starter_plan_id, 'monthly', 'trialing',
      now(), now() + make_interval(days => configured_trial_days), new.created_by
    ) on conflict (organization_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.billing_create_trial_for_organization() from public, anon, authenticated;

drop trigger if exists organizations_create_billing_trial on public.organizations;
create trigger organizations_create_billing_trial
after insert on public.organizations
for each row execute function public.billing_create_trial_for_organization();

insert into public.billing_subscriptions(
  organization_id, plan_id, billing_interval, status,
  trial_started_at, trial_ends_at, created_by
)
select o.id, p.id, 'monthly', 'trialing', now(), now() + make_interval(days => p.trial_days), o.created_by
from public.organizations o
cross join lateral (
  select id, trial_days from public.billing_plans where slug = 'starter' and is_active limit 1
) p
where not exists (
  select 1 from public.billing_subscriptions s where s.organization_id = o.id
);

create or replace function public.billing_refresh_subscription_statuses()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  configured_grace_days integer;
  trial_updates integer := 0;
  active_updates integer := 0;
  suspended_updates integer := 0;
  cancelled_updates integer := 0;
begin
  select grace_days into configured_grace_days from public.billing_settings where singleton = true;
  configured_grace_days := coalesce(configured_grace_days, 7);

  update public.billing_subscriptions
  set status = 'grace_period',
      grace_ends_at = coalesce(grace_ends_at, trial_ends_at + make_interval(days => configured_grace_days))
  where status = 'trialing' and trial_ends_at is not null and trial_ends_at <= now();
  get diagnostics trial_updates = row_count;

  update public.billing_subscriptions
  set status = 'past_due',
      grace_ends_at = coalesce(grace_ends_at, current_period_end + make_interval(days => configured_grace_days))
  where status = 'active'
    and current_period_end is not null
    and current_period_end <= now()
    and not cancel_at_period_end;
  get diagnostics active_updates = row_count;

  update public.billing_subscriptions
  set status = 'cancelled', cancelled_at = coalesce(cancelled_at, now())
  where status in ('active', 'past_due', 'grace_period')
    and cancel_at_period_end
    and current_period_end is not null
    and current_period_end <= now();
  get diagnostics cancelled_updates = row_count;

  update public.billing_subscriptions
  set status = 'suspended'
  where status in ('past_due', 'grace_period')
    and grace_ends_at is not null
    and grace_ends_at <= now();
  get diagnostics suspended_updates = row_count;

  insert into public.billing_notifications(organization_id, subscription_id, notification_type, title, body, due_at)
  select s.organization_id, s.id, 'trial_ending', 'Your HisabERP trial ends soon', 'Choose a billing plan to keep the workspace active after the trial.', s.trial_ends_at
  from public.billing_subscriptions s
  where s.status = 'trialing'
    and s.trial_ends_at > now()
    and s.trial_ends_at <= now() + interval '3 days'
  on conflict (subscription_id, notification_type, due_at) do nothing;

  insert into public.billing_notifications(organization_id, subscription_id, notification_type, title, body, due_at)
  select s.organization_id, s.id, 'renewal_due', 'Your HisabERP subscription needs renewal', 'Renew the subscription during the grace period to avoid interruption.', s.grace_ends_at
  from public.billing_subscriptions s
  where s.status in ('past_due', 'grace_period')
  on conflict (subscription_id, notification_type, due_at) do nothing;

  return jsonb_build_object(
    'trial_updates', trial_updates,
    'active_updates', active_updates,
    'suspended_updates', suspended_updates,
    'cancelled_updates', cancelled_updates
  );
end;
$$;

revoke all on function public.billing_refresh_subscription_statuses() from public, anon, authenticated;
grant execute on function public.billing_refresh_subscription_statuses() to service_role;

alter table public.billing_plans enable row level security;
alter table public.billing_plan_prices enable row level security;
alter table public.billing_settings enable row level security;
alter table public.billing_payment_channels enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_payment_orders enable row level security;
alter table public.billing_invoices enable row level security;
alter table public.billing_bank_transfer_submissions enable row level security;
alter table public.billing_events enable row level security;
alter table public.billing_notifications enable row level security;

-- Recreate explicit policies idempotently.
drop policy if exists billing_plans_public_read on public.billing_plans;
create policy billing_plans_public_read on public.billing_plans
for select to anon, authenticated
using (is_public and is_active);

drop policy if exists billing_prices_public_read on public.billing_plan_prices;
create policy billing_prices_public_read on public.billing_plan_prices
for select to anon, authenticated
using (is_active and exists (
  select 1 from public.billing_plans p where p.id = plan_id and p.is_public and p.is_active
));

drop policy if exists billing_channels_public_read on public.billing_payment_channels;
create policy billing_channels_public_read on public.billing_payment_channels
for select to anon, authenticated
using (is_enabled);

drop policy if exists billing_subscriptions_org_read on public.billing_subscriptions;
create policy billing_subscriptions_org_read on public.billing_subscriptions
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists billing_orders_org_read on public.billing_payment_orders;
create policy billing_orders_org_read on public.billing_payment_orders
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists billing_invoices_org_read on public.billing_invoices;
create policy billing_invoices_org_read on public.billing_invoices
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists billing_bank_submissions_org_read on public.billing_bank_transfer_submissions;
create policy billing_bank_submissions_org_read on public.billing_bank_transfer_submissions
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists billing_notifications_org_read on public.billing_notifications;
create policy billing_notifications_org_read on public.billing_notifications
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists billing_notifications_org_update on public.billing_notifications;
create policy billing_notifications_org_update on public.billing_notifications
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

grant select on public.billing_plans, public.billing_plan_prices, public.billing_payment_channels to anon, authenticated;
grant select on public.billing_subscriptions, public.billing_payment_orders, public.billing_invoices, public.billing_bank_transfer_submissions, public.billing_notifications to authenticated;
grant update (read_at) on public.billing_notifications to authenticated;

-- Keep provider event payloads and seller configuration service-role only.
revoke all on public.billing_settings, public.billing_events from anon, authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('billing-receipts', 'billing-receipts', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
