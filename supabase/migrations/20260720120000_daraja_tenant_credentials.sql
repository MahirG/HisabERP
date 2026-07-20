drop function if exists private.get_integration_secret(text);

create or replace function public.get_server_integration_secret(
  p_organization_id uuid,
  p_provider text,
  p_key text
)
returns text
language plpgsql
security definer
set search_path = vault, pg_catalog
as $$
declare
  v_name text;
  v_value text;
begin
  if p_provider <> 'safaricom_daraja' or p_key not in ('consumer_key','consumer_secret','environment','callback_token') then
    raise exception 'Unsupported integration secret key.';
  end if;

  v_name := format('hisab:integration:%s:%s:%s', p_provider, p_organization_id, p_key);
  select decrypted_secret
    into v_value
    from vault.decrypted_secrets
   where name = v_name
   limit 1;

  return v_value;
end;
$$;

create or replace function public.upsert_server_integration_secret(
  p_organization_id uuid,
  p_provider text,
  p_key text,
  p_value text
)
returns void
language plpgsql
security definer
set search_path = vault, pg_catalog
as $$
declare
  v_name text;
  v_id uuid;
begin
  if p_provider <> 'safaricom_daraja' or p_key not in ('consumer_key','consumer_secret','environment','callback_token') then
    raise exception 'Unsupported integration secret key.';
  end if;

  if p_value is null or length(trim(p_value)) = 0 or length(p_value) > 2000 then
    raise exception 'Integration secret value is invalid.';
  end if;

  v_name := format('hisab:integration:%s:%s:%s', p_provider, p_organization_id, p_key);
  select id into v_id from vault.secrets where name = v_name limit 1;

  if v_id is null then
    perform vault.create_secret(
      p_value,
      v_name,
      format('Hisab %s credential for organization %s', p_key, p_organization_id),
      null
    );
  else
    perform vault.update_secret(
      v_id,
      p_value,
      v_name,
      format('Hisab %s credential for organization %s', p_key, p_organization_id),
      null
    );
  end if;
end;
$$;

revoke all on function public.get_server_integration_secret(uuid,text,text) from public, anon, authenticated;
revoke all on function public.upsert_server_integration_secret(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.get_server_integration_secret(uuid,text,text) to service_role;
grant execute on function public.upsert_server_integration_secret(uuid,text,text,text) to service_role;

create table if not exists public.integration_connection_checks (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('safaricom_daraja')),
  environment text not null check (environment in ('sandbox','production')),
  status text not null check (status in ('verified','failed')),
  checked_at timestamptz not null default now(),
  checked_by uuid null references auth.users(id) on delete set null,
  error_code text null,
  error_message text null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists integration_connection_checks_org_provider_idx
  on public.integration_connection_checks(organization_id, provider, checked_at desc);

alter table public.integration_connection_checks enable row level security;

drop policy if exists integration_connection_checks_select on public.integration_connection_checks;
create policy integration_connection_checks_select
on public.integration_connection_checks
for select
to authenticated
using (
  exists (
    select 1
      from public.organization_members m
     where m.organization_id = integration_connection_checks.organization_id
       and m.user_id = (select auth.uid())
       and m.is_active = true
  )
);

revoke all on table public.integration_connection_checks from anon, authenticated;
grant select on table public.integration_connection_checks to authenticated;
grant all on table public.integration_connection_checks to service_role;
grant usage, select on sequence public.integration_connection_checks_id_seq to service_role;

comment on function public.get_server_integration_secret(uuid,text,text) is 'Service-role-only tenant-scoped integration secret reader.';
comment on function public.upsert_server_integration_secret(uuid,text,text,text) is 'Service-role-only tenant-scoped encrypted integration secret writer.';
comment on table public.integration_connection_checks is 'Sanitized provider OAuth connectivity evidence; never stores access tokens or credentials.';
