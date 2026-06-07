import { absoluteUrl, locations } from "@/data/locations";

export function GET() {
  const lastModified = new Date().toISOString();
  const urls = locations
    .map((location) => {
      const priority = location.url === "/" ? "1" : "0.8";

      return `<url><loc>${absoluteUrl(location.url)}</loc><lastmod>${lastModified}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
    })
    .join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
