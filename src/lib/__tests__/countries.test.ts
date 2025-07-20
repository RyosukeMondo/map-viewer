/**
 * Unit tests for countries dataset and selection utilities
 */

import {
  COUNTRIES,
  countrySelector,
  validateCountry,
  validateCountriesDataset,
  getCountryByCode,
  getCountriesByRegion,
  getRandomCountry,
  getRandomCountryWithoutRepetition,
} from "../countries";
import { Country } from "../../types/google-maps";

describe("Countries Dataset", () => {
  test("should have at least 50 countries", () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(50);
  });

  test("should have all countries with required properties", () => {
    COUNTRIES.forEach((country) => {
      expect(country).toHaveProperty("name");
      expect(country).toHaveProperty("center");
      expect(country).toHaveProperty("zoom");
      expect(country).toHaveProperty("code");

      expect(typeof country.name).toBe("string");
      expect(typeof country.code).toBe("string");
      expect(typeof country.zoom).toBe("number");
      expect(typeof country.center).toBe("object");
      expect(typeof country.center.lat).toBe("number");
      expect(typeof country.center.lng).toBe("number");

      // Validate coordinate ranges
      expect(country.center.lat).toBeGreaterThanOrEqual(-90);
      expect(country.center.lat).toBeLessThanOrEqual(90);
      expect(country.center.lng).toBeGreaterThanOrEqual(-180);
      expect(country.center.lng).toBeLessThanOrEqual(180);

      // Validate zoom level
      expect(country.zoom).toBeGreaterThanOrEqual(1);
      expect(country.zoom).toBeLessThanOrEqual(20);
    });
  });

  test("should have unique country codes", () => {
    const codes = COUNTRIES.map((country) => country.code);
    const uniqueCodes = new Set(codes);
    expect(codes.length).toBe(uniqueCodes.size);
  });

  test("should have non-empty names and codes", () => {
    COUNTRIES.forEach((country) => {
      expect(country.name.trim()).not.toBe("");
      expect(country.code.trim()).not.toBe("");
    });
  });
});

describe("Country Validation", () => {
  test("should validate correct country object", () => {
    const validCountry: Country = {
      name: "Test Country",
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 10,
      code: "TC",
    };

    expect(validateCountry(validCountry)).toBe(true);
  });

  test("should reject invalid country objects", () => {
    // Missing properties
    expect(validateCountry({})).toBe(false);
    expect(validateCountry(null)).toBe(false);
    expect(validateCountry(undefined)).toBe(false);

    // Invalid name
    expect(
      validateCountry({
        name: "",
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 10,
        code: "TC",
      })
    ).toBe(false);

    // Invalid coordinates
    expect(
      validateCountry({
        name: "Test",
        center: { lat: 91, lng: -74.006 }, // Invalid latitude
        zoom: 10,
        code: "TC",
      })
    ).toBe(false);

    expect(
      validateCountry({
        name: "Test",
        center: { lat: 40.7128, lng: 181 }, // Invalid longitude
        zoom: 10,
        code: "TC",
      })
    ).toBe(false);

    // Invalid zoom
    expect(
      validateCountry({
        name: "Test",
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 0, // Invalid zoom
        code: "TC",
      })
    ).toBe(false);

    expect(
      validateCountry({
        name: "Test",
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 21, // Invalid zoom
        code: "TC",
      })
    ).toBe(false);
  });
});

describe("Dataset Validation", () => {
  test("should validate the entire countries dataset", () => {
    const validation = validateCountriesDataset();

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(validation.validCount).toBe(validation.totalCount);
    expect(validation.totalCount).toBeGreaterThan(0);
  });
});

describe("Country Selection", () => {
  test("should get country by code", () => {
    const usa = getCountryByCode("US");
    expect(usa).toBeDefined();
    expect(usa?.name).toBe("United States");
    expect(usa?.code).toBe("US");

    const nonExistent = getCountryByCode("XX");
    expect(nonExistent).toBeUndefined();
  });

  test("should get countries by region", () => {
    const europeanCountries = getCountriesByRegion("europe");
    expect(europeanCountries.length).toBeGreaterThan(0);
    expect(
      europeanCountries.every((country) =>
        [
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
        ].includes(country.code)
      )
    ).toBe(true);

    const asianCountries = getCountriesByRegion("asia");
    expect(asianCountries.length).toBeGreaterThan(0);

    const africanCountries = getCountriesByRegion("africa");
    expect(africanCountries.length).toBeGreaterThan(0);
  });

  test("should return random country", () => {
    const country1 = getRandomCountry();
    const country2 = getRandomCountry();

    expect(validateCountry(country1)).toBe(true);
    expect(validateCountry(country2)).toBe(true);
    expect(COUNTRIES).toContain(country1);
    expect(COUNTRIES).toContain(country2);
  });
});

describe("Country Selector with Anti-Repetition", () => {
  beforeEach(() => {
    countrySelector.reset();
  });

  test("should select random countries without immediate repetition", () => {
    const selectedCountries: Country[] = [];
    const maxSelections = Math.min(10, COUNTRIES.length);

    for (let i = 0; i < maxSelections; i++) {
      const country = getRandomCountryWithoutRepetition();
      expect(validateCountry(country)).toBe(true);
      selectedCountries.push(country);
    }

    // Check that we got valid countries
    expect(selectedCountries).toHaveLength(maxSelections);
    selectedCountries.forEach((country) => {
      expect(COUNTRIES).toContain(country);
    });
  });

  test("should avoid immediate repetition", () => {
    const country1 = countrySelector.selectRandomCountry();
    const country2 = countrySelector.selectRandomCountry();

    // With anti-repetition logic, these should be different
    // (unless we only have 1 country, which we don't)
    expect(country1.code).not.toBe(country2.code);
  });

  test("should reset recently selected list", () => {
    // Select a few countries
    countrySelector.selectRandomCountry();
    countrySelector.selectRandomCountry();

    expect(countrySelector.getRecentlySelected().length).toBeGreaterThan(0);

    countrySelector.reset();
    expect(countrySelector.getRecentlySelected()).toHaveLength(0);
  });

  test("should handle case when all countries are recently selected", () => {
    // This test simulates the edge case where all countries have been recently selected
    // The selector should clear the recent list and continue working

    // Import the CountrySelector class directly for testing
    // We'll create a new instance with a small recent size to test the edge case
    const CountrySelector = countrySelector.constructor as new (
      maxRecentSize?: number
    ) => typeof countrySelector;
    const testSelector = new CountrySelector(COUNTRIES.length);

    // Select all countries
    const selectedCodes = new Set<string>();
    for (let i = 0; i < COUNTRIES.length + 5; i++) {
      const country = testSelector.selectRandomCountry();
      selectedCodes.add(country.code);
      expect(validateCountry(country)).toBe(true);
    }

    // Should have selected from all available countries
    expect(selectedCodes.size).toBeGreaterThan(1);
  });
});

describe("Edge Cases", () => {
  test("should handle empty region requests", () => {
    // @ts-expect-error Testing invalid region
    const invalidRegion = getCountriesByRegion("invalid-region");
    expect(invalidRegion).toHaveLength(0);
  });

  test("should handle multiple rapid selections", () => {
    const countries: Country[] = [];

    // Rapidly select 20 countries
    for (let i = 0; i < 20; i++) {
      countries.push(getRandomCountryWithoutRepetition());
    }

    expect(countries).toHaveLength(20);
    countries.forEach((country) => {
      expect(validateCountry(country)).toBe(true);
    });
  });
});
