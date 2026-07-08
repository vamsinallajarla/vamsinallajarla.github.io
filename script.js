/* ═══ Portfolio interactions ═══ */
// Mark JS as active — .reveal elements are only hidden when this class is present,
// so content can never be permanently invisible if the script fails to load.
document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── 2. Scroll reveal ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
setTimeout(() => document.querySelectorAll(".reveal:not(.in)").forEach(el => {
  const r = el.getBoundingClientRect();
  if (r.top < innerHeight && r.bottom > 0) el.classList.add("in");
}), 1500);
window.addEventListener("scroll", () => {   // belt-and-braces reveal on scroll
  document.querySelectorAll(".reveal:not(.in)").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.95) el.classList.add("in");
  });
}, { passive: true });

/* ── 3. Skill meters fill when visible ── */
const meterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const m = e.target;
      m.style.setProperty("--w", m.dataset.level + "%");
      m.classList.add("filled");
      meterObserver.unobserve(m);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll(".meter").forEach(m => meterObserver.observe(m));

/* ── 4. tmux status bar: clock, uptime, current section ── */
const sbClock = document.getElementById("sbClock");
const sbUptime = document.getElementById("sbUptime");
const sbSection = document.getElementById("sbSection");
const t0 = Date.now();

function tick() {
  const now = new Date();
  sbClock.textContent = now.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const s = Math.floor((Date.now() - t0) / 1000);
  const m = Math.floor(s / 60);
  sbUptime.textContent = m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
tick();
setInterval(tick, 1000);

const sectionNames = { top: "hero", about: "about", skills: "skills", experience: "experience", projects: "projects", certs: "certs", contact: "contact" };
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) sbSection.textContent = "§ " + (sectionNames[e.target.id] || e.target.id);
  });
}, { threshold: 0.35 });
document.querySelectorAll("section[id], header[id]").forEach(s => sectionObserver.observe(s));

/* ── 5. Project card cursor glow ── */
document.querySelectorAll(".proj-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  });
});

/* ── 6. Mobile nav ── */
const burger = document.querySelector(".nav-burger");
const navLinks = document.querySelector(".nav-links");
burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  })
);

/* ═══ HERO: server-console typing — prompt, then name ═══ */
(function typeName() {
  const name = document.getElementById("heroName");
  const promptEl = document.getElementById("heroPrompt");
  if (!name || !promptEl) return;

  const PROMPT_HTML = '<span class="hp-user">vamsi@infra</span>:<span class="hp-path">~</span>$ <span class="hp-cmd">whoami</span>';
  const PROMPT_TXT = "vamsi@infra:~$ whoami";
  const lines = [...name.querySelectorAll(".name-line")];
  const texts = lines.map(l => l.textContent);
  lines.forEach(l => l.textContent = "");

  if (reduceMotion) {
    promptEl.innerHTML = PROMPT_HTML;
    lines.forEach((l, i) => l.textContent = texts[i]);
    return;
  }

  const caret = document.createElement("span");
  caret.className = "type-caret";

  // phase 1: type the shell command
  promptEl.appendChild(caret);
  let pi = 0;
  function typePrompt() {
    if (pi < PROMPT_TXT.length) {
      caret.before(document.createTextNode(PROMPT_TXT[pi++]));
      setTimeout(typePrompt, 45 + Math.random() * 45);
    } else {
      setTimeout(() => {
        promptEl.innerHTML = PROMPT_HTML;      // swap in colorized prompt
        lines[0].appendChild(caret);           // move caret to the "output"
        setTimeout(typeLine, 220);
      }, 320);                                 // brief pause = command "executes"
    }
  }

  // phase 2: type the name as command output
  let li = 0, ci = 0;
  function typeLine() {
    const text = texts[li];
    if (ci < text.length) {
      caret.before(document.createTextNode(text[ci++]));
      setTimeout(typeLine, 70 + Math.random() * 60);
    } else if (li < lines.length - 1) {
      li++; ci = 0;
      lines[li].appendChild(caret);
      setTimeout(typeLine, 260);
    } else {
      setTimeout(() => caret.classList.add("done"), 2400);
    }
  }

  setTimeout(typePrompt, 420);
})();

