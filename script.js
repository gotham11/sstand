/* ============================================================
   STANFORD O'QUV MARKAZI — script.js
   Author  : Stanford Web Team
   Version : 1.0

   TABLE OF CONTENTS
   -----------------
   1. DOM Ready Helper
   2. Navbar: Scroll Shadow
   3. Navbar: Burger / Mobile Menu Toggle
   4. Navbar: Close Menu on Link Click
   5. Smooth Scrolling (anchor links)
   6. Active Nav Link on Scroll (IntersectionObserver)
   7. Animated Number Counters
   8. Contact Form Validation & Submission
   9. Scroll-Reveal Animations
============================================================ */


/* ============================================================
   1. DOM READY HELPER
   Runs all setup code after the DOM is fully parsed.
============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  initNavbarScroll();
  initBurgerMenu();
  initNavLinkClose();
  initSmoothScroll();
  initActiveNavLink();
  initCounters();
  initFormValidation();
  initScrollReveal();

});


/* ============================================================
   2. NAVBAR — Scroll Shadow
   Adds a .scrolled class to #navbar when the user scrolls
   down, which triggers a CSS box-shadow for depth.
============================================================ */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    // Toggle .scrolled based on scroll position
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run once on load in case page is pre-scrolled
}


/* ============================================================
   3. NAVBAR — Burger / Mobile Menu Toggle
   Toggles .open on both the nav links container and the
   burger button itself (which triggers the X animation).
============================================================ */
function initBurgerMenu() {
  const burger   = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (!burger || !navLinks) return;

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.classList.toggle('open', isOpen);

    // Update ARIA attribute for accessibility
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    // Prevent body scroll while mobile menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}


/* ============================================================
   4. NAVBAR — Close Menu on Link Click
   When a mobile nav link is clicked, close the menu so the
   user isn't left with an open overlay after navigating.
============================================================ */
function initNavLinkClose() {
  const burger   = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  const links = navLinks.querySelectorAll('.navbar__link');

  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      if (burger) {
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    });
  });
}


/* ============================================================
   5. SMOOTH SCROLLING
   Intercepts all same-page anchor clicks (href="#...") and
   animates scrolling with an offset for the fixed navbar.
============================================================ */
function initSmoothScroll() {
  const NAVBAR_HEIGHT = 70; // px — matches the navbar height

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');
      const target = document.querySelector(href);

      if (!target || href === '#') return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;

      window.scrollTo({
        top:      targetTop,
        behavior: 'smooth',
      });
    });
  });
}


/* ============================================================
   6. ACTIVE NAV LINK ON SCROLL
   Uses IntersectionObserver to watch each section and
   highlight the corresponding nav link when it enters view.
============================================================ */
function initActiveNavLink() {
  // Map section IDs to nav link href values
  const sectionIds = ['home', 'about', 'courses', 'teachers', 'results', 'testimonials', 'location', 'contact'];
  const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks   = document.querySelectorAll('.navbar__link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    rootMargin: '-40% 0px -55% 0px', // Trigger when section is in the middle of viewport
    threshold:  0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const activeId = entry.target.id;

      // Remove .active from all links
      navLinks.forEach(link => link.classList.remove('active'));

      // Add .active to the matching link
      const activeLink = document.querySelector(`.navbar__link[href="#${activeId}"]`);
      if (activeLink) activeLink.classList.add('active');
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}


/* ============================================================
   7. ANIMATED NUMBER COUNTERS
   Looks for elements with class .counter and data-target="N".
   Counts up from 0 to N when the element enters the viewport.
============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observerOptions = {
    threshold: 0.5, // Fire when 50% of the element is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      animateCounter(el, target);
      observer.unobserve(el); // Only run once per element
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}

/**
 * Increments an element's text from 0 to `target`.
 * @param {HTMLElement} el     - The element to update
 * @param {number}      target - The final number value
 */
function animateCounter(el, target) {
  const duration = 1800; // ms — total animation time
  const start    = performance.now();

  const update = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out curve: fast start, slow finish
    const eased = 1 - Math.pow(1 - progress, 3);

    el.textContent = Math.floor(eased * target).toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Ensure exact final value
      el.textContent = target.toLocaleString();
    }
  };

  requestAnimationFrame(update);
}


/* ============================================================
   8. CONTACT FORM VALIDATION & SUBMISSION
   Validates Name, Phone, and Course fields before allowing
   a "submission". Shows a success message on pass.
============================================================ */
function initFormValidation() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Always prevent real submission (no backend here)

    let isValid = true;

    // ── Validate: Name ──────────────────────────────
    const nameInput = document.getElementById('name');
    const nameGroup = nameInput?.closest('.form-group');
    const nameVal   = nameInput?.value.trim();

    if (!nameVal || nameVal.length < 2) {
      nameGroup?.classList.add('error');
      isValid = false;
    } else {
      nameGroup?.classList.remove('error');
    }

    // ── Validate: Phone ─────────────────────────────
    const phoneInput = document.getElementById('phone');
    const phoneGroup = phoneInput?.closest('.form-group');
    const phoneVal   = phoneInput?.value.trim().replace(/\s+/g, '');

    // Basic phone check: must start with + or digit, min 7 chars
    const phoneRegex = /^[+\d][\d\-\s]{6,}$/;
    if (!phoneVal || !phoneRegex.test(phoneVal)) {
      phoneGroup?.classList.add('error');
      isValid = false;
    } else {
      phoneGroup?.classList.remove('error');
    }

    // ── Validate: Course ────────────────────────────
    const courseInput = document.getElementById('course');
    const courseGroup = courseInput?.closest('.form-group');
    const courseVal   = courseInput?.value;

    if (!courseVal) {
      courseGroup?.classList.add('error');
      isValid = false;
    } else {
      courseGroup?.classList.remove('error');
    }

    // ── If all valid, show success ───────────────────
    if (isValid) {
      showFormSuccess(form);
    }
  });

  // Clear error state as user types / changes
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.closest('.form-group')?.classList.remove('error');
    });
  });
}

/**
 * Hides the form fields and shows the success confirmation message.
 * @param {HTMLFormElement} form
 */
function showFormSuccess(form) {
  // Hide all fields inside the form
  form.querySelectorAll('.form-group, .btn').forEach(el => {
    el.style.display = 'none';
  });

  // Show success message
  const successEl = document.getElementById('formSuccess');
  if (successEl) {
    successEl.style.display = 'block';
  }
}


/* ============================================================
   9. SCROLL-REVEAL ANIMATIONS
   Adds a subtle fade-up entrance animation to cards and
   sections as they enter the viewport.
============================================================ */
function initScrollReveal() {
  // Elements to animate
  const selector = [
    '.course-card',
    '.teacher-card',
    '.score-card',
    '.testi-card',
    '.about__value',
    '.about__stat-card',
    '.about__partner',
    '.location__detail',
    '.contact__channel',
  ].join(', ');

  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  // Inject base styles so elements start invisible
  injectRevealStyles();

  elements.forEach((el, index) => {
    el.classList.add('reveal');
    // Stagger delay based on position within its parent
    const siblings = Array.from(el.parentElement?.children || []);
    const siblIndex = siblings.indexOf(el);
    el.style.transitionDelay = `${siblIndex * 0.07}s`;
  });

  const observerOptions = {
    threshold:  0.1,
    rootMargin: '0px 0px -40px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, observerOptions);

  elements.forEach(el => observer.observe(el));
}

/**
 * Injects a <style> block with the reveal animation rules.
 * Done in JS to keep the CSS file clean and to avoid
 * elements being hidden if JS doesn't load.
 */
function injectRevealStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .reveal--visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}
