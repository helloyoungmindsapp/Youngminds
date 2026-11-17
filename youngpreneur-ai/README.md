# YoungPreneurAi landing page — `/youngpreneur-ai/`

Static page (HTML + CSS + vanilla JS, no build step), built the same way as `/startup-idea-session/`.
Nothing outside this folder is changed except one new entry in `/sitemap.xml`.

| File | What it is |
|---|---|
| `index.html` | 10 sections: hero, positioning, interactive 100-day journey, what students build, Student Voices, reviews, mentorship & parent access, two offers, FAQ, final CTA |
| `styles.css` | Same design system as `/startup-idea-session/` (Gabarito; blue `#3C52D6`, yellow `#FED700`, ink `#1a1a2e`, cream; ink borders + offset shadows). Buttons, header, FAQ, footer, consent and sticky CTA are copied from that page. |
| `config.js` | **Everything to configure**: booking links, refund wording, hero media, reviews, student work, GTM ID |
| `app.js` | Journey map, Student Voices carousel, hero video, booking links, sticky mobile CTA |
| `analytics.js` | Consent-first GTM loader (same as the ₹99 page) + `yp_*` dataLayer events |
| `assets/` | YoungMinds logo, hero poster (frame of the real session clip), mentor photo, favicon, 1200×630 share image |

The hero clip and the Student Voices videos are loaded from `/startup-idea-session/` (no copies). If those files move,
update the paths in `config.js`.

## Journey map

Desktop: an SVG road with four clickable stops (Tinkering 1–25, Innovation 26–75, Entrepreneurship 76–100,
Investor Pitch Day). The road fills up to the selected stop; one detail card shows below. Arrow keys move between stops.
Below 861 px it becomes a vertical road where each stop expands in place. Without JavaScript every stop's details are shown.

## Booking

| Offer | Where buttons go | Status |
|---|---|---|
| ₹99 Startup Idea Session (60 min, 1:1) | `https://youngminds-app.wise.live/book/strartup-seed-session` | **Live**. Same URL as the ₹99 page. The spelling `strartup` is correct: `/startup-seed-session` does not open the session page (checked 17 Nov 2026). |
| ₹999 Seven-Day Live Experience | WhatsApp chat with the official YoungMinds number (+91 94960 40431, the number on youngminds.app, the ₹99 page and the Wise.live booking page), opened in a new tab with an editable pre-filled enquiry (student name, age, parent/guardian name). No on-page form. | **Live**. Message text: `config.trial999.whatsappMessage`. |

Refund wording for ₹999 is **pending**, so the page does not mention a refund at all. Paste the confirmed terms
into `config.trial999.refundTerms` and they appear under the ₹999 button.

## Content rules followed

- No programme fee is shown anywhere. Ages are 11–18 everywhere. Phases total 25 + 50 + 25 = 100 days.
- Seed funding is always "up to ₹1 lakh", an opportunity, awarded on evaluation, not guaranteed.
- Mentorship wording: "A personalised mentor for every student." ("dedicated mentor" is not used).
- Trust numbers live inside existing sections, not a stats banner: 100 days (hero), 1:1 personalised mentorship
  (mentorship section), Google rating (next to the Student Voices heading). No other statistics are shown.

## Student Voices (carousel)

One slide = one student: their statement on the left, their own 9:16 video on the right. Content: `config.studentVoices`.
Each slide carries a visible type label (student idea showcase / YoungPreneurAi review / ₹99 session review) and an
optional status label, so an idea showcase is never presented as a programme testimonial.

| Slide | Video (source file) | Written content | Consent |
|---|---|---|---|
| Nehan · idea showcase | `assets/voices/nehan-idea.mp4` (from `Nehans_ idea .mp4`, re-encoded 540×960, 3.2 MB) | Quote and summary taken from the video's own Malayalam subtitles (translated, labelled "Translated from Malayalam"). Idea: a Duolingo-style app to help older people use technology; "early app, improvements in progress" (his words). | **To confirm** |
| Feva · idea showcase | `assets/voices/feva-idea.mp4` (from `Feva_idea.mp4`, re-encoded 540×960, 5.0 MB) | The video has no speech subtitles, so there is **no quote**: the headline is written by YoungMinds (no quote marks) from the programme background supplied (5 interviews, decision fatigue) and the video caption "Feva presenting her MVP to a real user". Labelled "work in progress". Kept as written by decision on 17 Nov 2026. | **To confirm** |

Grade/age is not shown for either student (not verified). Videos load only when tapped.

**Consent gate:** slides with `consentConfirmed: false` show only on local previews (with a badge). If no slide is
publishable, Student Voices is hidden on the live site and the Google rating moves to the reviews heading below.

