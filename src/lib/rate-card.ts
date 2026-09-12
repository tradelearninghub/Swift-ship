/**
 * SS Courier service — Automated Indicative Pricing Engine (§65a)
 * 
 * Provides transparent, indicative shipping rates based on:
 * 1. Origin Pincode (Default: 302003, Jaipur Central Hub)
 * 2. Destination Pincode (Zones A through E across 19,000+ Indian pincodes)
 * 3. Actual Weight vs Volumetric Weight (L x W x H / 5000 cm³) -> Chargeable Weight
 * 4. Multi-Carrier Rate Cards (Delhivery Express Air, DTDC Standard Surface, Priority Cargo)
 * 
 * NOTE: As documented in feature spec §10 & §16, rates calculated here are ESTIMATES.
 * Final shipping charges are confirmed by admin upon physical parcel intake and measurement.
 */

export type ShippingZone =
  | "ZONE_A" // Intra-City (Jaipur Local)
  | "ZONE_B" // Intra-State (Rajasthan Regional)
  | "ZONE_C" // Metro Corridors (Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad)
  | "ZONE_D" // Rest of India (Standard Inter-state)
  | "ZONE_E"; // Special Remote Zones (North-East, J&K, Island Territories)

export interface ZoneResolution {
  zone: ShippingZone;
  zoneName: string;
  zoneDescription: string;
  destinationState: string;
  destinationCity: string;
  typicalTransitDays: string;
}

export interface RateEstimateOption {
  courierCode: string;
  courierName: string;
  serviceType: "EXPRESS" | "SURFACE";
  serviceBadge: string;
  transitDays: string;
  baseWeightKg: number;
  baseRateRupees: number;
  additionalWeightKg: number;
  additionalRateRupees: number;
  totalEstimatedRupees: number;
  totalEstimatedPaise: number;
  breakdown: {
    actualWeightKg: number;
    volumetricWeightKg: number;
    chargeableWeightKg: number;
    baseSlabChargeRupees: number;
    additionalSlabChargeRupees: number;
    additionalSlabsCount: number;
    governingWeightType: "ACTUAL" | "VOLUMETRIC";
  };
  disclaimer: string;
}

export interface CalculationResult {
  originPincode: string;
  destinationPincode: string;
  zoneInfo: ZoneResolution;
  actualWeightKg: number;
  dimensionsCm: { length: number; width: number; height: number };
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  options: RateEstimateOption[];
  notice: string;
}

/**
 * Resolves Indian pincodes into standardized shipping zones from Jaipur Hub (302003)
 */
