import type { MetadataRoute } from "next";

const siteUrl = "https://lowtidelab.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/tides", "/piers", "/fishing-report", "/coast", "/treys-corner", "/lab", "/projects", "/about"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route === "/tides" || route === "/coast" ? 0.9 : 0.7,
  }));
}
