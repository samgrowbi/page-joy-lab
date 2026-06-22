// Centralized configuration for the Acuity integration.
// Keep IDs as strings to match how they are passed through query params / JSON.

import treatmentImage from "@/assets/treatment-facial.webp";

export const DEFAULT_ACUITY_APPOINTMENT_TYPE_ID = "93509464";
export const DEFAULT_ACUITY_CALENDAR_ID = "14112013";
export const DEFAULT_ACUITY_TIMEZONE = "America/Los_Angeles";

// Local treatment image for use with dynamic API data
export const TREATMENT_IMAGE = treatmentImage;

// Promotional price override (API returns full price)
export const PROMOTIONAL_PRICE = "79.99";

// Fallback details if API fails
export const TREATMENT_DETAILS_FALLBACK = {
  id: 93509464,
  name: "Treatment",
  description: "",
  duration: 60,
  price: PROMOTIONAL_PRICE,
  category: "Treatment",
  color: "#8B5CF6",
  image: treatmentImage,
};
