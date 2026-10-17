import { NextResponse } from "next/server";
import { getTestimonials } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await getTestimonials(true);
    return NextResponse.json({ success: true, testimonials }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load testimonials" }, { status: 500 });
  }
}
