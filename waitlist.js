// Droyma waitlist: three short questions, then email. Replaces the external form.
(() => {
  // Where sign-ups are sent. Set to a form endpoint (e.g. https://formsubmit.co/ajax/<address>).
  // Until it's set, buttons keep opening the Tally form directly, so no sign-up is lost.
  const ENDPOINT = "";
  const TALLY = "https://tally.so/r/q4xPo5";

  const wl = document.getElementById("wl"), form = document.getElementById("wlForm");
  if (!wl || !ENDPOINT) return;
  const steps = [...wl.querySelectorAll(".wl-step")], prog = [...wl.querySelectorAll(".wl-prog i")];
  const picked = { problem: new Set(), tried: new Set() };
  let step = 1, lastFocus = null;

  const show = (n) => {
    step = n;
    steps.forEach((s) => s.classList.toggle("is-on", +s.dataset.step === n));
    prog.forEach((p, i) => p.classList.toggle("on", i < n));
    wl.classList.toggle("is-done", n === 4);
    const first = steps[n - 1].querySelector("button:not([disabled]), input");
    if (first) setTimeout(() => (n === 3 ? form.email : first).focus({ preventScroll: true }), 60);
  };
  const open = (e) => {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    wl.hidden = false; document.documentElement.classList.add("wl-open");
    requestAnimationFrame(() => wl.classList.add("in"));
    show(step === 4 ? 4 : step);
  };
  const close = () => {
    wl.classList.remove("in"); document.documentElement.classList.remove("wl-open");
    setTimeout(() => { wl.hidden = true; }, 250);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };

  document.querySelectorAll("[data-waitlist]").forEach((a) => {
    a.removeAttribute("target");
    a.addEventListener("click", open);
  });
  wl.querySelectorAll("[data-wl-close]").forEach((b) => b.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !wl.hidden) close(); });

  wl.querySelectorAll(".wl-chips").forEach((group) => {
    const set = picked[group.dataset.name], next = group.closest(".wl-step").querySelector(".wl-next");
    group.querySelectorAll("button").forEach((b) => {
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => {
        const t = b.textContent.trim(), on = !set.has(t);
        if (t === "Nothing yet" && on) { set.clear(); group.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false")); }
        else if (on) { set.delete("Nothing yet"); const n = [...group.querySelectorAll("button")].find((x) => x.textContent.trim() === "Nothing yet"); if (n) n.setAttribute("aria-pressed", "false"); }
        on ? set.add(t) : set.delete(t);
        b.setAttribute("aria-pressed", String(on));
        next.disabled = set.size === 0;
      });
    });
  });
  wl.querySelectorAll(".wl-next").forEach((b) => b.addEventListener("click", () => {
    if (step === 2) echo();
    show(step + 1);
  }));
  wl.querySelectorAll(".wl-back-btn").forEach((b) => b.addEventListener("click", () => show(step - 1)));

  // Speak back to their problem.
  const LINES = {
    "I can’t switch my head off": "a mind that won’t switch off",
    "I wake up in the night": "waking up in the night",
    "Tired even after 8 hours": "eight hours that still leave you tired",
    "Groggy mornings": "groggy mornings",
    "I’m a light sleeper": "sleep that breaks at every sound",
    "Short or broken nights (kids, travel, work)": "short, broken nights",
  };
  const echo = () => {
    const p = [...picked.problem].map((x) => LINES[x] || x.toLowerCase());
    const list = p.length > 1 ? `${p.slice(0, -1).join(", ")} and ${p[p.length - 1]}` : p[0];
    const tried = [...picked.tried].filter((x) => x !== "Nothing yet");
    document.getElementById("wlEcho").textContent = tried.length
      ? `You’ve tried ${tried.length === 1 ? "something" : "a few things"} already. Droyma is being built to help with ${list}.`
      : `Droyma is being built to help with ${list}.`;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("wlErr");
    const email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Please enter a valid email."; err.hidden = false; form.email.focus(); return; }
    err.hidden = true;
    const data = { email, name: form.name.value.trim(), problem: [...picked.problem].join("; "), tried: [...picked.tried].join("; "), page: location.href };
    const btn = form.querySelector('[type="submit"]'); btn.disabled = true; btn.textContent = "Joining…";
    try {
      if (ENDPOINT) {
        const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...data, _subject: "New Droyma waitlist sign-up" }) });
        if (!r.ok) throw new Error(String(r.status));
      } else {
        window.open(`${TALLY}?${new URLSearchParams(data)}`, "_blank", "noopener");
      }
      show(4);
    } catch (_) {
      err.textContent = "Something went wrong. Please try again."; err.hidden = false;
    } finally { btn.disabled = false; btn.textContent = "Get early access"; }
  });

  document.getElementById("wlShare").addEventListener("click", async (e) => {
    const url = location.origin + location.pathname;
    try { await navigator.clipboard.writeText(url); e.target.textContent = "Link copied"; }
    catch (_) { e.target.textContent = url; }
  });
})();
