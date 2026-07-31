import type { Metadata } from "next";
import { WishpondMarketingHome } from "../components/wishpond-marketing-home";
import "./home-wishpond-redesign.css";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "HisabTech | Biloo ERP for Ethiopian Businesses",
  description:
    "Biloo ERP by HisabTech connects sales, finance, inventory, customers, suppliers and management reporting in one polished operating system for Ethiopian businesses.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "HisabTech | Run Your Business With Clarity Built In",
    description:
      "A connected ERP for sales, finance, inventory, controls and live management visibility—built around Ethiopian business operations.",
    url: "/",
    type: "website",
    images: [{ url: "/hisab-logo.svg", width: 512, height: 512, alt: "HisabTech Biloo ERP" }],
  },
};

export default function HomePage() {
  // Keep the production homepage pinned to the polished marketing experience.
  return <WishpondMarketingHome />;
}
