import { promises as fs } from "node:fs";
import path from "node:path";

const localeDir = path.join("lib", "locales");
const files = (await fs.readdir(localeDir))
  .filter((file) => /^ui-catalog-\d+\.json$/.test(file))
  .sort();

if (!files.length) throw new Error("No UI translation catalogs were found.");

const english = {};
const amharic = {};
const tigrinya = {};
const duplicates = [];

for (const file of files) {
  const entries = JSON.parse(await fs.readFile(path.join(localeDir, file), "utf8"));
  if (!Array.isArray(entries)) throw new Error(`${file} must contain an array.`);

  for (const entry of entries) {
    const source = String(entry?.source ?? "").replace(/\s+/g, " ").trim();
    const am = String(entry?.am ?? "").replace(/\s+/g, " ").trim();
    const ti = String(entry?.ti ?? "").replace(/\s+/g, " ").trim();
    if (!source || !am || !ti) throw new Error(`${file} contains an incomplete translation entry.`);
    if (Object.hasOwn(english, source)) duplicates.push(source);
    english[source] = source;
    amharic[source] = am;
    tigrinya[source] = ti;
  }
}

if (duplicates.length) {
  throw new Error(`Duplicate UI translation sources: ${[...new Set(duplicates)].join(", ")}`);
}

await Promise.all([
  fs.writeFile(path.join(localeDir, "ui.en.json"), `${JSON.stringify(english)}\n`),
  fs.writeFile(path.join(localeDir, "ui.am.json"), `${JSON.stringify(amharic)}\n`),
  fs.writeFile(path.join(localeDir, "ui.ti.json"), `${JSON.stringify(tigrinya)}\n`),
]);

console.log(`Generated localization indexes for ${Object.keys(english).length} UI strings from ${files.length} catalogs.`);
