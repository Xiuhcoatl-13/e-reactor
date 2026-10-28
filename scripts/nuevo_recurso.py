# -*- coding: utf-8 -*-
"""
e-Reactor · Agrega un recurso nuevo al sitio (asistente paso a paso).

Uso:  doble clic en AGREGAR_RECURSO.bat   (o: python scripts/nuevo_recurso.py)

Te pregunta el archivo, título, materia, tema, etc.; crea la carpeta
recursos/<nombre>/ con el archivo y su ficha.json, y actualiza el catálogo.
"""
import json
import os
import re
import shutil
import sys
import unicodedata
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import construir_catalogo as cc  # noqa: E402

SITIO = cc.SITIO
RECURSOS = cc.RECURSOS
RUTA_MATERIAS = os.path.join(cc.DATOS, "materias.json")

NOMBRE_TIPO = {
    "simulacion": "Simulación interactiva (HTML)", "calculadora": "Calculadora (HTML)",
    "python": "Código Python", "notebook": "Notebook de Jupyter", "matlab": "Código MATLAB",
    "excel": "Hoja de Excel", "video": "Video / animación", "pdf": "Apuntes (PDF)", "archivo": "Archivo descargable",
}


def preguntar(texto, defecto=None, obligatorio=False):
    while True:
        sufijo = f" [{defecto}]" if defecto else ""
        try:
            r = input(f"{texto}{sufijo}: ").strip()
        except EOFError:
            r = ""
        if not r and defecto is not None:
            return defecto
        if r or not obligatorio:
            return r
        print("   (Este dato es obligatorio)")


def si_no(texto, defecto=False):
    r = preguntar(texto + (" (S/n)" if defecto else " (s/N)")).lower()
    return defecto if not r else r.startswith("s")


def elegir(texto, opciones, defecto=None):
    for i, o in enumerate(opciones, 1):
        print(f"   {i}. {o}")
    while True:
        r = preguntar(texto, str(defecto) if defecto else None)
        if r.isdigit() and 1 <= int(r) <= len(opciones):
            return int(r) - 1
        print(f"   Escribe un número del 1 al {len(opciones)}")


def limpiar_ruta(r):
    r = r.strip()
    if r.startswith("& "):  # PowerShell al arrastrar un archivo
        r = r[2:].strip()
    return r.strip('"').strip("'").strip()


def pedir_archivo(texto, permitir_url=False, obligatorio=True):
    while True:
        r = limpiar_ruta(preguntar(texto, obligatorio=obligatorio))
        if not r:
            return None
        if permitir_url and re.match(r"^https?://", r, re.I):
            return r
        r = os.path.expanduser(r)
        if os.path.isfile(r):
            return os.path.abspath(r)
        print(f"   No encuentro el archivo: {r}")


def slug(texto):
    s = unicodedata.normalize("NFD", texto)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:60].rstrip("-") or "recurso"


def dentro_del_sitio(ruta):
    return os.path.abspath(ruta).startswith(SITIO + os.sep)


