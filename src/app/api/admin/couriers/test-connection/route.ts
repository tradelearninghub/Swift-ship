import { NextRequest, NextResponse } from "next/server";
import { getCourierAdapter } from "@/lib/couriers/registry";
import { getSessionUser, hasPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (session && !hasPermission(session, "courier.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { code, credentials, config } = body;

    if (!code) {
      return NextResponse.json({ error: "Adapter code is required" }, { status: 400 });
    }

    const adapter = getCourierAdapter(code);
    if (!adapter) {
      return NextResponse.json(
        { error: `Adapter for courier ${code} is not registered` },
        { status: 404 }
      );
    }

    const result = await adapter.testConnection(credentials || {}, config || {});

    return NextResponse.json({
      success: result.success,
      authSuccess: result.authSuccess,
      trackingReachable: result.trackingReachable,
      responseTimeMs: result.responseTimeMs,
      message: result.message,
      rawResponse: result.rawResponse,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Diagnostic test failed", details: error.message },
      { status: 500 }
    );
  }
}
