/**
 * Countries dataset and selection utilities for the Google Maps viewer
 * Provides curated list of countries with optimal viewing coordinates
 */

import { Country } from "../types/google-maps";

/**
 * Curated list of ~50 countries with optimal viewing coordinates
 * Each country includes name, center coordinates, appropriate zoom level, and country code
 */
export const COUNTRIES: Country[] = [
  // North America
  {
    name: "United States",
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4,
    code: "US",
  },
  {
    name: "Canada",
    center: { lat: 56.1304, lng: -106.3468 },
    zoom: 3,
    code: "CA",
  },
  {
    name: "Mexico",
    center: { lat: 23.6345, lng: -102.5528 },
    zoom: 5,
    code: "MX",
  },

  // South America
  {
    name: "Brazil",
    center: { lat: -14.235, lng: -51.9253 },
    zoom: 4,
    code: "BR",
  },
  {
    name: "Argentina",
    center: { lat: -38.4161, lng: -63.6167 },
    zoom: 4,
    code: "AR",
  },
  {
    name: "Chile",
    center: { lat: -35.6751, lng: -71.543 },
    zoom: 4,
    code: "CL",
  },
  { name: "Peru", center: { lat: -9.19, lng: -75.0152 }, zoom: 5, code: "PE" },
  {
    name: "Colombia",
    center: { lat: 4.5709, lng: -74.2973 },
    zoom: 5,
    code: "CO",
  },

  // Europe
  {
    name: "United Kingdom",
    center: { lat: 55.3781, lng: -3.436 },
    zoom: 6,
    code: "GB",
  },
  {
    name: "France",
    center: { lat: 46.6034, lng: 1.8883 },
    zoom: 6,
    code: "FR",
  },
  {
    name: "Germany",
    center: { lat: 51.1657, lng: 10.4515 },
    zoom: 6,
    code: "DE",
  },
  {
    name: "Italy",
    center: { lat: 41.8719, lng: 12.5674 },
    zoom: 6,
    code: "IT",
  },
  {
    name: "Spain",
    center: { lat: 40.4637, lng: -3.7492 },
    zoom: 6,
    code: "ES",
  },
  {
    name: "Russia",
    center: { lat: 61.524, lng: 105.3188 },
    zoom: 3,
    code: "RU",
  },
  { name: "Norway", center: { lat: 60.472, lng: 8.4689 }, zoom: 5, code: "NO" },
  {
    name: "Sweden",
    center: { lat: 60.1282, lng: 18.6435 },
    zoom: 5,
    code: "SE",
  },
  {
    name: "Finland",
    center: { lat: 61.9241, lng: 25.7482 },
    zoom: 5,
    code: "FI",
  },
  {
    name: "Poland",
    center: { lat: 51.9194, lng: 19.1451 },
    zoom: 6,
    code: "PL",
  },
  {
    name: "Netherlands",
    center: { lat: 52.1326, lng: 5.2913 },
    zoom: 7,
    code: "NL",
  },
  {
    name: "Switzerland",
    center: { lat: 46.8182, lng: 8.2275 },
    zoom: 7,
    code: "CH",
  },

  // Asia
  {
    name: "China",
    center: { lat: 35.8617, lng: 104.1954 },
    zoom: 4,
    code: "CN",
  },
  {
    name: "India",
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 5,
    code: "IN",
  },
  {
    name: "Japan",
    center: { lat: 36.2048, lng: 138.2529 },
    zoom: 5,
    code: "JP",
  },
  {
    name: "South Korea",
    center: { lat: 35.9078, lng: 127.7669 },
    zoom: 7,
    code: "KR",
  },
  {
    name: "Thailand",
    center: { lat: 15.87, lng: 100.9925 },
    zoom: 6,
    code: "TH",
  },
  {
    name: "Vietnam",
    center: { lat: 14.0583, lng: 108.2772 },
    zoom: 6,
    code: "VN",
  },
  {
    name: "Indonesia",
    center: { lat: -0.7893, lng: 113.9213 },
    zoom: 5,
    code: "ID",
  },
  {
    name: "Malaysia",
    center: { lat: 4.2105, lng: 101.9758 },
    zoom: 6,
    code: "MY",
  },
  {
    name: "Philippines",
    center: { lat: 12.8797, lng: 121.774 },
    zoom: 6,
    code: "PH",
  },
  {
    name: "Turkey",
    center: { lat: 38.9637, lng: 35.2433 },
    zoom: 6,
    code: "TR",
  },
  { name: "Iran", center: { lat: 32.4279, lng: 53.688 }, zoom: 5, code: "IR" },
  {
    name: "Saudi Arabia",
    center: { lat: 23.8859, lng: 45.0792 },
    zoom: 5,
    code: "SA",
  },

  // Africa
  {
    name: "South Africa",
    center: { lat: -30.5595, lng: 22.9375 },
    zoom: 5,
    code: "ZA",
  },
  {
    name: "Egypt",
    center: { lat: 26.0975, lng: 31.2357 },
    zoom: 6,
    code: "EG",
  },
  { name: "Nigeria", center: { lat: 9.082, lng: 8.6753 }, zoom: 6, code: "NG" },
  {
    name: "Kenya",
    center: { lat: -0.0236, lng: 37.9062 },
    zoom: 6,
    code: "KE",
  },
  {
    name: "Morocco",
    center: { lat: 31.7917, lng: -7.0926 },
    zoom: 6,
    code: "MA",
  },
  {
    name: "Ethiopia",
    center: { lat: 9.145, lng: 40.4897 },
    zoom: 6,
    code: "ET",
  },
  { name: "Ghana", center: { lat: 7.9465, lng: -1.0232 }, zoom: 7, code: "GH" },

  // Oceania
  {
    name: "Australia",
    center: { lat: -25.2744, lng: 133.7751 },
    zoom: 4,
    code: "AU",
  },
  {
    name: "New Zealand",
    center: { lat: -40.9006, lng: 174.886 },
    zoom: 6,
    code: "NZ",
  },

  // Additional countries for variety
  {
    name: "Iceland",
    center: { lat: 64.9631, lng: -19.0208 },
    zoom: 7,
    code: "IS",
  },
  {
    name: "Greenland",
    center: { lat: 71.7069, lng: -42.6043 },
    zoom: 4,
    code: "GL",
  },
  {
    name: "Madagascar",
    center: { lat: -18.7669, lng: 46.8691 },
    zoom: 6,
    code: "MG",
  },
  {
    name: "Cuba",
    center: { lat: 21.5218, lng: -77.7812 },
    zoom: 7,
    code: "CU",
  },
  {
    name: "Jamaica",
    center: { lat: 18.1096, lng: -77.2975 },
    zoom: 8,
    code: "JM",
  },
  {
    name: "Sri Lanka",
    center: { lat: 7.8731, lng: 80.7718 },
    zoom: 7,
    code: "LK",
  },
  {
    name: "Bangladesh",
    center: { lat: 23.685, lng: 90.3563 },
    zoom: 7,
    code: "BD",
  },
  { name: "Nepal", center: { lat: 28.3949, lng: 84.124 }, zoom: 7, code: "NP" },
  {
    name: "Mongolia",
    center: { lat: 46.8625, lng: 103.8467 },
    zoom: 5,
    code: "MN",
  },
  {
    name: "Kazakhstan",
    center: { lat: 48.0196, lng: 66.9237 },
    zoom: 4,
    code: "KZ",
  },
  {
    name: "Ukraine",
    center: { lat: 48.3794, lng: 31.1656 },
    zoom: 6,
    code: "UA",
  },
];

