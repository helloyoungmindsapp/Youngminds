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

  /* ---------------- OFFER B: ₹999 7-Day Live Experience ----------------
     bookingUrl  — INTEGRATION PENDING. No booking page exists yet. While
                   empty, the ₹999 buttons open a WhatsApp enquiry and say so.
     refundTerms — PENDING. The refund is NOT mentioned on the page until
                   the confirmed conditions are pasted here, e.g.
                   "Refundable in full if you ask before Day 7 ends."
                   (EXAMPLE ONLY — DO NOT USE UNLESS CONFIRMED)            */
  trial999: {
    bookingUrl: "",
    refundTerms: "",
    whatsappMessage: "Hi YoungMinds! I'd like to start the ₹999 7-day YoungPreneurAi live experience. When does the next one start?",
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

  /* ---------------- REVIEWS ----------------
     programmeReviews: genuine YoungPreneurAi STUDENT or PARENT reviews
     (permission required; parent's permission for under-18s). Shown first,
     labelled "YoungPreneurAi". EMPTY = none collected yet.
       { type: "text", name: "", age: 15, role: "YoungPreneurAi student" | "Parent of a YoungPreneurAi student", text: "" }
       { type: "video", src: "...mp4", poster: "...webp", name: "", role: "...", alt: "..." }

     sessionReviews: genuine reviews from the ₹99 Startup Idea Session
     (copied unedited from /startup-idea-session/config.js). Always labelled
     as ₹99 session experiences — never as programme outcomes.            */
  programmeReviews: [],

  sessionReviews: [
    { type: "video", src: "/startup-idea-session/videos/testimonial-2.mp4", poster: "/startup-idea-session/images/testimonial-2.webp", alt: "Student talking about their Startup Idea Session" },
    { type: "text", name: "Roshan", age: 17, text: "I struggled for a week with my startup idea, but this one-hour session gave me clarity. It was really useful, and I'm excited for the next session!" },
    { type: "text", name: "Labeeb", age: 16, text: "I never thought a simple problem I see every day could become a startup idea. It was something I had never really paid attention to before. This session helped me look at ordinary problems differently and discover an idea I could actually work on." },
    { type: "video", src: "/startup-idea-session/videos/testimonial-1.mp4", poster: "/startup-idea-session/images/testimonial-1.webp", alt: "Student's voice-note feedback about the Startup Idea Session" },
    { type: "text", name: "Sahal", age: 16, text: "It was a great experience! I learned how to turn small problems into solutions and think like a founder. Really insightful and inspiring." },
    { type: "text", name: "Harikrishnan", age: 16, text: "I had a few ideas, but I was stuck. After attending this session, I got more clarity and confidence to move forward!" },
    { type: "video", src: "/startup-idea-session/videos/testimonial-3.mp4", poster: "/startup-idea-session/images/testimonial-3.webp", alt: "Student's voice-note feedback about the Startup Idea Session" },
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
