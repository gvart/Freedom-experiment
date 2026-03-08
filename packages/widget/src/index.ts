/**
 * Patchwork Widget — Embeddable changelog popup
 *
 * Usage:
 *   <script src="https://your-patchwork.com/widget.js"
 *           data-patchwork-project="PROJECT_ID"
 *           data-patchwork-color="#6366f1"
 *           data-patchwork-position="bottom-right">
 *   </script>
 *
 * The widget renders a floating button that opens a slide-out panel
 * showing the latest changelog entries. Uses Shadow DOM for full
 * style isolation — no CSS conflicts with host pages.
 */

interface WidgetEntry {
  id: string;
  title: string;
  content: string;
  categories: string[];
  publishedAt: string | null;
}

interface WidgetData {
  project: { name: string; slug: string; primaryColor: string };
  entries: WidgetEntry[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: "#dcfce7", text: "#166534" },
  improved: { bg: "#dbeafe", text: "#1e40af" },
  fixed: { bg: "#fef3c7", text: "#92400e" },
  breaking: { bg: "#fee2e2", text: "#991b1b" },
};

const CATEGORY_LABELS: Record<string, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
  breaking: "Breaking",
};

function init() {
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script) return;

  const projectId = script.getAttribute("data-patchwork-project");
  if (!projectId) {
    console.warn("[Patchwork] Missing data-patchwork-project attribute");
    return;
  }

  const color = script.getAttribute("data-patchwork-color") || "#6366f1";
  const position = script.getAttribute("data-patchwork-position") || "bottom-right";
  const baseUrl = new URL(script.src).origin;

  const host = document.createElement("div");
  host.id = "patchwork-widget";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "closed" });

  // Position mapping
  const posMap: Record<string, string> = {
    "bottom-right": "bottom:20px;right:20px",
    "bottom-left": "bottom:20px;left:20px",
  };
  const posStyle = posMap[position] || posMap["bottom-right"];

  shadow.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
