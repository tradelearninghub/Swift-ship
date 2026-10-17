import { NextResponse } from "next/server";
import { getPartnerChannelSettings } from "@/lib/partnerChannel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getPartnerChannelSettings();
    return NextResponse.json({ success: true, ...settings }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, is_visible: true });
  }
}
