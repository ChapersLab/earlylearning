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