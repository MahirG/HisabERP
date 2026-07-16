import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { appConfig, isSupabaseConfigured } from "../config";

const publicPageRoutes = new Set([
  "/auth/login",
  "/auth/sign-up",
  "/auth/verify-phone",
  "/auth/callback",
]);

function isPublicPath(path: string) {
  return publicPageRoutes.has(path) || path === "/api/health";
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

    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication is not configured." },
        { status: 503 },
      );
    }

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
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    return loginRedirect(request);
  }

  if (isAuthenticated && publicPageRoutes.has(path) && path !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