def main():
    print("=" * 60)
    print(" e-Reactor · Agregar un recurso nuevo")
    print("=" * 60)
    print("Consejo: puedes ARRASTRAR el archivo a esta ventana en lugar de escribir la ruta.\n")

    with open(RUTA_MATERIAS, encoding="utf-8-sig") as f:
        mat_json = json.load(f)
    materias = mat_json["materias"]

    # 1. Archivo
    principal = pedir_archivo("1) Archivo principal (o enlace de YouTube)", permitir_url=True)
    es_url = not os.path.isfile(principal)
    ext = "" if es_url else os.path.splitext(principal)[1].lstrip(".").lower()
    tipo = "video" if es_url else cc.EXT_TIPO.get(ext, "archivo")
    if tipo == "simulacion":
        i = elegir("   ¿Qué es este HTML?", ["Simulación interactiva", "Calculadora / base de datos"], 1)
        tipo = ["simulacion", "calculadora"][i]
    print(f"   Tipo detectado: {NOMBRE_TIPO[tipo]}\n")

    # 2. Textos
    titulo = preguntar("2) Título", obligatorio=True)
    descripcion = preguntar("3) Descripción corta (1-2 oraciones)", obligatorio=True)

    # 3. Materia y tema
    print("\n4) ¿A qué materia pertenece?")
    m = materias[elegir("   Número de materia", [x["nombre"] for x in materias])]
    temas = m.get("temas", [])
    print(f"\n5) Tema dentro de «{m['nombre']}»")
    i = elegir("   Número de tema", temas + ["(Escribir un tema nuevo)"])
    if i < len(temas):
        tema = temas[i]
    else:
        tema = preguntar("   Nombre del tema nuevo", obligatorio=True)
        if si_no("   ¿Agregarlo a la lista de temas de la materia?", True):
            m.setdefault("temas", []).append(tema)
            with open(RUTA_MATERIAS, "w", encoding="utf-8", newline="\n") as f:
                json.dump(mat_json, f, ensure_ascii=False, indent=2)
                f.write("\n")

    # 4. Detalles
    print("\n6) Nivel")
    nivel = ["basico", "intermedio", "avanzado"][elegir("   Número", ["Básico", "Intermedio", "Avanzado"], 1)]
    etiquetas = [e.strip() for e in preguntar("7) Palabras clave separadas por coma (opcional)").split(",") if e.strip()]
    objetivos = []
    print("8) Lo que aprenderá el estudiante (opcional). Escribe uno por línea; Enter vacío para terminar.")
    while True:
        o = preguntar("   -")
        if not o:
            break
        objetivos.append(o)
    destacado = si_no("9) ¿Mostrarlo en «Recursos destacados» de la portada?")

    # 5. Archivos extra
    copiar_carpeta = False
    if tipo in ("simulacion", "calculadora") and not dentro_del_sitio(principal):
        copiar_carpeta = si_no("10) ¿El HTML usa otros archivos de su misma carpeta (imágenes, .js, .css)?")
    adjuntos = []
    print("11) Archivos adicionales para descargar (ej. el Excel o los datos). Arrástralos uno por uno; Enter vacío para terminar.")
    while True:
        a = pedir_archivo("   Archivo adicional", obligatorio=False)
        if not a:
            break
        adjuntos.append(a)

    # 6. Carpeta
    base = slug(titulo)
    nombre = preguntar("\n12) Nombre de la carpeta (aparece en el enlace)", base)
    nombre = slug(nombre)
    destino = os.path.join(RECURSOS, nombre)
    n = 2
    while os.path.exists(destino):
        destino = os.path.join(RECURSOS, f"{nombre}-{n}")
        n += 1
    nombre = os.path.basename(destino)
    os.makedirs(destino)

    ficha = {"titulo": titulo, "descripcion": descripcion, "materia": m["id"], "tema": tema}
    if es_url:
        ficha["url"] = principal
    elif dentro_del_sitio(principal):
        ficha["archivo"] = "/" + os.path.relpath(principal, SITIO).replace(os.sep, "/")
    else:
        if copiar_carpeta:
            origen = os.path.dirname(principal)
            archivos = [f for f in os.listdir(origen) if os.path.isfile(os.path.join(origen, f))]
            total = sum(os.path.getsize(os.path.join(origen, f)) for f in archivos)
            print(f"   Se copiarán {len(archivos)} archivos ({total / 1048576:.1f} MB) de {origen}")
            if total > 50 * 1048576 and not si_no("   Es bastante pesado. ¿Continuar?"):
                copiar_carpeta = False
            if copiar_carpeta:
                for f in archivos:
                    shutil.copy2(os.path.join(origen, f), destino)
        if not copiar_carpeta:
            shutil.copy2(principal, destino)
        ficha["archivo"] = os.path.basename(principal)
    ficha["tipo"] = tipo
    if adjuntos:
        ficha["adjuntos"] = []
        for a in adjuntos:
            if dentro_del_sitio(a):
                ficha["adjuntos"].append("/" + os.path.relpath(a, SITIO).replace(os.sep, "/"))
            else:
                shutil.copy2(a, destino)
                ficha["adjuntos"].append(os.path.basename(a))
    ficha["nivel"] = nivel
    ficha["etiquetas"] = etiquetas
    if objetivos:
        ficha["objetivos"] = objetivos
    ficha["destacado"] = destacado
    ficha["fecha"] = date.today().isoformat()

    with open(os.path.join(destino, "ficha.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(ficha, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nCreado: recursos/{nombre}/")
    print("Actualizando el catálogo...\n")
    codigo = cc.main()
    print("\nSiguiente paso: abre VER_SITIO_LOCAL.bat para revisarlo y luego")
    print("PUBLICAR_CAMBIOS.bat (o GitHub Desktop) para subirlo a internet.")
    return codigo


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nCancelado. No se publicó nada nuevo.")
        sys.exit(1)
