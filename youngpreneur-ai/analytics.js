/* =====================================================================
   YoungPreneurAi landing page — analytics (no dependencies)

   Same architecture as /startup-idea-session/analytics.js:
   - Consent Mode defaults to denied; GTM (GTM-5N65PMRQ) loads ONLY after
     the visitor clicks Accept. Decline loads nothing.
   - The consent choice is shared with /startup-idea-session/ (same
     localStorage key, same origin), so visitors are asked once.
   - Events wait in a queue until the visitor answers the banner.
   - No names, phone numbers, emails or form data are ever sent.
   - A booking-button click is interest, NOT a booking or payment.

   Events (all carry page_name + page_path):
     yp_page_view                   on load
     yp_hero_cta_click              any hero button (cta_name, offer_type, destination)
     yp_99_session_click            ₹99 button → Wise.live (offer_type=99_session, cta_location, destination)
     yp_999_trial_click             ₹999 button → WhatsApp (offer_type=999_seven_day_experience, cta_location, destination)
     yp_whatsapp_click              any WhatsApp link opened (cta_location, offer_type: 999_seven_day_experience | general)
     yp_student_review_interaction  Student Voices next / previous / dot / swipe, or reviews-slider next / previous / scroll
                                    (interaction, review_id, slide_index, content_type, section)
     yp_video_play                  first play of a Student Voices or reviews-slider video (video_id, content_type, video_location)
     yp_video_complete              video watched to the end (video_id, content_type)
     yp_journey_phase_click         journey stop clicked/selected manually (phase_name, phase_index)
     yp_journey_phase_view          journey reached a phase while on screen, once per phase (phase_name, phase_index, journey_mode)
     yp_section_view                section ≥50% visible for 1 s, once per section (section_id, section_name, section_order)
     yp_video_50                    a video passed 50 %, once per video (video_id, content_type, video_location)
     yp_faq_open                    FAQ opened, once per question (faq_id)
     yp_scroll_depth                25 / 50 / 75 / 90 %

   A hero ₹99 click sends BOTH yp_hero_cta_click and yp_99_session_click.
   A ₹999 click sends BOTH yp_999_trial_click and yp_whatsapp_click.
   Compare offers with yp_99_session_click vs yp_999_trial_click only.
   Clicks are interest only: a Wise.live booking or a WhatsApp conversation is
   NOT confirmed by these events.
   Debug: add ?ym_debug=1 to the URL to log every event in the console.
   ===================================================================== */
