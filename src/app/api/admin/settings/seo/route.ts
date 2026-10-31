import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  getGlobalSeo,
  getAllPagesSeo,
  getRobotsTxt,
  getSitemapConfig,
  PUBLIC_PAGES,
  DEFAULT_GLOBAL_SEO,
  getDefaultRobotsTxt,
  getDefaultSitemapPages,
} from "@/lib/seo";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "settings.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [globalSeo, pagesSeo, robotsContent, sitemapConfig] = await Promise.all([
      getGlobalSeo(),
      getAllPagesSeo(),
      getRobotsTxt(),
      getSitemapConfig(),
    ]);

    return NextResponse.json(
      {
        global: globalSeo,
        pages: pagesSeo,
        robots: { content: robotsContent },
        sitemap: { pages: sitemapConfig },
        publicPages: PUBLIC_PAGES,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load SEO configuration" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "settings.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { section, global, pages, robots, sitemap } = body;

    // 1. Global SEO Settings
    if (section === "global" || (section === "all" && global)) {
      await prisma.setting.upsert({
        where: { key: "seo_global" },
        update: {
          group: "seo",
          value: {
            site_name: global.site_name || DEFAULT_GLOBAL_SEO.site_name,
            title_template: global.title_template || DEFAULT_GLOBAL_SEO.title_template,
            default_meta_description: global.default_meta_description || DEFAULT_GLOBAL_SEO.default_meta_description,
            default_share_image: global.default_share_image || DEFAULT_GLOBAL_SEO.default_share_image,
            canonical_base_url: global.canonical_base_url || DEFAULT_GLOBAL_SEO.canonical_base_url,
            favicon: global.favicon || DEFAULT_GLOBAL_SEO.favicon,
          },
          updated_by: session.id,
        },
        create: {
          key: "seo_global",
          group: "seo",
          value: {
            site_name: global.site_name || DEFAULT_GLOBAL_SEO.site_name,
            title_template: global.title_template || DEFAULT_GLOBAL_SEO.title_template,
            default_meta_description: global.default_meta_description || DEFAULT_GLOBAL_SEO.default_meta_description,
            default_share_image: global.default_share_image || DEFAULT_GLOBAL_SEO.default_share_image,
            canonical_base_url: global.canonical_base_url || DEFAULT_GLOBAL_SEO.canonical_base_url,
            favicon: global.favicon || DEFAULT_GLOBAL_SEO.favicon,
          },
          updated_by: session.id,
        },
      });
    }

    // 2. Per-Page SEO Settings
    if (section === "pages" || (section === "all" && pages)) {
      // Merge with existing pages so partial updates do not wipe out other pages
      const existingSetting = await prisma.setting.findUnique({ where: { key: "seo_pages" } });
      const currentPages = existingSetting?.value && typeof existingSetting.value === "object"
        ? (existingSetting.value as Record<string, any>)
        : {};

      const updatedPages = { ...currentPages, ...pages };

      await prisma.setting.upsert({
        where: { key: "seo_pages" },
        update: {
          group: "seo",
          value: updatedPages,
          updated_by: session.id,
        },
        create: {
          key: "seo_pages",
          group: "seo",
          value: updatedPages,
          updated_by: session.id,
        },
      });
    }

    // 3. Robots.txt
    if (section === "robots" || (section === "all" && robots)) {
      const content = typeof robots.content === "string" ? robots.content : getDefaultRobotsTxt();

      await prisma.setting.upsert({
        where: { key: "seo_robots" },
        update: {
          group: "seo",
          value: { content },
          updated_by: session.id,
        },
        create: {
          key: "seo_robots",
          group: "seo",
          value: { content },
          updated_by: session.id,
        },
      });
    }

    // 4. Sitemap Settings
    if (section === "sitemap" || (section === "all" && sitemap)) {
      const sitemapPages = sitemap.pages || getDefaultSitemapPages();

      await prisma.setting.upsert({
        where: { key: "seo_sitemap" },
        update: {
          group: "seo",
          value: { pages: sitemapPages },
          updated_by: session.id,
        },
        create: {
          key: "seo_sitemap",
          group: "seo",
          value: { pages: sitemapPages },
          updated_by: session.id,
        },
      });
    }

    // Audit log
    await prisma.activityLog.create({
      data: {
        actor_id: session.id,
        action: "seo.updated",
        entity_type: "SEO_CONFIG",
        entity_id: section || "all",
        after: { section, timestamp: new Date().toISOString() },
      },
    });

    // -------------------------------------------------------------------------
    // CRITICAL REQUIREMENT (1): Immediate Live Site Cache Revalidation
    // -------------------------------------------------------------------------
    try {
      revalidatePath("/", "layout");
      revalidatePath("/(public)", "layout");
      revalidatePath("/robots.txt");
      revalidatePath("/sitemap.xml");

      for (const p of PUBLIC_PAGES) {
        revalidatePath(p.path);
      }
    } catch (revalidateErr) {
      console.warn("[SEO] Warning during revalidation:", revalidateErr);
    }

    return NextResponse.json({
      success: true,
      message: "SEO settings saved and live site cache revalidated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save SEO settings" },
      { status: 500 }
    );
  }
}
