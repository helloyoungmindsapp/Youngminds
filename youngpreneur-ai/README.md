# YoungPreneurAi landing page — `/youngpreneur-ai/`

Static page (HTML + CSS + vanilla JS, no build step), built the same way as `/startup-idea-session/`.
Nothing outside this folder is changed except one new line in `/sitemap.xml`.

| File | What it is |
|---|---|
| `index.html` | All copy, 13 sections, SEO / Open Graph / JSON-LD |
| `styles.css` | Brand tokens at the top (`--green #02A673`, `--green-dark #064B38`, `--yellow #FED700`, `--green-light #EAF7F0`, `--ink #103C30`) |
| `config.js` | **Everything to configure**: booking links, refund wording, credential / review switches, student work, GTM ID |
| `app.js` | Mobile menu, booking links from config, reveal animation, phase bar, sticky mobile CTA |
| `analytics.js` | Consent-first GTM loader (same as the ₹99 page) + `yp_*` dataLayer events |
| `assets/` | Official logo (`youngpreneurai-logo.svg`, cropped from *Brand Fonts.svg*, not redrawn), real mentor-session photo, favicon, 1200×630 share image |

Typography: the logo SVG is outlined (no font name inside). Headings use **Gabarito** (closest match to the
wordmark and already used on the ₹99 page); body text uses **Inter** (the brochure's typeface).

## Booking

| Offer | Where buttons go | Status |
|---|---|---|
| ₹99 Startup Idea Session (60 min, 1:1) | `https://youngminds-app.wise.live/book/strartup-seed-session` | **Live**. Same URL as the ₹99 page. The spelling `strartup` is correct: `/startup-seed-session` does not open the session page (checked 17 Nov 2026). |
| ₹999 7-Day Live Experience | WhatsApp chat with a pre-filled message | **Pending**: no booking page exists yet. Put the real URL in `config.trial999.bookingUrl` and every ₹999 button switches to it. |

Refund wording for ₹999 is **pending**. The page says the fee is refundable and asks visitors to confirm the
conditions before paying. Paste the confirmed terms into `config.trial999.refundTerms` and they replace that
sentence everywhere (offer card and FAQ).

## Content rules followed

- No programme fee is shown anywhere.
- Ages are 11–18 everywhere. Phases total 25 + 50 + 25 = 100 days (Days 1–25, 26–75, 76–100).
- Seed funding is always "up to ₹1,00,000", "an opportunity", "awarded based on evaluation", and "not guaranteed".
- Not used because they are unconfirmed or older brochure details: "4 mini-businesses", Days 30/70, "100% refundable",
  "10+ real users", "Startup Kit", "monthly report", "AI-assisted progress tracking", parent testimonials, AI-generated images.
- Mentor credential (AIM NITI Aayog Regional Mentor of Change) is **off** (`mentorCredential.verified: false`): it
  could not be confirmed from a public AIM source. Switch on only once verified.
- Day 25 / 75 / 100 reviews come from the Parent Orientation document (Nov 2026). `showMilestoneReviews: false`
  removes every mention if they are not a firm commitment.

## Outstanding assets

1. Real student photos / work for "Real student journeys" (`config.journeys`) with parent permission.
   Until then the section shows the five stages and an honest note.
2. A real hero photo of a student building or pitching (optional; the hero currently uses a designed "founder's board").
3. Genuine YoungPreneurAi parent testimonials (`config.parentTestimonials`, not rendered yet).
4. ₹999 booking URL and confirmed refund terms.

## Analytics

`analytics.js` mirrors `/startup-idea-session/analytics.js`: Consent Mode defaults to denied, GTM `GTM-5N65PMRQ`
loads only after **Accept**, Decline loads nothing, and unknown URL parameters are stripped before GTM loads. The consent
choice is shared with the ₹99 page (same `localStorage` key, same origin).

Every event carries `page_name: "youngpreneur_ai"` and `page_path`.

| Event | When | Key parameters |
|---|---|---|
| `yp_page_view` | page load | — |
| `yp_hero_cta_click` | any hero button | `cta_location=hero`, `cta_name`, `offer_type`, `destination` |
| `yp_99_session_click` | every ₹99 button | `offer_type=99_session`, `cta_location` (header / hero / experiences / final / mobile_sticky), `destination` |
| `yp_999_trial_click` | every ₹999 button | `offer_type=999_seven_day_trial`, `cta_location`, `destination`, `booking_status` (pending_whatsapp / live / scroll_to_offers) |
| `yp_curriculum_view` | 100-day map ≥50% visible for 1 s | `section_name` |
| `yp_phase_interaction` | phase-bar click, or each phase card seen | `phase_name`, `interaction` |
| `yp_outcome_view` / `yp_mentor_section_view` | section seen | `section_name` |
| `yp_section_view` | any other section seen | `section_name` |
| `yp_faq_open` | FAQ opened (once per question) | `faq_id` |
| `yp_scroll_depth` | 25 / 50 / 75 / 90 % | `scroll_percentage` |
| `yp_whatsapp_click` | general WhatsApp links | `cta_location` |

A hero ₹99 click sends both `yp_hero_cta_click` and `yp_99_session_click`. Compare offers with
`yp_99_session_click` vs `yp_999_trial_click` only. A click is interest, not a booking or payment.

### Before any of this reaches GA4 (decisions for YoungMinds)

The live GTM container only fires on `^/startup-idea-session/?$`, so **today `yp_*` events stay in the dataLayer and
nothing is sent to GA4 from this page.** To switch it on:

1. **Privacy Policy first.** `/privacy-policy/` currently says analytics runs *only* on the Startup Idea Session page.
   Update it to cover `/youngpreneur-ai/` before step 2. The open DPDP under-18 review (due Feb 2027) applies here too.
2. In GTM (`GTM-5N65PMRQ`), create a new workspace and:
   - Change the Google tag's page-view trigger regex to `^/(startup-idea-session|youngpreneur-ai)/?$`.
   - Add Data Layer Variables: `page_name`, `section_name`, `cta_location`, `cta_name`, `offer_type`, `destination`,
     `booking_status`, `phase_name`, `interaction`, `faq_id`, `scroll_percentage`.
   - Add one trigger: Custom Event, event name `^yp_.*` (regex), fires when Page Path matches `^/youngpreneur-ai/?$`.
   - Add one GA4 Event tag: event name `{{Event}}`, parameters = the variables above, firing on that trigger.
   - In GA4, register `offer_type`, `cta_location`, `phase_name`, `faq_id`, `section_name` and `booking_status` as
     event-scoped custom dimensions.
   - Optionally mark `yp_99_session_click` and `yp_999_trial_click` as key events (label them "clicks", not bookings).
3. Test in **GTM Preview** with `?ym_debug=1` (console logs every event) and in **GA4 DebugView**, then publish.
   Keep Meta Pixel paused.

## Local preview

```bash
python -m http.server 5175 --directory D:/youngminds-website
```

Then open `http://localhost:5175/youngpreneur-ai/?ym_debug=1`.
