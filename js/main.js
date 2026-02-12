/* ===== MAIN.JS ===== */
// Mobile navigation, sticky header, scroll reveal, stats counter, back to top, portfolio filter

document.addEventListener('DOMContentLoaded', function() {

  // ---------- 1. Mobile Navigation Toggle ----------
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
    });
  }

  // ---------- 2. Sticky Navbar Shadow on Scroll ----------
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ---------- 3. Back to Top Button ----------
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    });
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- 4. Scroll Reveal (Intersection Observer) ----------
  const revealElements = document.querySelectorAll('.reveal-fade, .reveal-left, .reveal-right, .reveal-up');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optional: unobserve after revealed
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ---------- 5. Stats Counter Animation ----------
  const stats = document.querySelectorAll('.stat-number');
  if (stats.length) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          let count = 0;
          const updateCounter = () => {
            const increment = target / 50; // smooth increment
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

  // ---------- 6. Portfolio Filter (Services page) ----------
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  if (filterButtons.length && portfolioItems.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        // active class
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // filter items
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

});