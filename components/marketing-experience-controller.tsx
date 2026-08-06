"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { MarketingLegalSuite } from "./marketing-legal-suite";

const ADMIN_CONTACT_EMAIL = "mahir@hisabtech.com";
const POWERED_BY_URL = "https://hisabtechnologies.com";
const MARKETING_ROUTE_PREFIXES = [
  "/product",
  "/product-tour",
  "/pricing",
  "/ethiopia",
  "/industries",
  "/migration",
  "/integrations",
  "/customer-stories",
  "/resources",
  "/help-center",
  "/compare",
  "/trust",
  "/about",
  "/request-demo",
  "/privacy",
  "/terms",
  "/cookies",
  "/legal",
  "/support",
  "/contact",
  "/security",
  "/accessibility",
] as const;

const revealSelector = [
  "#public-main-content > *",
  "#public-main-content > div > *",
  "#public-main-content section",
  "#public-main-content article",
].join(",");

function isMarketingPath(pathname: string) {
  if (pathname === "/") return true;
  return MARKETING_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isLegalPath(pathname: string) {
  return ["/privacy", "/terms", "/cookies", "/legal"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isVisible(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight * 0.94;
}

function normalizeAdminContactLinks(scope: ParentNode) {
  const anchors: HTMLAnchorElement[] = [];
  if (scope instanceof HTMLAnchorElement) anchors.push(scope);
  anchors.push(...Array.from(scope.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]')));

  anchors.forEach((anchor) => {
    const mailto = anchor.getAttribute("href");
    if (!mailto) return;

    const [addressPart, queryPart] = mailto.slice("mailto:".length).split("?", 2);
    const address = decodeURIComponent(addressPart).trim().toLowerCase();
    if (address !== "info@hisabtech.com" && address !== ADMIN_CONTACT_EMAIL) return;

    anchor.href = `mailto:${ADMIN_CONTACT_EMAIL}${queryPart ? `?${queryPart}` : ""}`;
    if (anchor.textContent?.trim().toLowerCase() === "info@hisabtech.com") {
      anchor.textContent = ADMIN_CONTACT_EMAIL;
    }
  });
}

function ensurePoweredByFooter(scope: ParentNode) {
  const footerRows: HTMLElement[] = [];
  if (scope instanceof HTMLElement && scope.matches(".wp-footer-bottom, .marketing-footer-bottom")) {
    footerRows.push(scope);
  }
  footerRows.push(
    ...Array.from(scope.querySelectorAll<HTMLElement>(".wp-footer-bottom, .marketing-footer-bottom")),
  );

  footerRows.forEach((footerRow) => {
    if (footerRow.querySelector('[data-powered-by-hisab="true"]')) return;

    const link = document.createElement("a");
    link.href = POWERED_BY_URL;
    link.textContent = "Powered by hisabtechnologies.com";
    link.className = "marketing-powered-by";
    link.dataset.poweredByHisab = "true";
    link.rel = "noopener noreferrer";

    const legalLinks = footerRow.querySelector<HTMLElement>(":scope > div");
    if (legalLinks) legalLinks.append(link);
    else footerRow.append(link);
  });
}

export function MarketingExperienceController() {
  const pathname = usePathname();
  const marketingPath = isMarketingPath(pathname);
  const homePath = pathname === "/";
  const legalPath = isLegalPath(pathname);

  useEffect(() => {
    const documentRoot = document.documentElement;
    const body = document.body;

    if (!marketingPath) {
      delete body.dataset.awardMarketing;
      delete body.dataset.marketingScrolled;
      delete body.dataset.marketingDeepScrolled;
      documentRoot.style.removeProperty("--marketing-scroll-progress");
      return;
    }

    let frame = 0;
    let routeTimer = 0;
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let marketingRoot: HTMLElement | null = null;
    let reducedMotionQuery: MediaQueryList | null = null;

    const updateScrollState = () => {
      frame = 0;
      const scrollable = Math.max(documentRoot.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      documentRoot.style.setProperty("--marketing-scroll-progress", progress.toFixed(4));
      body.dataset.marketingScrolled = window.scrollY > 10 ? "true" : "false";
      body.dataset.marketingDeepScrolled = window.scrollY > Math.max(window.innerHeight * 0.72, 560) ? "true" : "false";
    };

    const scheduleScrollUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollState);
    };

    const revealImmediately = (element: HTMLElement) => {
      element.dataset.marketingRevealed = "true";
      element.classList.add("is-visible");
    };

    const registerRevealElements = (scope: ParentNode) => {
      if (!marketingRoot) return;
      const reducedMotion = reducedMotionQuery?.matches ?? false;
      const candidates = Array.from(scope.querySelectorAll<HTMLElement>(revealSelector));

      candidates.forEach((element, index) => {
        if (!marketingRoot?.contains(element)) return;
        if (element.closest(".wb-header, .wb-mobile-drawer, .wb-search-overlay, .marketing-footer")) return;
        if (element.dataset.marketingReveal === "true") return;

        element.dataset.marketingReveal = "true";
        element.style.setProperty("--marketing-reveal-order", String(index % 6));

        if (reducedMotion || isVisible(element) || !observer) {
          revealImmediately(element);
        } else {
          observer.observe(element);
        }
      });
    };

    const initialize = () => {
      marketingRoot = document.querySelector<HTMLElement>(".marketing-site-v2");

      if (!marketingRoot) {
        delete body.dataset.awardMarketing;
        delete body.dataset.marketingScrolled;
        delete body.dataset.marketingDeepScrolled;
        documentRoot.style.removeProperty("--marketing-scroll-progress");
        return;
      }

      body.dataset.awardMarketing = "true";
      marketingRoot.dataset.marketingRoute = pathname;
      marketingRoot.dataset.marketingEntering = "true";
      reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      if (!reducedMotionQuery.matches && "IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const element = entry.target as HTMLElement;
              revealImmediately(element);
              observer?.unobserve(element);
            });
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
        );
      }

      normalizeAdminContactLinks(marketingRoot);
      ensurePoweredByFooter(marketingRoot);
      registerRevealElements(marketingRoot);
      updateScrollState();

      mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            normalizeAdminContactLinks(node);
            ensurePoweredByFooter(node);
            registerRevealElements(node);
          });
        });
      });
      mutationObserver.observe(marketingRoot, { childList: true, subtree: true });

      window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
      window.addEventListener("resize", scheduleScrollUpdate, { passive: true });

      routeTimer = window.setTimeout(() => {
        if (marketingRoot) delete marketingRoot.dataset.marketingEntering;
      }, reducedMotionQuery.matches ? 0 : 520);
    };

    const startFrame = window.requestAnimationFrame(initialize);

    return () => {
      window.cancelAnimationFrame(startFrame);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(routeTimer);
      observer?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("scroll", scheduleScrollUpdate);
      window.removeEventListener("resize", scheduleScrollUpdate);
      delete body.dataset.awardMarketing;
      delete body.dataset.marketingScrolled;
      delete body.dataset.marketingDeepScrolled;
      documentRoot.style.removeProperty("--marketing-scroll-progress");
    };
  }, [marketingPath, pathname]);

  if (!marketingPath) return null;

  return (
    <>
      <link rel="stylesheet" href="/biloo-marketing-interactions.css?v=20260806-3" />
      <link rel="stylesheet" href="/biloo-legal-suite.css?v=20260806-1" />
      {legalPath ? <link rel="stylesheet" href="/biloo-legal-pages.css?v=20260806-1" /> : null}
      {!homePath ? <link rel="stylesheet" href="/biloo-marketing-foundation-v2.css?v=20260806-2" /> : null}
      {homePath ? <link rel="stylesheet" href="/biloo-home-latest.css?v=20260806-2" /> : null}
      <MarketingLegalSuite />
      {!homePath ? (
        <div className="marketing-motion-layer">
          <span className="marketing-motion-orb marketing-motion-orb-one" aria-hidden="true" />
          <span className="marketing-motion-orb marketing-motion-orb-two" aria-hidden="true" />
          <span className="marketing-scroll-progress" aria-hidden="true" />
        </div>
      ) : null}
    </>
  );
}