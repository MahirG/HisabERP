begin;

-- Additive only: retain existing receipts, paid access and provider evidence.
alter table public.hisab_billing_payment_attempts add column if not exists request_key uuid;
alter table public.hisab_billing_payment_attempts add column if not exists last_checked_at timestamptz;
create unique index if not exists billing_request_key_unique on public.hisab_billing_payment_attempts(user_id,request_key) where request_key is not null;
alter table public.hisab_billing_webhook_events add column if not exists lease_token uuid;
alter table public.hisab_billing_webhook_events add column if not exists lease_until timestamptz;

create table public.hisab_billing_periods (
  tx_ref text primary key references public.hisab_billing_payment_attempts(tx_ref),
  user_id uuid not null references auth.users(id),
  plan_code text not null references public.hisab_billing_plans(code),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  revoked_at timestamptz,
  check (ends_at>starts_at)
);
create index billing_period_user_time on public.hisab_billing_periods(user_id,starts_at,ends_at);
alter table public.hisab_billing_periods enable row level security;
revoke all on public.hisab_billing_periods from anon,authenticated;
grant select on public.hisab_billing_periods to authenticated;
create policy "Own verified access periods" on public.hisab_billing_periods for select to authenticated using(user_id=(select auth.uid()));
-- Preserve the previously recorded aggregate access as a legacy period.
insert into public.hisab_billing_periods(tx_ref,user_id,plan_code,starts_at,ends_at,revoked_at)
select a.last_tx_ref,a.user_id,a.plan_code,a.current_period_start,a.current_period_end,
  case when a.status='revoked' then now() else null end
from public.hisab_billing_access a join public.hisab_billing_payment_attempts p on p.tx_ref=a.last_tx_ref
where p.status='success' and p.mode='live';

create table public.hisab_billing_refund_requests (
 id uuid primary key default gen_random_uuid(),
 tx_ref text not null references public.hisab_billing_payment_attempts(tx_ref),
 user_id uuid not null references auth.users(id),
 reason text not null check(char_length(reason) between 10 and 1000),
 status text not null default 'requested' check(status in ('requested','approved','rejected','confirmed')),
 decision_note text,
 decided_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(tx_ref)
);
alter table public.hisab_billing_refund_requests enable row level security;
revoke all on public.hisab_billing_refund_requests from anon,authenticated;
grant select on public.hisab_billing_refund_requests to authenticated;
create policy "Own refund requests" on public.hisab_billing_refund_requests for select to authenticated using(user_id=(select auth.uid()));

-- Service-only, leased, retryable webhook inbox. Lease token fences stale workers.
create function public.hisab_claim_payment_event(p_key text,p_type text,p_tx_ref text,p_mode text,p_payload jsonb,p_lease uuid)
returns text language plpgsql security definer set search_path='' as $$
declare e public.hisab_billing_webhook_events%rowtype;
begin
 insert into public.hisab_billing_webhook_events(event_key,event_type,tx_ref,mode,payload,lease_token,lease_until)
 values(p_key,p_type,p_tx_ref,p_mode,p_payload,p_lease,now()+interval '90 seconds') on conflict do nothing;
 if found then return 'claimed'; end if;
 select * into e from public.hisab_billing_webhook_events where event_key=p_key for update;
 if e.status='processed' then return 'processed'; end if;
 if e.status='processing' and e.lease_until>now() then return 'busy'; end if;
 update public.hisab_billing_webhook_events set status='processing',attempts=attempts+1,
 lease_token=p_lease,lease_until=now()+interval '90 seconds',updated_at=now(),error_message=null where event_key=p_key;
 return 'claimed';
end $$;
create function public.hisab_finish_payment_event(p_key text,p_lease uuid,p_error text default null)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 update public.hisab_billing_webhook_events set status=case when p_error is null then 'processed' else 'failed' end,
 error_message=left(p_error,1000),processed_at=case when p_error is null then now() else null end,
 lease_until=null,updated_at=now() where event_key=p_key and lease_token=p_lease and status='processing';
 return found;
end $$;

