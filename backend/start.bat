@echo off
echo.
echo  ✦  Fear City — Backend
echo  ──────────────────────────────────────────────
echo.

:: Garante que está na pasta certa
cd /d "%~dp0"

:: Cria venv com Python 3.11 se não existir
if not exist "venv\Scripts\python.exe" (
    echo [1/3] Criando ambiente virtual com Python 3.11...
    py -3.11 -m venv venv
    if errorlevel 1 (
        echo ERRO: Python 3.11 nao encontrado. Rode: py install 3.11
        pause
        exit /b 1
    )
)

:: Instala dependencias usando o pip DO VENV (não o global)
echo [2/3] Instalando dependencias...
venv\Scripts\pip.exe install -r requirements.txt --quiet

echo [3/3] Iniciando servidor...
echo.
echo  URL:  http://localhost:8000
echo  Docs: http://localhost:8000/docs
echo  Chave de teste: CHAVE_SECRETA_2024
echo.
echo  Pressione CTRL+C para parar
echo  ──────────────────────────────────────────────
echo.

:: Roda o uvicorn DO VENV (não o global do Python 3.14)
venv\Scripts\uvicorn.exe main:app --reload --port 8000

pause
