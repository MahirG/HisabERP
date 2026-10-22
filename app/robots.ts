import type { MetadataRoute } from "next";
import { SITE_URL, isSearchPreview } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Auth screens stay crawlable so their noindex directive can be read.
    // Access controls protect workspaces independently of this crawl policy.
    rules: [{ userAgent: "*", ...(isSearchPreview ? { disallow: "/" } : { allow: "/", disallow: ["/api/", "/workspace-home", "/account", "/security", "/onboarding", "/modules", "/billing", "/checkout", "/docs", "/finance", "/sales", "/inventory", "/customers", "/reports", "/purchasing", "/hr", "/reconciliation", "/e-invoicing"] }) }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
