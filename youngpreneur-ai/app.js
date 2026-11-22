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
  // Temporary: config.bookingFormUrl sends both offers to one Google Form (same tab/new tab behaviour as before).
  var form = C.bookingFormUrl;
  var s99 = form || (C.session99 && C.session99.bookingUrl);
  if (s99) $$('a[data-offer="99_session"]').forEach(function (a) { a.href = s99; a.removeAttribute("target"); });

  var t = C.trial999 || {};
  $$("a[data-trial]").forEach(function (a) {
    a.href = form || waLink(t.whatsappMessage); a.target = "_blank"; a.rel = "noopener";
  });
  var refund = $("[data-refund]"); if (refund && t.refundTerms) { refund.textContent = t.refundTerms; refund.hidden = false; }
  $$("a[data-wa]").forEach(function (a) { a.href = waLink(C.contact && C.contact.whatsappMessage); });

  /* ---------- Header background on scroll (as ₹99 page) ---------- */
  var header = $(".site-header");
  function onScrollHeader() { header && header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScrollHeader, { passive: true }); onScrollHeader();

  /* ---------- Hero photo (temporary hero asset) — config.heroImage overrides the HTML defaults ---------- */
  (function heroImage() {
    var hi = C.heroImage || {}, img = $("#hero-video .hv-image img"), chip = $("#hero-video .hv-chip");
    if (!img) return;
    if (hi.src) { img.src = hi.src; img.srcset = hi.srcset || ""; }
    if (hi.alt) img.alt = hi.alt;
    if (hi.focus) img.style.objectPosition = hi.focus;
    if (hi.ratio) $("#hero-video .hv-image").style.setProperty("--hero-ratio", hi.ratio);
    if (chip) { if (hi.caption === "") chip.remove(); else if (hi.caption) chip.textContent = hi.caption; }
  })();

  /* ---------- Hero: programme explainer video (click to play, controls, no loop) ---------- */
  (function explainer() {
    var fig = $("#hero-video"), ev = C.explainerVideo || {};
    if (!fig || !ev.src) return; // no explainer yet: keep the hero photo (config.heroImage)
    if (ev.ratio) fig.style.setProperty("--hv-ratio", ev.ratio);
    var frame = el("div", "hv-frame");
    var btn = el("button", "hv-play"); btn.type = "button";
    btn.setAttribute("aria-label", "Play video: " + (ev.title || "How YoungPreneurAi works"));
    if (ev.poster) { var img = new Image(); img.src = ev.poster; img.alt = ""; img.decoding = "async"; img.setAttribute("fetchpriority", "high"); btn.appendChild(img); }
    btn.insertAdjacentHTML("beforeend", '<span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg></span>');
    if (ev.duration) btn.appendChild(el("span", "hv-len", ev.duration));
    frame.appendChild(btn);
    var current = $(".hv-image", fig) || $(".hv-placeholder", fig); // temporary hero photo
    if (current) current.replaceWith(frame); else fig.insertBefore(frame, fig.firstChild);
    fig.setAttribute("data-state", "ready");
    btn.addEventListener("click", function () {
      var v = document.createElement("video");
      v.src = ev.src; v.controls = true; v.playsInline = true; v.preload = "auto"; v.loop = false;
      v.setAttribute("data-video-id", "programme_explainer"); v.setAttribute("data-video-location", "hero");
      v.setAttribute("playsinline", ""); if (ev.poster) v.poster = ev.poster;
      if (ev.captions) { var tr = document.createElement("track"); tr.kind = "captions"; tr.src = ev.captions; tr.srclang = ev.captionsLang || "en"; tr.label = ev.captionsLabel || "English"; v.appendChild(tr); }
      v.setAttribute("aria-label", ev.title || "How YoungPreneurAi works");
      var started = false;
      v.addEventListener("play", function () { if (!started) { started = true; fig.dispatchEvent(new CustomEvent("yp:video", { detail: { kind: "play", video_id: "programme_explainer", content_type: "programme_explainer" } })); } });
      v.addEventListener("ended", function () { fig.dispatchEvent(new CustomEvent("yp:video", { detail: { kind: "complete", video_id: "programme_explainer", content_type: "programme_explainer" } })); });
      btn.replaceWith(v);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
  })();

  /* ---------- Interactive journey map ----------
     The journey follows the visitor's own scrolling (it never moves by itself, so it
     cannot fight manual scrolling; a click-triggered smooth scroll is cancelled by
     the browser as soon as the visitor scrolls or touches).
       pin  (desktop): the map pins below the header while a runway scrolls past;
            the road fills and each stop opens when the road reaches it. On short
            windows the map is compacted/scaled down so it still fits.
       free (desktop, window too short even when compacted): no pinning; progress
            follows the map's position in the viewport.
       flow (< 861px): vertical road, all stops open; the road fills and the stop
            you have reached is highlighted.
     Reduced motion: same behaviour, without transitions (CSS removes them).
     Geometry is measured once per layout change (resize, orientation, fonts,
     ResizeObserver) and cached; the scroll handler only reads scrollY.        */
  (function journey() {
    var section = $("#journey"), map = $("#jmap"); if (!map || !section) return;
    var stops = $$(".stop", map), fill = $(".road-fill", map), stopsList = $(".stops", map);
    var runway = $(".jmap-runway", section), road = $(".road", map);
    var desktop = window.matchMedia("(min-width: 861px)");
    var current = -1, mode = "flow", geo = {}, ticking = false, configuring = false;

    // Where each stop sits along the road (0–1000), found from its x position.
    var marks = stops.map(function (s) {
      if (!fill || !fill.getTotalLength) return 0;
      var vx = parseFloat(s.style.getPropertyValue("--vx")), total = fill.getTotalLength(), lo = 0, hi = total;
      for (var i = 0; i < 24; i++) { var mid = (lo + hi) / 2; if (fill.getPointAtLength(mid).x < vx) lo = mid; else hi = mid; }
      return Math.round((lo / total) * 1000);
    });
    var first = marks[0] || 0;
    // Each stop gets a fair share of the scroll; the last stretch holds Pitch Day.
    var KNOTS = [0, 0.33, 0.66, 0.9];

    function setActive(i) {
      if (i === current) return;
      current = i;

      stops.forEach(function (s, j) {
        s.classList.toggle("active", j === i);
        $(".stop-btn", s).setAttribute("aria-expanded", String(mode === "flow" ? true : j === i));
      });
    }
    function setRoad(len) { if (fill) fill.style.setProperty("--fill", String(1000 - len)); }
    function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function absTop(el) { return el.getBoundingClientRect().top + window.pageYOffset; }
    function headerOffset() { return (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 68) + 16; }

    function fromProgress(p) {
      var k = 0;
      for (var i = 0; i < KNOTS.length && i < marks.length; i++) if (p >= KNOTS[i]) k = i;
      var nextK = Math.min(k + 1, marks.length - 1);
      var t = nextK === k ? 0 : clamp01((p - KNOTS[k]) / (KNOTS[nextK] - KNOTS[k]));
      setRoad(marks[k] + t * (marks[nextK] - marks[k])); setActive(k);
    }

    /* ----- Measuring (layout reads happen only here) ----- */
    function tallestPanel() { // so the pinned map keeps one height for every stop
      var max = 0, was = current;
      stops.forEach(function (s) { s.classList.add("active"); });
      stops.forEach(function (s) { var p = $(".stop-panel", s); if (p) max = Math.max(max, p.offsetHeight); });
      stops.forEach(function (s, j) { s.classList.toggle("active", j === was); });
      return max;
    }
    function fitDesktop() {
      // Returns true when the pinned map fits the window (compacting/scaling if needed).
      section.classList.remove("is-compact"); map.style.maxWidth = ""; map.style.removeProperty("--panel-h");
      section.classList.add("is-scrub"); // measure exactly the layout that will be pinned (fixed panel height)
      var avail = window.innerHeight - geo.top - 12;
      for (var pass = 0; pass < 4; pass++) {
        map.style.setProperty("--panel-h", tallestPanel() + "px");
        var h = map.offsetHeight;
        if (h <= avail) return true;
        if (!section.classList.contains("is-compact")) { section.classList.add("is-compact"); continue; }
        var roadH = road ? road.getBoundingClientRect().height : 0, rest = h - roadH;
        var target = avail - rest; // height the road may use
        var w = Math.floor(target / 0.3); // road keeps its 1000:300 shape
        if (w < 720) return false; // window far too short to pin a readable map
        map.style.maxWidth = w + "px";
      }
      return map.offsetHeight <= avail;
    }
    function measure() {
      geo.vh = window.innerHeight;
      if (mode === "pin") {
        geo.mapH = map.offsetHeight; geo.runTop = absTop(runway); geo.runH = runway.offsetHeight || 1;
      } else if (mode === "free") {
        geo.mapTop = absTop(map); geo.mapH = map.offsetHeight || 1;
      } else {
        geo.stopTops = stops.map(absTop);
        if (stopsList) { geo.listTop = absTop(stopsList); geo.listH = stopsList.offsetHeight || 1; }
      }
    }
    function configure() {
      if (configuring) return; configuring = true;
      geo = { top: headerOffset() };
      var wantDesktop = desktop.matches;
      section.classList.remove("is-scrub", "is-free");
      section.classList.toggle("is-flow", !wantDesktop);
      if (wantDesktop && runway) {
        mode = fitDesktop() ? "pin" : "free";
        if (mode === "free") { section.classList.remove("is-compact"); map.style.maxWidth = ""; map.style.removeProperty("--panel-h"); }
        section.classList.toggle("is-scrub", mode === "pin");
        section.classList.toggle("is-free", mode === "free");
      } else {
        mode = "flow"; section.classList.remove("is-compact"); map.style.maxWidth = ""; map.style.removeProperty("--panel-h");
      }
      measure();
      current = -1; update();
      configuring = false;
    }

    /* ----- Per-scroll work: arithmetic on cached numbers only ----- */
    // Analytics: announce each phase the first time it is the active phase while the journey is on
    // screen (yp_journey_phase_view). Only reads layout until every phase has been announced.
    var announced = {}, announcedCount = 0;
    function announce() {
      if (current < 0 || announced[current] || announcedCount >= stops.length || configuring) return;
      var r = section.getBoundingClientRect(), vh = window.innerHeight || 800;
      if (r.bottom <= vh * 0.2 || r.top >= vh * 0.8) return; // journey not meaningfully on screen
      announced[current] = true; announcedCount++;
      map.dispatchEvent(new CustomEvent("yp:phaseview", { detail: { phase: stops[current].getAttribute("data-phase"), index: current + 1, mode: mode } }));
    }
    var lastY = -1;
    function update() {
      ticking = false;
      var y = window.pageYOffset; lastY = y;
      if (mode === "pin") fromProgress(clamp01((y + geo.top + geo.mapH - geo.runTop) / geo.runH));
      else if (mode === "free") fromProgress(clamp01((y + geo.vh * 0.75 - geo.mapTop) / (geo.mapH + geo.vh * 0.45))); // map top at 75% of the screen → map bottom at 30%
      else {
        var line = y + geo.vh * 0.55, k = 0;
        geo.stopTops.forEach(function (t, i) { if (t < line) k = i; });
        setActive(k);
        if (stopsList) stopsList.style.setProperty("--vfill", (clamp01((line - geo.listTop) / geo.listH) * 100) + "%");
      }
      announce();
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      // rAF keeps it to one update per frame; the timeout is a safety net for browsers
      // that pause rAF (e.g. background or embedded views) so updates never get stuck.
      var done = false, run = function () { if (!done) { done = true; update(); } };
      if (window.requestAnimationFrame) requestAnimationFrame(run);
      setTimeout(run, 80);
    }

    /* ----- Manual navigation (click / keyboard) ----- */
    function scrollToStop(i) {
      var y;
      if (mode === "pin") y = geo.runTop - geo.top - geo.mapH + Math.min(1, (KNOTS[i] || 0) + 0.02) * geo.runH;
      else if (mode === "free") y = geo.mapTop - geo.vh * 0.75 + Math.min(1, (KNOTS[i] || 0) + 0.02) * (geo.mapH + geo.vh * 0.45);
      if (y !== undefined) window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? "auto" : "smooth" });
    }
    stops.forEach(function (s, i) {
      $(".stop-btn", s).addEventListener("click", function () {
        map.dispatchEvent(new CustomEvent("yp:phase", { detail: { phase: s.getAttribute("data-phase"), index: i + 1 } }));
        if (mode === "flow") { s.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); return; }
        setActive(i); setRoad(marks[i] || first); // instant feedback, then scroll to that point
        scrollToStop(i);
      });
    });
    map.addEventListener("keydown", function (e) {
      if (mode === "flow" || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      var next = Math.max(0, Math.min(stops.length - 1, Math.max(0, current) + (e.key === "ArrowRight" ? 1 : -1)));
      if (next !== current) { e.preventDefault(); $(".stop-btn", stops[next]).click(); $(".stop-btn", stops[next]).focus(); }
    });

    /* ----- Wiring ----- */
    var reconf = null;
    function scheduleConfigure() { clearTimeout(reconf); reconf = setTimeout(configure, 120); }
    window.addEventListener("scroll", onScroll, { passive: true });
    // Safety net: some browsers/situations deliver no scroll event for a scroll (e.g. older iOS
    // momentum scrolling, throttled windows). A cheap check of scrollY 5×/s catches up; it does
    // nothing unless the position actually changed.
    setInterval(function () { if (!ticking && !configuring && window.pageYOffset !== lastY) update(); }, 200);
    window.addEventListener("resize", scheduleConfigure);
    window.addEventListener("orientationchange", scheduleConfigure);
    if (desktop.addEventListener) desktop.addEventListener("change", scheduleConfigure);
    else if (desktop.addListener) desktop.addListener(scheduleConfigure);
    window.addEventListener("load", configure); // fonts/images can change heights
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleConfigure);
    if ("ResizeObserver" in window) { // content above the map changing height moves it
      var lastH = 0, lastW = 0;
      new ResizeObserver(function () {
        var h = document.body.offsetHeight, w = document.documentElement.clientWidth;
        if (Math.abs(h - lastH) > 2 || w !== lastW) { lastH = h; lastW = w; if (!configuring) scheduleConfigure(); }
      }).observe(document.body);
    }
    setActive(0); setRoad(first);
    configure();
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
    // Consent is an internal publishing check (config.consentConfirmed), never shown on the page.
    var preview = dev || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    var slides = (C.studentVoices || []).filter(function (v) {
      return v && v.name && v.quote && v.video && (v.consentConfirmed === true || preview);
    });

    // Google rating: star rating only (no review count), subtle, next to the heading
    var g = C.googleRating || {}, gEl = $("#g-rating");
    if (gEl && g.show && g.rating) {
      gEl.innerHTML = '<span class="g-score">' + g.rating + '</span><span class="g-stars" aria-hidden="true">★★★★★</span><span class="g-label">Google Rating</span>';
      gEl.setAttribute("aria-label", "Google rating " + g.rating + " out of 5");
      gEl.hidden = false;
      if (!slides.length) { var rh = $("#reviews .reviews-head > div"); if (rh) rh.appendChild(gEl); }
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
      var tags = el("div", "v-tags");
      tags.appendChild(el("span", "v-type " + ty.cls, ty.label));
      if (v.status) tags.appendChild(el("span", "v-status", v.status));
      copy.appendChild(tags);
      if (v.verbatim !== false) {
        copy.appendChild(el("span", "v-mark", "“")).setAttribute("aria-hidden", "true");
        var q = el("blockquote", "v-quote"); q.appendChild(el("p", "", v.quote)); copy.appendChild(q);
      } else {
        copy.appendChild(el("p", "v-quote v-headline", v.quote));
      }
      if (v.support) copy.appendChild(el("p", "v-support", v.support));
      var who = el("div", "v-who");
      var av = el("span", "v-avatar" + (v.photo ? " has-photo" : ""));
      if (v.photo) { var ph = new Image(); ph.src = v.photo; ph.alt = "Photo of " + v.name; ph.width = 64; ph.height = 64; ph.decoding = "async"; av.appendChild(ph); }
      else { av.textContent = v.name.charAt(0).toUpperCase(); av.setAttribute("aria-hidden", "true"); }
      who.appendChild(av);
      var meta = el("div");
      meta.appendChild(el("p", "v-name", v.name + (v.age ? " · Age " + v.age : "") + (v.grade ? " · Grade " + v.grade : "")));
      if (v.project) meta.appendChild(el("p", "v-project", v.project));
      who.appendChild(meta); copy.appendChild(who);

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
        vid.setAttribute("data-video-id", slideId(v)); vid.setAttribute("data-video-location", "student_voices"); vid.setAttribute("data-content-type", v.type);
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

  /* ---------- Reviews slider ---------- */
  (function reviews() {
    var track = $("#slider-track"), slider = $("#slider"); if (!track || !slider) return;
    var prog = (C.programmeReviews || []).filter(function (r) { return r && (r.text || r.src); });
    var sess = (C.sessionReviews || []).filter(function (r) { return r && (r.text || r.src); });
    var note = $("#reviews-note");
    if (prog.length && note) note.textContent = "From YoungPreneurAi students and parents, and from students who started with our ₹99 Startup Idea Session.";

    var items = prog.map(function (r) { return { r: r, label: "YoungPreneurAi", prog: true }; })
      .concat(sess.map(function (r) { return { r: r, label: "₹99 Session", prog: false }; }));
    if (dev && !prog.length) items.unshift({ placeholder: true }, { placeholder: true });

    var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>';
    items.forEach(function (it, i) {
      var li = el("li", "r-card");
      li.setAttribute("data-review-id", (it.prog ? "programme_" : "session_") + (i + 1));
      if (it.placeholder) {
        li.classList.add("is-placeholder");
        li.appendChild(el("span", "r-tag prog", "Content needed"));
        li.appendChild(el("p", "r-text", "Genuine YoungPreneurAi student or parent review — add to config.programmeReviews with permission."));
        track.appendChild(li); return;
      }
      var r = it.r;
      if (r.type === "video" && r.src) {
        li.classList.add("r-video");
        var btn = el("button", "r-media"); btn.type = "button";
        btn.setAttribute("aria-label", "Play video: " + (r.alt || "student review"));
        if (r.poster) { var p = new Image(); p.alt = ""; p.loading = "lazy"; p.decoding = "async"; p.src = r.poster; p.onerror = function () { this.remove(); }; btn.appendChild(p); }
        btn.insertAdjacentHTML("beforeend", '<span class="play">' + PLAY + "</span>");
        btn.addEventListener("click", function () {
          var v = document.createElement("video");
          v.src = r.src; v.controls = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto";
          if (r.poster) v.poster = r.poster;
          v.setAttribute("aria-label", r.alt || "Student review video");
          btn.replaceWith(Object.assign(el("div", "r-media"), {}));
          var holder = $(".r-media", li); holder.appendChild(v);
          v.play().catch(function () {});
          track.dispatchEvent(new CustomEvent("yp:review", { detail: { interaction: "video_play", review_id: li.getAttribute("data-review-id") } }));
        });
        li.appendChild(btn);
        li.appendChild(el("span", "r-tag" + (it.prog ? " prog" : ""), it.label + (r.name ? " · " + r.name : "")));
      } else {
        li.appendChild(el("span", "r-tag" + (it.prog ? " prog" : ""), it.label));
        var rt = el("p", "r-text", r.text); li.appendChild(rt);
        if (r.text.length > 260) { // long reviews: preview + Read more (as on the ₹99 page)
          rt.classList.add("is-clamped");
          var more = el("button", "r-more", "Read more"); more.type = "button"; more.setAttribute("aria-expanded", "false");
          more.addEventListener("click", function () {
            var open = !rt.classList.toggle("is-clamped");
            more.textContent = open ? "Show less" : "Read more"; more.setAttribute("aria-expanded", String(open));
            track.dispatchEvent(new CustomEvent("yp:review", { detail: { interaction: open ? "read_more" : "read_less", review_id: li.getAttribute("data-review-id") } }));
          });
          li.appendChild(more);
        }
        var who = el("div", "r-who");
        var av = el("span", "r-avatar", (r.name || "S").charAt(0).toUpperCase()); av.setAttribute("aria-hidden", "true");
        var meta = el("div");
        meta.appendChild(el("p", "r-name", (r.name || "Student") + (r.age ? " · Age " + r.age : "")));
        meta.appendChild(el("p", "r-role" + (r.source === "linkedin" ? " r-linkedin" : ""), r.role || (it.prog ? "YoungPreneurAi" : "₹99 Startup Idea Session participant")));
        who.appendChild(av); who.appendChild(meta); li.appendChild(who);
      }
      track.appendChild(li);
    });
    if (!items.length) { $("#reviews").hidden = true; return; }

    // Only one video plays at a time
    track.addEventListener("play", function (e) { $$("video", track).forEach(function (v) { if (v !== e.target) v.pause(); }); }, true);

    // Infinite loop: one set of inert clones on each side; after every scroll the
    // position is silently moved back into the real set, so Next/Previous never end.
    var originals = $$(".r-card", track);
    var loop = originals.length > 1;
    if (loop) {
      var mk = function (c) { var k = c.cloneNode(true); k.classList.add("is-clone"); k.setAttribute("aria-hidden", "true"); k.setAttribute("inert", ""); k.removeAttribute("data-review-id"); return k; };
      var before = document.createDocumentFragment(), after = document.createDocumentFragment();
      originals.forEach(function (c) { before.appendChild(mk(c)); after.appendChild(mk(c)); });
      track.insertBefore(before, track.firstChild); track.appendChild(after);
    }
    var cards = $$(".r-card", track); // clones + originals, in visual order
    var n = originals.length, offset = loop ? n : 0; // index of the first real card
    function posOf(i) { return cards[i].offsetLeft - cards[0].offsetLeft; }
    function currentIndex() { // card whose left edge is nearest the slider's start
      var x = slider.scrollLeft, best = 0, bd = Infinity;
      for (var i = 0; i < cards.length; i++) { var d = Math.abs(posOf(i) - x); if (d < bd) { bd = d; best = i; } }
      return best;
    }
    function jump(left) {
      slider.style.scrollSnapType = "none"; slider.style.scrollBehavior = "auto";
      slider.scrollLeft = left;
      void slider.offsetWidth; // apply before snapping is restored
      slider.style.scrollSnapType = ""; slider.style.scrollBehavior = "";
    }
    function normalise() { // keep the visible card inside the real set
      if (!loop) return;
      var i = currentIndex();
      if (i < offset) jump(posOf(i + n) + (slider.scrollLeft - posOf(i)));
      else if (i >= offset + n) jump(posOf(i - n) + (slider.scrollLeft - posOf(i)));
    }
    if (loop) jump(posOf(offset)); // start on the first real review

    // Prev / next buttons (desktop): always active, wrap around
    var ctrls = $$(".ctrl");
    var parent = $(".slider-ctrls"); if (parent) { parent.removeAttribute("aria-hidden"); }
    ctrls.forEach(function (b) {
      b.tabIndex = 0;
      b.setAttribute("aria-label", Number(b.getAttribute("data-dir")) < 0 ? "Previous reviews" : "Next reviews");
      b.addEventListener("click", function () {
        var d = Number(b.getAttribute("data-dir"));
        normalise();
        var target = Math.max(0, Math.min(cards.length - 1, currentIndex() + d));
        slider.scrollTo({ left: posOf(target), behavior: reduceMotion ? "auto" : "smooth" });
        track.dispatchEvent(new CustomEvent("yp:review", { detail: { interaction: d < 0 ? "previous" : "next" } }));
      });
    });
    var swiped = false, startLeft = null, idle;
    slider.addEventListener("scroll", function () {
      if (startLeft === null) startLeft = slider.scrollLeft;
      if (!swiped && Math.abs(slider.scrollLeft - startLeft) > 40) { swiped = true; track.dispatchEvent(new CustomEvent("yp:review", { detail: { interaction: "scroll" } })); }
      clearTimeout(idle); idle = setTimeout(normalise, 180); // fallback where "scrollend" is not supported
    }, { passive: true });
    if ("onscrollend" in window) slider.addEventListener("scrollend", normalise);
    window.addEventListener("resize", function () { if (loop) { var i = currentIndex(); jump(posOf(i)); normalise(); } });
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
