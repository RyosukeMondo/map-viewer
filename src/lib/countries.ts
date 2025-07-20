/**
 * Countries dataset and selection utilities for the Google Maps viewer
 * Provides curated list of countries with optimal viewing coordinates
 */

import { Country } from "../types/google-maps";
import countriesData from "./countries.json";

/**
 * Curated list of ~50 countries with optimal viewing coordinates
 * Each country includes name, center coordinates, appropriate zoom level, and country code
 */
export const COUNTRIES: Country[] = countriesData.countries;

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
      "GB", "FR", "DE", "IT", "ES", "RU", "NO", "SE", "FI", "PL", "NL", "CH", "IS", "UA",
      "PT", "IE", "BE", "LU", "AT", "CZ", "SK", "HU", "RO", "BG", "GR", "DK", "HR", "RS",
      "BA", "AL", "MK", "ME", "SI", "EE", "LV", "LT", "BY", "MD"
    ],
    asia: [
      "CN", "IN", "JP", "KR", "TH", "VN", "ID", "MY", "PH", "TR", "IR", "SA", "LK", "BD", 
      "NP", "MN", "KZ", "KP", "KH", "LA", "MM", "SG", "TW", "IQ", "SY", "LB", "IL", "JO", 
      "YE", "OM", "AE", "QA", "KW", "BH", "AF", "PK", "BT", "MV", "UZ", "TM", "KG", "TJ"
    ],
    africa: [
      "ZA", "EG", "NG", "KE", "MA", "ET", "GH", "MG", "TZ", "UG", "RW", "BI", "CD", "CG",
      "AO", "ZM", "ZW", "MZ", "NA", "BW", "DZ", "TN", "LY", "SD", "SS", "SO", "ER", "DJ",
      "CI", "SN", "ML", "NE", "TD"
    ],
    "north-america": [
      "US", "CA", "MX", "CU", "JM", "HT", "DO", "PR", "BS", "TT", "PA", "CR", "NI", "HN", 
      "SV", "GT", "BZ"
    ],
    "south-america": [
      "BR", "AR", "CL", "PE", "CO", "VE", "EC", "BO", "PY", "UY"
    ],
    oceania: [
      "AU", "NZ", "PG", "FJ", "SB", "VU"
    ],
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
