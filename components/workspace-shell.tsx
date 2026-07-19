"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import type { UserContext } from "../lib/data/types";
import { LanguageSelector, useLanguage } from "./language-provider";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

type WorkspaceShellProps = { children: ReactNode; user: UserContext | null };
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
    ? { core: "ዋና የስራ ቦታ", phase1: "ዋና ስራዎች", phase2: "ማስፋፊያ ሞጁሎች" }
    : language === "ti"
      ? { core: "ዋና መስርሕ", phase1: "ቀንዲ ስርሓት", phase2: "ምዕባለ ሞጁላት" }
      : { core: "Core workspace", phase1: "Core operations", phase2: "Growth modules" };
  const setupLabel = language === "am" ? "የኩባንያ ማዋቀር" : language === "ti" ? "ምድላው ትካል" : "Company setup";
  const controlsLabel = language === "am" ? "የምርት ደህንነት" : language === "ti" ? "ድሕነት ፕሮዳክሽን" : "Production controls";
  const eInvoiceLabel = language === "am" ? "ኤሌክትሮኒክ ደረሰኝ" : language === "ti" ? "ኤሌክትሮኒካዊ ፋክቱር" : "Electronic invoicing";

  const navGroups = [
    {
      label: sections.core,
      items: [
        { label: d.nav.overview, href: "/" },
        { label: d.nav.modules, href: "/modules" },
        { label: d.nav.finance, href: "/finance" },
        { label: d.nav.sales, href: "/sales" },
        { label: eInvoiceLabel, href: "/e-invoicing" },
        { label: setupLabel, href: "/onboarding" },
      ],
    },
    {
      label: sections.phase1,
      items: [
        { label: dictionary.moduleItems["purchasing-expenses"].shortTitle, href: "/purchasing" },
        { label: dictionary.moduleItems["inventory-warehouse"].shortTitle, href: "/inventory" },
        { label: dictionary.moduleItems["customers-suppliers"].shortTitle, href: "/modules/customers-suppliers" },
        { label: dictionary.moduleItems["human-resources-payroll"].shortTitle, href: "/hr" },
        { label: controlsLabel, href: "/security" },
        { label: dictionary.moduleItems["reports-analytics"].shortTitle, href: "/modules/reports-analytics" },
      ],
    },
    {
      label: sections.phase2,
      items: [
        { label: dictionary.moduleItems["localization-compliance"].shortTitle, href: "/modules/localization-compliance" },
        { label: dictionary.moduleItems["fixed-assets"].shortTitle, href: "/modules/fixed-assets" },
        { label: dictionary.moduleItems["budgeting-projects"].shortTitle, href: "/modules/budgeting-projects" },
        { label: dictionary.moduleItems["integrations-automation"].shortTitle, href: "/modules/integrations-automation" },
      ],
    },
  ];

  const requiresVerification = user.mfaRequired && user.aal !== "aal2" && pathname !== "/account";
  const gatedContent = requiresVerification ? (
    <main className="mfa-required-page">
      <section className="mfa-required-card">
        <span className="mfa-required-icon">◉</span>
        <p className="eyebrow">PRIVILEGED SESSION REQUIRED</p>
        <h1>Verify administrator access</h1>
        <p>HisabTech now requires authenticator MFA before an owner or administrator can change financial, inventory, payroll, user or security data.</p>
        <div className="mfa-required-actions"><Link className="primary action-link" href="/account">Set up or verify MFA</Link><Link className="secondary action-link" href="/onboarding">Review setup progress</Link></div>
        <small>Your organization data remains readable. Write operations are blocked at both the application and database layers until the session reaches AAL2.</small>
      </section>
    </main>
  ) : children;

  return (
    <div className="erp-shell" data-layout-version="production-controls-v1">
      <UserMenu user={user} />
      <aside className="sidebar" data-docked="true">
        <div className="brand"><span>H</span><div><strong>Hisab</strong><small>{d.brandSubtitle}</small></div></div>
        <div className="sidebar-preferences"><LanguageSelector compact /><ThemeToggle /></div>
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
        <div className="sidebar-dock-status" aria-label="Navigation is docked"><span aria-hidden="true">●</span><strong>{language === "am" ? "ምናሌው ተቆልፏል" : language === "ti" ? "ምናሌ ተሰኪሉ" : "Navigation docked"}</strong></div>
        <footer className="sidebar-footer">
          <p className="powered-by">Powered by <a href="https://www.hisabtechnologies.com" target="_blank" rel="noopener noreferrer">HisabTech</a></p>
          <p>{user.organizationName}<br />Addis Ababa, Ethiopia</p>
        </footer>
      </aside>
      <div className="workspace" id="workspace-content" ref={workspaceRef}>{gatedContent}</div>
    </div>
  );
}