**Google rating:** star rating only, "5.0 ★ Google Rating" (no review count), from the YoungMinds.app Business Profile
screenshot dated 17 Nov 2026 (`config.googleRating`). Re-check before every publish.

## Reviews ("Hear it from the students")

Restored unchanged from commit 225ac9a (markup, styles, script and the 7 genuine ₹99 session reviews in
`config.sessionReviews`): 3 videos + written reviews from Roshan, Labeeb, Sahal and Harikrishnan, all labelled "₹99 Session".
It sits directly below Student Voices.

## Outstanding content

1. Parent/guardian consent for Nehan's and Feva's slides (then set `consentConfirmed: true`).
2. Nehan's and Feva's grade/age, if they should be shown.
3. YoungPreneurAi programme reviews (`config.programmeReviews`), a genuine hero photo/clip and student work.
4. Confirmed ₹999 refund conditions (`config.trial999.refundTerms`). The refund is not mentioned until then.

## Analytics

`analytics.js` mirrors `/startup-idea-session/analytics.js`: Consent Mode defaults to denied, GTM `GTM-5N65PMRQ`
loads only after **Accept**, Decline loads nothing, and unknown URL parameters are stripped before GTM loads. The consent
choice is shared with the ₹99 page (same `localStorage` key, same origin).

Every event carries `page_name: "youngpreneur_ai"` and `page_path`.

| Event | When | Key parameters |
|---|---|---|
| `yp_page_view` | page load | — |
| `yp_hero_cta_click` | any hero button | `cta_name`, `offer_type`, `destination` |
| `yp_99_session_click` | every ₹99 button (→ Wise.live) | `offer_type=99_session`, `cta_location` (header / hero / offers / final / mobile_sticky), `destination` |
| `yp_999_trial_click` | every ₹999 button (→ WhatsApp) | `offer_type=999_seven_day_experience`, `cta_location` (offers / final), `destination` |
| `yp_whatsapp_click` | any WhatsApp link | `cta_location`, `offer_type` (999_seven_day_experience / general) |
| `yp_student_review_interaction` | Student Voices next / previous / dot / swipe; reviews slider next / previous / first scroll | `interaction`, `review_id`, `slide_index`, `content_type`, `section` |
| `yp_video_play` / `yp_video_complete` | Student Voices or reviews-slider video started / Student Voices video finished (once per video) | `video_id`, `content_type`, `video_location` |
| `yp_journey_phase_click` | journey stop opened | `phase_name`, `phase_index` |
| `yp_faq_open` | FAQ opened (once per question) | `faq_id` |
| `yp_scroll_depth` | 25 / 50 / 75 / 90 % | `scroll_percentage` |

A ₹999 click sends both `yp_999_trial_click` and `yp_whatsapp_click`. A WhatsApp click is not a conversation, and a
Wise.live click is not a booking.
A hero ₹99 click sends both `yp_hero_cta_click` and `yp_99_session_click`. Compare offers with
`yp_99_session_click` vs `yp_999_trial_click` only. A click is interest, not a booking or payment.

### Before any of this reaches GA4 (decisions for YoungMinds)

The live GTM container only fires on `^/startup-idea-session/?$`, so **today `yp_*` events stay in the dataLayer and
nothing is sent to GA4 from this page.** To switch it on:

1. **Privacy Policy first.** `/privacy-policy/` currently says analytics runs *only* on the Startup Idea Session page.
   Update it to cover `/youngpreneur-ai/` before step 2. The open DPDP under-18 review (due Feb 2027) applies here too.
2. In GTM (`GTM-5N65PMRQ`), create a new workspace and:
   - Change the Google tag's page-view trigger regex to `^/(startup-idea-session|youngpreneur-ai)/?$`.
   - Add Data Layer Variables: `page_name`, `cta_location`, `cta_name`, `offer_type`, `destination`,
     `phase_name`, `phase_index`, `interaction`, `review_id`, `slide_index`, `content_type`, `video_id`, `video_location`, `faq_id`, `scroll_percentage`.
   - Add one trigger: Custom Event, event name `^yp_.*` (regex), fires when Page Path matches `^/youngpreneur-ai/?$`.
   - Add one GA4 Event tag: event name `{{Event}}`, parameters = the variables above, firing on that trigger.
   - In GA4, register `offer_type`, `cta_location`, `phase_name`, `interaction`, `content_type`, `video_id` and `faq_id` as
     event-scoped custom dimensions.
   - Optionally mark `yp_99_session_click` and `yp_999_trial_click` as key events (label them "clicks", not bookings).
3. Test in **GTM Preview** with `?ym_debug=1` (console logs every event) and in **GA4 DebugView**, then publish.
   Keep Meta Pixel paused.

## Local preview

```bash
python -m http.server 5175 --directory D:/youngminds-website
```

Then open `http://localhost:5175/youngpreneur-ai/?ym_debug=1`.
