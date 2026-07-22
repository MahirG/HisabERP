import { MarketingHome } from "../components/marketing-home";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function HomePage() {
  return <MarketingHome />;
}
