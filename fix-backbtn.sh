#!/bin/bash

files=("calendar.html" "patterns.html" "specimen.html" "personnalisation.html")

for file in "${files[@]}"; do
  # Ajoute l'id sur le bouton retour
  sed -i 's|<a href="index.html" class="back-btn">|<a id="back-btn" href="index.html" class="back-btn">|g' "$file"

  # Ajoute le script avant </body> s'il n'est pas déjà là
  grep -q "back-btn.*from" "$file" || \
  sed -i 's|</body>|<script>\nconst from = new URLSearchParams(window.location.search).get("from");\nif (from === "print") document.getElementById("back-btn").href = "print.html";\n</script>\n</body>|' "$file"
done

# Ajoute ?from=print sur les liens dans print.html
sed -i 's|href="calendar.html"|href="calendar.html?from=print"|g' print.html
sed -i 's|href="patterns.html"|href="patterns.html?from=print"|g' print.html
sed -i 's|href="specimen.html"|href="specimen.html?from=print"|g' print.html
sed -i 's|href="personnalisation.html"|href="personnalisation.html?from=print"|g' print.html

echo "Done."