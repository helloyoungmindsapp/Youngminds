/* =====================================================================
   YoungPreneurAi landing page — SINGLE PLACE TO EDIT LINKS, IDs AND
   CONTENT THAT IS STILL WAITING FOR CONFIRMATION.

   Rule for this file: only switch something on once it is confirmed.
   Nothing here should ever describe a benefit, guarantee, schedule,
   credential or refund term that has not been confirmed by YoungMinds.
   ===================================================================== */
window.YP_CONFIG = {
  /* true = show clearly labelled "asset needed" boxes where real photos /
     student work are still missing (useful in review). false = hide them.  */
  showAssetPlaceholders: false,

  /* ---------------- OFFER A: ₹99 Startup Idea Session ----------------
     Same Wise.live booking page the /startup-idea-session/ page uses.
     NOTE: the spelling "strartup" is the real, working Wise.live URL
     (checked 17 Nov 2026). ".../startup-seed-session" does not open the
     session page. The URL is also written in index.html so links work
     without JavaScript; change both if it ever changes.              */
  session99: {
    bookingUrl: "https://youngminds-app.wise.live/book/strartup-seed-session",
  },

  /* ---------------- OFFER B: ₹999 7-Day Live Experience ----------------
     bookingUrl: PENDING. No booking/payment page exists yet. While it is
     empty, the ₹999 buttons open a WhatsApp chat (a real enquiry, not a
     booking) and say so on the button.
     refundTerms: PENDING. The fee is refundable, but the conditions
     (who qualifies, how, how long) are not confirmed. While empty, the
     page says the fee is refundable and asks visitors to confirm the
     terms with the team before paying. Paste the confirmed wording here,
     e.g. "Full refund if you request it before Day 7 ends." (EXAMPLE —
     DO NOT USE UNLESS CONFIRMED).                                       */
  trial999: {
    bookingUrl: "",
    refundTerms: "",
    whatsappMessage: "Hi YoungMinds! I'd like to start the ₹999 7-day YoungPreneurAi live experience. Could you share the next start date and the refund terms?",
  },

  contact: {
    whatsappNumber: "919496040431", // from youngminds.app (country code, no +)
    whatsappMessage: "Hi YoungMinds! I have a question about YoungPreneurAi.",
  },

  /* ---------------- MENTOR CREDENTIAL ----------------
     Shown in the Trust section ONLY when verified is true. The brochure
     and homepage mention "AIM NITI Aayog Certified Regional Mentor of
     Change"; this could not be confirmed from a public AIM source on
     17 Nov 2026. Set verified: true once you hold the certificate /
     official listing (and keep a copy on file).                         */
  mentorCredential: {
    verified: false,
    text: "Programme designed by Mubassir MK, co-founder of YoungMinds.app and AIM, NITI Aayog Certified Regional Mentor of Change.",
  },

  /* ---------------- PARENT MILESTONE REVIEWS ----------------
     Day 25 / Day 75 / Day 100 reviews with student, parent and mentor,
     as described in the YoungPreneurAi Parent Orientation document
     (Nov 2026). Set to false if these are not a firm commitment.        */
  showMilestoneReviews: true,

  /* ---------------- REAL STUDENT JOURNEYS ----------------
     ONLY genuine student work, used with written permission (parent's
     permission for under-18s). Leave empty to hide the gallery; the
     section then shows its honest "first cohort" note instead.
       { stage: "idea" | "experiment" | "product" | "customer" | "pitch",
         image: "assets/journeys/name-1.webp",   // 4:3, ≤ 150 KB
         alt: "What the photo actually shows",
         caption: "One line in the student's words or a factual label",
         credit: "First name, age" }                                       */
  journeys: [],

  /* Genuine parent testimonials for YoungPreneurAi only (with permission).
     { quote: "...", name: "Parent of ...", detail: "City" }               */
  parentTestimonials: [],

  /* ---------------- ANALYTICS ----------------
     Same GTM container as /startup-idea-session/. Nothing loads until the
     visitor accepts the consent banner. The GTM container must be updated
     before yp_* events reach GA4 — see youngpreneur-ai/README.md → "Analytics".  */
  analytics: {
    gtmId: "GTM-5N65PMRQ",
    requireConsent: true, // keep true: the audience is 11–18
    debug: false,         // or add ?ym_debug=1 to the URL
  },
};
