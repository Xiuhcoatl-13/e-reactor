/* ==========================================================
   e-Reactor · lógica del sitio
   Lee el catálogo generado (datos/catalogo.js) y arma cada página.
   No necesitas editar este archivo para agregar contenido:
   usa AGREGAR_RECURSO.bat o edita las fichas en /recursos.
   ========================================================== */
(function () {
  'use strict';

  var D = window.EREACTOR || { config: {}, materias: [], recursos: [] };
  var CFG = D.config || {};
  var MATERIAS = D.materias || [];
  var RECURSOS = D.recursos || [];

  // Bibliotecas: las ligeras viven en assets/vendor (funcionan sin internet);
  // Pyodide (Python en el navegador) y SheetJS (Excel) se cargan de su CDN oficial.
  var CDN = {
    hljs: 'assets/vendor/highlight/highlight.min.js',
    hljsMatlab: 'assets/vendor/highlight/matlab.min.js',
    marked: 'assets/vendor/marked/marked.min.js',
    katexCss: 'assets/vendor/katex/katex.min.css',
    katex: 'assets/vendor/katex/katex.min.js',
    katexAuto: 'assets/vendor/katex/contrib/auto-render.min.js',
    xlsx: 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
    pyodide: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
  };

  /* ---------------- utilidades ---------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function param(n) { return new URLSearchParams(location.search).get(n) || ''; }
  function peso(b) {
    if (!b && b !== 0) return '';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }
  function fechaLarga(f) {
    if (!f) return '';
    var p = String(f).split('-');
    var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    if (p.length < 3) return f;
    return parseInt(p[2], 10) + ' de ' + meses[parseInt(p[1], 10) - 1] + ' de ' + p[0];
  }
  var cargados = {};
  function cargarScript(url) {
    if (!cargados[url]) {
      cargados[url] = new Promise(function (ok, mal) {
        var s = document.createElement('script');
        s.src = url; s.async = true;
        s.onload = ok; s.onerror = function () { mal(new Error('No se pudo cargar ' + url)); };
        document.head.appendChild(s);
      });
    }
    return cargados[url];
  }
  function cargarCSS(url) {
    if (document.querySelector('link[href="' + url + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = url; document.head.appendChild(l);
  }
  function toast(msg) {
    var t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2200);
  }
  function copiar(texto, msg) {
    var hecho = function () { toast(msg || 'Copiado'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(hecho, function () { copiarViejo(texto); hecho(); });
    } else { copiarViejo(texto); hecho(); }
  }
  function copiarViejo(texto) {
    var ta = document.createElement('textarea'); ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
  }
  function servidoPorHttp() { return location.protocol === 'http:' || location.protocol === 'https:'; }

  /* ---------------- íconos ---------------- */
  var P = {
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    simulacion: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5.5 3.5-5.5 3.5z"/>',
    calculadora: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01M16 18h.01"/>',
    codigo: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    notebook: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>',
    excel: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M4 15h16M10 4v16"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
    pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    descargar: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',
    externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    expandir: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    copiar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    compartir: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
    ejecutar: '<path d="M7 4.5v15l12-7.5z"/>',
    editar: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    restaurar: '<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/>',
    flecha: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    filtros: '<path d="M4 6h9m4 0h3M4 12h3m4 0h9M4 18h11m4 0h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'
  };
  function ico(n, t) {
    t = t || 18;
    return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || '') + '</svg>';
  }

  /* ---------------- tipos y niveles ---------------- */
  var TIPOS = {
    simulacion: { nombre: 'Simulación interactiva', plural: 'Simulaciones interactivas', ico: 'simulacion', sigla: 'Sim' },
    calculadora: { nombre: 'Calculadora', plural: 'Calculadoras y bases de datos', ico: 'calculadora', sigla: 'Calc' },
    python: { nombre: 'Código Python', plural: 'Código en Python', ico: 'codigo', sigla: 'Py' },
    notebook: { nombre: 'Notebook de Jupyter', plural: 'Notebooks de Jupyter', ico: 'notebook', sigla: 'Nb' },
    matlab: { nombre: 'Código MATLAB', plural: 'Código en MATLAB', ico: 'codigo', sigla: '.m' },
    excel: { nombre: 'Hoja de Excel', plural: 'Hojas de Excel', ico: 'excel', sigla: 'XLS' },
    video: { nombre: 'Video / animación', plural: 'Videos y animaciones', ico: 'video', sigla: '▶' },
    pdf: { nombre: 'Apuntes (PDF)', plural: 'Apuntes en PDF', ico: 'pdf', sigla: 'PDF' },
    archivo: { nombre: 'Archivo descargable', plural: 'Otros archivos', ico: 'descargar', sigla: '↓' }
  };
  var ORDEN_TIPOS = ['simulacion', 'calculadora', 'python', 'notebook', 'matlab', 'excel', 'video', 'pdf', 'archivo'];
  var NIVELES = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };

  function materia(id) { for (var i = 0; i < MATERIAS.length; i++) if (MATERIAS[i].id === id) return MATERIAS[i]; return null; }
  function recurso(id) { for (var i = 0; i < RECURSOS.length; i++) if (RECURSOS[i].id === id) return RECURSOS[i]; return null; }
  function enMateria(r, idm) {
    if (r.materia === idm) return true;
    return (r.tambien_en || []).some(function (u) { return u.materia === idm; });
  }
  function temaEn(r, idm) {
    if (r.materia === idm) return r.tema;
    var u = (r.tambien_en || []).filter(function (x) { return x.materia === idm; })[0];
    return u ? u.tema : '';
  }
  function recursosDe(idm) { return RECURSOS.filter(function (r) { return enMateria(r, idm); }); }
  function urlRecurso(r) { return 'recurso.html?id=' + encodeURIComponent(r.id); }
  function urlMateria(m) { return 'materia.html?id=' + encodeURIComponent(m.id); }
  function anclaTema(t) { return 'tema-' + norm(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function chipTipo(t) { var x = TIPOS[t] || TIPOS.archivo; return '<span class="chip">' + ico(x.ico, 12) + esc(x.nombre) + '</span>'; }
  // El nivel va en neutro (el color es solo de la materia): una escala de 1 a 3 puntos más el nombre
  function chipNivel(n) {
    var paso = { basico: 1, intermedio: 2, avanzado: 3 }[n];
    return paso ? '<span class="chip chip-nivel" data-nivel="' + paso + '"><span class="nivel-puntos" aria-hidden="true"><i></i><i></i><i></i></span>' + NIVELES[n] + '</span>' : '';
  }

  // «actual»: la materia de la página donde se muestra la tarjeta; su nombre no se repite en cada tarjeta
  function tarjetaRecurso(r, actual) {
    var m = materia(r.materia) || { nombre: '', color: 'azul' };
    var sig = r.sigla || (TIPOS[r.tipo] || TIPOS.archivo).sigla;
    return '<a class="recurso-card c-' + esc(m.color) + '" href="' + urlRecurso(r) + '">' +
      '<div class="recurso-top"><div class="token">' + esc(sig) + '</div><div>' +
      (r.materia === actual ? '' : '<div class="recurso-materia">' + esc(m.nombre) + '</div>') + '<h3>' + esc(r.titulo) + '</h3></div></div>' +
      '<p>' + esc(r.descripcion) + '</p>' +
      '<div class="recurso-chips">' + chipTipo(r.tipo) + chipNivel(r.nivel) + '</div></a>';
  }
  function tarjetaMateria(m) {
    var n = recursosDe(m.id).length;
    return '<a class="materia-card c-' + esc(m.color) + (n ? '' : ' vacia') + '" href="' + urlMateria(m) + '">' +
      '<div class="token">' + esc(m.sigla) + '</div><div><h3>' + esc(m.nombre) + '</h3><p>' + esc(m.descripcion) + '</p>' +
      '<div class="conteo">' + (n ? n + (n === 1 ? ' recurso' : ' recursos') : 'Próximamente') + '</div></div></a>';
  }
  function grid(lista, actual) { return '<div class="grid-recursos">' + lista.map(function (r) { return tarjetaRecurso(r, actual); }).join('') + '</div>'; }

  /* ---------------- encabezado y pie ---------------- */
  function pintarCabecera(pag) {
    var h = $('#cabecera'); if (!h) return;
    var cur = function (p) { return pag === p ? ' aria-current="page"' : ''; };
    h.outerHTML =
      '<a class="saltar" href="#contenido">Saltar al contenido</a>' +
      '<header class="sitio-header"><div class="contenedor header-fila">' +
      '<a class="marca" href="index.html" aria-label="e-Reactor, inicio"><div class="mark">eR</div><div>' +
      '<div class="marca-nombre">' + esc(CFG.nombre || 'e-Reactor') + '</div><div class="marca-sub">Ingeniería química en español</div></div></a>' +
      '<nav class="nav" id="nav"><a href="index.html#materias"' + cur('materia') + '>Materias</a>' +
      '<a href="explorar.html"' + cur('explorar') + '>Explorar</a><a href="acerca.html"' + cur('acerca') + '>Acerca de</a></nav>' +
      '<form class="header-buscar" action="explorar.html" role="search">' + ico('buscar', 16) +
      '<label class="sr-only" for="q-header">Buscar</label><input id="q-header" name="q" type="search" placeholder="Buscar tema, ecuación…">' +
      '<button class="header-cancelar" type="button">Cancelar</button></form>' +
      '<button class="btn-lupa" type="button" aria-label="Buscar" aria-expanded="false" aria-controls="q-header">' + ico('buscar', 20) + '</button>' +
      '<button class="btn-menu" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">' + ico('menu', 20) + '</button>' +
      '</div></header>';
    // El enlace «Saltar al contenido» necesita que <main> pueda recibir el foco
    var main = $('#contenido');
    if (main && !main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');

    var b = $('.btn-menu'), nav = $('#nav');
    if (!b) return;
    function menu(abrir) { nav.classList.toggle('abierto', abrir); b.setAttribute('aria-expanded', abrir ? 'true' : 'false'); }
    b.addEventListener('click', function () { menu(!nav.classList.contains('abierto')); });
    // El menú de celular se cierra con Esc, al tocar fuera de él o al elegir un enlace
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('abierto')) { menu(false); b.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('abierto') && !nav.contains(e.target) && !b.contains(e.target)) menu(false);
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });

    // Lupa del celular y la tableta: abre el buscador del encabezado (oculto en esas pantallas)
    var lupa = $('.btn-lupa'), cab = $('.sitio-header'), qh = $('#q-header');
    function busqueda(abrir) {
      cab.classList.toggle('buscando', abrir); lupa.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      if (abrir) { menu(false); qh.focus(); } else lupa.focus();
    }
    lupa.addEventListener('click', function () {
      // La portada y Explorar ya tienen su propio buscador: se usa ese en vez de abrir un segundo
      var propio = $('#q-hero') || $('#f-q');
      if (propio) { propio.scrollIntoView({ block: 'center' }); propio.focus({ preventScroll: true }); return; }
      busqueda(true);
    });
    $('.header-cancelar').addEventListener('click', function () { busqueda(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && cab.classList.contains('buscando')) busqueda(false);
    });
  }
  function pintarPie() {
    var f = $('#pie'); if (!f) return;
    var conContenido = MATERIAS.filter(function (m) { return recursosDe(m.id).length; }).slice(0, 5);
    var redes = CFG.redes || {};
    var enlaces = [['explorar.html', 'Explorar recursos'], ['acerca.html', 'Acerca de e-Reactor']];
    if (CFG.contacto_email) enlaces.push(['mailto:' + CFG.contacto_email, 'Contacto']);
    if (CFG.app_android_url) enlaces.push([CFG.app_android_url, 'App para Android']);
    [['youtube', 'YouTube'], ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok']].forEach(function (x) {
      if (redes[x[0]]) enlaces.push([redes[x[0]], x[1]]);
    });
    var lic = CFG.licencia ? (CFG.licencia_url ? '<a href="' + esc(CFG.licencia_url) + '" rel="license">' + esc(CFG.licencia) + '</a>' : esc(CFG.licencia)) : '';
    f.outerHTML =
      '<footer class="sitio-footer"><div class="contenedor"><div class="footer-grid">' +
      '<div><a class="marca" href="index.html"><div class="mark">eR</div><div class="marca-nombre">' + esc(CFG.nombre || 'e-Reactor') + '</div></a>' +
      '<p>' + esc(CFG.lema || '') + '.</p></div>' +
      '<div><h3>Materias</h3><ul>' + conContenido.map(function (m) { return '<li><a href="' + urlMateria(m) + '">' + esc(m.nombre) + '</a></li>'; }).join('') +
      '<li><a href="index.html#materias">Todas las materias</a></li></ul></div>' +
      '<div><h3>e-Reactor</h3><ul>' + enlaces.map(function (e) { return '<li><a href="' + esc(e[0]) + '">' + esc(e[1]) + '</a></li>'; }).join('') + '</ul></div>' +
      '</div><div class="footer-legal"><span>© ' + new Date().getFullYear() + ' ' + esc(CFG.nombre || 'e-Reactor') +
      (lic ? ' · Contenido bajo licencia ' + lic : '') + '</span><span>Hecho en Latinoamérica, en español.</span></div></div></footer>';
  }

  /* ================= PÁGINAS ================= */

  function paginaInicio() {
    var main = $('#contenido');
    var materiasCon = MATERIAS.filter(function (m) { return recursosDe(m.id).length; });
    var proximas = MATERIAS.filter(function (m) { return materiasCon.indexOf(m) < 0; });
    var destacados = RECURSOS.filter(function (r) { return r.destacado; }).slice(0, 6);
    // «Agregados recientemente» solo dice algo cuando los recursos tienen fechas distintas
    var fechas = {};
    RECURSOS.forEach(function (r) { if (r.fecha) fechas[r.fecha] = 1; });
    var recientes = Object.keys(fechas).length < 2 ? [] : RECURSOS.filter(function (r) { return destacados.indexOf(r) < 0; })
      .sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); }).slice(0, 6);

    main.innerHTML =
      '<section class="hero"><div class="contenedor hero-rejilla"><div>' +
      '<h1>' + esc(CFG.lema || 'Ingeniería química clara, interactiva y gratuita') + '.</h1>' +
      '<p class="hero-copy">' + esc(CFG.descripcion || '') + '</p>' +
      '<form class="buscador-grande" action="explorar.html" role="search">' + ico('buscar', 20) +
      '<label class="sr-only" for="q-hero">Buscar recursos</label>' +
      '<input id="q-hero" name="q" type="search" placeholder="Busca: CSTR, Biot, equilibrio…">' +
      '<button class="btn btn-primario" type="submit">Buscar</button></form></div>' +
      demoLevenspiel() + '</div></section>' +

      '<div class="contenedor">' +
      '<section class="seccion" id="materias"><div class="seccion-cab"><h2>Elige tu materia</h2>' +
      '<a href="explorar.html">Ver todo ' + ico('flecha', 14) + '</a></div>' +
      '<div class="grid-materias">' + materiasCon.map(tarjetaMateria).join('') + '</div>' +
      (proximas.length ? '<p class="proximamente"><b>Próximamente:</b> ' + proximas.map(function (m) { return esc(m.nombre); }).join(' · ') + '.</p>' : '') +
      '</section>' +

      (destacados.length ? '<section class="seccion"><div class="seccion-cab"><h2>Recursos destacados</h2></div>' + grid(destacados) + '</section>' : '') +

      (recientes.length ? '<section class="seccion"><div class="seccion-cab"><h2>Agregados recientemente</h2>' +
        '<a href="explorar.html">Explorar ' + ico('flecha', 14) + '</a></div>' + grid(recientes) + '</section>' : '') +

      '<section class="mision"><div>' +
      '<h2>Educación de calidad, clara y accesible para todo el que quiera aprender.</h2>' +
      '<p>e-Reactor nace de la falta de material en español que explique la ingeniería química con claridad. Todo es gratuito y pensado para el aula y el estudio independiente.</p></div>' +
      '<ul class="mision-puntos">' +
      '<li><b>Interactivo</b><span>Mueve parámetros y observa cómo responde el sistema, en el celular o en la computadora.</span></li>' +
      '<li><b>Código abierto</b><span>Descarga el Python, MATLAB o Excel detrás de cada ejemplo y modifícalo.</span></li>' +
      '<li><b>Para docentes</b><span>Proyecta las simulaciones en clase y compártelas con un enlace.</span></li>' +
      '</ul></section>' +
      (CFG.app_android_url ? '<section class="seccion" style="text-align:center"><a class="btn btn-primario" href="' + esc(CFG.app_android_url) + '">Descarga la app para Android</a></section>' : '') +
      '</div>';
    activarLevenspiel($('#demo-lv'));
  }

  /* ---- Gráfica de Levenspiel interactiva (portada) ---- */
  // Mismo modelo que el recurso «CSTR vs. PFR»: A → productos, −rA = k·CA0^n·(1 − X)^n
  var LV = { k: 0.5, CA0: 2, v0: 10 };
  function demoLevenspiel() {
    var r = recurso('cstr-vs-pfr-levenspiel');
    var ordenes = [0, 1, 2].map(function (n) {
      return '<label><input type="radio" name="lv-n" value="' + n + '"' + (n === 2 ? ' checked' : '') + '><span>' + n + '</span></label>';
    }).join('');
    return '<figure class="demo" id="demo-lv">' +
      '<h2>Gráfica de Levenspiel</h2>' +
      '<p class="demo-bajada">El volumen de un reactor es un área: el <b class="t-cstr">rectángulo</b> para el CSTR y el <b class="t-pfr">área bajo la curva</b> para el PFR. Mueve la conversión.</p>' +
      '<svg class="demo-grafica" role="img"></svg>' +
      '<div class="demo-controles">' +
      '<div class="demo-campo"><label for="lv-x">Conversión, <i>X</i> = <output id="lv-xv" for="lv-x"></output></label>' +
      '<input id="lv-x" type="range" min="0.05" max="0.9" step="0.01" value="0.8"></div>' +
      '<fieldset class="demo-orden"><legend>Orden, <i>n</i></legend><div class="segmentado">' + ordenes + '</div></fieldset></div>' +
      '<div class="demo-lecturas"><div class="lectura l-cstr"><span>Volumen CSTR</span><b id="lv-vc"></b></div>' +
      '<div class="lectura l-pfr"><span>Volumen PFR</span><b id="lv-vp"></b></div></div>' +
      '<p class="demo-conclusion" id="lv-concl"></p>' +
      '<figcaption class="demo-nota">A → productos, −<i>r</i><sub>A</sub> = <i>k C</i><sub>A</sub><sup><i>n</i></sup>, <i>k</i> = 0.5, ' +
      '<i>C</i><sub>A0</sub> = 2 mol/L, <i>v</i><sub>0</sub> = 10 L/min.' +
      (r ? ' <a href="' + urlRecurso(r) + '">Ver el cálculo en Python ' + ico('flecha', 13) + '</a>' : '') + '</figcaption>' +
      '</figure>';
  }
  function escalaBonita(v) {
    var p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10));
    var pasos = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < pasos.length; i++) if (pasos[i] * p >= v) return pasos[i] * p;
    return 10 * p;
  }
  function litros(v) { return v.toLocaleString('es-MX', { maximumFractionDigits: v < 10 ? 1 : 0 }) + ' L'; }
  function activarLevenspiel(fig) {
    if (!fig) return;
    var svg = fig.querySelector('svg'), rango = $('#lv-x');
    function orden() { var s = fig.querySelector('input[name="lv-n"]:checked'); return s ? +s.value : 2; }
    function dibujar() {
      var X = +rango.value, n = orden();
      var c = LV.v0 * LV.CA0 / (LV.k * Math.pow(LV.CA0, n));   // FA0 / (k·CA0^n), en L
      var f = function (x) { return c / Math.pow(1 - x, n); };   // FA0 / (−rA)
      var vC = X * f(X);
      var vP = n === 0 ? c * X : n === 1 ? -c * Math.log(1 - X) : c * X / (1 - X);

      var W = svg.clientWidth || 320, H = Math.round(Math.max(190, Math.min(250, W * 0.56)));
      var m = { l: 44, r: 10, t: 24, b: 34 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
      var ymax = escalaBonita(f(X) * 1.18);
      var sx = function (x) { return (m.l + x * pw).toFixed(1); };
      var sy = function (y) { return (m.t + ph - Math.min(y, ymax * 3) / ymax * ph).toFixed(1); };

      var curva = '', area = 'M' + sx(0) + ' ' + sy(0);
      for (var i = 0; i <= 120; i++) {
        var x = 0.97 * i / 120;
        curva += (i ? 'L' : 'M') + sx(x) + ' ' + sy(f(x));
        if (x <= X) area += 'L' + sx(x) + ' ' + sy(f(x));
      }
      area += 'L' + sx(X) + ' ' + sy(f(X)) + 'L' + sx(X) + ' ' + sy(0) + 'Z';

      var g = '<defs><clipPath id="lv-clip"><rect x="' + m.l + '" y="' + m.t + '" width="' + pw + '" height="' + ph + '"/></clipPath></defs>';
      [0, ymax / 2, ymax].forEach(function (y) {
        g += '<line class="lv-rejilla" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + sy(y) + '" y2="' + sy(y) + '"/>' +
          '<text class="lv-texto" x="' + (m.l - 6) + '" y="' + sy(y) + '" dy="4" text-anchor="end">' + y.toLocaleString('es-MX') + '</text>';
      });
      [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function (x) {
        g += '<text class="lv-texto" x="' + sx(x) + '" y="' + (H - m.b + 16) + '" text-anchor="middle">' + x.toFixed(1) + '</text>';
      });
      g += '<g clip-path="url(#lv-clip)">' +
        '<rect class="lv-cstr" x="' + sx(0) + '" y="' + sy(f(X)) + '" width="' + (X * pw).toFixed(1) + '" height="' + (sy(0) - sy(f(X))).toFixed(1) + '"/>' +
        '<path class="lv-pfr" d="' + area + '"/><path class="lv-curva" d="' + curva + '"/></g>' +
        '<line class="lv-eje" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + sy(0) + '" y2="' + sy(0) + '"/>' +
        '<circle class="lv-punto" cx="' + sx(X) + '" cy="' + sy(f(X)) + '" r="5"/>' +
        '<text class="lv-texto lv-titulo" x="' + m.l + '" y="14">F<tspan dy="3" font-size="9">A0</tspan><tspan dy="-3"> / (−r</tspan><tspan dy="3" font-size="9">A</tspan><tspan dy="-3">), L</tspan></text>' +
        '<text class="lv-texto lv-titulo" x="' + (W - m.r) + '" y="' + (H - 2) + '" text-anchor="end">Conversión, X</text>';
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('height', H);
      svg.innerHTML = g;

      var xs = X.toFixed(2);
      $('#lv-xv').textContent = xs;
      $('#lv-vc').textContent = litros(vC);
      $('#lv-vp').textContent = litros(vP);
      var razon = vC / vP;
      $('#lv-concl').textContent = n === 0
        ? 'Con orden 0 la rapidez no depende de la conversión: los dos reactores necesitan el mismo volumen.'
        : razon < 1.05 ? 'Con esta conversión, los dos reactores necesitan casi el mismo volumen.'
        : 'El CSTR necesita ' + razon.toLocaleString('es-MX', { maximumFractionDigits: 1 }) + ' veces el volumen del PFR.';
      var resumen = 'X = ' + xs + ', orden ' + n + ': CSTR ' + litros(vC) + ', PFR ' + litros(vP);
      rango.setAttribute('aria-valuetext', resumen);
      svg.setAttribute('aria-label', 'Gráfica de Levenspiel. ' + resumen + '.');
    }
    var pendiente = false;
    function pedirDibujo() {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(function () { pendiente = false; dibujar(); });
    }
    rango.addEventListener('input', pedirDibujo);
    fig.addEventListener('change', pedirDibujo);
    window.addEventListener('resize', pedirDibujo);
    dibujar();
  }

  function paginaExplorar() {
    var main = $('#contenido');
    var opMat = MATERIAS.filter(function (m) { return recursosDe(m.id).length; })
      .map(function (m) { return '<option value="' + esc(m.id) + '">' + esc(m.nombre) + '</option>'; }).join('');
    var tiposPresentes = ORDEN_TIPOS.filter(function (t) { return RECURSOS.some(function (r) { return r.tipo === t; }); });
    var opTipo = tiposPresentes.map(function (t) { return '<option value="' + t + '">' + esc(TIPOS[t].plural) + '</option>'; }).join('');
    main.innerHTML =
      '<div class="contenedor"><section class="pagina-cab"><div class="migas"><a href="index.html">Inicio</a><span class="sep">/</span><span>Explorar</span></div>' +
      '<h1>Explorar recursos</h1><p class="bajada">Busca por tema, ecuación o palabra clave y filtra por materia, tipo de recurso o nivel.</p></section>' +
      '<form class="filtros" id="filtros" onsubmit="return false">' +
      '<div class="campo"><label for="f-q">Buscar</label><input class="entrada" id="f-q" type="search" placeholder="Ej.: Levenspiel, Biot, Peng-Robinson…" autocomplete="off"></div>' +
      // En celular, materia, tipo y nivel se pliegan detrás de este botón; en pantallas grandes no se ve
      '<button class="btn filtros-boton" type="button" id="f-boton" aria-expanded="false" aria-controls="f-mas">' + ico('filtros', 16) + 'Filtros<span class="cuenta" id="f-cuenta" hidden></span></button>' +
      '<div class="filtros-mas" id="f-mas">' +
      '<div class="campo"><label for="f-materia">Materia</label><select class="selector" id="f-materia"><option value="">Todas</option>' + opMat + '</select></div>' +
      '<div class="campo"><label for="f-tipo">Tipo</label><select class="selector" id="f-tipo"><option value="">Todos</option>' + opTipo + '</select></div>' +
      '<div class="campo"><label for="f-nivel">Nivel</label><select class="selector" id="f-nivel"><option value="">Todos</option>' +
      '<option value="basico">Básico</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select></div>' +
      '<button class="btn" type="button" id="f-limpiar">Limpiar</button></div></form>' +
      '<div class="resumen-resultados" id="resumen" aria-live="polite"></div><div id="resultados"></div></div>';

    var q = $('#f-q'), fm = $('#f-materia'), ft = $('#f-tipo'), fn = $('#f-nivel');
    q.value = param('q'); fm.value = param('materia'); ft.value = param('tipo'); fn.value = param('nivel');

    function puntuar(r, palabras) {
      if (!palabras.length) return 1;
      var m = materia(r.materia) || {};
      var tit = norm(r.titulo), etq = norm((r.etiquetas || []).join(' ')), resto = norm([r.descripcion, r.tema, m.nombre, (r.objetivos || []).join(' '), TIPOS[r.tipo] ? TIPOS[r.tipo].nombre : ''].join(' '));
      var s = 0;
      for (var i = 0; i < palabras.length; i++) {
        var w = palabras[i], ok = false;
        if (tit.indexOf(w) >= 0) { s += 3; ok = true; }
        if (etq.indexOf(w) >= 0) { s += 2; ok = true; }
        if (resto.indexOf(w) >= 0) { s += 1; ok = true; }
        if (!ok) return 0;
      }
      return s;
    }
    function aplicar() {
      var palabras = norm(q.value).split(/\s+/).filter(Boolean);
      var lista = RECURSOS.map(function (r) { return { r: r, s: puntuar(r, palabras) }; }).filter(function (x) {
        return x.s > 0 && (!fm.value || enMateria(x.r, fm.value)) && (!ft.value || x.r.tipo === ft.value) && (!fn.value || x.r.nivel === fn.value);
      });
      if (palabras.length) lista.sort(function (a, b) { return b.s - a.s; });
      else lista.sort(function (a, b) {
        var ia = MATERIAS.indexOf(materia(a.r.materia)), ib = MATERIAS.indexOf(materia(b.r.materia));
        return ia - ib || a.r.titulo.localeCompare(b.r.titulo, 'es');
      });
      // Los filtros activos se nombran en el resumen, para verlos aunque el panel esté plegado
      var activos = [fm, ft, fn].filter(function (s) { return s.value; });
      var cuenta = $('#f-cuenta');
      cuenta.textContent = activos.length; cuenta.hidden = !activos.length;
      $('#f-boton').setAttribute('aria-label', 'Filtros' + (activos.length ? ', ' + activos.length + (activos.length === 1 ? ' activo' : ' activos') : ''));
      var uno = lista.length === 1;
      $('#resumen').textContent = lista.length + (uno ? ' recurso' : ' recursos') + (palabras.length || activos.length ? (uno ? ' encontrado' : ' encontrados') : ' en total') +
        activos.map(function (s) { return ' · ' + s.options[s.selectedIndex].text; }).join('');
      $('#resultados').innerHTML = lista.length ? grid(lista.map(function (x) { return x.r; })) :
        '<div class="vacio"><b>No encontramos recursos con esos filtros.</b>Prueba con otra palabra o quita algún filtro.' +
        '<div class="acciones" style="justify-content:center"><button class="btn" type="button" data-accion="quitar-filtros">Quitar filtros</button></div></div>';
      var u = new URLSearchParams();
      if (q.value) u.set('q', q.value); if (fm.value) u.set('materia', fm.value); if (ft.value) u.set('tipo', ft.value); if (fn.value) u.set('nivel', fn.value);
      history.replaceState(null, '', 'explorar.html' + (u.toString() ? '?' + u.toString() : ''));
    }
    var h; q.addEventListener('input', function () { clearTimeout(h); h = setTimeout(aplicar, 120); });
    [fm, ft, fn].forEach(function (s) { s.addEventListener('change', aplicar); });
    function limpiar() { q.value = ''; fm.value = ''; ft.value = ''; fn.value = ''; aplicar(); q.focus(); }
    $('#f-limpiar').addEventListener('click', limpiar);
    $('#resultados').addEventListener('click', function (e) { if (e.target.closest('[data-accion="quitar-filtros"]')) limpiar(); });
    $('#f-boton').addEventListener('click', function () {
      var abierto = $('#filtros').classList.toggle('abierto');
      this.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
    aplicar();
  }

  function paginaMateria() {
    var main = $('#contenido');
    var m = materia(param('id'));
    if (!m) { noEncontrado(main, 'No encontramos esa materia.'); return; }
    document.title = m.nombre + ' · ' + (CFG.nombre || 'e-Reactor');
    var lista = recursosDe(m.id);
    var temas = (m.temas || []).slice();
    lista.forEach(function (r) {
      var t = temaEn(r, m.id);
      if (t && !temas.some(function (x) { return norm(x) === norm(t); })) temas.push(t);
    });
    var sinTema = lista.filter(function (r) { return !temaEn(r, m.id); });
    function deTema(t) { return lista.filter(function (r) { return norm(temaEn(r, m.id)) === norm(t); }); }
    // Los temas sin recursos no ocupan una sección cada uno: se nombran juntos al final
    var conRecursos = temas.filter(function (t) { return deTema(t).length; });
    var vacios = temas.filter(function (t) { return !deTema(t).length; });
    var nombres = vacios.map(esc).join(' · ');
    var indice = conRecursos.map(function (t) {
      return '<a href="#' + anclaTema(t) + '">' + esc(t) + '<span>' + deTema(t).length + '</span></a>';
    }).join('');
    var cuerpo = conRecursos.map(function (t) {
      var rs = deTema(t);
      return '<section class="tema" id="' + anclaTema(t) + '"><h2>' + esc(t) + ' <small>' + rs.length + (rs.length === 1 ? ' recurso' : ' recursos') + '</small></h2>' +
        grid(rs, m.id) + '</section>';
    }).join('') + (sinTema.length ? '<section class="tema"><h2>Otros recursos</h2>' + grid(sinTema, m.id) + '</section>' : '') +
      (!vacios.length ? '' : lista.length ? '<p class="proximamente tema-proximos"><b>Próximamente:</b> ' + nombres + '.</p>'
        : '<div class="tema-vacio tema-proximos"><b>Próximamente.</b> Estamos preparando material para esta materia. Temas previstos: ' + nombres + '.' +
          '<div class="acciones"><a class="btn" href="explorar.html">Explorar los recursos disponibles ' + ico('flecha', 14) + '</a></div></div>');

    main.innerHTML =
      '<div class="contenedor c-' + esc(m.color) + '"><section class="pagina-cab"><div class="migas"><a href="index.html">Inicio</a><span class="sep">/</span>' +
      '<a href="index.html#materias">Materias</a><span class="sep">/</span><span>' + esc(m.nombre) + '</span></div>' +
      '<div class="cab-materia"><div class="token grande">' + esc(m.sigla) + '</div><div><h1>' + esc(m.nombre) + '</h1>' +
      '<p class="bajada">' + esc(m.descripcion) + '</p></div></div>' +
      (conRecursos.length > 1 ? '<nav class="indice-temas" aria-label="Temas">' + indice + '</nav>' : '') + '</section>' + cuerpo + '</div>';
  }

  function noEncontrado(main, msg) {
    main.innerHTML = '<div class="contenedor"><section class="pagina-cab"><h1>Página no encontrada</h1><p class="bajada">' + esc(msg) +
      '</p><div class="acciones"><a class="btn btn-primario" href="index.html">Ir al inicio</a><a class="btn" href="explorar.html">Explorar recursos</a></div></section></div>';
  }

  /* ---------------- página de recurso ---------------- */
  function paginaRecurso() {
    var main = $('#contenido');
    var r = recurso(param('id'));
    if (!r) { noEncontrado(main, 'No encontramos ese recurso. Puede que haya cambiado de nombre.'); return; }
    var m = materia(r.materia) || { id: '', nombre: '', color: 'azul' };
    var titulo = r.titulo + ' · ' + (CFG.nombre || 'e-Reactor');
    document.title = titulo;
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', r.descripcion || '');

    var repo = CFG.github_repo, rama = CFG.github_rama || 'main';
    var extra = '';
    if (repo && r.tipo === 'notebook' && r.archivo) extra += '<a class="btn" target="_blank" rel="noopener" href="https://colab.research.google.com/github/' + esc(repo) + '/blob/' + esc(rama) + '/' + esc(r.archivo) + '">' + ico('externo', 16) + 'Abrir en Google Colab</a>';
    if (repo && r.tipo === 'matlab' && r.archivo) extra += '<a class="btn" target="_blank" rel="noopener" href="https://matlab.mathworks.com/open/github/v1?repo=' + encodeURIComponent(repo) + '&file=' + encodeURIComponent(r.archivo) + '">' + ico('externo', 16) + 'Abrir en MATLAB Online</a>';

    var esHTML = r.tipo === 'simulacion' || r.tipo === 'calculadora';
    // En simulaciones y calculadoras, «Abrir en pestaña nueva» vive en la barra del visor
    var acciones =
      (!esHTML && r.archivo ? '<a class="btn btn-primario" href="' + esc(r.archivo) + '" download>' + ico('descargar', 16) + 'Descargar ' + esc((r.ext || '').toUpperCase()) + (r.bytes ? ' · ' + peso(r.bytes) : '') + '</a>' : '') +
      extra +
      '<button class="btn" type="button" id="btn-compartir">' + ico('compartir', 16) + 'Compartir</button>';

    var objetivos = (r.objetivos || []).length ? '<div class="tarjeta"><h2>Lo que aprenderás</h2><ul>' + r.objetivos.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></div>' : '';
    var adj = (r.adjuntos || []).length ? '<div class="tarjeta"><h2>Archivos del recurso</h2><ul class="lista-archivos">' + r.adjuntos.map(function (a) {
      return '<li><a href="' + esc(a.ruta) + '" download>' + ico('descargar', 16) + '<span>' + esc(a.titulo || a.nombre) + '</span><span class="peso">' + peso(a.bytes) + '</span></a></li>';
    }).join('') + '</ul></div>' : '';
    var url = (CFG.url_base ? CFG.url_base.replace(/\/$/, '') + '/' : location.href.split('?')[0].replace(/[^\/]*$/, '')) + urlRecurso(r);
    var anio = (r.fecha || '').slice(0, 4) || new Date().getFullYear();
    var cita = esc(r.autor || CFG.autor || '') + ' (' + anio + '). <i>' + esc(r.titulo) + '</i> [' + esc((TIPOS[r.tipo] || TIPOS.archivo).nombre) + ']. ' + esc(CFG.nombre || 'e-Reactor') + '. ' + esc(url);
    var tambien = (r.tambien_en || []).map(function (u) { var mm = materia(u.materia); return mm ? '<a href="' + urlMateria(mm) + (u.tema ? '#' + anclaTema(u.tema) : '') + '">' + esc(mm.nombre) + '</a>' : ''; }).filter(Boolean).join(', ');

    var relacionados = RECURSOS.filter(function (x) { return x.id !== r.id && enMateria(x, r.materia); })
      .sort(function (a, b) { return (temaEn(b, r.materia) === r.tema) - (temaEn(a, r.materia) === r.tema); }).slice(0, 3);

    main.innerHTML =
      '<div class="contenedor c-' + esc(m.color) + '"><section class="pagina-cab"><div class="migas"><a href="index.html">Inicio</a><span class="sep">/</span>' +
      (m.id ? '<a href="' + urlMateria(m) + '">' + esc(m.nombre) + '</a><span class="sep">/</span>' : '') +
      (r.tema ? '<a href="' + urlMateria(m) + '#' + anclaTema(r.tema) + '">' + esc(r.tema) + '</a>' : '') + '</div>' +
      '<h1>' + esc(r.titulo) + '</h1><p class="bajada">' + esc(r.descripcion) + '</p>' +
      '<div class="recurso-fila"><div class="recurso-meta">' + chipTipo(r.tipo) + chipNivel(r.nivel) + '</div>' +
      '<div class="acciones">' + acciones + '</div></div></section>' +
      // Simulaciones y calculadoras miden como máximo 760 px: en pantallas anchas la columna lateral
      // (objetivos y detalles) va junto a la herramienta en vez de dejar espacio vacío
      '<div class="recurso-cuerpo' + (esHTML ? ' con-lateral' : '') + '">' +
      '<section class="escenario" id="escenario"><div class="cargando">Cargando…</div></section>' +
      '<aside class="recurso-lateral">' + objetivos +
      '<div class="tarjeta"><h2>Detalles</h2><table class="tabla-detalles"><tbody>' +
      (m.id ? '<tr><td>Materia</td><td><a href="' + urlMateria(m) + '">' + esc(m.nombre) + '</a></td></tr>' : '') +
      (r.tema ? '<tr><td>Tema</td><td>' + esc(r.tema) + '</td></tr>' : '') +
      (tambien ? '<tr><td>También en</td><td>' + tambien + '</td></tr>' : '') +
      '<tr><td>Tipo</td><td>' + esc((TIPOS[r.tipo] || TIPOS.archivo).nombre) + '</td></tr>' +
      (r.nivel ? '<tr><td>Nivel</td><td>' + esc(NIVELES[r.nivel] || r.nivel) + '</td></tr>' : '') +
      ((r.etiquetas || []).length ? '<tr><td>Palabras clave</td><td>' + esc(r.etiquetas.join(', ')) + '</td></tr>' : '') +
      ((r.autor || CFG.autor) ? '<tr><td>Autor</td><td>' + esc(r.autor || CFG.autor) + '</td></tr>' : '') +
      (r.fecha ? '<tr><td>Actualizado</td><td>' + esc(fechaLarga(r.fecha)) + '</td></tr>' : '') +
      (CFG.licencia ? '<tr><td>Licencia</td><td>' + (CFG.licencia_url ? '<a href="' + esc(CFG.licencia_url) + '" rel="license">' + esc(CFG.licencia) + '</a>' : esc(CFG.licencia)) + '</td></tr>' : '') +
      '</tbody></table></div>' +
      (CFG.contacto_email ? '<div class="tarjeta"><h2>¿Encontraste un error?</h2><p>Escríbenos a <a href="mailto:' + esc(CFG.contacto_email) + '?subject=' + encodeURIComponent('e-Reactor: ' + r.titulo) + '">' + esc(CFG.contacto_email) + '</a>. Toda corrección ayuda.</p></div>' : '') +
      '</aside>' +
      '<div class="recurso-extra">' + adj +
      '<div class="tarjeta"><h2>Cómo citar este recurso</h2><div class="cita" id="cita">' + cita + '</div>' +
      '<div class="acciones" style="margin-top:10px"><button class="btn" type="button" id="btn-cita">' + ico('copiar', 16) + 'Copiar cita</button></div></div>' +
      '</div></div>' +
      (relacionados.length ? '<section class="seccion"><div class="seccion-cab"><h2>Recursos relacionados</h2></div>' + grid(relacionados, r.materia) + '</section>' : '') +
      '</div>';

    $('#btn-cita').addEventListener('click', function () { copiar($('#cita').textContent, 'Cita copiada'); });
    $('#btn-compartir').addEventListener('click', function () {
      if (navigator.share) navigator.share({ title: r.titulo, text: r.descripcion, url: url }).catch(function () {});
      else copiar(url, 'Enlace copiado');
    });

    var esc_ = $('#escenario');
    var visores = { simulacion: verHTML, calculadora: verHTML, python: verCodigo, matlab: verCodigo, notebook: verNotebook, excel: verExcel, video: verVideo, pdf: verPDF };
    (visores[r.tipo] || verArchivo)(r, esc_);
  }

  function barra(titulo, botones) {
    return '<div class="escenario-barra"><span>' + titulo + '</span><div class="acciones-mini">' + (botones || '') + '</div></div>';
  }
  function botonPantalla() { return '<button class="btn" type="button" data-accion="pantalla">' + ico('expandir', 14) + 'Pantalla completa</button>'; }
  function activarPantalla(cont) {
    var b = cont.querySelector('[data-accion="pantalla"]');
    if (!b) return;
    if (!cont.requestFullscreen && !cont.webkitRequestFullscreen) { b.remove(); return; }
    b.addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else (cont.requestFullscreen || cont.webkitRequestFullscreen).call(cont);
    });
  }
  function avisoLocal() {
    return servidoPorHttp() ? '' : '<div class="aviso" style="margin:14px">Esta vista previa necesita que el sitio se abra desde un servidor. En tu computadora usa <b>VER_SITIO_LOCAL.bat</b>; en internet funciona automáticamente.</div>';
  }

  /* ---- HTML (simulaciones y calculadoras) ---- */
  function verHTML(r, cont) {
    var aparte = '<a class="btn" href="' + esc(r.archivo) + '" target="_blank" rel="noopener" aria-label="Abrir en pestaña nueva">' + ico('externo', 14) + 'Pestaña nueva</a>';
    cont.innerHTML = barra('<b>' + esc((TIPOS[r.tipo] || {}).nombre) + '</b><span class="barra-nota"> · interactúa directamente aquí</span>', aparte + botonPantalla()) +
      '<iframe class="marco-sim" src="' + esc(r.archivo) + '" title="' + esc(r.titulo) + '" allow="fullscreen; clipboard-write"' +
      (typeof r.altura === 'number' ? ' style="height:' + r.altura + 'px"' : '') + '></iframe>';
    activarPantalla(cont);
    var f = cont.querySelector('iframe');
    if (r.altura && r.altura !== 'auto') return;
    f.addEventListener('load', function () {
      try {
        var doc = f.contentDocument; if (!doc || !doc.body) return;
        var st = doc.createElement('style');
        st.textContent = 'html,body{min-height:0 !important}.back-link{display:none !important}';
        doc.head.appendChild(st);
        var ajustar = function () {
          if (document.fullscreenElement) return;
          var cs = f.contentWindow.getComputedStyle(doc.body);
          var h = Math.max(doc.documentElement.getBoundingClientRect().height,
            doc.body.scrollHeight + parseFloat(cs.marginTop || 0) + parseFloat(cs.marginBottom || 0));
          f.style.height = Math.max(320, Math.ceil(h) + 2) + 'px';
        };
        ajustar();
        var RO = f.contentWindow.ResizeObserver;
        if (RO) new RO(ajustar).observe(doc.body);
        setTimeout(ajustar, 400); setTimeout(ajustar, 1500);
      } catch (e) { /* sin acceso (file:// u otro dominio): se queda con altura fija */ }
    });
  }

  /* ---- Código (Python / MATLAB) ---- */
  var pyodideListo = null;
  function verCodigo(r, cont) {
    var esPy = r.tipo === 'python';
    var lang = esPy ? 'python' : 'matlab';
    if (r.ext === 'mlx') { verArchivo(r, cont, 'Los archivos .mlx (Live Script) se abren con MATLAB. Descárgalo para usarlo.'); return; }
    var botones = '<button class="btn" type="button" data-accion="copiar">' + ico('copiar', 14) + 'Copiar</button>' +
      (esPy ? '<button class="btn" type="button" data-accion="editar">' + ico('editar', 14) + 'Editar</button>' +
        '<button class="btn btn-primario" type="button" data-accion="ejecutar">' + ico('ejecutar', 14) + 'Ejecutar aquí</button>' : '') + botonPantalla();
    cont.innerHTML = barra('<b>' + esc(r.archivo.split('/').pop()) + '</b>', botones) + avisoLocal() +
      '<div class="codigo-caja" id="codigo"><div class="cargando">Cargando código…</div></div>' +
      (esPy ? '<div class="salida" id="salida" hidden><div class="salida-cab"><span>Salida</span><span id="salida-estado"></span></div><pre id="salida-texto"></pre><div class="salida-figs" id="salida-figs"></div></div>' : '');
    activarPantalla(cont);
    var original = '', editando = false;

    fetch(r.archivo).then(function (x) { if (!x.ok) throw new Error(x.status); return x.text(); }).then(function (txt) {
      original = txt; mostrar(txt);
    }).catch(function () {
      $('#codigo').innerHTML = '<div class="descarga-grande"><p>No se pudo mostrar el código aquí.</p><a class="btn btn-primario" href="' + esc(r.archivo) + '" download>' + ico('descargar', 16) + 'Descargar archivo</a></div>';
    });

    function mostrar(txt) {
      var caja = $('#codigo');
      caja.innerHTML = '<pre><code class="language-' + lang + '">' + esc(txt) + '</code></pre>';
      cargarScript(CDN.hljs).then(function () { return esPy ? null : cargarScript(CDN.hljsMatlab); }).then(function () {
        var c = caja.querySelector('code'); if (c && window.hljs) window.hljs.highlightElement(c);
      }).catch(function () {});
    }
    function textoActual() { var ta = $('#editor'); return ta ? ta.value : original; }

    cont.querySelector('[data-accion="copiar"]').addEventListener('click', function () { copiar(textoActual(), 'Código copiado'); });
    if (!esPy) return;

    var bEd = cont.querySelector('[data-accion="editar"]');
    bEd.addEventListener('click', function () {
      var caja = $('#codigo');
      if (!editando) {
        var actual = textoActual();
        caja.innerHTML = '<label class="sr-only" for="editor">Editor de código</label><textarea id="editor" class="editor" spellcheck="false"></textarea>';
        $('#editor').value = actual; editando = true;
        bEd.innerHTML = ico('restaurar', 14) + 'Restaurar original';
        toast('Modifica el código y presiona «Ejecutar aquí»');
      } else {
        editando = false; mostrar(original); bEd.innerHTML = ico('editar', 14) + 'Editar';
      }
    });
    var bRun = cont.querySelector('[data-accion="ejecutar"]');
    bRun.addEventListener('click', function () {
      var codigo = textoActual();
      var sal = $('#salida'), txt = $('#salida-texto'), figs = $('#salida-figs'), est = $('#salida-estado');
      sal.hidden = false; txt.textContent = ''; figs.innerHTML = ''; bRun.disabled = true;
      var salida = '';
      var escribir = function (s) { salida += s + '\n'; txt.textContent = salida; };
      est.textContent = pyodideListo ? 'Ejecutando…' : 'Preparando Python en tu navegador (solo la primera vez; puede tardar unos segundos)…';
      var t0 = 0;
      cargarScript(CDN.pyodide).then(function () {
        if (!pyodideListo) pyodideListo = window.loadPyodide();
        return pyodideListo;
      }).then(function (py) {
        py.setStdout({ batched: escribir }); py.setStderr({ batched: escribir });
        est.textContent = 'Cargando paquetes…';
        return py.loadPackagesFromImports(codigo).then(function () {
          return Promise.all((r.adjuntos || []).map(function (a) {
            return fetch(a.ruta).then(function (x) { return x.arrayBuffer(); }).then(function (b) { py.FS.writeFile(a.nombre, new Uint8Array(b)); }).catch(function () {});
          }));
        }).then(function () {
          var usaMpl = /matplotlib|pylab/.test(codigo);
          if (usaMpl) py.runPython("import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as _plt\n_plt.close('all')\n_plt.show = lambda *a, **k: None");
          est.textContent = 'Ejecutando…'; t0 = performance.now();
          var g = py.globals.get('dict')(); g.set('__name__', '__main__');
          return py.runPythonAsync(codigo, { globals: g }).then(function () {
            if (!usaMpl) return [];
            var lista = py.runPython("import io, base64\nimport matplotlib.pyplot as _plt\n_r=[]\nfor _n in _plt.get_fignums():\n    _b=io.BytesIO(); _plt.figure(_n).savefig(_b, format='png', dpi=110, bbox_inches='tight'); _r.append(base64.b64encode(_b.getvalue()).decode())\n_plt.close('all')\n_r");
            var js = lista.toJs(); lista.destroy(); return js;
          });
        });
      }).then(function (imgs) {
        (imgs || []).forEach(function (b64, i) {
          var im = new Image(); im.src = 'data:image/png;base64,' + b64; im.alt = 'Figura ' + (i + 1) + ' generada por ' + r.archivo.split('/').pop(); figs.appendChild(im);
        });
        if (!salida && !(imgs || []).length) txt.textContent = '(El programa terminó sin imprimir nada)';
        est.textContent = 'Listo en ' + ((performance.now() - t0) / 1000).toFixed(1) + ' s';
      }).catch(function (e) {
        var msg = String(e && e.message || e);
        var span = document.createElement('span'); span.className = 'error'; span.textContent = '\n' + msg;
        txt.appendChild(span); est.textContent = 'Error';
      }).then(function () { bRun.disabled = false; });
    });
  }

  /* ---- Notebook de Jupyter ---- */
  function mdConMate(src) {
    var bloques = [];
    src = src.replace(/\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$/g, function (m) { bloques.push(m); return '@@MATE' + (bloques.length - 1) + '@@'; });
    var html = window.marked ? window.marked.parse(src) : '<p>' + esc(src) + '</p>';
    return html.replace(/@@MATE(\d+)@@/g, function (_, i) { return esc(bloques[+i]); });
  }
  function verNotebook(r, cont) {
    cont.innerHTML = barra('<b>' + esc(r.archivo.split('/').pop()) + '</b> · vista de solo lectura', botonPantalla()) + avisoLocal() + '<div class="codigo-caja" id="nb" style="max-height:none"><div class="cargando">Cargando notebook…</div></div>';
    activarPantalla(cont);
    cargarCSS(CDN.katexCss);
    Promise.all([fetch(r.archivo).then(function (x) { if (!x.ok) throw new Error(x.status); return x.json(); }), cargarScript(CDN.marked), cargarScript(CDN.hljs)]).then(function (res) {
      var nb = res[0]; var celdas = nb.cells || [];
      var src = function (s) { return Array.isArray(s) ? s.join('') : (s || ''); };
      var nombre = r.archivo.split('/').pop(), nFig = 0;
      var html = celdas.map(function (c) {
        if (c.cell_type === 'markdown') return '<div class="nb-celda nb-md">' + mdConMate(src(c.source)) + '</div>';
        if (c.cell_type !== 'code') return '';
        var outs = (c.outputs || []).map(function (o) {
          if (o.output_type === 'stream') return '<pre>' + esc(src(o.text)) + '</pre>';
          if (o.output_type === 'error') return '<pre style="color:#b42318">' + esc((o.traceback || []).join('\n').replace(/\u001b\[[0-9;]*m/g, '')) + '</pre>';
          var d = o.data || {};
          if (d['image/png']) return '<img alt="Figura ' + (++nFig) + ' de ' + esc(nombre) + '" src="data:image/png;base64,' + src(d['image/png']).replace(/\s/g, '') + '">';
          if (d['text/html']) return '<div class="nb-md">' + src(d['text/html']) + '</div>';
          if (d['text/plain']) return '<pre>' + esc(src(d['text/plain'])) + '</pre>';
          return '';
        }).join('');
        return '<div class="nb-celda"><div class="nb-prompt">In [' + (c.execution_count || ' ') + ']:</div><div class="nb-code"><pre><code class="language-python">' + esc(src(c.source)) + '</code></pre></div>' +
          (outs ? '<div class="nb-out">' + outs + '</div>' : '') + '</div>';
      }).join('');
      var caja = $('#nb'); caja.innerHTML = '<div class="nb">' + html + '</div>';
      caja.querySelectorAll('code.language-python').forEach(function (c) { if (window.hljs) window.hljs.highlightElement(c); });
      return cargarScript(CDN.katex).then(function () { return cargarScript(CDN.katexAuto); }).then(function () {
        if (window.renderMathInElement) window.renderMathInElement(caja, {
          delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\[', right: '\\]', display: true }, { left: '$', right: '$', display: false }, { left: '\\(', right: '\\)', display: false }],
          throwOnError: false
        });
      });
    }).catch(function () {
      $('#nb').innerHTML = '<div class="descarga-grande"><p>No se pudo mostrar el notebook aquí.</p><a class="btn btn-primario" href="' + esc(r.archivo) + '" download>' + ico('descargar', 16) + 'Descargar .ipynb</a></div>';
    });
  }

  /* ---- Excel ---- */
  function verExcel(r, cont) {
    cont.innerHTML = barra('<b>' + esc(r.archivo.split('/').pop()) + '</b> · vista previa (las celdas azules contienen fórmulas)', botonPantalla()) + avisoLocal() + '<div id="xls"><div class="cargando">Cargando hoja de cálculo…</div></div>';
    activarPantalla(cont);
    Promise.all([fetch(r.archivo).then(function (x) { if (!x.ok) throw new Error(x.status); return x.arrayBuffer(); }), cargarScript(CDN.xlsx)]).then(function (res) {
      var wb = window.XLSX.read(res[0], { type: 'array', cellFormula: true, cellNF: true, cellStyles: true });
      var caja = $('#xls');
      caja.innerHTML = '<div class="hojas-tabs" role="tablist" aria-label="Hojas del libro">' + wb.SheetNames.map(function (n, i) {
        return '<button type="button" role="tab" id="hoja-tab-' + i + '" aria-controls="hoja" data-i="' + i + '"' +
          (i ? ' aria-selected="false" tabindex="-1"' : ' class="on" aria-selected="true"') + '>' + esc(n) + '</button>';
      }).join('') + '</div><div class="tabla-hoja-caja" id="hoja" role="tabpanel" aria-labelledby="hoja-tab-0"></div>' +
        '<div class="excel-pie" id="xls-pie" aria-live="polite"></div>';
      function pintar(i) {
        var ws = wb.Sheets[wb.SheetNames[i]];
        if (!ws || !ws['!ref']) { $('#hoja').innerHTML = '<div class="cargando">Hoja vacía</div>'; return; }
        var rg = window.XLSX.utils.decode_range(ws['!ref']);
        var maxF = Math.min(rg.e.r, rg.s.r + 299), maxC = Math.min(rg.e.c, rg.s.c + 39);
        var anchos = ws['!cols'] || [];
        var cols = '<col style="width:44px">', total = 44;
        for (var c = rg.s.c; c <= maxC; c++) {
          var a = anchos[c] || {};
          var px = Math.round(Math.min(Math.max(a.width ? a.width * 8 + 14 : (a.wch ? a.wch * 8 + 22 : (a.wpx ? a.wpx * 1.3 : 84)), 28), 420));
          cols += '<col style="width:' + px + 'px">'; total += px;
        }
        var h = '<table class="tabla-hoja" style="width:' + total + 'px"><colgroup>' + cols + '</colgroup><thead><tr><th></th>';
        for (c = rg.s.c; c <= maxC; c++) h += '<th>' + window.XLSX.utils.encode_col(c) + '</th>';
        h += '</tr></thead><tbody>';
        for (var f = rg.s.r; f <= maxF; f++) {
          h += '<tr><td class="fila">' + (f + 1) + '</td>';
          for (c = rg.s.c; c <= maxC; c++) {
            var cel = ws[window.XLSX.utils.encode_cell({ r: f, c: c })];
            if (!cel) { h += '<td></td>'; continue; }
            var v = cel.w != null ? cel.w : (cel.v != null ? cel.v : '');
            var vecina = ws[window.XLSX.utils.encode_cell({ r: f, c: c + 1 })];
            var desborda = cel.t === 's' && (!vecina || vecina.v === '' || vecina.v == null);
            var cls = (cel.f ? 'formula ' : '') + (cel.t === 'n' ? 'num ' : '') + (desborda ? 'desborda' : '');
            h += '<td' + (cls ? ' class="' + cls.trim() + '"' : '') + (cel.f ? ' title="=' + esc(cel.f) + '"' : (cel.t === 's' ? ' title="' + esc(v) + '"' : '')) + '>' + esc(v) + '</td>';
          }
          h += '</tr>';
        }
        $('#hoja').innerHTML = h + '</tbody></table>';
        var recorte = (rg.e.r > maxF || rg.e.c > maxC) ? ' Se muestran las primeras 300 filas y 40 columnas.' : '';
        $('#xls-pie').textContent = 'Toca o pasa el cursor sobre una celda azul para ver su fórmula. Descarga el archivo para editarlo.' + recorte;
      }
      // En celular no hay cursor: al tocar una celda con fórmula, la fórmula aparece en el pie
      $('#hoja').addEventListener('click', function (e) {
        var td = e.target.closest('td.formula'); if (!td) return;
        var col = td.closest('table').tHead.rows[0].cells[td.cellIndex].textContent, fila = td.parentNode.cells[0].textContent;
        $('#xls-pie').textContent = col + fila + ': ' + td.title;
      });
      var tabs = [].slice.call(caja.querySelectorAll('.hojas-tabs button'));
      function elegir(b, enfocar) {
        tabs.forEach(function (x) {
          var si = x === b;
          x.classList.toggle('on', si); x.setAttribute('aria-selected', si ? 'true' : 'false'); x.tabIndex = si ? 0 : -1;
        });
        $('#hoja').setAttribute('aria-labelledby', b.id);
        if (enfocar) b.focus();
        pintar(+b.dataset.i);
      }
      tabs.forEach(function (b, i) {
        b.addEventListener('click', function () { elegir(b); });
        // Flechas, Inicio y Fin recorren las hojas, como en cualquier conjunto de pestañas
        b.addEventListener('keydown', function (e) {
          var j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
          if (j === undefined) return;
          e.preventDefault();
          elegir(tabs[(j + tabs.length) % tabs.length], true);
        });
      });
      pintar(0);
    }).catch(function () {
      $('#xls').innerHTML = '<div class="descarga-grande"><p>No se pudo mostrar la vista previa.</p><a class="btn btn-primario" href="' + esc(r.archivo) + '" download>' + ico('descargar', 16) + 'Descargar archivo</a></div>';
    });
  }

  /* ---- Video ---- */
  function idYoutube(u) {
    var m = String(u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : '';
  }
  function verVideo(r, cont) {
    var yt = idYoutube(r.url);
    var vertical = r.vertical || /\/shorts\//.test(r.url || '');
    var fuente = yt ? '<iframe src="https://www.youtube-nocookie.com/embed/' + yt + '?rel=0" title="' + esc(r.titulo) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      : '<video controls preload="metadata" playsinline src="' + esc(r.archivo || r.url) + '"></video>';
    cont.innerHTML = '<div class="video-caja' + (vertical ? ' vertical' : '') + '">' + fuente + '</div>';
    if (vertical) cont.style.background = '#000';
  }

  /* ---- PDF ---- */
  function verPDF(r, cont) {
    var tactil = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
    if (tactil) { verArchivo(r, cont, 'En el celular, el PDF se abre mejor en tu visor.', true); return; }
    cont.innerHTML = barra('<b>' + esc(r.archivo.split('/').pop()) + '</b>', botonPantalla()) +
      '<iframe class="marco-sim" src="' + esc(r.archivo) + '" title="' + esc(r.titulo) + '"></iframe>';
    activarPantalla(cont);
  }

  /* ---- Descarga genérica ---- */
  function verArchivo(r, cont, nota, abrir) {
    var t = TIPOS[r.tipo] || TIPOS.archivo;
    var m = materia(r.materia) || { color: 'azul' };
    cont.innerHTML = '<div class="descarga-grande c-' + esc(m.color) + '"><div class="token grande">' + esc(r.sigla || t.sigla) + '</div>' +
      '<p>' + esc(nota || 'Este recurso se usa descargándolo en tu computadora.') + '</p>' +
      (r.archivo ? '<a class="btn btn-primario" href="' + esc(r.archivo) + '" ' + (abrir ? 'target="_blank" rel="noopener"' : 'download') + '>' + ico(abrir ? 'externo' : 'descargar', 16) + (abrir ? 'Abrir' : 'Descargar') + ' ' + esc(r.archivo.split('/').pop()) + (r.bytes ? ' · ' + peso(r.bytes) : '') + '</a>' :
        r.url ? '<a class="btn btn-primario" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + ico('externo', 16) + 'Abrir enlace</a>' : '') + '</div>';
  }

  /* ---------------- arranque ---------------- */
  function iniciar() {
    var pag = document.body.getAttribute('data-pagina');
    pintarCabecera(pag);
    var rutinas = { inicio: paginaInicio, explorar: paginaExplorar, materia: paginaMateria, recurso: paginaRecurso };
    if (!window.EREACTOR && rutinas[pag]) {
      $('#contenido').innerHTML = '<div class="contenedor"><section class="pagina-cab"><h1>Falta el catálogo</h1><p class="bajada">No se encontró <code>datos/catalogo.js</code>. Ejecuta <b>ACTUALIZAR_CATALOGO.bat</b> para generarlo.</p></section></div>';
    } else if (rutinas[pag]) rutinas[pag]();
    // Textos estáticos que dependen de datos/config.json (página «Acerca de»)
    document.querySelectorAll('[data-cfg-si]').forEach(function (el) { if (!CFG[el.getAttribute('data-cfg-si')]) el.remove(); });
    document.querySelectorAll('[data-cfg]').forEach(function (el) { var v = CFG[el.getAttribute('data-cfg')]; if (v) el.textContent = v; });
    document.querySelectorAll('[data-cfg-href]').forEach(function (el) { var v = CFG[el.getAttribute('data-cfg-href')]; if (v) el.href = v; });
    document.querySelectorAll('[data-cfg-mailto]').forEach(function (el) { var v = CFG[el.getAttribute('data-cfg-mailto')]; if (v) el.href = 'mailto:' + v; });
    pintarPie();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
