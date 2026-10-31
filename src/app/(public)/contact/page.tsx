import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { ContactClient } from "./ContactClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/contact");
}

export default function ContactPage() {
  return <ContactClient />;
}
