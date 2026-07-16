"use client";

import { getFoundationCopy } from "../lib/foundation-copy";
import { useLanguage } from "../components/language-provider";

export default function Loading() {
  const { language } = useLanguage();
  return <main className="loading-page" aria-live="polite"><div className="loading-mark">H</div><p>{getFoundationCopy(language).errors.loading}</p></main>;
}
