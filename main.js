const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
const links = document.querySelectorAll('.nav-menu a');

let lastFocusedElement = null;

toggle.addEventListener('click', () => {
  const isOpen = toggle.classList.toggle('active');
  menu.classList.toggle('active');

  // Accesibilidad
  toggle.setAttribute('aria-expanded', isOpen);

  // Bloquear scroll
  document.body.classList.toggle('no-scroll', isOpen);

  if (isOpen) {
    lastFocusedElement = document.activeElement;
    links[0].focus();
  } else {
    toggle.focus();
  }
});

/* CERRAR AL HACER CLICK EN LINK */
links.forEach(link => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

/* CERRAR CON ESC */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('active')) {
    closeMenu();
  }
});

/* FUNCION CENTRAL */
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





const steps = document.querySelectorAll('.step');
const stepsContainer = document.querySelector('.steps');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      stepsContainer.classList.add('show-line');

      steps.forEach((step, index) => {
        setTimeout(() => {
          step.classList.add('show');
        }, index * 180);
      });

    }
  });
}, { threshold: 0.3 });

observer.observe(stepsContainer);

/* ==========================================================================
   STUDENT SITUATION WIDGET (tabs)
   Vertical tablist on desktop, restacked above its panel on mobile via
   CSS only — same markup/ARIA at every width. Click, Enter/Space (native
   button behavior) and Up/Down/Home/End arrow keys all work; a roving
   tabindex keeps only the active tab in the normal Tab order, per the
   standard tabs pattern.
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
   MATERIAS — entrance animation trigger
   Fires once when the section enters the viewport, staggering the three
   subject cards slightly (mirrors the existing steps-reveal pattern
   above). Respecting prefers-reduced-motion is handled in CSS — this
   only decides *when* the is-visible class is added, not how it looks.
   ========================================================================== */
const subjectCards = document.querySelectorAll('.subject-card');
const subjectsSection = document.querySelector('.subjects');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (subjectCards.length && subjectsSection && 'IntersectionObserver' in window && !prefersReducedMotion) {
  // Only now do we opt into the hide-then-reveal treatment (see the
  // .js-animate rules in styles.css) — if this line never runs, the
  // artwork stays in its default, fully-visible state.
  subjectsSection.classList.add('js-animate');

  const subjectsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        subjectCards.forEach((card, index) => {
          setTimeout(() => card.classList.add('is-visible'), index * 150);
        });
        subjectsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  subjectsObserver.observe(subjectsSection);
}

/* ==========================================================================
   FOOTER YEAR
   ========================================================================== */
const footerYear = document.getElementById('footer-year');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

/* ==========================================================================
   CONTACT FORM — placeholder submission handling only.
   ============================================================
   No backend endpoint or WhatsApp number has been provided yet. Do not
   invent one. Once real values exist, set them here:

   const CONTACT_ENDPOINT = '';   // e.g. a form backend URL, or leave
                                   // empty and wire WHATSAPP_NUMBER below
   const WHATSAPP_NUMBER = '';    // e.g. '506XXXXXXXX' — no '+', no spaces

   Until then, this handler validates the form and shows a confirmation
   message locally — it does not send data anywhere, and does not pretend
   to. Nothing here fabricates a working submission destination.
   ============================================================ */
const CONTACT_ENDPOINT = '';
const WHATSAPP_NUMBER = '';

const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-form-status');

if (contactForm && contactStatus) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    if (WHATSAPP_NUMBER) {
      const data = new FormData(contactForm);
      const lines = [
        'Hola, quiero información sobre clases particulares.',
        '',
        `Nombre: ${data.get('name')}`,
        `Materia: ${data.get('subject')}`,
        `Año/nivel: ${data.get('level')}`,
        data.get('message') ? `Mensaje: ${data.get('message')}` : null
      ].filter(Boolean);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (CONTACT_ENDPOINT) {
      // A real backend endpoint would be wired here (fetch/POST).
      return;
    }

    // No destination configured yet — confirm receipt locally rather
    // than silently failing or pretending to submit somewhere real.
    contactStatus.textContent = '¡Gracias! Este formulario todavía no está conectado a un destino real — se configurará antes de publicar el sitio.';
    contactStatus.hidden = false;
    contactForm.reset();
  });
}
