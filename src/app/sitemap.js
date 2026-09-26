import { categories } from "@/lib/booksData";

// Update this once the real production domain is live (also update
// SITE_URL in layout.js and the Sitemap line in public/robots.txt to match).
const SITE_URL = "https://kitaabistan.app";

export default function sitemap() {
  const staticRoutes = ["", "/login", "/signup", "/privacy", "/terms"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.5,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/library/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
