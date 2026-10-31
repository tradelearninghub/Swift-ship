import { NextResponse } from "next/server";
import { getGlobalSeo, getAllPagesSeo, getSitemapConfig, PUBLIC_PAGES } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [globalSeo, pagesSeo, sitemapConfig] = await Promise.all([
    getGlobalSeo(),
    getAllPagesSeo(),
    getSitemapConfig(),
  ]);

  const rawBase = (globalSeo.canonical_base_url || "https://ssinternationalcourier.com").replace(/\/+$/, "");
  const lastmod = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Filter and build entries
  const urlEntries: string[] = [];

  for (const def of PUBLIC_PAGES) {
    const pageSeo = pagesSeo[def.path];
    const cfg = sitemapConfig[def.path];

    // Exclude if marked noindex OR toggled off in sitemap
    if (pageSeo?.noindex || cfg?.included === false) {
      continue;
    }

    // Safety check: Never include admin, customer portal, api, or private tracking
    if (
      def.path.startsWith("/admin") ||
      def.path.startsWith("/customer") ||
      def.path.startsWith("/api") ||
      def.path.startsWith("/track/") ||
      def.path === "/login" ||
      def.path === "/register"
    ) {
      continue;
    }

    const priority = typeof cfg?.priority === "number" ? cfg.priority.toFixed(1) : def.defaultPriority.toFixed(1);
    const changefreq = cfg?.changefreq || def.defaultChangefreq || "weekly";
    const loc = `${rawBase}${def.path === "/" ? "" : def.path}`;

    urlEntries.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