-- Reserve a single in-flight checkout per user, even with concurrent browser tabs.
create function public.hisab_reserve_checkout(p_user uuid,p_key uuid,p_tx_ref text,p_plan text,p_cycle text,p_amount numeric,p_mode text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.hisab_billing_payment_attempts%rowtype;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,17));
 if p_cycle not in ('monthly','annual') or p_mode not in ('test','live') or p_amount<=0 then raise exception 'Invalid checkout'; end if;
 select * into a from public.hisab_billing_payment_attempts where user_id=p_user and request_key=p_key;
 if found then return to_jsonb(a); end if;
 select * into a from public.hisab_billing_payment_attempts where user_id=p_user and status in ('creating','open','pending')
 order by created_at desc limit 1;
 if found then
   if a.plan_code<>p_plan or a.billing_cycle<>p_cycle then raise exception 'An unfinished payment exists. Review its status in billing first.'; end if;
   return to_jsonb(a);
 end if;
 insert into public.hisab_billing_payment_attempts(tx_ref,user_id,request_key,plan_code,billing_cycle,amount_etb,currency,status,mode,expires_at)
 values(p_tx_ref,p_user,p_key,p_plan,p_cycle,p_amount,'ETB','creating',p_mode,now()+interval '30 minutes') returning * into a;
 return to_jsonb(a)||jsonb_build_object('newly_created',true);
end $$;

create or replace function public.hisab_apply_chapa_transaction(p_tx_ref text,p_status text,p_chapa_reference text default null,p_mode text default null,p_payment_method text default null)
returns text language plpgsql security definer set search_path='' as $$
declare a public.hisab_billing_payment_attempts%rowtype; v_start timestamptz; v_end timestamptz; v_prev text;
begin
 if p_status not in ('success','failed','cancelled','refunded','reversed') or p_mode is null or p_mode not in ('test','live') then raise exception 'Unsupported verified payment'; end if;
 -- Serialize by payer before locking individual attempts (two different renewals).
 select user_id::text into v_prev from public.hisab_billing_payment_attempts where tx_ref=p_tx_ref;
 if not found then raise exception 'Unknown Chapa transaction reference'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_prev,17));
 select * into a from public.hisab_billing_payment_attempts where tx_ref=p_tx_ref for update;
 if a.mode is not null and a.mode<>p_mode then raise exception 'Payment mode mismatch'; end if;
 if a.status in ('refunded','reversed') then return 'terminal'; end if;
 if a.status='success' and p_status not in ('refunded','reversed') then return 'duplicate'; end if;
 update public.hisab_billing_payment_attempts set status=p_status,chapa_reference=coalesce(p_chapa_reference,chapa_reference),
 mode=p_mode,payment_method=coalesce(p_payment_method,payment_method),verified_at=now(),last_checked_at=now(),updated_at=now() where tx_ref=p_tx_ref;
 if p_status='success' and p_mode='live' then
   select greatest(now(),coalesce(max(ends_at),now())) into v_start from public.hisab_billing_periods where user_id=a.user_id and revoked_at is null;
   v_end:=case when a.billing_cycle='annual' then v_start+interval '1 year' else v_start+interval '1 month' end;
   insert into public.hisab_billing_periods(tx_ref,user_id,plan_code,starts_at,ends_at) values(p_tx_ref,a.user_id,a.plan_code,v_start,v_end) on conflict do nothing;
   -- Keep the legacy access cache for existing consumers. New enforcement reads periods.
   insert into public.hisab_billing_access(user_id,plan_code,billing_cycle,amount_etb,currency,provider,status,current_period_start,current_period_end,last_tx_ref,last_payment_status)
   values(a.user_id,a.plan_code,a.billing_cycle,a.amount_etb,'ETB','chapa','active',v_start,v_end,p_tx_ref,'success')
   on conflict(user_id) do update set plan_code=excluded.plan_code,billing_cycle=excluded.billing_cycle,amount_etb=excluded.amount_etb,
   status='active',current_period_start=excluded.current_period_start,current_period_end=excluded.current_period_end,
   last_tx_ref=p_tx_ref,last_payment_status='success',updated_at=now();
   return 'activated';
 end if;
 if p_status in ('refunded','reversed') then
   update public.hisab_billing_periods set revoked_at=now() where tx_ref=p_tx_ref;
   update public.hisab_billing_access set status='revoked',last_payment_status=p_status,updated_at=now() where last_tx_ref=p_tx_ref;
   update public.hisab_billing_refund_requests set status='confirmed',updated_at=now() where tx_ref=p_tx_ref;
   return 'revoked';
 end if;
 return case when p_mode='test' and p_status='success' then 'test_verified' else p_status end;
