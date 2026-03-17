/**
 * Altivon Holdings – Shared Footer Injector
 * Automatically replaces any <footer> on the page with the full detailed footer.
 * Detects current page depth to resolve relative paths correctly.
 * Copyright year auto-set using current date.
 */
(function () {
  'use strict';

  // ── Path depth detection ──────────────────────────────────────────────────
  // Count how many directories deep we are from the root
  const pathParts = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  // Find the "altivon-v2" root marker if present, else use hostname root
  const depth = pathParts.length > 0 ? pathParts.length : 0;

  // Build relative prefix back to root
  // e.g. depth=1 → "../"  |  depth=2 → "../../"  |  depth=0 → ""
  function rootPrefix(d) {
    if (d <= 0) return './';
    return '../'.repeat(d);
  }

  const root = rootPrefix(depth);

  // ── Copyright year ────────────────────────────────────────────────────────
  const year = new Date().getFullYear();

  // ── CSS injection (only if not already present) ───────────────────────────
  if (!document.getElementById('altivon-footer-styles')) {
    const style = document.createElement('style');
    style.id = 'altivon-footer-styles';
    style.textContent = `
      /* Altivon Shared Footer Styles */
      footer.altivon-footer{background:var(--ink2,#0d1220);border-top:1px solid var(--border,rgba(255,255,255,.07));padding:60px 0 28px;font-family:'Bricolage Grotesque',sans-serif}
      .altivon-footer .container{max-width:1200px;margin:0 auto;padding:0 48px}
      .altivon-footer .footer-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
      .altivon-footer .footer-brand p{font-size:14px;color:var(--muted,#7c8ba1);line-height:1.8;margin-top:14px;max-width:260px}
      .altivon-footer .footer-h{font-family:'Clash Display',sans-serif;font-size:13px;font-weight:600;color:#fff;letter-spacing:.5px;margin-bottom:18px;text-transform:uppercase}
      .altivon-footer .footer-links{list-style:none;display:flex;flex-direction:column;gap:9px;padding:0;margin:0}
      .altivon-footer .footer-links a{font-size:14px;color:var(--muted,#7c8ba1);transition:.2s;text-decoration:none}
      .altivon-footer .footer-links a:hover{color:var(--orange2,#fb923c)}
      .altivon-footer .footer-contact p{font-size:14px;color:var(--muted,#7c8ba1);margin-bottom:9px;display:flex;align-items:flex-start;gap:8px}
      .altivon-footer .footer-bottom{border-top:1px solid var(--border,rgba(255,255,255,.07));padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
      .altivon-footer .footer-bottom p{font-size:13px;color:var(--muted,#7c8ba1)}
      .altivon-footer .footer-socials{display:flex;gap:10px;margin-top:18px}
      .altivon-footer .footer-socials a{width:36px;height:36px;border-radius:9px;background:var(--surface2,rgba(255,255,255,.04));border:1px solid var(--border,rgba(255,255,255,.07));display:flex;align-items:center;justify-content:center;font-size:15px;transition:.3s;text-decoration:none}
      .altivon-footer .footer-socials a:hover{background:var(--blue,#2563eb);border-color:var(--blue,#2563eb);transform:translateY(-3px)}
      .altivon-footer .f-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
      .altivon-footer .f-logo-icon{width:38px;height:38px;border-radius:9px;background:linear-gradient(135deg,#2563eb,#06b6d4);display:flex;align-items:center;justify-content:center;font-family:'Clash Display',sans-serif;font-weight:700;font-size:18px;color:#fff;flex-shrink:0}
      .altivon-footer .f-logo-name{font-family:'Clash Display',sans-serif;font-weight:600;font-size:17px;color:#fff}
      .altivon-footer .f-logo-name em{color:var(--orange,#f97316);font-style:normal}
      @media(max-width:900px){.altivon-footer .footer-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:600px){.altivon-footer .footer-grid{grid-template-columns:1fr}.altivon-footer .container{padding:0 20px}}
    `;
    document.head.appendChild(style);
  }

  // ── Footer HTML builder ───────────────────────────────────────────────────
  function buildFooter() {
    const footer = document.createElement('footer');
    footer.className = 'altivon-footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">

          <!-- Brand -->
          <div class="footer-brand">
            <a href="${root}index.html" class="f-logo">
              <div class="f-logo-icon">A</div>
              <span class="f-logo-name">Altivon <em>Holdings</em></span>
            </a>
            <p>World-class tech solutions from the heart of Chandauli. Serving local businesses and global clients across India and worldwide.</p>
            <div class="footer-socials">
              <a href="#" title="Facebook">📘</a>
              <a href="#" title="Instagram">📷</a>
              <a href="#" title="LinkedIn">💼</a>
              <a href="https://wa.me/916393741885" target="_blank" rel="noopener" title="WhatsApp">💬</a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <div class="footer-h">Quick Links</div>
            <ul class="footer-links">
              <li><a href="${root}index.html">Home</a></li>
              <li><a href="${root}services/index.html">Services</a></li>
              <li><a href="${root}templates/index.html">Templates</a></li>
              <li><a href="${root}products/index.html">Products</a></li>
              <li><a href="${root}pricing/index.html">Pricing</a></li>
              <li><a href="${root}docs/index.html">Documentation</a></li>
            </ul>
          </div>

          <!-- Company -->
          <div>
            <div class="footer-h">Company</div>
            <ul class="footer-links">
              <li><a href="${root}about/index.html">About Us</a></li>
              <li><a href="${root}contact/index.html">Contact</a></li>
              <li><a href="${root}templates/index.html">Web Templates</a></li>
              <li><a href="${root}products/index.html">IT Products</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="footer-contact">
            <div class="footer-h">Contact</div>
            <p>📞 +91 63937 41885</p>
            <p>✉️ altivonholdings@gmail.com</p>
            <p>📍 Chandauli, UP 232104</p>
            <p style="margin-top:8px">🌍 Worldwide Service</p>
          </div>

        </div>
        <div class="footer-bottom">
          <p>© <span class="altivon-copy-year"></span> Altivon Holdings. All rights reserved.</p>
          <p>Made with ❤️ in Chandauli, for the world 🌍</p>
        </div>
      </div>
    `;

    // Set dynamic year
    footer.querySelectorAll('.altivon-copy-year').forEach(el => {
      el.textContent = year;
    });

    return footer;
  }

  // ── Replace existing footer or append ────────────────────────────────────
  function injectFooter() {
    const existing = document.querySelector('footer');
    const newFooter = buildFooter();

    if (existing) {
      existing.replaceWith(newFooter);
    } else {
      document.body.appendChild(newFooter);
    }
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }

  // Also update any existing static © year in the page (index.html has id="fRights")
  document.addEventListener('DOMContentLoaded', function () {
    const fRights = document.getElementById('fRights');
    if (fRights) {
      fRights.textContent = `© ${year} Altivon Holdings. All rights reserved.`;
    }
  });

})();
