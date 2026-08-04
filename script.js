/* ═══════════════════════════════════════════════════════
   CHRISTINE IVY IRENEA — Portfolio JavaScript
   script.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── DOM READY ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initHeroRule();
  initScrollAnimations();
  initCounters();
  initSmoothScroll();
  initContactForm();
  initFooterYear();
});

/* ══════════════════════════════════════════════════════
   STICKY NAV — adds .scrolled class for border + shadow
   ══════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load in case page is already scrolled
}

/* ══════════════════════════════════════════════════════
   MOBILE HAMBURGER MENU
   ══════════════════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const open  = () => {
    mobileMenu.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const toggle = () => mobileMenu.classList.contains('open') ? close() : open();

  hamburger.addEventListener('click', toggle);

  // Close on any mobile link click
  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      close();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      close();
      hamburger.focus();
    }
  });
}

/* ══════════════════════════════════════════════════════
   HERO GOLD RULE — draws itself on load
   ══════════════════════════════════════════════════════ */
function initHeroRule() {
  const heroRule = document.getElementById('hero-rule');
  if (!heroRule) return;
  // Short delay so the page has rendered before animation starts
  setTimeout(() => heroRule.classList.add('animate'), 700);
}

/* ══════════════════════════════════════════════════════
   SCROLL ANIMATIONS — IntersectionObserver for .fade-up
   and .gold-rule elements
   ══════════════════════════════════════════════════════ */
function initScrollAnimations() {
  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    document.querySelectorAll('.gold-rule').forEach(el => el.classList.add('animate'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('gold-rule')) {
            entry.target.classList.add('animate');
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-up, .gold-rule').forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════════
   ANIMATED COUNTERS — triggers when stat enters viewport
   Uses cubic ease-out for a natural deceleration feel
   ══════════════════════════════════════════════════════ */
function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Just show final values immediately
    document.querySelectorAll('[data-target]').forEach(el => {
      el.textContent = el.dataset.target + (el.dataset.suffix || '');
    });
    return;
  }

  const DURATION = 1600; // ms

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const start   = performance.now();

    const update = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Cubic ease-out
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.floor(eased * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix; // ensure exact final value
      }
    };

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));
}

/* ══════════════════════════════════════════════════════
   SMOOTH SCROLL — intercepts all anchor links and offsets
   for the fixed nav height
   ══════════════════════════════════════════════════════ */
function initSmoothScroll() {
  const NAV_OFFSET = 72; // matches --nav-h in CSS

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');
      if (href === '#') return; // ignore bare # links

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      // Update URL without triggering a jump
      history.pushState(null, '', href);
    });
  });
}

/* ══════════════════════════════════════════════════════
   CONTACT FORM — client-side validation + submit feedback
   Wire up to a real backend (e.g. Formspree, EmailJS,
   or a serverless function) by replacing handleSubmit.
   ══════════════════════════════════════════════════════ */
function initContactForm() {
  const submitBtn = document.getElementById('form-submit');
  const feedback  = document.getElementById('form-feedback');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', handleSubmit);

  // Allow pressing Enter in inputs to submit
  ['fname', 'lname', 'email', 'service'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSubmit();
      });
    }
  });

  function getField(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setFeedback(message, type) {
    if (!feedback) return;
    feedback.textContent   = message;
    feedback.className     = 'form-feedback ' + type;
  }

  function clearFeedback() {
    if (!feedback) return;
    feedback.textContent = '';
    feedback.className   = 'form-feedback';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function resetForm() {
    ['fname', 'lname', 'email', 'service', 'message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // Reset select to placeholder
    const select = document.getElementById('service');
    if (select) select.selectedIndex = 0;
  }

  async function handleSubmit() {
    clearFeedback();

    const fname   = getField('fname');
    const lname   = getField('lname');
    const email   = getField('email');
    const service = getField('service');
    const message = getField('message');

    // Validation
    if (!fname) {
      setFeedback('Please enter your first name.', 'error');
      document.getElementById('fname')?.focus();
      return;
    }
    if (!email) {
      setFeedback('Please enter your email address.', 'error');
      document.getElementById('email')?.focus();
      return;
    }
    if (!isValidEmail(email)) {
      setFeedback('Please enter a valid email address.', 'error');
      document.getElementById('email')?.focus();
      return;
    }
    if (!message) {
      setFeedback('Please tell Christine a bit about your needs.', 'error');
      document.getElementById('message')?.focus();
      return;
    }

    // ── SENDING STATE ──
    submitBtn.disabled   = true;
    submitBtn.textContent = 'Sending…';

    try {
      /*
       * ── INTEGRATION POINT ──────────────────────────────
       * Replace the simulated delay below with your real
       * form submission. Example using Formspree:
       *
       * const response = await fetch('https://formspree.io/f/YOUR_ID', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
       *   body: JSON.stringify({ name: fname + ' ' + lname, email, service, message })
       * });
       * if (!response.ok) throw new Error('Network error');
       * ────────────────────────────────────────────────── */
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulated delay

      // ── SUCCESS ──
      submitBtn.textContent = 'Message Sent ✓';
      submitBtn.style.background = 'var(--green-ok)';
      setFeedback("Thanks! Christine will get back to you within 24 hours.", 'success');
      resetForm();

      // Reset button after delay
      setTimeout(() => {
        submitBtn.textContent      = 'Send Message →';
        submitBtn.style.background = '';
        submitBtn.disabled         = false;
        clearFeedback();
      }, 5000);

    } catch (err) {
      console.error('Form submission error:', err);
      submitBtn.textContent = 'Send Message →';
      submitBtn.disabled    = false;
      setFeedback('Something went wrong. Please email christineivy.va@gmail.com directly.', 'error');
    }
  }
}

/* ══════════════════════════════════════════════════════
   FOOTER YEAR — keeps copyright current automatically
   ══════════════════════════════════════════════════════ */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}