.pw-trigger{
  position:fixed;${posStyle};z-index:2147483647;
  width:52px;height:52px;border-radius:50%;border:none;
  background:${color};color:#fff;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 12px rgba(0,0,0,.15);
  transition:transform .2s,box-shadow .2s;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
.pw-trigger:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(0,0,0,.2)}
.pw-trigger svg{width:24px;height:24px;fill:currentColor}
.pw-badge{
  position:absolute;top:-2px;right:-2px;
  min-width:18px;height:18px;border-radius:9px;
  background:#ef4444;color:#fff;font-size:11px;font-weight:700;
  display:flex;align-items:center;justify-content:center;padding:0 5px;
}
.pw-badge:empty{display:none}
.pw-panel{
  position:fixed;${position.includes("right") ? "right:20px" : "left:20px"};
  bottom:82px;z-index:2147483646;
  width:380px;max-height:520px;
  background:#fff;border-radius:12px;
  box-shadow:0 12px 40px rgba(0,0,0,.12),0 0 0 1px rgba(0,0,0,.05);
  display:none;flex-direction:column;overflow:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  color:#111827;
  animation:pw-slide .2s ease-out;
}
@keyframes pw-slide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.pw-panel.open{display:flex}
.pw-header{
  padding:16px 20px;border-bottom:1px solid #e5e7eb;
  display:flex;align-items:center;justify-content:space-between;
  background:#fafafa;flex-shrink:0;
}
.pw-header h2{font-size:15px;font-weight:700;color:#111827}
.pw-close{
  width:28px;height:28px;border:none;background:none;cursor:pointer;
  color:#6b7280;display:flex;align-items:center;justify-content:center;
  border-radius:6px;font-size:18px;
}
.pw-close:hover{background:#f3f4f6;color:#111827}
.pw-body{overflow-y:auto;padding:16px 20px;flex:1}
.pw-entry{margin-bottom:20px}
.pw-entry:last-child{margin-bottom:0}
.pw-entry-meta{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap}
.pw-date{font-size:12px;color:#9ca3af}
.pw-cat{display:inline-block;padding:1px 8px;border-radius:9999px;font-size:11px;font-weight:600}
.pw-entry-title{font-size:14px;font-weight:600;color:#111827;margin-bottom:6px;line-height:1.4}
.pw-entry-content{font-size:13px;color:#4b5563;line-height:1.6}
.pw-entry-content p{margin:0 0 8px}
.pw-entry-content p:last-child{margin:0}
.pw-entry-content ul,.pw-entry-content ol{margin:0 0 8px;padding-left:18px}
.pw-entry-content li{margin-bottom:2px}
.pw-entry-content code{font-size:.9em;background:#f3f4f6;padding:1px 4px;border-radius:3px}
.pw-entry-content pre{background:#1f2937;color:#f9fafb;padding:10px;border-radius:6px;overflow-x:auto;font-size:12px;margin:8px 0}
.pw-entry-content pre code{background:none;padding:0}
.pw-entry-content a{color:${color}}
.pw-entry-content img{max-width:100%;border-radius:6px}
.pw-divider{border:none;border-top:1px solid #f3f4f6;margin:16px 0}
.pw-footer{
  padding:10px 20px;border-top:1px solid #e5e7eb;
  text-align:center;flex-shrink:0;background:#fafafa;
}
.pw-footer a{font-size:11px;color:#9ca3af;text-decoration:none}
.pw-footer a:hover{color:#6b7280}
.pw-empty{padding:40px 20px;text-align:center;color:#9ca3af;font-size:14px}
.pw-loading{padding:40px 20px;text-align:center;color:#9ca3af;font-size:14px}
@media(max-width:440px){
  .pw-panel{width:calc(100vw - 20px);left:10px;right:10px;bottom:78px;max-height:70vh}
}
</style>
<button class="pw-trigger" aria-label="View changelog">
  <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
  <span class="pw-badge"></span>
</button>
<div class="pw-panel">
  <div class="pw-header">
    <h2>What's New</h2>
    <button class="pw-close" aria-label="Close">&times;</button>
  </div>
  <div class="pw-body">
    <div class="pw-loading">Loading...</div>
  </div>
  <div class="pw-footer">
    <a href="#" target="_blank" rel="noopener">Powered by Patchwork</a>
  </div>
</div>`;

  const trigger = shadow.querySelector(".pw-trigger") as HTMLElement;
  const panel = shadow.querySelector(".pw-panel") as HTMLElement;
  const closeBtn = shadow.querySelector(".pw-close") as HTMLElement;
  const body = shadow.querySelector(".pw-body") as HTMLElement;
  const badge = shadow.querySelector(".pw-badge") as HTMLElement;
  const footerLink = shadow.querySelector(".pw-footer a") as HTMLAnchorElement;

  let isOpen = false;
  let loaded = false;

  trigger.addEventListener("click", () => {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
    if (isOpen && !loaded) {
      loadEntries();
    }
    // Clear badge on open
    if (isOpen) {
      badge.textContent = "";
      try { localStorage.setItem(`pw_seen_${projectId}`, Date.now().toString()); } catch {}
    }
  });

  closeBtn.addEventListener("click", () => {
    isOpen = false;
    panel.classList.remove("open");
  });

  async function loadEntries() {
    try {
      const res = await fetch(`${baseUrl}/api/v1/widget/${projectId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: WidgetData = await res.json();

      footerLink.href = `${baseUrl}/${data.project.slug}`;

      if (data.entries.length === 0) {
        body.innerHTML = '<div class="pw-empty">No updates yet. Check back soon!</div>';
        loaded = true;
        return;
      }

      body.innerHTML = data.entries
        .map((entry, i) => {
          const date = entry.publishedAt
            ? new Date(entry.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "";

          const badges = entry.categories
            .map((cat) => {
              const c = CATEGORY_COLORS[cat];
              if (!c) return "";
              return `<span class="pw-cat" style="background:${c.bg};color:${c.text}">${CATEGORY_LABELS[cat] || cat}</span>`;
            })
            .join("");

          const divider = i > 0 ? '<hr class="pw-divider">' : "";

          return `${divider}<div class="pw-entry">
  <div class="pw-entry-meta">${badges}<span class="pw-date">${date}</span></div>
  <div class="pw-entry-title">${escapeHtml(entry.title)}</div>
  <div class="pw-entry-content">${entry.content}</div>
</div>`;
        })
        .join("");

      loaded = true;

      // Check for unseen entries
      showBadge(data);
    } catch (err) {
      body.innerHTML = '<div class="pw-empty">Could not load updates.</div>';
      console.warn("[Patchwork] Failed to load widget data:", err);
    }
  }

  function showBadge(data: WidgetData) {
    try {
      const lastSeen = Number(localStorage.getItem(`pw_seen_${projectId}`) || "0");
      if (!lastSeen) {
        badge.textContent = String(Math.min(data.entries.length, 9));
        return;
      }
      const newCount = data.entries.filter(
        (e) => e.publishedAt && new Date(e.publishedAt).getTime() > lastSeen
      ).length;
      if (newCount > 0) badge.textContent = String(Math.min(newCount, 9));
    } catch {}
  }

  // Prefetch on idle to show badge
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(() => {
      if (!loaded) prefetch();
    });
  } else {
    setTimeout(() => {
      if (!loaded) prefetch();
    }, 2000);
  }

  async function prefetch() {
    try {
      const res = await fetch(`${baseUrl}/api/v1/widget/${projectId}`);
      if (!res.ok) return;
      const data: WidgetData = await res.json();
      showBadge(data);
    } catch {}
  }
}

function escapeHtml(text: string): string {
  const el = document.createElement("span");
  el.textContent = text;
  return el.innerHTML;
}

// Auto-init on script load
init();
