"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type HeroImageBannerSlide = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  links: Array<{
    label: string;
    href: string;
    className: string;
  }>;
};

type HeroImageBannerSliderProps = {
  slides: HeroImageBannerSlide[];
};

const AUTOPLAY_MS = 6500;
const SWIPE_THRESHOLD_PX = 48;

export function HeroImageBannerSlider({ slides }: HeroImageBannerSliderProps) {
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
    if (
      paused ||
      slides.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const timer = window.setInterval(showNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, showNext, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="hero-banner-slider"
      aria-label="HisabTech ERP homepage banners"
      aria-roledescription="carousel"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
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

        if (start == null || end == null || Math.abs(start - end) < SWIPE_THRESHOLD_PX) {
          return;
        }

        if (start > end) showNext();
        else showPrevious();
      }}
    >
      <div className="hero-banner-track">
        {slides.map((slide, index) => {
          const active = index === activeIndex;
          const slideId = `hero-banner-slide-${index + 1}`;

          return (
            <article
              id={slideId}
              className={`hero-banner-slide${active ? " is-active" : ""}`}
              aria-hidden={!active}
              aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
              aria-roledescription="slide"
              key={slide.title}
            >
              <img
                src={slide.imageSrc}
                alt={slide.imageAlt}
                width="1024"
                height="439"
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
                className="hero-banner-image"
              />

              {slide.links.map((link) => (
                <Link
                  href={link.href}
                  aria-label={link.label}
                  title={link.label}
                  className={`hero-banner-hotspot ${link.className}`}
                  tabIndex={active ? 0 : -1}
                  key={link.label}
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </article>
          );
        })}
      </div>

      <div className="hero-banner-controls">
        <div className="hero-banner-dots" role="tablist" aria-label="Choose a hero banner">
          {slides.map((slide, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-controls={`hero-banner-slide-${index + 1}`}
              aria-label={`Show ${slide.title}`}
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => showSlide(index)}
              key={slide.title}
            >
              <span />
            </button>
          ))}
        </div>

        <div className="hero-banner-arrows">
          <button type="button" onClick={showPrevious} aria-label="Show previous hero banner">
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" onClick={showNext} aria-label="Show next hero banner">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
