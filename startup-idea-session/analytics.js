/* =====================================================================
   YoungMinds.app — ₹99 Startup Idea Session · analytics (no dependencies)

   Pushes events to window.dataLayer. Google Tag Manager (loaded ONLY
   after the visitor accepts the consent banner) forwards them to GA4
   and Meta Pixel. With no GTM ID in config.js nothing is loaded at all.

   Privacy: no names, phone numbers, emails or form inputs are ever sent.
   A booking-button click is NOT a confirmed booking or payment.

   Debug: add ?ym_debug=1 to the URL to log every event in the console.
   ===================================================================== */
(function () {
  "use strict";
  var C = window.YM_CONFIG || {};
  var A = C.analytics || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var PAGE_PATH = (location.pathname.replace(/\/+$/, "") || "") + "/"; // normalised: /startup-idea-session/
  var DEBUG = !!A.debug || /[?&]ym_debug=1\b/.test(location.search);
  var GTM_ID = /^GTM-[A-Z0-9]+$/.test(A.gtmId || "") && A.gtmId !== "GTM-XXXXXXXX" ? A.gtmId : ""; // never load a placeholder
  var CONSENT_KEY = "ym_consent_v1";

  /* ---------- dataLayer + Consent Mode defaults (before anything loads) ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("consent", "default", {
    analytics_storage: "denied", ad_storage: "denied",
    ad_user_data: "denied", ad_personalization: "denied", // personalisation stays denied: audience includes minors
  });

  // Events wait here until the visitor answers the banner: on Accept they are sent
  // (after the consent update, so GTM may use them); on Decline they are discarded.
  var consentState = null, queue = [];
  function track(event, params) {
    var data = { event: event, page_path: PAGE_PATH };
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) data[k] = params[k];
    if (DEBUG && window.console) console.info("[ym-analytics]", event, data, consentState || "waiting for consent");
    if (!GTM_ID || consentState === "denied") return;          // nothing to send to / not allowed
    if (consentState !== "granted") { if (queue.length < 100) queue.push(data); return; }
    window.dataLayer.push(data);
  }
  window.ymTrack = track; // for manual testing only

  /* ---------- Consent + GTM loader ---------- */
  var gtmLoaded = false;

  // Keep personal details out of analytics: GA4 records the full page URL, so before any tag
  // loads, drop every query parameter that is not a known campaign / debug parameter
  // (e.g. a shared link like ?name=…&phone=… would otherwise be sent to Google).
  // The page itself reads no query parameters, so nothing visible changes.
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

  // Remove Google Analytics cookies when a visitor declines or withdraws consent.
  function clearAnalyticsCookies() {
    var parts = location.hostname.split("."), domains = [""];
    for (var i = 0; i < parts.length - 1; i++) domains.push("; domain=." + parts.slice(i).join("."));
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!/^(_ga|_ga_.+|_gid|_gat.*)$/.test(name)) return;
      domains.forEach(function (d) { document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d; });
    });
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
    // Analytics only. Advertising storage stays denied: no ad tags are active (Meta Pixel is
    // paused) and the audience includes minors. If ad tags are ever enabled, revisit this AND
    // the privacy policy + consent banner wording first.
    gtag("consent", "update", {
      analytics_storage: "granted", ad_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied",
    });
    consentState = "granted";
    setGaDisabled(false); // re-enable if the visitor withdrew and then accepted again
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
  // Google's documented opt-out switch (window["ga-disable-G-…"]). Needed when consent is
  // withdrawn after GTM has loaded: Consent Mode alone still lets GA4's automatic events
  // (e.g. outbound clicks) send cookieless pings.
  function setGaDisabled(off) {
    var tm = window.google_tag_manager || {};
    for (var id in tm) if (/^G-[A-Z0-9]+$/.test(id)) window["ga-disable-" + id] = off;
  }
  function getChoice() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }

  (function setupConsent() {
    var banner = $("#consent"), settings = $("#cookie-settings");
    if (!GTM_ID || !banner) return;           // no tracking configured → no banner, nothing loads
    if (settings) settings.hidden = false;    // "Cookie settings" in the footer lets visitors change their mind
    var choice = getChoice();
    if (A.requireConsent === false || choice === "granted") grant();
    else if (!choice) banner.hidden = false;
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

  // 1. Landing page view (GTM uses it for Meta "ViewContent"; GA4 counts page_view itself)
  track("landing_page_view", {});

  // 2. Section visibility — ≥50% of the section (or of the screen, for tall
  //    sections) visible for ~1 s. Each section fires once per page view.
  //    This means "reached", not "read".
  var SECTIONS = [
    { id: "hero",          name: "Hero",                         sel: "section.hero" },
    { id: "how_it_works",  name: "How It Works",                 sel: "#how" },
    { id: "benefits",      name: "What You'll Gain",             sel: "section.gain" },
    { id: "testimonials",  name: "Student Video Testimonials",   sel: "section.stories" },
    { id: "reviews",       name: "Written Student Reviews",      sel: "#reviews" },
    { id: "final_booking", name: "Final Booking Section",        sel: ".booking-panel" },
    { id: "faq",           name: "FAQ",                          sel: ".faq" },
  ];
  if ("IntersectionObserver" in window) {
    var thresholds = []; for (var t = 0; t <= 20; t++) thresholds.push(t / 20);
    var timers = new Map();
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var s = e.target._ymSection; if (!s || s.done) return;
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var base = Math.min(e.boundingClientRect.height, vh) || 1;
        var visible = e.isIntersecting && e.intersectionRect.height / base >= 0.5;
        if (visible && !timers.has(e.target)) {
          timers.set(e.target, setTimeout(function () {
            timers.delete(e.target);
            if (s.done) return;
            s.done = true;
            sectionIO.unobserve(e.target);
            track("section_view", { section_id: s.id, section_name: s.name, section_order: s.order });
          }, 1000));
        } else if (!visible && timers.has(e.target)) {
          clearTimeout(timers.get(e.target)); timers.delete(e.target);
        }
      });
    }, { threshold: thresholds });
    SECTIONS.forEach(function (s, i) {
      var el = $(s.sel);
      if (!el || el.hidden || el.closest("[hidden]")) return; // e.g. a section hidden because it has no content
      s.order = i + 1;
      el._ymSection = s;
      sectionIO.observe(el);
    });
  }

  // 3. Scroll depth 25 / 50 / 75 / 90 % — rAF-throttled, listener removed once all have fired
  (function scrollDepth() {
    var marks = [25, 50, 75, 90], next = 0, ticking = false;
    function check() {
      ticking = false;
      var doc = document.documentElement;
      var max = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 100;
      while (next < marks.length && pct >= marks[next]) {
        track("scroll_depth", { scroll_percentage: marks[next] });
        next++;
      }
      if (next >= marks.length) window.removeEventListener("scroll", onScroll);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  // 4. Booking CTA clicks → Wise.live (the link navigates normally; nothing is delayed)
  var CTA_LOCATION = { header: "header", hero: "hero", final: "final_booking", sticky: "mobile_sticky" };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-book]");
    if (!a) return;
    track("booking_cta_click", {
      cta_location: CTA_LOCATION[a.getAttribute("data-book")] || a.getAttribute("data-book") || "other",
      cta_text: a.textContent.replace(/→/g, "").replace(/\s+/g, " ").trim(),
      destination_url: a.href,
    });
  }, true);

  // 5. WhatsApp contact clicks (secondary action; no phone number is sent)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-whatsapp]");
    if (!a) return;
    var s = a.closest("section, footer, header");
    var raw = s ? (s.id || s.className.split(" ")[0]) : "other";
    var LOC = { hero: "hero", book: "final_booking", "site-footer": "footer", top: "header" }; // same names as cta_location
    track("contact_click", { contact_method: "whatsapp", contact_location: LOC[raw] || raw });
  }, true);

  // 6. Testimonial videos — first manual play, 50 %, complete (per video, per page view).
  //    The muted, looping hero video is never tracked.
  var testimonials = $("#testimonials");
  if (testimonials) {
    var vstate = new WeakMap();
    function videoInfo(v) {
      var cards = $$(".t-card", testimonials), card = v.closest(".t-card");
      return { video_id: "testimonial_" + (cards.indexOf(card) + 1), video_location: "testimonials_section" };
    }
    function st(v) { var s = vstate.get(v); if (!s) { s = {}; vstate.set(v, s); } return s; }
    testimonials.addEventListener("play", function (e) {
      var v = e.target; if (v.tagName !== "VIDEO") return;
      var s = st(v); if (s.play) return; s.play = true;
      track("testimonial_video_play", videoInfo(v));
    }, true);
    testimonials.addEventListener("timeupdate", function (e) {
      var v = e.target; if (v.tagName !== "VIDEO" || !v.duration) return;
      var s = st(v); if (s.half || v.currentTime / v.duration < 0.5) return; s.half = true;
      track("testimonial_video_50", videoInfo(v));
    }, true);
    testimonials.addEventListener("ended", function (e) {
      var v = e.target; if (v.tagName !== "VIDEO") return;
      var s = st(v); if (s.done) return; s.done = true;
      track("testimonial_video_complete", videoInfo(v));
    }, true);
  }

  // 7. FAQ opens — once per question per page view (closing and re-opening is not counted again)
  var FAQ_IDS = ["need_startup_idea", "suitable_for_beginners", "what_happens_during", "what_happens_after"];
  var faq = $(".faq"), faqSeen = {};
  if (faq) {
    faq.addEventListener("toggle", function (e) {
      var d = e.target; if (d.tagName !== "DETAILS" || !d.open) return;
      var i = $$("details", faq).indexOf(d), id = FAQ_IDS[i] || "faq_" + (i + 1);
      if (faqSeen[id]) return; faqSeen[id] = true;
      track("faq_open", { faq_id: id });
    }, true);
  }

  // 8. "Read more" on long written reviews — once per review per page view
  //    (carousel movement and hovers are not tracked)
  var reviewTrack = $("#reviews-track"), reviewSeen = {};
  if (reviewTrack) {
    reviewTrack.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-review]");
      if (!b) return;
      var id = "review_" + (Number(b.getAttribute("data-review")) + 1);
      if (reviewSeen[id]) return; reviewSeen[id] = true;
      track("review_read_more", { review_id: id });
    }, true);
  }
})();
