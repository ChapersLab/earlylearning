/* ==========================================================================
   NAVIGATION — mobile menu toggle + close behavior
   ========================================================================== */
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
const links = document.querySelectorAll('.nav-menu a');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lastFocusedElement = null;

toggle.addEventListener('click', () => {
  const isOpen = toggle.classList.toggle('active');
  menu.classList.toggle('active');

  toggle.setAttribute('aria-expanded', isOpen);
  document.body.classList.toggle('no-scroll', isOpen);

  if (isOpen) {
    lastFocusedElement = document.activeElement;
    links[0].focus();
  } else {
    toggle.focus();
  }
});

links.forEach(link => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('active')) {
    closeMenu();
  }
});

function closeMenu() {
  toggle.classList.remove('active');
  menu.classList.remove('active');
  toggle.setAttribute('aria-expanded', false);
  document.body.classList.remove('no-scroll');

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ==========================================================================
   ROUTE ANIMATION — "Tu ruta de progreso" steps
   ============================================================
   BUG FIX: this previously watched the entire .steps CONTAINER with
   threshold:0.3. On mobile, where the three steps stack vertically, that
   container is tall enough that "30% of it visible" could require
   scrolling well past the first step (or never trigger comfortably),
   which is exactly why steps sometimes stayed invisible or appeared very
   late. Desktop's connected-line sequence still watches the container as
   a whole (it works well there, per feedback — preserved unchanged).
   Mobile now watches each step individually with a lower threshold, so
   each one reveals shortly after IT enters the viewport, with a short
   400ms reveal and no large stagger wait.
   ============================================================ */
const steps = document.querySelectorAll('.step');
const stepsContainer = document.querySelector('.steps');
const isMobileRoute = window.matchMedia('(max-width: 767px)');

function revealAllSteps() {
  stepsContainer.classList.add('show-line');
  steps.forEach((step) => step.classList.add('show'));
}

if (steps.length && stepsContainer) {
  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealAllSteps();
  } else if (isMobileRoute.matches) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          stepObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
    steps.forEach((step) => stepObserver.observe(step));
  } else {
    const routeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          stepsContainer.classList.add('show-line');
          steps.forEach((step, index) => {
            setTimeout(() => step.classList.add('show'), index * 180);
          });
          routeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    routeObserver.observe(stepsContainer);
  }
}

/* ==========================================================================
   STUDENT SITUATION WIDGET (tabs)
   ========================================================================== */
const situationTabs = Array.from(document.querySelectorAll('.situation-tab'));
const situationPanels = Array.from(document.querySelectorAll('.situation-panel'));

function activateSituation(tab) {
  situationTabs.forEach((t) => {
    const isActive = t === tab;
    t.classList.toggle('is-active', isActive);
    t.setAttribute('aria-selected', String(isActive));
    t.tabIndex = isActive ? 0 : -1;
  });

  situationPanels.forEach((panel) => {
    const isActive = panel.id === tab.getAttribute('aria-controls');
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });
}

situationTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateSituation(tab));

  tab.addEventListener('keydown', (e) => {
    let targetIndex = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') targetIndex = (index + 1) % situationTabs.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') targetIndex = (index - 1 + situationTabs.length) % situationTabs.length;
    else if (e.key === 'Home') targetIndex = 0;
    else if (e.key === 'End') targetIndex = situationTabs.length - 1;

    if (targetIndex !== null) {
      e.preventDefault();
      const targetTab = situationTabs[targetIndex];
      activateSituation(targetTab);
      targetTab.focus();
    }
  });
});

/* ==========================================================================
   MATERIAS — entrance animation, triggered per subject
   ============================================================
   BUG FIX: this previously watched the whole .subjects SECTION with one
   observer, then revealed all three cards together (with only a small
   stagger) the instant the section became visible. On mobile, where the
   cards stack vertically, that meant cards 2 and 3 could finish
   animating before the user had scrolled anywhere near them. Each
   subject card now gets its OWN observer and animates only once IT
   individually enters the viewport, at every width.
   ============================================================ */
const subjectCards = document.querySelectorAll('.subject-card');
const subjectsSection = document.querySelector('.subjects');

if (subjectCards.length && subjectsSection && 'IntersectionObserver' in window && !prefersReducedMotion) {
  subjectsSection.classList.add('js-animate');

  const subjectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        subjectObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' });

  subjectCards.forEach((card) => subjectObserver.observe(card));
}

