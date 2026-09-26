import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/checkout/", "/cart/", "/login/"],
    },
    sitemap: "https://alsayyedah.us.ci/sitemap.xml",
  };
}