export function resolveShippingZone(
  originPincode: string = "302003",
  destPincode: string
): ZoneResolution {
  const origin = originPincode.replace(/\D/g, "").slice(0, 6) || "302003";
  const dest = (destPincode || "").replace(/\D/g, "").slice(0, 6);

  if (dest.length !== 6) {
    return {
      zone: "ZONE_D",
      zoneName: "Zone D — Rest of India",
      zoneDescription: "Standard Inter-State Transit",
      destinationState: "India",
      destinationCity: "Destination Hub",
      typicalTransitDays: "3 - 5 Days",
    };
  }

  // 1. Zone A: Intra-city Jaipur (Pincode starts with 302xxx)
  if (dest.startsWith("302")) {
    return {
      zone: "ZONE_A",
      zoneName: "Zone A — Intra-City Jaipur",
      zoneDescription: "Local doorstep pickup & same-day/next-day dispatch across Jaipur city",
      destinationState: "Rajasthan",
      destinationCity: "Jaipur Metropolitan",
      typicalTransitDays: "Same Day / Next Day",
    };
  }

  // 2. Zone B: Intra-State Rajasthan (Pincodes 30xxxx - 34xxxx)
  const prefix2 = parseInt(dest.slice(0, 2), 10);
  if (prefix2 >= 30 && prefix2 <= 34) {
    return {
      zone: "ZONE_B",
      zoneName: "Zone B — Intra-State (Rajasthan)",
      zoneDescription: "Direct road network coverage across Jodhpur, Kota, Udaipur, Bikaner, Ajmer, Alwar",
      destinationState: "Rajasthan",
      destinationCity: "Rajasthan Regional Hub",
      typicalTransitDays: "1 - 2 Days",
    };
  }

  // 3. Zone C: Major Metro-to-Metro Corridors
  // Delhi NCR (11xxxx, 12xxxx), Mumbai/Thane (40xxxx), Bengaluru (56xxxx),
  // Chennai (60xxxx), Kolkata (70xxxx), Hyderabad (50xxxx)
  const isMetro =
    dest.startsWith("11") ||
    dest.startsWith("12") ||
    dest.startsWith("40") ||
    dest.startsWith("56") ||
    dest.startsWith("60") ||
    dest.startsWith("70") ||
    dest.startsWith("50");

  if (isMetro) {
    let metroName = "Metro Corridor";
    if (dest.startsWith("11") || dest.startsWith("12")) metroName = "Delhi NCR";
    else if (dest.startsWith("40")) metroName = "Mumbai / MMR";
    else if (dest.startsWith("56")) metroName = "Bengaluru";
    else if (dest.startsWith("60")) metroName = "Chennai";
    else if (dest.startsWith("70")) metroName = "Kolkata";
    else if (dest.startsWith("50")) metroName = "Hyderabad";

    return {
      zone: "ZONE_C",
      zoneName: `Zone C — Metro Corridors (${metroName})`,
      zoneDescription: `Direct daily air connections between Jaipur and ${metroName}`,
      destinationState: metroName,
      destinationCity: metroName,
      typicalTransitDays: "2 - 3 Days",
    };
  }

  // 4. Zone E: Special Remote Zones (North-East, J&K, Island Territories)
  // North-East: 78xxxx, 79xxxx (Assam, Meghalaya, Tripura, Nagaland, Manipur, Mizoram, Arunachal)
  // J&K: 18xxxx, 19xxxx
  if (prefix2 === 78 || prefix2 === 79 || prefix2 === 18 || prefix2 === 19) {
    const region = prefix2 === 18 || prefix2 === 19 ? "Jammu & Kashmir / Ladakh" : "North-Eastern States";
    return {
      zone: "ZONE_E",
      zoneName: `Zone E — Special Remote Zones (${region})`,
      zoneDescription: `Hilly and special terrain air/road cargo routes to ${region}`,
      destinationState: region,
      destinationCity: region,
      typicalTransitDays: "4 - 7 Days",
    };
  }

  // 5. Zone D: Rest of India (Standard inter-state)
  return {
    zone: "ZONE_D",
    zoneName: "Zone D — Rest of India",
    zoneDescription: "Reliable line-haul transport covering non-metro tier-2 & tier-3 cities across India",
    destinationState: "Inter-State",
    destinationCity: "Rest of India",
    typicalTransitDays: "3 - 5 Days",
  };
}

/**
 * Directionally realistic Indian Courier Rate Cards (Paise / INR)
 * Baseline commercial rates for domestic courier shipping:
 */
const RATE_CARDS_CONFIG = {
  // 1. Delhivery Express Air (Priority Air Cargo)
  DELHIVERY_AIR: {
    courierCode: "DELHIVERY",
    courierName: "Delhivery Express Air",
    serviceType: "EXPRESS" as const,
    serviceBadge: "Fastest Air Cargo",
    baseWeightKg: 0.5,
    additionalWeightKg: 0.5,
    rates: {
      ZONE_A: { base: 50, add: 30, transit: "Same / Next Day" },
      ZONE_B: { base: 75, add: 40, transit: "1 - 2 Days" },
      ZONE_C: { base: 110, add: 60, transit: "2 - 3 Days" },
      ZONE_D: { base: 135, add: 75, transit: "3 - 4 Days" },
      ZONE_E: { base: 175, add: 95, transit: "4 - 6 Days" },
    },
  },

  // 2. DTDC Standard Surface Cargo (Economical Road Transit)
  DTDC_SURFACE: {
    courierCode: "DTDC",
    courierName: "DTDC Standard Surface",
    serviceType: "SURFACE" as const,
    serviceBadge: "Economical Ground",
    baseWeightKg: 0.5,
    additionalWeightKg: 1.0, // per 1 kg additional
    rates: {
      ZONE_A: { base: 40, add: 25, transit: "1 - 2 Days" },
      ZONE_B: { base: 60, add: 35, transit: "2 - 3 Days" },
      ZONE_C: { base: 85, add: 45, transit: "3 - 5 Days" },
      ZONE_D: { base: 105, add: 55, transit: "4 - 6 Days" },
      ZONE_E: { base: 140, add: 75, transit: "5 - 7 Days" },
    },
  },

  // 3. XpressBees Priority Cargo (Balanced E-Commerce Logistics)
  XPRESSBEES_PRIORITY: {
    courierCode: "XPRESSBEES",
    courierName: "XpressBees Priority Express",
    serviceType: "EXPRESS" as const,
    serviceBadge: "Popular Choice",
    baseWeightKg: 0.5,
    additionalWeightKg: 0.5,
    rates: {
      ZONE_A: { base: 45, add: 28, transit: "Next Day" },
      ZONE_B: { base: 70, add: 38, transit: "1 - 2 Days" },
      ZONE_C: { base: 100, add: 55, transit: "2 - 3 Days" },
      ZONE_D: { base: 125, add: 70, transit: "3 - 5 Days" },
      ZONE_E: { base: 165, add: 90, transit: "4 - 6 Days" },
    },
  },
};

