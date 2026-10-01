import type { MetadataRoute } from "next";

const siteUrl = "https://lowtidelab.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/piers", "/fishing-report", "/treys-corner", "/lab", "/projects", "/about"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route === "/fishing-report" || route === "/piers" ? 0.9 : 0.7,
  }));
}
