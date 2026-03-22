@echo off
echo Starting Aemo Developer Development Server...
echo.
echo Prerequisites:
echo - Node.js 18+ should be installed
echo - Dependencies should be installed (run 'npm install' if not done)
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting development server...
echo The app will open at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
