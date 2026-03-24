@echo off
echo Starting FastAPI Backend for Finance Tracker...
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
