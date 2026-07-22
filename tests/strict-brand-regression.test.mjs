import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");

test("strict brand stylesheet covers public, authentication and internal surfaces", async () => {
  const css = await read("app/strict-brand.css");

  for (const selector of [
    ".marketing-site",
    ".auth-hisab-mark",
    ".supabase-sidebar",
    ".workspace-command-header",
    ".mobile-bottom-nav",
    ".workspace-status-badge",
    ".sticky-user-avatar",
    ".account-avatar",
  ]) {
    assert.ok(css.includes(selector), `missing strict brand coverage for ${selector}`);
  }
});
