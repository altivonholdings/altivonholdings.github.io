// E‑Commerce Sleek – Template JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const headerIcons = document.querySelector('.header-icons');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      // For mobile, we could show a fullscreen menu (simplified: just alert for demo)
      alert('Mobile menu would open here (demo).');
    });
  }

  // Add to cart simulation
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const product = this.dataset.product || 'item';
      alert(`🛒 Added "${product}" to cart (demo).`);
      // Update cart count (demo)
      const cartCount = document.querySelector('.cart-count');
      if (cartCount) {
        let count = parseInt(cartCount.innerText) || 0;
        cartCount.innerText = count + 1;
      }
    });
  });

  // Simple search simulation
  const searchForm = document.querySelector('.search-bar');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = searchForm.querySelector('input');
      alert(`Searching for "${input.value}" (demo)`);
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === "#") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});