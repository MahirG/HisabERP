"use client";

import { MarketingLink as Link } from "./marketing-link";
import { usePathname } from "next/navigation";
import { NavArrowDown, Search, Xmark } from "iconoir-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useModalFocus } from "./use-modal-focus";
import { MarketingLegalFooter } from "./marketing-legal-suite";
import { siteIdentity } from "../lib/site-identity";
import { SeoJsonLd } from "./seo-json-ld";

type MenuId = "product" | "solutions" | "resources" | "company";
type NavigationItem = { label: string; href: string };
type NavigationGroup = { id: MenuId; label: string; items: NavigationItem[] };

const copy = {
  en: {
    navigation: "Main navigation", pricing: "Pricing", search: "Search", searchTitle: "Search Biloo",
    searchPlaceholder: "Search products and resources", noResults: "No matching pages found.", signIn: "Sign in",
    startFree: "Get Started", openMenu: "Open menu", closeMenu: "Close menu", language: "Language",
    footerIntro: "Biloo is the connected Business Operating System by Hisab Technologies — built to help Ethiopian businesses manage operations with clarity.",
    product: "Product", resources: "Learn & implement", company: "Company & trust", rights: "All rights reserved.",
    location: "Addis Ababa, Ethiopia",
  },
} as const;

const navigationGroups: NavigationGroup[] = [
  { id: "product", label: "Products", items: [
    { label: "Biloo ERP", href: "/product-tour" },
    { label: "Explore ERP modules", href: "/#ah-module-title" },
    { label: "Sales & invoicing", href: "/product/sales-invoicing" },
    { label: "Finance & accounting", href: "/product/finance-cashflow" },
    { label: "Inventory & procurement", href: "/product/inventory" },
    { label: "Reports & analytics", href: "/product/reports-analytics" },
  ] },
  { id: "solutions", label: "Solutions", items: [
    { label: "ERP for Ethiopia", href: "/ethiopia" },
    { label: "Retail", href: "/industries/retail" },
    { label: "Restaurants & hospitality", href: "/industries/restaurants-hospitality" },
    { label: "Multi-branch businesses", href: "/industries" },
    { label: "Customer stories", href: "/customer-stories" },
  ] },
  { id: "resources", label: "Resources & support", items: [
    { label: "Resource center", href: "/resources" },
    { label: "Help Center", href: "/help-center" },
    { label: "ERP comparisons", href: "/compare" },
    { label: "Biloo vs Odoo", href: "/compare/biloo-vs-odoo" },
    { label: "ERP implementation costs", href: "/resources/erp-costs-ethiopia" },
    { label: "Data migration", href: "/migration" },
    { label: "Book a walkthrough", href: "/request-demo" },
  ] },
  { id: "company", label: "Company", items: [
    { label: "About Biloo", href: "/about" },
    { label: "Hisab Technologies services", href: "/services" },
    { label: "Trust & security", href: "/trust" },
    { label: "Integrations", href: "/integrations" },
    { label: "Contact us", href: "/request-demo?source=contact" },
  ] },
];

const searchItems: NavigationItem[] = [
  { label: "Biloo ERP overview", href: "/" },
  ...navigationGroups.flatMap((group) => group.items),
  { label: "Pricing", href: "/pricing" },
  { label: "Sign in", href: "/auth/login?next=%2F" },
];

