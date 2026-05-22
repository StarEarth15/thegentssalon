/* ============================================================
   THE GENTS SALON — INTERACTIONS & ANIMATIONS
   ============================================================ */

'use strict';

/* ---------- NAVBAR ---------- */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const menu     = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  function setActiveLink() {
    const scrollY = window.scrollY + 120;
    let current = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) current = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.classList.toggle('active', href === current);
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();
})();


/* ---------- SCROLL REVEAL ---------- */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    // Stagger service cards by index
    if (el.closest('.services-grid')) {
      el.style.setProperty('--i', String(i % 5));
    }
    observer.observe(el);
  });
})();


/* ---------- TESTIMONIALS CAROUSEL ---------- */
(function initTestimonials() {
  const track     = document.getElementById('testimonialsTrack');
  const prevBtn   = document.getElementById('tcPrev');
  const nextBtn   = document.getElementById('tcNext');
  const dotsWrap  = document.getElementById('tcDots');

  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.testimonial-card'));
  let current   = 0;
  let autoTimer = null;

  function getVisible() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640)  return 2;
    return 1;
  }

  function maxIndex() {
    return Math.max(0, cards.length - getVisible());
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'tc-dot' + (i === current ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Testimonial group ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.tc-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardW    = cards[0].getBoundingClientRect().width;
    const gap      = 24;
    const offset   = current * (cardW + gap);
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }, 4500);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Touch / swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      resetAuto();
    }
  });

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', startAuto);

  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, maxIndex()));
  });

  buildDots();
  goTo(0);
  startAuto();
})();


/* ---------- HYDRAFACIAL GOLD BORDER SLIDE ---------- */
(function initHydraEffect() {
  const section = document.getElementById('hydrafacial');
  if (!section) return;

  const steps = section.querySelectorAll('.step');
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      steps.forEach((step, i) => {
        setTimeout(() => step.classList.add('step-visible'), i * 180);
      });
      observer.disconnect();
    }
  }, { threshold: 0.2 });

  // Add step animation CSS inline
  const style = document.createElement('style');
  style.textContent = `
    .step { opacity: 0; transform: translateX(-20px); transition: opacity .5s ease, transform .5s ease; }
    .step.step-visible { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  observer.observe(section);
})();


/* ---------- GALLERY LAZY LOAD / PARALLAX HINT ---------- */
(function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(24px)';
    item.style.transition = `opacity .6s ease ${i * .08}s, transform .6s ease ${i * .08}s`;
    observer.observe(item);
  });
})();


/* ---------- SERVICE CARDS STAGGER ---------- */
(function initServiceCards() {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.service-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards2 = grid.querySelectorAll('.service-card');
        cards2.forEach((c, i) => {
          setTimeout(() => {
            c.style.opacity = '1';
            c.style.transform = 'translateY(0)';
          }, i * 90);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(30px)';
    c.style.transition = 'opacity .65s ease, transform .65s ease';
  });
  observer.observe(grid);
})();


/* ---------- TEAM CARDS ---------- */
(function initTeamCards() {
  const grid = document.querySelector('.team-grid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.team-card');
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      cards.forEach((c, i) => {
        setTimeout(() => {
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
        }, i * 100);
      });
      observer.disconnect();
    }
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(28px)';
    c.style.transition = 'opacity .6s ease, transform .6s ease';
  });
  observer.observe(grid);
})();


/* ---------- BEFORE/AFTER CARDS ---------- */
(function initBACards() {
  const cards = document.querySelectorAll('.ba-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'scale(1)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach((c, i) => {
    c.style.opacity = '0';
    c.style.transform = 'scale(.95)';
    c.style.transition = `opacity .6s ease ${i * .12}s, transform .6s ease ${i * .12}s`;
    observer.observe(c);
  });
})();


/* ---------- SMOOTH SCROLL (fallback for older browsers) ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('navbar').offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ---------- NEWSLETTER FORM ---------- */
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const input  = e.target.querySelector('input[type="email"]');
  const button = e.target.querySelector('button');
  const email  = input.value.trim();
  if (!email) return;

  button.textContent = 'Subscribed!';
  button.style.background = '#2d8c4e';
  input.value = '';
  input.placeholder = 'Thank you!';
  input.disabled = true;
  button.disabled = true;

  setTimeout(() => {
    button.textContent = 'Subscribe';
    button.style.background = '';
    input.placeholder = 'Your email address';
    input.disabled = false;
    button.disabled = false;
  }, 4000);
}


/* ---------- HERO PARALLAX (subtle) ---------- */
(function initHeroParallax() {
  const pattern = document.querySelector('.hero-pattern');
  if (!pattern) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      pattern.style.transform = `translateY(${y * .15}px)`;
    }
  }, { passive: true });
})();


/* ---------- GOLD SHIMMER ON SECTION ENTRY ---------- */
(function initGoldShimmer() {
  const hydraSection = document.getElementById('hydrafacial');
  if (!hydraSection) return;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      hydraSection.classList.add('shimmer-active');
    }
  }, { threshold: 0.1 });

  const shimmerStyle = document.createElement('style');
  shimmerStyle.textContent = `
    #hydrafacial .hydra-bg {
      transition: opacity 1.2s ease;
    }
    #hydrafacial.shimmer-active .hydra-bg {
      opacity: 1;
      animation: goldShimmer 6s ease-in-out infinite;
    }
    @keyframes goldShimmer {
      0%,100% { opacity: 1; }
      50%      { opacity: .7; }
    }
  `;
  document.head.appendChild(shimmerStyle);
  observer.observe(hydraSection);
})();


/* ---------- BACK TO TOP on keyboard (Home key) ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
