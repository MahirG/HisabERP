import Link from "next/link";
import { LanguageSelector } from "../../../components/language-provider";
import { getServerFoundationCopy } from "../../../lib/server-locale";

export const metadata = { title: "Production setup" };

export default async function SetupPage() {
  const { copy } = await getServerFoundationCopy();
  const c = copy.setup;
  return <main className="section-page"><article className="documentation"><div className="module-toolbar"><Link href="/" className="back-link">← {c.back}</Link><LanguageSelector/></div><p className="eyebrow">{c.label}</p><h1>{c.title}</h1><ol>{c.steps.map((step) => <li key={step}>{step}</li>)}</ol><h2>{c.controlsTitle}</h2><p>{c.controlsText}</p><h2>{c.backupsTitle}</h2><p>{c.backupsText}</p></article></main>;
}
