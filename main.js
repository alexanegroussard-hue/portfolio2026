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

// Corrections des traductions néerlandaises de Google (faux sens sur les mots courts et le
// vocabulaire de l'imprimé). Actif seulement quand la page est traduite en néerlandais.
const NL_EXACT = {          // texte entier d'un nœud
  'vriendelijk': 'Type',            // « Type » traduit par « gentil »
  'band': 'Groep',                  // « Groupe » traduit par « groupe de musique »
  'personeel': 'Persoonlijk',       // « Personnel » traduit par « le personnel »
  'indruk': 'Drukwerk',             // bouton « Impression »
  'problematisch': 'Vraagstuk',     // « Problématique »
  'deken': 'Omslag',                // « Couverture » du spécimen
  'editie': 'Redactioneel',         // « Édition »
  'hulpmiddelen': 'Tools',          // « Outils »
  'voorpersen': 'Prepress',         // « Mise en prépresse »
  'webafbeeldingen': 'Webdesign',   // « Graphisme web »
  'bestandsbeheer': 'Bestandscontrole',
  'bat-client': 'Drukproef voor de klant',
  'directe tonen': 'Steunkleuren',
  'superpositie en trapping': 'Overdruk en trapping',
  'aanpassing van media': 'Personalisatie van drukdragers',
  'het bewijs versturen': 'De drukproef versturen',
  'overzicht van de behaalde resultaten': 'Overzicht van het werk',
  'bekijk het exemplaar': 'Blader door het specimen',
  'het laden van het testexemplaar…': 'Specimen laden…',
  'start het experiment ↗': 'Start de ervaring ↗',
};
const NL_PHRASES = [         // fragments à l'intérieur d'un texte
  ['(personeel)', '(persoonlijk)'],
  ['Een standpunt,', 'Een vacature,'],
  ['Het definitieve bewijs:', 'De drukproef:'],
  ['uitgeverij & drukkerij', 'redactie & drukwerk'],
  ['tijdelijke bloemstukken', 'tijdelijke bloemmotieven'],
  ['postzegels', 'stempels'],
  ['type ondersteuning', 'type drager'],
  ['verkoopbrief', 'commerciële briefing'],
  ['Ondersteunend materiaal werd', 'Het drukwerk werd'],
  ['typografisch voorbeeld', 'typografisch specimen'],
  ['vormgeving van een voorbeeld (', 'vormgeving van een specimen ('],
  ['Dit was het maken van een proefdruk', 'Het ging om het maken van een specimen'],
];

// Titres coupés par <br> (plusieurs nœuds de texte) : on compare le texte complet de l'élément.
// « | » marque le retour à la ligne : chaque partie va dans un nœud, dans l'ordre.
const NL_ELEMENTS = {
  'aanpassing van media': 'Personalisatie|van drukdragers',
  'kalenderontwerp': 'Ontwerp|van kalenders',
  'patrooncollectie': 'Collectie|van patronen',
  'collectiepatronen': 'Collectie|van patronen',
  'kalender maken': 'Ontwerp van kalenders',
  'naar een metgezel': 'Naar Compagnon',
  '→ naar een metgezel': '→ Naar Compagnon',
  '→ richting compagnon': '→ Naar Compagnon',
};

// Titres protégés de Google (classe notranslate) qu'on traduit nous-mêmes en néerlandais ;
// le HTML français est gardé dans data-fr-html et remis au retour en français.
const NL_OWN = {
  'compagnon de route': 'Reisgenoot<br>Compagnon',
};

const normalize = t => t.replace(/[\s​]+/g, ' ').trim().toLowerCase();

function fixDutchNode(node) {
  const raw = node.textContent;
  const key = normalize(raw);
  let out = raw;
  if (NL_EXACT[key]) {
    const fix = NL_EXACT[key];
    const isUpper = raw.trim() === raw.trim().toUpperCase() && /[A-Z]/.test(raw);
    out = raw.replace(raw.trim(), isUpper ? fix.toUpperCase() : fix);
  } else {
    NL_PHRASES.forEach(([from, to]) => { if (out.includes(from)) out = out.split(from).join(to); });
  }
  if (out !== raw) node.textContent = out;
}

