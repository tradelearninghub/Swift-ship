import { prisma } from "@/lib/prisma";
import { getThirdPartyTrackingUrl } from "@/lib/trackingUrls";

export interface BookingTrackingMetadata {
  booking_id: string;
  booking_number: string;
  manual_awb?: string;
  awb_date?: string;
  courier_code?: string;
  courier_name?: string;
  third_party_tracking_id?: string;
  third_party_tracking_url?: string;
  updated_at: string;
}

// In-memory fallback map for offline / fast access
const memoryTrackingMetadata = new Map<string, BookingTrackingMetadata>();

const SETTINGS_KEY = "booking_tracking_metadata_map";

/**
 * Load all tracking metadata records from database
 */
export async function getAllTrackingMetadata(): Promise<Record<string, BookingTrackingMetadata>> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: SETTINGS_KEY },
    });
    if (setting && setting.value) {
      const parsed = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
      if (typeof parsed === "object" && parsed !== null) {
        // Sync to memory
        for (const [k, v] of Object.entries(parsed)) {
          memoryTrackingMetadata.set(k, v as BookingTrackingMetadata);
        }
        return parsed;
      }
    }
  } catch (err) {}

  const obj: Record<string, BookingTrackingMetadata> = {};
  memoryTrackingMetadata.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
}

/**
 * Get tracking metadata for a specific booking or tracking search term
 */
export async function getTrackingMetadata(identifier: string): Promise<BookingTrackingMetadata | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toUpperCase();

  // Check memory first
  if (memoryTrackingMetadata.has(clean)) {
    return memoryTrackingMetadata.get(clean)!;
  }

  // Check by values in memory
  const memoryValues = Array.from(memoryTrackingMetadata.values());
  for (const item of memoryValues) {
    if (
      item.booking_number?.toUpperCase() === clean ||
      item.manual_awb?.toUpperCase() === clean ||
      item.third_party_tracking_id?.toUpperCase() === clean
    ) {
      return item;
    }
  }

  // Load from DB
  const all = await getAllTrackingMetadata();
  for (const item of Object.values(all)) {
    if (
      item.booking_number?.toUpperCase() === clean ||
      item.manual_awb?.toUpperCase() === clean ||
      item.third_party_tracking_id?.toUpperCase() === clean ||
      item.booking_id?.toUpperCase() === clean
    ) {
      return item;
    }
  }

  return null;
}

/**
 * Save or update tracking metadata for a booking
 */
export async function saveTrackingMetadata(
  bookingId: string,
  bookingNumber: string,
  data: Partial<BookingTrackingMetadata>
): Promise<BookingTrackingMetadata> {
  const existing: Partial<BookingTrackingMetadata> =
    (await getTrackingMetadata(bookingNumber)) ||
    (await getTrackingMetadata(bookingId)) ||
    {};

  const courierName = data.courier_name || existing.courier_name || "DHL Express";
  const courierCode = data.courier_code || existing.courier_code || "DHL";
  const thirdPartyId = data.third_party_tracking_id ?? existing.third_party_tracking_id ?? "";

  const autoUrl =
    data.third_party_tracking_url ||
    (thirdPartyId ? getThirdPartyTrackingUrl(courierCode || courierName, thirdPartyId) : "");

  const record: BookingTrackingMetadata = {
    booking_id: bookingId,
    booking_number: bookingNumber,
    manual_awb: data.manual_awb !== undefined ? data.manual_awb : existing.manual_awb,
    awb_date: data.awb_date !== undefined ? data.awb_date : existing.awb_date || new Date().toISOString().split("T")[0],
    courier_code: courierCode,
    courier_name: courierName,
    third_party_tracking_id: thirdPartyId,
    third_party_tracking_url: autoUrl,
    updated_at: new Date().toISOString(),
  };

  memoryTrackingMetadata.set(bookingNumber.toUpperCase(), record);
  if (record.manual_awb) {
    memoryTrackingMetadata.set(record.manual_awb.toUpperCase(), record);
  }
  if (record.third_party_tracking_id) {
    memoryTrackingMetadata.set(record.third_party_tracking_id.toUpperCase(), record);
  }

  try {
    const all = await getAllTrackingMetadata();
    all[bookingNumber] = record;
    if (record.manual_awb) all[record.manual_awb] = record;
    if (record.third_party_tracking_id) all[record.third_party_tracking_id] = record;

    await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: all as any, group: "tracking" },
      create: { key: SETTINGS_KEY, value: all as any, group: "tracking" },
    });
  } catch (err) {}

  return record;
}
