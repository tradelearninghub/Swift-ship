import { NextResponse } from "next/server";
import { getPartnerChannelSettings } from "@/lib/partnerChannel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getPartnerChannelSettings();
    const visibleCompanies = (settings.companies || []).filter((c) => c.is_visible);

    return NextResponse.json(
      {
        success: true,
        is_visible: settings.is_visible,
        title: settings.title,
        subtitle: settings.subtitle,
        companies: visibleCompanies,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, is_visible: true, companies: [] });
  }
}

