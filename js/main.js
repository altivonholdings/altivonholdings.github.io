/* ===== MAIN.JS ===== */
// Mobile navigation (event delegation), sticky header, scroll reveal, stats counter, back to top (event delegation), portfolio filter
// + Dynamic header/footer loader with fallback

(function() {
  // Store observers to disconnect before re-initializing
  let revealObserver = null;
  let statObserver = null;

  // ---------- Helper: Set active nav link based on current URL ----------
  function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.main-nav .nav-list a');
    if (!navLinks.length) return;
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');

      // Handle root / index.html
      if (href === '/' || href === 'index.html' || href === './') {
        if (currentPath === '/' || currentPath.endsWith('/index.html')) {
          link.classList.add('active');
        }
      } else {
        // For other pages, check if current path ends with the href
        // This works for relative links like "services.html"
        if (currentPath.endsWith(href)) {
          link.classList.add('active');
        }
      }
    });
  }

  // ---------- Scroll effects (sticky header + back to top visibility) ----------
  function initScrollEffects() {
    // Attach scroll listener only once
    if (!window._scrollEffectsAttached) {
      window.addEventListener('scroll', function() {
        // Sticky header
        const header = document.querySelector('.site-header');
        if (header) {
          if (window.scrollY > 50) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
        }

        // Back to top button visibility
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
          if (window.scrollY > 300) {
            backToTop.classList.add('show');
          } else {
            backToTop.classList.remove('show');
          }
        }
      });
      window._scrollEffectsAttached = true;
    }
  }

  // ---------- Event delegation for mobile nav toggle and back to top click ----------
  function initDelegatedEvents() {
    if (!window._delegatedEventsAttached) {
      document.addEventListener('click', function(e) {
        // Mobile nav toggle
        const toggle = e.target.closest('.nav-toggle');
        if (toggle) {
          const nav = document.querySelector('.main-nav');
          if (nav) nav.classList.toggle('active');
        }

        // Back to top click
        const backToTop = e.target.closest('.back-to-top');
        if (backToTop) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      window._delegatedEventsAttached = true;
    }
  }

  // ---------- Scroll Reveal (Intersection Observer) ----------
  function initReveal() {
    if (revealObserver) revealObserver.disconnect();

    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-left, .reveal-right, .reveal-up');
    if (!revealElements.length) return;

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ---------- Stats Counter Animation ----------
  function initStats() {
    if (statObserver) statObserver.disconnect();

    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          let count = 0;
          const updateCounter = () => {
            const increment = target / 50;
            if (count < target) {
              count += increment;
              el.innerText = Math.ceil(count) + suffix;
              requestAnimationFrame(updateCounter);
            } else {
              el.innerText = target + suffix;
            }
          };
          updateCounter();
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => statObserver.observe(stat));
  }

  // ---------- Portfolio Filter (Services page) ----------
  function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    if (!filterButtons.length || !portfolioItems.length) return;

    // Remove existing listeners to avoid duplicates
    filterButtons.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });

    const freshButtons = document.querySelectorAll('.filter-btn');
    freshButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        freshButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        portfolioItems.forEach(item => {
          if (filter === 'all' || item.classList.contains(filter)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // ---------- Load header and footer from separate files ----------
  async function loadSharedComponents() {
    try {
      const [headerRes, footerRes] = await Promise.all([
        fetch('/header.html'),
        fetch('/footer.html')
      ]);

      if (!headerRes.ok || !footerRes.ok) {
        throw new Error('Failed to fetch header or footer');
      }

      const headerHTML = await headerRes.text();
      const footerHTML = await footerRes.text();

      const oldHeader = document.querySelector('.site-header');
      if (oldHeader) oldHeader.outerHTML = headerHTML;

      const oldFooter = document.querySelector('.site-footer');
      if (oldFooter) oldFooter.outerHTML = footerHTML;

      setActiveNavLink();

      // Re-initialize components that rely on the new DOM elements
      initReveal();
      initStats();
      initPortfolioFilter();

      console.log('Header/Footer dynamically loaded');
    } catch (error) {
      console.log('Using fallback header/footer (dynamic load failed)');
      setActiveNavLink(); // Ensure active class on existing nav
    }
  }

  // ---------- Main initialisation ----------
  function init() {
    initScrollEffects();
    initDelegatedEvents();
    initReveal();
    initStats();
    initPortfolioFilter();
    setActiveNavLink();
    loadSharedComponents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();