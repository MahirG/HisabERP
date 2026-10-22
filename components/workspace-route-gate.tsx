"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { UserContext } from "../lib/data/types";

const WorkspaceShell = dynamic(() => import("./workspace-shell").then((module) => module.WorkspaceShell));
const publicPrefixes = ["/auth", "/onboarding", "/request-demo", "/product-tour", "/product", "/ethiopia", "/industries", "/pricing", "/customer-stories", "/trust", "/integrations", "/migration", "/compare", "/help-center", "/resources", "/about", "/services", "/privacy", "/terms", "/help"];

/** Public pages never download the private workspace navigation or command center. */
export function WorkspaceRouteGate({ children, user = null }: { children: ReactNode; user?: UserContext | null }) {
  const pathname = usePathname();
  const publicRoute = (pathname === "/" && !user) || publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (publicRoute) return <>{children}</>;
  return <WorkspaceShell user={user}>{children}</WorkspaceShell>;
}
