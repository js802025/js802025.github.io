// ================= SETUP =================
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const history = document.getElementById("history");
const frames = [...document.querySelectorAll(".frame")];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmt = n => n.toLocaleString("en-US");
const isDesktop = () => window.innerWidth >= 900;

if (!reduceMotion) history.classList.add("pin");

// ================= AVATAR MOSAIC =================
// My GitHub picture redrawn in Minecraft chat colours, one code per square
const AVATAR = [
  "400060002200020004400050004400040004",
  "0c6600200022000200044000400044000400",
  "060aa0002000660004000440004000440ccc",
  "060aa220006000440004000440004000cd0c",
  "06ee00044000600ffffff40004400660ddcc",
  "44006660044000ff0044ff040004406cc0c0",
  "0046660400046ff040004ff0040004ccd030",
  "400c4c6004000ff0004000f400ccccc5d000",
  "00400ccc60060f06600040f044000c000130",
  "40004cd0e6000f00044000f00044cd050003",
  "04400d9000220ff600044ff0400045000300",
  "0004500010004ff004000ff0004000510003",
  "04000110001000fff00fff04400040001100",
  "000400091000400ffffff40004400d500011",
  "440004d9015000400ff40004000c4d001000",
  "004460c50d0440004ff04400040cdd500010",
  "4000c4cddc0004400ff0001100040d999000",
  "0040cc55000400044ff05000110005990110",
  "4ccccdd044000400ffff0030001109990001",
  "cccc00500044000ffffff000100011099990",
  "cc0c5000400044fffff0ff30001000199091",
  "0ccc0440004000ff0ff10ff1100010099990",
  "0004000440004ff04ff001ff011000109911",
  "440004000440ff400ff100ff000110001000",
  "004400ccc00440005ff01100010001100010",
  "40004cc0c40005500ff00011000990011000",
  "005000ddd0050001ffff1000119099000110",
  "50005ddd11000300ff3f0010009199019001",
  "055dddd00011000ff00ff000300999990100",
  "00055d903000110f0300f330003000bbb901",
  "0100d199001000ff0003ff03300030b0aaae",
  "0099900110001ff033000ff0032000a00e66",
  "5100910001100ff0003300f3000220006ee0",
  "001190010001300030003300020002600060",
  "500011000100033000300032000600066000",
  "005000110003000330003000660006000660"
].join("");
function drawMosaic() {
  const holder = document.querySelector(".mosaic-cells");
  const n = 36, mid = (n - 1) / 2;
  [...AVATAR].forEach((code, k) => {
    const x = k % n, y = Math.floor(k / n);
    const el = document.createElement("span");
    el.className = code === "0" ? "mcell" : `mcell m-${code}`;
    el.style.setProperty("--i", x + y);
    el.style.setProperty("--d", Math.round(Math.hypot(x - mid, y - mid)));
    holder.appendChild(el);
  });
  const mosaic = document.querySelector(".mosaic");
  const show = on => {
    mosaic.classList.toggle("reveal", on);
    mosaic.setAttribute("aria-label", on ? "Hide my GitHub profile picture" : "Show my GitHub profile picture");
  };
  mosaic.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") show(true); });
  mosaic.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") show(false); });
  mosaic.addEventListener("click", () => show(!mosaic.classList.contains("reveal")));
}

async function loadProfile() {
  try {
    const response = await fetch("https://api.github.com/users/js802025");
    if (!response.ok) throw new Error(response.status);
    const user = await response.json();
    document.getElementById("gh-repos").textContent = fmt(user.public_repos);
    if (user.bio) document.getElementById("gh-bio").textContent = user.bio;
  } catch (error) {
    console.error("Failed to load GitHub profile:", error);
  }
}

// ================= GITHUB CONTRIBUTION GRAPH =================
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const today = new Date().toISOString().slice(0, 10);

function cell(level, i, extra = "") {
  const el = document.createElement("span");
  el.className = `cell l${level} ${extra}`.trim();
  el.style.setProperty("--i", i);
  return el;
}

function describe(day) {
  const [y, m, d] = day.date.split("-").map(Number);
  const n = day.count;
  return `${n === 0 ? "No" : n} contribution${n === 1 ? "" : "s"} on ${MONTHS[m - 1]} ${d}, ${y}`;
}

function drawYear(container, year, byDate) {
  container.textContent = "";
  const offset = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  for (let i = 0; i < offset; i++) container.appendChild(cell(0, 0, "pad"));
  let slot = offset;
  for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1), slot++) {
    const date = d.toISOString().slice(0, 10);
    const day = byDate.get(date) || { date, count: 0, level: 0 };
    const el = cell(day.level, Math.floor(slot / 7) + (slot % 7) * 0.6, date > today ? "future" : "");
    el.dataset.tip = describe(day);
    container.appendChild(el);
  }
}

