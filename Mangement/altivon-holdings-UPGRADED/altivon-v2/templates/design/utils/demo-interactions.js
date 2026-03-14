/* ===========================================
   ALTIVON HOLDINGS - DEMO INTERACTIONS
   Production-Ready Prototype Features
   =========================================== */

// Demo Bar Initialization
function initDemoBar(config = {}) {
  const defaults = {
    title: 'Design Preview',
    backHref: '../index.html',
    orderHref: '../contact.html',
    showStats: true
  };
  
  const settings = { ...defaults, ...config };
  
  const demoBar = document.createElement('div');
  demoBar.className = 'altivon-demo-bar';
  demoBar.innerHTML = `
    <div class="demo-bar-content">
      <div class="demo-bar-left">
        <span class="demo-badge">LIVE PREVIEW</span>
        <span class="demo-title">${settings.title}</span>
      </div>
      <div class="demo-bar-right">
        <button class="demo-btn demo-btn-ghost" onclick="window.location='${settings.backHref}'">
          ← Back to Menu
        </button>
        <button class="demo-btn demo-btn-primary" onclick="window.location='${settings.orderHref}'">
          Order This Design
        </button>
      </div>
    </div>
  `;
  
  document.body.insertBefore(demoBar, document.body.firstChild);
  
  // Add responsive handler
  handleDemoBarResize();
  window.addEventListener('resize', handleDemoBarResize);
}

function handleDemoBarResize() {
  const demoBar = document.querySelector('.altivon-demo-bar');
  if (!demoBar) return;
  
  if (window.innerWidth < 768) {
    demoBar.classList.add('mobile');
  } else {
    demoBar.classList.remove('mobile');
  }
}

// Interactive Demo Features
class DemoFeatures {
  constructor() {
    this.init();
  }
  
  init() {
    this.addClickTracking();
    this.addFormDemos();
    this.addScrollEffects();
    this.addButtonRipples();
  }
  
  // Track demo clicks
  addClickTracking() {
    document.querySelectorAll('a, button').forEach(el => {
      if (!el.hasAttribute('data-demo-tracked')) {
        el.setAttribute('data-demo-tracked', 'true');
        el.addEventListener('click', (e) => {
          // For demo purposes, prevent default on certain links
          if (el.getAttribute('href') === '#' || el.getAttribute('href') === 'javascript:void(0)') {
            e.preventDefault();
            this.showDemoNotification('This feature will work in the final implementation');
          }
        });
      }
    });
  }
  
  // Demo form handling
  addFormDemos() {
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.showDemoNotification('Form submitted successfully! (Demo Mode)', 'success');
        form.reset();
      });
    });
  }
  
  // Scroll animations
  addScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('section, .card, .feature-box').forEach(el => {
      observer.observe(el);
    });
  }
  
  // Button ripple effect
  addButtonRipples() {
    document.querySelectorAll('button, .btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }
  
  // Show notification
  showDemoNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `demo-notification demo-notification-${type}`;
    notification.innerHTML = `
      <div class="demo-notification-content">
        <span class="demo-notification-icon">
          ${type === 'success' ? '✓' : 'ℹ'}
        </span>
        <span class="demo-notification-text">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== 'javascript:void(0)') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const menuToggles = document.querySelectorAll('.menu-toggle, .mobile-menu-btn');
  menuToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const nav = document.querySelector('nav, .navbar, .navigation');
      if (nav) {
        nav.classList.toggle('mobile-active');
      }
    });
  });
}

// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll('.counter, .stat-number, [data-count]');
  
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count') || counter.textContent.replace(/\D/g, ''));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateCounter();
          observer.unobserve(counter);
        }
      });
    });
    
    observer.observe(counter);
  });
}

// Initialize all demo features
document.addEventListener('DOMContentLoaded', () => {
  new DemoFeatures();
  initSmoothScroll();
  initMobileMenu();
  animateCounters();
  
  // Add loading complete class
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);
});

// Export for use in individual pages
window.AltivonDemo = {
  initDemoBar,
  DemoFeatures,
  initSmoothScroll,
  initMobileMenu,
  animateCounters
};
