@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Opening the standalone simulator instead.
  start "" "%~dp0Heat Tracing Simulator.html"
  exit /b 0
)
echo Starting the simulator. Your browser will open automatically.
echo For the trade-show loop add ?kiosk=1 to the address.
echo Keep this window open while the simulator is running.
node server.mjs 4173 --open
pause