function drawAll(contributions, totals) {
  const byDate = new Map(contributions.map(d => [d.date, d]));
  document.querySelectorAll("[data-graph]").forEach(g => {
    const year = Number(g.dataset.graph);
    drawYear(g, year, byDate);
    if (totals[year] !== undefined) g.closest(".frame").querySelector("[data-total]").textContent = fmt(totals[year]);
  });
}

async function loadContributionGraph() {
  try {
    const response = await fetch("https://github-contributions-api.jogruber.de/v4/js802025");
    if (!response.ok) throw new Error(response.status);
    const data = await response.json();
    drawAll(data.contributions, data.total);
  } catch (error) {
    console.error("Failed to load contribution graph:", error);
  }
  layoutReel();
  // Light the squares only after they exist, and not before the title has landed
  setTimeout(() => {
    graphReady = true;
    if (history.classList.contains("pin")) onScroll();
    else frames.forEach(f => f.classList.add("on"));
  }, Math.max(60, 700 - performance.now()));
}

// Hover a square to read its day
const tip = document.createElement("div");
tip.className = "tip";
tip.setAttribute("aria-hidden", "true");
document.querySelector(".stage").appendChild(tip);

function showTip(e) {
  const c = e.target.closest(".cell[data-tip]");
  if (!c) { tip.classList.remove("show"); return; }
  const stage = tip.parentElement.getBoundingClientRect();
  const r = c.getBoundingClientRect();
  tip.textContent = c.dataset.tip;
  tip.style.left = clamp(r.left + r.width / 2 - stage.left, 120, stage.width - 120) + "px";
  tip.style.top = (r.top - stage.top) + "px";
  tip.classList.add("show");
}
const reel = document.querySelector(".reel");
reel.addEventListener("pointerover", showTip);
reel.addEventListener("pointerdown", showTip);
reel.addEventListener("pointerleave", () => tip.classList.remove("show"));

// ================= PINNED REEL =================
let step = 0, top0 = 0, graphReady = false;

function layoutReel() {
  if (!history.classList.contains("pin")) { history.style.height = ""; return; }
  const win = document.querySelector(".reel-window");
  const stage = document.querySelector(".stage");
  if (isDesktop()) {
    // The reel fills the band between the two halves of the title
    const l = document.querySelector(".half-l").getBoundingClientRect();
    const r = document.querySelector(".half-r").getBoundingClientRect();
    const top = l.bottom - stage.getBoundingClientRect().top + 24;
    const bottom = stage.clientHeight - (r.top - stage.getBoundingClientRect().top) + 24;
    const winH = stage.clientHeight - top - bottom;
    const frameH = winH - 2 * (40 + 16);
    stage.style.setProperty("--win-top", `${top}px`);
    stage.style.setProperty("--win-bottom", `${bottom}px`);
    stage.style.setProperty("--reel-w", `${clamp(frameH * 1.6, 320, window.innerWidth - 2 * 32)}px`);
    stage.style.removeProperty("--win-h");
  } else {
    stage.style.removeProperty("--reel-w");
    stage.style.setProperty("--win-h", `${frames[0].offsetHeight + 2 * (24 + 16)}px`);
  }
  const frameH = frames[0].offsetHeight;
  const winH = win.clientHeight;
  const sliver = isDesktop() ? 22 : 24;
  const gap = Math.max(16, (winH - frameH) / 2 - sliver);
  step = frameH + gap;
  top0 = (winH - frameH) / 2;
  history.style.height = `${window.innerHeight * (1 + 0.45 * (frames.length - 1))}px`;
}

// Hold on each year, then glide to the next
const settle = f => f < 0.3 ? 0 : f > 0.7 ? 1 : (t => t * t * (3 - 2 * t))((f - 0.3) / 0.4);

function positionReel() {
  if (!history.classList.contains("pin")) return;
  const travel = history.offsetHeight - window.innerHeight;
  const p = travel > 0 ? clamp(-history.getBoundingClientRect().top / travel, 0, 1) : 0;
  const raw = p * (frames.length - 1);
  const i = Math.floor(raw);
  const pos = i + settle(raw - i);
  const winH = document.querySelector(".reel-window").clientHeight;
  frames.forEach((f, n) => {
    const y = top0 + (n - pos) * step;
    // Frames leaving upward fade out; the next one still peeks in from below
    const fade = y < 0 ? clamp(1 + y / 50, 0, 1) : 1;
    f.style.transform = `translateY(${y}px)`;
    f.style.opacity = fade;
    f.style.visibility = fade === 0 || y > winH ? "hidden" : "";
  });
  if (!graphReady) return;
  const current = Math.round(pos);
  frames.forEach((f, n) => { if (n <= current) f.classList.add("on"); });
}

