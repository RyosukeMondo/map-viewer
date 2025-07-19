/**
 * Tests for environment variable validation utility
 */

import {
  validateGoogleMapsApiKey,
  getEnvConfig,
  isGoogleMapsApiKeyConfigured,
} from "../env";

// Mock process.env
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("validateGoogleMapsApiKey", () => {
  it("should throw error when API key is missing", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    expect(() => validateGoogleMapsApiKey()).toThrow(
      "Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file."
    );
  });

  it("should throw error when API key is placeholder", () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY =
      "your-google-maps-api-key-here";

    expect(() => validateGoogleMapsApiKey()).toThrow(
      "Please replace the placeholder Google Maps API key with your actual API key in .env.local"
    );
  });

  it("should throw error when API key is too short", () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "short";

    expect(() => validateGoogleMapsApiKey()).toThrow(
      "Google Maps API key appears to be invalid. Please check your API key."
    );
  });

  it("should return valid API key", () => {
    const validKey = "AIzaSyBvOkBwgGlbUiuS-oKrPrFm9QzQQQQQQQQ";
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = validKey;

    expect(validateGoogleMapsApiKey()).toBe(validKey);
  });
});

describe("getEnvConfig", () => {
  it("should return config with valid API key", () => {
    const validKey = "AIzaSyBvOkBwgGlbUiuS-oKrPrFm9QzQQQQQQQQ";
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = validKey;

    const config = getEnvConfig();
    expect(config.googleMapsApiKey).toBe(validKey);
  });
});

describe("isGoogleMapsApiKeyConfigured", () => {
  it("should return false when API key is missing", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    expect(isGoogleMapsApiKeyConfigured()).toBe(false);
  });

  it("should return true when API key is valid", () => {
    const validKey = "AIzaSyBvOkBwgGlbUiuS-oKrPrFm9QzQQQQQQQQ";
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = validKey;

    expect(isGoogleMapsApiKeyConfigured()).toBe(true);
  });
});
