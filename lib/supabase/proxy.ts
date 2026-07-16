import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { appConfig, isSupabaseConfigured } from "../config";

export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  if (!isSupabaseConfigured()) return NextResponse.next({ request: { headers: requestHeaders } });

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
  const path = request.nextUrl.pathname;
  const isAuthPath = path.startsWith("/auth/");
  const protectedPath = ["/customers", "/inventory", "/sales", "/finance"].some((prefix) => path.startsWith(prefix));

  if (protectedPath && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isAuthPath && !path.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
