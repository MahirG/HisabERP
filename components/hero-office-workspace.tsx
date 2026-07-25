import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  HeroImageBannerSlider,
  type HeroImageBannerSlide,
} from "./hero-image-banner-slider";

async function readChunkedHero(prefix: string, chunkCount: number) {
  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, index) =>
      readFile(
        path.join(
          process.cwd(),
          "public",
          "hero-assets",
          `${prefix}.part-${String(index + 1).padStart(2, "0")}`,
        ),
        "utf8",
      ),
    ),
  );

  return `data:image/webp;base64,${chunks.join("").replace(/\s+/g, "")}`;
}

export async function HeroOfficeWorkspace() {
  const [workSmarterImage, clarityImage] = await Promise.all([
    readChunkedHero("slide-1", 5),
    readChunkedHero("slide-2", 4),
  ]);

  const slides: HeroImageBannerSlide[] = [
    {
      title: "Work Smarter, Wherever Business Happens",
      imageSrc: workSmarterImage,
      imageAlt:
        "Ethiopian professional using HisabTech ERP outdoors with Work Smarter website message",
      links: [
        {
          label: "See the Dashboard",
          href: "/product-tour",
          className: "slide-one-primary",
        },
        {
          label: "Talk to Sales",
          href: "/request-demo?source=homepage-slider",
          className: "slide-one-secondary",
        },
      ],
    },
    {
      title: "Run Your Business with Clarity",
      imageSrc: clarityImage,
      imageAlt:
        "Ethiopian professional using HisabTech ERP outdoors with Run Your Business with Clarity website message",
      links: [
        {
          label: "Request a Demo",
          href: "/request-demo?source=homepage-hero",
          className: "slide-two-primary",
        },
        {
          label: "Explore Features",
          href: "/product-tour",
          className: "slide-two-secondary",
        },
      ],
    },
  ];

  return <HeroImageBannerSlider slides={slides} />;
}
