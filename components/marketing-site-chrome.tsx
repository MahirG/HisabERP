"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LanguageSelector, useLanguage } from "./language-provider";
import { ThemeToggle } from "./theme-toggle";

const websiteCopy = {
  en: {
    subtitle: "Business operating system",
    navLabel: "Main navigation",
    product: "Product tour",
    industries: "Industries",
    pricing: "Pricing",
    migration: "Migration",
    resources: "Resources",
    about: "About",
    help: "Help Center",
    signIn: "Sign in",
    demo: "Request a demo",
    start: "Start free",
    menu: "Open website menu",
    close: "Close website menu",
    menuEyebrow: "HisabERP navigation",
    menuTitle: "Move from product discovery to a working business system.",
    menuDescription: "Explore the platform, understand implementation and choose the next commercial step.",
    footerIntro: "One secure, multilingual business workspace for Ethiopian companies that want clearer operations and better decisions.",
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
    aboutHisab: "About HisabTech",
    trustCenter: "Trust Center",
    integrations: "Integrations",
    securityContact: "Security contact",
    rights: "All rights reserved.",
    location: "Addis Ababa, Ethiopia",
    skip: "Skip to main content",
    language: "Language",
    theme: "Toggle light or dark mode",
  },
  am: {
    subtitle: "የንግድ ማስኬጃ ስርዓት",
    navLabel: "ዋና የድር ጣቢያ ምናሌ",
    product: "የምርት ማሳያ",
    industries: "የኢንዱስትሪ መፍትሄዎች",
    pricing: "ዋጋ",
    migration: "የመረጃ ሽግግር",
    resources: "የትምህርት ማዕከል",
    about: "ስለ እኛ",
    help: "የእገዛ ማዕከል",
    signIn: "ይግቡ",
    demo: "ማሳያ ይጠይቁ",
    start: "በነፃ ይጀምሩ",
    menu: "የድር ጣቢያ ምናሌን ይክፈቱ",
    close: "የድር ጣቢያ ምናሌን ይዝጉ",
    menuEyebrow: "የHisabERP ምናሌ",
    menuTitle: "ከምርት ማወቅ ወደ ተግባራዊ የንግድ ስርዓት ይሂዱ።",
    menuDescription: "መድረኩን ያስሱ፣ አተገባበሩን ይረዱ እና ቀጣዩን የንግድ እርምጃ ይምረጡ።",
    footerIntro: "የበለጠ ግልጽ አሰራርና የተሻለ ውሳኔ ለሚፈልጉ የኢትዮጵያ ኩባንያዎች አንድ ደህንነቱ የተጠበቀ ብዙ ቋንቋ የንግድ የሥራ ቦታ።",
    productMarket: "ምርት እና ገበያ",
    modules: "የምርት ሞጁሎች",
    ethiopia: "ለኢትዮጵያ የተገነባ ERP",
    industrySolutions: "የኢንዱስትሪ መፍትሄዎች",
    pricingEtb: "ዋጋ በኢትዮጵያ ብር",
    learnImplement: "ይማሩ እና ይተግብሩ",
    learningCenter: "የንግድ ትምህርት ማዕከል",
    dataMigration: "የመረጃ ሽግግር እና ማስጀመር",
    comparisons: "የERP ንጽጽሮች",
    helpCenter: "የእገዛ ማዕከል",
    customerProof: "የደንበኛ ማስረጃ",
    companyTrust: "ኩባንያ እና እምነት",
    aboutHisab: "ስለ HisabTech",
    trustCenter: "የእምነት ማዕከል",
    integrations: "ውህዶች",
    securityContact: "የደህነት ግንኙነት",
    rights: "መብቶቹ ሁሉ የተጠበቁ ናቸው።",
    location: "አዲስ አበባ፣ ኢትዮጵያ",
    skip: "ወደ ዋናው ይዘት ይሂዱ",
    language: "ቋንቋ",
    theme: "የብርሃን ወይም የጨለማ ገጽታ ይቀይሩ",
  },
} as const;

