# -*- coding: utf-8 -*-
"""
e-Reactor · Copia los módulos HTML de la app Android al sitio web.

La app es la fuente original: cuando mejores un módulo en
  e-reactor-android/app/src/main/assets/web/
ejecuta SINCRONIZAR_APP.bat y el sitio quedará con la misma versión.

Al copiar, cada módulo se ajusta para la web:
  - el botón «← Inicio» lleva a la portada del sitio;
  - si el módulo se ve incrustado en una página de recurso, ese botón se oculta.
"""
import os
import re
import shutil
import sys

SITIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_WEB = os.path.join("e-reactor-android", "app", "src", "main", "assets", "web")
# La app puede estar junto al sitio o dentro de la carpeta e-Reactor\
_CANDIDATOS = [
    os.path.join(os.path.dirname(SITIO), _WEB),
    os.path.join(os.path.dirname(SITIO), "e-Reactor", _WEB),
]
ORIGEN_DEF = next((c for c in _CANDIDATOS if os.path.isdir(c)), _CANDIDATOS[-1])
DESTINO = os.path.join(SITIO, "modulos")
OMITIR = {"index.html", "splash.html"}
MARCA = "<!-- e-reactor-web -->"
INYECCION = (
    MARCA + "\n<script>if(window.self!==window.top)document.documentElement.classList.add('er-embebido');</script>\n"
    # Incrustado, la página del recurso ya muestra título y descripción: se oculta el encabezado propio del módulo
    "<style>.er-embebido .back-link,.er-embebido .module-hero,.er-embebido .topbar,"
    ".er-embebido .topbar+.sub{display:none!important}</style>\n"
)


def adaptar(html):
    if MARCA not in html:
        html = re.sub(r"(<head[^>]*>)", r"\1\n" + INYECCION, html, count=1, flags=re.I)
    # En la app, index.html es el menú; en el sitio, la portada está un nivel arriba
    html = re.sub(r'href="index\.html"', 'href="../index.html"', html)
    return html


def main(origen=ORIGEN_DEF):
    if not os.path.isdir(origen):
        print(f"No encuentro la carpeta de la app:\n  {origen}")
        print("Pasa la ruta como argumento: python scripts/sincronizar_modulos_app.py RUTA")
        return 1
    os.makedirs(DESTINO, exist_ok=True)
    copiados = []
    for nombre in sorted(os.listdir(origen)):
        src = os.path.join(origen, nombre)
        if not os.path.isfile(src) or nombre in OMITIR:
            continue
        if not nombre.lower().endswith((".html", ".js", ".css", ".json", ".png", ".jpg", ".svg", ".webp")):
            continue
        dst = os.path.join(DESTINO, nombre)
        if nombre.lower().endswith(".html"):
            with open(src, encoding="utf-8") as f:
                txt = adaptar(f.read())
            with open(dst, "w", encoding="utf-8", newline="\n") as f:
                f.write(txt)
        else:
            shutil.copy2(src, dst)
        copiados.append(nombre)

    # ¿Hay módulos sin ficha?
    usados = set()
    rec = os.path.join(SITIO, "recursos")
    for carpeta in os.listdir(rec) if os.path.isdir(rec) else []:
        ficha = os.path.join(rec, carpeta, "ficha.json")
        if os.path.exists(ficha):
            with open(ficha, encoding="utf-8-sig") as f:
                usados.update(re.findall(r"/modulos/([^\"]+\.html)", f.read()))
    sin_ficha = [n for n in copiados if n.endswith(".html") and n not in usados]

    print(f"Copiados {len(copiados)} archivos de la app a modulos/")
    if sin_ficha:
        print("\nMódulos nuevos que aún no aparecen en el sitio (créales una ficha con AGREGAR_RECURSO.bat")
        print("eligiendo el archivo dentro de la carpeta modulos/):")
        for n in sin_ficha:
            print("  - " + n)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else ORIGEN_DEF))
