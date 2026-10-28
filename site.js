// Droyma — scroll scenes and interactions.
(() => {
  const WAITLIST = "https://tally.so/r/q4xPo5";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const vh = () => window.innerHeight;

  // ---------- Opening line: "The next leap in human performance is sleep." ----------
  const intro = document.getElementById("opening");
  if (intro) {
    const variant = new URLSearchParams(location.search).get("intro") === "sky" ? "sky" : "black";
    intro.classList.add(`opening-${variant}`);
    if (reduced) intro.remove();
    else {
      document.documentElement.classList.add("intro-lock");
      const line = intro.querySelector(".intro-line");
      let k = 0;
      line.innerHTML = line.innerHTML.split("<br>").map((row) => row.split(" ").map((w) => `<span class="iw" style="--i:${k++}">${w}</span>`).join(" ")).join("<br>");
      const finish = () => {
        if (intro.classList.contains("out")) return;
        intro.classList.add("out");
        document.documentElement.classList.remove("intro-lock");
        setTimeout(() => intro.remove(), 1300);
      };
      const start = () => requestAnimationFrame(() => {
        intro.classList.add("go");
        setTimeout(finish, 2900);
      });
      document.readyState === "complete" ? start() : window.addEventListener("load", start, { once: true });
      setTimeout(() => { if (!intro.classList.contains("go")) start(); }, 2500);
      intro.addEventListener("click", finish);
    }
  }

  document.querySelectorAll("[data-waitlist]").forEach((a) => { a.href = WAITLIST; a.target = "_blank"; a.rel = "noreferrer"; });

  // ---------- Scroll-driven scenes (one rAF loop) ----------
  const nav = document.getElementById("nav");
  const heroStage = document.querySelector(".hero-stage");
  const heroCopy = document.querySelector(".hero-copy");
  const wornFrame = document.querySelector("[data-zoom]");
  const read = document.querySelector(".read");
  const story = document.getElementById("story");
  const finalImg = document.querySelector("[data-parallax]");
  const closingProduct = document.querySelector(".closing-product");
  const darkSections = [...document.querySelectorAll(".worn-scene, .night, .uv-portal, .scores3, .section.black, .section.navy, .story, .final")];

  // Split the statement into words (if the page has one).
  const words = read ? read.dataset.read.split(" ").map((w) => {
    const s = document.createElement("span"); s.className = "w"; s.textContent = w; return s;
  }) : [];
  if (read) { read.setAttribute("aria-label", read.dataset.read); words.forEach((s) => { read.append(s, " "); }); }

  // Story steps.
  const storyMedia = story ? [...story.querySelectorAll(".story-media > figure")] : [];
  const storyCopy = story ? [...story.querySelectorAll(".story-copy > div")] : [];
  const storyDots = story ? [...story.querySelectorAll(".story-progress i")] : [];
  let storyStep = -1;
  const setStory = (i) => {
    if (i === storyStep) return;
    storyStep = i;
    story.dataset.step = String(i + 1);
    [storyMedia, storyCopy, storyDots].forEach((set) => set.forEach((el, j) => el.classList.toggle("is-on", j === i)));

  };

  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = window.scrollY, h = vh();

    // Nav: floating over hero, solid after; dark over dark scenes.
    nav.classList.toggle("is-solid", y > 40);
    const probe = 80;
    const dark = darkSections.some((s) => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; });
    nav.classList.toggle("is-dark", y > 40 && dark);

    if (!reduced) {
      // Hero: wordmark + product drift back and fade as you leave.
      const p = clamp(y / (h * .9));
      if (heroStage && heroCopy) {
      heroStage.style.transform = `translateY(${p * 120}px) scale(${1 - p * .12})`;
      heroStage.style.opacity = String(1 - p * .9);
      heroCopy.style.transform = `translateY(${p * 60}px)`;
      heroCopy.style.opacity = String(1 - p * 1.3);
      }

      // Worn close-up grows to full size, then tags appear.
      if (wornFrame) {
        const r = wornFrame.getBoundingClientRect();
        const z = clamp((h - r.top) / (h * .95));
        wornFrame.style.setProperty("--z", String(.86 + .14 * z));
        wornFrame.style.setProperty("--tags", z > .92 ? "1" : "0");
      }

      // Final parallax.
      if (closingProduct) { const cr = closingProduct.parentElement.getBoundingClientRect(); if (cr.top < h && cr.bottom > 0) closingProduct.style.translate = `0 ${cr.top * .08}px`; }
    }

    // Statement words light up as it crosses the viewport.
    if (read) {
      const rr = read.getBoundingClientRect();
      const rp = clamp((h * .85 - rr.top) / (h * .6));
      const lit = Math.round(rp * words.length);
      words.forEach((w, i) => w.classList.toggle("lit", i < lit));
    }

    // Story: three steps across the pinned scroll.
    if (story) {
      const sr = story.getBoundingClientRect();
      const sp = clamp(-sr.top / Math.max(1, story.offsetHeight - h));
      setStory(sp < .5 ? 0 : 1);
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  frame();

  // ---------- Why sleep: portal → stars become the years of a life ----------
  const uv = document.getElementById("why-sleep");
  const lyGrid = document.getElementById("lyGrid");
  if (uv && lyGrid) {
    const portal = document.getElementById("uvPortal");
    const head = uv.querySelector(".uv-head");
    const late = [...uv.querySelectorAll(".uv-late")];
    const content = uv.querySelector(".uv-content");
    const finalWords = [];
    uv.querySelectorAll("[data-words]").forEach((el) => {
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = el.textContent.split(" ").map((w) => `<span class="fw">${w}</span>`).join(" ");
      finalWords.push(...el.querySelectorAll(".fw"));
    });
    const dots = [];
    for (let y = 0; y < 80; y++) {
      const d = document.createElement("i");
      if (y < 26) { d.className = "sleep"; d.style.setProperty("--s", `${y * 60}ms`); }
      lyGrid.append(d);
      // Each year starts as a star somewhere in the sky.
      const a = Math.random() * Math.PI * 2, r = .45 + Math.random() * .75;
      dots.push({ d, sx: Math.cos(a) * r, sy: Math.sin(a) * r, delay: Math.random() * .25 });
    }
    // Starfield canvas.
    const cv = document.getElementById("uvStars"), cx = cv.getContext("2d");
    const stars = Array.from({ length: 260 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), z: .2 + Math.random() * .8, tw: Math.random() * 6 }));
    const sizeCv = () => { const dpr = Math.min(2, devicePixelRatio || 1); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    window.addEventListener("resize", sizeCv); sizeCv();
    let up = 0, uvOn = false, lit = false;
    const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
    const drawStars = (now) => {
      const W = cv.clientWidth, H = cv.clientHeight, R = Math.hypot(W, H) / 2;
      cx.clearRect(0, 0, W, H);
      const warp = 1 - ease(up / .4);           // fast while the portal opens, still afterwards
      const fade = 1 - ease((up - .35) / .3) * .7; // dim as the years take over
      for (const s of stars) {
        s.r += .0016 * s.z * (1 + warp * 14);
        if (s.r > 1.05) s.r = .02;
        const d = s.r * R, x = W / 2 + Math.cos(s.a) * d, y = H / 2 + Math.sin(s.a) * d;
        const tail = warp * 60 * s.z * s.r;
        const alpha = Math.min(1, s.r * 2.5) * s.z * fade * (.7 + .3 * Math.sin(now / 600 + s.tw));
        cx.strokeStyle = `rgba(200,220,255,${alpha})`; cx.lineWidth = .6 + s.z * 1.2;
        cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x - Math.cos(s.a) * tail, y - Math.sin(s.a) * tail); cx.stroke();
        if (tail < 2) { cx.fillStyle = `rgba(220,232,255,${alpha})`; cx.beginPath(); cx.arc(x, y, .5 + s.z, 0, Math.PI * 2); cx.fill(); }
      }
    };
    const renderUv = () => {
      const r = uv.getBoundingClientRect();
      up = reduced ? 1 : clamp(-r.top / Math.max(1, uv.offsetHeight - vh()));
      // 1 · the portal opens
      const open = ease(up / .3);
      portal.style.clipPath = up >= .3 ? "none" : `circle(${4 + open * 76}% at 50% 50%)`;
      head.style.opacity = String(ease((up - .1) / .2));
      head.style.transform = `translateY(${(1 - ease((up - .1) / .25)) * 50}px) scale(${.92 + .08 * ease((up - .1) / .25)})`;
      // 2 · stars gather into the years of a life
      const W = innerWidth, H = innerHeight;
      dots.forEach((o) => {
        const k = ease((up - .26 - o.delay * .4) / .24);
        o.d.style.transform = `translate(${o.sx * W * (1 - k)}px, ${o.sy * H * (1 - k)}px) scale(${.25 + .75 * k})`;
        o.d.style.opacity = String(.25 + .75 * k);
      });
      // 3 · 26 years light up, then the statement
      const nowLit = up > .58;
      if (nowLit !== lit) { lit = nowLit; lyGrid.classList.toggle("lit", lit); }
      late.forEach((e) => { e.style.opacity = String(ease((up - .6) / .1)); });
      // 4 · the years step back; the statement takes the whole screen, word by word.
      const out = ease((up - .74) / .08);
      content.style.opacity = String(1 - out);
      content.style.transform = `scale(${1 - out * .08}) translateY(${-out * 30}px)`;
      const fp = clamp((up - .8) / .17);
      const nLit = fp * finalWords.length;
      finalWords.forEach((w, i) => w.classList.toggle("lit", i < nLit));
      uv.querySelector(".uv-final").style.opacity = String(ease((up - .76) / .06));
    };
    const uvLoop = (now) => { if (!uvOn) return; drawStars(now); requestAnimationFrame(uvLoop); };
    window.addEventListener("scroll", () => { if (uvOn) renderUv(); }, { passive: true });
    renderUv();
    if (!reduced) new IntersectionObserver(([e]) => { uvOn = e.isIntersecting; if (uvOn) { sizeCv(); renderUv(); requestAnimationFrame(uvLoop); } }, { threshold: 0 }).observe(uv);
    else drawStars(0);
  }

  // ---------- Reveals + counters ----------
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (reduced) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => { const k = clamp((t - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll("[data-count]").forEach(countUp);
    if (e.target.matches("[data-count]")) countUp(e.target);
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -12% 0px", threshold: .15 });
  document.querySelectorAll(".s3-stage, .s3x").forEach((el) => io.observe(el));
  if (!reduced) {
    document.querySelectorAll(".intro, .why-copy, .why-media, .demo-rail, .part, .pb, .cmp-scroll, .faq, .closing-copy, .closing-cta, .h2.center").forEach((el, i) => {
      el.classList.add("reveal"); el.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(el);
    });
    document.querySelectorAll(".demo-stage").forEach((el) => { el.classList.add("reveal-clip"); io.observe(el); });
  }

  // ---------- What changes: rotating outcomes ----------
  const whyItems = [...document.querySelectorAll(".why-list li")];
  if (whyItems.length) {
    const whyDetail = [...document.querySelectorAll(".why-detail > div")];
    const whyMedia = [...document.querySelectorAll(".why-media figure")];
    const timer = document.querySelector(".why-timer");
    let whyIdx = 0, whyTick = 0;
    const showWhy = (i) => {
      whyIdx = i;
      [whyItems, whyDetail, whyMedia].forEach((set) => set.forEach((el, k) => el.classList.toggle("is-active", k === i)));
      timer.classList.remove("run"); void timer.getBBox(); timer.classList.add("run");
    };
    const startWhy = () => { clearInterval(whyTick); if (!reduced) whyTick = setInterval(() => showWhy((whyIdx + 1) % whyItems.length), 5000); };
    whyItems.forEach((li, i) => li.querySelector("button").addEventListener("click", () => { showWhy(i); startWhy(); }));
    new IntersectionObserver(([e]) => { if (e.isIntersecting) { showWhy(whyIdx); startWhy(); } else clearInterval(whyTick); }, { threshold: .4 })
      .observe(document.querySelector(".why"));
  }

  // ---------- What's Droyma cards ----------
  const parts = [...document.querySelectorAll(".part")];
  parts.forEach((p) => {
    const open = () => parts.forEach((q) => q.classList.toggle("is-open", q === p));
    p.querySelector(".part-toggle").addEventListener("click", open);
    p.addEventListener("mouseenter", () => { if (matchMedia("(min-width: 900px)").matches) open(); });
  });

  // ---------- A night with Droyma: scroll-driven live demo ----------
  const night = document.getElementById("how");
  const canvas = document.getElementById("eeg");
  if (night && canvas) {
    const ctx = canvas.getContext("2d");
    const chapters = [...night.querySelectorAll(".nc")];
    const labels = [...night.querySelectorAll(".ns-labels span")];
    const fill = document.getElementById("nsFill");
    const CH = [[0, .18, "light"], [.18, .45, "deep"], [.45, .62, "rem"], [.62, .85, "deep"], [.85, 1.01, "wake"]];
    const AWAKE = { A: .14, f: 2.4, n: .34, saw: 0, mix: 1 };
    const PARAMS = { light: { A: .24, f: .9, n: .24, saw: 0, mix: .75 }, deep: { A: .8, f: .32, n: .08, saw: 0, mix: 0 }, rem: { A: .15, f: 1.6, n: .24, saw: 1, mix: .3 }, wake: { A: .12, f: 1.9, n: .22, saw: 0, mix: .9 } };
    const RATE = 120, WINDOW = 9, N = RATE * WINDOW, TAU = Math.PI * 2, TRIG = 1.05;
    const buf = new Array(N).fill(null).map(() => ({ v: 0, pulse: false }));
    const cur = { ...PARAMS.light };
    let head = 0, t = 0, phase = 0, lastPh = 0, running = false, last = 0, stage = "light", idxNow = 0, onset = 0, lastSoft = 0;
    const noise = (x) => .1 * Math.sin(x * 37.1) + .07 * Math.sin(x * 61.7 + 1.3) + .05 * Math.sin(x * 113.3 + .4);
    const size = () => { const dpr = Math.min(2, window.devicePixelRatio || 1); canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    window.addEventListener("resize", size); size();
    const sample = () => {
      t += 1 / RATE;
      // Falling asleep: a racing, busy wave calms into light sleep as the chapter plays out.
      const target = stage === "light" ? Object.fromEntries(Object.keys(AWAKE).map((key) => [key, AWAKE[key] + (PARAMS.light[key] - AWAKE[key]) * onset])) : PARAMS[stage];
      for (const key of ["A", "f", "n", "saw", "mix"]) cur[key] += (target[key] - cur[key]) * .012;
      lastPh = phase; phase = (phase + TAU * cur.f / RATE) % TAU;
      let pulse = stage === "deep" && lastPh < TRIG && phase >= TRIG;
      // Onset: a gentle, steady rhythm of soft pulses to help you settle (every 1.6 s).
      let soft = false;
      if (stage === "light" && t - lastSoft >= 1.6) { soft = true; lastSoft = t; }
      const pure = cur.saw > .5 ? (phase / TAU) * 2 - 1 : Math.sin(phase);
      const base = pure * (1 - cur.mix * .55) + cur.mix * (.45 * Math.sin(t * 9.7) + .3 * Math.sin(t * 15.3 + 1.1));
      buf[head] = { v: cur.A * base + noise(t) * cur.n * 2, pulse, soft };
      head = (head + 1) % N;
    };
    const draw = () => {
      const W = canvas.clientWidth, H = canvas.clientHeight, mid = H * .5, A = H * .36;
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "rgba(255,255,255,0)"); grad.addColorStop(.25, "rgba(255,255,255,.8)"); grad.addColorStop(1, "#fff");
      ctx.strokeStyle = grad; ctx.lineWidth = 2.6; ctx.lineJoin = "round"; ctx.beginPath();
      for (let i = 0; i < N; i++) { const s = buf[(head + i) % N]; const x = (i / (N - 1)) * W, y = mid - s.v * A; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      for (let i = 0; i < N; i++) {
        const s = buf[(head + i) % N]; if (!s.soft) continue;
        const x = (i / (N - 1)) * W, y = mid - s.v * A, age = (N - i) / RATE, fade = Math.min(1, x / (W * .25));
        ctx.fillStyle = `rgba(143,184,255,${.75 * fade})`; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill();
        if (age < 1.6) { const k = age / 1.6; ctx.strokeStyle = `rgba(143,184,255,${.45 * (1 - k)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 8 + k * 40, 0, TAU); ctx.stroke(); }
      }
      for (let i = 0; i < N; i++) {
        const s = buf[(head + i) % N]; if (!s.pulse) continue;
        const x = (i / (N - 1)) * W, y = mid - s.v * A, age = (N - i) / RATE, fade = Math.min(1, x / (W * .25));
        ctx.fillStyle = `rgba(143,184,255,${fade})`; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(143,184,255,${.18 * fade})`; ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.fill();
        if (age < 1.6) { const k = age / 1.6; ctx.strokeStyle = `rgba(143,184,255,${.7 * (1 - k)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 10 + k * 70, 0, TAU); ctx.stroke(); }
      }
      const hv = buf[(head + N - 1) % N].v; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(W - 6, mid - hv * A, 4.5, 0, TAU); ctx.fill();
    };
    const setProgress = (p) => {
      const idx = Math.max(0, CH.findIndex(([a, b]) => p >= a && p < b));
      stage = CH[idx][2];
      onset = idx === 0 ? clamp(p / CH[0][1]) : 1;
      if (idx !== idxNow) { idxNow = idx; chapters.forEach((c, i) => c.classList.toggle("is-on", i === idx)); labels.forEach((l, i) => l.classList.toggle("is-on", i === idx)); }
      fill.style.width = `${p * 100}%`;
    };
    const fromScroll = () => { const r = night.getBoundingClientRect(); setProgress(clamp(-r.top / Math.max(1, night.offsetHeight - vh()))); };
    window.addEventListener("scroll", () => { if (running) fromScroll(); }, { passive: true });
    const loop = (now) => {
      if (!running) return;
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
      for (let k2 = 0; k2 < Math.round(dt * RATE); k2++) sample();
      draw(); requestAnimationFrame(loop);
    };
    for (let i = 0; i < N; i++) sample();
    setProgress(0);
    if (reduced) { stage = "deep"; for (let i = 0; i < N * 2; i++) sample(); draw(); }
    else new IntersectionObserver(([e]) => { running = e.isIntersecting; last = 0; if (running) { fromScroll(); requestAnimationFrame(loop); } }, { threshold: 0 }).observe(night);
  }

})();