/* ==========================================================================
   FOOTER YEAR
   ========================================================================== */
const footerYear = document.getElementById('footer-year');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

/* ==========================================================================
   BOOKING MODAL
   ============================================================
   SINGLE INTEGRATION POINT — configured with the real business WhatsApp
   number this round. Display format for humans is "7114 5245"; the
   constant below is the international-normalized form wa.me needs
   (country code + number, no '+', no spaces).
   ============================================================ */
const BOOKING_WHATSAPP_NUMBER = '50671145245';

const SUBJECTS = [
  { id: 'matematicas', name: 'Matemáticas' },
  { id: 'ingles', name: 'Inglés' },
  { id: 'fisica', name: 'Física' }
];
const TIME_SLOTS = ['2:00 p. m.', '3:00 p. m.', '4:00 p. m.', '5:00 p. m.', '6:00 p. m.'];

function findSubject(id) {
  return SUBJECTS.find((s) => s.id === id) || null;
}

const bookingModal = document.getElementById('booking-modal');
const bookingBackdrop = document.getElementById('booking-modal-backdrop');

if (bookingModal && bookingBackdrop) {
  const modalBody = document.getElementById('booking-modal-body');
  const modalSteps = Array.from(modalBody.querySelectorAll('.booking-step'));
  const stepLabel = document.getElementById('booking-modal-step-label');
  const progressSegments = Array.from(document.querySelectorAll('.booking-progress-segment'));
  const backBtn = document.getElementById('booking-modal-back');
  const nextBtn = document.getElementById('booking-modal-next');
  const closeBtn = document.getElementById('booking-modal-close');
  const errorEl = document.getElementById('booking-modal-error');
  const subjectList = document.getElementById('booking-subject-list');
  const timeList = document.getElementById('booking-time-list');
  const dateInput = document.getElementById('booking-date-input');
  const nameInput = document.getElementById('booking-name-input');
  const levelInput = document.getElementById('booking-level-input');
  const whatsappInput = document.getElementById('booking-whatsapp-input');
  const summaryEl = document.getElementById('booking-summary');
  const whatsappNote = document.getElementById('booking-whatsapp-note');

  const TOTAL_STEPS = modalSteps.length;
  let currentStep = 1;
  let lastFocusedEl = null;
  let state = { subjectId: '', dateValue: '', dateLabel: '', time: '', name: '', level: '', whatsapp: '' };

  SUBJECTS.forEach((subject) => {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'booking-option';
    opt.setAttribute('role', 'radio');
    opt.setAttribute('aria-checked', 'false');
    opt.dataset.subjectId = subject.id;
    opt.innerHTML = '<span class="booking-option-name">' + subject.name + '</span>';
    opt.addEventListener('click', () => {
      state.subjectId = subject.id;
      refreshSelection(subjectList, subject.id, 'subjectId');
      clearError();
    });
    subjectList.appendChild(opt);
  });

  TIME_SLOTS.forEach((t) => {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'booking-option';
    opt.setAttribute('role', 'radio');
    opt.setAttribute('aria-checked', 'false');
    opt.dataset.time = t;
    opt.innerHTML = '<span class="mono">' + t + '</span>';
    opt.addEventListener('click', () => {
      state.time = t;
      refreshSelection(timeList, t, 'time');
      clearError();
    });
    timeList.appendChild(opt);
  });

  function refreshSelection(listEl, value, key) {
    Array.from(listEl.children).forEach((opt) => {
      const matches = key === 'subjectId' ? opt.dataset.subjectId === value : opt.dataset.time === value;
      opt.setAttribute('aria-checked', matches ? 'true' : 'false');
    });
  }

  dateInput.min = new Date().toISOString().slice(0, 10);
  dateInput.addEventListener('input', () => {
    state.dateValue = dateInput.value;
    if (dateInput.value) {
      const d = new Date(dateInput.value + 'T00:00:00');
      const formatted = new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
      state.dateLabel = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } else {
      state.dateLabel = '';
    }
    clearError();
  });

  [[nameInput, 'name'], [levelInput, 'level'], [whatsappInput, 'whatsapp']].forEach((pair) => {
    const el = pair[0];
    const key = pair[1];
    el.addEventListener('input', () => { state[key] = el.value; clearError(); });
  });

  function clearError() { errorEl.hidden = true; errorEl.textContent = ''; }
  function showError(msg) { errorEl.textContent = msg; errorEl.hidden = false; }

  function validateStep(step) {
    if (step === 1 && !state.subjectId) { showError('Elegí una materia para continuar.'); return false; }
    if (step === 2 && !state.dateValue) { showError('Elegí un día para continuar.'); return false; }
    if (step === 3 && !state.time) { showError('Elegí una hora para continuar.'); return false; }
    if (step === 4) {
      if (!state.name.trim()) { showError('Ingresá el nombre del estudiante.'); return false; }
      if (!state.whatsapp.trim()) { showError('Ingresá un número de WhatsApp.'); return false; }
    }
    return true;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderSummary() {
    const subject = findSubject(state.subjectId);
    summaryEl.innerHTML = '';
    [
      ['Materia', subject ? subject.name : '—'],
      ['Fecha', state.dateLabel || '—'],
      ['Hora', state.time || '—'],
      ['Nombre', state.name || '—'],
      ['Nivel', state.level || '—']
    ].forEach((pair) => {
      const row = document.createElement('div');
      row.className = 'booking-summary-row';
      row.innerHTML = '<dt>' + pair[0] + '</dt><dd>' + escapeHtml(pair[1]) + '</dd>';
      summaryEl.appendChild(row);
    });
    whatsappNote.hidden = !!BOOKING_WHATSAPP_NUMBER;
  }

  function showStep(step) {
    currentStep = step;
    modalSteps.forEach((el) => { el.hidden = parseInt(el.dataset.step, 10) !== step; });
    stepLabel.textContent = 'PASO ' + step + ' DE ' + TOTAL_STEPS;
    progressSegments.forEach((seg, i) => seg.classList.toggle('is-complete', i < step));
    backBtn.hidden = step === 1;
    nextBtn.textContent = step === TOTAL_STEPS ? 'Confirmar reserva' : 'Siguiente';
    clearError();
    if (step === TOTAL_STEPS) renderSummary();
    const firstFocusable = modalBody.querySelector('.booking-step:not([hidden]) button, .booking-step:not([hidden]) input');
    if (firstFocusable) firstFocusable.focus({ preventScroll: true });
    modalBody.scrollTop = 0;
  }

  function buildWhatsAppMessage() {
    const subject = findSubject(state.subjectId);
    return [
      'Hola, quiero reservar una clase.',
      '',
      'Materia: ' + (subject ? subject.name : '—'),
      'Fecha: ' + (state.dateLabel || '—'),
      'Hora: ' + (state.time || '—'),
      'Nombre: ' + (state.name || '—'),
      'Nivel: ' + (state.level || '—')
    ].join('\n');
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS) {
      showStep(currentStep + 1);
      return;
    }
    if (!BOOKING_WHATSAPP_NUMBER) {
      showError('No pudimos abrir WhatsApp. Intentá de nuevo en un momento.');
      return;
    }
    const url = 'https://wa.me/' + BOOKING_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildWhatsAppMessage());
    window.open(url, '_blank', 'noopener,noreferrer');
    closeBooking();
  });

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) showStep(currentStep - 1);
  });

  function getFocusable() {
    return Array.from(bookingModal.querySelectorAll('button:not([hidden]):not([disabled]), input:not([hidden]), a[href]'))
      .filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { closeBooking(); return; }
    trapFocus(e);
  }

  function openBooking(preselectSubjectId, triggerEl) {
    lastFocusedEl = triggerEl || document.activeElement;
    state = { subjectId: preselectSubjectId || '', dateValue: '', dateLabel: '', time: '', name: '', level: '', whatsapp: '' };
    dateInput.value = '';
    nameInput.value = '';
    levelInput.value = '';
    whatsappInput.value = '';
    refreshSelection(subjectList, state.subjectId, 'subjectId');
    refreshSelection(timeList, '', 'time');

    bookingBackdrop.hidden = false;
    bookingModal.hidden = false;
    document.documentElement.classList.add('booking-open');
    void bookingModal.offsetWidth;
    bookingBackdrop.classList.add('is-open');
    bookingModal.classList.add('is-open');

    showStep(preselectSubjectId ? 2 : 1);
    document.addEventListener('keydown', onKeydown);
    bookingBackdrop.addEventListener('click', closeBooking);
  }

  function closeBooking() {
    bookingBackdrop.classList.remove('is-open');
    bookingModal.classList.remove('is-open');
    document.documentElement.classList.remove('booking-open');
    document.removeEventListener('keydown', onKeydown);
    bookingBackdrop.removeEventListener('click', closeBooking);
    const hide = () => { bookingBackdrop.hidden = true; bookingModal.hidden = true; };
    if (prefersReducedMotion) { hide(); } else { setTimeout(hide, 320); }
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
  }

  closeBtn.addEventListener('click', closeBooking);

  document.querySelectorAll('.subject-cta[data-subject]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openBooking(el.dataset.subject, el);
    });
  });

  ['hero-booking-cta', 'situations-booking-cta', 'how-it-works-booking-cta', 'mobile-nav-booking-cta'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (menu.classList.contains('active')) closeMenu();
      openBooking('', el);
    });
  });
}