/* ═══ BACKGROUND: data center — racks, clouds, uplink streams ═══ */
(function dataCenterBG() {
  const cv = document.getElementById("bgNet");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  if (!ctx) return;

  const C = { cyan:"#22D3EE", green:"#4ADE80", amber:"#FBBF24", magenta:"#E879F9", line:"#2A3A55" };
  let W, H, dpr, racks = [], clouds = [], streams = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
  }

  function layout() {
    // ── server racks along the bottom ──
    const n = Math.max(3, Math.min(6, Math.floor(W / 260)));
    const rackW = 118, rackH = 190, gap = (W - n * rackW) / (n + 1);
    racks = [];
    for (let i = 0; i < n; i++) {
      const x = gap + i * (rackW + gap);
      const y = H - rackH - 26;
      const units = 8, leds = [];
      for (let u = 0; u < units; u++) {
        for (let l = 0; l < 3; l++) {
          const r = Math.random();
          leds.push({
            x: x + 12 + l * 11,
            y: y + 16 + u * ((rackH - 26) / units),
            color: r < .82 ? C.green : r < .94 ? C.amber : C.magenta,
            phase: Math.random() * 6.28,
            speed: 1.5 + Math.random() * 3.5,
          });
        }
      }
      racks.push({ x, y, w: rackW, h: rackH, units, leds });
    }

    // ── clouds drifting across the top ──
    clouds = [];
    const cn = Math.max(2, Math.min(4, Math.floor(W / 420)));
    for (let i = 0; i < cn; i++) {
      clouds.push({
        x: (W / cn) * i + Math.random() * 120,
        y: 60 + Math.random() * (H * 0.16),
        s: .8 + Math.random() * .7,               // scale
        v: .12 + Math.random() * .18,             // drift speed
        color: i % 2 ? C.magenta : C.cyan,
      });
    }

    // ── uplink streams: rack → cloud bezier paths with packets ──
    streams = [];
    racks.forEach((r, i) => {
      const cl = clouds[i % clouds.length];
      const s = {
        rack: r, cloud: cl,
        cx: (r.x + r.w / 2 + cl.x) / 2 + (Math.random() - .5) * 160,  // control pt
        cy: H * 0.5 + (Math.random() - .5) * 80,
        packets: [],
      };
      const count = 2 + Math.floor(Math.random() * 2);
      for (let p = 0; p < count; p++) {
        s.packets.push({ t: Math.random(), v: .0018 + Math.random() * .0028, up: Math.random() > .35 });
      }
      streams.push(s);
    });
  }

  function bez(s, t) {   // quadratic bezier point rack-top → cloud
    const x0 = s.rack.x + s.rack.w / 2, y0 = s.rack.y;
    const x2 = s.cloud.x, y2 = s.cloud.y + 22 * s.cloud.s;
    const u = 1 - t;
    return {
      x: u * u * x0 + 2 * u * t * s.cx + t * t * x2,
      y: u * u * y0 + 2 * u * t * s.cy + t * t * y2,
    };
  }

  function drawCloud(c) {
    ctx.save();
    ctx.translate(c.x, c.y); ctx.scale(c.s, c.s);
    ctx.beginPath();
    ctx.arc(-26, 0, 20, Math.PI * .5, Math.PI * 1.5);
    ctx.arc(-6, -14, 18, Math.PI, Math.PI * 1.9);
    ctx.arc(18, -8, 15, Math.PI * 1.2, Math.PI * 2);
    ctx.arc(26, 4, 14, Math.PI * 1.5, Math.PI * .5);
    ctx.closePath();
    ctx.strokeStyle = c.color; ctx.globalAlpha = .28; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.globalAlpha = .05; ctx.fillStyle = c.color; ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function drawRack(r, t) {
    // cabinet
    ctx.strokeStyle = "#39465E"; ctx.globalAlpha = .5; ctx.lineWidth = 1.4;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    // unit slats
    ctx.globalAlpha = .3; ctx.lineWidth = 1;
    const uh = (r.h - 26) / r.units;
    for (let u = 1; u <= r.units; u++) {
      const y = r.y + 8 + u * uh;
      ctx.beginPath(); ctx.moveTo(r.x + 6, y); ctx.lineTo(r.x + r.w - 6, y); ctx.stroke();
    }
    // vent lines on right side of each unit
    ctx.globalAlpha = .18;
    for (let u = 0; u < r.units; u++) {
      const y = r.y + 16 + u * uh;
      for (let v = 0; v < 3; v++) {
        ctx.beginPath();
        ctx.moveTo(r.x + r.w - 44 + v * 12, y - 3);
        ctx.lineTo(r.x + r.w - 36 + v * 12, y - 3);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    // blinking LEDs
    for (const led of r.leds) {
      const on = Math.sin(t * led.speed + led.phase) > 0.15;
      ctx.beginPath(); ctx.arc(led.x, led.y, 1.9, 0, 7);
      ctx.fillStyle = led.color;
      ctx.globalAlpha = on ? .85 : .12;
      if (on) { ctx.shadowColor = led.color; ctx.shadowBlur = 6; }
      ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    // floor glow
    ctx.beginPath();
    ctx.moveTo(r.x - 8, r.y + r.h + 10); ctx.lineTo(r.x + r.w + 8, r.y + r.h + 10);
    ctx.strokeStyle = C.cyan; ctx.globalAlpha = .1; ctx.stroke(); ctx.globalAlpha = 1;
  }

  let dashOff = 0;
  function frame(now) {
    const t = now / 1000;
    ctx.clearRect(0, 0, W, H);

    // LAN links between adjacent racks (animated dashes)
    dashOff -= .35;
    ctx.setLineDash([5, 7]); ctx.lineDashOffset = dashOff;
    ctx.strokeStyle = C.cyan; ctx.globalAlpha = .16; ctx.lineWidth = 1;
    for (let i = 0; i < racks.length - 1; i++) {
      const a = racks[i], b = racks[i + 1];
      const y = a.y + a.h - 14;
      ctx.beginPath(); ctx.moveTo(a.x + a.w, y); ctx.lineTo(b.x, y); ctx.stroke();
    }
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // clouds drift
    for (const c of clouds) {
      c.x += c.v;
      if (c.x - 80 * c.s > W) c.x = -90 * c.s;
      drawCloud(c);
    }

    // uplink curves + packets
    for (const s of streams) {
      ctx.beginPath();
      const p0 = bez(s, 0);
      ctx.moveTo(p0.x, p0.y);
      for (let k = 1; k <= 24; k++) { const p = bez(s, k / 24); ctx.lineTo(p.x, p.y); }
      ctx.strokeStyle = C.cyan; ctx.globalAlpha = .08; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;

      for (const pk of s.packets) {
        pk.t += pk.up ? pk.v : -pk.v;
        if (pk.t > 1) { pk.t = 1; pk.up = false; }
        if (pk.t < 0) { pk.t = 0; pk.up = true; }
        const p = bez(s, pk.t);
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.1, 0, 7);
        ctx.fillStyle = pk.up ? C.green : C.amber;   // upload green, download amber
        ctx.globalAlpha = .8; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 7;
        ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      }
    }

    // racks last (on top of LAN line ends)
    for (const r of racks) drawRack(r, t);

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  if (reduceMotion) frame(0);
  else requestAnimationFrame(frame);
})();


/* ═══ 3D TILT on project + skill cards ═══ */
if (!reduceMotion) {
  document.querySelectorAll(".proj-card, .skill-group, .neofetch").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `translateY(-5px) perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}