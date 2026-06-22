import treatmentImage from "@/assets/treatment-facial.webp";
import bodyConsultationImg from "@/assets/body-consultation.webp";
import bodyPreparationImg from "@/assets/body-preparation.webp";
import bodySessionImg from "@/assets/body-session.webp";
import bodyPostTreatmentImg from "@/assets/body-post-treatment.webp";

export interface BeforeAfterResult {
  id: number;
  /** For split before/after cards */
  before?: string;
  after?: string;
  /** For composite images that already contain before+after */
  composite?: string;
  label: string;
}

export interface TreatmentConfig {
  /** URL slug, e.g. "led" or "led-cryo" */
  slug: string;
  /** Display label used in hero, technology, booking header */
  label: string;
  /** Hero heading lines (supports JSX-safe plain strings) */
  heroTitle: {
    line1: string;
    highlight: string;
    line2: string;
  };
  /** Hero subtitle */
  heroSubtitle: string;
  /** Hero video URL */
  heroVideoUrl: string;
  /** Pricing */
  price: string;
  originalPrice: string;
  /** Acuity IDs */
  appointmentTypeId: string;
  calendarId: string;
  /** Duration in minutes (display only - Acuity controls actual duration) */
  duration: number;
  /** Treatment image */
  image: string;
  /** Technology section copy */
  technologyDescription: string[];
  /** Technology section title override */
  technologyTitle?: { main: string; highlight: string };
  /** Technology highlights */
  technologyHighlights: { text: string; title?: string; description?: string }[];
  /** Whether to hide the device image in technology section */
  hideDeviceImage?: boolean;
  /** FAQ entries */
  faqs: { question: string; answer: string }[];
  /** Before/after results - if provided, overrides the default facial results */
  beforeAfterResults?: BeforeAfterResult[];
  /** Video testimonials - if provided, overrides the default feedback videos */
  feedbackTestimonials?: { id: number; name: string; video: string; poster?: string; text: string }[];
  /** Visit steps - if provided, overrides default steps */
  visitSteps?: { title: string; description: string; image?: string }[];
  /** Client text reviews - if provided, overrides default facial reviews */
  clientReviews?: { id: number; name: string; image: string; timeAgo: string; rating: number; review: string }[];
  /** About section video URL override */
  aboutVideoUrl?: string;
  /** Whether to hide the Expert Opinion section */
  hideExpertOpinion?: boolean;
  /** Problem/Solution section overrides */
  problemSolution?: {
    hook?: { line1: string; line2: string };
    hookNote?: string;
    signs: string[];
    outcomeTitle: string;
    outcomeHighlight: string;
    outcomeDescription: string;
    badgeText: string;
    emotionalClose?: { text: string; highlight: string };
  };
}

