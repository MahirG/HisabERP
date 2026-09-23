"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_KEY = "biloo-cookie-consent-v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const choice = window.localStorage.getItem(COOKIE_KEY);
      setVisible(choice !== "accepted" && choice !== "declined");
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (value: "accepted" | "declined") => {
    try { window.localStorage.setItem(COOKIE_KEY, value); } catch {}
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
