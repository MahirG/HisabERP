"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Xmark } from "iconoir-react";
import { useEffect, useRef, useState } from "react";
import { useModalFocus } from "./use-modal-focus";

const CONSENT_STORAGE_KEY = "biloo-marketing-consent-v1";
const LEGACY_STORAGE_KEY = "biloo-cookie-consent-v1";
const CONSENT_COOKIE_NAME = "biloo_cookie_consent";
const SHARED_COOKIE_NAME = "biloo_cookie_consent_v1";
const CONSENT_VERSION = 1;
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;
const OPEN_PREFERENCES_EVENT = "biloo:open-cookie-preferences";
const CONSENT_CHANGED_EVENT = "biloo:consent-changed";

type ConsentRecord = {
  version: number;
  essential: true;
  analytics: boolean;
  updatedAt: string;
};

function recordFor(analytics: boolean): ConsentRecord {
  return { version: CONSENT_VERSION, essential: true, analytics, updatedAt: new Date().toISOString() };
}

function readCookie(name: string): string | null {
  try {
    const item = document.cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`));
    return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
  } catch { return null; }
}

function writeCookie(name: string, value: string) {
  try {
    const parts = [`${name}=${value}`, "Path=/", `Max-Age=${CONSENT_MAX_AGE}`, "SameSite=Lax"];
    if (window.location.protocol === "https:") parts.push("Secure");
    const host = window.location.hostname;
    if (host === "hisabtech.com" || host.endsWith(".hisabtech.com")) parts.push("Domain=hisabtech.com");
    document.cookie = parts.join("; ");
  } catch { /* Restricted browser settings can block cookies. */ }
}

function parseRecord(value: string | null): ConsentRecord | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<ConsentRecord>;
    if (parsed.version !== CONSENT_VERSION || parsed.essential !== true || typeof parsed.analytics !== "boolean") return null;
    return parsed as ConsentRecord;
  } catch { return null; }
}

/** Shared decisions carry between the public website and authentication pages.
 * Accepting essential cookies on an auth page is not analytics opt-in. */
function readConsent(): ConsentRecord | null {
  const shared = readCookie(SHARED_COOKIE_NAME);
  if (shared === "declined") return recordFor(false);

  try {
    const stored = parseRecord(window.localStorage.getItem(CONSENT_STORAGE_KEY))
      ?? parseRecord(window.localStorage.getItem(LEGACY_STORAGE_KEY));
    if (stored) return stored;
  } catch { /* Fall back to first-party cookies. */ }

  const marketing = readCookie(CONSENT_COOKIE_NAME);
  if (marketing === "all") return recordFor(true);
  if (marketing === "essential") return recordFor(false);
  if (shared === "accepted") return recordFor(false);
  try {
    const oldChoice = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (oldChoice === "accepted" || oldChoice === "declined") return recordFor(false);
  } catch { /* Browser storage may be unavailable. */ }
  return null;
}

function persistConsent(analytics: boolean) {
  const record = recordFor(analytics);
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    window.localStorage.setItem(LEGACY_STORAGE_KEY, analytics ? "accepted" : "declined");
  } catch { /* First-party cookies are the fallback. */ }

  writeCookie(CONSENT_COOKIE_NAME, analytics ? "all" : "essential");
  writeCookie(SHARED_COOKIE_NAME, analytics ? "accepted" : "declined");
  document.documentElement.dataset.analyticsConsent = analytics ? "granted" : "denied";
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: record }));
  return record;
}

export function MarketingLegalSuite() {
  const pathname = usePathname();
  const [isMarketing, setIsMarketing] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  useModalFocus(dialogRef, preferencesOpen);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const marketingRoot = document.querySelector<HTMLElement>(".marketing-site-v2");
    if (!marketingRoot) {
      setIsMarketing(false);
      setBannerOpen(false);
      setPreferencesOpen(false);
      return;
    }

    setIsMarketing(true);

    const existing = readConsent();
    setBannerOpen(!existing);
    setPreferencesOpen(false);
    if (existing) {
      setAnalytics(existing.analytics);
      // Migrate previous consent decisions to the shared cookie.
      writeCookie(SHARED_COOKIE_NAME, existing.analytics ? "accepted" : "declined");
      writeCookie(CONSENT_COOKIE_NAME, existing.analytics ? "all" : "essential");
      document.documentElement.dataset.analyticsConsent = existing.analytics ? "granted" : "denied";
    } else {
      document.documentElement.dataset.analyticsConsent = "pending";
    }

    const openPreferences = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setBannerOpen(false);
      setPreferencesOpen(true);
    };

    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
  }, [pathname]);

  const closePreferences = () => {
    setPreferencesOpen(false);
    // Closing settings without making a decision must not silently dismiss consent.
    if (!readConsent()) setBannerOpen(true);
  };

  useEffect(() => {
    if (!preferencesOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setPreferencesOpen(false); if (!readConsent()) setBannerOpen(true); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [preferencesOpen]);

  if (!isMarketing) return null;

  const save = (allowAnalytics: boolean) => {
    persistConsent(allowAnalytics);
    setAnalytics(allowAnalytics);
    setBannerOpen(false);
    setPreferencesOpen(false);
  };


  return (
    <>

      {bannerOpen ? (
        <aside className="biloo-consent-banner" aria-labelledby="biloo-consent-title" aria-describedby="biloo-consent-description">
          <div className="biloo-consent-icon" aria-hidden="true"><ShieldCheck width={22} height={22} strokeWidth={1.75} /></div>
          <div className="biloo-consent-copy">
            <span>PRIVACY AT BILOO</span>
            <h2 id="biloo-consent-title">Your privacy. Your choice.</h2>
            <p id="biloo-consent-description">Essential cookies keep Biloo secure. With your permission, optional analytics helps us improve the website. You can change your choice anytime.</p>
            <p className="biloo-consent-links"><Link href="/privacy#cookies">Privacy &amp; cookies</Link><span aria-hidden="true">·</span><Link href="/terms">Terms</Link></p>
          </div>
          <div className="biloo-consent-actions">
            <button type="button" className="biloo-consent-primary" onClick={() => save(true)}>Accept all</button>
            <button type="button" className="biloo-consent-secondary" onClick={() => save(false)}>Essential only</button>
            <button type="button" className="biloo-consent-text" onClick={() => { setBannerOpen(false); setPreferencesOpen(true); }}>Customize preferences</button>
          </div>
        </aside>
      ) : null}

      {preferencesOpen ? (
        <div className="biloo-consent-modal" role="presentation">
          <button className="biloo-consent-backdrop" type="button" aria-label="Close cookie preferences" onClick={closePreferences} />
          <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="biloo-preferences-title" className="biloo-consent-dialog">
            <header>
              <div className="biloo-consent-icon"><ShieldCheck width={23} height={23} strokeWidth={1.55} aria-hidden /></div>
              <div><span>PRIVACY CONTROL CENTER</span><h2 id="biloo-preferences-title">Choose how Biloo uses storage.</h2></div>
              <button type="button" className="biloo-consent-close" aria-label="Close cookie preferences" onClick={closePreferences}><Xmark width={19} height={19} strokeWidth={1.55} aria-hidden /></button>
            </header>

            <p className="biloo-consent-dialog-intro">Essential cookies protect the website and remember your preferences. Optional analytics is never required to browse Biloo.</p>

            <div className="biloo-consent-category">
              <div><strong>Essential</strong><span>Security, consent records and display preferences.</span></div>
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

/** Render with the footer so client navigation cannot leave a portal in a detached page. */
export function MarketingLegalFooter() {
  return (
    <div className="biloo-footer-legal" aria-label="Legal and privacy links">
      <div>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Website Terms</Link>
        <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))}>Cookie settings</button>
      </div>
      <span>Privacy-conscious by design · Preferences can be changed at any time</span>
    </div>
  );
}
