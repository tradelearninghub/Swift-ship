import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export interface GlobalSeoSettings {
  site_name: string;
  title_template: string; // e.g. "%s | SS International Courier"
  default_meta_description: string;
  default_share_image: string;
  canonical_base_url: string;
  favicon: string;
}

export interface PageSeoSetting {
  path: string;
  title: string;
  description: string;
  share_image: string;
  canonical_override: string;
  noindex: boolean;
}

export interface SitemapPageConfig {
  included: boolean;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number; // 0.0 to 1.0
}

export interface SitemapSetting {
  pages: Record<string, SitemapPageConfig>;
}

export interface PublicPageDef {
  path: string;
  name: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultPriority: number;
  defaultChangefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}

export const PUBLIC_PAGES: PublicPageDef[] = [
  {
    path: "/",
    name: "Home",
    defaultTitle: "Global Courier & Logistics Solutions",
    defaultDescription:
      "Fast, secure and reliable international courier services across 220+ countries with live milestone tracking and guaranteed delivery.",
    defaultPriority: 1.0,
    defaultChangefreq: "daily",
  },
  {
    path: "/about",
    name: "About Us",
    defaultTitle: "About Us - Global Logistics Footprint",
    defaultDescription:
      "Discover SS International Courier's legacy of excellence, multi-carrier express air network, and customer-first commitment.",
    defaultPriority: 0.7,
    defaultChangefreq: "monthly",
  },
  {
    path: "/services",
    name: "Our Services",
    defaultTitle: "Worldwide Express Courier Services",
    defaultDescription:
      "Comprehensive international courier, air freight, sea freight, land logistics, and customs clearance solutions.",
    defaultPriority: 0.9,
    defaultChangefreq: "weekly",
  },
  {
    path: "/how-it-works",
    name: "How It Works",
    defaultTitle: "How It Works - Step-by-Step Courier Booking",
    defaultDescription:
      "Simple 4-step global dispatch: rate calculation, online booking, door pickup, and customs-cleared milestone delivery.",
    defaultPriority: 0.7,
    defaultChangefreq: "monthly",
  },
  {
    path: "/track",
    name: "Track Shipment",
    defaultTitle: "Track Consignment - Real-Time AWB Tracking",
    defaultDescription:
      "Track your international consignment in real-time with multi-carrier milestone tracking and automated status updates.",
    defaultPriority: 0.9,
    defaultChangefreq: "daily",
  },
  {
    path: "/calculator",
    name: "Rate Calculator",
    defaultTitle: "International Rate Calculator",
    defaultDescription:
      "Calculate indicative volumetric and dead-weight shipping rates across 220+ international destinations.",
    defaultPriority: 0.8,
    defaultChangefreq: "weekly",
  },
  {
    path: "/contact",
    name: "Contact Us",
    defaultTitle: "Contact Our Global Logistics Support",
    defaultDescription:
      "Get in touch with SS International Courier customer care for booking inquiries, pickup schedules, and quotes.",
    defaultPriority: 0.7,
    defaultChangefreq: "monthly",
  },
  {
    path: "/book",
    name: "Book a Parcel",
    defaultTitle: "Book International Shipment",
    defaultDescription:
      "Book fast international courier shipments online with automated KYC, invoice generation, and scheduled pickup.",
    defaultPriority: 0.8,
    defaultChangefreq: "weekly",
  },
  {
    path: "/privacy-policy",
    name: "Privacy Policy",
    defaultTitle: "Privacy Policy",
    defaultDescription:
      "Our privacy policy outlines how SS International Courier collects, protects, and handles your personal information.",
    defaultPriority: 0.3,
    defaultChangefreq: "yearly",
  },
  {
    path: "/terms",
    name: "Terms & Conditions",
    defaultTitle: "Terms & Conditions",
    defaultDescription:
      "Terms and conditions governing international consignment booking, transit, customs clearance, and delivery.",
    defaultPriority: 0.3,
    defaultChangefreq: "yearly",
  },
  {
    path: "/shipping-policy",
    name: "Shipping Policy & Disclaimer",
    defaultTitle: "Shipping & Delivery Policy",
    defaultDescription:
      "Shipping guidelines, transit timeframes, restricted goods regulations, and customs inspection policies.",
    defaultPriority: 0.3,
    defaultChangefreq: "yearly",
  },
];

export const DEFAULT_GLOBAL_SEO: GlobalSeoSettings = {
  site_name: "SS International Courier",
  title_template: "%s | SS International Courier",
  default_meta_description:
    "Fast, customs-cleared global parcel dispatch across 220+ countries with automated commercial invoices, live tracking, and door-to-door transit.",
  default_share_image: "/images/ss-logo.jpg",
  canonical_base_url: "https://ssinternationalcourier.com",
  favicon: "/favicon.ico",
};

export function getDefaultPageSeo(path: string): PageSeoSetting {
  const def = PUBLIC_PAGES.find((p) => p.path === path);
  return {
    path,
    title: def?.defaultTitle || DEFAULT_GLOBAL_SEO.site_name,
    description: def?.defaultDescription || DEFAULT_GLOBAL_SEO.default_meta_description,
    share_image: "",
    canonical_override: "",
    noindex: false,
  };
}

