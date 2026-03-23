@echo off
echo Starting Smart Waste Management System...

echo Starting MongoDB...
REM Check if MongoDB is running, if not start it
net start MongoDB

echo Starting backend server...
cd backend
start cmd /k "npm run dev"

echo Starting frontend...
cd ../frontend
start cmd /k "npm run dev"

echo Both servers are starting. Please wait a moment...
echo Backend will be available at: http://localhost:4000
echo Frontend will be available at: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul
