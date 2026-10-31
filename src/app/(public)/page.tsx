import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/");
}

export default function HomePage() {
  return <HomeClient />;
}
