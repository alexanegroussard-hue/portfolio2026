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

function initGTranslate() {
  window.gtranslateSettings = {
    "default_language": "fr",
    "languages": ["fr", "en", "es", "ca"],
    "wrapper_selector": ".gtranslate_wrapper"
  };

  const script = document.createElement('script');
  script.src = 'https://cdn.gtranslate.net/widgets/latest/dwf.js';
  script.defer = true;
  document.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {

  fetch('./includes/header.html')
    .then(res => {
      if (!res.ok) throw new Error("Header introuvable");
      return res.text();
    })
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
      initBurger();
      initGTranslate();
    })
    .then(() => fetch('./includes/footer.html'))
    .then(res => {
      if (!res.ok) throw new Error("Footer introuvable");
      return res.text();
    })
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
      const y = document.getElementById('footer-year');
      if (y) y.textContent = new Date().getFullYear();
    })
    .catch(err => console.error('Erreur:', err));

});