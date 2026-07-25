import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

async function readHeroImage(filename: string) {
  const encoded = await readFile(path.join(process.cwd(), "public", filename), "utf8");
  return `data:image/webp;base64,${encoded.trim()}`;
}

export async function HeroOfficeWorkspace() {
  const primaryImage = await readHeroImage("hisab-ethiopian-office-hero.webp");

  return (
    <section className="hero-marketing-slider hero-marketing-single" aria-label="HisabTech ERP">
      <div className="hero-marketing-track">
        <article className="hero-marketing-slide is-active" aria-label="HisabTech ERP hero banner">
          <img
            src={primaryImage}
            alt="Ethiopian business professional using the HisabTech ERP dashboard on a laptop"
            width="1600"
            height="686"
            fetchPriority="high"
            decoding="async"
            className="hero-marketing-image"
          />
          <div className="hero-marketing-shade" aria-hidden="true" />
          <div className="hero-marketing-content">
            <span className="hero-marketing-eyebrow">HisabTech ERP</span>
            <h1 className="hero-marketing-heading">Run Your Business with Clarity</h1>
            <p>Bring sales, inventory, finance, and reporting into one powerful Ethiopian-ready workspace.</p>
            <div className="hero-marketing-actions">
              <Link href="/request-demo?source=homepage-hero" className="hero-marketing-primary">
                Request a Demo
              </Link>
              <Link href="/product-tour" className="hero-marketing-secondary">
                Explore Features
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
