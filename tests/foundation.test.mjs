import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationPath = new URL("../supabase/migrations/202607160001_foundation.sql", import.meta.url);
const packagePath = new URL("../package.json", import.meta.url);

test("all exposed ERP tables enable row-level security", async () => {
  const sql = await readFile(migrationPath, "utf8");
  const tables = ["organizations","branches","organization_members","customers","warehouses","products","stock_balances","stock_movements","accounts","journal_entries","journal_lines","sales_invoices","sales_invoice_items","payments","audit_events","approval_requests"];
  for (const table of tables) assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"), `${table} must enable RLS`);
});

test("invoice posting is atomic and validates balanced journals", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.match(sql, /create or replace function public\.create_sales_invoice/i);
  assert.match(sql, /Journal is not balanced/i);
  assert.match(sql, /perform public\.record_stock_movement/i);
  assert.match(sql, /invoice\.posted/i);
});

test("audit events and posted journals are immutable", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.match(sql, /create trigger audit_immutable/i);
  assert.match(sql, /create trigger journal_immutable/i);
});

test("production scripts include typecheck, tests and build", async () => {
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
  assert.match(pkg.scripts.check, /typecheck.*test.*build/);
});