export const LED_TREATMENT: TreatmentConfig = {
  slug: "led",
  label: "Non Surgical Face & Neck Lift Treatment",
  heroTitle: {
    line1: "Non Surgical",
    highlight: "Face & Neck Lift",
    line2: "Treatment",
  },
  heroSubtitle:
    "No Surgery. No Pain. Zero Downtime.",
  heroVideoUrl:
    "https://pub-eb17aaa123fc4145b1ee4c15fc2e5771.r2.dev/Med%20Spa/Hero%20Video/LED%20Hero%20Video.mp4",
  price: "79.99",
  originalPrice: "149.99",
  appointmentTypeId: "92667128",
  calendarId: "14022057",
  duration: 60,
  image: treatmentImage,
  technologyDescription: [
    "Our Non Surgical Face & Neck Lift Treatment delivers specific wavelengths of light energy into the skin's deeper layers, activating the body's own natural healing process of collagen production and cellular repair. The facial is entirely non-invasive, without heat, injectables, or foreign substances.",
  ],
  technologyHighlights: [
    { text: "Clinically tested" },
    { text: "Safe for all skin types and tones" },
  ],
  hideDeviceImage: true,
  faqs: [
    {
      question: "Who is this treatment for?",
      answer:
        "The treatment is suitable for anyone over 35 experiencing visible signs of skin aging, such as fine lines, loss of firmness, uneven skin tone, or a tired-looking complexion. Compared to surgical treatments and injectables, our Non Surgical Face & Neck Lift Treatment is safer, more affordable, requires no downtime, and delivers completely natural-looking results.",
    },
    {
      question: "How does it work?",
      answer:
        "Our Non Surgical Face & Neck Lift Treatment uses specific wavelengths of light energy to penetrate deep into the skin's layers, activating collagen production and cellular repair. The result is visibly smoother skin, restored firmness, and improved tone and texture.",
    },
    {
      question: "Is it painful?",
      answer:
        "Not at all. The treatment is designed to be comfortable and relaxing, with most clients describing it as a calming, soothing experience.",
    },
    {
      question: "Is it safe?",
      answer:
        "Yes. Our certified devices are clinically tested, non-invasive, and safe for all skin types and tones. There are no foreign substances entering your body and no risk of burns or damage. If you have a specific medical condition or take photosensitive medication, let us know before your visit, and our esthetician will advise you.",
    },
    {
      question: "Can I combine this with other treatments?",
      answer:
        "Yes. Our Non Surgical Face & Neck Lift Treatment is compatible with a range of other aesthetic services. Your esthetician will be happy to discuss what works best alongside this session during your first visit.",
    },
    {
      question: "When will I see results?",
      answer:
        "Most clients notice brighter, refreshed skin immediately after their first session. Results continue to develop over the following days as your skin responds. With a course of sessions, improvements become increasingly visible and longer lasting.",
    },
    {
      question: "How long do results last?",
      answer:
        "Results vary by skin, age, and lifestyle. A single session delivers immediate radiance and visible improvement. For results that last and continue to build, a course of treatments is recommended. Your esthetician will advise on the best plan for your skin at your first visit.",
    },
    {
      question: "What happens after the treatment?",
      answer:
        "You can return to your normal routine immediately, including makeup, work, and exercise. There is no downtime and no redness to manage. Your esthetician will provide simple aftercare guidance at the end of your visit to help maintain and build on your results.",
    },
  ],
};

export const LED_CRYO_TREATMENT: TreatmentConfig = {
  slug: "led-cryo",
  label: "LED + Cryo Face & Neck Lift Treatment",
  heroTitle: {
    line1: "LED + Cryo",
    highlight: "Face & Neck Lift",
    line2: "Treatment",
  },
  heroSubtitle:
    "Experience the revolutionary lifting technology that rejuvenates your skin instantly without any downtime.",
  heroVideoUrl:
    "https://pub-eb17aaa123fc4145b1ee4c15fc2e5771.r2.dev/Med%20Spa/Hero%20Video/LED%20Hero%20Video.mp4",
  price: "89.99",
  originalPrice: "349.99",
  appointmentTypeId: "91765523",
  calendarId: "11004724",
  duration: 75,
  image: treatmentImage,
  technologyDescription: [
    "Our LED + Cryo Face & Neck Lift treatment delivers specific wavelengths of light energy into the skin's deeper layers, activating the body's own natural healing process of collagen production and cellular repair. The facial is entirely non-invasive, without heat, injectables, or foreign substances.",
  ],
  technologyHighlights: [
    { text: "Clinically tested" },
    { text: "Safe for all skin types and tones" },
  ],
  hideDeviceImage: true,
  faqs: [
    {
      question: "How does the Face & Neck Lift + Cryo Treatment work?",
      answer:
        "The treatment combines LED light therapy with cryotherapy to stimulate collagen production, tighten skin, and reduce inflammation. The LED penetrates deep into the dermis while cryo helps depuff and firm the skin for immediate visible results.",
    },
    {
      question: "Is the treatment painful?",
      answer:
        "Not at all. The treatment is designed to be comfortable and relaxing, with most clients describing it as a warm, soothing experience followed by a refreshing cool sensation from the cryo component.",
    },
    {
      question: "How long do the results last?",
      answer:
        "Results are cumulative and improve with each session. Many clients see immediate improvements that continue to develop over the following days. A series of treatments is recommended for optimal, long-lasting results.",
    },
    {
      question: "Is there any downtime?",
      answer:
        "No downtime at all. You can return to your normal routine immediately after the session. Many clients schedule treatments during lunch breaks.",
    },
    {
      question: "How soon will I see results?",
      answer:
        "Many clients notice an immediate refreshed, lifted look right after the first session, with continued improvement as the skin responds over time.",
    },
  ],
};

