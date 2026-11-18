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

  /* ---------------- HERO: PROGRAMME EXPLAINER VIDEO ----------------
     ASSET REQUIRED. No programme explainer video exists yet, so the hero shows a
     labelled placeholder. When the video is ready (ideally 1–3 min, MP4 H.264,
     ≤ 20 MB, with a poster frame), fill these in and the player appears:
       src      e.g. "assets/explainer/youngpreneurai-explainer.mp4"
       poster   e.g. "assets/explainer/youngpreneurai-explainer.webp"
       title    caption under the video
       duration e.g. "2:10" (shown on the poster)
       ratio    "16 / 9" (default) or "9 / 16" / "4 / 5" for portrait cuts
       captions optional .vtt subtitles file                                    */
  explainerVideo: {
    src: "",
    poster: "",
    title: "How YoungPreneurAi works",
    duration: "",
    ratio: "16 / 9",
    captions: "",
  },

  /* ---------------- GOOGLE RATING ----------------
     YoungMinds.app Google Business Profile: 5.0 stars (screenshot dated
     17 Nov 2026). Only the star rating is shown — no review count.
     Re-check on Google before every publish; set show: false if it changes
     or cannot be checked.                                                 */
  googleRating: { show: true, rating: "5.0", checked: "2026-11-17" },

  /* ---------------- STUDENT VOICES (carousel: statement + video, one student per slide) ----------------
     Never mix students. Statements come only from what the student says in
     their own video (or verified programme records, marked verbatim: false).
       type: "idea_showcase"    — student explaining their own idea
             "programme_review" — student reviewing their YoungPreneurAi experience
             "session_review"   — student reviewing the ₹99 Startup Idea Session
       verbatim: true  = quote is the student's own words (shown with quote marks)
                 false = written by YoungMinds from verified programme records (no quote marks)
       translated: language the student spoke, if the quote is a translation
       status: shown as a small label, e.g. "Work in progress"
       consentConfirmed: true ONLY after written parent/guardian consent to publish
       this identifiable video with the student's name. Slides with false are
       hidden on the live site and shown on local previews (no notice on the page).     */
  studentVoices: [
    {
      type: "idea_showcase",
      name: "Nehan", grade: "", age: "",
      project: "A Duolingo-style app to help older people use technology",
      status: "Early app · improvements in progress",
      verbatim: true, translated: "Malayalam",
      // From the video's own subtitles (00:01–00:20), translated from Malayalam.
      quote: "The idea came from my grandparents. Older people don't know how to use technology.",
      support: "His goal: an app like Duolingo that helps them learn it. Fitting the work around school, he built it over a few days. It's now a small app that runs on a phone, and he says there are still many improvements to make.",
      photo: "assets/voices/nehan-photo.webp", // from nehan_photo.jpeg (matched to his video)
      video: "assets/voices/nehan-idea.mp4",
      poster: "assets/voices/nehan-idea.webp",
      videoLabel: "Nehan explaining his idea for a Duolingo-style technology app for older people (Malayalam with subtitles)",
      consentConfirmed: true, // parent/guardian consent confirmed by YoungMinds, 17 Nov 2026
    },
    {
      type: "idea_showcase",
      name: "Feva", grade: "", age: "",
      project: "AI styling assistant (concept in development)",
      status: "YoungPreneurAi student · work in progress",
      verbatim: false,
      // Not a quote: the video has no speech subtitles. Based on the programme
      // background supplied by YoungMinds and the video's caption
      // "Feva presenting her MVP to a real user." Kept as written (no quote
      // marks) by decision on 17 Nov 2026.
      quote: "She interviewed five people and found the real problem behind choosing clothes: decision fatigue.",
      support: "Feva is working through YoungPreneurAi: identifying a real-world problem, interviewing people and exploring solutions. In this video she presents her early AI styling assistant MVP to a real user for feedback.",
      photo: "assets/voices/feva-photo.webp", // from feva_photo.JPG (same room and outfit as her video)
      video: "assets/voices/feva-idea.mp4",
      poster: "assets/voices/feva-idea.webp",
      videoLabel: "Feva presenting her early AI styling assistant MVP to a user",
      consentConfirmed: true, // parent/guardian consent confirmed by YoungMinds, 17 Nov 2026
    },
  ],

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
    // LinkedIn review, copied unedited from /startup-idea-session/config.js
    { type: "text", name: "Muhammed Kareem", age: 17, role: "LinkedIn Review", source: "linkedin",
      text:
        "An Inspiring Learning Experience with YOUNG MINDS APP!\n\n" +
          "The YOUNG MINDS APP session was a valuable experience that taught me how to transform unconventional (even illogical) ideas into creative innovations and meaningful initiatives.\n\n" +
          "It encouraged me to think beyond boundaries, develop an entrepreneurial mindset, and discover opportunities in unexpected places.\n\n" +
          "Excited to keep learning, innovating, and growing as a future entrepreneur!" },
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
