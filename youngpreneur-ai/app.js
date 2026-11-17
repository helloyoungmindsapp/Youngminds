/* =====================================================================
   YoungPreneurAi landing page — behaviour (no dependencies)
   Progressive enhancement only: without JavaScript every journey stop
   is expanded, every link works and the FAQ (native <details>) works.
   Analytics lives in analytics.js.
   ===================================================================== */
(function () {
  "use strict";
  var C = window.YP_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dev = !!C.showContentPlaceholders;

  function waLink(msg) {
    var n = (C.contact && C.contact.whatsappNumber) || "919496040431";
    return "https://wa.me/" + n + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- Booking destinations ----------
     ₹99  → Wise.live booking page (same tab).
     ₹999 → WhatsApp chat with the official YoungMinds number, pre-filled
            enquiry the visitor can edit before sending (new tab).        */
  var s99 = C.session99 && C.session99.bookingUrl;
  if (s99) $$('a[data-offer="99_session"]').forEach(function (a) { a.href = s99; a.removeAttribute("target"); });

  var t = C.trial999 || {};
  $$("a[data-trial]").forEach(function (a) {
    a.href = waLink(t.whatsappMessage); a.target = "_blank"; a.rel = "noopener";
  });
  var refund = $("[data-refund]"); if (refund && t.refundTerms) { refund.textContent = t.refundTerms; refund.hidden = false; }
  $$("a[data-wa]").forEach(function (a) { a.href = waLink(C.contact && C.contact.whatsappMessage); });

  /* ---------- Header background on scroll (as ₹99 page) ---------- */
  var header = $(".site-header");
  function onScrollHeader() { header && header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScrollHeader, { passive: true }); onScrollHeader();

  /* ---------- Hero video: muted loop, poster for reduced motion / blocked autoplay ---------- */
  (function heroVideo() {
    var hv = C.heroVideo || {}, frame = $("#hero-media"); if (!frame) return;
    if (hv.focus) frame.style.setProperty("--focus", hv.focus);
    var poster = $(".hero-poster", frame);
    if (poster && hv.poster) poster.src = hv.poster;
    if (poster && hv.alt) poster.alt = hv.alt;
    if (!hv.src || reduceMotion) return;
    var v = document.createElement("video");
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata";
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
    v.src = hv.src;
    v.addEventListener("playing", function () { v.classList.add("ready"); }, { once: true });
    v.addEventListener("error", function () { v.remove(); }, { once: true });
    frame.insertBefore(v, poster.nextSibling);
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) play(); else v.pause(); }); }).observe(frame);
    } else play();
  })();

  /* ---------- Interactive journey map ---------- */
  (function journey() {
    var map = $("#jmap"); if (!map) return;
    var stops = $$(".stop", map), fill = $(".road-fill", map), stopsList = $(".stops", map);
    var desktop = window.matchMedia("(min-width: 861px)");

    // Where each stop sits along the road (0–1000), found from its x position.
    var marks = stops.map(function (s) {
      if (!fill || !fill.getTotalLength) return 0;
      var vx = parseFloat(s.style.getPropertyValue("--vx")), total = fill.getTotalLength(), lo = 0, hi = total;
      for (var i = 0; i < 24; i++) { var mid = (lo + hi) / 2; if (fill.getPointAtLength(mid).x < vx) lo = mid; else hi = mid; }
      return Math.round((lo / total) * 1000);
    });

    function select(i, opts) {
      opts = opts || {};
      stops.forEach(function (s, j) {
        var on = j === i;
        if (!desktop.matches && opts.toggle && on && s.classList.contains("active")) on = false; // mobile: tap again to close
        s.classList.toggle("active", on);
        $(".stop-btn", s).setAttribute("aria-expanded", String(on));
      });
      var active = stops.findIndex ? stops.findIndex(function (s) { return s.classList.contains("active"); }) : i;
      var reach = active < 0 ? 0 : active;
      if (fill) fill.style.setProperty("--fill", String(1000 - (marks[reach] || 0)));
      if (stopsList) stopsList.style.setProperty("--vfill", ((reach + 1) / stops.length * 100) + "%");
    }

    stops.forEach(function (s, i) {
      $(".stop-btn", s).addEventListener("click", function () {
        select(i, { toggle: true });
        map.dispatchEvent(new CustomEvent("yp:phase", { detail: { phase: s.getAttribute("data-phase"), index: i + 1 } }));
        if (!desktop.matches) {
          var top = s.getBoundingClientRect().top;
          if (top < 70 || top > window.innerHeight * 0.6) s.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }
      });
    });
    // Arrow keys move between stops on desktop
    map.addEventListener("keydown", function (e) {
      if (!desktop.matches || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      var cur = stops.findIndex(function (s) { return s.classList.contains("active"); });
      var next = Math.max(0, Math.min(stops.length - 1, cur + (e.key === "ArrowRight" ? 1 : -1)));
      if (next !== cur) { e.preventDefault(); $(".stop-btn", stops[next]).click(); $(".stop-btn", stops[next]).focus(); }
    });

    // Start with nothing travelled; "drive" to stop 1 when the map comes into view.
    stops.forEach(function (s, j) { s.classList.toggle("active", j === 0); $(".stop-btn", s).setAttribute("aria-expanded", String(j === 0)); });
    if (reduceMotion || !("IntersectionObserver" in window)) select(0);
    else {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { select(stops.findIndex(function (s) { return s.classList.contains("active"); })); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(map);
      setTimeout(function () { if (fill && !fill.style.getPropertyValue("--fill")) select(0); }, 4000); // safety net
    }
  })();

  /* ---------- Student work (genuine, permitted) ---------- */
  (function work() {
    var box = $("#work"); if (!box) return;
    var list = (C.studentWork || []).filter(function (w) { return w && w.image && w.alt; });
    if (list.length) {
      list.forEach(function (w) {
        var f = el("figure"), img = el("img"); img.src = w.image; img.alt = w.alt; img.loading = "lazy"; img.decoding = "async"; img.width = 800; img.height = 600;
        f.appendChild(img); if (w.caption) f.appendChild(el("figcaption", "", w.caption)); box.appendChild(f);
      });
      box.hidden = false;
    } else if (dev) {
      ["Prototype photo", "MVP screenshot", "Pitch Day photo"].forEach(function (k) {
        var d = el("div", "content-needed"); d.innerHTML = "<span><b>Content needed</b>" + k + " from a real YoungPreneurAi student (with permission)</span>"; box.appendChild(d);
      });
      box.hidden = false;
    }
  })();

  /* ---------- Student Voices: one student per slide (statement + their own video) ---------- */
  (function voices() {
    var section = $("#voices"), copy = $("#v-copy"), media = $("#v-media"), dotsBox = $("#v-dots");
    if (!section || !copy || !media) return;
    var preview = dev || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    var slides = (C.studentVoices || []).filter(function (v) {
      return v && v.name && v.quote && v.video && (v.consentConfirmed === true || preview);
    });

    // Google rating (subtle, next to the heading)
    var g = C.googleRating || {}, gEl = $("#g-rating");
    if (gEl && g.show && g.rating && g.count) {
      gEl.innerHTML = '<span class="g-stars" aria-hidden="true">★★★★★</span>';
      var txt = el("span", "", g.rating + " · " + g.count + " Google reviews");
      if (g.profileUrl) { var ga = el("a"); ga.href = g.profileUrl; ga.target = "_blank"; ga.rel = "noopener"; ga.appendChild(txt); gEl.appendChild(ga); }
      else gEl.appendChild(txt);
      gEl.setAttribute("aria-label", "Rated " + g.rating + " out of 5 from " + g.count + " Google reviews of YoungMinds.app");
      gEl.hidden = false;
    }
    if (!slides.length) return; // nothing publishable: section stays hidden
    section.hidden = false;

    var TYPE = {
      programme_review: { label: "YoungPreneurAi student review", cls: "t-prog" },
      idea_showcase: { label: "Student idea showcase", cls: "t-idea" },
      session_review: { label: "₹99 Startup Idea Session review", cls: "t-session" },
    };
    var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>';
    var idx = 0, current = null;
    var single = slides.length < 2;
    section.classList.toggle("is-single", single);

    var dots = slides.map(function (v, i) {
      var d = el("button", "v-dot"); d.type = "button";
      d.setAttribute("aria-label", "Show " + v.name + " (" + (i + 1) + " of " + slides.length + ")");
      d.addEventListener("click", function () { go(i, "dot"); });
      dotsBox.appendChild(d); return d;
    });

    function emit(name, detail) { section.dispatchEvent(new CustomEvent(name, { detail: detail })); }
    function slideId(v) { return (v.type || "review") + "_" + v.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"); }

    function render() {
      var v = slides[idx], ty = TYPE[v.type] || TYPE.session_review;
      if (current) { current.pause(); current = null; }

      // Written side
      copy.innerHTML = "";
      copy.appendChild(el("p", "v-type " + ty.cls, ty.label));
      copy.appendChild(el("span", "v-mark", "“")).setAttribute("aria-hidden", "true");
      var q = el("blockquote", "v-quote"); q.appendChild(el("p", "", v.quote)); copy.appendChild(q);
      if (v.support) copy.appendChild(el("p", "v-support", v.support));
      var who = el("div", "v-who");
      who.appendChild(el("span", "v-avatar", v.name.charAt(0).toUpperCase())).setAttribute("aria-hidden", "true");
      var meta = el("div");
      meta.appendChild(el("p", "v-name", v.name + (v.age ? " · Age " + v.age : "") + (v.grade ? " · Grade " + v.grade : "")));
      if (v.project) meta.appendChild(el("p", "v-project", v.project));
      who.appendChild(meta); copy.appendChild(who);
      if (v.consentConfirmed !== true) copy.appendChild(el("p", "v-consent", "Preview only — confirm parent/guardian consent before publishing"));

      // Video side: poster + play button; the <video> is created only on tap (nothing downloads before)
      media.innerHTML = ""; media.classList.remove("v-error");
      var btn = el("button", "v-play"); btn.type = "button";
      btn.setAttribute("aria-label", "Play video: " + (v.videoLabel || v.name));
      if (v.poster) { var img = new Image(); img.alt = ""; img.decoding = "async"; img.src = v.poster; img.onerror = function () { this.remove(); }; btn.appendChild(img); }
      btn.insertAdjacentHTML("beforeend", '<span class="play">' + PLAY + "</span>");
      media.appendChild(btn);
      media.appendChild(el("p", "v-tag", v.name));
      btn.addEventListener("click", function () {
        var vid = document.createElement("video");
        vid.src = v.video; vid.controls = true; vid.playsInline = true; vid.preload = "auto";
        vid.setAttribute("playsinline", ""); if (v.poster) vid.poster = v.poster;
        vid.setAttribute("aria-label", v.videoLabel || (v.name + " video"));
        var started = false;
        vid.addEventListener("play", function () { if (!started) { started = true; emit("yp:video", { kind: "play", video_id: slideId(v), content_type: v.type }); } });
        vid.addEventListener("ended", function () { emit("yp:video", { kind: "complete", video_id: slideId(v), content_type: v.type }); });
        vid.addEventListener("error", function () { media.classList.add("v-error"); });
        btn.replaceWith(vid); current = vid;
        var p = vid.play(); if (p && p.catch) p.catch(function () {});
      });

      dots.forEach(function (d, i) { d.classList.toggle("on", i === idx); d.setAttribute("aria-current", i === idx ? "true" : "false"); });
      $("#voices-stage").setAttribute("aria-label", "Student voices, " + (idx + 1) + " of " + slides.length);
    }

    function go(i, how) {
      var n = (i + slides.length) % slides.length;
      if (n === idx && how !== "init") return;
      idx = n; render();
      if (how !== "init") emit("yp:voice", { interaction: how, slide_index: idx + 1, review_id: slideId(slides[idx]), content_type: slides[idx].type });
    }
    $$(".v-arrow", section).forEach(function (b) {
      b.addEventListener("click", function () { var d = Number(b.getAttribute("data-dir")); go(idx + d, d < 0 ? "previous" : "next"); });
    });
    $("#voices-stage").addEventListener("keydown", function (e) {
      if (single || e.target.tagName === "VIDEO") return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1, "next"); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1, "previous"); }
    });
    // Swipe on the written side (the video keeps its own touch controls)
    var sx = null, sy = null;
    copy.addEventListener("touchstart", function (e) { var t0 = e.touches[0]; sx = t0.clientX; sy = t0.clientY; }, { passive: true });
    copy.addEventListener("touchend", function (e) {
      if (sx === null || single) return;
      var t1 = e.changedTouches[0], dx = t1.clientX - sx, dy = t1.clientY - sy; sx = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(idx + (dx < 0 ? 1 : -1), "swipe");
    }, { passive: true });
    // Pause when scrolled out of view
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting && current) current.pause(); }); }).observe(section);

    go(0, "init");
  })();

  /* ---------- Mobile sticky CTA (hidden over the hero, the offers and the final CTA) ---------- */
  var sticky = $("#sticky-cta"), consent = $("#consent");
  if (sticky && "IntersectionObserver" in window) {
    var hide = {}, watch = { hero: $(".hero"), offers: $(".offers"), final: $(".final-panel"), footer: $(".site-footer") };
    var apply = function () {
      var show = !Object.keys(hide).some(function (k) { return hide[k]; }) && !(consent && !consent.hidden);
      sticky.classList.toggle("show", show); sticky.setAttribute("aria-hidden", String(!show));
      $$("a", sticky).forEach(function (a) { a.tabIndex = show ? 0 : -1; });
    };
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { hide[e.target._k] = e.isIntersecting; }); apply(); });
    Object.keys(watch).forEach(function (k) { if (watch[k]) { watch[k]._k = k; hide[k] = k === "hero"; sio.observe(watch[k]); } });
    if (consent && "MutationObserver" in window) new MutationObserver(apply).observe(consent, { attributes: true, attributeFilter: ["hidden"] });
  }

  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
