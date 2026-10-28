@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PY=python
where python >nul 2>nul || set PY=py
%PY% scripts\servidor_local.py
if errorlevel 1 (
  echo.
  echo No se pudo iniciar. Revisa que Python este instalado: https://www.python.org/downloads/
  pause
)
