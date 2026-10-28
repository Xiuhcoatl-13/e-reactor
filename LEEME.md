# e-Reactor · sitio web

Sitio educativo de Ingeniería Química en español. Es un **sitio estático**: solo archivos HTML, CSS y JavaScript, sin servidor ni base de datos. Por eso puede alojarse **gratis** (GitHub Pages) y casi no requiere mantenimiento.

---

## 1. Qué hay en esta carpeta

```
e-reactor-sitio/
├─ index.html, explorar.html, materia.html, recurso.html, acerca.html   ← páginas del sitio
├─ datos/
│   ├─ config.json      ← nombre, lema, autor, correo, licencia, GitHub…   (TÚ LO EDITAS)
│   ├─ materias.json    ← materias y temas                                  (TÚ LO EDITAS)
│   └─ catalogo.js      ← se genera solo; no lo edites
├─ recursos/            ← UNA carpeta por recurso, con su ficha.json y sus archivos
├─ modulos/             ← copia de los módulos HTML de la app Android
├─ assets/              ← estilos, lógica, íconos y bibliotecas
├─ scripts/             ← los programas de Python que hacen el trabajo
│
├─ VER_SITIO_LOCAL.bat      ← abre el sitio en tu navegador para revisarlo
├─ AGREGAR_RECURSO.bat      ← asistente para subir contenido nuevo
├─ ACTUALIZAR_CATALOGO.bat  ← regenera el catálogo si editaste fichas a mano
├─ SINCRONIZAR_APP.bat      ← trae la versión más reciente de los módulos de la app
└─ PUBLICAR_CAMBIOS.bat     ← sube los cambios a internet (cuando ya esté en GitHub)
```

Solo necesitas **Python 3** (el mismo que ya usas para `GENERAR_DATOS.bat`).

### Primeros pasos

1. Doble clic en **`SINCRONIZAR_APP.bat`**: copia los 14 módulos de tu app Android a `modulos/` y actualiza el catálogo. (Esta carpeta debe quedar junto a `e-reactor-android`, como está ahora.)
2. Doble clic en **`VER_SITIO_LOCAL.bat`** para verlo en tu navegador.
3. Cuando te guste, sigue la sección 4 para ponerlo en internet.

---

## 2. Ver el sitio en tu computadora

Doble clic en **`VER_SITIO_LOCAL.bat`**. Se abre `http://localhost:8000` en tu navegador. Deja la ventana negra abierta mientras revisas; ciérrala para terminar.

> No abras `index.html` con doble clic: algunas vistas (código, Excel, notebooks) necesitan un servidor. En internet funcionan automáticamente.

---

## 3. Agregar contenido

### Opción fácil: el asistente

Doble clic en **`AGREGAR_RECURSO.bat`** y responde las preguntas. Puedes **arrastrar el archivo** a la ventana en lugar de escribir la ruta. El asistente:

1. crea la carpeta `recursos/<nombre-del-recurso>/`,
2. copia ahí tu archivo (y los adicionales),
3. escribe su `ficha.json`,
4. actualiza el catálogo.

### Qué ve el estudiante según el tipo de archivo

| Archivo | Tipo | Qué se muestra en la página |
|---|---|---|
| `.html` | Simulación o calculadora | Se usa **ahí mismo**, con botón de pantalla completa y de pestaña nueva |
| `.py` | Código Python | Código con colores, **botón «Ejecutar aquí»** (Python corre en el navegador, con numpy, scipy y matplotlib), editar, copiar y descargar |
| `.ipynb` | Notebook de Jupyter | El notebook completo con ecuaciones, código, resultados y gráficas; botón «Abrir en Google Colab» (si configuras GitHub) |
| `.m` | Código MATLAB | Código con colores, copiar, descargar y «Abrir en MATLAB Online» (si configuras GitHub) |
| `.xlsx` `.xls` `.csv` | Hoja de Excel | Vista previa de cada hoja; las celdas con fórmula se marcan en azul y muestran la fórmula al pasar el cursor |
| Enlace de YouTube | Video | El video incrustado (los *Shorts* verticales se detectan solos) |
| `.mp4` | Video | Reproductor (mejor súbelos a YouTube; ver sección 7) |
| `.pdf` | Apuntes | El PDF incrustado en computadora; botón para abrirlo en el celular |
| Otro (`.zip`, `.bkp`, `.dwxmz`…) | Archivo | Botón de descarga |

### La ficha (`ficha.json`)

Cada recurso tiene una ficha. Puedes editarla con el Bloc de notas y luego correr `ACTUALIZAR_CATALOGO.bat`:

```json
{
  "titulo": "CSTR vs. PFR: volumen requerido y gráfica de Levenspiel",
  "descripcion": "Una o dos oraciones que aparecen en la tarjeta.",
  "materia": "reactores",
  "tema": "Reactores ideales",
  "tambien_en": [{ "materia": "numericos", "tema": "Python para ingeniería" }],
  "archivo": "cstr_vs_pfr.py",
  "tipo": "python",
  "sigla": "Py",
  "nivel": "intermedio",
  "etiquetas": ["CSTR", "PFR", "Levenspiel"],
  "objetivos": ["Lo que aprenderá el estudiante…"],
  "adjuntos": ["datos.xlsx"],
  "destacado": true,
  "fecha": "2026-10-21"
}
```

