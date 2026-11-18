// ================= SETUP =================
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmt = n => n.toLocaleString("en-US");

// ================= THIS YEAR, AS AN LED PANEL =================
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const today = new Date().toISOString().slice(0, 10);
const YEAR = new Date().getFullYear();
const graph = document.getElementById("graph");
document.getElementById("panel-year").textContent = YEAR;

function describe(day) {
  const [y, m, d] = day.date.split("-").map(Number);
  const n = day.count;
  return `${n === 0 ? "No" : n} contribution${n === 1 ? "" : "s"} on ${MONTHS[m - 1]} ${d}, ${y}`;
}

function drawYear(byDate) {
  graph.textContent = "";
  const offset = new Date(Date.UTC(YEAR, 0, 1)).getUTCDay();
  for (let i = 0; i < offset; i++) {
    const pad = document.createElement("span");
    pad.className = "cell pad";
    graph.appendChild(pad);
  }
  let slot = offset;
  for (let d = new Date(Date.UTC(YEAR, 0, 1)); d.getUTCFullYear() === YEAR; d.setUTCDate(d.getUTCDate() + 1), slot++) {
    const date = d.toISOString().slice(0, 10);
    const day = byDate.get(date) || { date, count: 0, level: 0 };
    const el = document.createElement("span");
    el.className = `cell l${day.level}${date > today ? " future" : ""}`;
    // light the panel left to right, a column at a time
    el.style.setProperty("--i", Math.floor(slot / 7));
    el.dataset.tip = describe(day);
    graph.appendChild(el);
  }
}

