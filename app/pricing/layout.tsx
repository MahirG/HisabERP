import type { ReactNode } from "react";
import "./pricing-finish.css";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function PricingPublicLayout({ children }: { children: ReactNode }) {
  return children;
}
