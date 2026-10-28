@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PY=python
where python >nul 2>nul || set PY=py
where git >nul 2>nul
if errorlevel 1 (
  echo No encontre Git. Usa GitHub Desktop para publicar, o instala Git:
  echo https://git-scm.com/download/win
  pause
  exit /b 1
)
if not exist ".git" (
  echo Esta carpeta aun no esta conectada a GitHub.
  echo Sigue el paso 4 de LEEME.md la primera vez.
  pause
  exit /b 1
)
%PY% scripts\construir_catalogo.py
if errorlevel 1 (
  echo.
  echo Hay errores en el catalogo. Corrigelos antes de publicar.
  pause
  exit /b 1
)
echo.
set MSG=
set /p MSG=Describe el cambio en pocas palabras: 
if "%MSG%"=="" set MSG=Actualizo contenido
git add -A
git commit -m "%MSG%"
git push
if errorlevel 1 (
  echo.
  echo No se pudo subir. Abre GitHub Desktop para ver el detalle.
  pause
  exit /b 1
)
echo.
echo Listo. Los cambios se veran en internet en 1 o 2 minutos.
pause
