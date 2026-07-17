import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSelector } from "./language-provider";

export function EmailAuthCard({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer?: ReactNode }) {
  return <main className="auth-page auth-premium-page"><div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/><section className="auth-shell"><aside className="auth-showcase"><Link href="/" className="auth-showcase-brand"><span>H</span><strong>HisabTech</strong></Link><div className="auth-showcase-content"><span className="auth-badge"><i/> Secure business access</span><h2>One trusted identity for every business you manage.</h2><p>Protected sessions, organization-isolated records and clear recovery flows for modern teams.</p></div><div className="auth-showcase-footer"><span>●</span>HisabTech security center</div></aside><section className="auth-card auth-form-panel"><div className="auth-top"><Link href="/" className="auth-brand auth-mobile-brand"><span>H</span><strong>HisabTech</strong></Link><LanguageSelector/></div><div className="auth-heading"><p className="eyebrow">Secure account</p><h1>{title}</h1><p>{description}</p></div>{children}{footer && <div className="auth-switch">{footer}</div>}</section></section></main>;
}

export function AuthNotice({ type, children }: { type: "error" | "success" | "warning"; children?: ReactNode }) {
  return children ? <div className={`form-alert ${type}`} role={type === "error" ? "alert" : "status"}>{children}</div> : null;
}
