"use client";

import Link from "next/link";
import { Cookie, ShieldCheck, Xmark } from "iconoir-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CONSENT_STORAGE_KEY = "biloo-cookie-consent-v1";
const CONSENT_COOKIE_NAME = "biloo_cookie_consent";
const CONSENT_VERSION = 1;
const OPEN_PREFERENCES_EVENT = "biloo:open-cookie-preferences";
const CONSENT_CHANGED_EVENT = "biloo:consent-changed";

type ConsentRecord = {
  version: number;
  essential: true;
  analytics: boolean;
  updatedAt: string;
};

function readConsent(): ConsentRecord | null {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<ConsentRecord>;
    if (parsed.version !== CONSENT_VERSION || parsed.essential !== true || typeof parsed.analytics !== "boolean") return null;
    return parsed as ConsentRecord;
  } catch {
    return null;
  }
}

function persistConsent(analytics: boolean) {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    essential: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // The preference is still applied for this page view when storage is unavailable.
  }

  document.cookie = `${CONSENT_COOKIE_NAME}=${analytics ? "all" : "essential"}; Path=/; Max-Age=15552000; SameSite=Lax`;
  document.documentElement.dataset.analyticsConsent = analytics ? "granted" : "denied";
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: record }));
  return record;
}

export function MarketingLegalSuite() {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const customizeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [isMarketing, setIsMarketing] = useState(false);
  const [footerTarget, setFooterTarget] = useState<HTMLElement | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const openPreferences = useCallback(() => {
    const current = readConsent();
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setAnalytics(current?.analytics ?? false);
    setBannerOpen(false);
    setPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setPreferencesOpen(false);
    if (!readConsent()) setBannerOpen(true);
  }, []);

  useEffect(() => {
    const marketingRoot = document.querySelector<HTMLElement>(".marketing-site-v2");
    if (!marketingRoot) return;

    setIsMarketing(true);
    setFooterTarget(marketingRoot.querySelector<HTMLElement>(".marketing-footer"));

    const existing = readConsent();
    if (existing) {
      setAnalytics(existing.analytics);
      document.documentElement.dataset.analyticsConsent = existing.analytics ? "granted" : "denied";
    } else {
      setBannerOpen(true);
      document.documentElement.dataset.analyticsConsent = "pending";
    }

    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
  }, [openPreferences]);

  useEffect(() => {
    if (!preferencesOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleDialogKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePreferences();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleDialogKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDialogKeyboard);
      const returnTarget = returnFocusRef.current;
      window.requestAnimationFrame(() => {
        if (returnTarget?.isConnected) returnTarget.focus();
        else customizeButtonRef.current?.focus();
      });
    };
  }, [closePreferences, preferencesOpen]);

  if (!isMarketing) return null;

  const save = (allowAnalytics: boolean) => {
    persistConsent(allowAnalytics);
    setAnalytics(allowAnalytics);
    setBannerOpen(false);
    setPreferencesOpen(false);
  };

  const legalFooter = footerTarget ? createPortal(
    <div className="biloo-footer-legal" aria-label="Legal and privacy links">
      <div>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Website Terms</Link>
        <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))}>Cookie settings</button>
      </div>
      <span>Privacy-conscious by design · Preferences can be changed at any time</span>
    </div>,
    footerTarget,
  ) : null;

  return (
    <>
      {legalFooter}

      {bannerOpen ? (
        <aside className="biloo-consent-banner" aria-live="polite" aria-labelledby="biloo-consent-title" aria-describedby="biloo-consent-description">
          <div className="biloo-consent-icon"><Cookie width={23} height={23} strokeWidth={1.55} aria-hidden /></div>
          <div className="biloo-consent-copy">
            <span>YOUR PRIVACY, YOUR CHOICE</span>
            <h2 id="biloo-consent-title">A better website—with your permission.</h2>
            <p id="biloo-consent-description">Biloo uses essential storage for security and the preferences you choose. Optional analytics helps us understand performance and improve the experience.</p>
            <p className="biloo-consent-links"><Link href="/privacy#cookies">Privacy and cookies</Link><span aria-hidden="true">·</span><Link href="/terms">Website terms</Link></p>
          </div>
          <div className="biloo-consent-actions">
            <button type="button" className="biloo-consent-primary" onClick={() => save(true)}>Accept all</button>
            <button type="button" className="biloo-consent-secondary" onClick={() => save(false)}>Essential only</button>
            <button ref={customizeButtonRef} type="button" className="biloo-consent-text" onClick={openPreferences}>Customize</button>
          </div>
        </aside>
      ) : null}

      {preferencesOpen ? (
        <div className="biloo-consent-modal" role="presentation">
          <button className="biloo-consent-backdrop" type="button" aria-label="Close cookie preferences" onClick={closePreferences} />
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="biloo-preferences-title" aria-describedby="biloo-preferences-description" className="biloo-consent-dialog">
            <header>
              <div className="biloo-consent-icon"><ShieldCheck width={23} height={23} strokeWidth={1.55} aria-hidden /></div>
              <div><span>PRIVACY CONTROL CENTER</span><h2 id="biloo-preferences-title">Choose how Biloo uses storage.</h2></div>
              <button ref={closeButtonRef} type="button" className="biloo-consent-close" aria-label="Close cookie preferences" onClick={closePreferences}><Xmark width={19} height={19} strokeWidth={1.55} aria-hidden /></button>
            </header>

            <p id="biloo-preferences-description" className="biloo-consent-dialog-intro">Essential technologies keep the website secure and remember actions you request. Optional analytics is never required to browse the public website.</p>

            <div className="biloo-consent-category">
              <div><strong>Essential</strong><span>Security, consent records, language and display preferences.</span></div>
              <span className="biloo-consent-always">Always active</span>
            </div>

            <label className="biloo-consent-category biloo-consent-toggle-row">
              <div><strong>Analytics</strong><span>Aggregated performance and usage signals used to improve navigation and page quality.</span></div>
              <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
              <span className="biloo-toggle" aria-hidden="true"><span /></span>
            </label>

            <div className="biloo-consent-dialog-actions">
              <button type="button" className="biloo-consent-primary" onClick={() => save(analytics)}>Save preferences</button>
              <button type="button" className="biloo-consent-secondary" onClick={() => save(false)}>Use essential only</button>
            </div>

            <p className="biloo-consent-fine-print">Read the <Link href="/privacy#cookies" onClick={closePreferences}>Privacy Policy</Link> for details. Contact <a href="mailto:mahir@hisabtech.com">mahir@hisabtech.com</a> with privacy questions.</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
