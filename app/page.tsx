import { MarketingHome } from "../components/marketing-home";
import "./apple-smooth-public.css";
import "./home-text-hero.css";
import "./home-dashboard-imac-final.css";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function HomePage() {
  return <MarketingHome />;
}