function fixDutchElement(el) {
  const fix = NL_ELEMENTS[normalize(el.textContent)];
  if (!fix) return;
  // on modifie les nœuds de texte existants (GTranslate garde l'original pour revenir au français)
  const nodes = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
  let parts = fix.split('|');
  if (parts.length > nodes.length) parts = [...parts.slice(0, nodes.length - 1), parts.slice(nodes.length - 1).join(' ')];
  nodes.forEach((n, i) => { n.textContent = parts[i] !== undefined ? parts[i] : ''; });
}

// Un titre traduit par un seul mot laisse son <br> devant une ligne vide : on le masque
// (classe utilisée seulement en néerlandais, voir header.css).
function hideEmptyLineBreaks(el) {
  el.querySelectorAll('br').forEach(br => {
    const hasText = dir => {
      let n = br;
      while ((n = dir === 'after' ? n.nextSibling : n.previousSibling)) if (/[^\s\u200b]/.test(n.textContent)) return true;
      return false;
    };
    br.classList.toggle('nl-empty-line', !hasText('after') || !hasText('before'));
  });
}

function translateOwn(el) {
  const html = NL_OWN[normalize(el.dataset.frHtml ? el.dataset.frText : el.innerText)];
  if (!html) return;
  if (!el.dataset.frHtml) { el.dataset.frHtml = el.innerHTML; el.dataset.frText = el.innerText; }
  if (el.innerHTML !== html) el.innerHTML = html;
}

function restoreOwn() {
  document.querySelectorAll('[data-fr-html]').forEach(el => {
    el.innerHTML = el.dataset.frHtml;
    delete el.dataset.frHtml; delete el.dataset.frText;
  });
}

function initDutchFixes() {
  const isDutch = () => document.documentElement.lang.startsWith('nl');
  let pending = null;
  const pass = () => {
    pending = null;
    if (!isDutch()) return restoreOwn();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) fixDutchNode(walker.currentNode);
    document.querySelectorAll('h1, h2, h3, h4, a, button, .next-title').forEach(fixDutchElement);
    document.querySelectorAll('.notranslate h1, h1.notranslate, h3.notranslate, .next-title.notranslate').forEach(translateOwn);
    document.querySelectorAll('h1, h2, h3, .next-title').forEach(hideEmptyLineBreaks);
  };
  const schedule = () => { if (!pending) pending = setTimeout(pass, 150); };
  new MutationObserver(() => { if (isDutch()) schedule(); })
    .observe(document.body, { subtree: true, childList: true, characterData: true });
  new MutationObserver(schedule)
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}

initDutchFixes();

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

// Retour depuis une page projet (lien …#projets) : sur mobile, on saute le texte
// d'introduction et on arrive directement sur « Projets sélectionnés ».
const jumpToProjects = location.hash === '#projets' && window.matchMedia('(max-width: 900px)').matches;

function scrollToProjects() {
  const section = document.getElementById('travail');
  if (!section) return;
  const nav = document.querySelector('nav');
  const offset = (nav ? nav.offsetHeight : 60) + 12;
  window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY - offset);
}

if (jumpToProjects) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollToProjects();
  // nouveau calage une fois le header, les polices et les images chargés
  window.addEventListener('load', () => setTimeout(scrollToProjects, 50));
  if (document.fonts) document.fonts.ready.then(scrollToProjects);
}

// Effet machine à écrire sur le titre et le texte introductif (pages impression et digital).
// Le texte garde sa place (lettres invisibles révélées une à une), puis le HTML d'origine
// est remis à la fin pour que GTranslate puisse le traduire normalement.
function initTypewriter() {
  const targets = [...document.querySelectorAll('.sidebar > h1, .sidebar > p')];
  if (!targets.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (/googtrans=\/fr\/(?!fr)/.test(document.cookie)) return; // page déjà traduite
  if (jumpToProjects) return; // retour d'un projet sur mobile : le texte n'est pas visible

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