import fastf1
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

fastf1.Cache.enable_cache("cache")

app = FastAPI()

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "FastF1 backend is running"}

@app.get("/race")
def get_race(year: int, race: str):
    session = fastf1.get_session(year, race, "R")
    session.load()

    return {
        "EventName": session.event["EventName"],
        "Location": session.event["Location"],
        "Country": session.event["Country"],
        "Date": str(session.date),
    }

@app.get("/laps")
def get_driver_laps(year: int, race: str, driver: str):
    session = fastf1.get_session(year, race, "R")
    session.load()

    laps = session.laps.pick_drivers([driver])
    laps = laps[["LapNumber", "LapTime"]].dropna()

    laps["lap_time_sec"] = laps["LapTime"].dt.total_seconds()

    return [
        {
            "lap": int(row.LapNumber),
            "lap_time_sec": round(row.lap_time_sec, 3)
        }
        for _, row in laps.iterrows()
    ]
