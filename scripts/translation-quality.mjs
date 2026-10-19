import {promises as fs} from "node:fs";
import path from "node:path";
const directory=path.resolve("lib/locales");
const files=(await fs.readdir(directory)).filter(p=>/^ui-catalog-\d+\.json$/.test(p)).sort();
const errors=[];
const warnings=[];
const entries=new Map();
const overrides=[];
for(const file of files){
  const rows=JSON.parse(await fs.readFile(path.join(directory,file),"utf8"));
  if(!Array.isArray(rows)){errors.push({file,issue:"Catalog must be an array."});continue;}
  rows.forEach((row,index)=>{
    const source=String(row?.source??"").trim();
    const location=`${file}[${index}]`;
    if(!source)errors.push({location,issue:"English source copy is required."});
    if(source.includes("�"))warnings.push({location,issue:"Replacement character in English copy."});
    const previous=entries.get(source);
    if(previous && row?.override!==true) errors.push({location,issue:`Duplicate source also at ${previous}`});
    if(!previous && row?.override===true)errors.push({location,issue:"Override has no prior source."});
    if(previous && row?.override===true){
      const reason=String(row?.reviewNote??"").trim();
      if(!reason)errors.push({location,issue:"Override requires a review note."});
      else overrides.push({source,location,reason});
    }
    if(source)entries.set(source,location);
  });
}
const report={
 generatedAt:new Date().toISOString(),catalogs:files.length,
 entries:entries.size,supportedLanguages:["en"],reviewedOverrides:overrides,
 errors,warnings
};
await fs.writeFile("translation-quality-report.json",`${JSON.stringify(report,null,2)}\n`);
console.log(`English source-copy integrity: ${entries.size} entries, ${errors.length} errors, ${warnings.length} warnings.`);
if(process.argv.includes("--check")&&errors.length)process.exitCode=1;
