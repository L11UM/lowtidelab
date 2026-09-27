import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/posts";

const siteUrl = "https://lowtidelab.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/tides", "/piers", "/coast", "/blog", "/lab", "/projects", "/about"];

  return [...routes, ...getAllPostSlugs().map((slug) => `/blog/${slug}`)].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/blog/") ? "monthly" : "weekly",
    priority: route === "" ? 1 : route === "/tides" || route === "/coast" ? 0.9 : 0.7,
  }));
}
