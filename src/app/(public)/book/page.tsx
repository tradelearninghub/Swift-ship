import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { BookClient } from "./BookClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/book");
}

export default function BookPage() {
  return <BookClient />;
}
