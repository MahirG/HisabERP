import { spawn } from "node:child_process";

const port = process.env.HISAB_SEO_PORT || "41775";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", port], { stdio: ["ignore", "pipe", "pipe"] });
let started = false;
const timeout = setTimeout(() => { console.error("SEO server startup timed out"); server.kill(); process.exitCode = 1; }, 30000);
server.stderr.pipe(process.stderr);
server.stdout.on("data", (data) => {
  process.stdout.write(data);
  if (started || !data.toString().includes("Ready")) return;
  started = true;
  clearTimeout(timeout);
  const check = spawn(process.execPath, ["scripts/check-seo.mjs", "--base-url", `http://127.0.0.1:${port}`], { stdio: "inherit" });
  check.on("exit", (code) => { process.exitCode = code ?? 1; server.kill(); });
  check.on("error", (error) => { console.error(error); process.exitCode = 1; server.kill(); });
});
server.on("error", (error) => { clearTimeout(timeout); console.error(error); process.exitCode = 1; });
server.on("exit", (code) => { clearTimeout(timeout); if (!started) process.exitCode = code || 1; });
process.on("SIGINT", () => { server.kill(); process.exitCode = 130; });
process.on("SIGTERM", () => { server.kill(); process.exitCode = 143; });
