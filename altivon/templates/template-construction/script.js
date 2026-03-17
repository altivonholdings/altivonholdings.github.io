// Construction – Template JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // Stats counter animation
  const stats = document.querySelectorAll('.stat-number');
  if (stats.length) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          let count = 0;
          const updateCounter = () => {
            if (count < target) {
              count += Math.ceil(target / 50);
              el.innerText = count;
              requestAnimationFrame(updateCounter);
            } else {
              el.innerText = target;
            }
          };
          updateCounter();
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(stat => statObserver.observe(stat));
  }

  // Testimonial slider
  const track = document.querySelector('.testimonial-track');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  if (track && prevBtn && nextBtn) {
    let index = 0;
    const cards = document.querySelectorAll('.testimonial-card');
    const total = cards.length;

    const updateSlide = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
    };

    nextBtn.addEventListener('click', () => {
      index = (index + 1) % total;
      updateSlide();
    });

    prevBtn.addEventListener('click', () => {
      index = (index - 1 + total) % total;
      updateSlide();
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
});