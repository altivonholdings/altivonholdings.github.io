/**
 * blog-magazine - Enhanced Interactive Features
 * Altivon Holdings - Premium Demo
 */

document.addEventListener('DOMContentLoaded', function() {
    initInteractivity();
    addScrollEffects();
    handleForms();
    handleMobileMenu();
    initCounters();
    initBackToTop();
    initSmoothScroll();
    initVideoPlay();
});

function initInteractivity() {
    const buttons = document.querySelectorAll('button, .btn, a[class*="btn"], .subscribe-btn, .read-more-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#' || !this.getAttribute('href') || this.tagName === 'BUTTON') {
                e.preventDefault();
                showNotification('✨ This feature will be available in the final version', 'info');
            }
        });
    });

    // Mini-post click
    document.querySelectorAll('.mini-post, .lc, .ep-card').forEach(card => {
        card.addEventListener('click', () => {
            showNotification('📰 Opening article... (demo)', 'success');
        });
    });
}

function addScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.featured, .editors-pick, .latest, .multimedia, .newsletter, .stats-bar').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
}

function handleForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('🎉 Subscribed successfully! (Demo Mode)', 'success');
            form.reset();
        });
    });
}

function handleMobileMenu() {
    // Not needed for this layout, but keep for compatibility
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number, .counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.getAttribute('data-count') || el.textContent.replace(/[^0-9.]/g, ''));
                if (isNaN(target)) return;
                let current = 0;
                const increment = target / 50; // 50 steps
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        el.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        el.textContent = target;
                    }
                };
                updateCounter();
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => observer.observe(counter));
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

function initVideoPlay() {
    const videoCard = document.querySelector('.video-card');
    if (videoCard) {
        videoCard.addEventListener('click', () => {
            showNotification('🎬 Video would play here (demo)', 'info');
        });
    }
}

function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `demo-notification demo-notification-${type}`;
    notif.innerHTML = `
        <div class="demo-notification-content">
            <span class="demo-notification-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
            <span class="demo-notification-text">${message}</span>
        </div>
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

console.log('✅ Enhanced blog-magazine interactive features loaded');