/**
 * Main Shipping Calculation Function
 */
export function calculateShippingQuote(params: {
  originPincode?: string;
  destinationPincode: string;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}): CalculationResult {
  const origin = params.originPincode || "302003";
  const dest = params.destinationPincode;
  const actualWt = Math.max(0.05, Number(params.weightKg) || 0.5);
  const l = Math.max(1, Number(params.lengthCm) || 10);
  const w = Math.max(1, Number(params.widthCm) || 10);
  const h = Math.max(1, Number(params.heightCm) || 10);

  // Volumetric formula (L x W x H in cm / 5000)
  const volumetricWt = Number(((l * w * h) / 5000).toFixed(2));
  const chargeableWt = Number(Math.max(actualWt, volumetricWt).toFixed(2));
  const governingType = volumetricWt > actualWt ? "VOLUMETRIC" : "ACTUAL";

  const zoneInfo = resolveShippingZone(origin, dest);

  const options: RateEstimateOption[] = Object.values(RATE_CARDS_CONFIG).map((card) => {
    const rateTier = card.rates[zoneInfo.zone];
    const baseKg = card.baseWeightKg;
    const addKg = card.additionalWeightKg;

    const baseCharge = rateTier.base;
    const excessWeight = Math.max(0, chargeableWt - baseKg);
    const additionalSlabs = excessWeight > 0 ? Math.ceil(excessWeight / addKg) : 0;
    const additionalCharge = additionalSlabs * rateTier.add;
    const totalRupees = baseCharge + additionalCharge;

    return {
      courierCode: card.courierCode,
      courierName: card.courierName,
      serviceType: card.serviceType,
      serviceBadge: card.serviceBadge,
      transitDays: rateTier.transit,
      baseWeightKg: baseKg,
      baseRateRupees: baseCharge,
      additionalWeightKg: addKg,
      additionalRateRupees: rateTier.add,
      totalEstimatedRupees: totalRupees,
      totalEstimatedPaise: totalRupees * 100,
      breakdown: {
        actualWeightKg: actualWt,
        volumetricWeightKg: volumetricWt,
        chargeableWeightKg: chargeableWt,
        baseSlabChargeRupees: baseCharge,
        additionalSlabChargeRupees: additionalCharge,
        additionalSlabsCount: additionalSlabs,
        governingWeightType: governingType,
      },
      disclaimer:
        "Indicative estimate only. Actual shipping charge is verified and confirmed by SS Courier admin team upon package physical intake (§10 & §16).",
    };
  });

  return {
    originPincode: origin,
    destinationPincode: dest,
    zoneInfo,
    actualWeightKg: actualWt,
    dimensionsCm: { length: l, width: w, height: h },
    volumetricWeightKg: volumetricWt,
    chargeableWeightKg: chargeableWt,
    options,
    notice:
      "Indicative estimate only. Actual charge is finalized by SS Courier operations staff upon physical weighing and verification at the hub.",
  };
}
