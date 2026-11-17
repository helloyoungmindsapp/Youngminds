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
     yp_page_view             on load
     yp_hero_cta_click        any hero button  (cta_name, offer_type, destination)
     yp_99_session_click      every ₹99 button (offer_type=99_session, cta_location, destination)
     yp_999_trial_click       every ₹999 button (offer_type=999_seven_day_trial, cta_location,
                              destination, booking_status)
     yp_journey_phase_click   journey stop opened (phase_name, phase_index)
     yp_review_interaction    video play / next / previous / first swipe (interaction, review_id)
     yp_faq_open              FAQ opened, once per question (faq_id)
     yp_scroll_depth          25 / 50 / 75 / 90 %

   A hero ₹99 click sends BOTH yp_hero_cta_click and yp_99_session_click.
   Compare offers with yp_99_session_click vs yp_999_trial_click only.
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
    var offer = a.getAttribute("data-offer") || a.getAttribute("data-offer-scroll");
    var loc = a.getAttribute("data-cta") || "other";
    if (a.closest(".hero")) {
      track("yp_hero_cta_click", { cta_location: "hero", cta_name: a.getAttribute("data-offer") || a.getAttribute("data-hero") || "other", offer_type: offer || "none", destination: destOf(a) });
      if (a.getAttribute("data-hero") === "see_7_day") {
        track("yp_999_trial_click", { offer_type: "999_seven_day_trial", cta_location: "hero", destination: destOf(a), booking_status: "scroll_to_offers" });
      }
    }
    if (offer === "99_session") {
      track("yp_99_session_click", { offer_type: "99_session", cta_location: loc, destination: destOf(a) });
    } else if (offer === "999_seven_day_trial") {
      track("yp_999_trial_click", {
        offer_type: "999_seven_day_trial", cta_location: loc, destination: destOf(a),
        booking_status: a.getAttribute("data-offer-scroll") ? "scroll_to_offers" : (a.getAttribute("data-trial-status") || "pending_whatsapp"),
      });
    }
  }, true);

  // Journey stops (dispatched by app.js)
  var map = $("#jmap");
  if (map) map.addEventListener("yp:phase", function (e) {
    track("yp_journey_phase_click", { phase_name: e.detail.phase, phase_index: e.detail.index });
  });

  // Reviews (dispatched by app.js): video plays once per video; navigation once per direction
  var track_ = $("#slider-track"), seen = {};
  if (track_) track_.addEventListener("yp:review", function (e) {
    var d = e.detail || {}, key = d.interaction + ":" + (d.review_id || "");
    if (seen[key]) return; seen[key] = true;
    track("yp_review_interaction", { interaction: d.interaction, review_id: d.review_id || "" });
  });

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
