# -*- coding: utf-8 -*-
"""
e-Reactor · Construye el catálogo del sitio.

Lee:   datos/config.json, datos/materias.json y recursos/*/ficha.json
Crea:  datos/catalogo.js  (lo que usa la página para mostrar todo)
       sitemap.xml y robots.txt  (solo si config.json tiene "url_base")

Uso:   python scripts/construir_catalogo.py      (o doble clic en ACTUALIZAR_CATALOGO.bat)
Solo usa la biblioteca estándar de Python 3.8+.
"""
import json
import os
import re
import sys
import unicodedata
from datetime import date, datetime

SITIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATOS = os.path.join(SITIO, "datos")
RECURSOS = os.path.join(SITIO, "recursos")

EXT_TIPO = {
    "html": "simulacion", "htm": "simulacion",
    "py": "python", "ipynb": "notebook",
    "m": "matlab", "mlx": "matlab",
    "xlsx": "excel", "xlsm": "excel", "xls": "excel", "csv": "excel", "ods": "excel",
    "pdf": "pdf",
    "mp4": "video", "webm": "video", "mov": "video",
}
TIPOS_VALIDOS = {"simulacion", "calculadora", "python", "notebook", "matlab", "excel", "video", "pdf", "archivo"}
NIVELES = {"basico": "basico", "intermedio": "intermedio", "avanzado": "avanzado"}

errores = []
avisos = []


def norm(s):
    s = unicodedata.normalize("NFD", str(s or ""))
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower().strip()


def leer_json(ruta, que):
    try:
        # utf-8-sig: tolera el BOM que agrega el Bloc de notas de Windows
        with open(ruta, encoding="utf-8-sig") as f:
            return json.load(f)
    except FileNotFoundError:
        errores.append(f"No existe {que}: {os.path.relpath(ruta, SITIO)}")
    except json.JSONDecodeError as e:
        errores.append(
            f"{que} tiene un error de formato en la línea {e.lineno}, columna {e.colno}: {e.msg}.\n"
            f"         Revisa comas, comillas y llaves en {os.path.relpath(ruta, SITIO)}"
        )
    return None


def ruta_web(ruta_abs):
    return os.path.relpath(ruta_abs, SITIO).replace(os.sep, "/")


def resolver(valor, carpeta):
    """'/modulos/x.html' -> relativo a la raíz del sitio; 'x.py' -> relativo a la carpeta del recurso."""
    valor = str(valor).strip()
    if valor.startswith("/"):
        return os.path.normpath(os.path.join(SITIO, valor.lstrip("/")))
    return os.path.normpath(os.path.join(carpeta, valor))


def es_url(v):
    return bool(re.match(r"^https?://", str(v or ""), re.I))


