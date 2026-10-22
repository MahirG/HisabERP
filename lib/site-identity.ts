export const siteIdentity = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": "https://hisabtech.com/#organization",
      name: "Hisab Technologies", url: "https://hisabtech.com/",
      logo: "https://hisabtech.com/hisab-logo.svg", email: "mahir@hisabtech.com", telephone: "+251924093037",
      address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
    },
    {
      "@type": "WebSite", "@id": "https://hisabtech.com/#website", name: "Biloo by Hisab Technologies",
      url: "https://hisabtech.com/", inLanguage: "en", publisher: { "@id": "https://hisabtech.com/#organization" },
    },
    {
      "@type": "SoftwareApplication", "@id": "https://hisabtech.com/#biloo-erp", name: "Biloo ERP",
      applicationCategory: "BusinessApplication", operatingSystem: "Web", url: "https://hisabtech.com/product-tour",
      description: "Business software for sales, inventory, purchasing, finance and reporting for Ethiopian organizations.",
      publisher: { "@id": "https://hisabtech.com/#organization" },
    },
  ],
};
