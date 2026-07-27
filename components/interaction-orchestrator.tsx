"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./runtime-interactions.module.css";

type HapticPattern = "selection" | "impact" | "success" | "warning" | "error";

type HapticEventDetail = {
  pattern?: HapticPattern;
};

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  selection: 8,
  impact: 14,
  success: [12, 40, 18],
  warning: [18, 54, 18],
  error: [26, 70, 26],
};

function reducedMotionPreferred() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hapticsEnabled() {
  try {
    return window.localStorage.getItem("hisab-haptics") !== "off";
  } catch {
    return true;
  }
}

function vibrate(pattern: HapticPattern) {
  if (!("vibrate" in navigator) || !hapticsEnabled()) return;
  if (!window.matchMedia("(pointer: coarse)").matches) return;
  navigator.vibrate(HAPTIC_PATTERNS[pattern]);
}

function animatePress(element: HTMLElement) {
  if (reducedMotionPreferred() || typeof element.animate !== "function") return;
  element.animate(
    [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(1px) scale(.985)", offset: 0.38 },
      { transform: "translateY(-.5px) scale(1.006)", offset: 0.72 },
      { transform: "translateY(0) scale(1)" },
    ],
    { duration: 260, easing: "linear" },
  );
}

function animateSpring(element: HTMLElement, delay = 0) {
  if (reducedMotionPreferred() || typeof element.animate !== "function") return;
  element.animate(
    [
      { opacity: 0, transform: "translateY(10px) scale(.985)" },
      { opacity: 1, transform: "translateY(-2px) scale(1.004)", offset: 0.58 },
      { opacity: 1, transform: "translateY(1px) scale(.998)", offset: 0.78 },
      { opacity: 1, transform: "translateY(0) scale(1)" },
    ],
    { duration: 520, delay, easing: "linear", fill: "both" },
  );
}

function interactionPattern(element: HTMLElement): HapticPattern {
  const explicit = element.dataset.haptic as HapticPattern | undefined;
  if (explicit && explicit in HAPTIC_PATTERNS) return explicit;
  if (element.matches('[aria-current="page"], [aria-selected="true"]')) return "selection";
  if (element.matches('[data-tone="danger"], .danger, .destructive, [name="status"]')) return "warning";
  if (element.matches('button[type="submit"], .primary, .marketing-start')) return "impact";
  return "selection";
}

export function InteractionOrchestrator() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const root = document.documentElement;
    const updateConnectivity = () => {
      root.dataset.connectivity = navigator.onLine ? "online" : "offline";
    };

    root.dataset.motion = reducedMotionPreferred() ? "reduced" : "full";
    updateConnectivity();
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest<HTMLElement>(
        'button:not([disabled]), a[href], [role="button"]:not([aria-disabled="true"])',
      );
      if (!interactive || interactive.dataset.haptic === "none") return;
      vibrate(interactionPattern(interactive));
      animatePress(interactive);
    };

    const handleHaptic = (event: Event) => {
      const detail = (event as CustomEvent<HapticEventDetail>).detail;
      vibrate(detail?.pattern ?? "selection");
    };

    const observer = new MutationObserver((records) => {
      let animationIndex = 0;
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const candidates = [
            ...(node.matches('[data-live-row="true"], [data-motion-enter]') ? [node] : []),
            ...node.querySelectorAll<HTMLElement>('[data-live-row="true"], [data-motion-enter]'),
          ];
          for (const candidate of candidates.slice(0, 24)) {
            animateSpring(candidate, Math.min(animationIndex * 18, 180));
            animationIndex += 1;
          }
        }
      }
    });

    document.addEventListener("click", handleClick, true);
    window.addEventListener("hisab:haptic", handleHaptic);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("online", updateConnectivity);
      window.removeEventListener("offline", updateConnectivity);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("hisab:haptic", handleHaptic);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    const root = document.documentElement;
    root.dataset.routeTransition = "active";
    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>("#workspace-content > :first-child, main");
      if (target) animateSpring(target);
      window.setTimeout(() => {
        delete root.dataset.routeTransition;
      }, 560);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <>
      <span className={styles.runtimeRoot} aria-hidden="true" />
      <span className={styles.status} aria-live="polite" aria-atomic="true" />
    </>
  );
}
