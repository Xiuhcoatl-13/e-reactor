%% Reacciones en serie A -> B -> C en un reactor por lotes
% e-Reactor · Cinética y reactores químicos
%
% Cinética de primer orden para ambas etapas:
%   dCA/dt = -k1*CA
%   dCB/dt =  k1*CA - k2*CB
%   dCC/dt =  k2*CB
%
% Se resuelve con ode45 y el máximo de B se compara con la solución analítica:
%   t_max  = ln(k2/k1) / (k2 - k1)
%   CB_max = CA0 * (k1/k2)^(k2/(k2 - k1))
%
% Funciona en MATLAB (R2016b o posterior) y en GNU Octave.

clear; clc; close all;

%% Parámetros (modifícalos)
k1  = 0.35;    % 1/min   A -> B
k2  = 0.12;    % 1/min   B -> C
CA0 = 2.0;     % mol/L
tf  = 40;      % min

%% Sistema de ecuaciones diferenciales
dCdt = @(t, C) [ -k1*C(1);
                  k1*C(1) - k2*C(2);
                  k2*C(2) ];

opciones = odeset('RelTol', 1e-8, 'AbsTol', 1e-10);
[t, C] = ode45(dCdt, linspace(0, tf, 801), [CA0; 0; 0], opciones);

%% Máximo de B: numérico vs. analítico
[CBmax_num, idx] = max(C(:,2));
tmax_num = t(idx);
if abs(k1 - k2) > 1e-12
    tmax_an  = log(k2/k1) / (k2 - k1);
    CBmax_an = CA0 * (k1/k2)^(k2/(k2 - k1));
else
    tmax_an  = 1/k1;              % caso límite k1 = k2
    CBmax_an = CA0 * exp(-1);
end

fprintf('Reacciones en serie A -> B -> C  (k1 = %.3f, k2 = %.3f 1/min)\n\n', k1, k2);
fprintf('                     numérico    analítico\n');
fprintf('  t_max  [min]     %9.3f   %9.3f\n', tmax_num, tmax_an);
fprintf('  CB_max [mol/L]   %9.4f   %9.4f\n', CBmax_num, CBmax_an);
fprintf('\nBalance al final: CA + CB + CC = %.6f mol/L (debe ser %.4f)\n', sum(C(end,:)), CA0);

%% Gráfica
figure('Color', 'w');
plot(t, C(:,1), 'LineWidth', 2); hold on;
plot(t, C(:,2), 'LineWidth', 2);
plot(t, C(:,3), 'LineWidth', 2);
plot(tmax_an, CBmax_an, 'ko', 'MarkerFaceColor', 'k');
text(tmax_an, CBmax_an, sprintf('  B máx: %.3f mol/L en t = %.2f min', CBmax_an, tmax_an), ...
     'VerticalAlignment', 'bottom');
grid on; box on;
xlabel('Tiempo [min]');
ylabel('Concentración [mol/L]');
title('Reacciones en serie A \rightarrow B \rightarrow C en un reactor por lotes');
legend('C_A', 'C_B', 'C_C', 'Location', 'east');

%% Para pensar
% 1) ¿Qué pasa con t_max y CB_max si k2 > k1?
% 2) Si B es el producto deseado, ¿en qué tiempo detendrías el reactor?
% 3) Cambia k2 a 0.35 (k1 = k2) y verifica el caso límite.