// ================= SCROLL-LINKED PICTURES =================
const drifters = [
  ...[...document.querySelectorAll(".showcase-bg img")].map(el => ({ el, box: el.closest(".showcase"), from: 1.85, to: 1.7 }))
];

function driftPictures() {
  if (reduceMotion) return;
  const vh = window.innerHeight;
  drifters.forEach(({ el, box, from, to }) => {
    const r = box.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
    el.style.setProperty("--zoom", (from + (to - from) * p).toFixed(4));
  });
}

// ================= TECH TOWER, PIXELS TO PHOTO =================
const towerImg = document.querySelector(".contact-bg");
const towerCanvas = document.querySelector(".contact-pixels");
const towerCtx = towerCanvas.getContext("2d");
const towerSmall = document.createElement("canvas");
let towerBlock = "";

// Minecraft chat colours, picked by hue the way the avatar mosaic is, so even a dusky photo comes out loud
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
  if (r.bottom < 0) { towerCanvas.classList.add("done"); towerBlock = "done"; return; }
  const p = clamp((vh - r.top) / (vh * 0.85), 0, 1);
  // squares shrink from 56px to 4px, then the photo takes over
  const block = Math.round(4 + 52 * Math.pow(1 - p, 1.4));
  const real = clamp((p - 0.6) / 0.37, 0, 1) ** 1.5;
  // Check "done" first, every time, so the photo always takes over at the end
  const done = p >= 0.97;
  towerCanvas.classList.toggle("done", done);
  if (done) { towerBlock = "done"; return; }
  const key = block + ":" + Math.round(real * 20);
  if (key === towerBlock && !force) return;
  towerBlock = key;
  const cw = Math.round(r.width), ch = Math.round(r.height);
  if (towerCanvas.width !== cw || towerCanvas.height !== ch) { towerCanvas.width = cw; towerCanvas.height = ch; }
  // the same crop as object-fit: cover at 60% 40%
  const iw = towerImg.naturalWidth, ih = towerImg.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih);
  const sw = cw / scale, sh = ch / scale;
  const sx = (iw - sw) * 0.6, sy = (ih - sh) * 0.4;
  const cols = Math.ceil(cw / block), rows = Math.ceil(ch / block);
  towerSmall.width = cols; towerSmall.height = rows;
  const sctx = towerSmall.getContext("2d", { willReadFrequently: true });
  sctx.drawImage(towerImg, sx, sy, sw, sh, 0, 0, cols, rows);
  const px = sctx.getImageData(0, 0, cols, rows).data;
  const gap = Math.max(1, Math.round(block * 0.12));
  towerCtx.fillStyle = "#000";
  towerCtx.fillRect(0, 0, cw, ch);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const k = (y * cols + x) * 4;
    const salt = ((x * 73856093) ^ (y * 19349663)) % 1000 / 1000;
    const [cr, cg, cb] = chatColour(px[k], px[k + 1], px[k + 2], Math.abs(salt));
    const mix = (a, b2) => Math.round(a + (b2 - a) * real);
    towerCtx.fillStyle = `rgb(${mix(cr, px[k])},${mix(cg, px[k + 1])},${mix(cb, px[k + 2])})`;
    towerCtx.fillRect(x * block, y * block, block - gap, block - gap);
  }
}
towerImg.loading = "eager";
if (towerImg.complete) drawTower(true); else towerImg.addEventListener("load", () => drawTower(true));

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    positionReel();
    driftPictures();
    drawTower();
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => { layoutReel(); layoutScan(); drawTower(true); onScroll(); });

// ================= REVEALS =================
document.querySelectorAll("[data-reveal]").forEach(group => {
  [...group.children].forEach((child, k) => child.style.setProperty("--k", k));
});
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });
  document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
} else {
  document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("in"));
}

// ================= MODRINTH DOWNLOADS =================
const dl = {
  figure: document.getElementById("dl-figure"),
  exact: document.getElementById("dl-exact"),
  followers: document.getElementById("dl-followers"),
  shown: 0,
  value: null,
  seen: false
};

const millions = n => (Math.floor(n / 1e4) / 100).toFixed(2);

function paintDownloads(n) {
  dl.figure.textContent = millions(n);
  dl.exact.textContent = fmt(Math.round(n));
}