- **Obligatorios:** `titulo`, `materia` y `archivo` (o `"url"` para YouTube).
- `materia`: el `id` de una materia de `datos/materias.json` (`balances`, `termodinamica`, `transporte`, `reactores`, `operaciones`, `numericos`, `simulacion`, `control`, `ambiental`).
- `tipo`: se deduce de la extensión. Para un `.html` puedes elegir `simulacion` o `calculadora`.
- `sigla`: las 2–4 letras del cuadrito de la tarjeta (como en la app: Pv, Tc, ΔH…).
- `nivel`: `basico`, `intermedio` o `avanzado`.
- `destacado: true` lo muestra en la portada.
- `"publicado": false` lo oculta sin borrarlo. Una carpeta cuyo nombre empieza con `_` también se ignora (útil para borradores).
- Si el `archivo` empieza con `/`, se busca desde la raíz del sitio (así apuntan los módulos de la app: `"/modulos/antoine.html"`).

### Materias y temas

Edita `datos/materias.json` para agregar materias o temas. Colores disponibles: `azul`, `verde`, `ambar`, `pizarra`, `violeta`, `rosa`, `oliva`, `cafe`. Las materias sin recursos aparecen como «Próximamente».

---

## 4. Publicarlo en internet gratis (GitHub Pages)

Se hace **una sola vez** (unos 20 minutos):

1. Crea una cuenta en <https://github.com> (gratis).
2. Instala **GitHub Desktop**: <https://desktop.github.com>. Inicia sesión con tu cuenta.
3. En GitHub Desktop: **File → Add local repository…** → elige esta carpeta `e-reactor-sitio` → te dirá que no es un repositorio: pulsa **create a repository**. Nombre: `e-reactor`. Luego **Publish repository** y **desmarca** «Keep this code private» (GitHub Pages gratis requiere repositorio público).
4. En el navegador, abre tu repositorio en GitHub → **Settings → Pages** → en *Source* elige **Deploy from a branch**, rama **main**, carpeta **/ (root)** → **Save**.
5. En 1–2 minutos tu sitio estará en `https://TU-USUARIO.github.io/e-reactor/`.
6. Abre `datos/config.json` y llena:
   - `"url_base": "https://TU-USUARIO.github.io/e-reactor"`
   - `"github_repo": "TU-USUARIO/e-reactor"` (activa «Abrir en Colab» y «Abrir en MATLAB Online»)
   - `"contacto_email"` si quieres recibir correcciones.
7. Publica ese cambio (paso siguiente).

### Cada vez que agregues algo

- Con **GitHub Desktop**: escribe un resumen abajo a la izquierda → **Commit to main** → **Push origin**.
- O doble clic en **`PUBLICAR_CAMBIOS.bat`** (necesita Git: <https://git-scm.com/download/win>; GitHub Desktop ya lo trae, pero el `.bat` necesita la versión de consola).

Los cambios aparecen en internet en 1–2 minutos.

---

## 5. Dominio propio (opcional)

Para tener `e-reactor.mx` o `e-reactor.com` en lugar de `usuario.github.io/e-reactor`:

1. Compra el dominio en un registrador (Namecheap, Cloudflare, GoDaddy, Neubox, Akky…). Un `.com` suele costar ~10–15 USD/año; un `.mx` cuesta bastante más.
2. En el panel DNS del registrador crea:
   - 4 registros **A** para el dominio raíz (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 registro **CNAME** para `www` → `TU-USUARIO.github.io`
3. En GitHub → **Settings → Pages → Custom domain** escribe tu dominio y guarda. Cuando aparezca, activa **Enforce HTTPS** (puede tardar hasta 24 h).
4. Cambia `url_base` en `datos/config.json` a `https://tu-dominio` y publica.

Guía oficial: <https://docs.github.com/es/pages/configuring-a-custom-domain-for-your-github-pages-site>

---

## 6. Mantener los módulos de la app al día

La app Android es la fuente de los módulos HTML. Cuando mejores uno en `e-reactor-android/app/src/main/assets/web/`, doble clic en **`SINCRONIZAR_APP.bat`**: copia la versión nueva a `modulos/`, ajusta el botón «← Inicio» para la web y te avisa si hay módulos nuevos que aún no tienen ficha.

---

## 7. Límites y buenas prácticas

- **Videos → YouTube.** GitHub no acepta archivos de más de 100 MB y el sitio completo debe pesar menos de 1 GB. Sube tus animaciones de Manim a YouTube y agrega el recurso con el enlace.
- **Ancho de banda:** GitHub Pages tiene un límite suave de 100 GB al mes; sobra para empezar.
- **Python en el navegador** se descarga la primera vez que alguien pulsa «Ejecutar aquí» (unos 25 MB si usa numpy y matplotlib) y luego queda en la caché del navegador. `input()` no funciona bien ahí; usa variables al inicio del script.
- **Licencia:** por defecto el sitio dice *CC BY-NC-SA 4.0* (uso libre no comercial, con crédito). Cámbiala en `config.json` y en `acerca.html` si prefieres otra.
- **Datos de terceros:** las bases de datos de propiedades de los módulos provienen de compilaciones publicadas. Publicarlas en un sitio abierto expone más que dentro de una app; revisa los términos de uso de cada fuente y cítalas en cada módulo.
- **Respaldo:** GitHub guarda el historial de cada cambio; si algo se rompe puedes volver a una versión anterior desde GitHub Desktop (*History*).

---

## 8. Ideas para las siguientes versiones

- Estadísticas de visitas respetuosas de la privacidad (p. ej., GoatCounter, gratis para sitios no comerciales).
- Registrar el sitio en Google Search Console y enviar `sitemap.xml` (se genera solo cuando llenas `url_base`).
- Preguntas de autoevaluación (*ConcepTests*) al final de cada recurso.
- Rutas de estudio: «Termodinámica en 10 pasos», ordenando recursos existentes.
- Página por docente invitado para que otros profesores de Latinoamérica compartan material.
