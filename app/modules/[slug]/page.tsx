import Link from "next/link";
import { notFound } from "next/navigation";
import { erpModules, getErpModule } from "../../../lib/erp-modules";

export function generateStaticParams() {
  return erpModules.map((module) => ({ slug: module.slug }));
}

export default async function ModuleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const module = getErpModule(slug);

  if (!module) notFound();

  return (
    <main className="module-detail-page">
      <div className="module-detail-inner">
        <Link className="back-link" href="/modules">← All ERP modules</Link>
        <header className="module-detail-header">
          <div>
            <p className="eyebrow">Phase {module.phase} · {module.priority}</p>
            <h1>{module.title}</h1>
            <p>{module.description}</p>
          </div>
          <span className={`priority-badge phase-${module.phase}`}>Implementation phase {module.phase}</span>
        </header>

        <section className="module-detail-grid">
          <article className="detail-panel">
            <p className="eyebrow">Business capabilities</p>
            <h2>What this module will manage</h2>
            <ul className="feature-checklist">
              {module.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}
            </ul>
          </article>
          <article className="detail-panel control-panel">
            <p className="eyebrow">Controls and governance</p>
            <h2>What makes it ERP-grade</h2>
            <ul className="feature-checklist">
              {module.controls.map((control) => <li key={control}><span>✓</span>{control}</li>)}
            </ul>
          </article>
        </section>

        <section className="implementation-banner">
          <div>
            <p className="eyebrow">Implementation status</p>
            <h2>Architecture defined — workflow development is next</h2>
            <p>The module contract, required capabilities and controls are now documented in the application. Database tables, permissions, forms and posting logic will be implemented incrementally.</p>
          </div>
          <Link href="/">Return to dashboard</Link>
        </section>
      </div>
    </main>
  );
}