const navItems = [
  ["product", "/product-tour"],
  ["industries", "/industries"],
  ["pricing", "/pricing"],
  ["migration", "/migration"],
  ["resources", "/resources"],
  ["about", "/about"],
  ["help", "/help-center"],
] as const;

const mobileNavItems = [
  ["product", "/product-tour"],
  ["pricing", "/pricing"],
  ["industries", "/industries"],
  ["migration", "/migration"],
  ["resources", "/resources"],
  ["about", "/about"],
  ["help", "/help-center"],
] as const;

function MarketingStructuredData() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Hisab Technologies",
      url: "https://www.hisabtech.com",
      logo: "https://www.hisabtech.com/hisab-logo.svg",
      email: "info@hisabtech.com",
      telephone: "+251924093037",
      address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "HisabERP",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.hisabtech.com",
      description: "A multilingual business operating system for Ethiopian organizations.",
      offers: { "@type": "AggregateOffer", priceCurrency: "ETB", lowPrice: "1500", offerCount: "4" },
      provider: { "@type": "Organization", name: "Hisab Technologies" },
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function MobileLanguageIcon() {
  return (
    <svg aria-hidden="true" className="app-icon" fill="none" height="19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="19">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function MobileThemeIcons() {
  return (
    <>
      <svg aria-hidden="true" className="app-icon mobile-theme-icon mobile-theme-icon-moon" fill="none" height="19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="19">
        <path d="M20.7 15.5A8.5 8.5 0 0 1 8.5 3.3 9 9 0 1 0 20.7 15.5Z" />
      </svg>
      <svg aria-hidden="true" className="app-icon mobile-theme-icon mobile-theme-icon-sun" fill="none" height="19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="19">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
      </svg>
    </>
  );
}

export function MarketingHeader() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const c = websiteCopy[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLElement>(null);

  useEffect(() => setMenuOpen(false), [pathname]);

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
      <a href="#public-main-content" className="public-skip-link">{c.skip}</a>
      <header className="marketing-nav marketing-nav-v2">
        <Link href="/" className="marketing-brand" aria-label="HisabTech home">
          <img src="/hisab-logo.svg" alt="" width="44" height="44" className="hisab-logo" />
          <span className="marketing-brand-copy"><strong>HisabTech</strong><small>{c.subtitle}</small></span>
        </Link>

        <div className="marketing-mobile-header-controls" data-i18n-skip>
          <details className="mobile-language-control language-icon-selector">
            <summary className="language-icon-trigger preference-icon-button" aria-label={c.language} title={c.language}><MobileLanguageIcon /></summary>
            <div className="language-icon-menu" role="menu" aria-label={c.language}>
              <button type="button" role="menuitemradio" aria-checked={language === "en"} className={language === "en" ? "active" : ""} data-mobile-language="en"><span>English</span><b>EN</b></button>
              <button type="button" role="menuitemradio" aria-checked={language === "am"} className={language === "am" ? "active" : ""} data-mobile-language="am"><span>አማርኛ</span><b>አማ</b></button>
            </div>
          </details>
          <button className="mobile-prehydration-theme-toggle preference-icon-button" type="button" aria-label={c.theme} title={c.theme} data-mobile-theme-toggle><MobileThemeIcons /></button>
          <button ref={toggleButtonRef} className={`marketing-menu-toggle premium-menu-toggle${menuOpen ? " open" : ""}`} type="button" aria-label={menuOpen ? c.close : c.menu} aria-expanded={menuOpen} aria-controls="hisab-public-menu" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
        </div>

        <nav className="marketing-desktop-nav" aria-label={c.navLabel}>
          {navItems.map(([key, href]) => <Link href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined} key={href}>{c[key]}</Link>)}
        </nav>
        <div className="marketing-nav-actions marketing-desktop-actions">
          <div className="marketing-preference-icons global-preference-icons"><LanguageSelector compact /><ThemeToggle /></div>
          <Link href="/auth/login" className="marketing-signin">{c.signIn}</Link>
          <Link href="/request-demo" className="marketing-demo">{c.demo}</Link>
          <Link href="/auth/email-sign-up" className="marketing-start">{c.start}</Link>
        </div>
      </header>

      <div id="hisab-public-menu" className={`premium-mobile-menu${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
        <button className="premium-mobile-menu-backdrop" type="button" aria-label={c.close} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
        <section ref={menuPanelRef} className="premium-mobile-menu-panel" role="dialog" aria-modal="true" aria-label={c.navLabel}>
          <header>
            <Link href="/" className="marketing-brand" onClick={() => setMenuOpen(false)}><img src="/hisab-logo.svg" alt="" width="46" height="46" /><span className="marketing-brand-copy"><strong>HisabTech</strong><small>{c.subtitle}</small></span></Link>
            <button ref={closeButtonRef} type="button" aria-label={c.close} onClick={() => setMenuOpen(false)}><span /><span /></button>
          </header>
          <div className="premium-mobile-menu-intro"><span>{c.menuEyebrow}</span><h2>{c.menuTitle}</h2><p>{c.menuDescription}</p></div>
          <nav aria-label={c.navLabel}>
            {mobileNavItems.map(([key, href], index) => (
              <Link href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined} data-mobile-nav-key={key} style={{ "--menu-index": index } as CSSProperties} onClick={() => setMenuOpen(false)} key={href}>
                <small>{String(index + 1).padStart(2, "0")}</small><strong>{c[key]}</strong><span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
          <div className="premium-mobile-menu-actions">
            <Link href="/auth/email-sign-up" className="marketing-start" onClick={() => setMenuOpen(false)}>{c.start}<span aria-hidden="true">→</span></Link>
            <Link href="/request-demo" className="marketing-demo" onClick={() => setMenuOpen(false)}>{c.demo}</Link>
            <Link href="/auth/login" className="marketing-signin" onClick={() => setMenuOpen(false)}>{c.signIn}</Link>
          </div>
          <footer><span>Addis Ababa · Ethiopia</span><a href="mailto:info@hisabtech.com">info@hisabtech.com</a></footer>
        </section>
      </div>
    </>
  );
}

export function MarketingFooter() {
  const { language } = useLanguage();
  const c = websiteCopy[language];
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-top">
        <div><Link href="/" className="marketing-brand marketing-footer-brand"><img src="/hisab-logo.svg" alt="" width="44" height="44" className="hisab-logo" /><span className="marketing-brand-copy"><strong>HisabTech</strong><small>HisabERP</small></span></Link><p>{c.footerIntro}</p><a href="mailto:info@hisabtech.com">info@hisabtech.com</a><a href="tel:+251924093037">+251 924 093 037</a></div>
        <div><strong>{c.productMarket}</strong><Link href="/product-tour">{c.product}</Link><Link href="/#modules">{c.modules}</Link><Link href="/ethiopia">{c.ethiopia}</Link><Link href="/industries">{c.industrySolutions}</Link><Link href="/pricing">{c.pricingEtb}</Link></div>
        <div><strong>{c.learnImplement}</strong><Link href="/resources">{c.learningCenter}</Link><Link href="/migration">{c.dataMigration}</Link><Link href="/compare">{c.comparisons}</Link><Link href="/help-center">{c.helpCenter}</Link><Link href="/customer-stories">{c.customerProof}</Link></div>
        <div><strong>{c.companyTrust}</strong><Link href="/about">{c.aboutHisab}</Link><Link href="/trust">{c.trustCenter}</Link><Link href="/integrations">{c.integrations}</Link><Link href="/auth/login">{c.signIn}</Link><a href="mailto:info@hisabtech.com?subject=HisabERP%20security%20question">{c.securityContact}</a></div>
      </div>
      <div className="marketing-footer-bottom"><span>© {new Date().getFullYear()} Hisab Technologies. {c.rights}</span><span>{c.location}</span></div>
    </footer>
  );
}

export function MarketingPageShell({ children }: { children: ReactNode }) {
  return <main className="marketing-site marketing-site-v2"><MarketingStructuredData /><MarketingHeader /><div id="public-main-content">{children}</div><MarketingFooter /></main>;
}
