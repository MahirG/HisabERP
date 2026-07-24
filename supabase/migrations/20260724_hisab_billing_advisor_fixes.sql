begin;

create index if not exists hisab_billing_subscriptions_plan_code_idx
  on public.hisab_billing_subscriptions(plan_code);

create index if not exists hisab_billing_checkout_sessions_plan_code_idx
  on public.hisab_billing_checkout_sessions(plan_code);

drop policy if exists "No client access to Stripe webhook ledger" on public.hisab_billing_webhook_events;
create policy "No client access to Stripe webhook ledger"
on public.hisab_billing_webhook_events
for all
to anon, authenticated
using (false)
with check (false);

commit;
