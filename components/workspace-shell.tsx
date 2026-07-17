"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import type { UserContext } from "../lib/data/types";
import { LanguageSelector, useLanguage } from "./language-provider";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

type WorkspaceShellProps = {
  children: ReactNode;
  user: UserContext | null;
};

const shellExcludedRoutes = ["/auth", "/onboarding"];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/modules") return pathname === "/modules";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceShell({ children, user }: WorkspaceShellProps) {
  const pathname = usePathname();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const { dictionary, language } = useLanguage();

  const isExcluded = shellExcludedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const showWorkspaceShell = Boolean(user) && !isExcluded;

  useEffect(() => {
    if (showWorkspaceShell) workspaceRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, showWorkspaceShell]);

  if (!showWorkspaceShell || !user) return <>{children}</>;

  const d = dictionary.dashboard;
  const sections = language === "am"
    ? { core: "ዋና የስራ ቦታ", phase1: "ደረጃ 1", phase2: "ደረጃ 2 እና 3" }
    : language === "ti"
      ? { core: "ዋና መስርሕ", phase1: "ደረጃ 1", phase2: "ደረጃ 2ን 3ን" }
      : { core: "Core workspace", phase1: "Phase 1 operations", phase2: "Phase 2 & 3 growth" };

  const navGroups = [
    {
      label: sections.core,
      items: [
        { label: d.nav.overview, href: "/" },
        { label: d.nav.modules, href: "/modules" },
        { label: d.nav.finance, href: "/finance" },
        { label: d.nav.sales, href: "/sales" },
      ],
    },
    {
      label: sections.phase1,
      items: [
        { label: dictionary.moduleItems["purchasing-expenses"].shortTitle, href: "/modules/purchasing-expenses" },
        { label: dictionary.moduleItems["inventory-warehouse"].shortTitle, href: "/modules/inventory-warehouse" },
        { label: dictionary.moduleItems["customers-suppliers"].shortTitle, href: "/modules/customers-suppliers" },
        { label: dictionary.moduleItems["security-approvals-audit"].shortTitle, href: "/modules/security-approvals-audit" },
        { label: dictionary.moduleItems["reports-analytics"].shortTitle, href: "/modules/reports-analytics" },
        { label: dictionary.moduleItems["localization-compliance"].shortTitle, href: "/modules/localization-compliance" },
      ],
    },
    {
      label: sections.phase2,
      items: [
        { label: dictionary.moduleItems["human-resources-payroll"].shortTitle, href: "/modules/human-resources-payroll" },
        { label: dictionary.moduleItems["fixed-assets"].shortTitle, href: "/modules/fixed-assets" },
        { label: dictionary.moduleItems["budgeting-projects"].shortTitle, href: "/modules/budgeting-projects" },
        { label: dictionary.moduleItems["integrations-automation"].shortTitle, href: "/modules/integrations-automation" },
      ],
    },
  ];

  return (
    <div className="erp-shell" data-layout-version="complete-modules-v1">
      <UserMenu user={user} />

      <aside className="sidebar" data-docked="true">
        <div className="brand">
          <span>H</span>
          <div><strong>Hisab</strong><small>{d.brandSubtitle}</small></div>
        </div>

        <div className="sidebar-preferences">
          <LanguageSelector compact />
          <ThemeToggle />
        </div>

        <nav aria-label="Primary workspace navigation">
          {navGroups.map((group) => (
            <div className="sidebar-nav-group" key={group.label}>
              <span className="sidebar-section-label">{group.label}</span>
              {group.items.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                return <Link aria-current={active ? "page" : undefined} className={active ? "active" : undefined} href={item.href} key={item.href}>{item.label}</Link>;
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-dock-status" aria-label="Navigation is docked">
          <span aria-hidden="true">●</span>
          <strong>{language === "am" ? "ምናሌው ተቆልፏል" : language === "ti" ? "ምናሌ ተሰኪሉ" : "Navigation docked"}</strong>
        </div>

        <footer className="sidebar-footer">
          <p className="powered-by">Powered by <a href="https://hisabtech.com" target="_blank" rel="noreferrer">HisabTech.com</a></p>
          <a className="technology-link" href="https://hisabtechnologies.com" target="_blank" rel="noreferrer">hisabtechnologies.com ↗</a>
          <p>{user.organizationName}<br />Addis Ababa, Ethiopia</p>
        </footer>
      </aside>

      <div className="workspace" id="workspace-content" ref={workspaceRef}>{children}</div>
    </div>
  );
}
