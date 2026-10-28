/* Archivo GENERADO por scripts/construir_catalogo.py — no lo edites a mano. */
window.EREACTOR = {
 "generado": "2026-10-28 12:21",
 "config": {
  "nombre": "e-Reactor",
  "lema": "Ingeniería química clara, interactiva y gratuita para Latinoamérica",
  "descripcion": "Simulaciones, calculadoras, código en Python y MATLAB, hojas de Excel y animaciones para estudiar Ingeniería Química, Ambiental, de Materiales, Energía y Alimentos.",
  "autor": "Xiuhcóatl",
  "url_base": "https://xiuhcoatl-13.github.io/e-reactor",
  "github_repo": "Xiuhcoatl-13/e-reactor",
  "github_rama": "main",
  "contacto_email": "",
  "app_android_url": "",
  "licencia": "CC BY-NC-SA 4.0",
  "licencia_url": "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es",
  "redes": {
   "youtube": "",
   "facebook": "",
   "instagram": "",
   "tiktok": ""
  }
 },
 "materias": [
  {
   "id": "balances",
   "nombre": "Balances de materia y energía",
   "sigla": "Σ",
   "color": "azul",
   "descripcion": "Estequiometría, grado de avance y balances con y sin reacción: la base de todo proceso químico.",
   "temas": [
    "Estequiometría y grado de avance",
    "Balances de materia sin reacción",
    "Balances de materia con reacción",
    "Balances de energía y termoquímica"
   ]
  },
  {
   "id": "termodinamica",
   "nombre": "Termodinámica",
   "sigla": "ΔG",
   "color": "ambar",
   "descripcion": "Propiedades de sustancias puras, ecuaciones de estado, termoquímica y equilibrio de fases y químico.",
   "temas": [
    "Propiedades de sustancias puras",
    "Ecuaciones de estado",
    "Equilibrio de fases",
    "Termoquímica",
    "Equilibrio químico"
   ]
  },
  {
   "id": "transporte",
   "nombre": "Fenómenos de transporte",
   "sigla": "∇",
   "color": "pizarra",
   "descripcion": "Transporte de cantidad de movimiento, calor y masa; perfiles, balances de envoltura y correlaciones.",
   "temas": [
    "Transporte de cantidad de movimiento",
    "Transporte de calor",
    "Transporte de masa",
    "Análisis dimensional y correlaciones"
   ]
  },
  {
   "id": "reactores",
   "nombre": "Cinética y reactores químicos",
   "sigla": "τ",
   "color": "verde",
   "descripcion": "Cinética, reactores ideales, reacciones múltiples, operación no isotérmica y catálisis heterogénea.",
   "temas": [
    "Cinética química",
    "Reactores ideales",
    "Reacciones múltiples, selectividad y rendimiento",
    "Reactores no isotérmicos",
    "Catálisis heterogénea"
   ]
  },
  {
   "id": "operaciones",
   "nombre": "Operaciones unitarias",
   "sigla": "OU",
   "color": "cafe",
   "descripcion": "Intercambiadores de calor, destilación, absorción, extracción y secado.",
   "temas": [
    "Intercambiadores de calor",
    "Destilación",
    "Absorción y desorción",
    "Extracción",
    "Secado y humidificación"
   ]
  },
  {
   "id": "numericos",
   "nombre": "Métodos numéricos y programación",
   "sigla": "f(x)",
   "color": "violeta",
   "descripcion": "Python, MATLAB y Excel aplicados a problemas reales de ingeniería química.",
   "temas": [
    "Python para ingeniería",
    "MATLAB para ingeniería",
    "Excel para ingeniería",
    "Ecuaciones no lineales",
    "Ecuaciones diferenciales",
    "Regresión y ajuste de datos"
   ]
  },
  {
   "id": "simulacion",
   "nombre": "Simulación de procesos",
   "sigla": "PFD",
   "color": "rosa",
   "descripcion": "Aspen Plus, DWSIM, diagramas de flujo, recirculaciones y convergencia.",
   "temas": [
    "Aspen Plus",
    "DWSIM",
    "Diagramas de flujo y recirculaciones"
   ]
  },
  {
   "id": "control",
   "nombre": "Control de procesos",
   "sigla": "PID",
   "color": "pizarra",
   "descripcion": "Dinámica de procesos, funciones de transferencia y controladores PID.",
   "temas": [
    "Dinámica de procesos",
    "Controladores PID"
   ]
  },
  {
   "id": "ambiental",
   "nombre": "Ingeniería ambiental",
   "sigla": "CO₂",
   "color": "oliva",
   "descripcion": "Control de emisiones, contaminación atmosférica y tratamiento de aguas.",
   "temas": [
    "Control de emisiones",
    "Contaminación atmosférica",
    "Tratamiento de aguas"
   ]
  }
 ],
 "recursos": [
  {
   "id": "analisis-datos-cineticos-metodo-integral",
   "titulo": "Análisis de datos cinéticos: método integral",
   "descripcion": "Hoja de Excel que prueba los modelos de orden 0, 1 y 2 sobre datos de concentración contra tiempo, elige el de mejor ajuste y estima la constante de velocidad. Cambia los datos y todo se recalcula.",
   "materia": "reactores",
   "tema": "Cinética química",
   "tambien_en": [
    {
     "materia": "numericos",
     "tema": "Excel para ingeniería"
    }
   ],
   "archivo": "recursos/analisis-datos-cineticos-metodo-integral/metodo_integral.xlsx",
   "bytes": 17204,
   "ext": "xlsx",
   "tipo": "excel",
   "nivel": "basico",
   "sigla": "XLS",
   "etiquetas": [
    "método integral",
    "orden de reacción",
    "constante de velocidad",
    "regresión lineal",
    "Excel"
   ],
   "objetivos": [
    "Linealizar las leyes de velocidad de orden 0, 1 y 2.",
    "Usar PENDIENTE, INTERSECCION.EJE y COEFICIENTE.R2 para ajustar los datos.",
    "Decidir el orden de reacción con criterio, no solo con el R²."
   ],
   "fecha": "2026-10-21"
  },
  {
   "id": "conduccion-transitoria",
   "titulo": "Conducción transitoria: números de Biot y Fourier",
   "descripcion": "Aplica el criterio de Biot, el número de Fourier y el modelo de capacitancia concentrada para predecir la temperatura de sólidos simples en el tiempo.",
   "materia": "transporte",
   "tema": "Transporte de calor",
   "archivo": "modulos/transient_conduction.html",
   "bytes": 14719,
   "ext": "html",
   "tipo": "simulacion",
   "nivel": "intermedio",
   "sigla": "Bi",
   "etiquetas": [
    "Biot",
    "Fourier",
    "capacitancia concentrada",
    "conducción transitoria"
   ],
   "fecha": "2026-10-21"
  },
  {
   "id": "conveccion-de-calor",
   "titulo": "Convección de calor: de Nu a h",
   "descripcion": "Obtén el coeficiente convectivo h, el flux de calor y el área requerida a partir de correlaciones de Nusselt para casos comunes.",
   "materia": "transporte",
   "tema": "Transporte de calor",
   "tambien_en": [
    {
     "materia": "operaciones",
     "tema": "Intercambiadores de calor"
    }
   ],
   "archivo": "modulos/heat_convection.html",
   "bytes": 18147,
   "ext": "html",
   "tipo": "calculadora",
   "nivel": "intermedio",
   "sigla": "h",
   "etiquetas": [
    "convección",
    "Nusselt",
    "coeficiente de transferencia de calor",
    "Dittus-Boelter"
   ],
   "fecha": "2026-10-21"
  },
  {
   "id": "conversion-al-equilibrio",
   "titulo": "Conversión al equilibrio",
   "descripcion": "Calcula el grado de avance de equilibrio, la composición y la conversión de una reacción en mezcla ideal a partir de K y la alimentación, y explora cómo cambian al variar K.",
   "materia": "termodinamica",
   "tema": "Equilibrio químico",
   "tambien_en": [
    {
     "materia": "reactores",
     "tema": "Reactores ideales"
    }
   ],
   "archivo": "modulos/equilibrium_conversion.html",
   "bytes": 19853,
   "ext": "html",
   "tipo": "simulacion",
   "nivel": "intermedio",
   "sigla": "Xeq",
   "etiquetas": [
    "equilibrio químico",
    "conversión de equilibrio",
    "gas ideal"
   ],
   "fecha": "2026-10-21"
  },
  {
   "id": "cstr-vs-pfr-levenspiel",
   "titulo": "CSTR vs. PFR: volumen requerido y gráfica de Levenspiel",
   "descripcion": "Script de Python que calcula el volumen de un CSTR y de un PFR para una reacción de orden n y lo interpreta con la gráfica de Levenspiel. Modifica k, n o la conversión y ejecútalo aquí mismo.",
   "materia": "reactores",
   "tema": "Reactores ideales",
   "tambien_en": [
    {
     "materia": "numericos",
     "tema": "Python para ingeniería"
    }
   ],
   "archivo": "recursos/cstr-vs-pfr-levenspiel/cstr_vs_pfr.py",
   "bytes": 3494,
   "ext": "py",
   "tipo": "python",
   "nivel": "intermedio",
   "sigla": "Py",
   "etiquetas": [
    "CSTR",
    "PFR",
    "Levenspiel",
    "Python",
    "integración numérica"
   ],
   "objetivos": [
    "Plantear el balance de materia de un CSTR y de un PFR en términos de conversión.",
    "Interpretar el volumen como un área (PFR) o un rectángulo (CSTR) en la gráfica de Levenspiel.",
    "Verificar una integral numérica contra la solución analítica."
   ],
   "destacado": true,
   "fecha": "2026-10-21"
  },
  {
   "id": "efecto-temperatura-equilibrio",
   "titulo": "Efecto de la temperatura sobre K (van ’t Hoff)",
   "descripcion": "Explora cómo cambia la constante de equilibrio con la temperatura en reacciones endotérmicas y exotérmicas usando la ecuación de van ’t Hoff.",
   "materia": "termodinamica",
   "tema": "Equilibrio químico",
   "archivo": "modulos/equilibrium_temperature.html",
   "bytes": 16729,
   "ext": "html",
   "tipo": "simulacion",
   "nivel": "intermedio",
   "sigla": "K(T)",
   "etiquetas": [
    "van 't Hoff",
    "constante de equilibrio",
    "Le Châtelier"
   ],
   "fecha": "2026-10-21"
  },
  {
   "id": "equilibrio-simultaneo",
   "titulo": "Equilibrio químico con reacciones simultáneas",
   "descripcion": "Resuelve el equilibrio de varias reacciones acopladas con grados de avance múltiples y matriz estequiométrica.",
   "materia": "termodinamica",
   "tema": "Equilibrio químico",
   "archivo": "modulos/equilibrium_multi.html",
   "bytes": 18743,
   "ext": "html",
   "tipo": "simulacion",
   "nivel": "avanzado",
   "sigla": "ΣK",
   "etiquetas": [
    "equilibrio simultáneo",
    "reacciones múltiples",
    "matriz estequiométrica"
   ],
   "fecha": "2026-10-21"
  },
  {
   "id": "grado-de-avance",
   "titulo": "Grado de avance de reacción",
   "descripcion": "nᵢ = nᵢ,₀ + νᵢξ: relaciona grado de avance, conversión y composición, y verifica la factibilidad física de la mezcla.",
   "materia": "balances",
   "tema": "Estequiometría y grado de avance",
   "tambien_en": [
    {
     "materia": "reactores",
     "tema": "Cinética química"
    }
   ],
   "archivo": "modulos/reaction_extent.html",
   "bytes": 19866,
   "ext": "html",
   "tipo": "simulacion",
   "nivel": "basico",
   "sigla": "ξ",
   "etiquetas": [
    "grado de avance",
    "estequiometría",
    "conversión",
    "reactivo limitante"
   ],
   "destacado": true,
   "fecha": "2026-10-21"
  },
  {
   "id": "numeros-adimensionales",
   "titulo": "Números adimensionales y mapa de correlaciones",
   "descripcion": "Calcula 12 números adimensionales (Re, Pr, Nu, Sc, Sh, Bi…), aprende su significado físico y encuentra la correlación adecuada para tu caso.",
   "materia": "transporte",
   "tema": "Análisis dimensional y correlaciones",
   "archivo": "modulos/dimensionless_numbers.html",
   "bytes": 111813,
   "ext": "html",
   "tipo": "calculadora",
   "nivel": "basico",
   "sigla": "Π",
   "etiquetas": [
    "Reynolds",
    "Prandtl",
    "Nusselt",
    "Schmidt",
    "Sherwood",
    "correlaciones"
   ],
   "fecha": "2026-10-21"
  },
  {
   "id": "peng-robinson-newton-raphson",
   "titulo": "Volumen molar con Peng-Robinson usando Newton-Raphson",
   "descripcion": "Notebook de Jupyter que resuelve la cúbica de Peng-Robinson para el CO₂ con Newton-Raphson y muestra cómo el valor inicial decide si se obtiene la raíz de vapor o la de líquido.",
   "materia": "termodinamica",
   "tema": "Ecuaciones de estado",
   "tambien_en": [
    {
     "materia": "numericos",
     "tema": "Ecuaciones no lineales"
    }
   ],
   "archivo": "recursos/peng-robinson-newton-raphson/peng_robinson.ipynb",
   "bytes": 66729,
   "ext": "ipynb",
   "tipo": "notebook",
   "nivel": "intermedio",
   "sigla": "PR",
   "etiquetas": [
    "Peng-Robinson",
    "Newton-Raphson",
    "factor de compresibilidad",
    "ecuación cúbica",
    "Jupyter"
   ],
   "objetivos": [
    "Calcular los parámetros a, b y α(T) de Peng-Robinson.",
    "Escribir la ecuación de estado como una cúbica en Z.",
    "Entender por qué el valor inicial de Newton-Raphson define la raíz encontrada."
   ],
   "destacado": true,
   "fecha": "2026-10-21"
  },
  {
   "id": "perfiles-de-velocidad-laminar",
   "titulo": "Perfiles de velocidad en flujo laminar",
   "descripcion": "Simula los perfiles de velocidad en un tubo circular, una película descendente y flujo de Couette plano, con su deducción por balance de envoltura.",
   "materia": "transporte",
   "tema": "Transporte de cantidad de movimiento",
   "archivo": "modulos/velocity_profile.html",
   "bytes": 66274,
   "ext": "html",
   "tipo": "simulacion",
   "nivel": "intermedio",
   "sigla": "u(r)",
   "etiquetas": [
    "flujo laminar",
    "Hagen-Poiseuille",
    "película descendente",
    "Couette",
    "balance de envoltura"
   ],
   "destacado": true,
   "fecha": "2026-10-21"
  },
  {
   "id": "reacciones-en-serie-batch",
   "titulo": "Reacciones en serie A → B → C en un reactor por lotes",
   "descripcion": "Script de MATLAB que resuelve con ode45 el sistema A → B → C, encuentra el máximo del intermedio B y lo compara con la solución analítica. También corre en GNU Octave.",
   "materia": "reactores",
   "tema": "Reacciones múltiples, selectividad y rendimiento",
   "tambien_en": [
    {
     "materia": "numericos",
     "tema": "MATLAB para ingeniería"
    }
   ],
   "archivo": "recursos/reacciones-en-serie-batch/reacciones_serie.m",
   "bytes": 2273,
   "ext": "m",
   "tipo": "matlab",
   "nivel": "intermedio",
   "sigla": ".m",
   "etiquetas": [
    "reacciones en serie",
    "ode45",
    "MATLAB",
    "Octave",
    "reactor batch",
    "intermedio"
   ],
   "objetivos": [
    "Plantear el sistema de EDO de reacciones consecutivas de primer orden.",
    "Resolverlo con ode45 y verificar el balance de materia.",
    "Calcular el tiempo óptimo para maximizar el producto intermedio."
   ],
   "fecha": "2026-10-21"
  },
  {
   "id": "reactores-ideales-reacciones-multiples",
   "titulo": "Reactores ideales con reacciones múltiples",
   "descripcion": "Compara reactor por lotes, CSTR y PFR con cinética simplificada y observa cómo cambian la selectividad y el rendimiento.",
   "materia": "reactores",
   "tema": "Reactores ideales",
   "tambien_en": [
    {
     "materia": "reactores",
     "tema": "Reacciones múltiples, selectividad y rendimiento"
    }
   ],
   "archivo": "modulos/ideal_reactors_multi.html",
   "bytes": 21738,
   "ext": "html",
   "tipo": "simulacion",
   "nivel": "avanzado",
   "sigla": "τ",
   "etiquetas": [
    "CSTR",
    "PFR",
    "reactor batch",
    "selectividad"
   ],
   "destacado": true,
   "fecha": "2026-10-21"
  },
  {
   "id": "selectividad-y-rendimiento",
   "titulo": "Selectividad y rendimiento",
   "descripcion": "Distingue conversión, selectividad y rendimiento cuando hay un producto deseado y subproductos de reacciones competitivas.",
   "materia": "reactores",
   "tema": "Reacciones múltiples, selectividad y rendimiento",
   "archivo": "modulos/selectivity_yield.html",
   "bytes": 22380,
   "ext": "html",
   "tipo": "simulacion",
   "nivel": "intermedio",
   "sigla": "η",
   "etiquetas": [
    "selectividad",
    "rendimiento",
    "reacciones competitivas",
    "conversión"
   ],
   "fecha": "2026-10-21"
  }
 ]
};
