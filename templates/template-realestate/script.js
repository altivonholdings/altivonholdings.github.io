// Premium Real Estate – Template JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // Filter tabs for listings
  const tabBtns = document.querySelectorAll('.tab-btn');
  const listings = document.querySelectorAll('.listing-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter listings
      listings.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Agents slider
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  const track = document.querySelector('.agents-track');

  if (prevBtn && nextBtn && track) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -280, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: 280, behavior: 'smooth' });
    });
  }

  // Mortgage calculator
  const priceRange = document.getElementById('price-range');
  const downRange = document.getElementById('down-range');
  const rateRange = document.getElementById('rate-range');
  const termSelect = document.getElementById('term');
  const priceDisplay = document.getElementById('price-display');
  const downDisplay = document.getElementById('down-display');
  const rateDisplay = document.getElementById('rate-display');
  const monthlySpan = document.getElementById('monthly-payment');

  function formatNumber(num) {
    return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  function calculate() {
    const price = parseFloat(priceRange.value);
    const downPercent = parseFloat(downRange.value) / 100;
    const rate = parseFloat(rateRange.value) / 100 / 12;
    const term = parseInt(termSelect.value) * 12;

    const down = price * downPercent;
    const loan = price - down;

    if (loan <= 0) {
      monthlySpan.innerText = '$0';
      return;
    }

    const monthly = (loan * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    monthlySpan.innerText = formatNumber(monthly);
  }

  if (priceRange && downRange && rateRange && termSelect) {
    function updateDisplays() {
      priceDisplay.innerText = '$' + parseInt(priceRange.value).toLocaleString();
      downDisplay.innerText = downRange.value + '%';
      rateDisplay.innerText = rateRange.value + '%';
      calculate();
    }

    priceRange.addEventListener('input', updateDisplays);
    downRange.addEventListener('input', updateDisplays);
    rateRange.addEventListener('input', updateDisplays);
    termSelect.addEventListener('change', calculate);
    updateDisplays();
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