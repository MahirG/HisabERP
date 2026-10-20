import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const ts=require("typescript");
const React=require("react");
const {renderToStaticMarkup}=require("react-dom/server");
const previous={ts:require.extensions[".ts"],tsx:require.extensions[".tsx"],css:require.extensions[".css"]};
const compile=(mod,file)=>{const source=readFileSync(file,"utf8");const out=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});assert.equal((out.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);mod._compile(out.outputText,file);};
require.extensions[".ts"]=compile;require.extensions[".tsx"]=compile;
require.extensions[".css"]=(mod,file)=>{mod.exports=Object.fromEntries([...readFileSync(file,"utf8").matchAll(/\.([A-Za-z][A-Za-z0-9_]*)/g)].map(m=>[m[1],m[1]]));};
const {editions}=require("../news/data.ts");
const {NewsIndex}=require("../news/index.tsx");
const {NewsArticle}=require("../news/article.tsx");
const {articleMetadata,indexMetadata}=require("../news/seo.ts");
const {newsRss}=require("../news/rss.ts");
const {safeJson}=require("../news/types.ts");
for(const [ext,value]of Object.entries({".ts":previous.ts,".tsx":previous.tsx,".css":previous.css})){if(value)require.extensions[ext]=value;else delete require.extensions[ext];}
test("index server renders all edition links, search and accessible filters",()=>{
 const html=renderToStaticMarkup(React.createElement(NewsIndex,{editions,basePath:"/resources/tech-news"}));
 for(const e of editions)assert(html.includes("/resources/tech-news/"+e.slug));
 assert(html.includes('type="search"'));assert(html.includes('aria-pressed="true"'));assert(html.includes("rss.xml"));assert(html.includes("How we report"));
 assert(!html.includes("undefined"));
});
test("article distinguishes evidence and analysis and includes safe JSON-LD",()=>{
 const e=editions[0];const html=renderToStaticMarkup(React.createElement(NewsArticle,{edition:e,basePath:"/resources/tech-news",variant:"erp"}));
 assert(html.includes("application/ld+json"));assert(html.includes("NewsArticle"));assert(html.includes("BreadcrumbList"));
 assert(html.includes("Editorial analysis"));for(const i of e.items)for(const s of i.sources)assert(html.includes(s.url.replaceAll("&","&amp;")));
 assert(html.includes("https://www.hisabtechnologies.com/news/"+e.slug));assert(!html.includes("genui"));
 assert.equal(safeJson({text:"</script>"}).includes("<"),false);
});
test("article metadata points both copies to the company canonical",()=>{
 const e=editions[0],meta=articleMetadata(e);
 assert.equal(meta.alternates.canonical,"https://www.hisabtechnologies.com/news/"+e.slug);
 assert.equal(meta.openGraph.type,"article");assert.equal(meta.openGraph.publishedTime,e.publishedAt);
 assert.equal(meta.twitter.card,"summary_large_image");
 assert(indexMetadata("https://example.test/news").alternates.types["application/rss+xml"].endsWith("/rss.xml"));
});
test("RSS escapes text and contains canonical stable GUIDs",()=>{
 const rss=newsRss();assert(rss.startsWith('<?xml version="1.0"'));assert.equal((rss.match(/<item>/g)||[]).length,editions.length);
 for(const e of editions)assert(rss.includes("https://www.hisabtechnologies.com/news/"+e.slug));
 assert(rss.includes("data governance, public ICT and digital services"));assert(!rss.includes("genui"));
});

