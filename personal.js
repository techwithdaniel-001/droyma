// Droyma: tailor the page to what's keeping the visitor up.
(() => {
  const P = {
    mind:   { benefit: "Designed to help a busy mind settle, so sleep comes sooner. No pill.", dq: "Won’t a sound keep me up?", da: "It’s very soft, timed to your brain, and goes quiet if you stir.", lead: "Done with lying awake?", seen: "Tired body, busy mind. It’s one of the hardest ways to spend a night, and you’re not doing anything wrong.", card: 0, why: 0, faq: "How does Droyma work, in plain words?",
              you: "For a mind that won’t switch off: Droyma is designed to help you settle sooner, without a pill.",
              close: "Built for the nights your mind won’t switch off.",
              wl: { problem: ["I can’t switch my head off"] } },
    wake:   { benefit: "Designed to keep your deep sleep deep and steady, so less wakes you and you settle back sooner.", dq: "Will it wake my partner?", da: "No. It reaches you through bone and is silent to the room.", lead: "Done with 3 AM?", seen: "3 AM, wide awake, counting the hours until the alarm. It wears you down, and you’re not doing anything wrong.", card: 1, why: 1, faq: "I’m a light sleeper. Won’t a sound wake me?",
              you: "For 3 AM wake-ups, whatever wakes you: Droyma is designed to keep your sleep deep and steady, so less wakes you and you settle back sooner.",
              close: "Built for everyone who knows 3 AM too well.",
              wl: { problem: ["I wake up in the night"] } },
    tired:  { benefit: "Designed to deepen the sleep that actually restores you, so your mornings feel different.", dq: "Is it proven?", da: "The method is backed by published sleep research. We’ll share Droyma’s own results with you first.", lead: "Done with waking up tired?", seen: "Doing everything right and still waking up tired is exhausting. You’re not imagining it.", card: 2, why: 3, faq: "Is it proven?",
              you: "For eight hours that still leave you tired: Droyma is designed to deepen the sleep that actually restores you.",
              close: "Built for mornings you actually feel rested.",
              wl: { problem: ["Tired even after 8 hours"] } },
    groggy: { benefit: "Drug-free. Nothing to take, so nothing wears off in the morning.", dq: "Can I stop melatonin?", da: "Talk to your doctor first. Droyma gives you another option to discuss.", lead: "Done with foggy mornings?", seen: "Trading a bad night for a foggy morning isn’t a fix. You deserve better than that.", card: 2, why: 3, faq: "Can I stop taking melatonin or sleep supplements?",
              you: "For mornings in a melatonin fog: Droyma is drug-free, so there’s nothing to wear off.",
              close: "Built for mornings without the fog.",
              wl: { problem: ["Groggy mornings"], tried: ["Melatonin or supplements"] } },
    ring:   { benefit: "Built to change the night, not just score it.", dq: "Is it another tracker?", da: "No. There’s no score to chase. You’ll notice it in how you feel.", lead: "Done with bad scores?", seen: "A low score every morning, and nothing you can do about it. That’s frustrating, and you’re not alone.", card: 2, why: 1, faq: "I already wear an Oura or WHOOP. Why Droyma?",
              you: "For the low score every morning: your ring tells you the night went badly. Droyma is built to change the night.",
              close: "Built to change the night, not just score it.",
              wl: { problem: ["Tired even after 8 hours"] } },
    memory: { benefit: "Deep sleep is when your brain stores the day. Timed sound has boosted overnight memory in lab studies, including adults 60 to 84.", dq: "Is it safe?", da: "Very soft sound, drug-free, and safety-tested before it ships.", lead: "Want your sharpness back?", seen: "Losing the word, the name, the thread. It’s unsettling, and sleep has a lot to do with it.", card: 2, why: 2, faq: "Is it proven?",
              you: "For a memory that feels less sharp: deep sleep is when your brain stores the day, and timed sound has boosted overnight memory in lab studies, including adults 60 to 84.",
              close: "Built for holding on to your days.",
              wl: { problem: ["Tired even after 8 hours"] } },
  };
  const KEY = "droymaPick", POPKEY = "droymaPickPop";
  const store = { get: (k, s) => { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (_) { return null; } },
                  set: (k, v, s) => { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (_) {} } };
  const cards = [...document.querySelectorAll("#problem .pb")];
  const you = document.getElementById("pbYou"), closeYou = document.getElementById("closingYou");
  const pop = document.getElementById("pickPop");
  const chipSets = [...document.querySelectorAll(".pick-chips")];
  let current = null;

  const apply = (key, { scroll = false, fromUser = false } = {}) => {
    const c = P[key]; if (!c) return;
    current = key;
    document.documentElement.dataset.pick = key;
    chipSets.forEach((set) => set.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === key))));
    cards.forEach((card, i) => card.classList.toggle("is-you", i === c.card));
    if (you) { you.textContent = c.you; you.hidden = false; }
    if (closeYou) { closeYou.textContent = c.close; closeYou.hidden = false; }
    document.querySelectorAll("[data-lead]").forEach((el) => { el.textContent = c.lead; });
    // What changes: open on their outcome.
    const whyBtn = document.querySelectorAll(".why-list li button")[c.why];
    if (whyBtn && fromUser) whyBtn.click();
    else if (whyBtn) setTimeout(() => whyBtn.click(), 0);
    // FAQ: their question first, open.
    const faqList = document.querySelector("#faq .faq > div");
    const q = [...document.querySelectorAll("#faq details")].find((d) => d.querySelector("summary").textContent.trim() === c.faq);
    if (faqList && q) {
      document.querySelectorAll("#faq details.is-you").forEach((d) => { d.classList.remove("is-you"); d.open = false; });
      faqList.prepend(q); q.classList.add("is-you"); q.open = true;
    }
    const fb = document.querySelector(".faq-toggle[aria-controls='faqMore']"), more = document.getElementById("faqMore");
    if (fb && more && more.hidden) fb.textContent = `More questions (${more.querySelectorAll("details").length})`;
    // Waitlist: start with their answer.
    document.dispatchEvent(new CustomEvent("droyma:pick", { detail: c.wl }));
    if (fromUser) store.set(KEY, key);
    if (scroll) document.getElementById("problem").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  chipSets.forEach((set) => set.querySelectorAll("button").forEach((b) => {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      const inPop = !!b.closest(".pick-pop");
      apply(b.dataset.p, { fromUser: true });
      if (inPop) showSeen(b.dataset.p);
    });
  }));

  // After a pick in the pop-up: we hear you, here's what it does for you, join right here.
  let pickedKey = null;
  const showSeen = (key) => {
    pickedKey = key;
    const card = pop.querySelector(".pick-card"), seen = document.getElementById("pickSeen"), c = P[key];
    document.getElementById("pickSeenLine").textContent = c.seen;
    document.getElementById("pickBenefit").textContent = c.benefit;
    document.getElementById("pickDoubtQ").textContent = c.dq;
    document.getElementById("pickDoubtA").textContent = c.da;
    card.classList.add("is-seen"); seen.hidden = false;
    card.scrollTop = 0;
    setTimeout(() => document.getElementById("pickEmail").focus({ preventScroll: true }), 60);
  };
  if (pop) {
    pop.querySelectorAll(".pick-later").forEach((b) => b.addEventListener("click", () => {
      hidePop();
      setTimeout(() => document.getElementById(b.closest(".pick-done") ? "what" : "problem").scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    }));
    const join = document.getElementById("pickJoin"), err = document.getElementById("pickErr");
    join.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = join.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Please enter a valid email."; err.hidden = false; join.email.focus(); return; }
      err.hidden = true;
      const btn = join.querySelector('[type="submit"]'); btn.disabled = true; btn.textContent = "Joining…";
      try {
        const c = P[pickedKey] || {};
        await window.droymaJoin({ email, problem: (c.wl && c.wl.problem || []).join("; "), tried: (c.wl && c.wl.tried || []).join("; "), source: "Trouble sleeping pop-up: " + pickedKey });
        document.getElementById("pickSeen").hidden = true; document.getElementById("pickDone").hidden = false;
      } catch (_) { err.textContent = "Something went wrong. Please try again."; err.hidden = false; }
      finally { btn.disabled = false; btn.textContent = "Get early access"; }
    });
  }
  // Gentle pop-up, once per visit; dismissable.
  const hidePop = () => { if (!pop) return; pop.classList.remove("in"); document.documentElement.classList.remove("pick-open"); setTimeout(() => { pop.hidden = true; }, 300); store.set(POPKEY, "1", true); };
  if (pop) {
    pop.querySelectorAll(".pick-x, .pick-skip, .pick-back").forEach((el) => el.addEventListener("click", hidePop));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.hidden) hidePop(); });
    const hero = document.getElementById("hero");
    const shouldPop = () => !current && !store.get(POPKEY, true) && !document.documentElement.classList.contains("wl-open");
    if (hero && shouldPop()) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting && e.boundingClientRect.top < 0 && shouldPop()) {
          pop.hidden = false; document.documentElement.classList.add("pick-open");
          requestAnimationFrame(() => pop.classList.add("in")); io.disconnect();
          setTimeout(() => { const c = pop.querySelector(".pick-card"); c.setAttribute("tabindex", "-1"); c.focus({ preventScroll: true }); }, 350);
        }
      }, { threshold: 0 });
      io.observe(hero);
    }
  }

  const saved = store.get(KEY);
  if (saved && P[saved]) apply(saved);
})();
