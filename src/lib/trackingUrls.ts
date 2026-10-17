export interface CourierTrackingProvider {
  name: string;
  code: string;
  country: "India" | "International / USA";
  urlTemplate: (id: string) => string;
  website: string;
}

export const COURIER_TRACKING_PROVIDERS: Record<string, CourierTrackingProvider> = {
  DELHIVERY: {
    name: "Delhivery",
    code: "DELHIVERY",
    country: "India",
    urlTemplate: (id) => `https://www.delhivery.com/track/package/${encodeURIComponent(id)}`,
    website: "https://www.delhivery.com",
  },
  BLUEDART: {
    name: "Blue Dart",
    code: "BLUEDART",
    country: "India",
    urlTemplate: (id) => `https://www.bluedart.com/tracking?trackNumber=${encodeURIComponent(id)}`,
    website: "https://www.bluedart.com",
  },
  DTDC: {
    name: "DTDC Express",
    code: "DTDC",
    country: "India",
    urlTemplate: (id) => `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCNNo=${encodeURIComponent(id)}`,
    website: "https://www.dtdc.in",
  },
  INDIA_POST: {
    name: "India Post (Speed Post)",
    code: "INDIA_POST",
    country: "India",
    urlTemplate: (id) => `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignment=${encodeURIComponent(id)}`,
    website: "https://www.indiapost.gov.in",
  },
  EKART: {
    name: "Ekart Logistics",
    code: "EKART",
    country: "India",
    urlTemplate: (id) => `https://ekartlogistics.com/shipmenttrack/${encodeURIComponent(id)}`,
    website: "https://ekartlogistics.com",
  },
  SHADOWFAX: {
    name: "Shadowfax Express",
    code: "SHADOWFAX",
    country: "India",
    urlTemplate: (id) => `https://tracker.shadowfax.in/#/track?awb=${encodeURIComponent(id)}`,
    website: "https://tracker.shadowfax.in",
  },
  XPRESSBEES: {
    name: "Xpressbees",
    code: "XPRESSBEES",
    country: "India",
    urlTemplate: (id) => `https://www.xpressbees.com/track?awb=${encodeURIComponent(id)}`,
    website: "https://www.xpressbees.com",
  },
  TPC: {
    name: "The Professional Couriers",
    code: "TPC",
    country: "India",
    urlTemplate: (id) => `https://www.tpcindia.com/track.aspx?conno=${encodeURIComponent(id)}`,
    website: "https://www.tpcindia.com",
  },
  TRACKON: {
    name: "Trackon Couriers",
    code: "TRACKON",
    country: "India",
    urlTemplate: (id) => `https://trackon.in/track-trace/?awb=${encodeURIComponent(id)}`,
    website: "https://trackon.in",
  },
  ECOM_EXPRESS: {
    name: "Ecom Express",
    code: "ECOM_EXPRESS",
    country: "India",
    urlTemplate: (id) => `https://ecomexpress.in/tracking/?awb=${encodeURIComponent(id)}`,
    website: "https://ecomexpress.in",
  },
  GATI: {
    name: "Gati-KWE (Allcargo)",
    code: "GATI",
    country: "India",
    urlTemplate: (id) => `https://www.gati.com/track-shipment/?dktno=${encodeURIComponent(id)}`,
    website: "https://www.gati.com",
  },
  SAFEXPRESS: {
    name: "Safexpress",
    code: "SAFEXPRESS",
    country: "India",
    urlTemplate: (id) => `https://www.safexpress.com/tracking?waybill=${encodeURIComponent(id)}`,
    website: "https://www.safexpress.com",
  },
  MARUTI: {
    name: "Shree Maruti Courier",
    code: "MARUTI",
    country: "India",
    urlTemplate: (id) => `https://www.shreemaruticourier.com/track-shipment/?track_number=${encodeURIComponent(id)}`,
    website: "https://www.shreemaruticourier.com",
  },

  // International / US Carriers
  FEDEX: {
    name: "FedEx Express",
    code: "FEDEX",
    country: "International / USA",
    urlTemplate: (id) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(id)}`,
    website: "https://www.fedex.com",
  },
  DHL: {
    name: "DHL Express",
    code: "DHL",
    country: "International / USA",
    urlTemplate: (id) => `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(id)}`,
    website: "https://www.dhl.com",
  },
  UPS: {
    name: "UPS (United Parcel Service)",
    code: "UPS",
    country: "International / USA",
    urlTemplate: (id) => `https://www.ups.com/track?tracknum=${encodeURIComponent(id)}`,
    website: "https://www.ups.com",
  },
  USPS: {
    name: "USPS (United States Postal Service)",
    code: "USPS",
    country: "International / USA",
    urlTemplate: (id) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(id)}`,
    website: "https://tools.usps.com",
  },
  ARAMEX: {
    name: "Aramex International",
    code: "ARAMEX",
    country: "International / USA",
    urlTemplate: (id) => `https://www.aramex.com/track/results?mode=0&ShipmentNumber=${encodeURIComponent(id)}`,
    website: "https://www.aramex.com",
  },
  TNT: {
    name: "TNT Express",
    code: "TNT",
    country: "International / USA",
    urlTemplate: (id) => `https://www.tnt.com/express/en_gc/site/shipping-tools/tracking.html?searchType=CON&cons=${encodeURIComponent(id)}`,
    website: "https://www.tnt.com",
  },
  ROYAL_MAIL: {
    name: "Royal Mail",
    code: "ROYAL_MAIL",
    country: "International / USA",
    urlTemplate: (id) => `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(id)}`,
    website: "https://www.royalmail.com",
  },
  PUROLATOR: {
    name: "Purolator",
    code: "PUROLATOR",
    country: "International / USA",
    urlTemplate: (id) => `https://www.purolator.com/en/shipping/tracker?pins=${encodeURIComponent(id)}`,
    website: "https://www.purolator.com",
  },
};

/**
 * Generates an official tracking URL based on courier company and third-party tracking ID
 */
export function getThirdPartyTrackingUrl(courierCodeOrName: string, trackingId: string): string {
  if (!trackingId || !trackingId.trim()) return "";
  const cleanId = trackingId.trim();

  // Normalize code
  const upper = (courierCodeOrName || "").toUpperCase().replace(/[\s-]/g, "_");
  const foundByCode = COURIER_TRACKING_PROVIDERS[upper];
  if (foundByCode) {
    return foundByCode.urlTemplate(cleanId);
  }

  // Find by partial name match
  const lowerName = (courierCodeOrName || "").toLowerCase();
  for (const key of Object.keys(COURIER_TRACKING_PROVIDERS)) {
    const provider = COURIER_TRACKING_PROVIDERS[key];
    if (
      lowerName.includes(provider.name.toLowerCase()) ||
      lowerName.includes(provider.code.toLowerCase())
    ) {
      return provider.urlTemplate(cleanId);
    }
  }

  // Fallback Google Tracking Search
  return `https://www.google.com/search?q=${encodeURIComponent(`${courierCodeOrName || "Courier"} tracking ${cleanId}`)}`;
}
