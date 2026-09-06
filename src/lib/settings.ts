import { prisma } from "@/lib/prisma";

export interface CompanyProfileSettings {
  company_name: string;
  tagline: string;
  support_email: string;
  support_phones: string[];
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  operating_hours: string;
  google_maps_embed_url?: string;
  latitude?: number;
  longitude?: number;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfileSettings = {
  company_name: "SS Courier service Pvt. Ltd.",
  tagline: "Fast, Safe & Multi-Carrier Courier Logistics",
  support_email: "support@sscourierservice.in",
  support_phones: ["8000151117", "7689987368"],
  whatsapp: "8000151117",
  address: "Shop No 4, 5th Crossing, Padmavati School, Ghee Walo Ka Rasta, Johri Bazar",
  city: "Jaipur",
  state: "Rajasthan",
  pincode: "302003",
  operating_hours: "Mon - Sat: 08:00 AM - 09:00 PM IST",
  google_maps_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.484920272099!2d75.82412537611685!3d26.921104759799295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db14b1a473b11%3A0xb35a0f5a11c1e5cb!2sJohri%20Bazar%2C%20Jaipur%2C%20Rajasthan%20302003!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin",
  latitude: 26.9211,
  longitude: 75.8267,
};

export async function getCompanyProfile(): Promise<CompanyProfileSettings> {
  try {
    const setting = await prisma.setting.findFirst({
      where: { key: "company_profile" },
    });

    if (setting && setting.value) {
      const val = typeof setting.value === "string" ? JSON.parse(setting.value) : (setting.value as any);
      return {
        ...DEFAULT_COMPANY_PROFILE,
        ...val,
        support_phones: Array.isArray(val.support_phones)
          ? val.support_phones
          : val.support_phone
          ? [val.support_phone, "7689987368"]
          : DEFAULT_COMPANY_PROFILE.support_phones,
      };
    }
  } catch (error) {
    // Database might be unreachable or setting missing, return defaults
  }
  return DEFAULT_COMPANY_PROFILE;
}
