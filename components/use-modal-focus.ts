"use client";

import { useEffect, type RefObject } from "react";

const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

/** Keep modal focus inside its surface and restore the invoking control. */
export function useModalFocus(ref: RefObject<HTMLElement | null>, active: boolean | string | null) {
  useEffect(() => {
    const dialog = ref.current;
    if (!active || !dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const inertElements: Array<[HTMLElement, boolean]> = [];
    for (let node: HTMLElement | null = dialog; node?.parentElement; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (!(sibling instanceof HTMLElement) || sibling === node || sibling.matches('script,style,link,.workspace-surface-backdrop,.wb-overlay-backdrop,.mobile-nav-backdrop,.biloo-consent-backdrop')) continue;
        inertElements.push([sibling, sibling.inert]);
        sibling.inert = true;
      }
    }
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>(focusable)).filter((element) => element.getClientRects().length && getComputedStyle(element).visibility === 'visible' && !element.closest('[inert]'));
    const focusFirst = () => (controls()[0] ?? dialog).focus({ preventScroll: true });
    focusFirst();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      for (const [element, inert] of inertElements) element.inert = inert;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [active, ref]);
}
