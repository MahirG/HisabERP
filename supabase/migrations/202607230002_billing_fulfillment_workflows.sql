-- Atomic provider fulfillment and payment-state workflows.

create or replace function public.billing_finalize_order(
  p_order_id uuid,
  p_provider_reference text,
  p_payment_method text,
  p_verified_amount numeric,
  p_verified_currency text,
  p_provider_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.billing_payment_orders%rowtype;
  target_plan public.billing_plans%rowtype;
  existing_subscription public.billing_subscriptions%rowtype;
  settings_row public.billing_settings%rowtype;
  resolved_subscription_id uuid;
  resolved_invoice_id uuid;
  interval_months integer;
  period_start timestamptz;
  period_end timestamptz;
begin
  select * into target_order
  from public.billing_payment_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Billing order not found';
  end if;

  if target_order.status = 'paid' then
    select id into resolved_invoice_id
    from public.billing_invoices
    where payment_order_id = target_order.id;

    return jsonb_build_object(
      'order_id', target_order.id,
      'subscription_id', target_order.subscription_id,
      'invoice_id', resolved_invoice_id,
      'status', 'paid',
      'idempotent', true
    );
  end if;

  if target_order.status in ('refunded', 'reversed', 'cancelled', 'expired') then
    raise exception 'Billing order cannot be finalized from status %', target_order.status;
  end if;

  if upper(coalesce(p_verified_currency, '')) <> upper(target_order.currency::text) then
    raise exception 'Currency mismatch';
  end if;

  if abs(coalesce(p_verified_amount, 0) - target_order.total_amount) > 0.01 then
    raise exception 'Amount mismatch';
  end if;

  select * into target_plan from public.billing_plans where id = target_order.plan_id;
  if not found then raise exception 'Billing plan not found'; end if;

  interval_months := case target_order.billing_interval
    when 'monthly' then 1
    when 'quarterly' then 3
    when 'annual' then 12
    else 1
  end;

  select * into existing_subscription
  from public.billing_subscriptions
  where organization_id = target_order.organization_id
  for update;

  if found
     and existing_subscription.plan_id = target_order.plan_id
     and existing_subscription.status = 'active'
     and existing_subscription.current_period_end is not null
     and existing_subscription.current_period_end > now()
  then
    period_start := existing_subscription.current_period_end;
  else
    period_start := now();
  end if;

  period_end := period_start + make_interval(months => interval_months);

  insert into public.billing_subscriptions(
    organization_id, plan_id, billing_interval, status, provider,
    started_at, current_period_start, current_period_end,
    grace_ends_at, cancel_at_period_end, cancelled_at,
    last_payment_order_id, created_by
  ) values (
    target_order.organization_id, target_order.plan_id, target_order.billing_interval,
    'active', target_order.provider, now(), period_start, period_end,
    null, false, null, target_order.id, target_order.created_by
  )
  on conflict (organization_id) do update set
    plan_id = excluded.plan_id,
    billing_interval = excluded.billing_interval,
    status = 'active',
    provider = excluded.provider,
    started_at = coalesce(public.billing_subscriptions.started_at, excluded.started_at),
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    grace_ends_at = null,
    cancel_at_period_end = false,
    cancelled_at = null,
    last_payment_order_id = excluded.last_payment_order_id
  returning id into resolved_subscription_id;

  update public.billing_payment_orders
  set subscription_id = resolved_subscription_id,
      status = 'paid',
      provider_reference = nullif(p_provider_reference, ''),
      payment_method = nullif(p_payment_method, ''),
      paid_at = coalesce(paid_at, now()),
      failure_reason = null,
      provider_payload = coalesce(provider_payload, '{}'::jsonb) || coalesce(p_provider_payload, '{}'::jsonb)
  where id = target_order.id;

  select * into settings_row from public.billing_settings where singleton = true;

  insert into public.billing_invoices(
    organization_id, subscription_id, payment_order_id, plan_id,
    billing_interval, status, currency, subtotal, tax_amount, total_amount,
    issued_at, due_at, paid_at, period_start, period_end,
    customer_snapshot, seller_snapshot, line_items,
    provider, provider_reference
  ) values (
    target_order.organization_id, resolved_subscription_id, target_order.id, target_order.plan_id,
    target_order.billing_interval, 'paid', target_order.currency,
    target_order.subtotal, target_order.tax_amount, target_order.total_amount,
    now(), now(), now(), period_start, period_end,
    jsonb_build_object(
      'name', target_order.customer_name,
      'email', target_order.customer_email,
      'phone', target_order.customer_phone
    ),
    jsonb_build_object(
      'name', settings_row.seller_name,
      'email', settings_row.seller_email,
      'phone', settings_row.seller_phone,
      'country_code', settings_row.seller_country_code,
      'tin', settings_row.seller_tin,
      'vat_registered', settings_row.vat_registered,
      'vat_number', settings_row.vat_number
    ),
    jsonb_build_array(jsonb_build_object(
      'description', target_plan.name || ' — ' || initcap(target_order.billing_interval) || ' subscription',
      'quantity', 1,
      'unit_amount', target_order.subtotal,
      'tax_amount', target_order.tax_amount,
      'total_amount', target_order.total_amount
    )),
    target_order.provider,
    nullif(p_provider_reference, '')
  )
  on conflict (payment_order_id) do update set
    subscription_id = excluded.subscription_id,
    status = 'paid',
    paid_at = coalesce(public.billing_invoices.paid_at, excluded.paid_at),
    period_start = excluded.period_start,
    period_end = excluded.period_end,
    provider_reference = excluded.provider_reference
  returning id into resolved_invoice_id;

  return jsonb_build_object(
    'order_id', target_order.id,
    'subscription_id', resolved_subscription_id,
    'invoice_id', resolved_invoice_id,
    'status', 'paid',
    'period_start', period_start,
    'period_end', period_end,
    'idempotent', false
  );
end;
$$;

revoke all on function public.billing_finalize_order(uuid, text, text, numeric, text, jsonb) from public, anon, authenticated;
grant execute on function public.billing_finalize_order(uuid, text, text, numeric, text, jsonb) to service_role;

create or replace function public.billing_mark_order_state(
  p_order_id uuid,
  p_status text,
  p_reason text default null,
  p_provider_reference text default null,
  p_provider_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_status text;
  updated_order public.billing_payment_orders%rowtype;
begin
  target_status := lower(coalesce(p_status, ''));
  if target_status not in ('pending', 'failed', 'cancelled', 'expired', 'refunded', 'reversed', 'configuration_required', 'pending_review') then
    raise exception 'Unsupported billing order status';
  end if;

  update public.billing_payment_orders
  set status = case when status = 'paid' and target_status not in ('refunded', 'reversed') then status else target_status end,
      failure_reason = p_reason,
      provider_reference = coalesce(nullif(p_provider_reference, ''), provider_reference),
      provider_payload = coalesce(provider_payload, '{}'::jsonb) || coalesce(p_provider_payload, '{}'::jsonb)
  where id = p_order_id
  returning * into updated_order;

  if not found then raise exception 'Billing order not found'; end if;

  if target_status in ('refunded', 'reversed') and updated_order.subscription_id is not null then
    update public.billing_subscriptions
    set status = 'past_due',
        grace_ends_at = coalesce(grace_ends_at, now() + interval '7 days')
    where id = updated_order.subscription_id and status = 'active';
  end if;

  return jsonb_build_object('order_id', updated_order.id, 'status', updated_order.status);
end;
$$;

revoke all on function public.billing_mark_order_state(uuid, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.billing_mark_order_state(uuid, text, text, text, jsonb) to service_role;

create or replace function public.billing_review_bank_transfer(
  p_submission_id uuid,
  p_approved boolean,
  p_reviewer uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  submission_row public.billing_bank_transfer_submissions%rowtype;
  order_row public.billing_payment_orders%rowtype;
  result jsonb;
begin
  select * into submission_row
  from public.billing_bank_transfer_submissions
  where id = p_submission_id
  for update;

  if not found then raise exception 'Bank transfer submission not found'; end if;

  select * into order_row
  from public.billing_payment_orders
  where id = submission_row.payment_order_id
  for update;

  if not found then raise exception 'Billing order not found'; end if;

  update public.billing_bank_transfer_submissions
  set status = case when p_approved then 'approved' else 'rejected' end,
      reviewed_by = p_reviewer,
      review_notes = p_notes,
      reviewed_at = now()
  where id = submission_row.id;

  if p_approved then
    result := public.billing_finalize_order(
      order_row.id,
      submission_row.transfer_reference,
      submission_row.channel_slug,
      submission_row.amount,
      order_row.currency::text,
      jsonb_build_object('bank_transfer_submission_id', submission_row.id)
    );
  else
    result := public.billing_mark_order_state(
      order_row.id,
      'failed',
      coalesce(p_notes, 'Bank transfer proof was rejected.'),
      submission_row.transfer_reference,
      jsonb_build_object('bank_transfer_submission_id', submission_row.id)
    );
  end if;

  return result;
end;
$$;

revoke all on function public.billing_review_bank_transfer(uuid, boolean, uuid, text) from public, anon, authenticated;
grant execute on function public.billing_review_bank_transfer(uuid, boolean, uuid, text) to service_role;
