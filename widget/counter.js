(function () {
  "use strict";

  // Resolve where this script lives so data/ can be found next to widget/
  const currentScript =
    document.currentScript ||
    document.querySelector('script[src*="counter.js"]');
  if (!currentScript) {
    console.warn("[job-counter] could not resolve script origin");
    return;
  }
  const DATA_BASE = new URL("../data/", currentScript.src).toString();

  const STYLES = `
    .jc-card {
      --jc-grad-a: #0f172a;
      --jc-grad-b: #312e81;
      --jc-grad-c: #7c3aed;
      --jc-accent: #fbbf24;
      --jc-text: #f8fafc;
      --jc-muted: rgba(248, 250, 252, 0.7);
      position: relative;
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 1.75rem 2rem;
      min-width: 280px;
      max-width: 100%;
      border-radius: 20px;
      background:
        radial-gradient(circle at 85% 15%, rgba(124, 58, 237, 0.55), transparent 55%),
        radial-gradient(circle at 15% 85%, rgba(251, 191, 36, 0.18), transparent 50%),
        linear-gradient(135deg, var(--jc-grad-a) 0%, var(--jc-grad-b) 55%, var(--jc-grad-c) 100%);
      color: var(--jc-text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-shadow:
        0 1px 2px rgba(15, 23, 42, 0.08),
        0 12px 32px -8px rgba(49, 46, 129, 0.45);
      overflow: hidden;
      isolation: isolate;
    }
    .jc-card * { box-sizing: border-box; }
    .jc-bg-map {
      position: absolute;
      right: -30px;
      bottom: -40px;
      width: 220px;
      height: 220px;
      opacity: 0.08;
      pointer-events: none;
      z-index: 0;
    }
    .jc-badge {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      background: rgba(248, 250, 252, 0.12);
      backdrop-filter: blur(4px);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--jc-text);
    }
    .jc-badge svg { width: 14px; height: 14px; }
    .jc-label {
      position: relative;
      z-index: 1;
      margin: 0.25rem 0 0;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--jc-muted);
      letter-spacing: 0.01em;
    }
    .jc-number {
      position: relative;
      z-index: 1;
      font-size: clamp(2.75rem, 6vw, 3.75rem);
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.02em;
      color: var(--jc-text);
      font-variant-numeric: tabular-nums;
      background: linear-gradient(135deg, #ffffff 0%, var(--jc-accent) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .jc-sub {
      position: relative;
      z-index: 1;
      margin: 0;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--jc-text);
      opacity: 0.92;
    }
    .jc-footer {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--jc-muted);
    }
    .jc-footer .jc-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      animation: jc-pulse 2s infinite;
    }
    @keyframes jc-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70%  { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .jc-error {
      position: relative;
      z-index: 1;
      font-size: 0.85rem;
      color: #fecaca;
    }
    .jc-skeleton {
      display: inline-block;
      width: 180px;
      height: 1em;
      border-radius: 6px;
      background: linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.08) 100%);
      background-size: 200% 100%;
      animation: jc-shimmer 1.4s infinite;
    }
    @keyframes jc-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  const BRIEFCASE_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      <rect width="20" height="14" x="2" y="6" rx="2"/>
    </svg>
  `;

  // Simplified Australia outline (public-domain generalised path)
  const AUSTRALIA_SVG = `
    <svg viewBox="0 0 512 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#ffffff" d="M124 92c-8 4-14 14-22 18-10 5-22 2-30 10-10 10-8 28-18 38-6 6-18 6-20 16-2 12 12 20 14 32 2 16-14 30-10 46 4 18 26 22 40 34 16 14 20 38 36 52 22 18 54 18 84 22 34 4 66 24 100 20 36-4 60-38 94-46 30-8 64 2 92-12 26-14 30-50 48-72 10-12 26-18 34-32 10-18 0-40-14-56-12-14-30-22-48-22-24 0-42 20-66 22-22 2-42-14-64-14-18 0-32 16-50 18-20 2-38-12-58-12-14 0-26 8-40 6-14-2-26-12-40-14-24-4-46 4-62 20z"/>
    </svg>
  `;

  function injectStyles() {
    if (document.getElementById("jc-styles")) return;
    const s = document.createElement("style");
    s.id = "jc-styles";
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  function formatRelative(iso) {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return "recently";
    const diffMs = Date.now() - then;
    const hours = Math.max(0, Math.round(diffMs / 36e5));
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  function animateCount(el, target) {
    const duration = 1800;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = Math.floor(easeOut(t) * target);
      el.textContent = v.toLocaleString("en-AU");
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = target.toLocaleString("en-AU");
    }
    requestAnimationFrame(frame);
  }

  function renderLoading(host) {
    host.innerHTML = `
      <div class="jc-card" role="status" aria-live="polite">
        ${AUSTRALIA_SVG.replace("<svg ", '<svg class="jc-bg-map" ')}
        <span class="jc-badge">${BRIEFCASE_SVG}<span>Australia</span></span>
        <p class="jc-label"><span class="jc-skeleton"></span></p>
        <div class="jc-number"><span class="jc-skeleton" style="width:140px"></span></div>
        <p class="jc-sub">Active roles in Australia</p>
        <div class="jc-footer"><span class="jc-dot"></span><span>Loading live count…</span></div>
      </div>
    `;
  }

  function renderError(host, message) {
    host.innerHTML = `
      <div class="jc-card" role="alert">
        ${AUSTRALIA_SVG.replace("<svg ", '<svg class="jc-bg-map" ')}
        <span class="jc-badge">${BRIEFCASE_SVG}<span>Australia</span></span>
        <p class="jc-error">Could not load job count (${message}).</p>
      </div>
    `;
  }

  function render(host, data) {
    host.innerHTML = `
      <div class="jc-card">
        ${AUSTRALIA_SVG.replace("<svg ", '<svg class="jc-bg-map" ')}
        <span class="jc-badge">${BRIEFCASE_SVG}<span>Australia</span></span>
        <p class="jc-label">${escapeHtml(data.label || data.query || "")}</p>
        <div class="jc-number" data-jc-number>0</div>
        <p class="jc-sub">Active roles in Australia</p>
        <div class="jc-footer">
          <span class="jc-dot" title="Live"></span>
          <span>Updated ${formatRelative(data.updatedAt)} · via ${escapeHtml(data.source || "Adzuna")}</span>
        </div>
      </div>
    `;
    const numberEl = host.querySelector("[data-jc-number]");
    const count = Number(data.count) || 0;

    // Use IntersectionObserver so the count-up plays when scrolled into view
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(numberEl, count);
            o.disconnect();
          }
        });
      }, { threshold: 0.3 });
      obs.observe(numberEl);
    } else {
      animateCount(numberEl, count);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  async function mount(host) {
    const id = host.getAttribute("data-job-counter");
    if (!id) return;
    renderLoading(host);
    try {
      // Cache-bust lightly; GH Pages caches aggressively
      const url = `${DATA_BASE}${encodeURIComponent(id)}.json?t=${Math.floor(Date.now() / 3.6e6)}`;
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      render(host, data);
    } catch (err) {
      console.error("[job-counter]", err);
      renderError(host, err.message);
    }
  }

  function init() {
    injectStyles();
    document.querySelectorAll("[data-job-counter]").forEach(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
