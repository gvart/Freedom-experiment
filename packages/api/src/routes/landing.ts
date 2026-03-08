import { Hono } from "hono";
import { config } from "../config.js";

const app = new Hono();

app.get("/", (c) => {
  const baseUrl = config.baseUrl;

  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Patchwork — Beautiful changelogs your users actually read</title>
  <meta name="description" content="Open-source changelog platform with a rich editor, public pages, embeddable widget, and API. Self-host for free or use our hosted plan." />
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{--primary:#6366f1;--primary-dark:#4f46e5;--gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;--gray-400:#9ca3af;--gray-500:#6b7280;--gray-600:#4b5563;--gray-700:#374151;--gray-800:#1f2937;--gray-900:#111827}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:var(--gray-900);-webkit-font-smoothing:antialiased;background:#fff}
    a{color:var(--primary);text-decoration:none}
    a:hover{text-decoration:underline}

    /* Nav */
    .nav{border-bottom:1px solid var(--gray-200);padding:16px 0}
    .nav-inner{max-width:1080px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between}
    .nav-logo{font-size:20px;font-weight:800;color:var(--primary);text-decoration:none}
    .nav-links{display:flex;gap:24px;align-items:center}
    .nav-links a{color:var(--gray-600);font-size:14px;font-weight:500}
    .nav-links a:hover{color:var(--gray-900);text-decoration:none}
    .btn{display:inline-block;padding:8px 20px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none!important;transition:all .15s}
    .btn-primary{background:var(--primary);color:#fff!important}
    .btn-primary:hover{background:var(--primary-dark)}
    .btn-ghost{color:var(--gray-700)!important;border:1px solid var(--gray-200)}
    .btn-ghost:hover{border-color:var(--gray-400);background:var(--gray-50)}

    /* Hero */
    .hero{padding:80px 24px 64px;text-align:center;background:linear-gradient(180deg,#f5f3ff 0%,#fff 100%)}
    .hero h1{font-size:clamp(32px,5vw,56px);font-weight:800;line-height:1.1;max-width:700px;margin:0 auto 20px;letter-spacing:-.02em}
    .hero h1 span{color:var(--primary)}
    .hero p{font-size:clamp(16px,2vw,20px);color:var(--gray-600);max-width:560px;margin:0 auto 36px;line-height:1.6}
    .hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .hero-actions .btn{padding:12px 28px;font-size:16px}
    .hero-sub{margin-top:16px;font-size:13px;color:var(--gray-400)}

    /* Competitors */
    .compare{padding:48px 24px;text-align:center;background:var(--gray-50);border-top:1px solid var(--gray-100);border-bottom:1px solid var(--gray-100)}
    .compare p{font-size:14px;color:var(--gray-500);max-width:600px;margin:0 auto}
    .compare strong{color:var(--gray-700)}

    /* Features */
    .features{padding:80px 24px;max-width:1080px;margin:0 auto}
    .features h2{text-align:center;font-size:28px;font-weight:700;margin-bottom:12px}
    .features .subtitle{text-align:center;color:var(--gray-500);font-size:16px;margin-bottom:48px}
    .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px}
    .feature{padding:28px;border-radius:12px;border:1px solid var(--gray-200);background:#fff}
    .feature-icon{width:40px;height:40px;border-radius:10px;background:#ede9fe;color:var(--primary);display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:20px}
    .feature h3{font-size:17px;font-weight:600;margin-bottom:8px}
    .feature p{font-size:14px;color:var(--gray-600);line-height:1.6}

    /* Widget demo */
    .widget-section{padding:80px 24px;background:var(--gray-50);border-top:1px solid var(--gray-100)}
    .widget-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
    .widget-text h2{font-size:28px;font-weight:700;margin-bottom:16px}
    .widget-text p{color:var(--gray-600);line-height:1.7;margin-bottom:20px}
    .widget-code{background:var(--gray-800);color:#e5e7eb;padding:24px;border-radius:12px;font-family:"SF Mono",Monaco,"Cascadia Code",monospace;font-size:13px;line-height:1.8;overflow-x:auto;white-space:pre}
    .widget-code .tag{color:#7dd3fc}
    .widget-code .attr{color:#c4b5fd}
    .widget-code .val{color:#86efac}
    @media(max-width:768px){.widget-inner{grid-template-columns:1fr}}

    /* Pricing */
    .pricing{padding:80px 24px;max-width:900px;margin:0 auto}
    .pricing h2{text-align:center;font-size:28px;font-weight:700;margin-bottom:12px}
    .pricing .subtitle{text-align:center;color:var(--gray-500);font-size:16px;margin-bottom:48px}
    .pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
    .plan{padding:28px;border-radius:12px;border:1px solid var(--gray-200);background:#fff}
    .plan.featured{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
    .plan-name{font-size:16px;font-weight:600;margin-bottom:4px}
    .plan-price{font-size:32px;font-weight:800;margin-bottom:4px}
    .plan-price span{font-size:14px;font-weight:400;color:var(--gray-500)}
    .plan-desc{font-size:13px;color:var(--gray-500);margin-bottom:20px}
    .plan ul{list-style:none;margin-bottom:24px}
    .plan li{font-size:14px;color:var(--gray-600);padding:6px 0;padding-left:20px;position:relative}
    .plan li::before{content:"✓";position:absolute;left:0;color:var(--primary);font-weight:700}
    .plan .btn{width:100%;text-align:center}

    /* CTA */
    .cta{padding:80px 24px;text-align:center;background:linear-gradient(180deg,#fff 0%,#f5f3ff 100%)}
    .cta h2{font-size:28px;font-weight:700;margin-bottom:12px}
    .cta p{color:var(--gray-600);font-size:16px;margin-bottom:32px;max-width:480px;margin-left:auto;margin-right:auto}

    /* Footer */
    .footer{padding:32px 24px;border-top:1px solid var(--gray-200);text-align:center;font-size:13px;color:var(--gray-400)}
  </style>
</head>
<body>

<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo">Patchwork</a>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="https://github.com/gvart/Freedom-experiment">GitHub</a>
      <a href="/login" class="btn btn-ghost">Log in</a>
      <a href="/register" class="btn btn-primary">Get Started</a>
    </div>
  </div>
</nav>

<section class="hero">
  <h1>Beautiful changelogs your users <span>actually read</span></h1>
  <p>Write release notes in a rich editor, publish to a beautiful page, and embed a 7KB widget on your site. Open-source and self-hostable.</p>
  <div class="hero-actions">
    <a href="/register" class="btn btn-primary">Start for Free</a>
    <a href="https://github.com/gvart/Freedom-experiment" class="btn btn-ghost">View on GitHub</a>
  </div>
  <p class="hero-sub">No credit card required. Free forever for 1 project.</p>
</section>

<section class="compare">
  <p>Beamer charges <strong>$49/mo</strong>. AnnounceKit charges <strong>$49/mo</strong>. Canny charges <strong>$400/mo</strong>.<br>Patchwork is <strong>open-source</strong> and starts at <strong>$0</strong>.</p>
</section>

<section class="features" id="features">
  <h2>Everything you need to ship changelogs</h2>
  <p class="subtitle">From writing to publishing to embedding — all in one platform.</p>
  <div class="features-grid">
    <div class="feature">
      <div class="feature-icon">✍</div>
      <h3>Markdown Editor</h3>
      <p>Write release notes with a live-preview markdown editor. Support for headings, lists, code blocks, images, and more.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">📄</div>
      <h3>Public Changelog Pages</h3>
      <p>Beautiful, responsive pages served at your project's slug. Branded with your colors and logo. RSS feeds included.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">🔔</div>
      <h3>Embeddable Widget</h3>
      <p>A 7KB script tag that adds a floating changelog button to any site. Shadow DOM isolation, notification badges, slide-out panel.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">🏷</div>
      <h3>Categories</h3>
      <p>Tag entries as New, Improved, Fixed, or Breaking. Color-coded badges help users scan what matters to them.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">🔑</div>
      <h3>API-First</h3>
      <p>Full REST API with per-project API keys. Automate changelog creation from your CI/CD pipeline or scripts.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">🐳</div>
      <h3>Self-Hostable</h3>
      <p>Run on your own infrastructure with <code>docker compose up</code>. SQLite database, zero external dependencies. Your data stays yours.</p>
    </div>
  </div>
</section>

<section class="widget-section">
  <div class="widget-inner">
    <div class="widget-text">
      <h2>One script tag. That's it.</h2>
      <p>Add the Patchwork widget to your site with a single line. Your users see a floating button with a notification badge that opens a panel with your latest updates. 7KB, no dependencies, complete style isolation via Shadow DOM.</p>
      <p>Customize the color, position, and behavior with simple data attributes.</p>
    </div>
    <div class="widget-code"><span class="tag">&lt;script</span>
  <span class="attr">src</span>=<span class="val">"${baseUrl}/widget.js"</span>
  <span class="attr">data-patchwork-project</span>=<span class="val">"YOUR_PROJECT_ID"</span>
  <span class="attr">data-patchwork-color</span>=<span class="val">"#6366f1"</span>
  <span class="attr">data-patchwork-position</span>=<span class="val">"bottom-right"</span><span class="tag">&gt;</span>
<span class="tag">&lt;/script&gt;</span></div>
  </div>
</section>

<section class="pricing" id="pricing">
  <h2>Simple, honest pricing</h2>
  <p class="subtitle">Self-host for free forever, or let us handle the infrastructure.</p>
  <div class="pricing-grid">
    <div class="plan">
      <div class="plan-name">Free</div>
      <div class="plan-price">$0<span>/mo</span></div>
      <div class="plan-desc">For side projects and trying things out</div>
      <ul>
        <li>1 project</li>
        <li>50 entries</li>
        <li>Public changelog page</li>
        <li>Embeddable widget</li>
        <li>RSS feed</li>
      </ul>
      <a href="/register" class="btn btn-ghost">Get Started</a>
    </div>
    <div class="plan featured">
      <div class="plan-name">Pro</div>
      <div class="plan-price">$9<span>/mo</span></div>
      <div class="plan-desc">For growing products and teams</div>
      <ul>
        <li>5 projects</li>
        <li>Unlimited entries</li>
        <li>Remove "Powered by" branding</li>
        <li>3 team members</li>
        <li>Priority support</li>
      </ul>
      <a href="/register" class="btn btn-primary">Start Free Trial</a>
    </div>
    <div class="plan">
      <div class="plan-name">Team</div>
      <div class="plan-price">$29<span>/mo</span></div>
      <div class="plan-desc">For organizations shipping at scale</div>
      <ul>
        <li>Unlimited projects</li>
        <li>Unlimited entries</li>
        <li>Remove branding</li>
        <li>10 team members</li>
        <li>Custom domain</li>
      </ul>
      <a href="/register" class="btn btn-ghost">Contact Us</a>
    </div>
  </div>
</section>

<section class="cta">
  <h2>Ready to ship better changelogs?</h2>
  <p>Join developers who keep their users informed with beautiful, embeddable release notes.</p>
  <div class="hero-actions">
    <a href="/register" class="btn btn-primary" style="padding:12px 28px;font-size:16px">Start for Free</a>
  </div>
</section>

<footer class="footer">
  &copy; ${new Date().getFullYear()} Patchwork. Open-source changelog platform.
  &nbsp;&middot;&nbsp; <a href="https://github.com/gvart/Freedom-experiment">GitHub</a>
</footer>

</body>
</html>`);
});

export default app;
