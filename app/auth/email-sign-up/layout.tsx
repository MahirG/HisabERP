import type { ReactNode } from "react";
import "../login/login-finish.css";
import "./signup-finish.css";

/** Auth pages intentionally share login's header, field and button authority. */
export default function EmailSignUpLayout({children}:{children:ReactNode}) {
  return children;
}
