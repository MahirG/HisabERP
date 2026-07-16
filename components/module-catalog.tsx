import Link from "next/link";
import { erpModules, type ModulePriority } from "../lib/erp-modules";

const priorityCopy: Record<ModulePriority, string> = {
  "Must have": "Required for a dependable ERP foundation",
  "Should have": "Important as the company and team grow",
  Growth: "Add after core operations are stable",
};

export function ModuleCatalog() {
  const priorities: ModulePriority[] = ["Must have", "Should have", "Growth"];

  return (
    <main className="module-page">
      <div className="module-page-inner">
        <header className="module-hero">
          <div>
            <Link className="back-link" href="/">← Back to dashboard</Link>
            <p className="eyebrow">Hisab ERP architecture</p>
            <h1>Modules companies need to operate with control</h1>
            <p className="module-intro">
              Hisab ERP is organized around complete business workflows, not isolated screens. The first phase prioritizes finance, sales, purchasing, inventory, business contacts, reporting, security and local compliance.
            </p>
          </div>
          <div className="roadmap-summary">
            <strong>{erpModules.length}</strong>
            <span>planned ERP modules</span>
            <div><b>8</b> required in Phase 1</div>
            <div><b>3</b> operational modules in Phase 2</div>
            <div><b>1</b> growth platform in Phase 3</div>
          </div>
        </header>

        {priorities.map((priority) => {
          const modules = erpModules.filter((module) => module.priority === priority);
          return (
            <section className="module-group" key={priority}>
              <div className="module-group-head">
                <div>
                  <p className="eyebrow">{priority}</p>
                  <h2>{priorityCopy[priority]}</h2>
                </div>
                <span>{modules.length} modules</span>
              </div>
              <div className="module-grid">
                {modules.map((module) => (
                  <Link className="module-card" href={`/modules/${module.slug}`} key={module.slug}>
                    <div className="module-card-top">
                      <span className={`priority-badge phase-${module.phase}`}>Phase {module.phase}</span>
                      <span className="module-arrow">↗</span>
                    </div>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                    <ul>
                      {module.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}
                    </ul>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
