import { publicMetadata } from "../lib/seo";
import type { Metadata } from "next";
import "./home-award-2026.css";
import { CampfireMarketingHome } from "../components/campfire-marketing-home";
import { MarketingPageShell } from "../components/marketing-site-chrome";
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = publicMetadata("/", "ERP Software in Ethiopia", "Explore Biloo ERP for connected sales, inventory, finance and reporting. Compare ETB plans and request a demo for your Ethiopian business.");

export default function HomePage() {
  return (
    <MarketingPageShell>
      <CampfireMarketingHome />
    </MarketingPageShell>
  );
}
