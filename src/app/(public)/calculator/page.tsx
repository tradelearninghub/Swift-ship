import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { CalculatorClient } from "./CalculatorClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/calculator");
}

export default function CalculatorPage() {
  return <CalculatorClient />;
}