/* ==========================================================================
   TESTIMONIALS — notebook-style carousel
   One slide visible at a time, user-controlled only (no auto-rotation).
   Previous/Next wrap around; dots jump directly to a slide. Each
   transition runs once and is announced via the track's aria-live so
   screen-reader users hear the new content, not just see it.
   ========================================================================== */
const testimonialTrack = document.getElementById('testimonial-track');
const testimonialPrev = document.getElementById('testimonial-prev');
const testimonialNext = document.getElementById('testimonial-next');
const testimonialDotsWrap = document.getElementById('testimonial-dots');

if (testimonialTrack && testimonialPrev && testimonialNext && testimonialDotsWrap) {
  const slides = Array.from(testimonialTrack.querySelectorAll('.notebook-slide'));
  let activeIndex = slides.findIndex((s) => s.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  testimonialTrack.setAttribute('aria-live', 'polite');

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Testimonio ' + (i + 1));
    dot.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
    if (i === activeIndex) dot.classList.add('is-active');
    dot.addEventListener('click', () => goToTestimonial(i));
    testimonialDotsWrap.appendChild(dot);
    return dot;
  });

  function goToTestimonial(index, direction) {
    if (index === activeIndex) return;
    const prevSlide = slides[activeIndex];
    const nextSlide = slides[index];
    const enteringFrom = direction === -1 ? 'is-leaving-prev' : 'is-leaving-next';

    if (prefersReducedMotion) {
      prevSlide.hidden = true;
      prevSlide.classList.remove('is-active');
      nextSlide.hidden = false;
      nextSlide.classList.add('is-active');
    } else {
      prevSlide.classList.add(direction === -1 ? 'is-leaving-next' : 'is-leaving-prev');
      setTimeout(() => {
        prevSlide.hidden = true;
        prevSlide.classList.remove('is-active', 'is-leaving-prev', 'is-leaving-next');
        nextSlide.hidden = false;
        nextSlide.classList.add(enteringFrom);
        void nextSlide.offsetWidth;
        nextSlide.classList.remove('is-leaving-prev', 'is-leaving-next');
        nextSlide.classList.add('is-active');
      }, 200);
    }

    dots[activeIndex].classList.remove('is-active');
    dots[activeIndex].setAttribute('aria-selected', 'false');
    dots[index].classList.add('is-active');
    dots[index].setAttribute('aria-selected', 'true');

    activeIndex = index;
  }

  testimonialPrev.addEventListener('click', () => {
    const newIndex = (activeIndex - 1 + slides.length) % slides.length;
    goToTestimonial(newIndex, -1);
  });
  testimonialNext.addEventListener('click', () => {
    const newIndex = (activeIndex + 1) % slides.length;
    goToTestimonial(newIndex, 1);
  });
}

/* ==========================================================================
   CONTACT — subject selector feeding the existing booking flow
   ============================================================
   No second booking form, no duplicated reservation logic: selecting a
   subject here just updates the data-subject attribute on the section's
   own "Reservar clase" button, which is already wired into the shared
   openBooking() flow above via the .subject-cta[data-subject] selector.
   ============================================================ */
const contactSubjectOptions = document.querySelectorAll('.contact-subject-option');
const contactBookingCta = document.getElementById('contact-booking-cta');

if (contactSubjectOptions.length && contactBookingCta) {
  contactSubjectOptions.forEach((option) => {
    option.addEventListener('click', () => {
      contactSubjectOptions.forEach((o) => {
        o.classList.remove('is-active');
        o.setAttribute('aria-checked', 'false');
      });
      option.classList.add('is-active');
      option.setAttribute('aria-checked', 'true');
      contactBookingCta.dataset.subject = option.dataset.subject;
    });
  });
}

