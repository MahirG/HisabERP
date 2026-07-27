import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Biloo — Biloo ERP",
    short_name: "Biloo",
    description: "A multilingual business operating system for Ethiopian organizations.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["business", "finance", "productivity"],
    icons: [
      { src: "/hisab-logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/hisab-logo.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
