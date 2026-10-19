"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_KEY = "biloo-cookie-consent-v1";
const COOKIE_NAME = "biloo_cookie_consent_v1";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 180 days
type CookieChoice = "accepted" | "declined";

function isChoice(value: string | null | undefined): value is CookieChoice {
  return value === "accepted" || value === "declined";
}

/** First-party cookie also works across hisabtech.com / www / ERP subdomains. */
function readCookieChoice(): CookieChoice | null {
  try {
    const cookie = document.cookie
      .split(";")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${COOKIE_NAME}=`));
    const choice = cookie ? cookie.slice(COOKIE_NAME.length + 1) : null;
    return isChoice(choice) ? choice : null;
  } catch {
    return null;
  }
}

function readLocalChoice(): CookieChoice | null {
  try {
    const choice = window.localStorage.getItem(COOKIE_KEY);
    return isChoice(choice) ? choice : null;
  } catch {
    return null;
  }
}

function writeChoice(choice: CookieChoice) {
  try {
    const parts = [
      `${COOKIE_NAME}=${choice}`,
      "Path=/",
      `Max-Age=${CONSENT_MAX_AGE}`,
      "SameSite=Lax",
    ];
    if (window.location.protocol === "https:") parts.push("Secure");
    const hostname = window.location.hostname;
    if (hostname === "hisabtech.com" || hostname.endsWith(".hisabtech.com")) {
      parts.push("Domain=hisabtech.com");
    }
    document.cookie = parts.join("; ");
  } catch {
    // Continue: local storage may still be available.
  }
  try {
    window.localStorage.setItem(COOKIE_KEY, choice);
  } catch {
    // Some mobile in-app browsers block web storage, so use the cookie.
  }
}

function storedChoice(): CookieChoice | null {
  // A first-party cookie takes priority if preferences were changed on another
  // Biloo subdomain. Import older localStorage-only choices into the cookie.
  const fromCookie = readCookieChoice();
  if (fromCookie) return fromCookie;
  const fromStorage = readLocalChoice();
  if (fromStorage) writeChoice(fromStorage);
  return fromStorage;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const synchronize = () => setVisible(storedChoice() === null);
    synchronize();
    const onStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_KEY || event.key === null) synchronize();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", synchronize);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", synchronize);
    };
  }, []);

  const decide = (value: CookieChoice) => {
    writeChoice(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="biloo-cookie-banner" role="dialog" aria-label="Cookie preferences">
      <div className="biloo-cookie-copy">
        <strong>Privacy &amp; cookies</strong>
        <p>We use essential cookies to keep Biloo secure and remember your preferences. See our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms</Link>.</p>
      </div>
      <div className="biloo-cookie-actions">
        <button type="button" className="biloo-cookie-decline" onClick={() => decide("declined")}>Decline</button>
        <button type="button" className="biloo-cookie-accept" onClick={() => decide("accepted")}>Accept</button>
      </div>
    </aside>
  );
}
