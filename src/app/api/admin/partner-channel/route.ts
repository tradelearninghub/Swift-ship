import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getPartnerChannelSettings, savePartnerChannelSettings } from "@/lib/partnerChannel";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getPartnerChannelSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch partner channel settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { is_visible } = body;

    if (typeof is_visible !== "boolean") {
      return NextResponse.json({ error: "is_visible boolean is required" }, { status: 400 });
    }

    const updated = await savePartnerChannelSettings({ is_visible });
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update partner channel settings" }, { status: 500 });
  }
}