/**
 * Class to manage country selection with anti-repetition logic
 */
class CountrySelector {
  private recentlySelected: Set<string> = new Set();
  private readonly maxRecentSize: number;

  constructor(maxRecentSize: number = 5) {
    this.maxRecentSize = Math.min(maxRecentSize, COUNTRIES.length - 1);
  }

  /**
   * Selects a random country that hasn't been recently selected
   * @returns A randomly selected country
   */
  selectRandomCountry(): Country {
    const availableCountries = COUNTRIES.filter(
      (country) => !this.recentlySelected.has(country.code)
    );

    // If all countries have been recently selected, clear the recent list
    if (availableCountries.length === 0) {
      this.recentlySelected.clear();
      return this.selectRandomCountry();
    }

    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    const selectedCountry = availableCountries[randomIndex];

    // Add to recently selected
    this.recentlySelected.add(selectedCountry.code);

    // Maintain the size of recently selected set
    if (this.recentlySelected.size > this.maxRecentSize) {
      const firstItem = this.recentlySelected.values().next().value;
      if (firstItem) {
        this.recentlySelected.delete(firstItem);
      }
    }

    return selectedCountry;
  }

  /**
   * Resets the recently selected countries list
   */
  reset(): void {
    this.recentlySelected.clear();
  }

  /**
   * Gets the list of recently selected country codes
   * @returns Array of recently selected country codes
   */
  getRecentlySelected(): string[] {
    return Array.from(this.recentlySelected);
  }
}

