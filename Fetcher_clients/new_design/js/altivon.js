/* ═══════════════════════════════════════════════════════
   ALTIVON HOLDINGS — SHARED JS v3.0
   Handles: nav, scroll-reveal, counters, back-to-top,
            FAQ, toast, mobile menu, progress bar
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. STICKY NAV + SCROLL PROGRESS ── */
  const header = document.getElementById('siteHeader');
  const btt    = document.getElementById('backToTop');

  // Create scroll progress bar
  const progressBar = document.createElement('div');
  progressBar.id = 'scrollProgress';
  progressBar.style.cssText = `
    position:fixed;top:0;left:0;height:2.5px;width:0;
    background:linear-gradient(90deg,#4F46E5,#818CF8);
    z-index:9999;transition:width .1s linear;pointer-events:none;
  `;
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.body.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;

    if (header) header.classList.toggle('scrolled', scrolled > 40);
    if (btt)    btt.classList.toggle('show', scrolled > 500);
    progressBar.style.width = pct + '%';
  }, { passive: true });

  if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── 2. MOBILE NAV ── */
  const navToggle = document.getElementById('navToggle');
  const mainNav   = document.getElementById('mainNav');
  const toggleIcon = navToggle?.querySelector('i');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      if (toggleIcon) {
        toggleIcon.className = open ? 'fas fa-times' : 'fas fa-bars';
      }
      navToggle.setAttribute('aria-expanded', open);
    });

    // Close nav on outside click
    document.addEventListener('click', (e) => {
      if (!header?.contains(e.target) && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        if (toggleIcon) toggleIcon.className = 'fas fa-bars';
      }
    });

    // Close nav on link click
    mainNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mainNav.classList.remove('open');
        if (toggleIcon) toggleIcon.className = 'fas fa-bars';
      });
    });
  }

  /* ── 3. SCROLL REVEAL ── */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => revealIO.observe(el));

  /* ── 4. COUNTER ANIMATION ── */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseFloat(el.dataset.target || 0);
      const decimals = (el.dataset.decimals || 0) | 0;
      const dur    = 1800;
      let start    = 0;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / dur, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;
        el.textContent = current.toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => counterIO.observe(el));

  /* ── 5. FAQ ACCORDION ── */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        const body = i.querySelector('.faq-body');
        if (body) body.style.maxHeight = '0';
      });
      // Open clicked
      if (!open) {
        item.classList.add('open');
        const body = item.querySelector('.faq-body');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ── 6. TOAST UTILITY ── */
  window.showToast = (msg, type = 'success', duration = 3500) => {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'toast';
      toast.innerHTML = `<i class="fas fa-check-circle"></i><span></span>`;
      document.body.appendChild(toast);
    }
    const icon = toast.querySelector('i');
    const span = toast.querySelector('span');
    span.textContent = msg;
    toast.className = `toast ${type}`;
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  };

  /* ── 7. SMOOTH ANCHOR SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = (document.getElementById('siteHeader')?.offsetHeight || 70) + 20;
        window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' });
      }
    });
  });

  /* ── 8. ACTIVE NAV HIGHLIGHT ── */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-list a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

});
