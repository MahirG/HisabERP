"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import type { UserContext } from "../lib/data/types";
import { LanguageSelector, useLanguage } from "./language-provider";
import { UserMenu } from "./user-menu";

type WorkspaceShellProps = {
  children: ReactNode;
  user: UserContext | null;
};

const shellExcludedRoutes = ["/auth", "/onboarding"];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/modules") {
    return pathname === "/modules" || (pathname.startsWith("/modules/") && !pathname.startsWith("/modules/purchasing-expenses"));
  }
  if (href === "/modules/purchasing-expenses") return pathname.startsWith(href);

  const section = `/${href.split("/")[1]}`;
  return pathname === href || pathname.startsWith(`${section}/`);
}

export function WorkspaceShell({ children, user }: WorkspaceShellProps) {
  const pathname = usePathname();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const { dictionary } = useLanguage();

  const isExcluded = shellExcludedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const showWorkspaceShell = Boolean(user) && !isExcluded;

  useEffect(() => {
    if (showWorkspaceShell) workspaceRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, showWorkspaceShell]);

  if (!showWorkspaceShell || !user) return <>{children}</>;

  const d = dictionary.dashboard;
  const navItems = [
    { label: d.nav.overview, href: "/" },
    { label: d.nav.modules, href: "/modules" },
    { label: d.nav.finance, href: "/finance/journals" },
    { label: d.nav.sales, href: "/sales/invoices/new" },
    { label: d.nav.purchasing, href: "/modules/purchasing-expenses" },
    { label: d.nav.inventory, href: "/inventory" },
    { label: d.nav.reports, href: "/reports" },
  ];

  return (
    <div className="erp-shell" data-layout-version="persistent-docked-v3">
      <UserMenu user={user} />

      <aside className="sidebar" data-docked="true">
        <div className="brand">
          <span>H</span>
          <div>
            <strong>Hisab</strong>
            <small>{d.brandSubtitle}</small>
          </div>
        </div>

        <LanguageSelector compact />

        <nav aria-label="Primary workspace navigation">
          {navItems.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "active" : undefined}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-dock-status" aria-label="Navigation is docked">
          <span aria-hidden="true">●</span>
          <strong>Navigation docked</strong>
        </div>

        <div className="sidebar-footer">
          <Link href="/docs/setup">Production controls</Link>
          <p>
            {user.organizationName}
            <br />
            Addis Ababa, Ethiopia
          </p>
        </div>
      </aside>

      <div className="workspace" id="workspace-content" ref={workspaceRef}>
        {children}
      </div>
    </div>
  );
}
