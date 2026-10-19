import { build } from "esbuild";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const out = path.join(root, ".next-qa/ui-fixture");
await mkdir(out, { recursive: true });
await build({
  entryPoints: ["tests/browser/workspace-fixture.tsx"], outdir: out, bundle: true, format: "esm", jsx: "automatic", sourcemap: false,
  external: ["/fonts/*", "/hisab-*"], loader: { ".woff2": "file", ".svg": "file" }, define: { "process.env.NODE_ENV": '"test"' },
  plugins: [{ name: "read-only-browser-fixtures", setup(build) {
    build.onResolve({ filter: /^next\/(navigation|link)$/ }, args => ({ path: args.path, namespace: "next-fixture" }));
    build.onLoad({ filter: /.*/, namespace: "next-fixture" }, args => ({ resolveDir: root, loader: "jsx", contents: args.path.endsWith("link")
      ? 'import React from "react"; export default function Link({href,prefetch,replace,scroll,...props}) {return <a href={href} {...props}/>;}'
      : 'export const usePathname=()=>location.pathname; export const useSearchParams=()=>new URLSearchParams(location.search); export const useRouter=()=>({push:href=>location.assign(href),replace:href=>location.replace(href),refresh:()=>location.reload(),prefetch:()=>{}});' }));
    build.onResolve({ filter: /lib\/actions\// }, args => ({ path: path.resolve(args.resolveDir, args.path) + ".ts", namespace: "blocked-action" }));
    build.onLoad({ filter: /.*/, namespace: "blocked-action" }, async args => {
      const source = await readFile(args.path, "utf8");
      const names = [...source.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)].map(match => match[1]);
      return { contents: names.map(name => `export async function ${name}(){throw new Error("Writes are disabled in visual fixtures")}`).join("\n") };
    });
  }}],
});
const mime = { ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/api/session-context") { res.writeHead(200, {"Content-Type":"application/json"}); res.end('{"user":null}'); return; }
    const target = pathname === "/fixture.js" ? path.join(out, "workspace-fixture.js") : pathname === "/fixture.css" ? path.join(out, "workspace-fixture.css") : path.join(root, "public", pathname);
    if (path.extname(pathname)) { const bytes = await readFile(target); res.setHeader("Content-Type", mime[path.extname(target)] ?? "application/octet-stream"); res.end(bytes); return; }
    res.setHeader("Content-Type", "text/html");
    res.end('<!doctype html><html lang="en" data-theme="light" data-brand="biloo"><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="/fixture.css"><style>@font-face{font-family:Manrope;src:url(/fonts/manrope-latin-wght-normal.woff2) format("woff2");font-weight:200 800;font-display:swap}:root{--font-biloo-manrope:Manrope}</style></head><body data-design-system="hisab-precision-v2" data-workspace-system="financial-os-v1" data-ui-polish="biloo-award-marketing-2026"><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');
  } catch { res.writeHead(404); res.end(); }
});
server.listen(Number(process.env.UI_FIXTURE_PORT || 41774), "127.0.0.1", () => console.log("Read-only UI fixtures ready"));
