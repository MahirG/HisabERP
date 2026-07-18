import { promises as fs } from "node:fs";
import path from "node:path";

const localeDirectory = path.resolve("lib/locales");
const files = (await fs.readdir(localeDirectory))
  .filter((name) => /^ui-catalog-\d+\.json$/.test(name))
  .sort();

const placeholderPattern = /\{[A-Za-z0-9_]+\}/g;
const errors = [];
const warnings = [];
const overrides = [];
const sources = new Map();
let entries = 0;

function placeholders(value) {
  return [...String(value).matchAll(placeholderPattern)].map((match) => match[0]).sort();
}

for (const file of files) {
  const catalog = JSON.parse(await fs.readFile(path.join(localeDirectory, file), "utf8"));
  if (!Array.isArray(catalog)) {
    errors.push({ file, issue: "Catalog must be a JSON array." });
    continue;
  }

  catalog.forEach((entry, index) => {
    entries += 1;
    const location = `${file}[${index}]`;
    const source = String(entry?.source ?? "").trim();
    const am = String(entry?.am ?? "").trim();
    const ti = String(entry?.ti ?? "").trim();

    if (!source || !am || !ti) errors.push({ location, issue: "Source, Amharic and Tigrinya are all required." });

    const sourcePlaceholders = placeholders(source);
    for (const [language, translation] of [["am", am], ["ti", ti]]) {
      const translatedPlaceholders = placeholders(translation);
      if (JSON.stringify(sourcePlaceholders) !== JSON.stringify(translatedPlaceholders)) {
        errors.push({ location, language, issue: "Interpolation placeholders do not match the source.", sourcePlaceholders, translatedPlaceholders });
      }
      if (translation.includes("�")) warnings.push({ location, language, issue: "Replacement character detected; inspect source encoding." });
      if (translation === source && /[A-Za-z]{3}/.test(source) && source.length > 12) {
        warnings.push({ location, language, issue: "Translation is identical to English; confirm this is intentional." });
      }
      if (/\s{2,}/.test(translation)) warnings.push({ location, language, issue: "Repeated whitespace detected." });
    }

    const previous = sources.get(source);
    if (previous && entry?.override === true) {
      const reviewNote = String(entry?.reviewNote ?? "").trim();
      if (!reviewNote) errors.push({ location, issue: "A translation override requires a reviewNote." });
      overrides.push({ source, from: previous, to: location, reviewNote });
      sources.set(source, location);
    } else if (previous) {
      errors.push({ location, issue: `Duplicate English source also appears at ${previous}; use a documented override only for a reviewed correction.` });
    } else if (entry?.override === true) {
      errors.push({ location, issue: "Override is true but no earlier source exists." });
    } else if (source) {
      sources.set(source, location);
    }
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  catalogs: files.length,
  entries,
  uniqueSources: sources.size,
  reviewedOverrides: overrides,
  errors,
  warnings,
  professionalReview: {
    status: "pending-human-sign-off",
    requiredLanguages: ["am", "ti"],
    requiredEvidence: ["reviewer name", "review date", "application version", "terminology decisions", "approved exceptions"],
  },
};

await fs.writeFile("translation-quality-report.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(`translation quality: ${entries} entries, ${errors.length} errors, ${warnings.length} review warnings, ${overrides.length} reviewed override(s).`);
console.log("Automated checks do not replace approval by qualified native-language reviewers.");

if (process.argv.includes("--check") && errors.length) process.exitCode = 1;