async function loadContributionGraph() {
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/js802025?y=${YEAR}`);
    if (!response.ok) throw new Error(response.status);
    const data = await response.json();
    drawYear(new Map(data.contributions.map(d => [d.date, d])));
    if (data.total[YEAR] !== undefined) document.getElementById("panel-total").textContent = fmt(data.total[YEAR]);
  } catch (error) {
    console.error("Failed to load contribution graph:", error);
  }
  requestAnimationFrame(() => graph.classList.add("lit"));
}
drawYear(new Map());

// Hover a dot to read its day
const tip = document.createElement("div");
tip.className = "tip";
tip.setAttribute("aria-hidden", "true");
const panel = document.querySelector(".panel");
panel.appendChild(tip);
function showTip(e) {
  const c = e.target.closest(".cell[data-tip]");
  if (!c) { tip.classList.remove("show"); return; }
  const box = panel.getBoundingClientRect();
  const r = c.getBoundingClientRect();
  tip.textContent = c.dataset.tip;
  tip.style.left = clamp(r.left + r.width / 2 - box.left, 130, box.width - 130) + "px";
  tip.style.top = (r.top - box.top) + "px";
  tip.classList.add("show");
}
graph.addEventListener("pointerover", showTip);
graph.addEventListener("pointerdown", showTip);
graph.addEventListener("pointerleave", () => tip.classList.remove("show"));

// ================= BOARD REFRESH =================
// Each row's text cycles through the board's character set, then settles, top row first
const FLAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.";
function flap(el, delay) {
  const final = el.textContent;
  const start = performance.now() + delay;
  const settleAt = k => 260 + k * 38;
  const tick = now => {
    const t = now - start;
    if (t < 0) { requestAnimationFrame(tick); return; }
    let out = "", done = true;
    for (let k = 0; k < final.length; k++) {
      const ch = final[k];
      if (ch === " " || t >= settleAt(k)) out += ch;
      else { out += FLAP[(Math.random() * FLAP.length) | 0]; done = false; }
    }
    el.textContent = out;
    if (!done) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function refreshBoard() {
  if (reduceMotion) return;
  document.querySelectorAll(".row").forEach((row, r) => {
    row.querySelectorAll("[data-flap]").forEach(el => flap(el, r * 90));
  });
}
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    refreshBoard();
    obs.disconnect();
  }, { threshold: 0.2 }).observe(document.getElementById("board"));
}

// ================= TECH TOWER, LED DOTS TO PHOTO =================
// The tower arrives like a board updating: chat-coloured LED dots sweep on row by row,
// shrink as you scroll, warm into the photo's own colour, then the photo takes over.
const towerImg = document.querySelector(".contact-bg");
const towerCanvas = document.querySelector(".contact-dots");
const towerCtx = towerCanvas.getContext("2d");
const towerSmall = document.createElement("canvas");
let towerKey = "";
const UNLIT = [36, 29, 16];

// Minecraft chat colours, picked by hue, so even a dusky photo comes out loud: a full-colour LED board
const HUES = [
  [0, [255, 85, 85], [170, 0, 0]], [35, [255, 170, 0], [170, 0, 0]], [58, [255, 255, 85], [255, 170, 0]],
  [120, [85, 255, 85], [0, 170, 0]], [180, [85, 255, 255], [0, 170, 170]], [235, [85, 85, 255], [0, 0, 170]],
  [300, [255, 85, 255], [170, 0, 170]], [360, [255, 85, 85], [170, 0, 0]]
];
function chatColour(r, g, b, salt) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 510;
  if (l < 0.1) return salt < 0.85 ? [0, 0, 0] : [85, 85, 85];
  let h = 0;
  if (max !== min) {
    const d = max - min;
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const [, bright, dim] = HUES.reduce((best, c) => Math.abs(c[0] - h) < Math.abs(best[0] - h) ? c : best);
  if (l > 0.8) return [255, 255, 255];
  return l > 0.42 || salt > 0.7 ? bright : dim;
}

function drawTower(force = false) {
  if (reduceMotion || !towerImg.complete || !towerImg.naturalWidth) { towerCanvas.classList.add("done"); return; }
  const r = towerCanvas.getBoundingClientRect();
  const vh = window.innerHeight;
  if (r.top > vh) return;
  if (r.bottom < 0) { towerCanvas.classList.add("done"); towerKey = "done"; return; }
  const p = clamp((vh - r.top) / (vh * 0.9), 0, 1);
  const done = p >= 0.97;
  towerCanvas.classList.toggle("done", done);
  if (done) { towerKey = "done"; return; }

  const sweep = clamp(p / 0.35, 0, 1);                       // rows lit so far
  const pitch = Math.round(6 + 26 * Math.pow(1 - clamp((p - 0.25) / 0.6, 0, 1), 1.3)); // 32px down to 6px
  const warm = clamp((p - 0.45) / 0.45, 0, 1) ** 1.4;         // amber to true colour
  const key = `${pitch}:${Math.round(sweep * 40)}:${Math.round(warm * 24)}`;
  if (key === towerKey && !force) return;
  towerKey = key;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = Math.round(r.width), ch = Math.round(r.height);
  if (towerCanvas.width !== cw * dpr || towerCanvas.height !== ch * dpr) {
    towerCanvas.width = cw * dpr; towerCanvas.height = ch * dpr;
  }
  towerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // same crop as object-fit: cover at 60% 40%
  const iw = towerImg.naturalWidth, ih = towerImg.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih);
  const sw = cw / scale, sh = ch / scale;
  const sx = (iw - sw) * 0.6, sy = (ih - sh) * 0.4;
  const cols = Math.ceil(cw / pitch), rows = Math.ceil(ch / pitch);
  towerSmall.width = cols; towerSmall.height = rows;
  const sctx = towerSmall.getContext("2d", { willReadFrequently: true });
  sctx.drawImage(towerImg, sx, sy, sw, sh, 0, 0, cols, rows);
  const px = sctx.getImageData(0, 0, cols, rows).data;

  towerCtx.fillStyle = "#000";
  towerCtx.fillRect(0, 0, cw, ch);
  const litRows = Math.ceil(rows * sweep);
  const radius = pitch * 0.42;
  const round = pitch >= 9;
  for (let y = 0; y < rows; y++) {
    const lit = y < litRows;
    for (let x = 0; x < cols; x++) {
      const k = (y * cols + x) * 4;
      let c;
      if (!lit) c = UNLIT;
      else {
        const salt = Math.abs(((x * 73856093) ^ (y * 19349663)) % 1000) / 1000;
        const led = chatColour(px[k], px[k + 1], px[k + 2], salt);
        c = [0, 1, 2].map(i => Math.round(led[i] + (px[k + i] - led[i]) * warm));
      }
      towerCtx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      const cx = x * pitch + pitch / 2, cy = y * pitch + pitch / 2;
      if (round) {
        towerCtx.beginPath();
        towerCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        towerCtx.fill();
      } else {
        towerCtx.fillRect(x * pitch, y * pitch, pitch - 1, pitch - 1);
      }
    }
  }
}
towerImg.loading = "eager";
if (towerImg.complete) drawTower(true); else towerImg.addEventListener("load", () => drawTower(true));

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    drawTower();
    playFilm();
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => { layoutScan(); drawTower(true); onScroll(); });

// ================= MODRINTH DOWNLOADS =================
// The headline figure is an LED odometer: every digit rolls into place when the panel comes into view,
// and rolls again whenever the live count moves. The exact count runs up beside a blinking live LED.
const dl = {
  odo: document.getElementById("dl-figure"),
  wrap: document.getElementById("dl-figure-wrap"),
  exact: document.getElementById("dl-exact"),
  followers: document.getElementById("dl-followers"),
  board: document.querySelector(".calc-board"),
  row: document.getElementById("row-dl"),
  shown: 0,
  value: null,
  seen: false
};

const millions = n => (Math.floor(n / 1e4) / 100).toFixed(2);

// Each digit is a strip of 0–9 three times over, so a roll can spin past zero before it lands
function buildOdo(text) {
  dl.odo.textContent = "";
  [...text].forEach(ch => {
    const cell = document.createElement("span");
    // the decimal point is drawn as one square LED; Doto's own reads as a comma at this size
    if (!/\d/.test(ch)) { cell.className = ch === "." ? "odo-dot" : "odo-sep"; if (ch !== ".") cell.textContent = ch; dl.odo.appendChild(cell); return; }
    cell.className = "odo-d";
    cell.dataset.d = ch;
    const strip = document.createElement("span");
    strip.className = "odo-strip";
    strip.textContent = "012345678901234567890123456789";
    strip.style.transform = `translateY(-${Number(ch) * 1}em)`;
    cell.appendChild(strip);
    dl.odo.appendChild(cell);
  });
}

function rollOdo(text, fromZero) {
  const digits = [...dl.odo.querySelectorAll(".odo-d")];
  const target = [...text].filter(c => /\d/.test(c));
  if (digits.length !== target.length) { buildOdo(text); return rollOdo(text, true); }
  dl.wrap.setAttribute("aria-label", `${text} million downloads`);
  digits.forEach((cell, k) => {
    const strip = cell.firstChild;
    const from = fromZero ? 0 : Number(cell.dataset.d);
    const to = Number(target[k]);
    const changed = from !== to;
    cell.dataset.d = to;
    if (reduceMotion) { strip.style.transition = "none"; strip.style.transform = `translateY(-${to}em)`; return; }
    if (!fromZero && !changed) return;
    // later digits spin more and land later, like a counter settling
    const spins = fromZero ? 2 : 1;
    strip.style.transition = "none";
    strip.style.transform = `translateY(-${from}em)`;
    void strip.offsetHeight;
    strip.style.transition = `transform ${1100 + k * 260}ms cubic-bezier(.16, 1, .3, 1)`;
    strip.style.transform = `translateY(-${spins * 10 + to}em)`;
    cell.classList.remove("bump");
    void cell.offsetWidth;
    cell.classList.add("bump");
  });
}

function countTo(target, duration) {
  const start = dl.shown, t0 = performance.now();
  if (reduceMotion) { dl.shown = target; dl.exact.textContent = fmt(target); return; }
  const tick = now => {
    const t = clamp((now - t0) / duration, 0, 1);
    dl.shown = start + (target - start) * (1 - Math.pow(1 - t, 4));
    dl.exact.textContent = fmt(Math.round(dl.shown));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function showFigures(fromZero) {
  if (dl.value === null) return;
  rollOdo(millions(dl.value), fromZero);
  if (fromZero) dl.shown = 0;
  countTo(dl.value, fromZero ? 2200 : 1200);
  if (fromZero && !reduceMotion) dl.board.querySelectorAll("[data-flap]").forEach((el, k) => flap(el, 300 + k * 140));
}

const LOADER_NAMES = { fabric: "Fabric", forge: "Forge", neoforge: "NeoForge", paper: "Paper", quilt: "Quilt", bukkit: "Bukkit", spigot: "Spigot" };
const listOf = items => items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

async function loadDownloads() {
  try {
    const response = await fetch("https://api.modrinth.com/v2/project/calcmod");
    if (!response.ok) throw new Error(response.status);
    const project = await response.json();
    const first = dl.value === null;
    const moved = !first && project.downloads !== dl.value;
    dl.value = project.downloads;
    dl.row.textContent = `${millions(dl.value)}M DL`;
    dl.followers.textContent = fmt(project.followers);
    document.getElementById("calc-loader-count").textContent = project.loaders.length;
    document.getElementById("calc-loaders").textContent = `${listOf(project.loaders.map(l => LOADER_NAMES[l] || l))}.`;
    const versions = project.game_versions;
    if (versions.length) document.getElementById("calc-versions").textContent = `${versions[0]}-${versions.at(-1)}`;
    if (first) {
      buildOdo(millions(dl.value));
      dl.exact.textContent = fmt(dl.value);
      dl.shown = dl.value;
      if (dl.seen) showFigures(true);
    } else if (moved) {
      // the live count ticked: roll just the digits that changed, and refresh the board row
      showFigures(false);
      if (!reduceMotion) flap(dl.row, 0);
    }
  } catch (error) {
    console.error("Failed to load Modrinth downloads:", error);
  }
}

buildOdo(dl.odo.textContent);
if ("IntersectionObserver" in window) {
  // roll again each time the panel comes back into view
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    dl.seen = true;
    showFigures(true);
  }, { threshold: 0.45 }).observe(document.getElementById("downloads"));
}

loadDownloads();
setInterval(loadDownloads, 60000);

// ================= /calc =================
// The commands from CalcMod's own gallery, worked out the same way. No eval.
const FUNCS = { sqrt: Math.sqrt, abs: Math.abs, round: Math.round, floor: Math.floor, ceil: Math.ceil };
const CONSTS = { pi: Math.PI, e: Math.E };
const UNITS = { sb: 1728, sbs: 1728, stack: 64, stacks: 64 };

function evaluate(src) {
  const tokens = src.replace(/,/g, "").replace(/×/g, "*").replace(/÷/g, "/")
    .match(/\d*\.?\d+|[a-z]+|[-+*/%^()]|\S/gi) || [];
  let i = 0;
  const peek = () => tokens[i];
  const take = expected => {
    if (expected && tokens[i] !== expected) throw new Error(`Expected ${expected}`);
    return tokens[i++];
  };

  function expr() {
    let v = term();
    while (peek() === "+" || peek() === "-") v = take() === "+" ? v + term() : v - term();
    return v;
  }
  function term() {
    let v = power();
    while (["*", "/", "%"].includes(peek())) {
      const op = take(), r = power();
      v = op === "*" ? v * r : op === "/" ? v / r : v % r;
    }
    return v;
  }
  function power() {
    const base = unary();
    return peek() === "^" ? (take(), Math.pow(base, power())) : base;
  }
  function unary() {
    if (peek() === "-") { take(); return -unary(); }
    if (peek() === "+") { take(); return unary(); }
    return primary();
  }
  function primary() {
    const t = take();
    if (t === undefined) throw new Error("Unexpected end");
    if (t === "(") { const v = expr(); take(")"); return v; }
    if (/^\d*\.?\d+$/.test(t)) {
      const n = parseFloat(t);
      const unit = (peek() || "").toLowerCase();
      if (unit in UNITS) { take(); return n * UNITS[unit]; }
      return n;
    }
    const name = t.toLowerCase();
    if (name in FUNCS) { take("("); const v = expr(); take(")"); return FUNCS[name](v); }
    if (name in CONSTS) return CONSTS[name];
    if (name in UNITS) return UNITS[name];
    throw new Error(`Unknown ${t}`);
  }

  const value = expr();
  if (i < tokens.length) throw new Error(`Unexpected ${tokens[i]}`);
  if (!Number.isFinite(value)) throw new Error("Not a finite number");
  return value;
}

const nice = n => String(Number(n.toPrecision(12)));
const numbers = (args, count) => {
  const nums = args.map(Number);
  if (!count.includes(nums.length) || nums.some(Number.isNaN)) throw new Error("bad args");
  return nums;
};

// Each command returns its chat line and which gallery shot it belongs to
function runCommand(src) {
  const [word, ...args] = src.split(/\s+/);
  const cmd = word.toLowerCase();
  if (cmd === "nether" || cmd === "overworld") {
    const [x, z] = numbers(args, [2]);
    const f = cmd === "nether" ? v => Math.floor(v / 8) : v => v * 8;
    const to = cmd === "nether" ? "Nether" : "Overworld";
    return { feature: "portal", copy: `${f(x)} ${f(z)}`, parts: [["mc-aqua", `X: ${x} Z: ${z}`], ["", `>> ${to} =`], ["mc-green", `X: ${f(x)} Z: ${f(z)}`]] };
  }
  if (cmd === "dist") {
    const n = numbers(args, [4, 6]);
    const [x1, z1, x2, z2] = n.length === 4 ? n : [n[0], n[2], n[3], n[5]];
    const d = nice(Math.round(Math.hypot(x2 - x1, z2 - z1) * 1000) / 1000);
    return { feature: "travel", copy: d, parts: [["", "Distance from"], ["mc-aqua", `X: ${x1} Z: ${z1}`], ["", "to"], ["mc-aqua", `X: ${x2} Z: ${z2}:`], ["mc-green", d]] };
  }
  if (cmd === "secondstohopperclock") {
    const [s] = numbers(args, [1]);
    const items = Math.ceil(s * 1.25);
    return { feature: "hopper", copy: String(items), parts: [["", `Items needed in hopper clock for`], ["mc-aqua", `${s}`], ["", "seconds ="], ["mc-green", `${items}`], ["mc-green", `Stacks: ${Math.floor(items / 64)} Items: ${items % 64}`]] };
  }
  if (cmd === "craft") {
    throw new Error("craft");
  }
  const result = nice(evaluate(src));
  return { feature: "syntax", copy: result, parts: [["mc-aqua", src], ["", "="], ["mc-green", result]] };
}

const showcase = document.getElementById("calcmod");
const chatForm = document.getElementById("chat");
const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");

function chatLine(nodes) {
  const li = document.createElement("li");
  nodes.forEach((node, n) => { if (n) li.append(" "); li.append(node); });
  chatLog.appendChild(li);
  while (chatLog.children.length > 4) chatLog.firstElementChild.remove();
}

function span(cls, text) {
  const s = document.createElement("span");
  if (cls) s.className = cls;
  s.textContent = text;
  return s;
}

function copyButton(value) {
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "mc-copy";
  copy.textContent = "[Click to Copy]";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(value);
      copy.textContent = "[Copied]";
    } catch {
      copy.textContent = "[Copy blocked]";
    }
    setTimeout(() => { copy.textContent = "[Click to Copy]"; }, 1500);
  });
  return copy;
}

function submit(src) {
  try {
    const out = runCommand(src);
    chatLine([...out.parts.map(([cls, text]) => span(cls, text)), copyButton(out.copy)]);
    showcase.dataset.feature = out.feature;
  } catch (error) {
    const why = error.message === "craft" ? "Crafting needs the recipe book, which lives in the mod." : "Try a sum, or nether, overworld, dist or secondstohopperclock.";
    chatLine([span("mc-red", `Couldn’t run “${src}”. ${why}`)]);
  }
}

chatForm.addEventListener("submit", e => {
  e.preventDefault();
  submit(chatInput.value.trim() || chatInput.placeholder);
  chatInput.value = "";
});
document.querySelectorAll(".chat-suggest button").forEach(b => {
  b.addEventListener("click", () => submit(b.dataset.try));
});
// The reply slip's QR block and the order Batcher reads its fields in
document.querySelectorAll(".qr").forEach(qr => {
  const n = 21;
  const finder = (x, y) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => {
    const dx = x - fx, dy = y - fy;
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
    return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5);
  });
  const inFinderZone = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const on = inFinderZone(x, y) ? finder(x, y) : rand() > 0.5;
    const el = document.createElement("i");
    if (!on) el.className = "off";
    qr.appendChild(el);
  }
});

function readSlip(remit) {
  if (reduceMotion) return;
  remit.querySelectorAll(".ocr").forEach((el, k) => {
    el.classList.remove("read");
    void el.offsetWidth;
    el.style.animationDelay = `${k * 450}ms`;
    el.classList.add("read");
  });
}
// ================= SIDEFLICK =================
// A sample game: scrolling plays the film, each question pops at its scene
const sf = document.getElementById("sideflick");
const sfFilm = sf.querySelector(".sf-film");
const sfCards = [...sf.querySelectorAll(".sf-card")];
const sfPins = [...sf.querySelectorAll(".sf-pin")];
const sfTime = document.getElementById("sf-time");
const sfScore = document.getElementById("sf-score");
const FILM_SECONDS = 107 * 60;
let score = 0;

// taste-skill-ignore: a film clock, hh:mm:ss
const clock = s => [Math.floor(s / 3600), Math.floor(s / 60) % 60, Math.floor(s % 60)].map(v => String(v).padStart(2, "0")).join(":");

function playFilm() {
  const r = sfFilm.getBoundingClientRect();
  const vh = window.innerHeight;
  const p = reduceMotion ? 1 : clamp((vh * 0.9 - r.top) / (vh * 0.75), 0, 1);
  sfFilm.style.setProperty("--p", p.toFixed(4));
  sfTime.textContent = clock(p * FILM_SECONDS);
  let latest = -1;
  sfCards.forEach((card, k) => { if (p >= Number(card.dataset.at)) latest = k; });
  sfCards.forEach((card, k) => {
    card.classList.toggle("on", k === latest || (reduceMotion && k <= latest));
    card.classList.toggle("past", k < latest && !reduceMotion);
    sfPins[k].classList.toggle("hit", k <= latest);
  });
}

sf.querySelectorAll(".sf-options button").forEach(button => {
  button.addEventListener("click", () => {
    const options = button.parentElement;
    if (options.dataset.answered) return;
    options.dataset.answered = "true";
    const right = button.hasAttribute("data-right");
    button.classList.add(right ? "right" : "wrong");
    if (!right) options.querySelector("[data-right]").classList.add("right");
    if (right) {
      const from = score, to = score + 100, t0 = performance.now();
      score = to;
      const tick = now => {
        const t = clamp((now - t0) / 600, 0, 1);
        sfScore.textContent = `${Math.round(from + (to - from) * t)} pts`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else {
      sfScore.textContent = `${score} pts. It was “Get to the chopper!”`;
    }
  });
});

// ================= LIVE ACTIVITY =================
// The status I post from my phone (a gist), with its picture, shown in the top strip
async function getLiveActivity() {
  try {
    const response = await fetch("https://api.github.com/gists/87faa18d1808b0282fd22c7d7f54ff02", {
      headers: { "Accept": "application/vnd.github.v3+json" }
    });
    if (!response.ok) throw new Error(response.status);
    const gist = await response.json();
    const current = JSON.parse(gist.files["activities.json"].content).activities.at(-1);
    if (!current) return;
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(current.date)) / 60000));
    const unit = (n, word) => `${n} ${word}${n === 1 ? "" : "s"} ago`;
    // the time shows only while the status is under a week old, as it always has
    let ago = "";
    if (minutes < 1) ago = "just now";
    else if (minutes < 60) ago = unit(minutes, "min");
    else if (minutes < 1440) ago = unit(Math.floor(minutes / 60), "hour");
    else if (minutes < 10080) ago = unit(Math.floor(minutes / 1440), "day");
    const box = document.getElementById("live-activity");
    if (current.imageURL) {
      const img = new Image(32, 32);
      img.className = "status-img";
      img.alt = "";
      img.src = current.imageURL;
      box.querySelector(".status-row").prepend(img);
    }
    document.getElementById("status-text").textContent = current.status;
    document.getElementById("status-time").textContent = ago;
    box.title = ago ? `${current.status}, ${ago}` : current.status;
    box.hidden = false;
  } catch (error) {
    console.error("Failed to get live activity:", error);
  }
}

// Batcher's scan line runs the height of its slip, and reads the slip when it comes into view
function layoutScan() {
  document.querySelectorAll(".slip").forEach(slip => {
    slip.style.setProperty("--scan-h", `${slip.clientHeight - 3}px`);
  });
}
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { layoutScan(); readSlip(e.target); }
  }, { threshold: 0.5 }).observe(document.querySelector(".remit"));
}

// ================= START =================
layoutScan();
playFilm();
onScroll();
loadContributionGraph();
getLiveActivity();
