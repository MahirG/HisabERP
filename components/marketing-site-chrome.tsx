"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Locale = "en" | "am";
type Theme = "light" | "dark";
type MenuId = "product" | "solutions" | "resources" | "company" | "account" | "language";
type IconName = "search" | "grid" | "user" | "help" | "globe" | "sun" | "moon" | "menu" | "close" | "arrow" | "chevron" | "shield" | "login" | "plus";

type NavigationItem = {
  label: string;
  note: string;
  href: string;
  icon?: IconName;
};

type NavigationGroup = {
  id: Exclude<MenuId, "account" | "language">;
  label: string;
  title: string;
  description: string;
  items: NavigationItem[];
};

const copy = {
  en: {
    nav: "Main navigation",
    product: "Product",
    solutions: "Solutions",
    resources: "Resources",
    company: "Company",
    pricing: "Pricing",
    search: "Search",
    dashboard: "Dashboard",
    account: "Account",
    help: "Help Center",
    language: "Language",
    theme: "Color mode",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    searchTitle: "Search Biloo",
    searchIntro: "Find products, business guides, implementation resources and support.",
    searchPlaceholder: "Search pages and resources",
    quickLinks: "Quick links",
    noResults: "No matching pages found.",
    signIn: "Sign in",
    createAccount: "Create account",
    accountSecurity: "Account & security",
    light: "Light",
    dark: "Dark",
    english: "English",
    amharic: "Amharic",
    mobileTitle: "Explore Biloo",
    mobileIntro: "Everything you need to evaluate, launch and operate Biloo ERP.",
    bookDemo: "Book a demo",
    emailSupport: "Email support",
    footerIntro: "One secure business operating system for Ethiopian companies that want clearer operations and better decisions.",
    productMarket: "Product",
    learnImplement: "Learn & implement",
    companyTrust: "Company & trust",
    rights: "All rights reserved.",
    location: "Addis Ababa, Ethiopia",
  },
  am: {
    nav: "ዋና አሰሳ",
    product: "ምርት",
    solutions: "መፍትሄዎች",
    resources: "መረጃዎች",
    company: "ኩባንያ",
    pricing: "ዋጋ",
    search: "ፈልግ",
    dashboard: "ዳሽቦርድ",
    account: "መለያ",
    help: "የእገዛ ማዕከል",
    language: "ቋንቋ",
    theme: "የቀለም ሁኔታ",
    openMenu: "ምናሌ ክፈት",
    closeMenu: "ምናሌ ዝጋ",
    searchTitle: "Biloo ፈልግ",
    searchIntro: "ምርቶችን፣ የንግድ መመሪያዎችን፣ የትግበራ መረጃዎችን እና ድጋፍን ያግኙ።",
    searchPlaceholder: "ገጾችን እና መረጃዎችን ፈልግ",
    quickLinks: "ፈጣን አገናኞች",
    noResults: "ተዛማጅ ገጽ አልተገኘም።",
    signIn: "ግባ",
    createAccount: "መለያ ፍጠር",
    accountSecurity: "መለያ እና ደህንነት",
    light: "ብርሃን",
    dark: "ጨለማ",
    english: "English",
    amharic: "አማርኛ",
    mobileTitle: "Bilooን ያስሱ",
    mobileIntro: "Biloo ERPን ለመገምገም፣ ለማስጀመር እና ለመጠቀም የሚያስፈልግዎት ሁሉ።",
    bookDemo: "ዴሞ ይያዙ",
    emailSupport: "ኢሜይል ድጋፍ",
    footerIntro: "ለግልጽ አሰራር እና ለተሻለ ውሳኔ የተገነባ የኢትዮጵያ ንግድ ስርዓት።",
    productMarket: "ምርት",
    learnImplement: "ይማሩ እና ይተግብሩ",
    companyTrust: "ኩባንያ እና እምነት",
    rights: "መብቶቹ ሁሉ የተጠበቁ ናቸው።",
    location: "አዲስ አበባ፣ ኢትዮጵያ",
  },
} as const;