export function getDefaultRobotsTxt(baseUrl = DEFAULT_GLOBAL_SEO.canonical_base_url): string {
  const cleanBase = (baseUrl || DEFAULT_GLOBAL_SEO.canonical_base_url).replace(/\/+$/, "");
  return `# SS International Courier - Robots Exclusion Protocol
User-agent: *
Allow: /

# Protected Admin, Internal API & Authenticated Customer Portals
Disallow: /admin
Disallow: /admin/
Disallow: /api
Disallow: /api/
Disallow: /customer
Disallow: /customer/
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /track/*

# Sitemap Index
Sitemap: ${cleanBase}/sitemap.xml
`;
}

export function getDefaultSitemapPages(): Record<string, SitemapPageConfig> {
  const map: Record<string, SitemapPageConfig> = {};
  for (const page of PUBLIC_PAGES) {
    map[page.path] = {
      included: true,
      changefreq: page.defaultChangefreq,
      priority: page.defaultPriority,
    };
  }
  return map;
}

// -----------------------------------------------------------------------------
// Data Access Layer (with Zero-Stale Fallback and Immediate DB Fetching)
// -----------------------------------------------------------------------------

export async function getGlobalSeo(): Promise<GlobalSeoSettings> {
  try {
    const setting = await prisma.setting.findFirst({
      where: { key: "seo_global" },
    });
    if (setting?.value) {
      const parsed = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
      return {
        ...DEFAULT_GLOBAL_SEO,
        ...parsed,
      };
    }
  } catch (err) {
    // Return fallback on DB disconnect
  }
  return DEFAULT_GLOBAL_SEO;
}

export async function getAllPagesSeo(): Promise<Record<string, PageSeoSetting>> {
  const result: Record<string, PageSeoSetting> = {};
  for (const p of PUBLIC_PAGES) {
    result[p.path] = getDefaultPageSeo(p.path);
  }

  try {
    const setting = await prisma.setting.findFirst({
      where: { key: "seo_pages" },
    });
    if (setting?.value) {
      const stored = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
      if (typeof stored === "object" && stored !== null) {
        for (const [path, pageData] of Object.entries(stored)) {
          if (typeof pageData === "object" && pageData !== null) {
            const current = result[path] || getDefaultPageSeo(path);
            result[path] = {
              ...current,
              ...(pageData as any),
              path,
            };
          }
        }
      }
    }
  } catch (err) {
    // Return defaults on error
  }

  return result;
}

export async function getPageSeo(path: string): Promise<PageSeoSetting> {
  const all = await getAllPagesSeo();
  return all[path] || getDefaultPageSeo(path);
}

export async function getRobotsTxt(): Promise<string> {
  try {
    const setting = await prisma.setting.findFirst({
      where: { key: "seo_robots" },
    });
    if (setting?.value) {
      const val = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
      if (typeof val?.content === "string" && val.content.trim()) {
        return val.content;
      }
    }
  } catch (err) {
    // fallback
  }

  const globalSeo = await getGlobalSeo();
  return getDefaultRobotsTxt(globalSeo.canonical_base_url);
}

export async function getSitemapConfig(): Promise<Record<string, SitemapPageConfig>> {
  const defaults = getDefaultSitemapPages();
  try {
    const setting = await prisma.setting.findFirst({
      where: { key: "seo_sitemap" },
    });
    if (setting?.value) {
      const stored = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
      if (stored?.pages && typeof stored.pages === "object") {
        return {
          ...defaults,
          ...stored.pages,
        };
      }
    }
  } catch (err) {
    // fallback
  }
  return defaults;
}

// -----------------------------------------------------------------------------
// Next.js Dynamic Metadata Builder for Public Pages
// -----------------------------------------------------------------------------

export async function buildPageMetadata(path: string): Promise<Metadata> {
  const [globalSeo, pageSeo] = await Promise.all([
    getGlobalSeo(),
    getPageSeo(path),
  ]);

  const siteName = globalSeo.site_name || "SS International Courier";
  const rawTitle = pageSeo.title?.trim() || siteName;
  const description = pageSeo.description?.trim() || globalSeo.default_meta_description;

  // Format title using title template
  let finalTitle = rawTitle;
  if (path === "/" && rawTitle) {
    // For homepage: if template contains %s, use it or rawTitle
    finalTitle = globalSeo.title_template?.includes("%s")
      ? globalSeo.title_template.replace("%s", rawTitle)
      : rawTitle;
  } else if (rawTitle) {
    finalTitle = globalSeo.title_template?.includes("%s")
      ? globalSeo.title_template.replace("%s", rawTitle)
      : `${rawTitle} | ${siteName}`;
  }

  // Canonical URL
  const baseUrl = (globalSeo.canonical_base_url || "https://ssinternationalcourier.com").replace(/\/+$/, "");
  const canonicalUrl = pageSeo.canonical_override?.trim() || `${baseUrl}${path === "/" ? "" : path}`;

  // Share Image
  const shareImage = pageSeo.share_image?.trim() || globalSeo.default_share_image || "/images/ss-logo.jpg";
  const fullImageUrl = shareImage.startsWith("http") ? shareImage : `${baseUrl}${shareImage.startsWith("/") ? "" : "/"}${shareImage}`;

  // Favicon
  const favicon = globalSeo.favicon?.trim() || "/favicon.ico";

  const isNoIndex = Boolean(pageSeo.noindex);

  return {
    title: finalTitle,
    description: description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isNoIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: finalTitle,
      description: description,
      url: canonicalUrl,
      siteName: siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: description,
      images: [fullImageUrl],
    },
  };
}
