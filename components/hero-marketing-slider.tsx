"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type HeroMarketingSlide = {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

type HeroMarketingSliderProps = {
  slides: HeroMarketingSlide[];
};

const AUTOPLAY_MS = 6500;

export function HeroMarketingSlider({ slides }: HeroMarketingSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const showSlide = useCallback(
    (index: number) => {
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const timer = window.setInterval(showNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, showNext, slides.length]);

  return (
    <section
      className="hero-marketing-slider"
      aria-label="Biloo ERP ERP highlights"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") showPrevious();
        if (event.key === "ArrowRight") showNext();
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start == null || end == null || Math.abs(start - end) < 48) return;
        if (start > end) showNext();
        else showPrevious();
      }}
    >
      <div className="hero-marketing-track">
        {slides.map((slide, index) => {
          const active = index === activeIndex;
          const panelId = `hero-marketing-slide-${index + 1}`;
          const Heading = index === 0 ? "h1" : "h2";

          return (
            <article
              id={panelId}
              className={`hero-marketing-slide${active ? " is-active" : ""}`}
              aria-hidden={!active}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              key={slide.title}
            >
              <img
                src={slide.imageSrc}
                alt={slide.imageAlt}
                width="1600"
                height="686"
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
                className="hero-marketing-image"
              />
              <div className="hero-marketing-shade" aria-hidden="true" />
              <div className="hero-marketing-content">
                <span className="hero-marketing-eyebrow">{slide.eyebrow}</span>
                <Heading className="hero-marketing-heading">{slide.title}</Heading>
                <p>{slide.description}</p>
                <div className="hero-marketing-actions">
                  <Link href={slide.primary.href} className="hero-marketing-primary" tabIndex={active ? 0 : -1}>
                    {slide.primary.label}
                  </Link>
                  <Link href={slide.secondary.href} className="hero-marketing-secondary" tabIndex={active ? 0 : -1}>
                    {slide.secondary.label}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hero-marketing-controls">
        <div className="hero-marketing-dots" role="tablist" aria-label="Choose a hero slide">
          {slides.map((slide, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-controls={`hero-marketing-slide-${index + 1}`}
              aria-label={`Show slide ${index + 1}: ${slide.title}`}
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => showSlide(index)}
              key={slide.title}
            >
              <span />
            </button>
          ))}
        </div>
        <div className="hero-marketing-arrows">
          <button type="button" onClick={showPrevious} aria-label="Show previous hero slide">
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" onClick={showNext} aria-label="Show next hero slide">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
