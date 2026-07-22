import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public first paint avoids the root streaming fallback and embedded Ethiopic font payload", async () => {
  const [layout, languageProvider, mobileStyles] = await Promise.all([
    read("app/layout.tsx"),
    read("components/language-provider.tsx"),
    read("app/mobile-first-paint.css"),
  ]);

  await assert.rejects(access(path.join(root, "app/loading.tsx")));

  assert.doesNotMatch(layout, /font-benaiah-[123]\.css/);
  assert.match(layout, /mobile-first-paint\.css/);

  assert.match(languageProvider, /import\("\.\.\/lib\/ui-translations"\)/);
  assert.match(languageProvider, /import type \{ TranslationValues \} from "\.\.\/lib\/ui-translations"/);
  assert.doesNotMatch(languageProvider, /import\s+\{\s*translateUiText/);
  assert.doesNotMatch(languageProvider, /router\.refresh\(\)/);
  assert.match(languageProvider, /language === "en" && !translator/);

  assert.match(mobileStyles, /content-visibility: visible !important/);
  assert.match(mobileStyles, /backdrop-filter: none !important/);
});
