import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../../'+p,import.meta.url),'utf8');
export async function paymentDatabase(){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
 grant usage on schema auth to authenticated,service_role;grant execute on function auth.uid(),auth.jwt() to authenticated,service_role;
 `);
 const migrations=['202607160001_schema.sql','202607160002_workflows.sql','20260717203000_finance_accounting_phase_one.sql','20260717210000_sales_invoicing_phase_one_schema.sql'];
 for(const p of migrations){
  const sql=(await read('supabase/migrations/'+p)).replace(/create extension if not exists pgcrypto;/g,'');
  await db.exec(sql);
 }
 // Billing catalogue predates the retained migration history; emulate only its FK contract.
 await db.exec("create table public.hisab_billing_plans(code text primary key);insert into public.hisab_billing_plans values('starter'),('growth'),('business');");
 await db.exec(await read('supabase/migrations/20260724_hisab_chapa_billing_foundation.sql'));
 await db.exec(await read('supabase/migrations/20261116145222_payment_operations.sql'));
 return db;
}
