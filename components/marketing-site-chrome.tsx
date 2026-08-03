"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const websiteCopy = {
  subtitle: "Business operating system",
  navLabel: "Main navigation",
  product: "Product",
  solutions: "Solutions",
  resources: "Resources",
  company: "Company",
  pricing: "Pricing",
  signIn: "Sign in",
  demo: "Book a demo",
  start: "Start free",
  menu: "Open website menu",
  close: "Close website menu",
  menuEyebrow: "Biloo business operating system",
  menuTitle: "One clear system for running a growing business.",
  menuDescription: "Explore the product, implementation options and the workflows Biloo brings together.",
  footerIntro: "One secure English business workspace for Ethiopian companies that want clearer operations and better decisions.",
  productMarket: "Product and market",
  modules: "Product modules",
  ethiopia: "ERP built for Ethiopia",
  industrySolutions: "Industry solutions",
  pricingEtb: "Pricing in ETB",
  learnImplement: "Learn and implement",
  learningCenter: "Business Learning Center",
  dataMigration: "Data migration and onboarding",
  comparisons: "ERP comparisons",
  helpCenter: "Help Center",
  customerProof: "Customer proof",
  companyTrust: "Company and trust",
  aboutHisab: "About Biloo",
  trustCenter: "Trust Center",
  integrations: "Integrations",
  securityContact: "Security contact",
  rights: "All rights reserved.",
  location: "Addis Ababa, Ethiopia",
  skip: "Skip to main content",
} as const;

type MegaMenu = {
  id: "product" | "solutions" | "resources" | "company";
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  featured: { label: string; note: string; href: string };
  items: ReadonlyArray<{ label: string; note: string; href: string }>;
};

