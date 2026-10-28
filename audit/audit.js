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
    let seen = false; try { seen = localStorage.getItem("droymaIntroSeen") === "1"; localStorage.setItem("droymaIntroSeen", "1"); } catch (e) {}
    if (reduced || seen) intro.remove();
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
        setTimeout(finish, 2200);
      });
      document.readyState === "complete" ? start() : window.addEventListener("load", start, { once: true });
      setTimeout(() => { if (!intro.classList.contains("go")) start(); }, 2500);
      ["click", "keydown", "wheel", "touchstart"].forEach((ev) => window.addEventListener(ev, finish, { once: true, passive: true }));
    }
  }

  document.querySelectorAll("[data-waitlist]").forEach((a) => { a.href = WAITLIST; a.target = "_blank"; a.rel = "noreferrer"; });

  // ---------- Scroll-driven scenes (one rAF loop) ----------
  const nav = document.getElementById("nav");
  const heroStage = document.querySelector(".hero-stage");
  const heroCopy = document.querySelector(".hero-copy");
  const wornFrame = document.querySelector("[data-zoom]");
  const read = document.querySelector(".read");
  const story = document.getElementById("story") || document.createElement("section");
  const finalImg = document.querySelector("[data-parallax]");
  const closingProduct = document.querySelector(".closing-product");
  const darkSections = [...document.querySelectorAll(".worn-scene, .night, .uv-portal, .scores3, .section.black, .section.navy, .story, .final")];

  // Split the statement into words (if the page has one).
  const words = read ? read.dataset.read.split(" ").map((w) => {
    const s = document.createElement("span"); s.className = "w"; s.textContent = w; return s;
  }) : [];
  if (read) { read.setAttribute("aria-label", read.dataset.read); words.forEach((s) => { read.append(s, " "); }); }

  // Story steps.
  const storyMedia = [...story.querySelectorAll(".story-media > figure")];
  const storyCopy = [...story.querySelectorAll(".story-copy > div")];
  const storyDots = [...story.querySelectorAll(".story-progress i")];
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
      heroStage.style.transform = `translateY(${p * 120}px) scale(${1 - p * .12})`;
      heroStage.style.opacity = String(1 - p * .9);
      heroCopy.style.transform = `translateY(${p * 60}px)`;
      heroCopy.style.opacity = String(1 - p * 1.3);

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
    const sr = story.getBoundingClientRect();
    const sp = clamp(-sr.top / (story.offsetHeight - h));
    setStory(sp < .5 ? 0 : 1);
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

  // ---------- Mobile menu ----------
  const menuBtn = document.getElementById("menuBtn"), menuPanel = document.getElementById("menuPanel");
  if (menuBtn) {
    const setMenu = (open) => { menuPanel.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.textContent = open ? "Close" : "Menu"; };
    menuBtn.addEventListener("click", () => setMenu(menuPanel.hidden));
    menuPanel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
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
    document.querySelectorAll(".intro, .why-copy, .why-media, .demo-rail, .part, .faq, .closing-copy, .closing-cta, .h2.center").forEach((el, i) => {
      el.classList.add("reveal"); el.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(el);
    });
    document.querySelectorAll(".demo-stage").forEach((el) => { el.classList.add("reveal-clip"); io.observe(el); });
  }

  // ---------- Scores: centred carousel ----------
  const s3 = [...document.querySelectorAll(".s3-card")];
  if (s3.length) {
    const dots = [...document.querySelectorAll(".s3-dots i")];
    let cur = 0, s3Timer = 0;
    const place = () => s3.forEach((c, i) => {
      let d = i - cur; if (d > 1) d -= s3.length; if (d < -1) d += s3.length;
      c.dataset.pos = d === 0 ? "center" : d < 0 ? "left" : "right";
      dots.forEach((dot, k) => dot.classList.toggle("is-on", k === cur));
    });
    const go = (n) => { cur = (n + s3.length) % s3.length; place(); };
    document.querySelectorAll(".s3-nav .round").forEach((b) => b.addEventListener("click", () => { clearInterval(s3Timer); go(cur + Number(b.dataset.dir)); }));
    s3.forEach((c, i) => c.addEventListener("click", () => { clearInterval(s3Timer); go(i); }));
    place();
    if (!reduced) {
      new IntersectionObserver(([e]) => { clearInterval(s3Timer); if (e.isIntersecting) s3Timer = setInterval(() => go(cur + 1), 4500); }, { threshold: .4 })
        .observe(document.querySelector(".s3-stage"));
    }
  }

  // ---------- Learns you: night 1 → 30 ----------
  const range = document.getElementById("nightRange");
  if (range) {
    const lerp3 = (n, a, b, c) => n <= 7 ? a + (b - a) * (n - 1) / 6 : b + (c - b) * (n - 7) / 23;
    const marks = document.getElementById("lpMarks");
    const peaks = [50, 150, 250, 350, 450, 550];
    const jitterSign = [1, -1, 1, 1, -1, 1];
    const NS = "http://www.w3.org/2000/svg";
    const dots = peaks.map(() => { const g = document.createElementNS(NS, "g"); g.innerHTML = '<line y1="0" y2="160"/><circle r="6"/>'; marks.append(g); return g; });
    const picks = [...document.querySelectorAll(".night-picker button")];
    const el = (id) => document.getElementById(id);
    const render = (n) => {
      const score = Math.round(lerp3(n, 72, 84, 91));
      const vol = Math.round(lerp3(n, 60, 44, 36));
      const stims = Math.round(lerp3(n, 180, 214, 241));
      const offset = Math.round(lerp3(n, 0, 12, 18));
      const jitter = lerp3(n, 22, 9, 0);
      const mins = 41 + offset, hh = mins >= 60 ? 11 : 10, mm = String(mins % 60).padStart(2, "0");
      el("lpNight").textContent = `Night ${n}`;
      el("lpTag").textContent = n < 4 ? "Getting to know you" : n < 15 ? "Softer, a little later" : "Tuned to you";
      el("lpStart").textContent = `${hh}:${mm} PM`;
      el("lpVolTxt").textContent = `${vol}%`;
      el("lpVol").style.width = `${vol}%`;
      el("lpStims").textContent = String(stims);
      el("lpScore").textContent = String(score);
      el("lpArc").style.strokeDashoffset = String(213.6 - 213.6 * score / 100);
      // Stimulation markers drift onto the rising edge of each wave as Droyma learns you.
      dots.forEach((g, i) => {
        const x = peaks[i] - 14 + jitter * jitterSign[i];
        g.setAttribute("transform", `translate(${x} 0)`);
        const c = g.querySelector("circle"); c.setAttribute("cy", String(80 - 60 * Math.cos(2 * Math.PI * (x - 50) / 100)));
        c.setAttribute("r", String(3 + vol / 12));
      });
      picks.forEach((b) => b.classList.toggle("is-on", Number(b.dataset.n) === n));
      // The next morning's scores improve as Droyma tunes in.
      const loadAm = Math.round(lerp3(n, 40, 31, 24)), charge = Math.round(lerp3(n, 64, 78, 86));
      el("msLoad").textContent = String(loadAm);
      const endY = 8 + (78 - loadAm) / 78 * 52 * 1.05;
      const d = `M0 8 C60 8 90 ${8 + (endY - 8) * .35} 130 ${8 + (endY - 8) * .8} S190 ${endY} 200 ${endY}`;
      el("mrFallLine").setAttribute("d", d);
      el("mrFallArea").setAttribute("d", `${d} L200 60 L0 60 Z`);
      el("mrFallEnd").setAttribute("cx", "200"); el("mrFallEnd").setAttribute("cy", String(endY));
      el("msSleep").textContent = String(score);
      el("mrSleepArc").style.strokeDashoffset = String(207.3 - 207.3 * score / 100);
      el("msCharge").textContent = String(charge);
      [...el("mrCells").children].forEach((c, ci) => c.classList.toggle("on", ci < Math.round(charge / 10)));
      el("mrNight").textContent = `After night ${n}`;
    };
    let autoplay = 0;
    const stopAuto = () => clearInterval(autoplay);
    range.addEventListener("input", () => { stopAuto(); render(Number(range.value)); });
    picks.forEach((b) => b.addEventListener("click", () => { stopAuto(); range.value = b.dataset.n; render(Number(b.dataset.n)); }));
    render(1);
    if (!reduced) {
      let played = false;
      new IntersectionObserver(([e]) => {
        if (!e.isIntersecting || played) return;
        played = true; let n = 1;
        autoplay = setInterval(() => { n++; range.value = n; render(n); if (n >= 30) stopAuto(); }, 90);
      }, { threshold: .5 }).observe(document.querySelector(".learn-panel"));
    }
  }

  // ---------- Why Droyma: rotating reasons ----------
  const whyItems = [...document.querySelectorAll(".why-list li")];
  if (whyItems.length) {
    const whyDetail = [...document.querySelectorAll(".why-detail > div")];
    const whyMedia = [...document.querySelectorAll(".why-media figure")];
    const timer = document.querySelector(".why-timer");
    let whyIdx = 0, whyTick = 0;
    const showWhy = (i) => {
      whyIdx = i;
      [whyItems, whyDetail, whyMedia].forEach((set) => set.forEach((el, k) => el.classList.toggle("is-active", k === i)));
      whyItems.forEach((li, k) => { const b = li.querySelector("button"); if (k === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
      timer.classList.remove("run"); void timer.getBBox(); timer.classList.add("run");
    };
    const startWhy = () => { clearInterval(whyTick); if (!reduced) whyTick = setInterval(() => showWhy((whyIdx + 1) % whyItems.length), 5000); };
    let whyPaused = false;
    whyItems.forEach((li, i) => li.querySelector("button").addEventListener("click", () => { showWhy(i); whyPaused = true; clearInterval(whyTick); }));
    const whyBox = document.querySelector(".why-copy");
    whyBox.addEventListener("mouseenter", () => clearInterval(whyTick));
    whyBox.addEventListener("focusin", () => clearInterval(whyTick));
    whyBox.addEventListener("mouseleave", () => { if (!whyPaused) startWhy(); });
    new IntersectionObserver(([e]) => { if (e.isIntersecting) { showWhy(whyIdx); startWhy(); } else clearInterval(whyTick); }, { threshold: .4 })
      .observe(document.querySelector(".why"));
  }

  // ---------- What's Droyma cards ----------
  const parts = [...document.querySelectorAll(".part")];
  parts.forEach((p) => {
    const open = () => parts.forEach((q) => {
      const isOpen = q === p; q.classList.toggle("is-open", isOpen);
      const t = q.querySelector(".part-toggle"); t.setAttribute("aria-expanded", String(isOpen)); t.setAttribute("aria-label", isOpen ? "Showing details" : "Show details");
    });
    const tg = p.querySelector(".part-toggle");
    p.addEventListener("click", open);
    tg.addEventListener("click", (e) => { e.stopPropagation(); open(); });
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
    const CH = [[0, .3, "light"], [.3, .72, "deep"], [.72, 1.01, "wake"]];
    const nResult = document.getElementById("nResult");
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
      if (nResult) nResult.classList.toggle("is-on", p > .8);
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

  // ---------- It gets better every night: scroll plays the first month ----------
  const l2 = document.getElementById("l2Bars");
  if (l2) {
    const lerpN = (n, a, b, c) => n <= 7 ? a + (b - a) * (n - 1) / 6 : b + (c - b) * (n - 7) / 23;
    const vals = [], bars = [];
    for (let n = 1; n <= 30; n++) {
      const wobble = [0, -2, 1, -1, 2, 0, -1, 1, -2, 1][n % 10];
      vals.push(n === 1 ? 72 : n === 30 ? 91 : Math.round(lerpN(n, 72, 84, 91) + wobble));
      const b = document.createElement("i"); b.style.setProperty("--h", `${(vals[n - 1] - 55) / 40 * 100}%`); l2.append(b); bars.push(b);
    }
    const chart = document.getElementById("l2Chart"), tip = document.getElementById("l2Tip");
    const g = (id) => document.getElementById(id);
    let lastN = 0;
    const playMonth = () => {
      const r = chart.getBoundingClientRect(), H = vh();
      const pr = reduced ? 1 : clamp((H * .82 - r.top) / (H * .62));
      const n = Math.max(1, Math.ceil(pr * 30));
      if (n === lastN) return; lastN = n;
      bars.forEach((b, i) => { b.classList.toggle("on", i < n); b.classList.toggle("cur", i === n - 1); });
      tip.style.left = `${(n - .5) / 30 * 100}%`;
      tip.style.bottom = `${(vals[n - 1] - 55) / 40 * 100}%`;
      g("l2TipN").textContent = `Night ${n}`; g("l2TipV").textContent = String(vals[n - 1]);
      g("l2S").textContent = String(vals[n - 1]);
      if (g("l2L")) g("l2L").textContent = String(Math.round(lerpN(n, 40, 31, 24)));
      g("l2C").textContent = String(Math.round(lerpN(n, 64, 78, 86)));
    };
    window.addEventListener("scroll", playMonth, { passive: true });
    window.addEventListener("resize", () => { lastN = 0; playMonth(); });
    playMonth();
  }
})();
