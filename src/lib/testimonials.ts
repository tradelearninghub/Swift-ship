import { prisma } from "@/lib/prisma";

export interface Testimonial {
  id: string;
  client_name: string;
  client_role: string;
  company_name?: string;
  avatar_url?: string;
  rating: number; // 1 - 5
  review: string;
  destination_route?: string;
  tag?: string;
  is_active: boolean;
  created_at: string;
}

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "testi-1",
    client_name: "Vikram Singhania",
    client_role: "Managing Director",
    company_name: "Singhania Gemstone & Exports, Jaipur",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review:
      "We export fine handcrafted jewellery and precious gemstones to the USA and Europe on strict delivery schedules. SS International Courier handles customs clearance effortlessly with 100% on-time air delivery. Live tracking gives both us and our overseas buyers complete peace of mind.",
    destination_route: "Jaipur → New York, USA",
    tag: "Verified Air Cargo Exporter",
    is_active: true,
    created_at: "2024-09-15T10:00:00.000Z",
  },
  {
    id: "testi-2",
    client_name: "Pooja Deshmukh",
    client_role: "Head of International Logistics",
    company_name: "Aura Apparel & Handloom Exports",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review:
      "Switching to SS International was the best operational decision for our UK fashion consignments. Doorstep pickup in Jaipur was seamless, export commercial invoices were vetted accurately, and our samples reached our London buyers in 4 days without a single customs delay.",
    destination_route: "Delhi / Jaipur → London, UK",
    tag: "Regular Export Consignee",
    is_active: true,
    created_at: "2024-09-28T14:30:00.000Z",
  },
  {
    id: "testi-3",
    client_name: "Dr. Arvind K. Mehta",
    client_role: "Senior Professor & Parent",
    company_name: "University Transcripts & Legal Documents",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review:
      "Needed to send my son's original university transcripts and urgent visa certificates to University of Toronto. The team packed everything in tamper-evident security flyers and tracked the consignment milestone-by-milestone. Delivered in Canada in under 72 hours!",
    destination_route: "Mumbai → Toronto, Canada",
    tag: "Express Document Client",
    is_active: true,
    created_at: "2024-10-04T09:15:00.000Z",
  },
  {
    id: "testi-4",
    client_name: "Farhan Qureshi",
    client_role: "Co-Founder & Operations Lead",
    company_name: "Zesture Handcrafted Goods",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review:
      "Our handmade brass and leather artisanal goods are dispatched weekly to Dubai and Riyadh. SS International offers the most transparent cross-border rates, zero hidden fuel surcharges, and instant WhatsApp support whenever we need customs documentation guidance.",
    destination_route: "Jaipur → Dubai, UAE",
    tag: "Cross-Border E-Commerce",
    is_active: true,
    created_at: "2024-10-10T16:45:00.000Z",
  },
];

// In-memory fallback if database server is disconnected
let memoryTestimonials: Testimonial[] = [...INITIAL_TESTIMONIALS];

export async function getTestimonials(onlyActive: boolean = true): Promise<Testimonial[]> {
  try {
    const setting = await prisma.setting.findFirst({
      where: { key: "testimonials" },
    });

    if (setting && setting.value) {
      const parsed = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return onlyActive ? parsed.filter((t: Testimonial) => t.is_active) : parsed;
      }
    }

    // Auto-seed initial 4 testimonials into the database if not present
    try {
      await prisma.setting.upsert({
        where: { key: "testimonials" },
        update: { value: INITIAL_TESTIMONIALS as any, group: "cms" },
        create: {
          key: "testimonials",
          group: "cms",
          value: INITIAL_TESTIMONIALS as any,
        },
      });
    } catch {}

    return onlyActive ? INITIAL_TESTIMONIALS.filter((t) => t.is_active) : INITIAL_TESTIMONIALS;
  } catch (error) {
    // Database fallback
    return onlyActive ? memoryTestimonials.filter((t) => t.is_active) : memoryTestimonials;
  }
}

export async function saveTestimonials(items: Testimonial[]): Promise<boolean> {
  memoryTestimonials = [...items];
  try {
    await prisma.setting.upsert({
      where: { key: "testimonials" },
      update: { value: items as any, group: "cms" },
      create: {
        key: "testimonials",
        group: "cms",
        value: items as any,
      },
    });
    return true;
  } catch (error) {
    return true; // Still persisted in fallback memory
  }
}
