import { prisma } from "@/lib/prisma";

export interface ChannelPartnerCompany {
  id: string;
  name: string;
  website: string;
  logo_url?: string;
  is_visible: boolean;
  created_at?: string;
}

export interface PartnerChannelSettings {
  is_visible: boolean;
  title?: string;
  subtitle?: string;
  companies: ChannelPartnerCompany[];
  updated_at?: string;
}

// 12 Channel Partners matching the user's specification exactly
export const PARTNER_LOGO_MAP: Record<string, string> = {
  aramex: "/partners-logo/aramex.jpg",
  dhl: "/partners-logo/DHL-Logo.png",
  dpd: "/partners-logo/DPD_logo.png",
  fedex: "/partners-logo/fedex logo.png",
  gofo: "/partners-logo/GOFO_Logo.jpg",
  "india post": "/partners-logo/indiapost.jfif",
  indiapost: "/partners-logo/indiapost.jfif",
  "royal mail": "/partners-logo/royal mail.png",
  royalmail: "/partners-logo/royal mail.png",
  skynet: "/partners-logo/skynet.png",
  uniuni: "/partners-logo/uniuni.png",
  ups: "/partners-logo/ups logo.jpg",
  usps: "/partners-logo/usps logo.png",
  "yun express": "/partners-logo/yun express.jfif",
  yunexpress: "/partners-logo/yun express.jfif",
};

export function getPartnerLogo(nameOrId: string, customLogo?: string): string {
  if (customLogo && customLogo.startsWith("/partners-logo/")) return customLogo;
  const key = (nameOrId || "").toLowerCase().trim();
  for (const [k, url] of Object.entries(PARTNER_LOGO_MAP)) {
    if (key === k || key.includes(k) || k.includes(key)) {
      return url;
    }
  }
  return customLogo || "";
}

// Initial default companies matching the user's specification exactly in order
export const DEFAULT_PARTNER_COMPANIES: ChannelPartnerCompany[] = [
  {
    id: "aramex",
    name: "Aramex",
    website: "https://www.aramex.com",
    logo_url: "/partners-logo/aramex.jpg",
    is_visible: true,
  },
  {
    id: "dhl",
    name: "DHL",
    website: "https://www.dhl.com",
    logo_url: "/partners-logo/DHL-Logo.png",
    is_visible: true,
  },
  {
    id: "dpd",
    name: "DPD",
    website: "https://www.dpd.com",
    logo_url: "/partners-logo/DPD_logo.png",
    is_visible: true,
  },
  {
    id: "fedex",
    name: "FedEx",
    website: "https://www.fedex.com",
    logo_url: "/partners-logo/fedex logo.png",
    is_visible: true,
  },
  {
    id: "gofo",
    name: "GOFO",
    website: "https://www.gofoexpress.com",
    logo_url: "/partners-logo/GOFO_Logo.jpg",
    is_visible: true,
  },
  {
    id: "india-post",
    name: "India Post",
    website: "https://www.indiapost.gov.in",
    logo_url: "/partners-logo/indiapost.jfif",
    is_visible: true,
  },
  {
    id: "royal-mail",
    name: "Royal Mail",
    website: "https://www.royalmail.com",
    logo_url: "/partners-logo/royal mail.png",
    is_visible: true,
  },
  {
    id: "skynet",
    name: "SkyNet",
    website: "https://www.skynetww.com",
    logo_url: "/partners-logo/skynet.png",
    is_visible: true,
  },
  {
    id: "uniuni",
    name: "UniUni",
    website: "https://www.uniuni.com",
    logo_url: "/partners-logo/uniuni.png",
    is_visible: true,
  },
  {
    id: "ups",
    name: "UPS",
    website: "https://www.ups.com",
    logo_url: "/partners-logo/ups logo.jpg",
    is_visible: true,
  },
  {
    id: "usps",
    name: "USPS",
    website: "https://www.usps.com",
    logo_url: "/partners-logo/usps logo.png",
    is_visible: true,
  },
  {
    id: "yun-express",
    name: "Yun Express",
    website: "https://www.yunexpress.com",
    logo_url: "/partners-logo/yun express.jfif",
    is_visible: true,
  },
];

export const DEFAULT_PARTNER_CHANNEL_SETTINGS: PartnerChannelSettings = {
  is_visible: true,
  title: "Our Channel Partner",
  subtitle: "Partnered with premier global express logistics and postal networks.",
  companies: DEFAULT_PARTNER_COMPANIES,
};

let memoryPartnerSettings: PartnerChannelSettings = { ...DEFAULT_PARTNER_CHANNEL_SETTINGS };

/**
 * Extracts domain and builds logo URL fallbacks (Clearbit, Google Favicon)
 */
export function getCompanyLogoUrl(website: string, customLogoUrl?: string): string {
  if (customLogoUrl && customLogoUrl.trim()) {
    return customLogoUrl.trim();
  }
  if (!website) return "";
  try {
    const cleanUrl = website.startsWith("http") ? website : `https://${website}`;
    const domain = new URL(cleanUrl).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return "";
  }
}

export async function getPartnerChannelSettings(): Promise<PartnerChannelSettings> {
  try {
    const setting = await prisma.setting.findFirst({
      where: { key: "partner_channel" },
    });

    if (setting && setting.value) {
      const parsed = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
      let companies: ChannelPartnerCompany[] = [];

      if (Array.isArray(parsed.companies) && parsed.companies.length > 0) {
        // Ensure all companies use the correct /partners-logo/ files
        companies = parsed.companies.map((c: ChannelPartnerCompany) => ({
          ...c,
          logo_url: getPartnerLogo(c.name || c.id, c.logo_url),
        }));

        // Merge missing default partners if not already in the saved list
        const existingNames = new Set(
          companies.map((c: ChannelPartnerCompany) => (c.name || "").toLowerCase().trim())
        );
        for (const def of DEFAULT_PARTNER_COMPANIES) {
          if (!existingNames.has(def.name.toLowerCase().trim())) {
            companies.push(def);
          }
        }
      } else {
        companies = DEFAULT_PARTNER_COMPANIES;
      }

      return {
        ...DEFAULT_PARTNER_CHANNEL_SETTINGS,
        ...parsed,
        companies,
      };
    }
  } catch (error) {
    // DB fallback
  }
  return memoryPartnerSettings;
}

export async function savePartnerChannelSettings(
  settings: Partial<PartnerChannelSettings>
): Promise<PartnerChannelSettings> {
  const current = await getPartnerChannelSettings();
  const merged: PartnerChannelSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  memoryPartnerSettings = merged;

  try {
    await prisma.setting.upsert({
      where: { key: "partner_channel" },
      update: { value: merged as any, group: "cms" },
      create: {
        key: "partner_channel",
        group: "cms",
        value: merged as any,
      },
    });
  } catch (error) {
    // fallback
  }

  return merged;
}

