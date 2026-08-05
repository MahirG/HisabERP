"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { MarketingLegalSuite } from "./marketing-legal-suite";

const ADMIN_CONTACT_EMAIL = "mahir@hisabtech.com";
const revealSelector = [
  "#public-main-content > *",
  "#public-main-content > div > *",
  "#public-main-content section",
  "#public-main-content article",
].join(",");

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

export function MarketingExperienceController() {
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;
    let routeTimer = 0;
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let marketingRoot: HTMLElement | null = null;
    let reducedMotionQuery: MediaQueryList | null = null;

    const documentRoot = document.documentElement;
    const body = document.body;

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
    };

    const registerRevealElements = (scope: ParentNode) => {
      if (!marketingRoot) return;
      const reducedMotion = reducedMotionQuery?.matches ?? false;
      const candidates = Array.from(scope.querySelectorAll<HTMLElement>(revealSelector));

      candidates.forEach((element, index) => {
        if (!marketingRoot?.contains(element)) return;
        if (element.closest(".marketing-nav, .premium-mobile-menu, .marketing-footer")) return;
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
      registerRevealElements(marketingRoot);
      updateScrollState();

      mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            normalizeAdminContactLinks(node);
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
  }, [pathname]);

  const returnToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <>
      <link rel="stylesheet" href="/biloo-marketing-interactions.css?v=20260805-1" />
      <MarketingLegalSuite />
      <div className="marketing-motion-layer">
        <span className="marketing-motion-orb marketing-motion-orb-one" aria-hidden="true" />
        <span className="marketing-motion-orb marketing-motion-orb-two" aria-hidden="true" />
        <span className="marketing-scroll-progress" aria-hidden="true" />
        <button className="marketing-back-to-top" type="button" aria-label="Back to top" onClick={returnToTop}>
          <span aria-hidden="true">↑</span>
        </button>
      </div>
    </>
  );
}
