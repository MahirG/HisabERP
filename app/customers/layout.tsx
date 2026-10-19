import "../internal-styles";
import "./customers-polish.css";
import type { ReactNode } from "react";

/** Load the shared workspace styles before this route is painted. */
export default function InternalLayout({ children }: { children: ReactNode }) {
  return children;
}