// Global instance for country selection
export const countrySelector = new CountrySelector();

/**
 * Validates a country object to ensure it has all required properties
 * @param country - The country object to validate
 * @returns True if the country is valid, false otherwise
 */
export function validateCountry(country: unknown): country is Country {
  if (!country || typeof country !== "object") {
    return false;
  }

  const obj = country as Record<string, unknown>;

  // Check required string properties
  if (typeof obj.name !== "string" || obj.name.trim() === "") {
    return false;
  }

  if (typeof obj.code !== "string" || obj.code.trim() === "") {
    return false;
  }

  // Check zoom level
  if (typeof obj.zoom !== "number" || obj.zoom < 1 || obj.zoom > 20) {
    return false;
  }

  // Check center coordinates
  if (!obj.center || typeof obj.center !== "object") {
    return false;
  }

  const center = obj.center as Record<string, unknown>;
  if (typeof center.lat !== "number" || typeof center.lng !== "number") {
    return false;
  }

  // Validate latitude and longitude ranges
  if (center.lat < -90 || center.lat > 90) {
    return false;
  }

  if (center.lng < -180 || center.lng > 180) {
    return false;
  }

  return true;
}

/**
 * Validates the entire countries dataset
 * @returns Object containing validation results
 */
export function validateCountriesDataset(): {
  isValid: boolean;
  errors: string[];
  validCount: number;
  totalCount: number;
} {
  const errors: string[] = [];
  let validCount = 0;

  // Check if COUNTRIES array exists and is not empty
  if (!Array.isArray(COUNTRIES) || COUNTRIES.length === 0) {
    errors.push("Countries dataset is not a valid array or is empty");
    return {
      isValid: false,
      errors,
      validCount: 0,
      totalCount: 0,
    };
  }

  // Validate each country
  COUNTRIES.forEach((country, index) => {
    if (validateCountry(country)) {
      validCount++;
    } else {
      errors.push(
        `Invalid country at index ${index}: ${JSON.stringify(country)}`
      );
    }
  });

  // Check for duplicate country codes
  const countryCodes = COUNTRIES.map((c) => c.code);
  const uniqueCodes = new Set(countryCodes);
  if (countryCodes.length !== uniqueCodes.size) {
    errors.push("Duplicate country codes found in dataset");
  }

  // Check minimum dataset size
  if (COUNTRIES.length < 10) {
    errors.push(
      `Dataset too small: ${COUNTRIES.length} countries (minimum 10 recommended)`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    validCount,
    totalCount: COUNTRIES.length,
  };
}

/**
 * Gets a country by its country code
 * @param code - The country code to search for
 * @returns The country object if found, undefined otherwise
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((country) => country.code === code);
}

/**
 * Gets all countries from a specific continent/region
 * @param region - The region to filter by (based on country names and codes)
 * @returns Array of countries from the specified region
 */
export function getCountriesByRegion(
  region:
    | "europe"
    | "asia"
    | "africa"
    | "north-america"
    | "south-america"
    | "oceania"
): Country[] {
  const regionMappings = {
    europe: [
      "GB",
      "FR",
      "DE",
      "IT",
      "ES",
      "RU",
      "NO",
      "SE",
      "FI",
      "PL",
      "NL",
      "CH",
      "IS",
      "UA",
    ],
    asia: [
      "CN",
      "IN",
      "JP",
      "KR",
      "TH",
      "VN",
      "ID",
      "MY",
      "PH",
      "TR",
      "IR",
      "SA",
      "LK",
      "BD",
      "NP",
      "MN",
      "KZ",
    ],
    africa: ["ZA", "EG", "NG", "KE", "MA", "ET", "GH", "MG"],
    "north-america": ["US", "CA", "MX", "CU", "JM"],
    "south-america": ["BR", "AR", "CL", "PE", "CO"],
    oceania: ["AU", "NZ"],
  };

  const regionCodes = regionMappings[region] || [];
  return COUNTRIES.filter((country) => regionCodes.includes(country.code));
}

/**
 * Selects a random country from the entire dataset (simple random selection)
 * @returns A randomly selected country
 */
export function getRandomCountry(): Country {
  const randomIndex = Math.floor(Math.random() * COUNTRIES.length);
  return COUNTRIES[randomIndex];
}

/**
 * Selects a random country without immediate repetition (uses the global selector)
 * @returns A randomly selected country that hasn't been recently selected
 */
export function getRandomCountryWithoutRepetition(): Country {
  return countrySelector.selectRandomCountry();
}
