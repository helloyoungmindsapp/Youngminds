/* =====================================================================
   YoungPreneurAi landing page — behaviour (no dependencies)
   Everything here is progressive enhancement: the page reads and every
   link works without JavaScript. Analytics lives in analytics.js.
   ===================================================================== */
(function () {
  "use strict";
  var C = window.YP_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function waLink(message) {
    var n = (C.contact && C.contact.whatsappNumber) || "919496040431";
    return "https://wa.me/" + n + (message ? "?text=" + encodeURIComponent(message) : "");
  }

  /* ---------- Booking destinations from config ---------- */
  var s99 = C.session99 && C.session99.bookingUrl;
  if (s99) $$('a[data-offer="99_session"]').forEach(function (a) { a.href = s99; });

  var t = C.trial999 || {};
  var trialLive = /^https:\/\//.test(t.bookingUrl || "");
  $$("a[data-trial-link]").forEach(function (a) {
    if (trialLive) {
      a.href = t.bookingUrl; a.removeAttribute("target"); a.removeAttribute("rel");
      a.setAttribute("data-trial-status", "live");
    } else {
      a.href = waLink(t.whatsappMessage); a.target = "_blank"; a.rel = "noopener";
      a.setAttribute("data-trial-status", "pending_whatsapp");
    }
  });
  $$("[data-trial-note]").forEach(function (p) {
    if (trialLive) p.textContent = "Booked on our official booking page.";
  });
  if (t.refundTerms) $$("[data-refund-text]").forEach(function (el) { el.textContent = t.refundTerms; });

  /* General WhatsApp links get the prefilled question */
  $$("a[data-wa]").forEach(function (a) { a.href = waLink(C.contact && C.contact.whatsappMessage); });

  /* ---------- Confirmed-only content switches ---------- */
  if (C.showMilestoneReviews === false) $$("[data-milestone]").forEach(function (el) { el.remove(); });

  var cred = C.mentorCredential, credEl = $("#credential");
  if (cred && cred.verified === true && cred.text && credEl) { credEl.textContent = cred.text; credEl.hidden = false; }

  /* ---------- Real student journeys (genuine, permitted work only) ---------- */
  (function journeys() {
    var g = $("#gallery"); if (!g) return;
    var items = (C.journeys || []).filter(function (j) { return j && j.image && j.alt; });
    var LABEL = { idea: "Idea", experiment: "Experiment", product: "Product", customer: "Customer", pitch: "Pitch" };
    if (items.length) {
      items.forEach(function (j) {
        var f = document.createElement("figure");
        var img = document.createElement("img");
        img.src = j.image; img.alt = j.alt; img.loading = "lazy"; img.decoding = "async"; img.width = 800; img.height = 600;
        var cap = document.createElement("figcaption");
        if (LABEL[j.stage]) { var st = document.createElement("span"); st.className = "g-stage"; st.textContent = LABEL[j.stage]; cap.appendChild(st); cap.appendChild(document.createElement("br")); }
        cap.appendChild(document.createTextNode(j.caption || ""));
        if (j.credit) { var cr = document.createElement("span"); cr.className = "g-credit"; cr.textContent = j.credit; cap.appendChild(cr); }
        f.appendChild(img); f.appendChild(cap); g.appendChild(f);
      });
      g.hidden = false;
    } else if (C.showAssetPlaceholders) {
      Object.keys(LABEL).forEach(function (k) {
        var d = document.createElement("div"); d.className = "asset-needed";
        d.innerHTML = "<span><b>Asset needed: " + LABEL[k] + "</b>Real, permitted student photo or work sample</span>";
        g.appendChild(d);
      });
      g.hidden = false;
    }
  })();

  /* ---------- Mobile navigation ---------- */
  var toggle = $(".nav-toggle"), nav = $("#main-nav");
  function closeNav() { if (!nav) return; nav.classList.remove("open"); toggle && toggle.setAttribute("aria-expanded", "false"); }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
    document.addEventListener("click", function (e) { if (nav.classList.contains("open") && !e.target.closest(".site-header")) closeNav(); });
  }

  /* ---------- Hero board animation (decorative) ---------- */
  var hero = $(".hero"), dayEl = $("[data-daycount]");
  if (hero) {
    if (reduceMotion) { hero.classList.add("play"); if (dayEl) dayEl.textContent = "100"; }
    else {
      requestAnimationFrame(function () { hero.classList.add("play"); });
      if (dayEl) {
        var start = null, dur = 3200, delay = 300;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min(Math.max((ts - start - delay) / dur, 0), 1);
          var d = Math.max(1, Math.round(p * 100));
          dayEl.textContent = d < 10 ? "0" + d : String(d);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }
  }
  if (reduceMotion) { var st = document.createElement("style"); st.textContent = ".js .board-bar i::after{transform:none!important;animation:none!important}"; document.head.appendChild(st); }

  /* ---------- Reveal on scroll (content is visible without JS) ---------- */
  // Plain position check (not IntersectionObserver) so content can never stay hidden,
  // e.g. in background tabs, embedded previews or after jump-links.
  var pending = $$(".reveal");
  if (reduceMotion) pending.forEach(function (el) { el.classList.add("in"); });
  else {
    var ticking = false;
    var revealCheck = function () {
      ticking = false;
      var limit = (window.innerHeight || 800) * 0.94;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < limit) { el.classList.add("in"); return false; }
        return true;
      });
      if (!pending.length) { window.removeEventListener("scroll", onRevealScroll); window.removeEventListener("resize", onRevealScroll); }
    };
    var onRevealScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(revealCheck); } };
    window.addEventListener("scroll", onRevealScroll, { passive: true });
    window.addEventListener("resize", onRevealScroll);
    window.addEventListener("hashchange", function () { setTimeout(revealCheck, 50); });
    revealCheck();
    setTimeout(revealCheck, 400); // after fonts/layout settle
  }

  /* ---------- Phase bar → highlight the phase it jumps to ---------- */
  $$(".phasebar .pb").forEach(function (a) {
    a.addEventListener("click", function () {
      var target = $(a.getAttribute("href"));
      $$(".phase").forEach(function (p) { p.classList.toggle("active", p === target); });
    });
  });

  /* ---------- Mobile sticky CTA: shown after the hero, hidden near the offers / final CTA ---------- */
  var sticky = $("#sticky-cta"), consent = $("#consent");
  if (sticky && "IntersectionObserver" in window) {
    var hide = { hero: true, experiences: false, final: false, footer: false };
    var watch = { hero: $(".hero"), experiences: $("#experiences .offers"), final: $("#final"), footer: $(".site-footer") };
    var apply = function () {
      var consentOpen = consent && !consent.hidden;
      var show = !hide.hero && !hide.experiences && !hide.final && !hide.footer && !consentOpen;
      sticky.classList.toggle("show", show);
      sticky.setAttribute("aria-hidden", String(!show));
      $$("a", sticky).forEach(function (a) { a.tabIndex = show ? 0 : -1; });
      document.body.classList.toggle("has-sticky", show);
    };
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { hide[e.target._k] = e.isIntersecting; });
      apply();
    });
    Object.keys(watch).forEach(function (k) { if (watch[k]) { watch[k]._k = k; sio.observe(watch[k]); } });
    if (consent && "MutationObserver" in window) new MutationObserver(apply).observe(consent, { attributes: true, attributeFilter: ["hidden"] });
  }

  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
