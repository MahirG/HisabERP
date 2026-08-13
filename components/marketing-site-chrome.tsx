"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuScale, Search, Xmark } from "iconoir-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Locale = "en" | "am";
type NavigationItem = { label: string; href: string };
type NavigationGroup = { id: "product" | "solutions" | "resources" | "company"; label: string; items: NavigationItem[] };

const copy = {
  en: {
    navigation: "Main navigation", pricing: "Pricing", search: "Search", searchTitle: "Search Biloo",
    searchPlaceholder: "Search products and resources", noResults: "No matching pages found.", signIn: "Sign in",
    startFree: "Start free", openMenu: "Open menu", closeMenu: "Close menu", language: "Language",
    footerIntro: "One secure business operating system for Ethiopian companies that want clearer operations and better decisions.",
    product: "Product", resources: "Learn & implement", company: "Company & trust", rights: "All rights reserved.",
    location: "Addis Ababa, Ethiopia",
  },
  am: {
    navigation: "ዋና አሰሳ", pricing: "ዋጋ", search: "ፈልግ", searchTitle: "Biloo ፈልግ",
    searchPlaceholder: "ምርቶችን እና መረጃዎችን ፈልግ", noResults: "ተዛማጅ ገጽ አልተገኘም።", signIn: "ግባ",
    startFree: "በነፃ ይጀምሩ", openMenu: "ምናሌ ክፈት", closeMenu: "ምናሌ ዝጋ", language: "ቋንቋ",
    footerIntro: "ለግልጽ አሰራር እና ለተሻለ ውሳኔ የተገነባ የኢትዮጵያ ንግድ ስርዓት።",
    product: "ምርት", resources: "ይማሩ እና ይተግብሩ", company: "ኩባንያ እና እምነት", rights: "መብቶቹ ሁሉ የተጠበቁ ናቸው።",
    location: "አዲስ አበባ፣ ኢትዮጵያ",
  },
} as const;

