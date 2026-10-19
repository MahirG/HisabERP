import { promises as fs } from "node:fs";
import path from "node:path";

const localeDir = path.join("lib", "locales");
const files = (await fs.readdir(localeDir)).filter(file => /^ui-catalog-\d+\.json$/.test(file)).sort();
if (!files.length) throw new Error("No source-copy catalogs were found.");

const english = {};
const sourceLocations = new Map();
const invalidDuplicates = [];
const invalidOverrides = [];
let reviewedOverrides = 0;

for (const file of files) {
  const entries = JSON.parse(await fs.readFile(path.join(localeDir,file),"utf8"));
  if (!Array.isArray(entries)) throw new Error(`${file} must contain an array.`);
  for(const [index,item] of entries.entries()) {
    const source = String(item?.source??"").replace(/\s+/g," ").trim();
    const location = `${file}[${index}]`;
    if(!source) throw new Error(`Empty English source at ${location}`);
    const previous=sourceLocations.get(source);
    if(previous && item?.override!==true) invalidDuplicates.push(`${location} duplicates ${previous}`);
    if(!previous && item?.override===true) invalidOverrides.push(`${location} does not override an earlier source`);
    if(previous && item?.override===true) {
      if(!String(item?.reviewNote??"").trim()) invalidOverrides.push(`${location} requires reviewNote`);
      reviewedOverrides++;
    }
    sourceLocations.set(source,location);
    english[source]=source;
  }
}
if(invalidDuplicates.length)throw new Error(`Duplicate source-copy keys: ${invalidDuplicates.join("; ")}`);
if(invalidOverrides.length)throw new Error(`Invalid source-copy overrides: ${invalidOverrides.join("; ")}`);
await fs.writeFile(path.join(localeDir,"ui.en.json"),`${JSON.stringify(english)}\n`);
console.log(`Indexed ${Object.keys(english).length} English UI strings from ${files.length} source catalogs with ${reviewedOverrides} reviewed override(s).`);
