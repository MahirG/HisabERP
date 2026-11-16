import assert from 'node:assert/strict';
import test from 'node:test';
import {paymentDatabase} from './helpers/payment-db.mjs';
const user='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
const org='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',otherOrg='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const tx=n=>`hisab-1794830000000-${String(n).padStart(12,'0')}`;
const one=async(db,sql,args=[])=> (await db.query(sql,args)).rows[0];
test('payment database: retries, access periods, refunds, RLS and invoice posting',async t=>{
 const db=await paymentDatabase();t.after(()=>db.close());
 await db.query('insert into auth.users values($1),($2)',[user,other]);
 await db.query("insert into organizations(id,name) values($1,'Merchant One'),($2,'Merchant Two')",[org,otherOrg]);
 await db.query("insert into organization_members(organization_id,user_id,full_name,role) values($1,$2,'Accountant','accountant'),($3,$4,'Other accountant','accountant')",[org,user,otherOrg,other]);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
 await t.test('failed webhook can be reclaimed and a stale worker cannot complete it',async()=>{
 const key='event1',lease1='33333333-3333-4333-8333-333333333333',lease2='44444444-4444-4444-8444-444444444444';
 let claim=await one(db,"select hisab_claim_payment_event($1,'payment',$2,'live','{}',$3) state",[key,tx(1),lease1]);assert.equal(claim.state,'claimed');
 assert.equal((await one(db,"select hisab_claim_payment_event($1,'payment',$2,'live','{}',$3) state",[key,tx(1),lease2])).state,'busy');
 await db.query("select hisab_finish_payment_event($1,$2,'temporary failure')",[key,lease1]);
 assert.equal((await one(db,"select hisab_claim_payment_event($1,'payment',$2,'live','{}',$3) state",[key,tx(1),lease2])).state,'claimed');
 assert.equal((await one(db,"select hisab_finish_payment_event($1,$2,null) done",[key,lease1])).done,false);
 assert.equal((await one(db,"select hisab_finish_payment_event($1,$2,null) done",[key,lease2])).done,true);
 assert.equal((await one(db,"select hisab_claim_payment_event($1,'payment',$2,'live','{}',$3) state",[key,tx(1),lease1])).state,'processed');
 });
 await t.test('checkout reservation reuses an unfinished attempt across request keys',async()=>{
 const reserve=(key,ref)=>one(db,"select hisab_reserve_checkout($1,$2,$3,'starter','monthly',1500,'live') result",[user,key,ref]);
 const a=await reserve('55555555-5555-4555-8555-555555555555',tx(1));assert.equal(a.result.newly_created,true);
 const b=await reserve('66666666-6666-4666-8666-666666666666',tx(2));assert.equal(b.result.tx_ref,tx(1));assert.equal(b.result.newly_created,undefined);
 await assert.rejects(db.query("select hisab_reserve_checkout($1,gen_random_uuid(),$2,'growth','annual',45000,'live')",[user,tx(3)]),/unfinished payment/);
 });
 await t.test('verified live success grants once and preserves the checkout amount',async()=>{
 await db.query("select hisab_apply_chapa_transaction($1,'success','provider1','live','telebirr')",[tx(1)]);
 const period=await one(db,'select * from hisab_billing_periods where tx_ref=$1',[tx(1)]);
 await db.query("select hisab_apply_chapa_transaction($1,'success','provider1','live','telebirr')",[tx(1)]);
 assert.deepEqual((await one(db,'select * from hisab_billing_periods where tx_ref=$1',[tx(1)])),period);
 assert.equal((await one(db,'select amount_etb from hisab_billing_payment_attempts where tx_ref=$1',[tx(1)])).amount_etb,'1500.00');
 });
 await t.test('different plans are scheduled after the paid period without overlapping renewals',async()=>{
 await db.query("select hisab_reserve_checkout($1,gen_random_uuid(),$2,'growth','monthly',4500,'live')",[user,tx(2)]);
 await db.query("select hisab_apply_chapa_transaction($1,'success','provider2','live','telebirr')",[tx(2)]);
 const periods=(await db.query('select * from hisab_billing_periods where user_id=$1 order by starts_at',[user])).rows;
 assert.equal(periods.length,2);assert.equal(periods[0].ends_at.getTime(),periods[1].starts_at.getTime());
 });
 await t.test('test success cannot grant real access and refund cannot reactivate on stale success',async()=>{
 await db.query("insert into hisab_billing_payment_attempts(tx_ref,user_id,plan_code,billing_cycle,amount_etb,mode) values($1,$2,'starter','monthly',1500,'test')",[tx(3),other]);
 assert.equal((await one(db,"select hisab_apply_chapa_transaction($1,'success','test1','test','card') state",[tx(3)])).state,'test_verified');
 assert.equal((await one(db,'select count(*) n from hisab_billing_periods where user_id=$1',[other])).n,0);
 await db.query("select hisab_apply_chapa_transaction($1,'refunded','provider1','live','telebirr')",[tx(1)]);
 await db.query("select hisab_apply_chapa_transaction($1,'success','provider1','live','telebirr')",[tx(1)]);
 assert.equal((await one(db,'select status from hisab_billing_payment_attempts where tx_ref=$1',[tx(1)])).status,'refunded');
 assert.ok((await one(db,'select revoked_at from hisab_billing_periods where tx_ref=$1',[tx(1)])).revoked_at);
 });
 await t.test('authenticated users cannot change provider status or see another payer',async()=>{
 await db.exec('set role authenticated');
 assert.equal((await one(db,'select count(*) n from hisab_billing_payment_attempts')).n,2);
 await assert.rejects(db.query("update hisab_billing_payment_attempts set status='success'"),/permission denied/);
 await assert.rejects(db.query("select hisab_apply_chapa_transaction($1,'success',null,'live',null)",[tx(3)]),/permission denied/);
 await assert.rejects(db.query('select * from hisab_billing_webhook_events'),/permission denied/);
 await db.exec('reset role');
 });
 let invoice,account;
 await t.test('tenant merchant settings and payment links reject foreign organizations and excess amounts',async()=>{
 account=(await one(db,"insert into accounts(organization_id,code,name,account_type,normal_side) values($1,'1050','Chapa clearing','asset','debit') returning id",[org])).id;
 await db.query("insert into accounts(organization_id,code,name,account_type,normal_side) values($1,'1100','Receivables','asset','debit')",[org]);
 const customer=(await one(db,"insert into customers(organization_id,name) values($1,'Customer') returning id",[org])).id;
 invoice=(await one(db,"insert into sales_invoices(organization_id,customer_id,invoice_number,status,subtotal) values($1,$2,'INV-TEST','posted',1000) returning id",[org,customer])).id;
 await db.query("select save_payment_connection($1,'Merchant One','live',true,$2)",[org,account]);
 await assert.rejects(db.query("select save_payment_connection($1,'Other Merchant','live',true,$2)",[otherOrg,account]),/Finance permission/);
 await assert.rejects(db.query("select create_invoice_payment_link($1,$2,1001,repeat('a',64),now()+interval '1 day')",[org,invoice]),/balance/);
 await db.query("select create_invoice_payment_link($1,$2,600,repeat('a',64),now()+interval '1 day')",[org,invoice]);
 await db.query("select create_invoice_payment_link($1,$2,600,repeat('b',64),now()+interval '1 day')",[org,invoice]);
 });
 const ref='invoice-1794830000000-000000000001';
 await t.test('in-flight reservations prevent two links from collecting more than an invoice',async()=>{
 const a=await one(db,"select reserve_invoice_checkout(repeat('a',64),$1) result",[ref]);assert.equal(a.result.newly_created,true);
 const repeated=await one(db,"select reserve_invoice_checkout(repeat('a',64),'invoice-1794830000000-000000000002') result");assert.equal(repeated.result.tx_ref,ref);
 await assert.rejects(db.query("select reserve_invoice_checkout(repeat('b',64),'invoice-1794830000000-000000000003')"),/balance/);
 });
 await t.test('verification alone does not post money; approval posts one balanced receipt',async()=>{
 await db.query("select apply_invoice_payment($1,'success','invoice-provider-1','live','telebirr')",[ref]);
 assert.equal((await one(db,'select amount_paid from sales_invoices where id=$1',[invoice])).amount_paid,'0.00');
 const result=await one(db,'select post_verified_invoice_payment($1,$2) receipt',[org,ref]);assert.ok(result.receipt);
 const repeat=await one(db,'select post_verified_invoice_payment($1,$2) receipt',[org,ref]);assert.equal(repeat.receipt,result.receipt);
 assert.equal((await one(db,'select amount_paid from sales_invoices where id=$1',[invoice])).amount_paid,'600.00');
 assert.equal((await one(db,"select count(*) n from payments where reference=$1",[ref])).n,1);
 const balance=await one(db,'select sum(debit)-sum(credit) balance from journal_lines');assert.equal(Number(balance.balance),0);
 });
 await t.test('only confirmed provider refunds can reverse a posted receipt; reversal is balanced and idempotent',async()=>{
 await assert.rejects(db.query('select reverse_verified_invoice_payment($1,$2,$3)',[org,ref,'Requested by customer']),/Provider-confirmed/);
 await db.query("select apply_invoice_payment($1,'refunded','invoice-provider-1','live','telebirr')",[ref]);
 const first=await one(db,'select reverse_verified_invoice_payment($1,$2,$3) id',[org,ref,'Provider refund confirmed by finance']);
 const second=await one(db,'select reverse_verified_invoice_payment($1,$2,$3) id',[org,ref,'Provider refund confirmed by finance']);assert.equal(first.id,second.id);
 assert.equal((await one(db,'select amount_paid from sales_invoices where id=$1',[invoice])).amount_paid,'0.00');
 assert.equal(Number((await one(db,'select sum(debit)-sum(credit) balance from journal_lines')).balance),0);
 assert.equal((await one(db,'select status from payments where reference=$1',[ref])).status,'reversed');
 });
 await t.test('expired and revoked links cannot begin checkout',async()=>{
 await assert.rejects(db.query("select create_invoice_payment_link($1,$2,100,repeat('c',64),now()-interval '1 day')",[org,invoice]),/expiry/);
 await db.query("select create_invoice_payment_link($1,$2,100,repeat('c',64),now()+interval '1 day')",[org,invoice]);
 const link=await one(db,"select id from invoice_payment_links where token_hash=repeat('c',64)");
 await db.query('select revoke_invoice_payment_link($1,$2)',[org,link.id]);
 await assert.rejects(db.query("select reserve_invoice_checkout(repeat('c',64),'invoice-1794830000000-000000000004')"),/unavailable/);
 await db.query("select create_invoice_payment_link($1,$2,100,repeat('d',64),now()+interval '1 day')",[org,invoice]);
 await db.exec("update invoice_payment_links set expires_at=now()-interval '1 second' where token_hash=repeat('d',64)");
 await assert.rejects(db.query("select reserve_invoice_checkout(repeat('d',64),'invoice-1794830000000-000000000005')"),/unavailable/);
 });
 await t.test('verified test invoice payments cannot post live accounting',async()=>{
 await db.query("select save_payment_connection($1,'Merchant One','test',true,$2)",[org,account]);
 await db.query("select create_invoice_payment_link($1,$2,100,repeat('e',64),now()+interval '1 day')",[org,invoice]);
 const testRef='invoice-1794830000000-000000000006';
 await db.query("select reserve_invoice_checkout(repeat('e',64),$1)",[testRef]);
 await db.query("select apply_invoice_payment($1,'success','test-invoice','test','card')",[testRef]);
 await assert.rejects(db.query('select post_verified_invoice_payment($1,$2)',[org,testRef]),/Verified live payment/);
 assert.equal((await one(db,'select amount_paid from sales_invoices where id=$1',[invoice])).amount_paid,'0.00');
 });
 await t.test('cross-tenant RLS denies collections and setting writes',async()=>{
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[other]);await db.exec('set role authenticated');
 assert.equal((await one(db,'select count(*) n from invoice_payment_attempts')).n,0);
 assert.equal((await one(db,'select count(*) n from invoice_payment_links')).n,0);
 await assert.rejects(db.query("select post_verified_invoice_payment($1,$2)",[org,ref]),/Finance permission/);
 await db.exec('reset role');
 });
});
