@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PY=python
where python >nul 2>nul || set PY=py
echo Copiando los modulos de la app Android al sitio...
%PY% scripts\sincronizar_modulos_app.py
echo.
%PY% scripts\construir_catalogo.py
echo.
pause
