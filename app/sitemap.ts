import type { MetadataRoute } from "next";
import { helpArticles } from "../lib/help-center-content";
import { marketingComparisons } from "../lib/marketing-comparisons";
import { marketingIndustries } from "../lib/marketing-industries";
import { marketingModules } from "../lib/marketing-modules";

const baseUrl = "https://www.hisabtech.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/product-tour", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/ethiopia", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/industries", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/customer-stories", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/trust", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/integrations", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/migration", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/compare", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/help-center", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/request-demo", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  return [
    ...staticPages.map((page) => ({ url: `${baseUrl}${page.path}`, lastModified: now, changeFrequency: page.changeFrequency, priority: page.priority })),
    ...marketingModules.map((module) => ({ url: `${baseUrl}/product/${module.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...marketingIndustries.map((industry) => ({ url: `${baseUrl}/industries/${industry.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...marketingComparisons.map((comparison) => ({ url: `${baseUrl}/compare/${comparison.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.75 })),
    ...helpArticles.map((article) => ({ url: `${baseUrl}/help-center/${article.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