def construir():
    config = leer_json(os.path.join(DATOS, "config.json"), "datos/config.json") or {}
    mat_json = leer_json(os.path.join(DATOS, "materias.json"), "datos/materias.json") or {}
    materias = [m for m in mat_json.get("materias", []) if isinstance(m, dict) and m.get("id")]
    por_id = {m["id"]: m for m in materias}
    config = {k: v for k, v in config.items() if not k.startswith("_")}

    recursos = []
    if not os.path.isdir(RECURSOS):
        os.makedirs(RECURSOS)

    for nombre in sorted(os.listdir(RECURSOS)):
        carpeta = os.path.join(RECURSOS, nombre)
        if not os.path.isdir(carpeta) or nombre.startswith((".", "_")):
            continue
        ruta_ficha = os.path.join(carpeta, "ficha.json")
        if not os.path.exists(ruta_ficha):
            avisos.append(f"recursos/{nombre}: no tiene ficha.json (se ignora)")
            continue
        ficha = leer_json(ruta_ficha, f"La ficha de '{nombre}'")
        if not isinstance(ficha, dict):
            continue
        if ficha.get("publicado") is False:
            avisos.append(f"{nombre}: marcado como no publicado (\"publicado\": false)")
            continue

        def falla(msg):
            errores.append(f"{nombre}: {msg}")

        titulo = str(ficha.get("titulo", "")).strip()
        if not titulo:
            falla('falta "titulo"')
            continue

        idm = str(ficha.get("materia", "")).strip()
        if idm not in por_id:
            falla(f'la materia "{idm}" no existe. Opciones: {", ".join(por_id)}')
            continue

        r = {"id": nombre, "titulo": titulo, "descripcion": str(ficha.get("descripcion", "")).strip(), "materia": idm}

        tema = str(ficha.get("tema", "")).strip()
        if tema:
            temas = por_id[idm].get("temas", [])
            igual = [t for t in temas if norm(t) == norm(tema)]
            if igual:
                tema = igual[0]
            else:
                avisos.append(f'{nombre}: el tema "{tema}" no está en la lista de {idm} (se mostrará como tema nuevo)')
        r["tema"] = tema

        tambien = []
        for u in ficha.get("tambien_en", []) or []:
            if isinstance(u, str):
                u = {"materia": u}
            if not isinstance(u, dict) or u.get("materia") not in por_id:
                avisos.append(f"{nombre}: 'tambien_en' tiene una materia que no existe: {u}")
                continue
            t2 = str(u.get("tema", "")).strip()
            igual = [t for t in por_id[u["materia"]].get("temas", []) if norm(t) == norm(t2)]
            tambien.append({"materia": u["materia"], "tema": igual[0] if igual else t2})
        if tambien:
            r["tambien_en"] = tambien

        # Archivo principal o enlace
        archivo = ficha.get("archivo")
        url = ficha.get("url")
        ext = ""
        if archivo and es_url(archivo):
            url, archivo = archivo, None
        if archivo:
            abs_ = resolver(archivo, carpeta)
            if not os.path.isfile(abs_):
                falla(f'no encuentro el archivo "{archivo}"')
                continue
            if not abs_.startswith(SITIO):
                falla(f'el archivo "{archivo}" está fuera de la carpeta del sitio')
                continue
            r["archivo"] = ruta_web(abs_)
            r["bytes"] = os.path.getsize(abs_)
            ext = os.path.splitext(abs_)[1].lstrip(".").lower()
            r["ext"] = ext
        elif url:
            r["url"] = str(url).strip()
        else:
            falla('falta "archivo" (o "url" para videos de YouTube)')
            continue

        tipo = norm(ficha.get("tipo", ""))
        if tipo == "simulación":
            tipo = "simulacion"
        if tipo not in TIPOS_VALIDOS:
            if tipo:
                avisos.append(f'{nombre}: tipo "{ficha.get("tipo")}" desconocido; se deduce de la extensión')
            tipo = EXT_TIPO.get(ext, "video" if url else "archivo")
        r["tipo"] = tipo

        adj = []
        for a in ficha.get("adjuntos", []) or []:
            if isinstance(a, str):
                a = {"archivo": a}
            if not isinstance(a, dict) or not a.get("archivo"):
                continue
            abs_ = resolver(a["archivo"], carpeta)
            if not os.path.isfile(abs_):
                avisos.append(f'{nombre}: no encuentro el adjunto "{a["archivo"]}" (se omite)')
                continue
            item = {"nombre": os.path.basename(abs_), "ruta": ruta_web(abs_), "bytes": os.path.getsize(abs_)}
            if a.get("titulo"):
                item["titulo"] = a["titulo"]
            adj.append(item)
        if adj:
            r["adjuntos"] = adj

        nivel = NIVELES.get(norm(ficha.get("nivel", "")))
        if nivel:
            r["nivel"] = nivel
        elif ficha.get("nivel"):
            avisos.append(f'{nombre}: nivel "{ficha.get("nivel")}" no válido (usa basico, intermedio o avanzado)')

        for campo in ("sigla", "autor"):
            if ficha.get(campo):
                r[campo] = str(ficha[campo]).strip()
        etiquetas = ficha.get("etiquetas") or []
        if isinstance(etiquetas, str):
            etiquetas = [e.strip() for e in etiquetas.split(",")]
        r["etiquetas"] = [str(e).strip() for e in etiquetas if str(e).strip()]
        if ficha.get("objetivos"):
            r["objetivos"] = [str(o).strip() for o in ficha["objetivos"] if str(o).strip()]
        if ficha.get("destacado"):
            r["destacado"] = True
        if ficha.get("vertical"):
            r["vertical"] = True
        if ficha.get("altura") not in (None, "", "auto"):
            r["altura"] = ficha["altura"]

        fecha = str(ficha.get("fecha", "")).strip()
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", fecha):
            ref = os.path.join(SITIO, r["archivo"]) if r.get("archivo") else ruta_ficha
            fecha = datetime.fromtimestamp(os.path.getmtime(ref)).strftime("%Y-%m-%d")
        r["fecha"] = fecha
        recursos.append(r)

    catalogo = {
        "generado": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "config": config,
        "materias": materias,
        "recursos": recursos,
    }
    salida = os.path.join(DATOS, "catalogo.js")
    with open(salida, "w", encoding="utf-8", newline="\n") as f:
        f.write("/* Archivo GENERADO por scripts/construir_catalogo.py — no lo edites a mano. */\n")
        f.write("window.EREACTOR = ")
        json.dump(catalogo, f, ensure_ascii=False, indent=1)
        f.write(";\n")

    extras_web(config, materias, recursos)
    return recursos, materias


