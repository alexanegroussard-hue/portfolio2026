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

// Sélecteur FR · EN · NL du header : il pilote le widget GTranslate (masqué en CSS).
function initLangSwitch() {
  const buttons = [...document.querySelectorAll('.lang-switch button')];
  if (!buttons.length) return;

  const current = () => {
    const m = document.cookie.match(/googtrans=\/fr\/(\w+)/);
    return m ? m[1] : (document.documentElement.lang || 'fr').slice(0, 2);
  };
  const refresh = () => {
    const lang = current();
    buttons.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  };

  buttons.forEach(b => b.addEventListener('click', () => {
    if (typeof window.doGTranslate !== 'function') return; // widget pas encore chargé
    window.doGTranslate('fr|' + b.dataset.lang);
    buttons.forEach(x => x.classList.toggle('active', x.dataset.lang === b.dataset.lang));
  }));

  // GTranslate change l'attribut lang de la page quand il traduit
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  refresh();
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

  // Petite souris qui invite à cliquer pour passer l'animation
  const sidebar = targets[0].closest('.sidebar');
  const para = targets.find(el => el.tagName === 'P');
  const hint = document.createElement('div');
  hint.className = 'tw-hint';
  hint.setAttribute('role', 'img');
  hint.setAttribute('aria-label', 'Cliquer pour afficher tout le texte');
  hint.title = 'Cliquer pour afficher tout le texte';
  hint.innerHTML = '<svg viewBox="0 0 24 36" width="22" height="33" aria-hidden="true">'
    + '<rect x="1.5" y="1.5" width="21" height="33" rx="10.5" fill="none" stroke="currentColor" stroke-width="2"/>'
    + '<path class="tw-hint-btn" d="M12 1.5 A10.5 10.5 0 0 0 1.5 12 V14 H12 Z" fill="currentColor"/>'
    + '<line x1="12" y1="1.5" x2="12" y2="14" stroke="currentColor" stroke-width="2"/>'
    + '<line x1="1.5" y1="14" x2="22.5" y2="14" stroke="currentColor" stroke-width="2"/>'
    + '</svg>';
  if (sidebar && para) {
    sidebar.classList.add('tw-skippable');
    // Placée sur la ligne des icônes réseaux, alignée sur le bord droit du texte :
    // elle ne peut jamais chevaucher le paragraphe.
    const social = sidebar.querySelector('.social-links-sidebar');
    const place = () => {
      const ref = (social || para).getBoundingClientRect();
      const top = social ? ref.top + (ref.height - 33) / 2 : ref.bottom + 8;
      hint.style.top = (top - sidebar.getBoundingClientRect().top) + 'px';
      hint.style.right = getComputedStyle(para).paddingRight;
    };
    place();
    if (document.fonts) document.fonts.ready.then(place); // la police du titre change sa hauteur
    window.addEventListener('resize', place);
    hint.cleanup = () => window.removeEventListener('resize', place);
    sidebar.appendChild(hint);
    requestAnimationFrame(() => hint.classList.add('tw-hint-on'));
  }

  const finish = () => {
    clearTimeout(timer);
    hint.classList.remove('tw-hint-on');
    if (hint.cleanup) hint.cleanup();
    setTimeout(() => hint.remove(), 400);
    if (sidebar) sidebar.classList.remove('tw-skippable');
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
    let delay = step.title ? 90 : 28;
    if (c === ' ') delay = step.title ? 90 : 18;
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
      initLangSwitch();
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