const navigationGroups: NavigationGroup[] = [
  {
    id: "product",
    label: "Product",
    title: "One connected operating system",
    description: "Bring sales, finance, inventory and reporting into a single reliable workspace.",
    items: [
      { label: "Product tour", note: "See the complete workflow", href: "/product-tour", icon: "grid" },
      { label: "Sales & invoicing", note: "Quote, invoice and collect", href: "/product/sales-invoicing" },
      { label: "Finance & cash flow", note: "Understand your position", href: "/product/finance-cashflow" },
      { label: "Inventory control", note: "Track stock and movement", href: "/product/inventory" },
      { label: "Reports & analytics", note: "Turn records into decisions", href: "/product/reports-analytics" },
    ],
  },
  {
    id: "solutions",
    label: "Solutions",
    title: "Designed for real Ethiopian operations",
    description: "Choose the implementation path that matches your sector and operating model.",
    items: [
      { label: "ERP for Ethiopia", note: "Local workflows and context", href: "/ethiopia" },
      { label: "Industry solutions", note: "Sector-specific workflows", href: "/industries" },
      { label: "Data migration", note: "Move from spreadsheets safely", href: "/migration" },
      { label: "Integrations", note: "Connect your existing systems", href: "/integrations" },
      { label: "Customer stories", note: "See operating improvements", href: "/customer-stories" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    title: "Plan with confidence",
    description: "Use practical guidance and support resources before changing your business system.",
    items: [
      { label: "Business learning center", note: "Practical operating guides", href: "/resources" },
      { label: "Help Center", note: "Product and account guidance", href: "/help-center", icon: "help" },
      { label: "ERP comparisons", note: "Evaluate available options", href: "/compare" },
      { label: "Trust Center", note: "Security and reliability", href: "/trust", icon: "shield" },
      { label: "Book a demo", note: "Talk through your workflow", href: "/request-demo" },
    ],
  },
  {
    id: "company",
    label: "Company",
    title: "Built from Addis Ababa",
    description: "Meet the team behind Biloo and understand the product principles guiding each release.",
    items: [
      { label: "About Biloo", note: "Company and product direction", href: "/about" },
      { label: "Trust & security", note: "How business data is protected", href: "/trust", icon: "shield" },
      { label: "Contact admin", note: "Email Mahir directly", href: "mailto:mahir@hisabtech.com" },
      { label: "Create a workspace", note: "Start using Biloo", href: "/auth/email-sign-up", icon: "plus" },
    ],
  },
];

const searchItems: NavigationItem[] = [
  { label: "Biloo ERP overview", note: "Return to the main website", href: "/", icon: "grid" },
  ...navigationGroups.flatMap((group) => group.items),
  { label: "Pricing", note: "Plans and ETB pricing", href: "/pricing" },
  { label: "Dashboard", note: "Open your secure workspace", href: "/auth/login?next=%2F", icon: "grid" },
  { label: "Account", note: "Manage account and security", href: "/account", icon: "user" },
];

function routeMatches(pathname: string, href: string) {
  if (href.startsWith("mailto:")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/></svg>;
  if (name === "grid") return <svg {...common}><rect x="3.5" y="3.5" width="6" height="6" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx="1"/><rect x="14.5" y="14.5" width="6" height="6" rx="1"/></svg>;
  if (name === "user") return <svg {...common}><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>;
  if (name === "help") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 3.8 2.1c-1 .6-1.5 1.1-1.5 2.4"/><path d="M12 17h.01"/></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z"/></svg>;
  if (name === "sun") return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
  if (name === "moon") return <svg {...common}><path d="M20.5 15.2A8.4 8.4 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z"/></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5"/></svg>;
  if (name === "chevron") return <svg {...common}><path d="m8 10 4 4 4-4"/></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 3 5 6v5c0 4.5 2.7 7.6 7 10 4.3-2.4 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
  if (name === "login") return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/></svg>;
  return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
}

function MarketingStructuredData() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Biloo",
      url: "https://www.hisabtech.com",
      logo: "https://www.hisabtech.com/hisab-logo.svg",
      email: "mahir@hisabtech.com",
      telephone: "+251924093037",
      address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Biloo ERP",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.hisabtech.com",
      description: "A business operating system for Ethiopian organizations.",
      offers: { "@type": "AggregateOffer", priceCurrency: "ETB", lowPrice: "1500", offerCount: "4" },
      provider: { "@type": "Organization", name: "Biloo" },
    },
  ];

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function MarketingHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [locale, setLocaleState] = useState<Locale>("en");
  const c = copy[locale];

  const filteredSearchItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchItems.slice(0, 8);
    return searchItems.filter((item) => `${item.label} ${item.note}`.toLowerCase().includes(normalized)).slice(0, 10);
  }, [query]);

  useEffect(() => {
    document.body.dataset.publicMarketing = "true";

    try {
      const storedTheme = window.localStorage.getItem("biloo-public-theme");
      const storedLocale = window.localStorage.getItem("biloo-public-language");
      const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextTheme: Theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredDark ? "dark" : "light";
      const nextLocale: Locale = storedLocale === "am" ? "am" : "en";
      setTheme(nextTheme);
      setLocaleState(nextLocale);
      document.documentElement.dataset.publicTheme = nextTheme;
      document.documentElement.dataset.publicLanguage = nextLocale;
    } catch {
      document.documentElement.dataset.publicTheme = "light";
      document.documentElement.dataset.publicLanguage = "en";
    }

    return () => {
      delete document.body.dataset.publicMarketing;
    };
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
      setSearchOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeEscape);
    };
  }, []);

  useEffect(() => {
    const locked = mobileOpen || searchOpen;
    if (!locked) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  const changeTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    document.documentElement.dataset.publicTheme = nextTheme;
    try {
      window.localStorage.setItem("biloo-public-theme", nextTheme);
    } catch {
      // Storage may be unavailable in restricted contexts.
    }
  };

  const changeLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    setOpenMenu(null);
    document.documentElement.dataset.publicLanguage = nextLocale;
    try {
      window.localStorage.setItem("biloo-public-language", nextLocale);
    } catch {
      // Storage may be unavailable in restricted contexts.
    }
  };

  const toggleMenu = (menu: MenuId) => setOpenMenu((current) => current === menu ? null : menu);

  return (
    <>
      <link rel="stylesheet" href="/biloo-whitebit-header.css?v=20260805-1" />
      <a href="#public-main-content" className="wb-skip-link">Skip to main content</a>

      <header ref={headerRef} className="wb-header">
        <div className="wb-header-inner">
          <Link href="/" className="wb-brand" aria-label="Biloo home">
            <img src="/biloo-header-logo.svg" alt="Biloo" width="112" height="56" />
          </Link>

          <nav className="wb-primary-nav" aria-label={c.nav}>
            {navigationGroups.map((group) => {
              const open = openMenu === group.id;
              const active = group.items.some((item) => routeMatches(pathname, item.href));
              return (
                <div className={`wb-nav-group${open ? " is-open" : ""}`} key={group.id} onMouseEnter={() => setOpenMenu(group.id)} onMouseLeave={() => setOpenMenu(null)}>
                  <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => toggleMenu(group.id)} className={active ? "is-active" : undefined}>
                    <span>{group.label}</span><Icon name="chevron" size={14}/>
                  </button>
                  <div className="wb-mega-menu" aria-hidden={!open}>
                    <div className="wb-mega-intro">
                      <span>{group.label}</span>
                      <strong>{group.title}</strong>
                      <p>{group.description}</p>
                      <Link href="/request-demo" onClick={() => setOpenMenu(null)}>Book a demo <Icon name="arrow" size={16}/></Link>
                    </div>
                    <div className="wb-mega-links">
                      {group.items.map((item) => (
                        <Link href={item.href} key={item.href} onClick={() => setOpenMenu(null)} aria-current={routeMatches(pathname, item.href) ? "page" : undefined}>
                          <span className="wb-mega-icon">{item.icon ? <Icon name={item.icon}/> : <Icon name="arrow"/>}</span>
                          <span><strong>{item.label}</strong><small>{item.note}</small></span>
                          <Icon name="arrow" size={15}/>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <Link href="/pricing" className={routeMatches(pathname, "/pricing") ? "is-active" : undefined}>{c.pricing}</Link>
          </nav>

          <div className="wb-header-actions">
            <button type="button" className="wb-action-button wb-search-button" aria-label={c.search} onClick={() => setSearchOpen(true)}>
              <Icon name="search"/><span>{c.search}</span>
            </button>

            <Link href="/auth/login?next=%2F" className="wb-dashboard-button"><Icon name="grid" size={17}/><span>{c.dashboard}</span></Link>

            <div className={`wb-utility-menu${openMenu === "account" ? " is-open" : ""}`}>
              <button type="button" className="wb-icon-button" aria-label={c.account} aria-expanded={openMenu === "account"} onClick={() => toggleMenu("account")}><Icon name="user"/></button>
              <div className="wb-utility-popover wb-account-popover">
                <div><span>{c.account}</span><strong>Biloo workspace</strong></div>
                <Link href="/auth/login" onClick={() => setOpenMenu(null)}><Icon name="login"/><span><strong>{c.signIn}</strong><small>Open an existing workspace</small></span></Link>
                <Link href="/auth/email-sign-up" onClick={() => setOpenMenu(null)}><Icon name="plus"/><span><strong>{c.createAccount}</strong><small>Start a new workspace</small></span></Link>
                <Link href="/account" onClick={() => setOpenMenu(null)}><Icon name="shield"/><span><strong>{c.accountSecurity}</strong><small>Profile, MFA and security</small></span></Link>
              </div>
            </div>

            <Link href="/help-center" className="wb-icon-button" aria-label={c.help} title={c.help}><Icon name="help"/></Link>

            <div className={`wb-utility-menu${openMenu === "language" ? " is-open" : ""}`}>
              <button type="button" className="wb-icon-button wb-language-button" aria-label={c.language} aria-expanded={openMenu === "language"} onClick={() => toggleMenu("language")}><Icon name="globe"/><span>{locale.toUpperCase()}</span></button>
              <div className="wb-utility-popover wb-language-popover">
                <div><span>{c.language}</span><strong>Select language</strong></div>
                <button type="button" className={locale === "en" ? "is-selected" : undefined} onClick={() => changeLocale("en")}><span>EN</span><strong>{c.english}</strong></button>
                <button type="button" className={locale === "am" ? "is-selected" : undefined} onClick={() => changeLocale("am")}><span>አማ</span><strong>{c.amharic}</strong></button>
              </div>
            </div>

            <button type="button" className="wb-icon-button" aria-label={`${c.theme}: ${theme === "light" ? c.light : c.dark}`} onClick={() => changeTheme(theme === "light" ? "dark" : "light")}>
              <Icon name={theme === "light" ? "moon" : "sun"}/>
            </button>

            <button type="button" className="wb-mobile-toggle" aria-label={mobileOpen ? c.closeMenu : c.openMenu} aria-expanded={mobileOpen} onClick={() => setMobileOpen((current) => !current)}>
              <Icon name={mobileOpen ? "close" : "menu"} size={22}/>
            </button>
          </div>
        </div>
      </header>

      <div className={`wb-search-overlay${searchOpen ? " is-open" : ""}`} aria-hidden={!searchOpen}>
        <button type="button" className="wb-overlay-backdrop" aria-label="Close search" onClick={() => setSearchOpen(false)}/>
        <section className="wb-search-panel" role="dialog" aria-modal="true" aria-label={c.searchTitle}>
          <header>
            <div><span>{c.search}</span><h2>{c.searchTitle}</h2><p>{c.searchIntro}</p></div>
            <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><Icon name="close"/></button>
          </header>
          <label className="wb-search-field"><Icon name="search" size={21}/><input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c.searchPlaceholder} autoComplete="off"/><kbd>ESC</kbd></label>
          <div className="wb-search-results">
            <span>{query ? `${filteredSearchItems.length} results` : c.quickLinks}</span>
            {filteredSearchItems.length ? filteredSearchItems.map((item) => (
              <Link href={item.href} key={`${item.href}-${item.label}`} onClick={() => setSearchOpen(false)}>
                <span className="wb-search-result-icon"><Icon name={item.icon ?? "arrow"}/></span>
                <span><strong>{item.label}</strong><small>{item.note}</small></span>
                <Icon name="arrow"/>
              </Link>
            )) : <p className="wb-no-results">{c.noResults}</p>}
          </div>
        </section>
      </div>

      <div className={`wb-mobile-drawer${mobileOpen ? " is-open" : ""}`} aria-hidden={!mobileOpen}>
        <button type="button" className="wb-overlay-backdrop" aria-label={c.closeMenu} onClick={() => setMobileOpen(false)}/>
        <aside className="wb-mobile-panel" role="dialog" aria-modal="true" aria-label={c.nav}>
          <header>
            <Link href="/" onClick={() => setMobileOpen(false)}><img src="/biloo-header-logo.svg" alt="Biloo" width="106" height="52"/></Link>
            <button type="button" aria-label={c.closeMenu} onClick={() => setMobileOpen(false)}><Icon name="close"/></button>
          </header>

          <button type="button" className="wb-mobile-search" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}><Icon name="search"/><span>{c.searchPlaceholder}</span></button>

          <div className="wb-mobile-intro"><span>Biloo ERP</span><h2>{c.mobileTitle}</h2><p>{c.mobileIntro}</p></div>

          <nav className="wb-mobile-navigation">
            {navigationGroups.map((group) => (
              <details key={group.id}>
                <summary>{group.label}<Icon name="chevron"/></summary>
                <div>{group.items.map((item) => <Link href={item.href} key={item.href} onClick={() => setMobileOpen(false)}><span><strong>{item.label}</strong><small>{item.note}</small></span><Icon name="arrow"/></Link>)}</div>
              </details>
            ))}
            <Link href="/pricing" onClick={() => setMobileOpen(false)}><span><strong>{c.pricing}</strong><small>Plans and ETB pricing</small></span><Icon name="arrow"/></Link>
          </nav>

          <div className="wb-mobile-utilities">
            <Link href="/auth/login?next=%2F" className="wb-mobile-dashboard" onClick={() => setMobileOpen(false)}><Icon name="grid"/><span>{c.dashboard}</span></Link>
            <Link href="/account" onClick={() => setMobileOpen(false)}><Icon name="user"/><span>{c.account}</span></Link>
            <Link href="/help-center" onClick={() => setMobileOpen(false)}><Icon name="help"/><span>{c.help}</span></Link>
            <button type="button" onClick={() => changeLocale(locale === "en" ? "am" : "en")}><Icon name="globe"/><span>{locale === "en" ? c.amharic : c.english}</span></button>
            <button type="button" onClick={() => changeTheme(theme === "light" ? "dark" : "light")}><Icon name={theme === "light" ? "moon" : "sun"}/><span>{theme === "light" ? c.dark : c.light}</span></button>
          </div>

          <div className="wb-mobile-actions">
            <Link href="/request-demo" onClick={() => setMobileOpen(false)}>{c.bookDemo}</Link>
            <Link href="/auth/email-sign-up" onClick={() => setMobileOpen(false)}>{c.createAccount}</Link>
          </div>
        </aside>
      </div>
    </>
  );
}

export function MarketingFooter() {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    try {
      setLocale(window.localStorage.getItem("biloo-public-language") === "am" ? "am" : "en");
    } catch {
      setLocale("en");
    }
  }, []);
  const c = copy[locale];

  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-top">
        <div>
          <Link href="/" className="marketing-brand marketing-footer-brand"><img src="/biloo-header-logo.svg" alt="" width="108" height="54"/><span className="marketing-brand-copy"><strong>Biloo</strong><small>Business operating system</small></span></Link>
          <p>{c.footerIntro}</p>
          <a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a>
          <a href="tel:+251924093037">+251 924 093 037</a>
        </div>
        <div><strong>{c.productMarket}</strong><Link href="/product-tour">Product tour</Link><Link href="/product/sales-invoicing">Sales & invoicing</Link><Link href="/product/finance-cashflow">Finance & cash flow</Link><Link href="/product/inventory">Inventory</Link><Link href="/pricing">{c.pricing}</Link></div>
        <div><strong>{c.learnImplement}</strong><Link href="/resources">Learning center</Link><Link href="/migration">Data migration</Link><Link href="/compare">ERP comparisons</Link><Link href="/help-center">{c.help}</Link><Link href="/customer-stories">Customer stories</Link></div>
        <div><strong>{c.companyTrust}</strong><Link href="/about">About Biloo</Link><Link href="/trust">Trust Center</Link><Link href="/integrations">Integrations</Link><Link href="/auth/login">{c.signIn}</Link><a href="mailto:mahir@hisabtech.com?subject=Biloo%20security%20question">Security contact</a></div>
      </div>
      <div className="marketing-footer-bottom"><span>© {new Date().getFullYear()} Biloo. {c.rights}</span><span>{c.location}</span></div>
    </footer>
  );
}

export function MarketingPageShell({ children }: { children: ReactNode }) {
  return <main className="marketing-site marketing-site-v2"><MarketingStructuredData/><MarketingHeader/><div id="public-main-content">{children}</div><MarketingFooter/></main>;
}
