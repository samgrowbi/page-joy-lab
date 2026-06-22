import {
  LED_TREATMENT,
  LED_CRYO_TREATMENT,
  BODY_SCULPTING_TREATMENT,
  INSTANT_LIFT_TREATMENT,
  TreatmentConfig,
} from "./treatments";

const treatments: Record<string, TreatmentConfig> = {
  led: LED_TREATMENT,
  "instant-lift": INSTANT_LIFT_TREATMENT,
  "led-cryo": LED_CRYO_TREATMENT,
  "body-sculpting": BODY_SCULPTING_TREATMENT,
};

/**
 * Slugs that are LIVE for the public (real Acuity calendars wired up, real pricing).
 * Sofia must only recommend / book treatments in this list. Add a slug here once
 * the treatment's appointment type ID + calendar are confirmed working.
 */
export const ACTIVE_TREATMENT_SLUGS: readonly string[] = ["led"];

export function getTreatmentBySlug(slug: string | null): TreatmentConfig {
  return (slug && treatments[slug]) || LED_TREATMENT;
}

export function getActiveTreatments(): TreatmentConfig[] {
  return ACTIVE_TREATMENT_SLUGS.map((s) => treatments[s]).filter(Boolean);
}
