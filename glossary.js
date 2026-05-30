/* ============================================================
   GLOSSAIRE — glossary.js
   Charge le style, crée le panneau, gère les interactions.
   À inclure dans les pages concernées :
   <script src="path/to/glossary.js" defer></script>
   ============================================================ */


/* ------------------------------------------------------------
   1. DÉFINITIONS
   Ajoute / modifie tes termes ici.
   "key" doit correspondre au data-key du span dans le HTML.
   ------------------------------------------------------------ */
const GLOSSARY = {
  Polypap: {
    label: "Polypap",
    def: "Entreprise spécialisée dans la fabrication et l'impression d'emballages destinés majoritairement aux fleuristes professionnels, de modèle donc B2B."
  },
  flexographie: {
    label: "flexographie",
    def: "Technique d'impression en relief qui utilise des plaques souples (en caoutchouc ou photopolymère), qu'on nomme cliché ou manchon, placées sur des cylindres pour transférer l'encre directement sur le support, fonctionnant comme un tampon encreur mais à échelle industrielle."
  },
  Jet: {
    label: "jet d'encre",
    def: "Technique d'impression numérique où des microgouttelettes d'encre sont projetées directement sur le support. Sans plaque ni contact, elle s'adapte à chaque tirage différemment — idéale pour la personnalisation et les petites quantités."
  },
  spécimen: {
    label: "spécimen",
    def: "Travail éditoral qui consite à présenter sous une forme imprimée une police d'écriture - l'idée étant de la mettre en valeur."
  },
    EDNA: {
    label: "EDNA",
    def: "École de design française qui est basée sur l'Île de Nantes proposant divers cursus autour du design dans toutes ses branches ; c'est là où j'ai suivi mon Bachelor et Master en média et graphisme."
  },
     Polytech: {
    label: "Polytech",
    def: "École d'ingénieurs publique proposant une formation généraliste en sciences et technologies. Fait partie du réseau Polytech, implanté dans plusieurs universités françaises."
  },
    Le_Vivant: {
    label: "Le Vivant",
    def: "Média de proximité local écologique, centré sur quatre départements : La Vienne, la Charente-Maritime, la Charente et les Deux-Sèvres. Il met en avant les initiatives solidaires-écologiques à l'échelle individuelle, communautaire et municipale."
  }

};


/* ------------------------------------------------------------
   2. INJECTION DU CSS
   Crée une balise <style> et l'insère dans le <head>.
   Comme ça, pas de fichier .css séparé à gérer.
   ------------------------------------------------------------ */
const style = document.createElement("style");
style.textContent = `
  .gloss-term-highlight {
    background: #ff660022;
    border-bottom: 1.5px solid #ff6600;
    cursor: pointer;
    padding: 0 2px;
    border-radius: 2px;
    transition: background 0.15s;
  }

  .gloss-term-highlight:hover {
    background: #ff660044;
  }

  #gloss-panel {
    position: fixed;
    top: 50%;
    right: -260px;
    transform: translateY(-50%);
    width: 220px;
    background: #fff;
    border: 0.5px solid #ff6600;
    border-radius: 8px;
    padding: 16px 18px;
    box-sizing: border-box;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    font-family: 'DM Sans', sans-serif;
  }

  #gloss-panel.open {
    right: 16px;
  }

  #gloss-panel-label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #ff6600;
    margin-bottom: 6px;
  }

  #gloss-panel-def {
    font-size: 13px;
    color: #555;
    line-height: 1.5;
  }
`;
document.head.appendChild(style);


/* ------------------------------------------------------------
   3. CRÉATION DU PANNEAU
   Insère un seul div#gloss-panel dans le <body>.
   Il est réutilisé pour tous les termes.
   ------------------------------------------------------------ */
const panel = document.createElement("div");
panel.id = "gloss-panel";
panel.innerHTML = `
  <div id="gloss-panel-label"></div>
  <div id="gloss-panel-def"></div>
`;
document.body.appendChild(panel);

const panelLabel = document.getElementById("gloss-panel-label");
const panelDef   = document.getElementById("gloss-panel-def");


/* ------------------------------------------------------------
   4. FONCTIONS OUVRIR / FERMER
   ------------------------------------------------------------ */
function openPanel(key) {
  const entry = GLOSSARY[key];
  if (!entry) return;
  panelLabel.textContent = entry.label;
  panelDef.textContent   = entry.def;
  panel.classList.add("open");
}

function closePanel() {
  panel.classList.remove("open");
}


/* ------------------------------------------------------------
   5. ÉVÉNEMENTS SUR LES MOTS SURLIGNÉS
   Cherche tous les span.term dans la page et leur attache
   un écouteur de clic.
   ------------------------------------------------------------ */
document.querySelectorAll("span.term").forEach(span => {
  span.classList.add("gloss-term-highlight");

  span.addEventListener("click", e => {
    e.stopPropagation(); // empêche le clic de "traverser" vers le document
    const key = span.dataset.key;

    if (panel.classList.contains("open") && panelLabel.textContent === GLOSSARY[key]?.label) {
      closePanel(); // clic sur le même mot = ferme
    } else {
      openPanel(key); // clic sur un mot différent = remplace
    }
  });
});


/* ------------------------------------------------------------
   6. FERMETURE AU CLIC AILLEURS
   Un clic sur n'importe quoi d'autre que le panneau
   ou un mot surligné ferme le panneau.
   ------------------------------------------------------------ */
document.addEventListener("click", e => {
  if (!panel.contains(e.target)) {
    closePanel();
  }
});