end $$;

create function public.hisab_request_refund(p_tx_ref text,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.hisab_billing_payment_attempts where tx_ref=p_tx_ref and user_id=auth.uid() and status='success' and mode='live') then raise exception 'Eligible payment not found'; end if;
 insert into public.hisab_billing_refund_requests(tx_ref,user_id,reason) values(p_tx_ref,auth.uid(),trim(p_reason)) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.hisab_request_refund(text,text) from public,anon;
grant execute on function public.hisab_request_refund(text,text) to authenticated;

-- Tenant collections use the tenant's own merchant and never the platform key.
create table public.payment_connections (
 organization_id uuid primary key references public.organizations(id),
 provider text not null default 'chapa' check(provider='chapa'),
 merchant_label text not null check(char_length(merchant_label) between 2 and 120),
 mode text not null default 'test' check(mode in ('test','live')),
 enabled boolean not null default false,
 settlement_account_id uuid not null references public.accounts(id),
 updated_at timestamptz not null default now()
);
create table public.invoice_payment_links (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 invoice_id uuid not null references public.sales_invoices(id),
 token_hash text not null unique check(length(token_hash)=64),
 amount_etb numeric(14,2) not null check(amount_etb>0),
 mode text not null check(mode in ('test','live')),
 expires_at timestamptz not null,
 revoked_at timestamptz,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create table public.invoice_payment_attempts (
 tx_ref text primary key,
 organization_id uuid not null references public.organizations(id),
 link_id uuid not null references public.invoice_payment_links(id),
 invoice_id uuid not null references public.sales_invoices(id),
 amount_etb numeric(14,2) not null check(amount_etb>0),
 mode text not null check(mode in ('test','live')),
 status text not null default 'creating' check(status in ('creating','open','pending','success','failed','cancelled','refunded','reversed')),
 checkout_url text,
 chapa_reference text,
 payment_method text,
 verified_at timestamptz,
 last_checked_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '30 minutes',
 payment_id uuid references public.payments(id),
 posted_by uuid references auth.users(id),
 posted_at timestamptz,
 reconciliation_note text
);
create unique index invoice_provider_reference on public.invoice_payment_attempts(organization_id,chapa_reference) where chapa_reference is not null;
create index invoice_attempt_org_time on public.invoice_payment_attempts(organization_id,created_at desc);
create index invoice_attempt_link on public.invoice_payment_attempts(link_id);
create index invoice_link_invoice on public.invoice_payment_links(invoice_id);
create index invoice_link_org on public.invoice_payment_links(organization_id);

alter table public.payment_connections enable row level security;
alter table public.invoice_payment_links enable row level security;
alter table public.invoice_payment_attempts enable row level security;
revoke all on public.payment_connections,public.invoice_payment_links,public.invoice_payment_attempts from anon,authenticated;
grant select on public.payment_connections,public.invoice_payment_links,public.invoice_payment_attempts to authenticated;
create policy "Payment connection visibility" on public.payment_connections for select to authenticated using(public.has_org_role(organization_id,array['owner','admin','accountant','sales']::public.app_role[]));
create policy "Sales payment link visibility" on public.invoice_payment_links for select to authenticated using(public.has_org_role(organization_id,array['owner','admin','accountant','sales']::public.app_role[]));
create policy "Finance collection visibility" on public.invoice_payment_attempts for select to authenticated using(public.has_org_role(organization_id,array['owner','admin','accountant','sales']::public.app_role[]));

create function public.save_payment_connection(p_org uuid,p_label text,p_mode text,p_enabled boolean,p_account uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.has_org_role(p_org,array['owner','admin','accountant']::public.app_role[]) then raise exception 'Finance permission required'; end if;
 if not exists(select 1 from public.accounts where id=p_account and organization_id=p_org and account_type='asset' and is_active) then raise exception 'Invalid settlement account'; end if;
 insert into public.payment_connections(organization_id,merchant_label,mode,enabled,settlement_account_id) values(p_org,trim(p_label),p_mode,p_enabled,p_account)
 on conflict(organization_id) do update set merchant_label=excluded.merchant_label,mode=excluded.mode,enabled=excluded.enabled,settlement_account_id=excluded.settlement_account_id,updated_at=now();
 insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id,metadata) values(p_org,auth.uid(),'payments.connection.updated','organization',p_org,jsonb_build_object('mode',p_mode,'enabled',p_enabled));
end $$;
create function public.create_invoice_payment_link(p_org uuid,p_invoice uuid,p_amount numeric,p_hash text,p_expires timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_mode text; v_outstanding numeric;
begin
 if not public.has_org_role(p_org,array['owner','admin','accountant','sales']::public.app_role[]) then raise exception 'Sales permission required'; end if;
 if p_expires<=now() or p_expires>now()+interval '30 days' then raise exception 'Invalid link expiry'; end if;
 perform 1 from public.sales_invoices where id=p_invoice and organization_id=p_org for update;
 select outstanding_amount into v_outstanding from public.sales_invoice_balance_view where id=p_invoice and organization_id=p_org and status in ('posted','partially_paid');
 if not found or p_amount<=0 or p_amount>v_outstanding then raise exception 'Amount exceeds open invoice balance'; end if;
 select mode into v_mode from public.payment_connections where organization_id=p_org;
 if not found then raise exception 'Save merchant settings first'; end if;
 insert into public.invoice_payment_links(organization_id,invoice_id,token_hash,amount_etb,mode,expires_at,created_by)
 values(p_org,p_invoice,p_hash,p_amount,v_mode,p_expires,auth.uid()) returning id into v_id;
 insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id,metadata) values(p_org,auth.uid(),'payments.link.created','sales_invoice',p_invoice,jsonb_build_object('link',v_id,'amount',p_amount));
 return v_id;
end $$;
create function public.revoke_invoice_payment_link(p_org uuid,p_link uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.has_org_role(p_org,array['owner','admin','accountant','sales']::public.app_role[]) then raise exception 'Sales permission required'; end if;
 update public.invoice_payment_links set revoked_at=now() where id=p_link and organization_id=p_org;
end $$;
create function public.reserve_invoice_checkout(p_hash text,p_tx_ref text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare l public.invoice_payment_links%rowtype; a public.invoice_payment_attempts%rowtype; v_outstanding numeric;
begin
 select * into l from public.invoice_payment_links where token_hash=p_hash for update;
 if not found or l.revoked_at is not null or l.expires_at<=now() then raise exception 'Payment link is unavailable'; end if;
 if not exists(select 1 from public.payment_connections where organization_id=l.organization_id and enabled and mode=l.mode) then raise exception 'Merchant checkout is not enabled'; end if;
 if exists(select 1 from public.invoice_payment_attempts where link_id=l.id and status in ('success','refunded','reversed')) then raise exception 'This link has already been paid'; end if;
 select * into a from public.invoice_payment_attempts where link_id=l.id and status in ('creating','open','pending') order by created_at desc limit 1;
 if found then return to_jsonb(a); end if;
 perform 1 from public.sales_invoices where id=l.invoice_id for update;
 select outstanding_amount into v_outstanding from public.sales_invoice_balance_view where id=l.invoice_id and organization_id=l.organization_id and status in ('posted','partially_paid');
 if not found or l.amount_etb>v_outstanding-coalesce((select sum(amount_etb) from public.invoice_payment_attempts where invoice_id=l.invoice_id and status in ('creating','open','pending','success') and payment_id is null and mode=l.mode),0) then raise exception 'Invoice balance changed. Ask for a new link.'; end if;
 insert into public.invoice_payment_attempts(tx_ref,organization_id,link_id,invoice_id,amount_etb,mode)
 values(p_tx_ref,l.organization_id,l.id,l.invoice_id,l.amount_etb,l.mode) returning * into a;
 return to_jsonb(a)||jsonb_build_object('newly_created',true);
end $$;
create function public.apply_invoice_payment(p_tx_ref text,p_status text,p_reference text,p_mode text,p_method text)
returns text language plpgsql security definer set search_path='' as $$
declare a public.invoice_payment_attempts%rowtype;
begin
 select * into a from public.invoice_payment_attempts where tx_ref=p_tx_ref for update;
 if not found or a.mode<>p_mode then raise exception 'Unknown payment or mode mismatch'; end if;
 if p_status not in ('pending','success','failed','cancelled','refunded','reversed') then raise exception 'Unsupported payment status'; end if;
 if a.status in ('refunded','reversed') then return a.status; end if;
 if a.status='success' and p_status not in ('refunded','reversed') then return 'success'; end if;
 update public.invoice_payment_attempts set status=p_status,chapa_reference=coalesce(p_reference,chapa_reference),payment_method=coalesce(p_method,payment_method),
 verified_at=case when p_status<>'pending' then now() else verified_at end,last_checked_at=now(),updated_at=now() where tx_ref=p_tx_ref;
 return p_status;
end $$;

-- Provider verification never posts journals. Finance explicitly approves allocation.
create function public.post_verified_invoice_payment(p_org uuid,p_tx_ref text)
returns text language plpgsql security definer set search_path='' as $$
declare a public.invoice_payment_attempts%rowtype; i public.sales_invoices%rowtype; v_account uuid; v_ar uuid; v_no text; v_outstanding numeric; v_total numeric;
begin
 if not public.has_org_role(p_org,array['owner','admin','accountant']::public.app_role[]) then raise exception 'Finance permission required'; end if;
 select * into a from public.invoice_payment_attempts where tx_ref=p_tx_ref and organization_id=p_org for update;
 if not found or a.status<>'success' or a.mode<>'live' or a.verified_at is null then raise exception 'Verified live payment required'; end if;
 if a.payment_id is not null then select payment_number into v_no from public.payments where id=a.payment_id; return v_no; end if;
 select * into i from public.sales_invoices where id=a.invoice_id and organization_id=p_org for update;
 select outstanding_amount,total-returned_amount into v_outstanding,v_total from public.sales_invoice_balance_view where id=i.id and organization_id=p_org and status in ('posted','partially_paid');
 if not found or a.amount_etb>v_outstanding then raise exception 'Invoice balance changed. Resolve this payment in reconciliation before posting.'; end if;
 select settlement_account_id into v_account from public.payment_connections where organization_id=p_org;
 select id into v_ar from public.accounts where organization_id=p_org and code='1100' and is_active;
 v_no:=public.record_finance_payment(p_org,i.branch_id,'receipt',a.amount_etb,0,'Chapa',current_date,v_account,v_ar,null,i.customer_id,i.id,null,a.tx_ref,'Verified invoice collection; reconcile provider fees separately.',auth.uid());
 update public.sales_invoices set status=case when amount_paid>=v_total then 'paid'::public.invoice_status else 'partially_paid'::public.invoice_status end where id=i.id;
 update public.invoice_payment_attempts set payment_id=(select id from public.payments where organization_id=p_org and payment_number=v_no),posted_by=auth.uid(),posted_at=now(),updated_at=now() where tx_ref=p_tx_ref;
 return v_no;
end $$;

alter table public.invoice_payment_attempts add column reversal_journal_id uuid references public.journal_entries(id);
alter table public.invoice_payment_attempts add column reversed_at timestamptz;
create function public.reverse_verified_invoice_payment(p_org uuid,p_tx_ref text,p_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare a public.invoice_payment_attempts%rowtype; v_payment public.payments%rowtype; v_journal uuid; v_no text; v_total numeric;
begin
 if not public.has_org_role(p_org,array['owner','admin','accountant']::public.app_role[]) then raise exception 'Finance permission required'; end if;
 if length(trim(p_reason))<10 then raise exception 'A reversal reason is required'; end if;
 select * into a from public.invoice_payment_attempts where tx_ref=p_tx_ref and organization_id=p_org for update;
 if not found or a.status not in ('refunded','reversed') or a.payment_id is null or a.mode<>'live' then raise exception 'Provider-confirmed refund or reversal required'; end if;
 if a.reversal_journal_id is not null then return a.reversal_journal_id; end if;
 select * into v_payment from public.payments where id=a.payment_id and organization_id=p_org for update;
 if not found or v_payment.status<>'posted' then raise exception 'Original receipt is not available for reversal'; end if;
 perform 1 from public.sales_invoices where id=a.invoice_id and organization_id=p_org and amount_paid>=a.amount_etb for update;
 if not found then raise exception 'Invoice allocation changed. Investigate the original receipt before reversal.'; end if;
 v_no:=public.next_document_number(p_org,'JE');
 insert into public.journal_entries(organization_id,branch_id,entry_number,entry_date,memo,status,source_type,source_id,created_by)
 values(p_org,v_payment.branch_id,v_no,current_date,'Provider reversal: '||a.tx_ref,'draft','invoice_collection_reversal',a.payment_id,auth.uid()) returning id into v_journal;
 insert into public.journal_lines(organization_id,journal_entry_id,account_id,description,debit,credit)
 select p_org,v_journal,account_id,'Reversal: '||coalesce(description,''),credit,debit from public.journal_lines where journal_entry_id=v_payment.journal_entry_id and organization_id=p_org;
 if not found then raise exception 'Original journal evidence missing'; end if;
 update public.journal_entries set status='posted',posted_by=auth.uid(),posted_at=now() where id=v_journal;
 update public.payments set status='reversed' where id=a.payment_id;
 update public.sales_invoices set amount_paid=amount_paid-a.amount_etb where id=a.invoice_id;
 select total-returned_amount into v_total from public.sales_invoice_balance_view where id=a.invoice_id;
 update public.sales_invoices set status=case when amount_paid>=v_total then 'paid'::public.invoice_status when amount_paid>0 then 'partially_paid'::public.invoice_status else 'posted'::public.invoice_status end where id=a.invoice_id;
 update public.invoice_payment_attempts set reversal_journal_id=v_journal,reversed_at=now(),reconciliation_note=trim(p_reason),updated_at=now() where tx_ref=p_tx_ref;
 insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id,metadata) values(p_org,auth.uid(),'payments.collection.reversed','payment',a.payment_id,jsonb_build_object('tx_ref',a.tx_ref,'journal',v_journal,'reason',trim(p_reason)));
 return v_journal;
end $$;
revoke all on function public.reverse_verified_invoice_payment(uuid,text,text) from public,anon;
grant execute on function public.reverse_verified_invoice_payment(uuid,text,text) to authenticated;

-- Foreign-key indexes keep organization-scoped financial operations bounded.
create index billing_period_plan on public.hisab_billing_periods(plan_code);
create index billing_refund_user on public.hisab_billing_refund_requests(user_id);
create index billing_refund_actor on public.hisab_billing_refund_requests(decided_by);
create index payment_connection_account on public.payment_connections(settlement_account_id);
create index invoice_link_actor on public.invoice_payment_links(created_by);
create index invoice_attempt_invoice on public.invoice_payment_attempts(invoice_id);
create index invoice_attempt_payment on public.invoice_payment_attempts(payment_id);
create index invoice_attempt_actor on public.invoice_payment_attempts(posted_by);
create index invoice_attempt_reversal on public.invoice_payment_attempts(reversal_journal_id);

-- All new definer functions are explicitly scoped. No anon execution.
revoke all on function public.hisab_claim_payment_event(text,text,text,text,jsonb,uuid),public.hisab_finish_payment_event(text,uuid,text),public.hisab_reserve_checkout(uuid,uuid,text,text,text,numeric,text),public.reserve_invoice_checkout(text,text),public.apply_invoice_payment(text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.hisab_claim_payment_event(text,text,text,text,jsonb,uuid),public.hisab_finish_payment_event(text,uuid,text),public.hisab_reserve_checkout(uuid,uuid,text,text,text,numeric,text),public.reserve_invoice_checkout(text,text),public.apply_invoice_payment(text,text,text,text,text) to service_role;
revoke all on function public.save_payment_connection(uuid,text,text,boolean,uuid),public.create_invoice_payment_link(uuid,uuid,numeric,text,timestamptz),public.revoke_invoice_payment_link(uuid,uuid),public.post_verified_invoice_payment(uuid,text) from public,anon;
grant execute on function public.save_payment_connection(uuid,text,text,boolean,uuid),public.create_invoice_payment_link(uuid,uuid,numeric,text,timestamptz),public.revoke_invoice_payment_link(uuid,uuid),public.post_verified_invoice_payment(uuid,text) to authenticated;
grant all on public.hisab_billing_periods,public.hisab_billing_refund_requests,public.payment_connections,public.invoice_payment_links,public.invoice_payment_attempts to service_role;

commit;
