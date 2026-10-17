import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { getTestimonials, saveTestimonials, Testimonial } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testimonials = await getTestimonials(false);
    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { client_name, client_role, company_name, review, rating, destination_route, tag, avatar_url } = body;

    if (!client_name || !review) {
      return NextResponse.json({ error: "Client name and review are required" }, { status: 400 });
    }

    const currentList = await getTestimonials(false);

    const newTestimonial: Testimonial = {
      id: `testi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      client_name: String(client_name).trim(),
      client_role: String(client_role || "Valued Client").trim(),
      company_name: company_name ? String(company_name).trim() : undefined,
      avatar_url: avatar_url ? String(avatar_url).trim() : undefined,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      review: String(review).trim(),
      destination_route: destination_route ? String(destination_route).trim() : undefined,
      tag: tag ? String(tag).trim() : "Verified Exporter",
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Prepend newly added testimonial
    const updated = [newTestimonial, ...currentList];
    await saveTestimonials(updated);

    return NextResponse.json({ success: true, testimonial: newTestimonial, testimonials: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add testimonial" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required" }, { status: 400 });
    }

    const currentList = await getTestimonials(false);
    const updated = currentList.filter((t) => t.id !== id);

    await saveTestimonials(updated);
    return NextResponse.json({ success: true, deletedId: id, testimonials: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required" }, { status: 400 });
    }

    const currentList = await getTestimonials(false);
    const updated = currentList.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          is_active: typeof is_active === "boolean" ? is_active : !t.is_active,
        };
      }
      return t;
    });

    await saveTestimonials(updated);
    return NextResponse.json({ success: true, testimonials: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}
