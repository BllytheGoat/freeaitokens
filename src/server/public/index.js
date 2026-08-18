// FreeAITokens dashboard — siphon UI logic
const $ = (s) => document.querySelector(s);
const connDot = $("#conn-dot");
const connLabel = $("#conn-label");
const odometer = $("#odometer");
const packets = $("#packets");
const logEl = $("#log");

let totalTokens = 0;
let renderedTokens = 0;

// ---- live connection state ----
async function ping() {
  try {
    const r = await fetch("/api/stats", { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    connDot.className = "pulse-dot live";
    connLabel.textContent = "connected to local server";
    return await r.json();
  } catch (e) {
    connDot.className = "pulse-dot dead";
    connLabel.textContent = "server offline — start `node server.js`";
    return null;
  }
}

// ---- odometer (counts up smoothly) ----
function tick() {
  if (renderedTokens < totalTokens) {
    const step = Math.max(1, Math.ceil((totalTokens - renderedTokens) / 12));
    renderedTokens = Math.min(totalTokens, renderedTokens + step);
    odometer.textContent = renderedTokens.toLocaleString();
  }
  requestAnimationFrame(tick);
}
tick();

// ---- render stats into meter ----
function renderStats(d) {
  const s = d?.data || {};
  totalTokens = (s.totalTokensSent || 0) + (s.totalTokensReceived || 0);
  $("#m-req").textContent = (s.totalRequests ?? "—").toLocaleString?.() ?? s.totalRequests ?? "—";
  $("#m-sent").textContent = fmt(s.totalTokensSent);
  $("#m-recv").textContent = fmt(s.totalTokensReceived);
  const rate = s.totalRequests ? Math.round(((s.successCount || 0) / s.totalRequests) * 100) : "—";
  $("#m-rate").textContent = rate === "—" ? "—" : rate + "%";
}

function fmt(n) {
  if (n == null) return "—";
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : "" + n;
}

// ---- request log ----
function renderLog(d) {
  const rows = d?.data?.recentRequests || [];
  if (!rows.length) { logEl.innerHTML = '<div class="log-empty">awaiting first request…</div>'; return; }
  logEl.innerHTML = rows.slice(0, 20).map((r) => {
    const ok = r.status === "success" || r.status === 200 || r.status === "ok";
    const t = new Date(r.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const plat = r.platform || r.model || "—";
    const tok = (r.tokensSent || 0) + (r.tokensReceived || 0);
    return `<div class="log-row ${ok ? "ok" : "bad"}">
      <span class="lr-time">${t}</span>
      <span class="lr-plat">${escapeHtml(plat)}</span>
      <span class="lr-tok">${tok} tok</span>
      <span class="lr-stat">${ok ? "ok" : "fail"}</span>
    </div>`;
  }).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---- siphon packets ----
function spawnPacket() {
  const p = document.createElement("div");
  p.className = "packet";
  p.style.animationDelay = (Math.random() * 2).toFixed(2) + "s";
  p.style.top = (38 + Math.random() * 24) + "%";
  packets.appendChild(p);
  setTimeout(() => p.remove(), 2600);
}

// ---- config form ----
async function loadConfig() {
  try {
    const r = await fetch("/api/config", { cache: "no-store" });
    if (!r.ok) return;
    const { data } = await r.json();
    const form = $("#config-form");
    const FIELDS = [
      ["CHAT_URL", "ChatGPT URL"],
      ["AISTUDIO_CHAT_URL", "AI Studio URL"],
      ["USER_DATA_DIR", "Chrome profile dir"],
      ["DEFAULT_TIMEOUT_MS", "Timeout (ms)", "number"],
      ["CDP_PORT", "CDP port", "number"],
      ["PORT", "API port", "number"],
      ["HOST", "API host"],
    ];
    form.innerHTML = FIELDS.map(([k, label, type]) => `
      <div class="fg">
        <label for="cfg-${k}">${label}</label>
        <input id="cfg-${k}" name="${k}" type="${type || "text"}" value="${escapeHtml(data[k] ?? "")}">
      </div>`).join("");
    form.addEventListener("submit", saveConfig);
  } catch (e) {}
}

async function saveConfig(e) {
  e.preventDefault();
  const alert = $("#config-alert");
  const body = {};
  new FormData(e.target).forEach((v, k) => (body[k] = v));
  try {
    const r = await fetch("/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    alert.hidden = false;
    alert.className = "alert " + (r.ok ? "ok" : "bad");
    alert.textContent = r.ok ? "Saved. Changes apply on next request (restart for port/host)." : "Save failed: " + (j.error || r.status);
  } catch (err) {
    alert.hidden = false; alert.className = "alert bad"; alert.textContent = "Could not reach server.";
  }
}

// ---- poll loop ----
async function refresh() {
  const s = await ping();
  if (s) { renderStats(s); renderLog(s); }
}
refresh();
loadConfig();
setInterval(refresh, 3000);
setInterval(spawnPacket, 1400);
