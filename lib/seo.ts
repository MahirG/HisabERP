import type { Metadata } from "next";

/** The production www hostname redirects to this apex origin. */
export const SITE_URL = "https://hisabtech.com";
export const SOCIAL_IMAGE = "/biloo-erp-social.png";
export const isSearchPreview = process.env.VERCEL_ENV === "preview";

export function publicMetadata(path: string, title: string, description: string, article?: { published: string; modified?: string }): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const brand = path === "/" ? "Biloo by Hisab Technologies" : path === "/services" || path === "/about" ? "Hisab Technologies" : "Biloo";
  return {
    title: { absolute: `${title} | ${brand}` },
    description,
    alternates: { canonical: url },
    robots: {
      index: !isSearchPreview, follow: true,
      googleBot: { index: !isSearchPreview, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      title, description, url, siteName: "Biloo by Hisab Technologies", locale: "en_ET",
      type: article ? "article" : "website",
      ...(article ? { publishedTime: article.published, modifiedTime: article.modified || article.published, authors: ["Hisab Technologies"] } : {}),
      images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: "Biloo ERP by Hisab Technologies — built for Ethiopian businesses" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [SOCIAL_IMAGE] },
  };
}

export function breadcrumbData(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: new URL(item.path, SITE_URL).toString() })),
  };
}

export function articleData(article: { slug: string; title: { en: string }; summary: { en: string }; published: string; modified?: string }) {
  return {
    "@context": "https://schema.org", "@type": "Article",
    "@id": `${SITE_URL}/resources/${article.slug}#article`,
    headline: article.title.en, description: article.summary.en,
    mainEntityOfPage: `${SITE_URL}/resources/${article.slug}`,
    datePublished: `${article.published}T00:00:00+03:00`,
    dateModified: `${article.modified || article.published}T00:00:00+03:00`,
    inLanguage: "en", image: `${SITE_URL}${SOCIAL_IMAGE}`,
    author: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Hisab Technologies", url: `${SITE_URL}/about` },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Hisab Technologies", logo: { "@type": "ImageObject", url: `${SITE_URL}/hisab-logo.svg` } },
  };
}
