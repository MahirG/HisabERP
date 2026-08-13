"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

const PUBLIC_ROUTE_PREFIXES = [
  "/product",
  "/product-tour",
  "/pricing",
  "/ethiopia",
  "/industries",
  "/migration",
  "/integrations",
  "/customer-stories",
  "/resources",
  "/help-center",
  "/compare",
  "/trust",
  "/about",
  "/request-demo",
  "/privacy",
  "/terms",
  "/cookies",
  "/legal",
  "/support",
  "/contact",
  "/security",
  "/accessibility",
] as const;

function isPublicRoute(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function InternalStyleLoader() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (isPublicRoute(pathname)) return;
    void import("../app/internal-styles");
  }, [pathname]);

  return null;
}