function countTo(target, duration) {
  const start = dl.shown, t0 = performance.now();
  if (reduceMotion) { dl.shown = target; paintDownloads(target); return; }
  const tick = now => {
    const t = clamp((now - t0) / duration, 0, 1);
    dl.shown = start + (target - start) * (1 - Math.pow(1 - t, 4));
    paintDownloads(dl.shown);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const LOADER_NAMES = { fabric: "Fabric", forge: "Forge", neoforge: "NeoForge", paper: "Paper", quilt: "Quilt", bukkit: "Bukkit", spigot: "Spigot" };
const listOf = items => items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

async function loadDownloads() {
  try {
    const response = await fetch("https://api.modrinth.com/v2/project/calcmod");
    if (!response.ok) throw new Error(response.status);
    const project = await response.json();
    const first = dl.value === null;
    dl.value = project.downloads;
    dl.followers.textContent = fmt(project.followers);
    document.getElementById("calc-loaders").textContent = listOf(project.loaders.map(l => LOADER_NAMES[l] || l));
    const versions = project.game_versions;
    if (versions.length) document.getElementById("calc-versions").textContent = `${versions[0]} to ${versions.at(-1)}`;
    if (first) {
      paintDownloads(dl.value);
      if (dl.seen) { dl.shown = 0; countTo(dl.value, 1800); } else dl.shown = dl.value;
    } else if (dl.value !== Math.round(dl.shown)) {
      countTo(dl.value, 1200);
    }
  } catch (error) {
    console.error("Failed to load Modrinth downloads:", error);
  }
}

if ("IntersectionObserver" in window) {
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    dl.seen = true;
    if (dl.value !== null) { dl.shown = 0; countTo(dl.value, 1800); }
    obs.disconnect();
  }, { threshold: 0.35 }).observe(document.getElementById("downloads"));
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

// ================= OTHER PROJECTS =================
const names = [...document.querySelectorAll(".name")];
const previewFrame = document.querySelector(".preview-frame");
const previewText = document.querySelector(".preview-text");
const layers = names.map(name => {
  const layer = document.createElement("div");
  layer.className = "preview-layer";
  layer.append(...[...name.querySelector(".name-pic").childNodes].map(n => n.cloneNode(true)));
  previewFrame.appendChild(layer);
  return layer;
});

function activate(index) {
  names.forEach((n, k) => n.classList.toggle("is-active", k === index));
  layers.forEach((l, k) => l.classList.toggle("show", k === index));
  previewText.textContent = names[index].querySelector(".name-text").textContent;
}
names.forEach((name, k) => {
  const link = name.querySelector(".name-link");
  name.querySelector(".name-row").addEventListener("pointerenter", () => activate(k));
  link.addEventListener("focus", () => activate(k));
});
activate(0);

// Batcher's scan line runs the height of its slip
function layoutScan() {
  document.querySelectorAll(".slip").forEach(slip => {
    slip.style.setProperty("--scan-h", `${slip.clientHeight - 3}px`);
  });
}

// The projects take turns in the preview until someone points at one
let rotation = null;
function startRotation() {
  if (reduceMotion || !isDesktop()) return;
  clearInterval(rotation);
  rotation = setInterval(() => {
    const current = names.findIndex(n => n.classList.contains("is-active"));
    activate((current + 1) % names.length);
  }, 3600);
}
const namesList = document.querySelector(".names");
namesList.addEventListener("pointerenter", () => clearInterval(rotation));
namesList.addEventListener("pointerleave", startRotation);
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => { if (e.isIntersecting) startRotation(); else clearInterval(rotation); })
    .observe(document.getElementById("projects"));
}

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
const _activate = activate;
activate = index => {
  _activate(index);
  const remit = layers[index].querySelector(".remit");
  if (remit) { layoutScan(); readSlip(remit); }
};

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
window.addEventListener("scroll", () => requestAnimationFrame(playFilm), { passive: true });

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
async function getLiveActivity() {
  try {
    const response = await fetch("https://api.github.com/gists/87faa18d1808b0282fd22c7d7f54ff02", {
      headers: { "Accept": "application/vnd.github.v3+json" }
    });
    const gist = await response.json();
    const current = JSON.parse(gist.files["activities.json"].content).activities.at(-1);
    if (!current) return;
    const minutes = Math.floor((Date.now() - new Date(current.date)) / 60000);
    let ago;
    if (minutes < 60) ago = `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    else if (minutes < 1440) ago = `${Math.floor(minutes / 60)} hour${minutes < 120 ? "" : "s"} ago`;
    else if (minutes < 10080) ago = `${Math.floor(minutes / 1440)} day${minutes < 2880 ? "" : "s"} ago`;
    else return;
    document.getElementById("status-text").textContent = current.status;
    document.getElementById("status-time").textContent = `, ${ago}`;
    document.getElementById("live-activity").hidden = false;
  } catch (error) {
    console.error("Failed to get live activity:", error);
  }
}

// ================= START =================
// Draw empty squares first so the reel has its shape before the data arrives
drawMosaic();
drawAll([], {});
layoutReel();
layoutScan();
playFilm();
onScroll();
if (document.fonts) document.fonts.ready.then(() => { layoutReel(); onScroll(); });
loadContributionGraph();
loadProfile();
getLiveActivity();
