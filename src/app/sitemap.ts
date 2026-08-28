import type { MetadataRoute } from "next";

const siteUrl = "https://yourname.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/projects", "/lab", "/about"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
