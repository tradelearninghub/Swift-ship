import { NextRequest, NextResponse } from "next/server";
import { initDatabase } from "../../../../scripts/init-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await initDatabase();
    return NextResponse.json({
      success: true,
      message: "Database schema, all 27 tables, constraints, super admin, and settings initialized successfully!",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize database",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
