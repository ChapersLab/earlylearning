const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');

toggle.addEventListener('click', () => {
  const isOpen = toggle.classList.toggle('active');
  menu.classList.toggle('active');

  // Accesibilidad
  toggle.setAttribute('aria-expanded', isOpen);
});