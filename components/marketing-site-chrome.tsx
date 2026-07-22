"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LanguageSelector, useLanguage } from "./language-provider";

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
    help: "Help",
    signIn: "Sign in",
    demo: "Request a demo",
    start: "Start free",
    menu: "Open website menu",
    close: "Close website menu",
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
    conversionEyebrow: "Ready for a clearer business picture?",
    conversionText: "Explore HisabERP, request a focused demo or speak directly with HisabTech.",
    whatsapp: "WhatsApp",
    skip: "Skip to main content",
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
    help: "እገዛ",
    signIn: "ይግቡ",
    demo: "ማሳያ ይጠይቁ",
    start: "በነፃ ይጀምሩ",
    menu: "የድር ጣቢያ ምናሌን ይክፈቱ",
    close: "የድር ጣቢያ ምናሌን ይዝጉ",
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
    integrations: "ውህደቶች",
    securityContact: "የደህነት ግንኙነት",
    rights: "መብቶቹ ሁሉ የተጠበቁ ናቸው።",
    location: "አዲስ አበባ፣ ኢትዮጵያ",
    conversionEyebrow: "የበለጠ ግልጽ የንግድ ምስል ይፈልጋሉ?",
    conversionText: "HisabERPን ይመልከቱ፣ የተመረጠ ማሳያ ይጠይቁ ወይም ከHisabTech ጋር በቀጥታ ይነጋገሩ።",
    whatsapp: "ዋትስአፕ",
    skip: "ወደ ዋናው ይዘት ይሂዱ",
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

export function MarketingHeader() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const c = websiteCopy[language];

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <a href="#public-main-content" className="public-skip-link">{c.skip}</a>
      <header className="marketing-nav marketing-nav-v2" data-menu-open={open ? "true" : "false"}>
        <Link href="/" className="marketing-brand" aria-label="HisabTech home">
          <img src="/hisab-logo.svg" alt="" width="44" height="44" className="hisab-logo" />
          <span className="marketing-brand-copy"><strong>HisabTech</strong><small>{c.subtitle}</small></span>
        </Link>
        <button className="marketing-menu-toggle" type="button" aria-expanded={open} aria-label={open ? c.close : c.menu} onClick={() => setOpen((value) => !value)}><span/><span/><span/></button>
        <nav aria-label={c.navLabel}>
          {navItems.map(([key, href]) => <Link href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined} key={href}>{c[key]}</Link>)}
        </nav>
        <div className="marketing-nav-actions">
          <LanguageSelector compact />
          <Link href="/auth/login" className="marketing-signin">{c.signIn}</Link>
          <Link href="/request-demo" className="marketing-demo">{c.demo}</Link>
          <Link href="/auth/email-sign-up" className="marketing-start">{c.start}</Link>
        </div>
      </header>
    </>
  );
}

export function MarketingFooter() {
  const { language } = useLanguage();
  const c = websiteCopy[language];
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer-top">
        <div>
          <Link href="/" className="marketing-brand marketing-footer-brand"><img src="/hisab-logo.svg" alt="" width="44" height="44" className="hisab-logo" /><span className="marketing-brand-copy"><strong>HisabTech</strong><small>HisabERP</small></span></Link>
          <p>{c.footerIntro}</p><a href="mailto:info@hisabtech.com">info@hisabtech.com</a><a href="tel:+251924093037">+251 924 093 037</a>
        </div>
        <div><strong>{c.productMarket}</strong><Link href="/product-tour">{c.product}</Link><Link href="/#modules">{c.modules}</Link><Link href="/ethiopia">{c.ethiopia}</Link><Link href="/industries">{c.industrySolutions}</Link><Link href="/pricing">{c.pricingEtb}</Link></div>
        <div><strong>{c.learnImplement}</strong><Link href="/resources">{c.learningCenter}</Link><Link href="/migration">{c.dataMigration}</Link><Link href="/compare">{c.comparisons}</Link><Link href="/help-center">{c.helpCenter}</Link><Link href="/customer-stories">{c.customerProof}</Link></div>
        <div><strong>{c.companyTrust}</strong><Link href="/about">{c.aboutHisab}</Link><Link href="/trust">{c.trustCenter}</Link><Link href="/integrations">{c.integrations}</Link><Link href="/auth/login">{c.signIn}</Link><a href="mailto:info@hisabtech.com?subject=HisabERP%20security%20question">{c.securityContact}</a></div>
      </div>
      <div className="marketing-footer-bottom"><span>© {new Date().getFullYear()} Hisab Technologies. {c.rights}</span><span>{c.location}</span></div>
    </footer>
  );
}

function MarketingConversionBar() {
  const { language } = useLanguage();
  const c = websiteCopy[language];
  return (
    <aside className="marketing-conversion-bar" aria-label={c.conversionEyebrow}>
      <div><strong>{c.conversionEyebrow}</strong><span>{c.conversionText}</span></div>
      <div><a href="https://wa.me/251924093037" target="_blank" rel="noopener noreferrer" className="conversion-whatsapp">{c.whatsapp}</a><Link href="/request-demo?source=sticky-cta" className="marketing-demo">{c.demo}</Link><Link href="/auth/email-sign-up" className="marketing-start">{c.start}</Link></div>
    </aside>
  );
}

export function MarketingPageShell({ children }: { children: ReactNode }) {
  return <main className="marketing-site marketing-site-v2"><MarketingStructuredData/><MarketingHeader/><div id="public-main-content">{children}</div><MarketingFooter/><MarketingConversionBar/></main>;
}
