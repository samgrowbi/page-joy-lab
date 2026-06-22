---
name: Sofia Chatbot
description: Sofia AI chat config - active treatments, intake fields, booking form rules, model
type: feature
---
Sofia is the in-chat skin specialist (src/components/chat/SkinSpecialistChat.tsx + supabase/functions/skin-specialist-chat).

Model: `google/gemini-2.5-flash` (fast tier - do not switch back to GPT-5 unless asked).

ACTIVE treatments (only ones Sofia is allowed to recommend or book):
- `led` - "Non Surgical Face & Neck Lift Treatment" - apptType 92667128, calendar 14022057, $79.99 / $149.99, 60 min.
  Intake fields (Acuity field IDs): 18466832 concerns (checkboxes), 18466883 age range (radio), 18466903 promo cancellation policy (yesno), 18466907 SMS+email reminders (yesno).

Inactive (DO NOT add to Sofia's TREATMENTS map until appt type ID + calendar are confirmed live):
- /instant-lift, /led-cryo, /body-sculpting (placeholder template data from GLO+ V4).

Adding a new active treatment (checklist):
1. Confirm appointment type ID + calendar ID are real and bookable.
2. Call acuity-forms edge function with the appt type ID to fetch intake field IDs.
3. Add `intakeFields` to the treatment in `src/config/treatments.ts`.
4. Add the slug to `ACTIVE_TREATMENT_SLUGS` in `src/config/treatmentRegistry.ts`.
5. Add the treatment (with intakeFields mirror) to `TREATMENTS` in `supabase/functions/skin-specialist-chat/index.ts`.
6. Deploy the edge function.

Booking flow is form-based (not chat-text intake):
- Sofia never asks for name/email/phone/age/concerns/consent in chat text.
- After date+time picked: model calls `request_booking_form` -> client renders `<BookingFormCard>` from the treatment's `intakeFields`.
- Submit sends `[BOOKING_FORM_SUBMISSION] {json}` as next user message -> model calls `book_appointment` immediately.
- On success: green card + Meta Pixel `Schedule` event fires once per appointmentId (deduped via sessionStorage `pixel_schedule_sent_<id>`).
- `suggest_quick_replies` tool drives the chips above the composer.
