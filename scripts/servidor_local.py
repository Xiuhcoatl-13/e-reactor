# -*- coding: utf-8 -*-
"""
e-Reactor · Servidor local para revisar el sitio antes de publicarlo.

Uso: doble clic en VER_SITIO_LOCAL.bat  (o: python scripts/servidor_local.py)
Abre http://localhost:8000 en tu navegador. Cierra la ventana para detenerlo.
"""
import functools
import http.server
import os
import threading
import webbrowser

SITIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Manejador(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".ipynb": "application/json",
        ".py": "text/plain; charset=utf-8",
        ".m": "text/plain; charset=utf-8",
        ".csv": "text/csv; charset=utf-8",
        ".svg": "image/svg+xml",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")  # siempre la versión más reciente
        super().end_headers()

    def log_message(self, *args):
        pass


def main():
    servidor = None
    for puerto in range(8000, 8020):
        try:
            servidor = http.server.ThreadingHTTPServer(("127.0.0.1", puerto), functools.partial(Manejador, directory=SITIO))
            break
        except OSError:
            continue
    if servidor is None:
        print("No encontré un puerto libre entre 8000 y 8019.")
        return
    url = f"http://localhost:{puerto}/"
    print("=" * 60)
    print(" e-Reactor · vista previa local")
    print("=" * 60)
    print(f" Abriendo {url}")
    print(" Deja esta ventana abierta mientras revisas el sitio.")
    print(" Para detenerlo, cierra la ventana (o presiona Ctrl+C).")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
