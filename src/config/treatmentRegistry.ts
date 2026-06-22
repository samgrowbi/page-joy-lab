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

export function getTreatmentBySlug(slug: string | null): TreatmentConfig {
  return (slug && treatments[slug]) || INSTANT_LIFT_TREATMENT;
}