function routeMatches(pathname: string, href: string) {
  if (href.startsWith("mailto:")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MarketingStructuredData() {
  return <SeoJsonLd data={siteIdentity} />;
}

export function MarketingHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchModalRef = useRef<HTMLElement>(null);
  const menuModalRef = useRef<HTMLElement>(null);
  useModalFocus(mobileOpen ? menuModalRef : searchModalRef, mobileOpen ? "menu" : searchOpen ? "search" : null);
  const mobilePanelId = "biloo-mobile-navigation-panel";
  const c = copy.en;

  const filteredSearchItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchItems.slice(0, 8);
    return searchItems.filter((item) => item.label.toLowerCase().includes(normalized)).slice(0, 10);
  }, [query]);

  useEffect(() => {
    document.body.dataset.publicMarketing = "true";
    document.documentElement.dataset.publicLanguage = "en";
    document.documentElement.lang = "en";
    document.documentElement.dataset.publicTheme = "light";
    try { window.localStorage.setItem("biloo-public-language", "en"); } catch {}
    return () => { delete document.body.dataset.publicMarketing; };
  }, []);

  useEffect(() => {
    setOpenMenu(null); setMobileOpen(false); setSearchOpen(false); setQuery("");
  }, [pathname]);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      headerRef.current?.querySelector<HTMLButtonElement>(".wb-nav-group.is-open > button")?.focus({ preventScroll: true });
      setOpenMenu(null); setMobileOpen(false); setSearchOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeEscape);
    };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeMobileOnDesktop = () => { if (desktop.matches) setMobileOpen(false); };
    desktop.addEventListener("change", closeMobileOnDesktop);
    return () => desktop.removeEventListener("change", closeMobileOnDesktop);
  }, []);

  useEffect(() => {
    if (searchOpen) window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    const locked = mobileOpen || searchOpen;
    document.documentElement.classList.toggle("wb-modal-open", locked);
    document.body.classList.toggle("wb-modal-open", locked);
    return () => {
      document.documentElement.classList.remove("wb-modal-open");
      document.body.classList.remove("wb-modal-open");
    };
  }, [mobileOpen, searchOpen]);


  return (
    <>
      <span className="wb-scroll-sentinel" aria-hidden="true" /><a href="#public-main-content" className="wb-skip-link">Skip to main content</a>
      <header ref={headerRef} className="wb-header">
        <div className="wb-utility-bar">
          <div className="wb-utility-inner">
            <div className="wb-utility-left">
              <Link href="/resources">Resources</Link>
              <Link href="/help-center">Help Center</Link>
              <Link href="/about">About Biloo</Link>
            </div>
          </div>
        </div>
        <div className="wb-header-inner">
          <Link href="/" className="wb-brand" aria-label="Biloo by Hisab Technologies — home"><img src="/biloo-header-logo-white.svg" alt="Biloo" width="112" height="56" /><span className="wb-brand-parent">by Hisab Technologies</span></Link>
          <nav className="wb-primary-nav" aria-label={c.navigation}>
            {navigationGroups.map((group) => {
              const open = openMenu === group.id;
              const active = group.items.some((item) => routeMatches(pathname, item.href));
              return (
                <div className={`wb-nav-group${open ? " is-open" : ""}`} key={group.id}>
                  <button type="button" aria-expanded={open} aria-haspopup="menu" className={active ? "is-active" : undefined} onClick={() => setOpenMenu((current) => current === group.id ? null : group.id)}>{group.label}<NavArrowDown width={14} height={14} strokeWidth={1.6} aria-hidden /></button>
                  <div className="wb-dropdown" role="menu" aria-hidden={!open}>
                    {group.items.map((item) => <Link href={item.href} key={`${group.id}-${item.href}-${item.label}`} role="menuitem" aria-current={routeMatches(pathname, item.href) ? "page" : undefined} onClick={() => setOpenMenu(null)}>{item.label}</Link>)}
                  </div>
                </div>
              );
            })}
            <Link href="/pricing" className={routeMatches(pathname, "/pricing") ? "is-active" : undefined}>{c.pricing}</Link>
          </nav>
          <div className="wb-header-actions">
            <button type="button" className="wb-search-trigger" onClick={() => setSearchOpen(true)}><Search width={17} height={17} strokeWidth={1.6} aria-hidden /><span>{c.search}</span></button>
            <Link prefetch={false} href="/auth/login?next=%2F" className="wb-sign-in">{c.signIn}</Link>
            <Link prefetch={false} href="/auth/email-sign-up" className="wb-primary-action">{c.startFree}</Link>
            <button type="button" className="wb-mobile-toggle" aria-label={mobileOpen ? c.closeMenu : c.openMenu} aria-expanded={mobileOpen} aria-controls={mobilePanelId} onClick={() => { setOpenMenu(null); setSearchOpen(false); setMobileOpen((current) => !current); }}>
              <span className="wb-mobile-toggle-icon" aria-hidden="true"><i /><i /><i /></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`wb-search-overlay${searchOpen ? " is-open" : ""}`} aria-hidden={!searchOpen} inert={!searchOpen ? true : undefined}>
        <button type="button" className="wb-overlay-backdrop" aria-label="Close search" onClick={() => setSearchOpen(false)} />
        <section ref={searchModalRef} tabIndex={-1} className="wb-search-panel" role="dialog" aria-modal="true" aria-label={c.searchTitle}>
          <header><div><span>{c.search}</span><h2>{c.searchTitle}</h2></div><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><Xmark width={19} height={19} strokeWidth={1.6} aria-hidden /></button></header>
          <label className="wb-search-field"><span className="wb-visually-hidden">{c.searchPlaceholder}</span><input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c.searchPlaceholder} autoComplete="off" /></label>
          <div className="wb-search-results">{filteredSearchItems.length ? filteredSearchItems.map((item) => <Link prefetch={item.href.startsWith("/auth/") ? false : undefined} href={item.href} key={`${item.href}-${item.label}`} onClick={() => setSearchOpen(false)}>{item.label}</Link>) : <p className="wb-no-results">{c.noResults}</p>}</div>
        </section>
      </div>

      <div className={`wb-mobile-drawer${mobileOpen ? " is-open" : ""}`} aria-hidden={!mobileOpen} inert={!mobileOpen ? true : undefined}>
        <button type="button" className="wb-overlay-backdrop" aria-label={c.closeMenu} onClick={() => setMobileOpen(false)} />
        <aside ref={menuModalRef} tabIndex={-1} id={mobilePanelId} className="wb-mobile-panel" role="dialog" aria-modal="true" aria-label={c.navigation}>
          <header className="wb-mobile-panel-header">
            <Link href="/" className="wb-mobile-brand" aria-label="Biloo home" onClick={() => setMobileOpen(false)}>
              <img src="/biloo-header-logo-white.svg" alt="Biloo" width="106" height="52" />
            </Link>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label={c.closeMenu}>
              <Xmark width={23} height={23} strokeWidth={1.8} aria-hidden />
            </button>
          </header>
          <div className="wb-mobile-content">
            <button type="button" className="wb-mobile-search" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>
              <Search width={18} height={18} strokeWidth={1.7} aria-hidden />
              <span>{c.searchPlaceholder}</span>
            </button>
            <nav className="wb-mobile-navigation" aria-label={c.navigation}>
              {navigationGroups.map((group) => {
                const active = group.items.some((item) => routeMatches(pathname, item.href));
                return (
                  <details key={group.id} className={active ? "is-active" : undefined}>
                    <summary>{group.label}<NavArrowDown width={17} height={17} strokeWidth={1.7} aria-hidden /></summary>
                    <div>{group.items.map((item) => <Link href={item.href} key={group.id + "-" + item.href + "-" + item.label} aria-current={routeMatches(pathname, item.href) ? "page" : undefined} onClick={() => setMobileOpen(false)}>{item.label}</Link>)}</div>
                  </details>
                );
              })}
              <Link href="/pricing" className={routeMatches(pathname, "/pricing") ? "is-active" : undefined} onClick={() => setMobileOpen(false)}>{c.pricing}</Link>
            </nav>
            <div className="wb-mobile-utilities">
              <Link href="/help-center" onClick={() => setMobileOpen(false)}>Help Center</Link>
              <Link prefetch={false} href="/account" onClick={() => setMobileOpen(false)}>Account</Link>
            </div>
          </div>
          <div className="wb-mobile-actions">
            <Link prefetch={false} href="/auth/login?next=%2F" onClick={() => setMobileOpen(false)}>{c.signIn}</Link>
            <Link prefetch={false} href="/auth/email-sign-up" onClick={() => setMobileOpen(false)}>{c.startFree}</Link>
          </div>
        </aside>
      </div>
    </>
  );
}

