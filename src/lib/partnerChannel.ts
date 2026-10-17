import { prisma } from "@/lib/prisma";

export interface PartnerChannelSettings {
  is_visible: boolean;
  title?: string;
  subtitle?: string;
  updated_at?: string;
}

export const DEFAULT_PARTNER_CHANNEL_SETTINGS: PartnerChannelSettings = {
  is_visible: true,
  title: "Integrated with Leading Express Networks",
  subtitle: "Direct API integration & priority transit with India's foremost domestic couriers and major US/International air cargo carriers.",
};

let memoryPartnerSettings: PartnerChannelSettings = { ...DEFAULT_PARTNER_CHANNEL_SETTINGS };

export async function getPartnerChannelSettings(): Promise<PartnerChannelSettings> {
  try {
    const setting = await prisma.setting.findFirst({
      where: { key: "partner_channel" },
    });

    if (setting && setting.value) {
      const parsed = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
      return {
        ...DEFAULT_PARTNER_CHANNEL_SETTINGS,
        ...parsed,
      };
    }
  } catch (error) {
    // DB fallback
  }
  return memoryPartnerSettings;
}

export async function savePartnerChannelSettings(settings: Partial<PartnerChannelSettings>): Promise<PartnerChannelSettings> {
  const merged = { ...memoryPartnerSettings, ...settings, updated_at: new Date().toISOString() };
  memoryPartnerSettings = merged;

  try {
    await prisma.setting.upsert({
      where: { key: "partner_channel" },
      update: { value: merged, group: "cms" },
      create: {
        key: "partner_channel",
        group: "cms",
        value: merged,
      },
    });
  } catch (error) {
    // fallback
  }

  return merged;
}
