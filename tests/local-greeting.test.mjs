import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read = p => readFile(new URL(`../${p}`, import.meta.url),"utf8");

test("dashboard uses live local-time greeting component", async () => {
  const dashboard=await read("components/dashboard.tsx");
  assert.match(dashboard,/import \{ LocalGreeting \} from "\.\/local-greeting"/);
  assert.match(dashboard,/<LocalGreeting language=\{language\} firstName=\{snapshot\.userName\} \/>/);
});
test("local greeting has four English periods without Amharic fallback",async()=>{
  const greeting=await read("components/local-greeting.tsx");
  for(const part of ["hour >= 5 && hour < 12","hour >= 12 && hour < 17","hour >= 17 && hour < 21","Selam,","wishing you a peaceful night",'new Intl.DateTimeFormat("en-ET"'])assert.ok(greeting.includes(part),part);
  assert.doesNotMatch(greeting,/AMHARIC_GREETINGS|am-ET|[\u1200-\u137f]/);
});
test("greeting updates over time safely after hydration",async()=>{
 const s=await read("components/local-greeting.tsx");
 assert.match(s,/useState<Date \| null>\(null\)/);
 assert.match(s,/window\.setInterval\(updateLocalTime, 60_000\)/);
 assert.match(s,/window\.clearInterval\(timer\)/);
 assert.match(s,/dateTime=\{localTime\.toISOString\(\)\}/);
});
