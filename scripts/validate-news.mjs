import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const file=new URL("../news/editions.json",import.meta.url);
const editions=JSON.parse(readFileSync(file,"utf8"));
assert(Array.isArray(editions)&&editions.length>0);
const slugs=new Set();
for(const e of editions){
 assert(/^[a-z0-9-]+$/.test(e.slug),"Invalid slug");assert(!slugs.has(e.slug),"Duplicate slug");slugs.add(e.slug);
 for(const key of ["title","summary","lead","coverage"])assert(typeof e[key]==="string"&&e[key].length>0,key);
 assert(!Number.isNaN(Date.parse(e.publishedAt)));assert(Date.parse(e.updatedAt)>=Date.parse(e.publishedAt));
 assert(Array.isArray(e.topics)&&e.topics.length>0);assert(Number.isInteger(e.readingMinutes)&&e.readingMinutes>0);
 assert(e.items.length>0);
 for(const i of e.items){
 for(const key of ["category","date","title","status","fact","why","action"])assert(typeof i[key]==="string"&&i[key].length>0,key);
 assert(i.sources.length>0,"Every item needs evidence");
 for(const source of i.sources){assert(source.name.length>0);const url=new URL(source.url);assert(url.protocol==="https:");assert(!url.username&&!url.password);}
 }
}
assert(!JSON.stringify(editions).includes("genui"),"Use real source URLs, not chat citation tokens");
console.log("News validation passed: "+editions.length+" editions, "+editions.reduce((n,e)=>n+e.items.length,0)+" sourced stories.");

