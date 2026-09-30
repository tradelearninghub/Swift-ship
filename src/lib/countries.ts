/**
 * International Countries and State/Province Reference Data
 * Designed for International Courier Logistics & Customs Clearance
 */

export interface CountryInfo {
  code: string;       // ISO 2-letter code
  name: string;       // Common English country name
  currency: string;   // Local/standard currency
  phoneCode: string;  // International dialing prefix
  hasStates: boolean; // Whether structured state dropdown is available
}

export const COUNTRIES: CountryInfo[] = [
  // Top International Shipping Destinations from India
  { code: "US", name: "United States", currency: "USD", phoneCode: "+1", hasStates: true },
  { code: "GB", name: "United Kingdom", currency: "GBP", phoneCode: "+44", hasStates: true },
  { code: "CA", name: "Canada", currency: "CAD", phoneCode: "+1", hasStates: true },
  { code: "AE", name: "United Arab Emirates", currency: "AED", phoneCode: "+971", hasStates: true },
  { code: "AU", name: "Australia", currency: "AUD", phoneCode: "+61", hasStates: true },
  { code: "SG", name: "Singapore", currency: "SGD", phoneCode: "+65", hasStates: false },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", phoneCode: "+966", hasStates: true },
  { code: "DE", name: "Germany", currency: "EUR", phoneCode: "+49", hasStates: true },
  { code: "FR", name: "France", currency: "EUR", phoneCode: "+33", hasStates: false },
  { code: "IN", name: "India", currency: "INR", phoneCode: "+91", hasStates: true },
  { code: "NZ", name: "New Zealand", currency: "NZD", phoneCode: "+64", hasStates: true },
  { code: "MY", name: "Malaysia", currency: "MYR", phoneCode: "+60", hasStates: true },
  { code: "NL", name: "Netherlands", currency: "EUR", phoneCode: "+31", hasStates: false },
  { code: "IT", name: "Italy", currency: "EUR", phoneCode: "+39", hasStates: false },
  { code: "ES", name: "Spain", currency: "EUR", phoneCode: "+34", hasStates: false },
  { code: "JP", name: "Japan", currency: "JPY", phoneCode: "+81", hasStates: true },
  { code: "QA", name: "Qatar", currency: "QAR", phoneCode: "+974", hasStates: false },
  { code: "OM", name: "Oman", currency: "OMR", phoneCode: "+968", hasStates: false },
  { code: "KW", name: "Kuwait", currency: "KWD", phoneCode: "+965", hasStates: false },
  { code: "BH", name: "Bahrain", currency: "BHD", phoneCode: "+973", hasStates: false },
  { code: "CH", name: "Switzerland", currency: "CHF", phoneCode: "+41", hasStates: false },
  { code: "IE", name: "Ireland", currency: "EUR", phoneCode: "+353", hasStates: true },
  { code: "ZA", name: "South Africa", currency: "ZAR", phoneCode: "+27", hasStates: true },
  { code: "TH", name: "Thailand", currency: "THB", phoneCode: "+66", hasStates: false },
  { code: "ID", name: "Indonesia", currency: "IDR", phoneCode: "+62", hasStates: false },
  { code: "PH", name: "Philippines", currency: "PHP", phoneCode: "+63", hasStates: false },
  { code: "LK", name: "Sri Lanka", currency: "LKR", phoneCode: "+94", hasStates: true },
  { code: "NP", name: "Nepal", currency: "NPR", phoneCode: "+977", hasStates: true },
  { code: "BD", name: "Bangladesh", currency: "BDT", phoneCode: "+880", hasStates: true },
  { code: "VN", name: "Vietnam", currency: "VND", phoneCode: "+84", hasStates: false },
  { code: "BE", name: "Belgium", currency: "EUR", phoneCode: "+32", hasStates: false },
  { code: "SE", name: "Sweden", currency: "SEK", phoneCode: "+46", hasStates: false },
  { code: "NO", name: "Norway", currency: "NOK", phoneCode: "+47", hasStates: false },
  { code: "DK", name: "Denmark", currency: "DKK", phoneCode: "+45", hasStates: false },
  { code: "FI", name: "Finland", currency: "EUR", phoneCode: "+358", hasStates: false },
  { code: "PL", name: "Poland", currency: "PLN", phoneCode: "+48", hasStates: false },
  { code: "AT", name: "Austria", currency: "EUR", phoneCode: "+43", hasStates: false },
  { code: "PT", name: "Portugal", currency: "EUR", phoneCode: "+351", hasStates: false },
  { code: "GR", name: "Greece", currency: "EUR", phoneCode: "+30", hasStates: false },
  { code: "TR", name: "Turkey", currency: "TRY", phoneCode: "+90", hasStates: false },
  { code: "IL", name: "Israel", currency: "ILS", phoneCode: "+972", hasStates: false },
  { code: "EG", name: "Egypt", currency: "EGP", phoneCode: "+20", hasStates: false },
  { code: "KE", name: "Kenya", currency: "KES", phoneCode: "+254", hasStates: false },
  { code: "NG", name: "Nigeria", currency: "NGN", phoneCode: "+234", hasStates: false },
  { code: "BR", name: "Brazil", currency: "BRL", phoneCode: "+55", hasStates: true },
  { code: "MX", name: "Mexico", currency: "MXN", phoneCode: "+52", hasStates: true },
  { code: "CL", name: "Chile", currency: "CLP", phoneCode: "+56", hasStates: false },
  { code: "AR", name: "Argentina", currency: "ARS", phoneCode: "+54", hasStates: false },
  { code: "KR", name: "South Korea", currency: "KRW", phoneCode: "+82", hasStates: false },
  { code: "HK", name: "Hong Kong", currency: "HKD", phoneCode: "+852", hasStates: false },
  { code: "TW", name: "Taiwan", currency: "TWD", phoneCode: "+886", hasStates: false },
  { code: "MU", name: "Mauritius", currency: "MUR", phoneCode: "+230", hasStates: false },
  { code: "MV", name: "Maldives", currency: "MVR", phoneCode: "+960", hasStates: false },
];

