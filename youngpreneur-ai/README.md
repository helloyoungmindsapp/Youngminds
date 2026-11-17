# YoungPreneurAi landing page — `/youngpreneur-ai/`

Static page (HTML + CSS + vanilla JS, no build step), built the same way as `/startup-idea-session/`.
Nothing outside this folder is changed except one new entry in `/sitemap.xml`.

| File | What it is |
|---|---|
| `index.html` | 9 sections: hero, positioning, interactive 100-day journey, what students build, mentorship & parent access, reviews, two offers, FAQ, final CTA |
| `styles.css` | Same design system as `/startup-idea-session/` (Gabarito; blue `#3C52D6`, yellow `#FED700`, ink `#1a1a2e`, cream; ink borders + offset shadows). Buttons, header, FAQ, footer, consent and sticky CTA are copied from that page. |
| `config.js` | **Everything to configure**: booking links, refund wording, hero media, reviews, student work, GTM ID |
| `app.js` | Journey map, reviews slider, hero video, booking links, sticky mobile CTA |
| `analytics.js` | Consent-first GTM loader (same as the ₹99 page) + `yp_*` dataLayer events |
| `assets/` | YoungMinds logo, hero poster (frame of the real session clip), mentor photo, favicon, 1200×630 share image |

The hero clip and the review videos are loaded from `/startup-idea-session/` (no copies). If those files move,
update the paths in `config.js`.

## Journey map

Desktop: an SVG road with four clickable stops (Tinkering 1–25, Innovation 26–75, Entrepreneurship 76–100,
Investor Pitch Day). The road fills up to the selected stop; one detail card shows below. Arrow keys move between stops.
Below 861 px it becomes a vertical road where each stop expands in place. Without JavaScript every stop's details are shown.

## Booking

| Offer | Where buttons go | Status |
|---|---|---|
| ₹99 Startup Idea Session (60 min, 1:1) | `https://youngminds-app.wise.live/book/strartup-seed-session` | **Live**. Same URL as the ₹99 page. The spelling `strartup` is correct: `/startup-seed-session` does not open the session page (checked 17 Nov 2026). |
| ₹999 7-Day Live Experience | WhatsApp chat with a pre-filled message | **Integration placeholder**: no booking page exists yet. Put the real URL in `config.trial999.bookingUrl` and the ₹999 button switches to it. |

Refund wording for ₹999 is **pending**, so the page does not mention a refund at all. Paste the confirmed terms
into `config.trial999.refundTerms` and they appear under the ₹999 button.

## Content rules followed

- No programme fee is shown anywhere. Ages are 11–18 everywhere. Phases total 25 + 50 + 25 = 100 days.
- Seed funding is always "up to ₹1 lakh", an opportunity, awarded on evaluation, not guaranteed.
- Reviews: no YoungPreneurAi reviews exist yet, so the section shows genuine ₹99 Startup Idea Session reviews, each
  tagged "₹99 Session" and introduced as such. Add real programme reviews to `config.programmeReviews`; they appear
  first, tagged "YoungPreneurAi".
- Not used because unconfirmed: mentor credentials, Day 25/75/100 reviews, monthly reports, refund terms, brochure-only details.

## Outstanding content

1. A genuine YoungPreneurAi student photo/clip for the hero (`config.heroVideo`).
2. Real student work for "What students build" (`config.studentWork`).
3. YoungPreneurAi student and parent reviews (`config.programmeReviews`).
4. ₹999 booking URL and confirmed refund terms.

Set `showContentPlaceholders: true` on a preview to see labelled slots for items 2 and 3.

## Analytics

`analytics.js` mirrors `/startup-idea-session/analytics.js`: Consent Mode defaults to denied, GTM `GTM-5N65PMRQ`
loads only after **Accept**, Decline loads nothing, and unknown URL parameters are stripped before GTM loads. The consent
choice is shared with the ₹99 page (same `localStorage` key, same origin).

Every event carries `page_name: "youngpreneur_ai"` and `page_path`.

| Event | When | Key parameters |
|---|---|---|
| `yp_page_view` | page load | — |
| `yp_hero_cta_click` | any hero button | `cta_name`, `offer_type`, `destination` |
| `yp_99_session_click` | every ₹99 button | `offer_type=99_session`, `cta_location` (header / hero / offers / final / mobile_sticky), `destination` |
| `yp_999_trial_click` | every ₹999 button or link | `offer_type=999_seven_day_trial`, `cta_location`, `destination`, `booking_status` (pending_whatsapp / live / scroll_to_offers) |
| `yp_journey_phase_click` | journey stop opened | `phase_name`, `phase_index` |
| `yp_review_interaction` | video play, next, previous, first swipe | `interaction`, `review_id` |
| `yp_faq_open` | FAQ opened (once per question) | `faq_id` |
| `yp_scroll_depth` | 25 / 50 / 75 / 90 % | `scroll_percentage` |

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
     `booking_status`, `phase_name`, `phase_index`, `interaction`, `review_id`, `faq_id`, `scroll_percentage`.
   - Add one trigger: Custom Event, event name `^yp_.*` (regex), fires when Page Path matches `^/youngpreneur-ai/?$`.
   - Add one GA4 Event tag: event name `{{Event}}`, parameters = the variables above, firing on that trigger.
   - In GA4, register `offer_type`, `cta_location`, `phase_name`, `interaction`, `faq_id` and `booking_status` as
     event-scoped custom dimensions.
   - Optionally mark `yp_99_session_click` and `yp_999_trial_click` as key events (label them "clicks", not bookings).
3. Test in **GTM Preview** with `?ym_debug=1` (console logs every event) and in **GA4 DebugView**, then publish.
   Keep Meta Pixel paused.

## Local preview

```bash
python -m http.server 5175 --directory D:/youngminds-website
```

Then open `http://localhost:5175/youngpreneur-ai/?ym_debug=1`.
