import re

nouveau_bloc = """const thumb = document.getElementById('toggleThumb');
  const btndigital = document.getElementById('btndigital');
  const btnPhysique = document.getElementById('btnPhysique');

  function updateToggle() {
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === 'digital.html') {
      thumb.style.transform = `translateX(${btndigital.offsetWidth}px)`;
      thumb.style.width = btnPhysique.offsetWidth + 'px';
    } else {
      thumb.style.transform = 'translateX(0)';
      thumb.style.width = btndigital.offsetWidth + 'px';
    }
  }

  window.addEventListener('load', updateToggle);
  window.addEventListener('resize', updateToggle);"""

motif = r'const thumb = document\.getElementById\(\'toggleThumb\'\);.*?window\.addEventListener\(\'resize\', updateToggle\);'

for fichier in ['index.html', 'digital.html']:
    with open(fichier, 'r', encoding='utf-8') as f:
        contenu = f.read()
    contenu = re.sub(motif, nouveau_bloc, contenu, count=1, flags=re.DOTALL)
    with open(fichier, 'w', encoding='utf-8') as f:
        f.write(contenu)
    print(f"{fichier} mis à jour.")
