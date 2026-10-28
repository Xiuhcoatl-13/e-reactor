# -*- coding: utf-8 -*-
"""
CSTR vs PFR: volumen requerido y gráfica de Levenspiel
e-Reactor · Cinética y reactores químicos

Reacción en fase líquida (densidad constante):  A -> productos
Ley de velocidad:                               -rA = k * CA**n
Balance de A:
    CSTR:  V = FA0 * X / (-rA evaluada a la salida)
    PFR:   V = FA0 * integral_0^X  dX / (-rA)

Cambia los parámetros de abajo y vuelve a ejecutar.
"""
import numpy as np
import matplotlib.pyplot as plt

# ------------------ Parámetros (modifícalos) ------------------
k = 0.5        # constante de velocidad   [(L/mol)^(n-1) / min]
n = 2          # orden de reacción        [-]
CA0 = 2.0      # concentración inicial    [mol/L]
v0 = 10.0      # flujo volumétrico        [L/min]
X_obj = 0.80   # conversión deseada       [-]
# ---------------------------------------------------------------

FA0 = v0 * CA0                          # flujo molar de A a la entrada [mol/min]


def rapidez(X):
    """-rA en función de la conversión [mol/(L·min)]."""
    CA = CA0 * (1.0 - X)
    return k * CA**n


def integral_trapecio(y, x):
    return float(np.sum((y[1:] + y[:-1]) * np.diff(x) / 2.0))


def volumen_cstr(X):
    return FA0 * X / rapidez(X)


def volumen_pfr(X, puntos=2001):
    Xs = np.linspace(0.0, X, puntos)
    return integral_trapecio(FA0 / rapidez(Xs), Xs)


V_cstr = volumen_cstr(X_obj)
V_pfr = volumen_pfr(X_obj)

print(f"Reacción de orden n = {n},  k = {k},  CA0 = {CA0} mol/L,  v0 = {v0} L/min")
print(f"Conversión deseada X = {X_obj:.2f}\n")
print(f"  Volumen CSTR = {V_cstr:10.2f} L")
print(f"  Volumen PFR  = {V_pfr:10.2f} L")
print(f"  Relación V_CSTR / V_PFR = {V_cstr / V_pfr:.2f}")

# Verificación con la solución analítica (n = 1 o n = 2)
if n == 1:
    print(f"\n  PFR analítico (n=1): V = v0/k · ln[1/(1-X)] = {v0 / k * np.log(1 / (1 - X_obj)):.2f} L")
elif n == 2:
    print(f"\n  PFR analítico (n=2): V = v0/(k·CA0) · X/(1-X) = {v0 / (k * CA0) * X_obj / (1 - X_obj):.2f} L")

# Tabla de volúmenes para varias conversiones
print("\n   X      V_CSTR [L]   V_PFR [L]")
for X in (0.2, 0.4, 0.6, 0.8, 0.9):
    print(f"  {X:.1f}  {volumen_cstr(X):12.2f} {volumen_pfr(X):11.2f}")

# ------------------ Gráficas ------------------
X = np.linspace(0, min(0.95, X_obj + 0.10), 400)
L = FA0 / rapidez(X)                      # FA0/(-rA): curva de Levenspiel

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.3))

ax1.plot(X, L, color="#10263f", lw=2.2, label=r"$F_{A0}/(-r_A)$")
Xs = X[X <= X_obj]
ax1.fill_between(Xs, 0, FA0 / rapidez(Xs), color="#0f766e", alpha=0.30, label=f"PFR: área = {V_pfr:.0f} L")
ax1.fill_between([0, X_obj], 0, FA0 / rapidez(X_obj), facecolor="none", edgecolor="#b45309",
                 hatch="///", lw=1.5, label=f"CSTR: rectángulo = {V_cstr:.0f} L")
ax1.axvline(X_obj, color="#667085", ls="--", lw=1)
ax1.set_xlabel("Conversión, X")
ax1.set_ylabel(r"$F_{A0}/(-r_A)$  [L]")
ax1.set_title("Gráfica de Levenspiel")
ax1.legend(loc="upper left", fontsize=9)
ax1.set_xlim(0, X.max())
ax1.set_ylim(0, 1.6 * FA0 / rapidez(X_obj))

Xv = np.linspace(0.01, 0.95, 60)
ax2.plot(Xv, [volumen_cstr(x) for x in Xv], color="#b45309", lw=2.2, label="CSTR")
ax2.plot(Xv, [volumen_pfr(x) for x in Xv], color="#0f766e", lw=2.2, label="PFR")
ax2.set_yscale("log")
ax2.set_xlabel("Conversión, X")
ax2.set_ylabel("Volumen requerido  [L]")
ax2.set_title("Volumen vs. conversión")
ax2.grid(True, which="both", alpha=0.3)
ax2.legend()

fig.tight_layout()
plt.show()
