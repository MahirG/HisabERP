import { readFile } from "node:fs/promises";
import path from "node:path";

export async function HeroOfficeWorkspace() {
  const encodedImage = await readFile(
    path.join(process.cwd(), "public", "hisab-ethiopian-office-hero.webp"),
    "utf8",
  );
  const imageSource = `data:image/webp;base64,${encodedImage.trim()}`;

  return (
    <figure className="hero-office-scene" aria-label="An Ethiopian business professional using HisabERP on a laptop in a modern office">
      <div className="hero-office-frame">
        <img
          src={imageSource}
          alt="Ethiopian business professional facing a laptop that displays the HisabERP dashboard in a modern office"
          width="640"
          height="360"
          fetchPriority="high"
          decoding="async"
          className="hero-office-image"
        />
        <span className="hero-office-light" aria-hidden="true" />
      </div>
      <figcaption className="sr-only">
        HisabERP running on a laptop while an Ethiopian professional works in a modern office.
      </figcaption>
    </figure>
  );
}
