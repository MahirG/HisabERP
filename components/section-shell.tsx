"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { getFoundationCopy } from "../lib/foundation-copy";
import { LanguageSelector, useLanguage } from "./language-provider";

export function SectionShell({ title, description, children, actions }: { title: string; description: string; children: ReactNode; actions?: ReactNode }) {
  const { language } = useLanguage();
  const common = getFoundationCopy(language).common;
  return (
    <main className="section-page">
      <div className="section-container">
        <header className="section-header">
          <div>
            <Link href="/" className="back-link">← {common.dashboard}</Link>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="section-actions"><LanguageSelector />{actions}</div>
        </header>
        {children}
      </div>
    </main>
  );
}
