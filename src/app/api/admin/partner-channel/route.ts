import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getPartnerChannelSettings,
  savePartnerChannelSettings,
  getCompanyLogoUrl,
  ChannelPartnerCompany,
} from "@/lib/partnerChannel";

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
    const { is_visible, title, subtitle, companies } = body;

    const updates: any = {};
    if (typeof is_visible === "boolean") updates.is_visible = is_visible;
    if (typeof title === "string") updates.title = title;
    if (typeof subtitle === "string") updates.subtitle = subtitle;
    if (Array.isArray(companies)) updates.companies = companies;

    const updated = await savePartnerChannelSettings(updates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update partner channel settings" }, { status: 500 });
  }
}

// POST: Add a new company to the Channel Partner Marquee
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, website, logo_url } = body;

    if (!name || !website) {
      return NextResponse.json({ error: "Company name and website are required" }, { status: 400 });
    }

    const current = await getPartnerChannelSettings();
    const autoLogo = getCompanyLogoUrl(website, logo_url);

    const newCompany: ChannelPartnerCompany = {
      id: `partner-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      website: website.trim().startsWith("http") ? website.trim() : `https://${website.trim()}`,
      logo_url: autoLogo,
      is_visible: true,
      created_at: new Date().toISOString(),
    };

    const updatedCompanies = [...current.companies, newCompany];
    const updated = await savePartnerChannelSettings({ companies: updatedCompanies });

    return NextResponse.json({ success: true, company: newCompany, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add partner company" }, { status: 500 });
  }
}

// PATCH: Toggle individual company visibility
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyId, is_visible } = body;

    if (!companyId || typeof is_visible !== "boolean") {
      return NextResponse.json({ error: "companyId and boolean is_visible are required" }, { status: 400 });
    }

    const current = await getPartnerChannelSettings();
    const updatedCompanies = current.companies.map((c) =>
      c.id === companyId ? { ...c, is_visible } : c
    );

    const updated = await savePartnerChannelSettings({ companies: updatedCompanies });
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update company visibility" }, { status: 500 });
  }
}

// DELETE: Remove a company from the marquee
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId parameter is required" }, { status: 400 });
    }

    const current = await getPartnerChannelSettings();
    const updatedCompanies = current.companies.filter((c) => c.id !== companyId);

    const updated = await savePartnerChannelSettings({ companies: updatedCompanies });
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete partner company" }, { status: 500 });
  }
}

