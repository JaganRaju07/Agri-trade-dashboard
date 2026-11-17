@echo off
title Agri Trade Ledger - FAO Trade Analysis Dashboard
echo ======================================================================
echo Global Import and Export in Agriculture: FAO Trade Analysis (2000-2024)
echo Data Visualization Lab (BISL504) - NIE Mysuru
echo ======================================================================
echo.

if not exist public\data\trade.json (
    echo [1/3] Generating compact trade dataset from CSV...
    python python\prepare_data.py
    if errorlevel 1 (
        echo Error generating trade.json. Please ensure python and pandas are installed.
        pause
        exit /b 1
    )
)

if not exist node_modules (
    echo [2/3] Installing node dependencies...
    call npm install
)

echo [3/3] Starting Vite local development server...
start "" "http://localhost:3000"
call npm run dev
