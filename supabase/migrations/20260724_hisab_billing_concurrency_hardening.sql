begin;

create table if not exists public.hisab_billing_checkout_locks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  checkout_token uuid not null unique default gen_random_uuid(),
  plan_code text not null references public.hisab_billing_plans(code),
  billing_cycle text not null check (billing_cycle in ('monthly','annual')),
  status text not null default 'creating' check (status in ('creating','open')),
  stripe_session_id text unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.hisab_billing_checkout_locks is 'Server-only per-user lease preventing concurrent Stripe Checkout Session creation.';

create index if not exists hisab_billing_checkout_locks_expires_idx
  on public.hisab_billing_checkout_locks(expires_at);

alter table public.hisab_billing_checkout_locks enable row level security;
revoke all on public.hisab_billing_checkout_locks from public, anon, authenticated;

drop policy if exists "Checkout creation locks are server only" on public.hisab_billing_checkout_locks;
create policy "Checkout creation locks are server only"
on public.hisab_billing_checkout_locks for all
to anon, authenticated
using (false)
with check (false);

create or replace function public.hisab_claim_checkout_lock(
  p_user_id uuid,
  p_plan_code text,
  p_billing_cycle text
)
returns table (
  claim_state text,
  checkout_token uuid,
  stripe_session_id text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_claim public.hisab_billing_checkout_locks%rowtype;
  v_existing public.hisab_billing_checkout_locks%rowtype;
begin
  if p_user_id is null then
    raise exception 'Billing user is required';
  end if;
  if p_billing_cycle not in ('monthly','annual') then
    raise exception 'Invalid billing cycle';
  end if;
  if not exists (
    select 1 from public.hisab_billing_plans
    where code = p_plan_code and is_active = true
  ) then
    raise exception 'Invalid billing plan';
  end if;

  insert into public.hisab_billing_checkout_locks (
    user_id,
    checkout_token,
    plan_code,
    billing_cycle,
    status,
    stripe_session_id,
    expires_at,
    updated_at
  )
  values (
    p_user_id,
    gen_random_uuid(),
    p_plan_code,
    p_billing_cycle,
    'creating',
    null,
    now() + interval '10 minutes',
    now()
  )
  on conflict (user_id) do update
  set checkout_token = gen_random_uuid(),
      plan_code = excluded.plan_code,
      billing_cycle = excluded.billing_cycle,
      status = 'creating',
      stripe_session_id = null,
      expires_at = excluded.expires_at,
      updated_at = now()
  where public.hisab_billing_checkout_locks.expires_at <= now()
  returning * into v_claim;

  if found then
    return query select 'claimed'::text, v_claim.checkout_token, v_claim.stripe_session_id;
    return;
  end if;

  select * into v_existing
  from public.hisab_billing_checkout_locks
  where user_id = p_user_id;

  if not found then
    return query select 'busy'::text, null::uuid, null::text;
    return;
  end if;

  if v_existing.status = 'open' and v_existing.stripe_session_id is not null then
    return query select 'reuse'::text, v_existing.checkout_token, v_existing.stripe_session_id;
    return;
  end if;

  return query select 'busy'::text, v_existing.checkout_token, v_existing.stripe_session_id;
end;
$$;

create or replace function public.hisab_attach_checkout_lock(
  p_user_id uuid,
  p_checkout_token uuid,
  p_stripe_session_id text,
  p_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.hisab_billing_checkout_locks
  set status = 'open',
      stripe_session_id = p_stripe_session_id,
      expires_at = greatest(p_expires_at, now() + interval '1 minute'),
      updated_at = now()
  where user_id = p_user_id
    and checkout_token = p_checkout_token
    and status = 'creating'
    and expires_at > now();
  return found;
end;
$$;

create or replace function public.hisab_claim_stripe_webhook_event(
  p_event_id text,
  p_event_type text,
  p_livemode boolean,
  p_payload jsonb,
  p_lease_seconds integer default 300
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_claimed_id text;
  v_status text;
  v_lease interval;
begin
  if nullif(trim(p_event_id), '') is null or nullif(trim(p_event_type), '') is null then
    raise exception 'Stripe event identity is required';
  end if;

  v_lease := make_interval(secs => greatest(30, least(coalesce(p_lease_seconds, 300), 1800)));

  insert into public.hisab_billing_webhook_events (
    stripe_event_id,
    event_type,
    livemode,
    status,
    attempts,
    payload,
    error_message,
    processed_at,
    updated_at
  )
  values (
    p_event_id,
    p_event_type,
    p_livemode,
    'processing',
    1,
    coalesce(p_payload, '{}'::jsonb),
    null,
    null,
    now()
  )
  on conflict (stripe_event_id) do update
  set event_type = excluded.event_type,
      livemode = excluded.livemode,
      status = 'processing',
      attempts = public.hisab_billing_webhook_events.attempts + 1,
      payload = excluded.payload,
      error_message = null,
      processed_at = null,
      updated_at = now()
  where public.hisab_billing_webhook_events.status = 'failed'
     or (
       public.hisab_billing_webhook_events.status = 'processing'
       and public.hisab_billing_webhook_events.updated_at <= now() - v_lease
     )
  returning stripe_event_id into v_claimed_id;

  if v_claimed_id is not null then
    return 'process';
  end if;

  select status into v_status
  from public.hisab_billing_webhook_events
  where stripe_event_id = p_event_id;

  if v_status in ('processing','processed') then
    return 'duplicate';
  end if;

  raise exception 'Stripe webhook claim could not be resolved';
end;
$$;

revoke all on function public.hisab_claim_checkout_lock(uuid,text,text) from public, anon, authenticated;
revoke all on function public.hisab_attach_checkout_lock(uuid,uuid,text,timestamptz) from public, anon, authenticated;
revoke all on function public.hisab_claim_stripe_webhook_event(text,text,boolean,jsonb,integer) from public, anon, authenticated;
grant execute on function public.hisab_claim_checkout_lock(uuid,text,text) to service_role;
grant execute on function public.hisab_attach_checkout_lock(uuid,uuid,text,timestamptz) to service_role;
grant execute on function public.hisab_claim_stripe_webhook_event(text,text,boolean,jsonb,integer) to service_role;

commit;
