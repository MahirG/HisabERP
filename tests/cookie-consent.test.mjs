import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../components/cookie-consent.tsx", import.meta.url), "utf8");

test("Biloo stores both accepted and declined consent across sessions", () => {
  assert.match(source, /type CookieChoice = "accepted" \| "declined"/);
  assert.match(source, /window\.localStorage\.setItem\(COOKIE_KEY, choice\)/);
  assert.match(source, /document\.cookie = parts\.join\("; "\)/);
  assert.match(source, /Max-Age=/);
  assert.match(source, /SameSite=Lax/);
});
test("Consent persists across the first-party Biloo subdomains with a cookie fallback", () => {
  assert.match(source, /Domain=hisabtech\.com/);
  assert.match(source, /hostname\.endsWith\("\.hisabtech\.com"\)/);
  assert.match(source, /if \(fromCookie\) return fromCookie/);
  assert.match(source, /if \(fromStorage\) writeChoice\(fromStorage\)/);
});
test("Banner respects saved preferences on refresh and in other open tabs", () => {
  assert.match(source, /setVisible\(storedChoice\(\) === null\)/);
  assert.match(source, /window\.addEventListener\("storage", onStorage\)/);
  assert.match(source, /window\.addEventListener\("pageshow", synchronize\)/);
  assert.match(source, /onClick=\{\(\) => decide\("declined"\)\}/);
  assert.match(source, /onClick=\{\(\) => decide\("accepted"\)\}/);
});
