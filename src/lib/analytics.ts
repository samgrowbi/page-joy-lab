// Lightweight event tracking helper. No-op after PostHog removal;
// kept so call sites continue to compile. Wire to a new provider if needed.

type Props = Record<string, unknown>;

export function track(_event: string, _props?: Props) {
  // no-op
}

export function identify(_distinctId: string, _props?: Props) {
  // no-op
}

// Canonical event names — keep in one place so dashboards match.
export const Events = {
  BookCtaClicked: "book_cta_clicked",
  BookingStepViewed: "booking_step_viewed",
  BookingDateSelected: "booking_date_selected",
  BookingTimeSelected: "booking_time_selected",
  BookingSubmitted: "booking_submitted",
  BookingCompleted: "booking_completed",
  BookingFailed: "booking_failed",
  ExitIntentShown: "exit_intent_shown",
  ExitIntentCtaClicked: "exit_intent_cta_clicked",
  StickyCtaClicked: "sticky_cta_clicked",
  PhoneClicked: "phone_clicked",
  EmailClicked: "email_clicked",
  FaqOpened: "faq_opened",
  GalleryImageViewed: "gallery_image_viewed",
} as const;
