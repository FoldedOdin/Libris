@echo off
setlocal

echo ========================================
echo Libris - Modern Library Management
echo Development Startup Script
echo ========================================
echo.

:: 1. Check for root node_modules
if not exist "node_modules\" (
    echo [1/3] Root dependencies missing. Installing...
    call npm install
) else (
    echo [1/3] Root dependencies found.
)

:: 2. Check for backend venv and dependencies
if not exist "Online Library Management System\venv\" (
    echo [2/3] Backend virtual environment missing. Creating...
    python -m venv "Online Library Management System\venv"
    echo Installing backend dependencies...
    "Online Library Management System\venv\Scripts\pip" install -r "Online Library Management System\library\requirements.txt"
) else (
    echo [2/3] Backend virtual environment found.
)

:: 3. Check for frontend node_modules
if not exist "react-frontend-olms\node_modules\" (
    echo [3/3] Frontend dependencies missing. Installing...
    cd react-frontend-olms
    call npm install
    cd ..
) else (
    echo [3/3] Frontend dependencies found.
)

echo.
echo ========================================
echo Starting Backend and Frontend Servers...
echo ========================================
echo.

npm run dev

pause
