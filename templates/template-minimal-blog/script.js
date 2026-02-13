// Minimal Blog – Template JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === "#") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        if (nav) nav.classList.remove('active');
      }
    });
  });

  // Load more simulation
  const loadMoreBtn = document.querySelector('.load-more .btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      alert('More articles would load here (demo).');
    });
  }
});