const megaMenus: ReadonlyArray<MegaMenu> = [
  {
    id: "product",
    label: "Product",
    eyebrow: "Connected platform",
    title: "Run the company from one reliable operating picture.",
    description: "Biloo connects the records, workflows and decisions that normally live across separate tools.",
    featured: { label: "Take the interactive product tour", note: "Explore the complete Biloo workflow", href: "/product-tour" },
    items: [
      { label: "Sales & invoicing", note: "Quote, invoice and collect", href: "/product/sales-invoicing" },
      { label: "Finance & cash flow", note: "Know the financial position now", href: "/product/finance-cashflow" },
      { label: "Inventory control", note: "Track stock, movement and risk", href: "/product/inventory" },
      { label: "Reports & analytics", note: "Turn records into decisions", href: "/product/reports-analytics" },
    ],
  },
  {
    id: "solutions",
    label: "Solutions",
    eyebrow: "Built for real operations",
    title: "A business system shaped around how Ethiopian teams work.",
    description: "Choose a path based on your sector, operating model and current implementation stage.",
    featured: { label: "ERP built for Ethiopia", note: "Local workflows, ETB and business context", href: "/ethiopia" },
    items: [
      { label: "Industry solutions", note: "Workflows for different sectors", href: "/industries" },
      { label: "Data migration", note: "Move from spreadsheets safely", href: "/migration" },
      { label: "Integrations", note: "Connect the systems you already use", href: "/integrations" },
      { label: "Customer stories", note: "See the operating change", href: "/customer-stories" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    eyebrow: "Learn and implement",
    title: "Make a confident ERP decision before changing the business.",
    description: "Use practical guidance, comparisons and support resources to plan the right implementation.",
    featured: { label: "Business learning center", note: "Guides for better operating discipline", href: "/resources" },
    items: [
      { label: "Help Center", note: "Product and account guidance", href: "/help-center" },
      { label: "ERP comparisons", note: "Evaluate the available approaches", href: "/compare" },
      { label: "Trust Center", note: "Security, privacy and reliability", href: "/trust" },
      { label: "Request a guided demo", note: "Discuss your current workflow", href: "/request-demo" },
    ],
  },
  {
    id: "company",
    label: "Company",
    eyebrow: "Hisab Technologies",
    title: "Building clearer business infrastructure from Addis Ababa.",
    description: "Meet the company behind Biloo and understand the principles guiding the product.",
    featured: { label: "About Biloo", note: "Our company, purpose and product direction", href: "/about" },
    items: [
      { label: "Trust & security", note: "How Biloo protects business data", href: "/trust" },
      { label: "Contact the team", note: "Talk with Hisab Technologies", href: "/request-demo" },
      { label: "Sign in", note: "Open your existing workspace", href: "/auth/login" },
      { label: "Create a workspace", note: "Start using Biloo", href: "/auth/email-sign-up" },
    ],
  },
];

const mobileSections = [
  {
    label: "Explore",
    items: [
      ["Product tour", "/product-tour"],
      ["Solutions", "/industries"],
      ["Pricing", "/pricing"],
      ["ERP for Ethiopia", "/ethiopia"],
    ],
  },
  {
    label: "Plan",
    items: [
      ["Migration", "/migration"],
      ["Resources", "/resources"],
      ["Help Center", "/help-center"],
      ["Compare ERP options", "/compare"],
    ],
  },
  {
    label: "Company",
    items: [
      ["About Biloo", "/about"],
      ["Trust Center", "/trust"],
      ["Integrations", "/integrations"],
    ],
  },
] as const;

function routeMatches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MarketingStructuredData() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Biloo",
      url: "https://www.hisabtech.com",
      logo: "https://www.hisabtech.com/hisab-logo.svg",
      email: "info@hisabtech.com",
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
      description: "An English business operating system for Ethiopian organizations.",
      offers: { "@type": "AggregateOffer", priceCurrency: "ETB", lowPrice: "1500", offerCount: "4" },
      provider: { "@type": "Organization", name: "Biloo" },
    },
  ];

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function MarketingHeader() {
  const pathname = usePathname();
  const c = websiteCopy;
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<MegaMenu["id"] | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setActiveDesktopMenu(null);
  }, [pathname]);

  useEffect(() => {
    const closeDesktopMenu = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setActiveDesktopMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveDesktopMenu(null);
    };

    document.addEventListener("pointerdown", closeDesktopMenu);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeDesktopMenu);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.publicMenuOpen = "true";
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        menuPanelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      delete document.documentElement.dataset.publicMenuOpen;
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => toggleButtonRef.current?.focus());
    };
  }, [menuOpen]);

  return (
    <>
      <link rel="stylesheet" href="/biloo-marketing-sticky-header.css?v=20260803-1" />
      <a href="#public-main-content" className="public-skip-link">{c.skip}</a>
      <header ref={headerRef} className="marketing-nav marketing-nav-v2">
        <div className="marketing-nav-inner">
          <Link href="/" className="marketing-brand marketing-header-brand" aria-label="Biloo home">
            <img src="/hisab-logo.svg" alt="Biloo" width="92" height="46" className="hisab-logo" />
            <span className="marketing-brand-product">ERP</span>
          </Link>

          <nav className="marketing-desktop-nav" aria-label={c.navLabel} onMouseLeave={() => setActiveDesktopMenu(null)}>
            {megaMenus.map((menu) => {
              const open = activeDesktopMenu === menu.id;
              const current = menu.items.some((item) => routeMatches(pathname, item.href)) || routeMatches(pathname, menu.featured.href);
              return (
                <div
                  className={`marketing-nav-item${open ? " open" : ""}`}
                  key={menu.id}
                  onMouseEnter={() => setActiveDesktopMenu(menu.id)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveDesktopMenu(null);
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="true"
                    aria-controls={`marketing-mega-${menu.id}`}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setActiveDesktopMenu((value) => value === menu.id ? null : menu.id)}
                    onFocus={() => setActiveDesktopMenu(menu.id)}
                  >
                    <span>{menu.label}</span><i aria-hidden="true" />
                  </button>

                  <div id={`marketing-mega-${menu.id}`} className="marketing-mega-menu" aria-hidden={!open}>
                    <div className="marketing-mega-intro">
                      <small>{menu.eyebrow}</small>
                      <strong>{menu.title}</strong>
                      <p>{menu.description}</p>
                      <Link href={menu.featured.href} className="marketing-mega-featured">
                        <span><b>{menu.featured.label}</b><small>{menu.featured.note}</small></span>
                        <i aria-hidden="true">↗</i>
                      </Link>
                    </div>
                    <div className="marketing-mega-links">
                      {menu.items.map((item, index) => (
                        <Link href={item.href} aria-current={routeMatches(pathname, item.href) ? "page" : undefined} key={item.href}>
                          <span className="marketing-mega-index">{String(index + 1).padStart(2, "0")}</span>
                          <span><b>{item.label}</b><small>{item.note}</small></span>
                          <i aria-hidden="true">→</i>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <Link href="/pricing" className="marketing-nav-direct" aria-current={routeMatches(pathname, "/pricing") ? "page" : undefined}>{c.pricing}</Link>
          </nav>

          <div className="marketing-nav-actions marketing-desktop-actions">
            <Link href="/auth/login" className="marketing-signin">{c.signIn}</Link>
            <Link href="/request-demo" className="marketing-demo"><span>{c.demo}</span><i aria-hidden="true">↗</i></Link>
          </div>

          <div className="marketing-mobile-header-controls">
            <button
              ref={toggleButtonRef}
              className={`marketing-menu-toggle premium-menu-toggle${menuOpen ? " open" : ""}`}
              type="button"
              aria-label={menuOpen ? c.close : c.menu}
              aria-expanded={menuOpen}
              aria-controls="hisab-public-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div id="hisab-public-menu" className={`premium-mobile-menu${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
        <button className="premium-mobile-menu-backdrop" type="button" aria-label={c.close} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
        <section ref={menuPanelRef} className="premium-mobile-menu-panel" role="dialog" aria-modal="true" aria-label={c.navLabel}>
          <header>
            <Link href="/" className="marketing-brand marketing-drawer-brand" onClick={() => setMenuOpen(false)}>
              <img src="/hisab-logo.svg" alt="Biloo" width="88" height="44" />
              <span>ERP</span>
            </Link>
            <button ref={closeButtonRef} type="button" aria-label={c.close} onClick={() => setMenuOpen(false)}><span /><span /></button>
          </header>

          <div className="premium-mobile-menu-intro">
            <span>{c.menuEyebrow}</span>
            <h2>{c.menuTitle}</h2>
            <p>{c.menuDescription}</p>
          </div>

          <div className="premium-mobile-menu-sections">
            {mobileSections.map((section, sectionIndex) => (
              <section key={section.label}>
                <small>{section.label}</small>
                <nav aria-label={`${section.label} navigation`}>
                  {section.items.map(([label, href], itemIndex) => (
                    <Link
                      href={href}
                      aria-current={routeMatches(pathname, href) ? "page" : undefined}
                      style={{ "--menu-index": sectionIndex * 4 + itemIndex } as CSSProperties}
                      onClick={() => setMenuOpen(false)}
                      key={href}
                    >
                      <strong>{label}</strong><span aria-hidden="true">↗</span>
                    </Link>
                  ))}
                </nav>
              </section>
            ))}
          </div>

          <div className="premium-mobile-menu-actions">
            <Link href="/auth/email-sign-up" className="marketing-start" onClick={() => setMenuOpen(false)}>{c.start}<span aria-hidden="true">→</span></Link>
            <Link href="/request-demo" className="marketing-mobile-demo" onClick={() => setMenuOpen(false)}>{c.demo}</Link>
            <Link href="/auth/login" className="marketing-signin" onClick={() => setMenuOpen(false)}>{c.signIn}</Link>
          </div>

          <footer><span>Addis Ababa · Ethiopia</span><a href="mailto:info@hisabtech.com">Email support</a></footer>
        </section>
      </div>
    </>
  );
}

export function MarketingFooter() {
  const c = websiteCopy;
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-top">
        <div>
          <Link href="/" className="marketing-brand marketing-footer-brand">
            <img src="/hisab-logo.svg" alt="" width="44" height="44" className="hisab-logo" />
            <span className="marketing-brand-copy"><strong>Biloo</strong><small>Biloo ERP</small></span>
          </Link>
          <p>{c.footerIntro}</p>
          <a href="mailto:info@hisabtech.com">Email support</a>
          <a href="tel:+251924093037">+251 924 093 037</a>
        </div>
        <div><strong>{c.productMarket}</strong><Link href="/product-tour">Product tour</Link><Link href="/#modules">{c.modules}</Link><Link href="/ethiopia">{c.ethiopia}</Link><Link href="/industries">{c.industrySolutions}</Link><Link href="/pricing">{c.pricingEtb}</Link></div>
        <div><strong>{c.learnImplement}</strong><Link href="/resources">{c.learningCenter}</Link><Link href="/migration">{c.dataMigration}</Link><Link href="/compare">{c.comparisons}</Link><Link href="/help-center">{c.helpCenter}</Link><Link href="/customer-stories">{c.customerProof}</Link></div>
        <div><strong>{c.companyTrust}</strong><Link href="/about">{c.aboutHisab}</Link><Link href="/trust">{c.trustCenter}</Link><Link href="/integrations">{c.integrations}</Link><Link href="/auth/login">{c.signIn}</Link><a href="mailto:info@hisabtech.com?subject=Biloo%20ERP%20security%20question">{c.securityContact}</a></div>
      </div>
      <div className="marketing-footer-bottom"><span>© {new Date().getFullYear()} Biloo. {c.rights}</span><span>{c.location}</span></div>
    </footer>
  );
}

export function MarketingPageShell({ children }: { children: ReactNode }) {
  return <main className="marketing-site marketing-site-v2"><MarketingStructuredData /><MarketingHeader /><div id="public-main-content">{children}</div><MarketingFooter /></main>;
}
