import { readFileSync, writeFileSync } from "node:fs";

function configuredSiteUrl() {
  let fileValue = "";
  try {
    fileValue = readFileSync(new URL("../.env.production", import.meta.url), "utf8")
      .split("\n")
      .find((line) => line.startsWith("NEXT_PUBLIC_SITE_URL="))
      ?.slice("NEXT_PUBLIC_SITE_URL=".length)
      .trim() ?? "";
  } catch {
    fileValue = "";
  }
  const value = process.env.NEXT_PUBLIC_SITE_URL || fileValue;
  if (!value) throw new Error("NEXT_PUBLIC_SITE_URL is required for production SEO output.");
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
  }
  if (url.protocol !== "https:" || url.hostname === "localhost" || url.hostname.endsWith(".example") || url.hostname === "example.com") {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a non-local HTTPS production origin.");
  }
  return url.toString().replace(/\/$/, "");
}

const origin = configuredSiteUrl();
const routes = JSON.parse(readFileSync(new URL("../src/data/routes.json", import.meta.url), "utf8"));
const urls = Object.values(routes)
  .filter((route) => route.indexable)
  .flatMap((route) => ["en", "es", "ar"].map((locale) => `${origin}/${route[locale]}`.replace(/\/$/, "") + "/"));
const unique = [...new Set(urls)].sort();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((url) => `  <url><loc>${url}</loc><lastmod>2026-11-24</lastmod></url>`).join("\n")}\n</urlset>\n`;
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), sitemap);
writeFileSync(new URL("../public/robots.txt", import.meta.url), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Generated sitemap and robots.txt for ${unique.length} localized routes at ${origin}`);