export function MarketingFooter() {
  const c = copy.en;

  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-top">
        <div className="marketing-footer-brand-column">
          <Link href="/" className="marketing-brand marketing-footer-brand" aria-label="Biloo by Hisab Technologies home">
            <img src="/biloo-header-logo.svg" alt="Biloo" width="108" height="54" />
          </Link>
          <span className="hisab-footer-signature">A product of <strong>Hisab Technologies</strong></span>
          <p>{c.footerIntro}</p>
          <div className="marketing-footer-contact">
            <a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a>
            <a href="tel:+251924093037">+251 924 093 037</a>
            <span>{c.location}</span>
          </div>
        </div>

        <nav className="marketing-footer-column" aria-label="Solutions">
          <strong>Solutions</strong>
          <Link href="/ethiopia">ERP for Ethiopia</Link>
          <Link href="/industries/retail">Retail</Link>
          <Link href="/industries/restaurants-hospitality">Restaurants & hospitality</Link>
          <Link href="/industries">Industry solutions</Link>
          <Link href="/customer-stories">Customer stories</Link>
        </nav>

        <nav className="marketing-footer-column" aria-label="Products">
          <strong>Products</strong>
          <Link href="/product-tour">Biloo ERP</Link>
          <Link href="/product/sales-invoicing">Sales & invoicing</Link>
          <Link href="/product/finance-cashflow">Finance & accounting</Link>
          <Link href="/product/inventory">Inventory & procurement</Link>
          <Link href="/product/reports-analytics">Reports & analytics</Link>
        </nav>

        <nav className="marketing-footer-column" aria-label="Resources and support">
          <strong>Resources & support</strong>
          <Link href="/resources">Resource center</Link>
          <Link href="/help-center">Help Center</Link>
          <Link href="/compare">ERP comparisons</Link>
          <Link href="/migration">Data migration</Link>
          <Link href="/request-demo">Book a walkthrough</Link>
        </nav>

        <nav className="marketing-footer-column" aria-label="Company">
          <strong>Company</strong>
          <Link href="/about">About Biloo</Link>
          <Link href="/services">Hisab Technologies services</Link>
          <Link href="/pricing">{c.pricing}</Link>
          <Link href="/integrations">Integrations</Link>
          <Link href="/trust">Trust & security</Link>
          <Link href="/request-demo?source=contact">Contact us</Link>
        </nav>
      </div>

      <div className="marketing-footer-bottom">
        <span>© {new Date().getFullYear()} Hisab Technologies · Biloo. {c.rights}</span>
        <div className="marketing-footer-legal">
          <Link href="/trust">Trust & security</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/help-center">Help</Link>
          <a className="marketing-powered-by" data-powered-by-hisab="true" href="https://hisabtechnologies.com" rel="noopener noreferrer">Powered by hisabtechnologies.com</a>
        </div>
      </div>
      <MarketingLegalFooter />
    </footer>
  );
}
export function MarketingPageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  // One public shell owns the only marketing header and footer on every page.
  // Do not add a separate fixed-header spacer: the header is sticky and in flow.
  return <div className={`marketing-site marketing-site-v2 marketing-editorial-v1${className ? ` ${className}` : ""}`}><MarketingStructuredData /><MarketingHeader /><main id="public-main-content">{children}</main><MarketingFooter /></div>;
}
