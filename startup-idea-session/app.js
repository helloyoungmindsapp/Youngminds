/* YoungMinds.app — Startup Idea Session page logic (no dependencies). */
(function () {
  "use strict";
  var C = window.YM_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dev = !!C.showIntegrationPlaceholders;

  /* =====================================================
     1. ANALYTICS (GTM / GA4 / Meta Pixel) + CONSENT
     ===================================================== */
  var A = C.analytics || {};
  var hasTracking = !!(A.gtmId || A.ga4Id || A.metaPixelId);
  var CONSENT_KEY = "ym_consent_v1";
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", { ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });

  var loaded = false;
  function loadScript(src) { var s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); }

  function loadTracking() {
    if (loaded || !hasTracking) return;
    loaded = true;
    gtag("consent", "update", { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
    if (A.gtmId) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(A.gtmId));
      return; // GA4 + Pixel are configured inside GTM
    }
    if (A.ga4Id) {
      loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4Id));
      gtag("js", new Date());
      gtag("config", A.ga4Id);
    }
    if (A.metaPixelId) {
      /* Meta Pixel base code */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", A.metaPixelId);
      window.fbq("track", "PageView");
    }
  }

  /* Events are fire-and-forget (GA4 uses sendBeacon), so they never delay
     navigation. A booking-link click is NOT a purchase: completed bookings
     must be measured from Wise.live booking/payment data. */
  function track(event, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: event }, params));   // GTM listens to these
    if (!loaded || A.gtmId) return;
    if (A.ga4Id) gtag("event", event, Object.assign({ transport_type: "beacon" }, params));
    if (window.fbq && A.metaPixelId) window.fbq("trackCustom", event, params);
  }

  function setupConsent() {
    var banner = $("#consent"), settings = $("#cookie-settings");
    if (!hasTracking) return;
    settings.hidden = false;
    var choice = null;
    try { choice = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    if (!A.requireConsent || choice === "granted") loadTracking();
    else if (!choice) banner.hidden = false;
    $$("[data-consent]", banner).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-consent") === "grant" ? "granted" : "denied";
        try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
        banner.hidden = true;
        if (v === "granted") { loadTracking(); track("page_view_consented"); }
      });
    });
    settings.addEventListener("click", function () { banner.hidden = false; });
  }
  setupConsent();
  track("lp_page_view", { page: "startup_idea_session" });

  /* =====================================================
     2. CONFIG-DRIVEN CONTENT + BOOKING LINKS
     ===================================================== */
  var contact = C.contact || {};
  if (contact.whatsappNumber) {
    var wa = "https://wa.me/" + contact.whatsappNumber + (contact.whatsappMessage ? "?text=" + encodeURIComponent(contact.whatsappMessage) : "");
    $$("[data-whatsapp]").forEach(function (a) { a.href = wa; });
  }
  if (contact.email) { var em = $("[data-email]"); em.href = "mailto:" + contact.email; em.textContent = contact.email; em.hidden = false; }
  var legal = C.legal || {};
  $$("[data-legal]").forEach(function (a) { var u = legal[a.getAttribute("data-legal")]; if (u) { a.href = u; a.hidden = false; } });
  $("#year").textContent = new Date().getFullYear();

  function areaOf(el) { var s = el.closest("section, footer, header, .sticky-cta"); return s ? (s.id || s.className.split(" ")[0]) : ""; }
  $$("[data-track]").forEach(function (el) { el.addEventListener("click", function () { track(el.getAttribute("data-track"), { location: areaOf(el) }); }); });

  // Booking CTAs: plain links to Wise.live (same tab). Track the click only.
  $$("[data-book]").forEach(function (a) {
    if (C.bookingUrl) a.href = C.bookingUrl;
    a.addEventListener("click", function () {
      track("book_session_click", { location: a.getAttribute("data-book"), link_url: a.href });
    });
  });

  // Optional verified student example
  var ex = C.studentExample;
  if (ex && ex.problem && ex.solution && ex.concept) {
    var box = $("#student-example");
    box.innerHTML = '<p class="example-title">A real idea from a session</p><div class="example-flow">' +
      '<div><b>Problem</b></div><span class="arrow" aria-hidden="true">→</span>' +
      '<div><b>Possible solution</b></div><span class="arrow" aria-hidden="true">→</span>' +
      '<div><b>Startup concept</b></div></div>' + (ex.credit ? '<p class="example-credit"></p>' : "");
    var cells = $$(".example-flow > div", box);
    [ex.problem, ex.solution, ex.concept].forEach(function (t, i) { cells[i].appendChild(document.createTextNode(t)); });
    if (ex.credit) $(".example-credit", box).textContent = ex.credit;
    box.hidden = false;
  }

  /* =====================================================
     2b. HERO VIDEO — muted, autoplaying, looping, inline, no controls.
     Falls back to the poster image (reduced motion, autoplay blocked,
     video missing). The labelled placeholder stays until real media loads.
     ===================================================== */
  function initHeroVideo() {
    var h = C.heroVideo || {};
    var frame = $(".photo-frame"), ph = frame && $(".img-placeholder", frame);
    if (!frame || (!h.src && !h.poster)) return;

    function reveal(el) { el.classList.add("ready"); ph.classList.add("is-hidden"); }
    function showPoster() {
      if (!h.poster || $("img.hero-media", frame)) return;
      var img = new Image();
      img.className = "hero-media"; img.alt = h.alt || ""; img.decoding = "async";
      img.setAttribute("fetchpriority", "high");
      if (h.focus) img.style.objectPosition = h.focus;
      img.onload = function () { frame.insertBefore(img, frame.firstChild); requestAnimationFrame(function () { reveal(img); }); };
      img.src = h.poster;
    }

    if (reduceMotion || !h.src) { showPoster(); return; }

    var v = document.createElement("video");
    v.className = "hero-media";
    v.muted = true; v.defaultMuted = true; v.setAttribute("muted", "");   // must be muted for autoplay
    v.autoplay = true; v.setAttribute("autoplay", "");
    v.loop = true;
    v.playsInline = true; v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
    v.preload = "metadata";
    v.controls = false;
    v.disablePictureInPicture = true; v.setAttribute("disablepictureinpicture", ""); v.setAttribute("disableremoteplayback", "");
    v.setAttribute("aria-label", h.alt || "Video of a YoungMinds 1:1 session");
    v.tabIndex = -1;
    if (h.poster) v.poster = h.poster;
    if (h.focus) v.style.objectPosition = h.focus;

    v.addEventListener("playing", function () { reveal(v); }, { once: true });
    v.addEventListener("error", function () { v.remove(); showPoster(); }, { once: true });
    v.src = h.src;
    frame.insertBefore(v, frame.firstChild);

    function tryPlay() {
      var p = v.play();
      if (p && p.catch) p.catch(function () { showPoster(); }); // autoplay blocked (e.g. Low Power Mode) → static thumbnail
    }
    tryPlay();

    // Save battery/data: only play while the hero is on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        if (!v.isConnected) return;
        if (es[0].isIntersecting) { if (v.paused) tryPlay(); } else v.pause();
      }).observe(frame);
    }
  }
  initHeroVideo();

  /* =====================================================
     3. VIDEO TESTIMONIALS (real videos, or labelled placeholders)
     Videos load nothing until clicked, then play with native controls
     (pause, replay, fullscreen). Never autoplay.
     ===================================================== */
  var ICON_VID = '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>';

  function placeholderCard(n) {
    return '<figure class="t-card"><div class="t-placeholder"><span class="ph-icon">' + ICON_VID + '</span>' +
      '<strong>Video testimonial ' + n + ' placeholder</strong><span>Genuine student video — to be added</span>' +
      '<div class="t-skeleton" aria-hidden="true"><i></i><i></i><i></i></div></div></figure>';
  }

  function renderTestimonials() {
    var wrap = $("#testimonials"), list = (C.testimonials || []).filter(function (t) { return t && t.src; });
    if (!list.length) {
      if (!dev) { $(".stories").hidden = true; return; } // never show empty placeholders in production
      wrap.innerHTML = placeholderCard(1) + placeholderCard(2) + placeholderCard(3);
    } else {
      wrap.innerHTML = "";
      list.forEach(function (t, i) {
        var fig = document.createElement("figure"); fig.className = "t-card";
        var label = t.alt || (t.name ? t.name + " talking about the Startup Idea Session" : "Student video testimonial");
        var btn = document.createElement("button"); btn.type = "button";
        btn.className = "t-media t-play";
        btn.setAttribute("aria-label", "Play video: " + label);
        // Thumbnail only — the video file itself is not requested until the visitor clicks play
        if (t.poster) { var p = new Image(); p.alt = ""; p.loading = "lazy"; p.decoding = "async"; p.onerror = function () { this.remove(); }; p.src = t.poster; btn.appendChild(p); }
        btn.insertAdjacentHTML("beforeend", '<span class="play" aria-hidden="true">' + ICON_PLAY + "</span>");
        btn.addEventListener("click", function () {
          var holder = document.createElement("div"); holder.className = "t-media";
          var v = document.createElement("video");
          v.src = t.src; v.controls = true; v.playsInline = true; v.preload = "auto";
          if (t.poster) v.poster = t.poster;
          v.setAttribute("aria-label", label);
          holder.appendChild(v);
          btn.replaceWith(holder);
          v.play().catch(function () {}); // started by the visitor's tap
          v.focus();
          track("testimonial_video_play", { index: i + 1 });
        }, { once: true });
        fig.appendChild(btn);
        if (t.name) { var cap = document.createElement("figcaption"); cap.className = "t-name"; cap.textContent = t.name; fig.appendChild(cap); }
        wrap.appendChild(fig);
      });
      // Only one video plays at a time
      wrap.addEventListener("play", function (e) { $$("video", wrap).forEach(function (v) { if (v !== e.target) v.pause(); }); }, true);
    }
    // Carousel dots (mobile)
    var cards = $$(".t-card", wrap), dots = $("#carousel-dots");
    dots.innerHTML = cards.map(function () { return "<i></i>"; }).join("");
    var dotEls = $$("i", dots);
    function updateDots() {
      var w = wrap.scrollWidth - wrap.clientWidth;
      var idx = w > 0 ? Math.round((wrap.scrollLeft / w) * (cards.length - 1)) : 0;
      dotEls.forEach(function (d, i) { d.classList.toggle("on", i === idx); });
    }
    wrap.addEventListener("scroll", updateDots, { passive: true }); updateDots();
  }
  renderTestimonials();

  /* =====================================================
     4. AUTO-SCROLLING STUDENT REVIEWS
     Native horizontal scroller (so swipe, drag, keyboard and screen
     readers all work) advanced slowly by requestAnimationFrame.
     Cards are cloned for a seamless loop; clones are hidden from
     assistive tech and keyboard focus.
     Pauses: mouse hover (desktop), touch/swipe (mobile), keyboard focus,
     an open "Read more" dialog. Reduced motion: no auto-scroll at all.
     ===================================================== */
  var ICON_USER = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
  var ICON_LINKEDIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.75c0-1.37-.02-3.14-1.92-3.14-1.92 0-2.22 1.5-2.22 3.04V21h-4V9Z"/></svg>';
  var STAR = '<svg viewBox="0 0 24 24"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>';
  var LONG_REVIEW = 260; // characters; longer reviews get a preview + "Read more"

  function reviewHead(r) {
    var head = document.createElement("div"); head.className = "review-head";
    var av = document.createElement("span"); av.className = "review-avatar";
    if (r.photo) { var im = new Image(); im.src = r.photo; im.alt = ""; im.loading = "lazy"; im.decoding = "async"; im.width = 50; im.height = 50; av.appendChild(im); }
    else av.innerHTML = ICON_USER;
    var who = document.createElement("div");
    var nm = document.createElement("p"); nm.className = "review-name"; nm.textContent = (r.name || "Startup Idea Session Student") + (r.age ? " · Age " + r.age : "");
    var rl = document.createElement("p"); rl.className = "review-role";
    if (r.source === "linkedin") { rl.innerHTML = '<span class="review-source">' + ICON_LINKEDIN + "</span> "; rl.firstChild.appendChild(document.createTextNode(r.description || "LinkedIn Review")); }
    else rl.textContent = r.description || "Startup Idea Session Participant";
    who.appendChild(nm); who.appendChild(rl);
    head.appendChild(av); head.appendChild(who);
    return head;
  }
  function reviewStars(r) {
    var rating = Number(r.rating);
    if (!(rating >= 1 && rating <= 5)) return null;   // only real, collected ratings
    var st = document.createElement("div"); st.className = "review-stars";
    st.setAttribute("role", "img"); st.setAttribute("aria-label", "Rated " + rating + " out of 5");
    var html = ""; for (var i = 1; i <= 5; i++) html += STAR.replace("<svg", '<svg aria-hidden="true"' + (i > Math.round(rating) ? ' class="off"' : ""));
    st.innerHTML = html; return st;
  }
  function reviewCard(r, idx) {
    var li = document.createElement("li");
    li.className = "review-card" + (r.placeholder ? " is-placeholder" : "");
    li.appendChild(reviewHead(r));
    var stars = reviewStars(r); if (stars) li.appendChild(stars);
    var tx = document.createElement("p"); tx.className = "review-text"; tx.textContent = r.text;
    li.appendChild(tx);
    if (r.text.length > LONG_REVIEW) {
      tx.textContent = r.text.replace(/\s*\n+\s*/g, " "); // preview only; full text (with paragraphs) opens in the dialog
      tx.classList.add("is-clamped");
      var more = document.createElement("button"); more.type = "button"; more.className = "review-more";
      more.setAttribute("data-review", idx);
      more.setAttribute("aria-haspopup", "dialog");
      more.innerHTML = 'Read more<span class="sr-only"> of the review by </span>';
      more.lastChild.appendChild(document.createTextNode(r.name || "this student"));
      li.appendChild(more);
    }
    if (r.placeholder || r.pending) { var tag = document.createElement("span"); tag.className = "review-ph-tag"; tag.textContent = r.pending ? "Draft — pending student approval" : "Placeholder — replace with actual feedback"; li.appendChild(tag); }
    return li;
  }

  var reviewDialog = $("#review-dialog");
  function openReview(r, trigger) {
    var body = $("#review-dialog-body"); body.innerHTML = "";
    var head = reviewHead(r); $(".review-name", head).id = "review-dialog-name";
    body.appendChild(head);
    var stars = reviewStars(r); if (stars) body.appendChild(stars);
    var tx = document.createElement("p"); tx.className = "review-text"; tx.textContent = r.text; body.appendChild(tx);
    reviewDialog._trigger = trigger;
    reviewDialog.showModal();
    track("review_read_more", { reviewer: r.name || "" });
  }
  reviewDialog.addEventListener("click", function (e) { if (e.target === reviewDialog || e.target.closest("[data-close]")) reviewDialog.close(); });
  reviewDialog.addEventListener("close", function () { var t = reviewDialog._trigger; if (t && t.isConnected && t.tabIndex >= 0) t.focus(); });

  function initReviews() {
    var section = $("#reviews"), vp = $("#reviews-viewport"), track_ = $("#reviews-track");
    var list = (C.reviews || []).filter(function (r) { return r && r.text; });
    if (!dev) list = list.filter(function (r) { return !r.placeholder && !r.pending; }); // drafts never go live
    if (!list.length) { section.hidden = true; return; }

    var originals = list.map(reviewCard);
    var setW = 0, pos = 0, expected = -1, last = 0;
    var hover = false, focused = false, touching = false, idleUntil = 0, onScreen = false;
    var speed = Number(C.reviewsSpeed) || 32; // px per second

    // "Read more" (works on originals and on the visible clones)
    track_.addEventListener("click", function (e) {
      var b = e.target.closest("[data-review]");
      if (b && !(drag && drag.moved)) openReview(list[Number(b.getAttribute("data-review"))], b);
    });

    function build() {
      track_.innerHTML = "";
      originals.forEach(function (c) { track_.appendChild(c); });
      if (originals.length < 2) { setW = 0; return; }
      var gap = parseFloat(getComputedStyle(track_).columnGap) || 0;
      var first = originals[0], lastC = originals[originals.length - 1];
      setW = lastC.offsetLeft + lastC.offsetWidth + gap - first.offsetLeft;
      var copies = 1 + Math.ceil(vp.clientWidth / setW);
      for (var k = 0; k < copies; k++) {
        originals.forEach(function (c) {
          var cl = c.cloneNode(true);
          cl.setAttribute("aria-hidden", "true");
          $$("button", cl).forEach(function (b) { b.tabIndex = -1; }); // clickable, but not in tab order
          track_.appendChild(cl);
        });
      }
      pos = ((vp.scrollLeft % setW) + setW) % setW;
      setScroll(pos);
    }
    function setScroll(x) { expected = x; vp.scrollLeft = x; }
    function wrap() {
      if (!setW) return;
      var x = vp.scrollLeft;
      if (x >= setW) { pos = x - setW; setScroll(pos); }
      else if (x < 1 && !touching) { pos = x + setW; setScroll(pos); }
      else pos = x;
    }
    function running() {
      return setW && !reduceMotion && !hover && !focused && !touching && !reviewDialog.open &&
        onScreen && !document.hidden && performance.now() > idleUntil;
    }
    function tick(t) {
      var dt = last ? Math.min(t - last, 64) : 16; last = t;
      if (running()) {
        pos += speed * dt / 1000;
        if (pos >= setW) pos -= setW;
        setScroll(pos);
      }
      requestAnimationFrame(tick);
    }

    // Manual scrolling (swipe, wheel, keyboard) — keep the loop seamless
    vp.addEventListener("scroll", function () {
      if (Math.abs(vp.scrollLeft - expected) <= 2) return;
      if (touching) idleUntil = performance.now() + 1200;
      clearTimeout(vp._t); vp._t = setTimeout(wrap, 160);
    }, { passive: true });

    // Desktop: pause the moment the cursor enters, resume as soon as it leaves
    vp.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hover = true; });
    vp.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hover = false; idleUntil = 0; } });
    // Keyboard: focusing the reviews stops the movement until focus leaves
    vp.addEventListener("focusin", function () { if (vp.matches(":focus-within") && document.querySelector(":focus-visible")) focused = true; });
    vp.addEventListener("focusout", function (e) { if (!vp.contains(e.relatedTarget)) focused = false; });
    // Mobile: pause while touching/swiping, resume shortly after the finger lifts
    vp.addEventListener("touchstart", function () { touching = true; }, { passive: true });
    vp.addEventListener("touchend", function () { touching = false; idleUntil = performance.now() + 1200; }, { passive: true });
    vp.addEventListener("touchcancel", function () { touching = false; idleUntil = performance.now() + 1200; }, { passive: true });

    // Desktop: drag with the mouse
    var drag = null;
    vp.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("button")) return;
      drag = { x: e.clientX, s: vp.scrollLeft, moved: false };
      vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 3) { drag.moved = true; vp.classList.add("dragging"); }
      if (drag.moved) {
        var x = drag.s - dx;
        if (x < 0) { x += setW; drag.s += setW; }
        if (x >= setW * 2) { x -= setW; drag.s -= setW; }
        setScroll(x); pos = x;
      }
    });
    function endDrag() { if (!drag) return; drag = null; vp.classList.remove("dragging"); wrap(); }
    vp.addEventListener("pointerup", endDrag);
    vp.addEventListener("pointercancel", endDrag);

    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; }).observe(vp);
    else onScreen = true;

    var rw; window.addEventListener("resize", function () { clearTimeout(rw); rw = setTimeout(build, 200); });
    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); // re-measure once Gabarito loads
    requestAnimationFrame(tick);
  }
  initReviews();

  /* =====================================================
     5. HEADER, STICKY CTA, REVEALS
     ===================================================== */
  var header = $(".site-header");
  var sticky = $("#sticky-cta");
  var heroCtaVisible = true, finalVisible = false;

  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  function updateSticky() {
    var show = !heroCtaVisible && !finalVisible;
    sticky.classList.toggle("show", show);
    sticky.setAttribute("aria-hidden", show ? "false" : "true");
    $("a", sticky).tabIndex = show ? 0 : -1;
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { heroCtaVisible = es[0].isIntersecting; updateSticky(); }).observe($("#hero-cta"));
    new IntersectionObserver(function (es) { finalVisible = es[0].isIntersecting; updateSticky(); }, { rootMargin: "0px 0px -10% 0px" }).observe($(".booking-box"));

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { reduceMotion ? el.classList.add("in") : io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }
})();
