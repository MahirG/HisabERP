import type { ReactNode } from "react";
import "./product-tour-finish.css";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function ProductTourPublicLayout({ children }: { children: ReactNode }) {
  return children;
}
