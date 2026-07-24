export function HeroOfficeWorkspace() {
  return (
    <figure className="hero-office-scene" aria-label="An Ethiopian business professional using HisabERP on a laptop in a modern office">
      <div className="hero-office-frame">
        <img
          src="/api/homepage-hero"
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
