import assert from 'node:assert/strict';
import test from 'node:test';
import {build} from 'esbuild';
import {createHmac} from 'node:crypto';
async function moduleAt(path){
 const result=await build({entryPoints:[path],bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'server-only-test',setup(b){b.onResolve({filter:/^server-only$/},()=>({path:'server-only',namespace:'empty'}));b.onLoad({filter:/.*/,namespace:'empty'},()=>({contents:'',loader:'js'}));}}]});
 return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const rules=await moduleAt('lib/payments/verification.ts');
const access=await moduleAt('lib/payments/access.ts');
const csv=await moduleAt('lib/payments/csv.ts');
test('money comparisons use exact cents and reject malformed provider amounts',()=>{
 assert.equal(rules.minorUnits('1500.01'),150001);assert.equal(rules.minorUnits(1500),150000);
 for(const amount of ['',null,'NaN','1e3','0','-1','1.001','1,500','Infinity',{},'9999999999999'])assert.throws(()=>rules.minorUnits(amount));
 const expected={txRef:'test-ref',amount:'1500.00',mode:'live'};
 assert.equal(rules.validatePayment({tx_ref:'test-ref',amount:'1500',currency:'ETB',mode:'live',status:'success'},expected),'success');
 for(const altered of [{tx_ref:'wrong'},{amount:'1499.99'},{currency:'USD'},{mode:'test'},{mode:undefined}])assert.throws(()=>rules.validatePayment({tx_ref:'test-ref',amount:'1500',currency:'ETB',mode:'live',status:'success',...altered},expected));
 // An API envelope marked successful cannot substitute for missing payment status.
 assert.equal(rules.validatePayment({tx_ref:'test-ref',amount:'1500',currency:'ETB',mode:'live'},expected),'pending');
});
test('hosted checkout redirects reject insecure, credentialed and lookalike origins',()=>{
 assert.equal(rules.safeCheckoutUrl('https://checkout.chapa.co/pay/abc'),'https://checkout.chapa.co/pay/abc');
 for(const url of ['http://checkout.chapa.co/pay','https://checkout.chapa.co.evil.test/pay','javascript:alert(1)','https://user:pass@checkout.chapa.co/pay','https://checkout.chapa.co:8443/pay'])assert.throws(()=>rules.safeCheckoutUrl(url));
});
test('refunds are terminal and late failed notifications cannot overwrite paid evidence',()=>{
 assert.equal(rules.effectivePaymentState('success','pending'),'success');
 assert.equal(rules.effectivePaymentState('success','refunded'),'refunded');
 assert.equal(rules.effectivePaymentState('refunded','success'),'refunded');
});
test('paid periods enforce start dates, scheduled plans and revoked gaps',()=>{
 const period=(ref,plan,start,end,revoked=null)=>({tx_ref:ref,plan_code:plan,starts_at:`2026-11-${start}T00:00:00Z`,ends_at:`2026-11-${end}T00:00:00Z`,revoked_at:revoked});
 const now=Date.parse('2026-11-16T12:00:00Z');
 assert.equal(access.currentPaidPeriod([period('a','starter','17','20')],now),null);
 const current=access.currentPaidPeriod([period('a','starter','10','17'),period('b','starter','17','20'),period('c','growth','20','30')],now);
 assert.equal(current.plan_code,'starter');assert.equal(current.ends_at,'2026-11-20T00:00:00Z');
 assert.equal(access.currentPaidPeriod([period('a','starter','10','17','2026-11-15'),period('b','starter','17','20')],now),null);
});
test('CSV export escapes formulas, delimiters and quotes',()=>{
 const text=csv.paymentCsv([['=HYPERLINK("evil")',' +SUM(1,2)','normal','a,b','"quoted"']]);
 assert.match(text,/"'=HYPERLINK/);assert.match(text,/"' \+SUM/);assert.match(text,/"a,b"/);assert.match(text,/""quoted""/);
});
test('webhook signature authenticates exact bytes and rejects forged/static digests',async()=>{
 const signature=await moduleAt('lib/chapa/webhook.ts');const secret='unit-test-secret';
 const payload=JSON.stringify({tx_ref:'hisab-1794830000000-000000000001',status:'success'});
 const digest=createHmac('sha256',secret).update(payload).digest('hex');
 assert.equal(signature.parseVerifiedChapaWebhook(payload,new Headers({'x-chapa-signature':digest}),secret).status,'success');
 assert.throws(()=>signature.parseVerifiedChapaWebhook(payload+' ',new Headers({'x-chapa-signature':digest}),secret));
 const staticDigest=createHmac('sha256',secret).update(secret).digest('hex');
 assert.throws(()=>signature.parseVerifiedChapaWebhook(payload,new Headers({'chapa-signature':staticDigest}),secret));
 assert.throws(()=>signature.parseVerifiedChapaWebhook(payload,new Headers({'x-chapa-signature':'invalid'}),secret));
});
test('gateway stays disabled without keys; tenant credentials never fall back to platform keys',async()=>{
 const config=await moduleAt('lib/payments/config.ts');
 const keys=['CHAPA_PAYMENTS_ENABLED','CHAPA_MODE','CHAPA_SECRET_KEY','CHAPA_WEBHOOK_SECRET'];const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
 for(const k of keys)delete process.env[k];assert.equal(config.configuredMerchant(),null);
 process.env.CHAPA_SECRET_KEY='CHASECK_TEST-unit';process.env.CHAPA_WEBHOOK_SECRET='test-hook';
 assert.equal(config.configuredMerchant(),null);
 process.env.CHAPA_PAYMENTS_ENABLED='true';assert.equal(config.configuredMerchant().mode,'test');
 assert.equal(config.configuredMerchant('11111111-1111-4111-8111-111111111111'),null);
 process.env.CHAPA_MODE='live';assert.equal(config.configuredMerchant(),null);
 }finally{for(const [k,v]of Object.entries(saved)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
test('gateway transport verifies mocked success and rejects an untrusted checkout redirect',async()=>{
 const api=await moduleAt('lib/chapa/api.ts');const saved=globalThis.fetch;
 const credentials={secretKey:'CHASECK_TEST-test',webhookSecret:'test',mode:'test'};
 try{
 let seen;
 globalThis.fetch=async(url,options)=>{seen={url,options};return Response.json({status:'success',data:{tx_ref:'abc',amount:'100.00',currency:'ETB',status:'success',mode:'test'}});};
 const verified=await api.verifyChapaTransaction('abc',credentials);assert.equal(verified.data.status,'success');assert.match(seen.url,/transaction\/verify\/abc$/);assert.equal(seen.options.headers.Authorization,'Bearer CHASECK_TEST-test');
 globalThis.fetch=async()=>Response.json({status:'success',data:{checkout_url:'https://evil.example/pay'}});
 await assert.rejects(api.initializeChapaPayment({txRef:'abc',amountEtb:100,email:null,userId:'test',planCode:'starter',planName:'Starter',billingCycle:'monthly',callbackUrl:'https://hisabtech.com/api/chapa/callback',returnUrl:'https://hisabtech.com/billing',credentials}),/unexpected checkout/);
 globalThis.fetch=async()=>Response.json({message:'Temporary error'},{status:503});await assert.rejects(api.verifyChapaTransaction('abc',credentials),/Temporary error/);
 }finally{globalThis.fetch=saved;}
});