(function () {
  "use strict";
  var C = window.YP_CONFIG || {};
  var A = C.analytics || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var PAGE_NAME = "youngpreneur_ai";
  var PAGE_PATH = (location.pathname.replace(/\/+$/, "") || "") + "/";
  var DEBUG = !!A.debug || /[?&]ym_debug=1\b/.test(location.search);
  var GTM_ID = /^GTM-[A-Z0-9]+$/.test(A.gtmId || "") && A.gtmId !== "GTM-XXXXXXXX" ? A.gtmId : "";
  var CONSENT_KEY = "ym_consent_v1"; // shared with /startup-idea-session/

  /* ---------- dataLayer + Consent Mode defaults ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("consent", "default", {
    analytics_storage: "denied", ad_storage: "denied",
    ad_user_data: "denied", ad_personalization: "denied",
  });

  var consentState = null, queue = [];
  function track(event, params) {
    var data = { event: event, page_name: PAGE_NAME, page_path: PAGE_PATH };
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) data[k] = params[k];
    if (DEBUG && window.console) console.info("[yp-analytics]", event, data, consentState || "waiting for consent");
    if (!GTM_ID || consentState === "denied") return;
    if (consentState !== "granted") { if (queue.length < 100) queue.push(data); return; }
    window.dataLayer.push(data);
  }
  window.ypTrack = track; // manual testing only

  /* ---------- Consent + GTM loader (mirrors /startup-idea-session/) ---------- */
  var gtmLoaded = false;
  var KEEP_PARAMS = /^(utm_(source|medium|campaign|term|content|id)|gclid|gbraid|wbraid|fbclid|_gl|gtm_debug|ym_debug)$/;
  function cleanUrl() {
    if (!location.search || !window.history || !history.replaceState || !window.URLSearchParams) return;
    try {
      var p = new URLSearchParams(location.search), keep = new URLSearchParams(), dropped = false;
      p.forEach(function (v, k) { if (KEEP_PARAMS.test(k)) keep.append(k, v); else dropped = true; });
      if (!dropped) return;
      var qs = keep.toString();
      history.replaceState(history.state, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    } catch (e) {}
  }
  function clearAnalyticsCookies() {
    var parts = location.hostname.split("."), domains = [""];
    for (var i = 0; i < parts.length - 1; i++) domains.push("; domain=." + parts.slice(i).join("."));
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!/^(_ga|_ga_.+|_gid|_gat.*)$/.test(name)) return;
      domains.forEach(function (d) { document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d; });
    });
  }
  function setGaDisabled(off) {
    var tm = window.google_tag_manager || {};
    for (var id in tm) if (/^G-[A-Z0-9]+$/.test(id)) window["ga-disable-" + id] = off;
  }
  function loadGTM() {
    if (gtmLoaded || !GTM_ID) return;
    gtmLoaded = true;
    cleanUrl();
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID);
    document.head.appendChild(s);
  }
  function grant() {
    gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    consentState = "granted";
    setGaDisabled(false);
    loadGTM();
    var q = queue; queue = [];
    q.forEach(function (d) { window.dataLayer.push(d); });
  }
  function deny() {
    consentState = "denied"; queue = [];
    gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    if (typeof window.fbq === "function") window.fbq("consent", "revoke");
    setGaDisabled(true);
    clearAnalyticsCookies();
  }
  function getChoice() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }

  (function setupConsent() {
    var banner = $("#consent"), settings = $("#cookie-settings");
    if (!GTM_ID || !banner) return;
    if (settings) settings.hidden = false;
    var choice = getChoice();
    if (A.requireConsent === false || choice === "granted") grant();
    else if (choice === "denied") deny();
    else banner.hidden = false;
    $$("[data-consent]", banner).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-consent") === "grant" ? "granted" : "denied";
        setChoice(v);
        banner.hidden = true;
        if (v === "granted") grant(); else deny();
      });
    });
    if (settings) settings.addEventListener("click", function () { banner.hidden = false; });
  })();

  /* =====================================================================
     EVENTS
     ===================================================================== */
  track("yp_page_view", {});

  function destOf(a) {
    try {
      var u = new URL(a.href, location.href);
      if (u.origin === location.origin) return u.pathname + u.hash;
      return u.origin + u.pathname; // drops ?text=… on WhatsApp links
    } catch (e) { return ""; }
  }

  // CTA clicks (capture phase, so the link still navigates normally)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a"); if (!a) return;
    var offer = a.getAttribute("data-offer");
    var loc = a.getAttribute("data-cta") || "other";
    var isWa = /^https:\/\/wa\.me\//.test(a.href);
    if (a.closest(".hero")) {
      track("yp_hero_cta_click", { cta_location: "hero", cta_name: offer || a.getAttribute("data-hero") || "other", offer_type: offer || "none", destination: destOf(a) });
    }
    if (offer === "99_session") {
      track("yp_99_session_click", { offer_type: "99_session", cta_location: loc, destination: destOf(a) });
    } else if (offer === "999_seven_day_experience") {
      track("yp_999_trial_click", { offer_type: "999_seven_day_experience", cta_location: loc, destination: destOf(a) });
    }
    if (isWa) {
      track("yp_whatsapp_click", {
        cta_location: offer ? loc : (a.getAttribute("data-wa") || "other"),
        offer_type: offer === "999_seven_day_experience" ? "999_seven_day_experience" : "general",
        destination: "https://wa.me/",
      });
    }
  }, true);

  // Journey stops (dispatched by app.js)
  var map = $("#jmap");
  if (map) map.addEventListener("yp:phase", function (e) {
    track("yp_journey_phase_click", { phase_name: e.detail.phase, phase_index: e.detail.index });
  });

  // Student Voices (dispatched by app.js)
  var voices = $("#voices"), videoSeen = {};
  if (voices) {
    voices.addEventListener("yp:voice", function (e) {
      var d = e.detail || {};
      track("yp_student_review_interaction", { interaction: d.interaction, review_id: d.review_id, slide_index: d.slide_index, content_type: d.content_type });
    });
    voices.addEventListener("yp:video", function (e) {
      var d = e.detail || {}, key = d.kind + ":" + d.video_id;
      if (videoSeen[key]) return; videoSeen[key] = true; // once per video per page view
      track(d.kind === "complete" ? "yp_video_complete" : "yp_video_play", { video_id: d.video_id, content_type: d.content_type, video_location: "student_voices" });
    });
  }

  // Restored "Hear it from the students" slider (dispatched by app.js)
  var slider = $("#slider-track"), sliderSeen = {};
  if (slider) slider.addEventListener("yp:review", function (e) {
    var d = e.detail || {}, key = d.interaction + ":" + (d.review_id || "");
    if (sliderSeen[key]) return; sliderSeen[key] = true;
    if (d.interaction === "video_play") track("yp_video_play", { video_id: d.review_id || "", content_type: "session_review", video_location: "reviews_slider" });
    else track("yp_student_review_interaction", { interaction: d.interaction, review_id: d.review_id || "", content_type: "session_review", section: "reviews_slider" });
  });

  // Hero explainer video (dispatched by app.js) — same events as Student Voices videos
  var hv = $("#hero-video"), hvSeen = {};
  if (hv) hv.addEventListener("yp:video", function (e) {
    var d = e.detail || {}; if (hvSeen[d.kind]) return; hvSeen[d.kind] = true;
    track(d.kind === "complete" ? "yp_video_complete" : "yp_video_play", { video_id: d.video_id, content_type: d.content_type, video_location: "hero" });
  });

  // Journey phase views (dispatched by app.js when the journey reaches a phase on screen) — once per phase
  var phaseSeen = {};
  if (map) map.addEventListener("yp:phaseview", function (e) {
    var d = e.detail || {}; if (phaseSeen[d.phase]) return; phaseSeen[d.phase] = true;
    track("yp_journey_phase_view", { phase_name: d.phase, phase_index: d.index, journey_mode: d.mode });
  });

  // Video 50 % — any video on the page that carries data-video-id (Student Voices, hero explainer)
  // or sits in the reviews slider. Once per video per page view.
  var halfSeen = {};
  document.addEventListener("timeupdate", function (e) {
    var v = e.target; if (!v || v.tagName !== "VIDEO" || !v.duration || v.currentTime / v.duration < 0.5) return;
    var card = v.closest("[data-review-id]");
    var id = v.getAttribute("data-video-id") || (card && card.getAttribute("data-review-id")) || "";
    var loc = v.getAttribute("data-video-location") || (card ? "reviews_slider" : "other");
    if (!id || halfSeen[loc + ":" + id]) return; halfSeen[loc + ":" + id] = true;
    track("yp_video_50", { video_id: id, content_type: v.getAttribute("data-content-type") || (card ? "session_review" : ""), video_location: loc });
  }, true);

  // Section visibility — same rule as /startup-idea-session/: ≥50% of the section (or of the
  // screen, for tall sections) visible for ~1 s; each section once per page view. "Reached", not "read".
  var SECTIONS = [
    { id: "hero",            name: "Hero",                       sel: "section.hero" },
    { id: "brand_statement", name: "Brand Statement",            sel: "section.statement" },
    { id: "positioning",     name: "Positioning",                sel: "section.position" },
    { id: "journey",         name: "100-Day Journey",            sel: "#journey" },
    { id: "outcomes",        name: "What Students Build",        sel: "section.build" },
    { id: "student_voices",  name: "Student Voices",             sel: "#voices" },
    { id: "reviews",         name: "Student Reviews",            sel: "#reviews" },
    { id: "mentorship",      name: "Mentorship & Parent Access", sel: "section.guide" },
    { id: "experiences",     name: "Experience Options",         sel: "#experiences" },
    { id: "faq",             name: "FAQ",                        sel: "#faq" },
    { id: "final_cta",       name: "Final CTA",                  sel: "section.final" },
  ];
  if ("IntersectionObserver" in window) {
    var thresholds = []; for (var ti = 0; ti <= 20; ti++) thresholds.push(ti / 20);
    var secTimers = new Map();
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var sx = en.target._ypSection; if (!sx || sx.done) return;
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var base = Math.min(en.boundingClientRect.height, vh) || 1;
        var visible = en.isIntersecting && en.intersectionRect.height / base >= 0.5;
        if (visible && !secTimers.has(en.target)) {
          secTimers.set(en.target, setTimeout(function () {
            secTimers.delete(en.target);
            if (sx.done) return; sx.done = true; sectionIO.unobserve(en.target);
            track("yp_section_view", { section_id: sx.id, section_name: sx.name, section_order: sx.order });
          }, 1000));
        } else if (!visible && secTimers.has(en.target)) { clearTimeout(secTimers.get(en.target)); secTimers.delete(en.target); }
      });
    }, { threshold: thresholds });
    // Observe once app.js has finished (Student Voices is unhidden by app.js); hidden sections are skipped.
    setTimeout(function () {
      SECTIONS.forEach(function (sx, i) {
        var el = $(sx.sel);
        if (!el || el.hidden || el.closest("[hidden]")) return;
        sx.order = i + 1; el._ypSection = sx; sectionIO.observe(el);
      });
    }, 0);
  }

  // FAQ opens — once per question per page view
  var faqSeen = {};
  document.addEventListener("toggle", function (e) {
    var d = e.target; if (!d || d.tagName !== "DETAILS" || !d.open || !d.hasAttribute("data-faq")) return;
    var id = d.getAttribute("data-faq"); if (faqSeen[id]) return; faqSeen[id] = true;
    track("yp_faq_open", { faq_id: id });
  }, true);

  // Scroll depth
  (function () {
    var marks = [25, 50, 75, 90], next = 0, ticking = false;
    function check() {
      ticking = false;
      var doc = document.documentElement;
      var max = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 100;
      while (next < marks.length && pct >= marks[next]) { track("yp_scroll_depth", { scroll_percentage: marks[next] }); next++; }
      if (next >= marks.length) window.removeEventListener("scroll", onScroll);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
    window.addEventListener("scroll", onScroll, { passive: true });
  })();
})();
