import type { Metadata } from "next";
import { CampfireMarketingHome } from "../components/campfire-marketing-home";
import "./home-campfire-redesign.css";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "HisabTech | Biloo ERP for Ethiopian Businesses",
  description:
    "Biloo ERP by HisabTech connects sales, finance, inventory, customers, suppliers and management reporting in one modern operating system for Ethiopian businesses.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "HisabTech | The Connected Business Operating System",
    description:
      "Run sales, finance, inventory and management reporting from one connected ERP built for ambitious Ethiopian organizations.",
    url: "/",
    type: "website",
    images: [{ url: "/hisab-logo.svg", width: 512, height: 512, alt: "HisabTech Biloo ERP" }],
  },
};

export default function HomePage() {
  return <CampfireMarketingHome />;
}
