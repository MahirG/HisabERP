import Image from "next/image";

export function HeroOfficeWorkspace() {
  return (
    <figure className="hero-office-scene" aria-label="An Ethiopian business professional using HisabERP on a laptop in a modern office">
      <div className="hero-office-frame">
        <Image
          src="/hisab-ethiopian-office-hero.webp"
          alt="Ethiopian business professional facing a laptop that displays the HisabERP dashboard in a modern office"
          width={1672}
          height={941}
          priority
          sizes="(max-width: 760px) 100vw, min(1180px, calc(100vw - 40px))"
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
