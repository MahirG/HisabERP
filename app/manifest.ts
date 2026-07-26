import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Biloo ERP — Biloo ERP",
    short_name: "Biloo ERP",
    description: "A multilingual business operating system for Ethiopian organizations.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["business", "finance", "productivity"],
    icons: [
      { src: "/biloo-erp-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/biloo-erp-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
