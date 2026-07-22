import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { appConfig, isSupabaseConfigured } from "../config";

const publicPageRoutes = new Set([
  "/",
  "/request-demo",
  "/product-tour",
  "/ethiopia",
  "/industries",
  "/pricing",
  "/customer-stories",
  "/trust",
  "/integrations",
  "/migration",
  "/compare",
  "/help-center",
  "/auth/login",
  "/auth/phone-login",
  "/auth/sign-up",
  "/auth/verify-phone",
  "/auth/email-login",
  "/auth/email-sign-up",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/magic-link",
  "/auth/reset-password",
  "/auth/invalid-link",
  "/auth/callback",
  "/auth/confirm",
]);

const publicPagePrefixes = ["/product/", "/industries/", "/compare/", "/help-center/"];
const authenticatedMarketingRoutes = new Set(["/request-demo", "/product-tour", "/ethiopia", "/industries", "/pricing", "/customer-stories", "/trust", "/integrations", "/migration", "/compare", "/help-center"]);

const publicApiRoutes = new Set([
  "/api/health",
  "/api/reconciliation/telebirr/callback",
  "/api/reconciliation/mpesa/callback",
]);

function isPublicPath(path: string) {
  return publicPageRoutes.has(path) || publicPagePrefixes.some((prefix) => path.startsWith(prefix)) || publicApiRoutes.has(path);
}

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  const destination = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/auth/login";
  url.search = "";
  url.searchParams.set("next", destination);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  const path = request.nextUrl.pathname;
  const publicPath = isPublicPath(path);

  if (!isSupabaseConfigured()) {
    if (publicPath) return NextResponse.next({ request: { headers: requestHeaders } });
    if (path.startsWith("/api/")) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
    return loginRedirect(request);
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(appConfig.supabaseUrl, appConfig.supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  if (!isAuthenticated && !publicPath) {
    if (path.startsWith("/api/")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return loginRedirect(request);
  }

  const authenticatedRecoveryPage = path === "/auth/reset-password";
  const authenticatedPreview = request.nextUrl.searchParams.get("preview") === "1";
  const authenticatedMarketingPath = authenticatedMarketingRoutes.has(path) || publicPagePrefixes.some((prefix) => path.startsWith(prefix));
  if (isAuthenticated && publicPageRoutes.has(path) && path !== "/" && !authenticatedMarketingPath && path !== "/auth/callback" && path !== "/auth/confirm" && !authenticatedRecoveryPage && !authenticatedPreview) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