def extras_web(config, materias, recursos):
    base = str(config.get("url_base", "")).strip().rstrip("/")
    if not base:
        return
    hoy = date.today().isoformat()
    urls = [(f"{base}/", hoy), (f"{base}/explorar.html", hoy), (f"{base}/acerca.html", hoy)]
    urls += [(f"{base}/materia.html?id={m['id']}", hoy) for m in materias]
    urls += [(f"{base}/recurso.html?id={r['id']}", r["fecha"]) for r in recursos]
    with open(os.path.join(SITIO, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for u, d in urls:
            u = u.replace("&", "&amp;")
            f.write(f"  <url><loc>{u}</loc><lastmod>{d}</lastmod></url>\n")
        f.write("</urlset>\n")
    with open(os.path.join(SITIO, "robots.txt"), "w", encoding="utf-8", newline="\n") as f:
        f.write(f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n")
    # Imagen para vista previa en WhatsApp/Facebook: necesita URL absoluta
    for pag in ("index.html", "explorar.html", "materia.html", "recurso.html", "acerca.html"):
        ruta = os.path.join(SITIO, pag)
        if not os.path.exists(ruta):
            continue
        with open(ruta, encoding="utf-8") as f:
            txt = f.read()
        nuevo = re.sub(r'(<meta property="og:image" content=")[^"]*(")', rf"\g<1>{base}/assets/og-e-reactor.png\g<2>", txt)
        if nuevo != txt:
            with open(ruta, "w", encoding="utf-8", newline="\n") as f:
                f.write(nuevo)


def main():
    recursos, materias = construir()
    print("=" * 60)
    print(" e-Reactor · catálogo actualizado")
    print("=" * 60)
    conteo = {}
    for r in recursos:
        for idm in {r["materia"], *[u["materia"] for u in r.get("tambien_en", [])]}:
            conteo[idm] = conteo.get(idm, 0) + 1
    for m in materias:
        n = conteo.get(m["id"], 0)
        print(f"  {m['nombre'][:44]:<44} {n:>3} recurso(s)")
    print("-" * 60)
    print(f"  Total: {len(recursos)} recursos publicados")
    if avisos:
        print("\nAVISOS (no impiden publicar):")
        for a in avisos:
            print("  - " + a)
    if errores:
        print("\nERRORES (estos recursos NO se publicaron):")
        for e in errores:
            print("  - " + e)
        return 1
    print("\nTodo en orden.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
