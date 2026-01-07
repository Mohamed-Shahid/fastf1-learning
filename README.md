# FastF1 Learning Project

This project was built to understand and experiment with the **FastF1 API**.

## Purpose
- Learn how FastF1 sessions and lap data work
- Practice backend–frontend data flow
- Visualize lap times using real F1 data

This is a **learning project**, not a production or portfolio project.

## Tech Used
- FastF1
- FastAPI
- Pandas
- HTML, CSS, JavaScript
- Chart.js

## How it works
- Backend loads race data using FastF1
- Lap times are cleaned and converted
- Frontend fetches the data and displays lap time charts

## Run locally
```bash
pip install fastf1 fastapi[all] pandas uvicorn
cd backend
uvicorn main:app --reload
