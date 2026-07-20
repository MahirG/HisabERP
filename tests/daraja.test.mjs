import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("Daraja credentials are tenant scoped and encrypted in Supabase Vault", async () => {
  const migration = await read("supabase/migrations/20260720120000_daraja_tenant_credentials.sql");
  assert.match(migration, /hisab:integration:%s:%s:%s/);
  assert.match(migration, /vault\.create_secret/);
  assert.match(migration, /vault\.update_secret/);
  assert.match(migration, /revoke all on function public\.get_server_integration_secret[\s\S]+anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.get_server_integration_secret[\s\S]+service_role/i);
  assert.match(migration, /alter table public\.integration_connection_checks enable row level security/i);
  assert.doesNotMatch(migration, /consumer_key\s*=|consumer_secret\s*=/i);
});

test("Daraja OAuth uses Basic authentication, timeouts and server-only credentials", async () => {
  const [client, secrets, env] = await Promise.all([
    read("lib/reconciliation/mpesa-daraja.ts"),
    read("lib/reconciliation/integration-secrets.ts"),
    read(".env.example"),
  ]);
  assert.match(client, /sandbox\.safaricom\.co\.ke\/oauth\/v1\/generate/);
  assert.match(client, /api\.safaricom\.co\.ke\/oauth\/v1\/generate/);
  assert.match(client, /Authorization: `Basic \$\{authorization\}`/);
  assert.match(client, /AbortSignal\.timeout\(12_000\)/);
  assert.match(client, /tokenCache/);
  assert.match(secrets, /get_server_integration_secret/);
  assert.match(secrets, /upsert_server_integration_secret/);
  assert.match(env, /MPESA_CONSUMER_KEY=/);
  assert.match(env, /MPESA_CONSUMER_SECRET=/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_MPESA/);
});

test("Daraja setup accepts secrets only through protected server actions", async () => {
  const [panel, actions, page] = await Promise.all([
    read("components/daraja-credential-panel.tsx"),
    read("lib/actions/reconciliation.ts"),
    read("app/reconciliation/page.tsx"),
  ]);
  assert.match(panel, /type="password"/);
  assert.match(panel, /saveMpesaDarajaCredentials/);
  assert.match(panel, /Encrypt, save and verify OAuth/);
  assert.match(actions, /requirePermission\("configure"\)/);
  assert.match(actions, /saveAndValidateDarajaCredentials/);
  assert.match(page, /DarajaCredentialPanel/);
  assert.doesNotMatch(panel, /NEXT_PUBLIC_|SUPABASE_SERVICE_ROLE_KEY/);
});

test("M-Pesa callbacks use a separate tenant callback token", async () => {
  const handler = await read("lib/reconciliation/provider-callback.ts");
  assert.match(handler, /getIntegrationSecret\(String\(sources\[0\]\.organization_id\), "callback_token"\)/);
  assert.match(handler, /M-Pesa source reference is not unique/);
  assert.match(handler, /timingSafeEqual/);
  assert.doesNotMatch(handler, /consumer_secret|consumerSecret/);
});
