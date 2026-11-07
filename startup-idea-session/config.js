/* =====================================================================
   YoungMinds.app — ₹99 Startup Idea Session
   SINGLE PLACE TO EDIT CONTENT, IDs AND INTEGRATIONS.
   ===================================================================== */
window.YM_CONFIG = {
  /* Set to false before going live. When true, clearly labelled
     placeholders are shown where real content is still missing
     (testimonial screenshots, student reviews). When false, sections
     that only contain placeholders are hidden. */
  showIntegrationPlaceholders: false,

  /* Official Wise.live booking page. Every "Book" button links here
     (same tab). Booking and payment happen entirely on Wise.live.
     The same URL is also written directly in index.html so links
     work even without JavaScript — update both if it ever changes. */
  bookingUrl: "https://youngminds-app.wise.live/book/strartup-seed-session",

  /* Contact details taken from the main youngminds.app website. */
  contact: {
    whatsappNumber: "919496040431",   // used for wa.me links (country code, no +)
    whatsappMessage: "Hi YoungMinds! I have a question about the ₹99 Startup Idea Session.",
    email: "",                        // add official email when confirmed
  },

  /* The main site's legal links are currently placeholders ("#").
     Add the real URLs here; empty values hide the link. */
  legal: {
    privacyUrl: "",
    termsUrl: "",
    refundUrl: "",
  },

  /* ---------------- ANALYTICS ----------------
     Leave empty to disable. If gtmId is set, GA4 + Meta Pixel should be
     configured inside GTM and only dataLayer events are pushed from here.
     Nothing loads until the visitor accepts the consent banner.
     NOTE: a click on a booking button is tracked as a click only.
     Completed bookings/purchases must come from Wise.live data. */
  analytics: {
    gtmId: "",          // e.g. "GTM-XXXXXXX"
    ga4Id: "",          // e.g. "G-XXXXXXXXXX"
    metaPixelId: "",    // e.g. "123456789012345"
    requireConsent: true,
  },

  /* ---------------- HERO VIDEO ----------------
     Silent, auto-playing, looping clip of a real YoungMinds 1:1 session.
     No controls, no play button. Visitors with "reduce motion" switched on
     (and browsers that block autoplay) see the poster image instead.
     Until both files exist, the labelled photo placeholder stays visible.
       src     MP4 (H.264), ideally 6–15 s, under ~3 MB, no audio track needed
       poster  Still frame from the same video (WebP/JPG), shown while loading
       focus   CSS object-position, to keep student + mentor in frame when the
               video is cropped to the hero's portrait-ish (8:9) box,
               e.g. "50% 50%" (centre), "30% 50%" (keep the left side) */
  heroVideo: {
    src: "videos/startup-session.mp4",
    poster: "images/session-thumbnail.webp",
    alt: "A student and a YoungMinds mentor in a 1:1 online Startup Idea Session",
    focus: "50% 62%",   // keeps the student and laptop in view (subject sits in the lower half of the clip)
  },

  /* ---------------- VIDEO TESTIMONIALS ("Real Students. Real Experiences.") ----------------
     Video only. Add ONLY genuine student videos, used with permission.
     Leave the array empty to show 3 labelled placeholders (when placeholders are on).
       { src: "videos/testimonial-1.mp4",            // MP4 (H.264), ideally < 10 MB
         poster: "images/testimonials/video-1.webp", // thumbnail frame from the video
         name: "",                                   // student's first name, only with permission
         alt: "Student talking about their Startup Idea Session" }  */
  testimonials: [
    { src: "videos/testimonial-1.mp4", poster: "images/testimonial-1.webp", name: "", alt: "Student's voice-note feedback about the Startup Idea Session" },
    { src: "videos/testimonial-2.mp4", poster: "images/testimonial-2.webp", name: "", alt: "Student talking about their Startup Idea Session" },
    { src: "videos/testimonial-3.mp4", poster: "images/testimonial-3.webp", name: "", alt: "Student's voice-note feedback about the Startup Idea Session" },
  ],

  /* ---------------- AUTO-SCROLLING WRITTEN REVIEWS ----------------
     Genuine feedback from ₹99 session participants. Copy text exactly.
       name        Student's name (only with permission)
       description Label under the name
       text        The actual feedback, unedited (blank lines = new paragraph)
       source      Optional: "linkedin" shows a small LinkedIn label (no link)
       photo       Optional, only an authorised photo: "images/reviews/name.webp"
       rating      Optional, only a rating the student actually gave (1–5)
       Long reviews are previewed on the card with a "Read more" button. */
  reviews: [
    {
      name: "Roshan",
      description: "Startup Idea Session Participant",
      text: "I struggled for a week with my startup idea, but this one-hour session gave me clarity. It was really useful, and I'm excited for the next session!",
    },
    {
      name: "Sahal",
      description: "Startup Idea Session Participant",
      text: "It was a great experience! I learned how to turn small problems into solutions and think like a founder. Really insightful and inspiring.",
    },
    {
      name: "Harikrishnan",
      description: "Startup Idea Session Participant",
      text: "I had a few ideas, but I was stuck. After attending this session, I got more clarity and confidence to move forward!",
    },
    {
      name: "Muhammed Kareem",
      description: "LinkedIn Review",
      source: "linkedin",
      text:
        "An Inspiring Learning Experience with YOUNG MINDS APP!\n\n" +
        "The YOUNG MINDS APP session was a valuable experience that taught me how to transform unconventional (even illogical) ideas into creative innovations and meaningful initiatives.\n\n" +
        "It encouraged me to think beyond boundaries, develop an entrepreneurial mindset, and discover opportunities in unexpected places.\n\n" +
        "Excited to keep learning, innovating, and growing as a future entrepreneur!",
    },
  ],
  /* Speed of the review carousel in pixels per second. */
  reviewsSpeed: 32,

  /* Optional verified student example (Problem → Solution → Concept).
     Leave null unless YoungMinds provides a real, permitted example. */
  studentExample: null,
  // studentExample: { problem: "...", solution: "...", concept: "...", credit: "Shared with permission" },
};
