import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("Daraja credentials remain server-only and separate from callback authentication", async () => {
  const [client, env, callback] = await Promise.all([
    read("lib/reconciliation/daraja.ts"),
    read(".env.example"),
    read("lib/reconciliation/provider-callback.ts"),
  ]);

  assert.match(client, /process\.env\.MPESA_CONSUMER_KEY/);
  assert.match(client, /process\.env\.MPESA_CONSUMER_SECRET/);
  assert.match(env, /MPESA_CALLBACK_TOKEN=/);
  assert.match(env, /MPESA_CONSUMER_KEY=/);
  assert.match(env, /MPESA_CONSUMER_SECRET=/);
  assert.doesNotMatch(client, /NEXT_PUBLIC_MPESA/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_MPESA/);
  assert.match(callback, /process\.env\.MPESA_CALLBACK_TOKEN/);
  assert.doesNotMatch(callback, /MPESA_CONSUMER_SECRET/);
});

test("Daraja validation performs OAuth only and never initiates payment", async () => {
  const client = await read("lib/reconciliation/daraja.ts");
  assert.match(client, /oauth\/v1\/generate\?grant_type=client_credentials/);
  assert.match(client, /Authorization: `Basic \$\{authorization\}`/);
  assert.match(client, /AbortSignal\.timeout\(12_000\)/);
  assert.doesNotMatch(client, /stkpush|mpesaexpress|processrequest|c2b|b2c/i);
  assert.doesNotMatch(client, /console\.(?:log|error|warn)/);
});

test("Daraja status is protected by finance permission and MFA policy", async () => {
  const route = await read("app/api/reconciliation/mpesa/status/route.ts");
  assert.match(route, /getCurrentUserContext\(\)/);
  assert.match(route, /can\(context, "manage_finance"\)/);
  assert.match(route, /Finance permission and required MFA are needed/);
  assert.match(route, /Cache-Control": "no-store"/);
  assert.doesNotMatch(route, /access_token/);
});
