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
    "languages": ["fr", "en", "nl"],
    "wrapper_selector": ".gtranslate_wrapper"
  };

  const script = document.createElement('script');
  script.src = 'https://cdn.gtranslate.net/widgets/latest/dwf.js';
  script.defer = true;
  document.body.appendChild(script);
}

// Effet machine à écrire sur le titre et le texte introductif (pages impression et digital).
// Le texte garde sa place (lettres invisibles révélées une à une), puis le HTML d'origine
// est remis à la fin pour que GTranslate puisse le traduire normalement.
function initTypewriter() {
  const targets = [...document.querySelectorAll('.sidebar > h1, .sidebar > p')];
  if (!targets.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (/googtrans=\/fr\/(?!fr)/.test(document.cookie)) return; // page déjà traduite

  const originals = targets.map(el => el.innerHTML);
  const steps = [];

  targets.forEach((el, i) => {
    el.classList.add('notranslate', 'tw-running');
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      for (const c of node.textContent.replace(/\s+/g, ' ')) {
        const span = document.createElement('span');
        span.className = 'tw-char';
        span.textContent = c;
        frag.appendChild(span);
        steps.push({ span, title: el.tagName === 'H1' });
      }
      node.replaceWith(frag);
    });
    if (i < targets.length - 1) steps.push({ pause: 350 });
  });

  let index = 0, timer = null, caret = null;

  const finish = () => {
    clearTimeout(timer);
    targets.forEach((el, i) => {
      el.innerHTML = originals[i];
      el.classList.remove('notranslate', 'tw-running');
    });
    document.removeEventListener('click', onClick);
  };

  const onClick = e => { if (e.target.closest('.sidebar')) finish(); };
  document.addEventListener('click', onClick);

  const tick = () => {
    if (index >= steps.length) return finish();
    const step = steps[index++];
    if (step.pause) { timer = setTimeout(tick, step.pause); return; }
    if (caret) caret.classList.remove('tw-caret');
    caret = step.span;
    caret.classList.add('tw-on', 'tw-caret');
    const c = caret.textContent;
    let delay = step.title ? 90 : 16;
    if (c === ' ') delay = step.title ? 90 : 10;
    else if (/[.,;:!?—]/.test(c)) delay += 120;
    timer = setTimeout(tick, delay);
  };

  timer = setTimeout(tick, 400);
}

initTypewriter();

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