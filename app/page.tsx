import type { Metadata } from "next";
import { MarketingHeader } from "../components/marketing-site-chrome";
import { WishpondMarketingHome } from "../components/wishpond-marketing-home";
import "./home-wishpond-redesign.css";
import "./home-unified-marketing-navigation.css";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Biloo ERP for Ethiopian Businesses",
  description:
    "Biloo ERP connects sales, finance, inventory, customers, suppliers and management reporting in one polished operating system for Ethiopian businesses.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Biloo ERP | Run Your Business With Clarity Built In",
    description:
      "A connected ERP for sales, finance, inventory, controls and live management visibility—built around Ethiopian business operations.",
    url: "/",
    type: "website",
    images: [{ url: "/hisab-logo.svg", width: 512, height: 512, alt: "Biloo ERP" }],
  },
};

export default function HomePage() {
  return (
    <div className="marketing-site marketing-site-v2 marketing-home-unified">
      <MarketingHeader />
      <div id="public-main-content">
        <WishpondMarketingHome />
      </div>
    </div>
  );
}
