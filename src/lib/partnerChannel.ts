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

// Initial default companies matching the user's uploaded image exactly
export const DEFAULT_PARTNER_COMPANIES: ChannelPartnerCompany[] = [
  {
    id: "uniuni",
    name: "UniUni",
    website: "https://www.uniuni.com",
    logo_url: "https://www.uniuni.com/wp-content/uploads/2023/04/uniuni-logo.png",
    is_visible: true,
  },
  {
    id: "ups",
    name: "UPS",
    website: "https://www.ups.com",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/United_Parcel_Service_logo_2014.svg",
    is_visible: true,
  },
  {
    id: "usps",
    name: "United States Postal Service",
    website: "https://www.usps.com",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/United_States_Postal_Service_logo_%282000s%29.svg",
    is_visible: true,
  },
  {
    id: "yunexpress",
    name: "YunExpress",
    website: "https://www.yunexpress.com",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/YunExpress_Logo.png",
    is_visible: true,
  },
  {
    id: "aramex",
    name: "Aramex",
    website: "https://www.aramex.com",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/29/Aramex_logo.svg",
    is_visible: true,
  },
  {
    id: "dhl",
    name: "DHL Express",
    website: "https://www.dhl.com",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/ac/DHL_Logo.svg",
    is_visible: true,
  },
  {
    id: "dpd",
    name: "DPD",
    website: "https://www.dpd.com",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/DPD_logo_%282015%29.svg",
    is_visible: true,
  },
  {
    id: "fedex",
    name: "FedEx",
    website: "https://www.fedex.com",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/FedEx_Corporation_-_2016_logo.svg",
    is_visible: true,
  },
  {
    id: "gofo",
    name: "GOFO Express",
    website: "https://www.gofoexpress.com",
    logo_url: "",
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
      const companies = Array.isArray(parsed.companies) && parsed.companies.length > 0
        ? parsed.companies
        : DEFAULT_PARTNER_COMPANIES;

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

