import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HisabTech — HisabERP",
    short_name: "HisabERP",
    description: "A multilingual business operating system for Ethiopian organizations.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff5f0",
    theme_color: "#DA7757",
    categories: ["business", "finance", "productivity"],
    icons: [
      { src: "/hisab-logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/hisab-logo.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
