import { MarketingHome } from "../components/marketing-home";
import "./apple-smooth-public.css";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function HomePage() {
  return <MarketingHome />;
}
