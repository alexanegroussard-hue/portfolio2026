// main.js
function initBurger() {
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!burger || !mobileMenu) return;

  ['click', 'touchstart'].forEach(eventType => {
    burger.addEventListener(eventType, (e) => {
      e.preventDefault();
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = burger.classList.contains('open') ? 'hidden' : 'auto';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('./includes/header.html')
    .then(res => {
      if (!res.ok) throw new Error("Header introuvable");
      return res.text();
    })
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
      initBurger(); // ✅ Appelé après injection du header
    })
    .catch(err => console.error('Erreur header:', err));
});