export const BODY_SCULPTING_TREATMENT: TreatmentConfig = {
  slug: "body-sculpting",
  label: "Body Sculpting Fat Reduction Treatment",
  heroTitle: {
    line1: "Body Sculpting",
    highlight: "Fat Reduction",
    line2: "Treatment",
  },
  heroSubtitle:
    "Experience the revolutionary body sculpting technology that tones muscles and reduces fat instantly without any downtime.",
  heroVideoUrl:
    "https://pub-eb17aaa123fc4145b1ee4c15fc2e5771.r2.dev/Med%20Spa/Hero%20Video/ems%20Hero.mp4",
  price: "79.99",
  originalPrice: "399.99",
  appointmentTypeId: "71100482",
  calendarId: "11004724",
  duration: 75,
  image: treatmentImage,
  technologyDescription: [
    "Get ready to feel confident and radiant with Body Sculpting. Imagine a natural, non-surgical treatment that tones your muscles, melts away stubborn fat, and smooths out cellulite.",
    "And suddenly, what you see in the mirror doesn't match how you feel inside.",
    "This treatment is designed to change that.",
    "This non-invasive treatment awakens your body's natural transformation potential, delivering visible, lasting results without any downtime.",
  ],
  technologyTitle: { main: "Advanced Body Sculpting for", highlight: "Visible Results" },
  hideDeviceImage: true,
  technologyHighlights: [
    { text: "Say goodbye to cellulite with smoother, dimple-free skin", title: "Say Goodbye to Cellulite", description: "Enjoy smoother, dimple-free skin that you'll love to show off." },
    { text: "Feel leaner and stronger with toned muscles and less stubborn fat", title: "Feel Leaner and Stronger", description: "Watch as your body firms up naturally, with toned muscles and less stubborn fat." },
    { text: "Experience long-lasting firmness with a sculpted, contoured look", title: "Experience Long-Lasting Firmness", description: "Revel in a more sculpted, contoured look with skin that feels tight and smooth." },
  ],
  faqs: [
    {
      question: "How soon can I expect to see results?",
      answer:
        "Many clients notice visible improvements after their first session, with continued enhancement over time. A series of treatments is recommended for optimal, long-lasting results.",
    },
    {
      question: "Is the treatment painful?",
      answer:
        "Not at all. The treatment is designed to be comfortable and relaxing. Most clients describe it as a warm, soothing experience with gentle muscle contractions.",
    },
    {
      question: "Is there any downtime?",
      answer:
        "No downtime at all. You can return to your normal routine immediately after the session. Many clients schedule treatments during lunch breaks.",
    },
    {
      question: "How long is the treatment?",
      answer:
        "Each session takes approximately 75 minutes. We recommend arriving a few minutes early for your first visit.",
    },
    {
      question: "How should I prepare for my treatment?",
      answer:
        "No special preparation is needed. Simply wear comfortable clothing and stay hydrated. Avoid heavy meals right before your appointment.",
    },
  ],
  beforeAfterResults: [
    { id: 1, composite: "https://cdn.prod.website-files.com/675c3e115f240194d06e370c/681a05d900b60e1b475557b9_BA1.jpeg", label: "Body Contouring" },
    { id: 2, composite: "https://cdn.prod.website-files.com/675c3e115f240194d06e370c/681a05e7c400512d0c4317f6_BA2.jpeg", label: "Fat Reduction" },
    { id: 3, composite: "https://cdn.prod.website-files.com/675c3e115f240194d06e370c/681a0606853ecaa0e283d832_BA3.jpeg", label: "Cellulite Treatment" },
    { id: 4, composite: "https://cdn.prod.website-files.com/675c3e115f240194d06e370c/681a0616e6fa1365e1af68ab_BA4.jpeg", label: "Muscle Toning" },
    { id: 5, composite: "https://cdn.prod.website-files.com/675c3e115f240194d06e370c/681a062594fb46324cd230ca_BA5.jpeg", label: "Skin Tightening" },
    { id: 6, composite: "https://cdn.prod.website-files.com/675c3e115f240194d06e370c/681a0638054f50fa0260bf63_BA6.jpeg", label: "Body Sculpting" },
    { id: 7, composite: "https://cdn.prod.website-files.com/675c3e115f240194d06e370c/681a0654a660916951396e18_BA7.png", label: "Abdomen Contouring" },
    { id: 8, composite: "https://cdn.prod.website-files.com/675c3e115f240194d06e370c/681a06666983359c983c5dd3_BA8.png", label: "Full Body Transformation" },
  ],
  feedbackTestimonials: [
    { id: 1, name: "Michelle", video: "https://customer-vgdtdepv6dn1f10z.cloudflarestream.com/db126ce70e683df185bbd4ed52b68d87/manifest/video.m3u8", poster: "https://customer-vgdtdepv6dn1f10z.cloudflarestream.com/db126ce70e683df185bbd4ed52b68d87/thumbnails/thumbnail.jpg?time=1s&height=800", text: "Amazing body sculpting results!" },
    { id: 2, name: "Dana", video: "https://customer-vgdtdepv6dn1f10z.cloudflarestream.com/6331eeccec7b453719621b2395312236/manifest/video.m3u8", poster: "https://customer-vgdtdepv6dn1f10z.cloudflarestream.com/6331eeccec7b453719621b2395312236/thumbnails/thumbnail.jpg?time=1s&height=800", text: "I can really see the difference in my body." },
    { id: 3, name: "Laura", video: "https://customer-vgdtdepv6dn1f10z.cloudflarestream.com/60b57bf111ef1c1b7f50602a634c95e1/manifest/video.m3u8", poster: "https://customer-vgdtdepv6dn1f10z.cloudflarestream.com/60b57bf111ef1c1b7f50602a634c95e1/thumbnails/thumbnail.jpg?time=1s&height=800", text: "The treatment really works. I feel so confident!" },
    { id: 4, name: "Jessica", video: "https://customer-vgdtdepv6dn1f10z.cloudflarestream.com/6fd2f2b340bb5059130b8161ecc19e56/manifest/video.m3u8", poster: "https://customer-vgdtdepv6dn1f10z.cloudflarestream.com/6fd2f2b340bb5059130b8161ecc19e56/thumbnails/thumbnail.jpg?time=1s&height=800", text: "Incredible transformation. Highly recommend!" },
  ],
  visitSteps: [
    { title: "Consultation & Body Assessment", description: "A personalized assessment to understand your body goals, target areas, and create your custom sculpting plan.", image: bodyConsultationImg },
    { title: "Body Preparation", description: "The target area is prepped and positioning is optimized to ensure maximum effectiveness during your session.", image: bodyPreparationImg },
    { title: "Body Sculpting Session", description: "Advanced non-invasive technology works to tone muscles, reduce fat, and contour your body with zero downtime.", image: bodySessionImg },
    { title: "Post-Treatment Guidance", description: "You'll receive aftercare tips and hydration guidance to support optimal fat reduction and muscle toning results.", image: bodyPostTreatmentImg },
  ],
  aboutVideoUrl: "https://pub-eb17aaa123fc4145b1ee4c15fc2e5771.r2.dev/Med%20Spa/Body/lumiere%20new.mp4",
  clientReviews: [
    { id: 1, name: "Jessica Taylor", image: "https://randomuser.me/api/portraits/women/45.jpg", timeAgo: "JUN 19, 2026", rating: 5, review: "I couldn't believe how much my abdomen changed after just a few sessions. My clothes fit so much better now!" },
    { id: 2, name: "Monica Rivera", image: "https://randomuser.me/api/portraits/women/50.jpg", timeAgo: "MAY 27, 2026", rating: 5, review: "Finally got rid of the stubborn belly fat that wouldn't budge no matter how much I worked out. This treatment is a game changer." },
    { id: 3, name: "Tanya Brooks", image: "https://randomuser.me/api/portraits/women/54.jpg", timeAgo: "JUN 5, 2026", rating: 5, review: "The cellulite on my thighs has reduced so much. I feel confident wearing shorts again for the first time in years." },
    { id: 4, name: "Lauren Kim", image: "https://randomuser.me/api/portraits/women/38.jpg", timeAgo: "JUN 14, 2026", rating: 5, review: "I was skeptical about non-surgical body sculpting but the results speak for themselves. My waist is noticeably more contoured." },
    { id: 5, name: "Angela Martinez", image: "https://randomuser.me/api/portraits/women/72.jpg", timeAgo: "MAY 31, 2026", rating: 5, review: "Love the muscle toning effect! My arms and abs feel firmer than they have in years. Zero downtime too." },
    { id: 6, name: "Christine Davis", image: "https://randomuser.me/api/portraits/women/29.jpg", timeAgo: "JUN 9, 2026", rating: 5, review: "The staff made me feel so comfortable. The treatment was relaxing and the results have been incredible on my midsection." },
    { id: 7, name: "Natalie Wong", image: "https://randomuser.me/api/portraits/women/82.jpg", timeAgo: "JUN 2, 2026", rating: 5, review: "After having kids, I thought I'd never get my body back. This treatment has been life-changing for my confidence!" },
    { id: 8, name: "Brianna Foster", image: "https://randomuser.me/api/portraits/women/61.jpg", timeAgo: "JUN 17, 2026", rating: 5, review: "I've done three sessions and can already see a huge difference in my love handles. So worth it!" },
  ],
  hideExpertOpinion: true,
  problemSolution: {
    signs: [
      "Stubborn fat that won't budge despite diet & exercise",
      "Cellulite making you self-conscious",
      "Loss of muscle tone and definition",
      "Clothes not fitting the way they used to",
      "Feeling uncomfortable in swimwear or fitted clothing",
      "Wanting a more sculpted, contoured body shape",
    ],
    outcomeTitle: "Feel confident in your body again",
    outcomeHighlight: "sculpted, toned, and naturally contoured",
    outcomeDescription: "Designed to reduce stubborn fat, tone muscles, and smooth cellulite, giving you visible results",
    badgeText: "Ideal for women 35+ wanting to sculpt and tone without surgery",
    hook: { line1: "If you've ever looked in the mirror", line2: "and thought… \"I used to feel so confident\"" },
    hookNote: "Your body is ready for a change.",
    emotionalClose: { text: "This isn't just about your body. It's about", highlight: "feeling confident again." },
  },
};

// Placeholder Instant Lift treatment for /instant-lift route.
// NOTE: This is a dummy/placeholder page - Pearl Med Spa does not yet offer
// Instant Lift. Acuity IDs and pricing reference the GLO+ V4 template and
// must be updated before this page is used in production.
export const INSTANT_LIFT_TREATMENT: TreatmentConfig = {
  ...LED_TREATMENT,
  slug: "instant-lift",
  label: "Instant Lift & Skin Tightening Facial",
  heroTitle: {
    line1: "Instant Lift",
    highlight: "& Skin Tightening",
    line2: "Facial",
  },
  heroSubtitle: "No Surgery. No Pain. Zero Downtime.",
  appointmentTypeId: "90990594",
  calendarId: "13836448",
  price: "69.99",
  originalPrice: "249.99",
  duration: 60,
};
