import { readFile } from "node:fs/promises";
import path from "node:path";
import { HeroMarketingSlider, type HeroMarketingSlide } from "./hero-marketing-slider";

async function readHeroImage(filename: string) {
  const encoded = await readFile(path.join(process.cwd(), "public", filename), "utf8");
  return `data:image/webp;base64,${encoded.trim()}`;
}

export async function HeroOfficeWorkspace() {
  const [primaryImage, secondaryImage] = await Promise.all([
    readHeroImage("hisab-ethiopian-office-hero.webp"),
    readHeroImage("hisab-ethiopian-office-hero-2.webp"),
  ]);

  const slides: HeroMarketingSlide[] = [
    {
      eyebrow: "HisabTech ERP",
      title: "Run Your Business with Clarity",
      description: "Bring sales, inventory, finance, and reporting into one powerful Ethiopian-ready workspace.",
      imageSrc: primaryImage,
      imageAlt: "Ethiopian business professional using the HisabTech ERP dashboard on a laptop",
      primary: { label: "Request a Demo", href: "/request-demo?source=homepage-hero" },
      secondary: { label: "Explore Features", href: "/product-tour" },
    },
    {
      eyebrow: "Built for Modern Ethiopian Business",
      title: "Work Smarter, Wherever Business Happens",
      description: "Track cash flow, monitor operations, and make faster decisions from one connected ERP platform.",
      imageSrc: secondaryImage,
      imageAlt: "Ethiopian digital professional working remotely with HisabTech ERP displayed on a laptop",
      primary: { label: "See the Dashboard", href: "/product-tour" },
      secondary: { label: "Talk to Sales", href: "/request-demo?source=homepage-slider" },
    },
  ];

  return <HeroMarketingSlider slides={slides} />;
}
