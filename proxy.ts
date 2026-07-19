import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy";
import { rateLimit } from "./lib/security/rate-limit";

function securityHeaders(response: NextResponse, nonce: string, legacy: boolean) {
  const extraConnect = process.env.CSP_CONNECT_SRC?.split(",").map((value) => value.trim()).filter(Boolean).join(" ") ?? "";
  const scriptPolicy = legacy ? "'self' 'unsafe-inline'" : `'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const csp = [
    "default-src 'self'",
    `script-src ${scriptPolicy}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.googleusercontent.com https://www.ethiotelecom.et",
    "font-src 'self' data:",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${extraConnect}`.trim(),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("x-nonce", nonce);
  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const isLegacy = request.nextUrl.pathname.startsWith("/legacy");
  const isSensitive = request.nextUrl.pathname.startsWith("/auth/") || request.nextUrl.pathname.startsWith("/api/");
  if (isSensitive) {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const key = `${forwarded || "unknown"}:${request.nextUrl.pathname}`;
    const result = rateLimit(key, request.nextUrl.pathname.startsWith("/auth/") ? 12 : 60);
    if (!result.allowed) {
      const response = NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
      response.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
      return securityHeaders(response, nonce, isLegacy);
    }
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const response = await updateSession(request, requestHeaders);
  return securityHeaders(response, nonce, isLegacy);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)"] };
