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

  /* ---------- Booking destinations ---------- */
  var s99 = C.session99 && C.session99.bookingUrl;
  if (s99) $$('a[data-offer="99_session"]').forEach(function (a) { a.href = s99; });

  var t = C.trial999 || {};
  var trialLive = /^https:\/\//.test(t.bookingUrl || "");
  $$("a[data-trial]").forEach(function (a) {
    if (trialLive) { a.href = t.bookingUrl; a.removeAttribute("target"); a.removeAttribute("rel"); a.setAttribute("data-trial-status", "live"); }
    else { a.href = waLink(t.whatsappMessage); a.setAttribute("data-trial-status", "pending_whatsapp"); }
  });
  var foot = $("[data-trial-foot]"); if (foot && trialLive) foot.textContent = "Book on our official booking page";
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
        li.appendChild(el("p", "r-text", r.text));
        var who = el("div", "r-who");
        var av = el("span", "r-avatar", (r.name || "S").charAt(0).toUpperCase()); av.setAttribute("aria-hidden", "true");
        var meta = el("div");
        meta.appendChild(el("p", "r-name", (r.name || "Student") + (r.age ? " · Age " + r.age : "")));
        meta.appendChild(el("p", "r-role", r.role || (it.prog ? "YoungPreneurAi" : "₹99 Startup Idea Session participant")));
        who.appendChild(av); who.appendChild(meta); li.appendChild(who);
      }
      track.appendChild(li);
    });
    if (!items.length) { $("#reviews").hidden = true; return; }

    // Only one video plays at a time
    track.addEventListener("play", function (e) { $$("video", track).forEach(function (v) { if (v !== e.target) v.pause(); }); }, true);

    // Prev / next buttons (desktop)
    var ctrls = $$(".ctrl");
    function step() { var c = $(".r-card", track); return c ? c.getBoundingClientRect().width + 22 : 340; }
    function updateCtrls() {
      var max = slider.scrollWidth - slider.clientWidth - 2;
      ctrls.forEach(function (b) { b.disabled = Number(b.getAttribute("data-dir")) < 0 ? slider.scrollLeft <= 2 : slider.scrollLeft >= max; });
    }
    var parent = $(".slider-ctrls"); if (parent) { parent.removeAttribute("aria-hidden"); }
    ctrls.forEach(function (b) {
      b.tabIndex = 0;
      b.setAttribute("aria-label", Number(b.getAttribute("data-dir")) < 0 ? "Previous reviews" : "Next reviews");
      b.addEventListener("click", function () {
        var d = Number(b.getAttribute("data-dir"));
        slider.scrollBy({ left: d * step(), behavior: reduceMotion ? "auto" : "smooth" });
        track.dispatchEvent(new CustomEvent("yp:review", { detail: { interaction: d < 0 ? "previous" : "next" } }));
      });
    });
    var swiped = false;
    slider.addEventListener("scroll", function () {
      updateCtrls();
      if (!swiped && slider.scrollLeft > 40) { swiped = true; track.dispatchEvent(new CustomEvent("yp:review", { detail: { interaction: "scroll" } })); }
    }, { passive: true });
    window.addEventListener("resize", updateCtrls);
    updateCtrls();
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