const navigationGroups: NavigationGroup[] = [
  { id: "product", label: "Product", items: [
    { label: "Product overview", href: "/product-tour" },
    { label: "Finance & accounting", href: "/product/finance-cashflow" },
    { label: "Sales & invoicing", href: "/product/sales-invoicing" },
    { label: "Inventory & procurement", href: "/product/inventory" },
    { label: "Reports & analytics", href: "/product/reports-analytics" },
  ] },
  { id: "solutions", label: "Solutions", items: [
    { label: "ERP for Ethiopia", href: "/ethiopia" },
    { label: "Industry solutions", href: "/industries" },
    { label: "Data migration", href: "/migration" },
    { label: "Integrations", href: "/integrations" },
    { label: "Customer stories", href: "/customer-stories" },
  ] },
  { id: "resources", label: "Resources", items: [
    { label: "Learning center", href: "/resources" },
    { label: "Help Center", href: "/help-center" },
    { label: "ERP comparisons", href: "/compare" },
    { label: "Trust Center", href: "/trust" },
    { label: "Book a walkthrough", href: "/request-demo" },
  ] },
  { id: "company", label: "Company", items: [
    { label: "About Biloo", href: "/about" },
    { label: "Trust & security", href: "/trust" },
    { label: "Contact", href: "mailto:mahir@hisabtech.com" },
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
  const data = [
    {
      "@context": "https://schema.org", "@type": "Organization", name: "Biloo", url: "https://www.hisabtech.com",
      logo: "https://www.hisabtech.com/hisab-logo.svg", email: "mahir@hisabtech.com", telephone: "+251924093037",
      address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
    },
    {
      "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Biloo ERP",
      applicationCategory: "BusinessApplication", operatingSystem: "Web", url: "https://www.hisabtech.com",
      description: "A business operating system for Ethiopian organizations.",
      offers: { "@type": "AggregateOffer", priceCurrency: "ETB", lowPrice: "1500", offerCount: "4" },
      provider: { "@type": "Organization", name: "Biloo" },
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function MarketingHeader() {
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locale, setLocale] = useState<Locale>("en");
  const c = copy[locale];

  const filteredSearchItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchItems.slice(0, 8);
    return searchItems.filter((item) => item.label.toLowerCase().includes(normalized)).slice(0, 10);
  }, [query]);

  useEffect(() => {
    document.body.dataset.publicMarketing = "true";
    try {
      const storedLocale = window.localStorage.getItem("biloo-public-language");
      const nextLocale: Locale = storedLocale === "am" ? "am" : "en";
      setLocale(nextLocale);
      document.documentElement.dataset.publicLanguage = nextLocale;
      document.documentElement.dataset.publicTheme = "light";
    } catch {
      document.documentElement.dataset.publicLanguage = "en";
      document.documentElement.dataset.publicTheme = "light";
    }
    return () => { delete document.body.dataset.publicMarketing; };
  }, []);

  useEffect(() => {
    setMobileOpen(false); setSearchOpen(false); setQuery("");
  }, [pathname]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const returnTarget = searchOpen ? searchTriggerRef.current : mobileOpen ? menuToggleRef.current : null;
        setMobileOpen(false);
        setSearchOpen(false);
        window.requestAnimationFrame(() => returnTarget?.focus());
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditing = Boolean(target?.closest("input, textarea, select, [contenteditable='true']"));
      const keyboardSearch = (event.key === "/" && !isEditing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k");
      if (!keyboardSearch) return;

      event.preventDefault();
      setMobileOpen(false);
      setSearchOpen(true);
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen, searchOpen]);

  const openSearch = () => {
    setMobileOpen(false);
    setSearchOpen(true);
  };

  const changeLocale = () => {
    const nextLocale: Locale = locale === "en" ? "am" : "en";
    setLocale(nextLocale);
    document.documentElement.dataset.publicLanguage = nextLocale;
    try { window.localStorage.setItem("biloo-public-language", nextLocale); } catch {}
  };

  return (
    <>
      <a href="#public-main-content" className="wb-skip-link">Skip to main content</a>
      <header className="wb-header">
        <div className="wb-header-inner">
          <Link href="/" className="wb-brand" aria-label="Biloo home"><img src="/biloo-header-logo.svg" alt="Biloo" width="112" height="56" /></Link>
          <button ref={searchTriggerRef} type="button" className="wb-search-trigger" aria-label={c.searchTitle} aria-haspopup="dialog" aria-expanded={searchOpen} aria-controls="wb-site-search" onClick={openSearch}><Search width={19} height={19} strokeWidth={1.7} aria-hidden /><span className="wb-search-label">{c.searchPlaceholder}</span><kbd className="wb-search-shortcut" aria-hidden="true">/</kbd></button>
          <button ref={menuToggleRef} type="button" className="wb-mobile-toggle" aria-label={mobileOpen ? c.closeMenu : c.openMenu} aria-expanded={mobileOpen} aria-controls="wb-site-navigation" onClick={() => { setSearchOpen(false); setMobileOpen((current) => !current); }}>{mobileOpen ? <Xmark width={21} height={21} strokeWidth={1.7} aria-hidden /> : <MenuScale width={22} height={22} strokeWidth={1.7} aria-hidden />}<span className="wb-visually-hidden">{mobileOpen ? c.closeMenu : c.openMenu}</span></button>
        </div>
      </header>

      <div className={`wb-search-overlay${searchOpen ? " is-open" : ""}`} aria-hidden={!searchOpen}>
        <button type="button" className="wb-overlay-backdrop" aria-label="Close search" onClick={() => setSearchOpen(false)} />
        <section id="wb-site-search" className="wb-search-panel" role="dialog" aria-modal="true" aria-label={c.searchTitle}>
          <header><div><span>{c.search}</span><h2>{c.searchTitle}</h2></div><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><Xmark width={19} height={19} strokeWidth={1.6} aria-hidden /></button></header>
          <label className="wb-search-field"><span className="wb-visually-hidden">{c.searchPlaceholder}</span><input ref={searchInputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c.searchPlaceholder} autoComplete="off" /></label>
          <div className="wb-search-results">{filteredSearchItems.length ? filteredSearchItems.map((item) => <Link href={item.href} key={`${item.href}-${item.label}`} onClick={() => setSearchOpen(false)}>{item.label}</Link>) : <p className="wb-no-results">{c.noResults}</p>}</div>
        </section>
      </div>

      <div className={`wb-mobile-drawer${mobileOpen ? " is-open" : ""}`} aria-hidden={!mobileOpen}>
        <button type="button" className="wb-overlay-backdrop" aria-label={c.closeMenu} onClick={() => setMobileOpen(false)} />
        <aside id="wb-site-navigation" className="wb-mobile-panel" role="dialog" aria-modal="true" aria-label={c.navigation}>
          <header><Link href="/" onClick={() => setMobileOpen(false)}><img src="/biloo-header-logo.svg" alt="Biloo" width="106" height="52" /></Link><button type="button" onClick={() => setMobileOpen(false)} aria-label={c.closeMenu}><Xmark width={19} height={19} strokeWidth={1.6} aria-hidden /></button></header>
          <button type="button" className="wb-mobile-search" onClick={openSearch}><Search width={17} height={17} strokeWidth={1.6} aria-hidden /><span>{c.searchPlaceholder}</span></button>
          <nav className="wb-mobile-navigation">
            {navigationGroups.map((group) => <details key={group.id}><summary>{group.label}</summary><div>{group.items.map((item) => <Link href={item.href} key={`${group.id}-${item.href}-${item.label}`} aria-current={routeMatches(pathname, item.href) ? "page" : undefined} onClick={() => setMobileOpen(false)}>{item.label}</Link>)}</div></details>)}
            <Link href="/pricing" aria-current={routeMatches(pathname, "/pricing") ? "page" : undefined} onClick={() => setMobileOpen(false)}>{c.pricing}</Link>
          </nav>
          <div className="wb-mobile-utilities"><Link href="/help-center" onClick={() => setMobileOpen(false)}>Help Center</Link><Link href="/account" onClick={() => setMobileOpen(false)}>Account</Link><button type="button" onClick={changeLocale}>{c.language}: {locale === "en" ? "English" : "አማርኛ"}</button></div>
          <div className="wb-mobile-actions"><Link href="/auth/login?next=%2F" onClick={() => setMobileOpen(false)}>{c.signIn}</Link><Link href="/auth/email-sign-up" onClick={() => setMobileOpen(false)}>{c.startFree}</Link></div>
        </aside>
      </div>
    </>
  );
}

export function MarketingFooter() {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    try { setLocale(window.localStorage.getItem("biloo-public-language") === "am" ? "am" : "en"); } catch { setLocale("en"); }
  }, []);
  const c = copy[locale];
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-top">
        <div><Link href="/" className="marketing-brand marketing-footer-brand"><img src="/biloo-header-logo.svg" alt="Biloo" width="108" height="54" /><span className="marketing-brand-copy"><strong>Biloo</strong><small>Business operating system</small></span></Link><p>{c.footerIntro}</p><a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a><a href="tel:+251924093037">+251 924 093 037</a></div>
        <div><strong>{c.product}</strong><Link href="/product-tour">Product tour</Link><Link href="/product/sales-invoicing">Sales & invoicing</Link><Link href="/product/finance-cashflow">Finance & cash flow</Link><Link href="/product/inventory">Inventory</Link><Link href="/pricing">{c.pricing}</Link></div>
        <div><strong>{c.resources}</strong><Link href="/resources">Learning center</Link><Link href="/migration">Data migration</Link><Link href="/compare">ERP comparisons</Link><Link href="/help-center">Help Center</Link><Link href="/customer-stories">Customer stories</Link></div>
        <div><strong>{c.company}</strong><Link href="/about">About Biloo</Link><Link href="/trust">Trust Center</Link><Link href="/integrations">Integrations</Link><Link href="/auth/login">{c.signIn}</Link><a href="mailto:mahir@hisabtech.com?subject=Biloo%20security%20question">Security contact</a></div>
      </div>
      <div className="marketing-footer-bottom"><span>© {new Date().getFullYear()} Biloo. {c.rights}</span><span>{c.location}</span></div>
    </footer>
  );
}

export function MarketingPageShell({ children }: { children: ReactNode }) {
  return <div className="marketing-site marketing-site-v2 marketing-editorial-v1"><MarketingStructuredData /><MarketingHeader /><main id="public-main-content">{children}</main><MarketingFooter /></div>;
}
