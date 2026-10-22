"use client";

import NextLink from "next/link";
import { useState, type ComponentProps } from "react";

/** Prefetch on intent instead of downloading every visible footer destination. */
export function MarketingLink({ prefetch, onPointerEnter, onFocus, ...props }: ComponentProps<typeof NextLink>) {
  const [intent, setIntent] = useState(false);
  const prepare = () => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;
    setIntent(true);
  };
  return <NextLink {...props} prefetch={prefetch === false || !intent ? false : null}
    onPointerEnter={(event) => { prepare(); onPointerEnter?.(event); }}
    onFocus={(event) => { prepare(); onFocus?.(event); }} />;
}
