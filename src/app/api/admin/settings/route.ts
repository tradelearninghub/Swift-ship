import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const group = req.nextUrl.searchParams.get("group");

    // Public info for company profile does not require admin login
    if (group === "company_profile") {
      const setting = await prisma.setting.findFirst({
        where: { key: "company_profile" },
      });
      return NextResponse.json({ setting: setting?.value || null });
    }

    if (!session || !hasPermission(session, "settings.view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const whereClause = group ? { group } : {};
    const settings = await prisma.setting.findMany({
      where: whereClause,
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "settings.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { key, group, value } = body;

    if (!key || !value) {
      return NextResponse.json({ error: "key and value required" }, { status: 400 });
    }

    let valueToStore = value;
    if (key === "smtp_config") {
      try {
        const parsed = typeof value === "string" ? JSON.parse(value) : { ...value };
        if (!parsed.pass) {
          const existing = await prisma.setting.findUnique({ where: { key } });
          if (existing?.value) {
            const existingParsed = typeof existing.value === "string" ? JSON.parse(existing.value as string) : existing.value;
            if (existingParsed?.pass) {
              parsed.pass = existingParsed.pass;
            }
          }
        }
        valueToStore = typeof value === "string" ? JSON.stringify(parsed) : parsed;
      } catch (e) {
        // fallback to value
      }
    }

    const updated = await prisma.setting.upsert({
      where: { key },
      update: { value: valueToStore, group: group || "general" },
      create: { key, group: group || "general", value: valueToStore },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        actor_id: session.id,
        action: "settings.updated",
        entity_type: "SETTING",
        entity_id: updated.id,
        after: { key, value },
      },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
