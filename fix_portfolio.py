import re, sys, pathlib

def fix_file(path):
    text = pathlib.Path(path).read_text(encoding='utf-8')
    original = text

    # 1. <nav> contenant header-placeholder → div simple
    text = re.sub(
        r'<nav>\s*<div id="header-placeholder"></div>\s*</nav>',
        '<div id="header-placeholder"></div>',
        text
    )

    # 2. Footer codé en dur → placeholder
    text = re.sub(
        r'(<!-- ── FOOTER ── -->)\s*<footer>[\s\S]*?</footer>',
        r'\1\n  <div id="footer-placeholder"></div>',
        text
    )

    # 3. Supprime le bloc fetch header dans un <script> inline
    #    Cible : fetch('./includes/header.html') ... catch(err => ...);
    text = re.sub(
        r"\n?\s*fetch\(['\"]\.\/includes\/header\.html['\"]\)[\s\S]*?\.catch\(err => console\.error\([^)]+\)\);\s*",
        '\n    ',
        text
    )

    if text != original:
        pathlib.Path(path).write_text(text, encoding='utf-8')
        print(f"[OK] {path}")
    else:
        print(f"[INCHANGÉ] {path}")

if __name__ == '__main__':
    for p in sys.argv[1:]:
        fix_file(p)
