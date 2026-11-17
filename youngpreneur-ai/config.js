/* =====================================================================
   YoungPreneurAi landing page — SINGLE PLACE TO EDIT LINKS, MEDIA, IDs
   AND CONTENT THAT IS STILL WAITING FOR CONFIRMATION.

   Rule: only switch something on once it is confirmed. Nothing here
   may describe a benefit, guarantee, refund term, credential or review
   that YoungMinds has not confirmed.
   ===================================================================== */
window.YP_CONFIG = {
  /* true = show clearly labelled "content needed" slots (for team review
     on a preview). Keep false on the live site.                         */
  showContentPlaceholders: false,

  /* ---------------- OFFER A: ₹99 Startup Idea Session ----------------
     Same Wise.live page as /startup-idea-session/. "strartup" is the real,
     working spelling (checked 17 Nov 2026); ".../startup-seed-session"
     does not open the session page. Also written in index.html so links
     work without JavaScript — change both if it ever changes.           */
  session99: {
    bookingUrl: "https://youngminds-app.wise.live/book/strartup-seed-session",
  },

  /* ---------------- OFFER B: ₹999 Seven-Day Live Experience ----------------
     Journey: WhatsApp chat with the official YoungMinds number (contact
     below — the same number used on youngminds.app, the ₹99 page and the
     Wise.live booking page). No form; the visitor edits and sends this
     pre-filled message.
     refundTerms — PENDING. The refund is NOT mentioned on the page until the
     confirmed conditions are pasted here, e.g. "Fully refundable if you
     cancel before Day 7." (EXAMPLE ONLY — DO NOT USE UNLESS CONFIRMED)     */
  trial999: {
    whatsappMessage:
      "Hi! I'm interested in the ₹999 YoungPreneurAi 7-Day Live Experience.\n\n" +
      "Student Name:\n" +
      "Student Age:\n" +
      "Parent/Guardian Name:\n\n" +
      "I'd like to know more about the experience and how to get started.",
    refundTerms: "",
  },

  contact: {
    whatsappNumber: "919496040431",
    whatsappMessage: "Hi YoungMinds! I have a question about YoungPreneurAi.",
  },

  /* ---------------- HERO MEDIA ----------------
     Today: the real 1:1 session clip used on /startup-idea-session/
     (muted, looping, no controls; reduced-motion visitors see the poster).
     Replace with a genuine YoungPreneurAi student clip/photo when one exists
     (a student building, testing or pitching — with parental permission). */
  heroVideo: {
    src: "/startup-idea-session/videos/startup-session.mp4",
    poster: "assets/hero-session.webp",
    alt: "A YoungMinds mentor's laptop during a live 1:1 online session with a student",
    focus: "45% 60%",
  },

  /* ---------------- GOOGLE RATING ----------------
     YoungMinds.app Google Business Profile, from a screenshot taken
     17 Nov 2026: 5.0 stars, 6 Google reviews. Re-check on Google and
     update `checked` before every publish; set show: false if it drops
     or cannot be checked. profileUrl: optional public Maps/Search link.  */
  googleRating: { show: true, rating: "5.0", count: 6, checked: "2026-11-17", profileUrl: "" },

  /* ---------------- STUDENT VOICES ----------------
     One slide = ONE student: their own written statement + their own video.
     Never mix students. Copy statements word for word.
       type: "programme_review" — reviewing their YoungPreneurAi experience
             "idea_showcase"    — explaining their own idea (NOT a programme review)
             "session_review"   — reviewing the ₹99 Startup Idea Session
       quote / support: the student's statement split into headline + rest
       project: idea or project name (only if the student gave one)
       consentConfirmed: true ONLY after written parent/guardian consent to
       publish this identifiable video with the student's name and age.
       Slides with false are hidden on the live site and shown on local
       previews with a "consent to confirm" badge.                          */
  studentVoices: [
    {
      type: "session_review",
      name: "Harikrishnan", age: 16, project: "",
      quote: "I had a few ideas, but I was stuck.",
      support: "After attending this session, I got more clarity and confidence to move forward!",
      video: "/startup-idea-session/videos/testimonial-2.mp4",
      poster: "/startup-idea-session/images/testimonial-2.webp",
      videoLabel: "Harikrishnan talking about his ₹99 Startup Idea Session",
      consentConfirmed: false,
    },
    {
      type: "session_review",
      name: "Roshan", age: 17, project: "",
      quote: "I struggled for a week with my startup idea, but this one-hour session gave me clarity.",
      support: "It was really useful, and I'm excited for the next session!",
      video: "/startup-idea-session/videos/testimonial-3.mp4",
      poster: "/startup-idea-session/images/testimonial-3.webp",
      videoLabel: "Roshan's voice-note feedback on his ₹99 Startup Idea Session",
      consentConfirmed: false,
    },
  ],

  /* Real student work for "What students build" (photos of prototypes, MVPs,
     pitch decks) — with permission. EMPTY = section shows outcomes only.
       { image: "assets/work/name.webp", alt: "What it shows", caption: "Short factual label" } */
  studentWork: [],

  /* ---------------- ANALYTICS ----------------
     Same GTM container as /startup-idea-session/. Nothing loads until the
     visitor accepts. GTM + the Privacy Policy must be updated before yp_*
     events reach GA4 — see README.md → "Analytics".                       */
  analytics: {
    gtmId: "GTM-5N65PMRQ",
    requireConsent: true, // keep true: the audience is 11–18
    debug: false,         // or add ?ym_debug=1 to the URL
  },
};
