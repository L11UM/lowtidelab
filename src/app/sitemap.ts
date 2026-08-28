import type { MetadataRoute } from "next";

const siteUrl = "https://lowtidelab.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/projects", "/lab", "/blog", "/about"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
