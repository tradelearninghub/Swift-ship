import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, hasPermission } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "settings.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    // Validate extension
    const ext = path.extname(file.name).toLowerCase();
    const allowed = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".gif"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPG, WEBP, SVG, ICO" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFilename = `${safeBase}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
