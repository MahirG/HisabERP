"use client";

import Link from "next/link";
import { HelpCenterPanel } from "./help-center-panel";
import { LanguageSelector } from "./language-provider";

export function HelpCenterPage() {
  return (
    <main className="help-center-page">
      <div className="help-center-page-toolbar">
        <Link href="/" className="back-link">← Dashboard</Link>
        <LanguageSelector />
      </div>
      <div className="help-center-page-frame">
        <header className="help-center-page-header">
          <p>HisabTech support</p>
          <h1>Help Center</h1>
          <span>Complete product guidance for setup, daily operations, finance, security, and troubleshooting.</span>
        </header>
        <HelpCenterPanel activeLabel="the Help Center" onNavigate={() => undefined} />
      </div>
    </main>
  );
}
