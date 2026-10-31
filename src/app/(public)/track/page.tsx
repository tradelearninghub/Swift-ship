import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { TrackClient } from "./TrackClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/track");
}

export default function TrackingPage() {
  return <TrackClient />;
}