/**
 * Filtered States/Provinces mapping for major destination countries
 */
export const COUNTRY_STATES_MAP: Record<string, string[]> = {
  // United States (All 50 States + DC)
  US: [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
    "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
    "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming"
  ],
  // Canada (Provinces & Territories)
  CA: [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
    "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
    "Quebec", "Saskatchewan", "Yukon"
  ],
  // United Kingdom
  GB: [
    "England", "Scotland", "Wales", "Northern Ireland", "Greater London", "West Midlands",
    "Greater Manchester", "West Yorkshire", "South Yorkshire", "Merseyside", "Tyne and Wear"
  ],
  // Australia (States & Territories)
  AU: [
    "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland",
    "South Australia", "Tasmania", "Victoria", "Western Australia"
  ],
  // United Arab Emirates (7 Emirates)
  AE: [
    "Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain"
  ],
  // Saudi Arabia
  SA: [
    "Riyadh", "Makkah", "Madinah", "Eastern Province", "Al Qassim", "Asir", "Tabuk",
    "Hail", "Northern Borders", "Jazan", "Najran", "Al Bahah", "Al Jawf"
  ],
  // Germany (16 Bundesländer)
  DE: [
    "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg",
    "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia",
    "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
  ],
  // India (States & UTs)
  IN: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ],
  // New Zealand
  NZ: [
    "Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatu-Wanganui",
    "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman",
    "Waikato", "Wellington", "West Coast"
  ],
  // Malaysia
  MY: [
    "Johor", "Kedah", "Kelantan", "Malacca", "Negeri Sembilan", "Pahang", "Penang",
    "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"
  ],
  // Ireland
  IE: [
    "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare",
    "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath",
    "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"
  ],
  // South Africa
  ZA: [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga",
    "Northern Cape", "North West", "Western Cape"
  ],
  // Japan (Key Regions)
  JP: [
    "Tokyo", "Osaka", "Kanagawa", "Aichi", "Hokkaido", "Fukuoka", "Kyoto", "Hyogo", "Saitama", "Chiba"
  ],
  // Brazil (Key States)
  BR: [
    "São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Paraná", "Rio Grande do Sul",
    "Pernambuco", "Ceará", "Pará", "Santa Catarina", "Federal District"
  ],
  // Mexico (Key States)
  MX: [
    "Mexico City", "Jalisco", "Nuevo León", "Puebla", "Guanajuato", "Veracruz",
    "State of Mexico", "Baja California", "Chihuahua", "Querétaro"
  ],
};

/**
 * Helper to get country object by code or name
 */
export function getCountry(countryCodeOrName: string): CountryInfo | undefined {
  if (!countryCodeOrName) return undefined;
  const query = countryCodeOrName.trim().toUpperCase();
  return COUNTRIES.find(
    (c) => c.code.toUpperCase() === query || c.name.toUpperCase() === query
  );
}

/**
 * Returns filtered list of valid states for a country code or name.
 * If country is not in the map, returns null (allowing free text input).
 */
export function getStatesForCountry(countryCodeOrName: string): string[] | null {
  if (!countryCodeOrName) return null;
  const country = getCountry(countryCodeOrName);
  if (!country) return null;
  return COUNTRY_STATES_MAP[country.code] || null;
}
