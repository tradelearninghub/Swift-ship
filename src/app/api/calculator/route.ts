import { NextRequest, NextResponse } from "next/server";
import { calculateShippingQuote } from "@/lib/rate-card";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const origin = searchParams.get("origin") || "302003";
    const destination = searchParams.get("destination") || "";
    const weight = parseFloat(searchParams.get("weight") || "0.5");
    const length = parseFloat(searchParams.get("length") || "10");
    const width = parseFloat(searchParams.get("width") || "10");
    const height = parseFloat(searchParams.get("height") || "10");

    if (!destination || destination.replace(/\D/g, "").length !== 6) {
      return NextResponse.json(
        { error: "Please provide a valid 6-digit destination pincode." },
        { status: 400 }
      );
    }

    const quote = calculateShippingQuote({
      originPincode: origin,
      destinationPincode: destination,
      weightKg: weight,
      lengthCm: length,
      widthCm: width,
      heightCm: height,
    });

    return NextResponse.json({ success: true, ...quote });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to calculate rate quote." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originPincode, destinationPincode, weightKg, lengthCm, widthCm, heightCm } = body;

    if (!destinationPincode || destinationPincode.replace(/\D/g, "").length !== 6) {
      return NextResponse.json(
        { error: "Please provide a valid 6-digit destination pincode." },
        { status: 400 }
      );
    }

    const quote = calculateShippingQuote({
      originPincode: originPincode || "302003",
      destinationPincode,
      weightKg: parseFloat(weightKg) || 0.5,
      lengthCm: parseFloat(lengthCm) || 10,
      widthCm: parseFloat(widthCm) || 10,
      heightCm: parseFloat(heightCm) || 10,
    });

    return NextResponse.json({ success: true, ...quote });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to calculate rate quote." },
      { status: 500 }
    );
  }
}
