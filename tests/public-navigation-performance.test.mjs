import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("public pages avoid root-level authentication and use a static home route", async () => {
  const [layout, home, proxy, sessionProxy] = await Promise.all([
    read("app/layout.tsx"),
    read("app/page.tsx"),
    read("proxy.ts"),
    read("lib/supabase/proxy.ts"),
  ]);

  assert.doesNotMatch(layout, /cookies\(|headers\(|getCurrentUserContext/);
  assert.match(layout, /<WorkspaceShell>\{children\}<\/WorkspaceShell>/);
  assert.doesNotMatch(home, /force-dynamic|getCurrentUserContext|getDashboardSnapshot/);
  assert.match(home, /revalidate = 3600/);
  assert.match(proxy, /s-maxage=300, stale-while-revalidate=86400/);
  assert.match(sessionProxy, /cacheablePublicPath && path !== "\/"/);
  assert.match(sessionProxy, /url\.pathname = "\/workspace-home"/);
});

test("public navigation uses a thin progress indicator while workspace loading stays branded", async () => {
  const [loading, progress, workspace, sessionRoute] = await Promise.all([
    read("app/loading.tsx"),
    read("app/public-route-progress.css"),
    read("components/workspace-shell.tsx"),
    read("app/api/session-context/route.ts"),
  ]);

  assert.match(loading, /className="public-route-progress"/);
  assert.match(loading, /className="route-loading brand-route-loading"/);
  assert.match(progress, /height: 3px/);
  assert.match(progress, /#E17A5B/);
  assert.match(workspace, /fetch\("\/api\/session-context"/);
  assert.match(workspace, /cache: "no-store"/);
  assert.match(sessionRoute, /Cache-Control.*private, no-store/);
});
