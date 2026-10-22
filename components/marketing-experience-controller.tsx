"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { MarketingLegalSuite } from "./marketing-legal-suite";

const ADMIN_CONTACT_EMAIL = "mahir@hisabtech.com";
const MARKETING_ROUTE_PREFIXES = ["/product", "/product-tour", "/pricing", "/ethiopia", "/industries", "/migration", "/integrations", "/customer-stories", "/resources", "/help-center", "/compare", "/trust", "/about", "/services", "/request-demo", "/privacy", "/terms", "/cookies", "/legal", "/support", "/contact", "/accessibility"];

function isMarketingPath(pathname: string) {
  return pathname === "/" || MARKETING_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function MarketingExperienceController() {
  const pathname = usePathname();
  const marketingPath = isMarketingPath(pathname);

  useEffect(() => {
    if (!marketingPath) return;
    const root = document.querySelector<HTMLElement>(".marketing-site-v2");
    if (!root) return;
    root.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:info@hisabtech.com"]').forEach((link) => {
      link.href = link.href.replace("info@hisabtech.com", ADMIN_CONTACT_EMAIL);
      if (link.textContent?.trim() === "info@hisabtech.com") link.textContent = ADMIN_CONTACT_EMAIL;
    });
    document.body.dataset.awardMarketing = "true";
    root.dataset.marketingRoute = pathname;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    let reveals: IntersectionObserver | undefined;
    let headerObserver: IntersectionObserver | undefined;

    const stopAnimations = () => {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    const configureReveals = () => {
      reveals?.disconnect();
      stopAnimations();
      if (preference.matches || !("IntersectionObserver" in window)) return;
      reveals = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          reveals?.unobserve(element);
          // Content stays visible in CSS and HTML, even if enhancement fails.
          if (element.dataset.motionSeen || preference.matches || typeof element.animate !== "function") continue;
          element.dataset.motionSeen = "true";
          const animation = element.animate([
            { opacity: .88, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ], { duration: 320, easing: "cubic-bezier(.2,.75,.2,1)" });
          animations.add(animation);
          const release = () => animations.delete(animation);
          animation.addEventListener("finish", release, { once: true });
          animation.addEventListener("cancel", release, { once: true });
        }
      }, { rootMargin: "0px 0px 32px 0px", threshold: 0 });
      const sections = root.querySelectorAll<HTMLElement>("#public-main-content > section, #public-main-content > div > section");
      for (const section of sections) {
        if (section.dataset.motionSeen) continue;
        if (section.getBoundingClientRect().top <= window.innerHeight) section.dataset.motionSeen = "true";
        else reveals.observe(section);
      }
    };

    if ("IntersectionObserver" in window) {
      const sentinel = root.querySelector(".wb-scroll-sentinel");
      const header = root.querySelector<HTMLElement>(".wb-header");
      if (sentinel && header) {
        headerObserver = new IntersectionObserver(([entry]) => {
          header.dataset.scrolled = String(!entry.isIntersecting);
        });
        headerObserver.observe(sentinel);
      }
    }
    configureReveals();
    preference.addEventListener("change", configureReveals);
    return () => {
      reveals?.disconnect();
      headerObserver?.disconnect();
      stopAnimations();
      preference.removeEventListener("change", configureReveals);
      delete document.body.dataset.awardMarketing;
    };
  }, [marketingPath, pathname]);

  return marketingPath ? <MarketingLegalSuite /> : null;
}
