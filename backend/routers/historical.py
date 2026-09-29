import os
import json
import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from schemas.models import CrisisRequest, CrisisResponse, SeasonPoint
from simulation.cobweb_model import run_simulation

router = APIRouter(prefix="/api", tags=["historical"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


@router.get("/historical-data")
def historical_data(crop: str = Query("onion"), year: Optional[int] = None, season: Optional[str] = None):
    path = os.path.join(DATA_DIR, f"{crop}_historical.csv")
    if not os.path.exists(path):
        raise HTTPException(status_code=400, detail=f"No historical data for crop: {crop}")
    df = pd.read_csv(path)
    if year:
        df = df[df["year"] == year]
    if season:
        df = df[df["season"].str.lower() == season.lower()]
    return {"crop": crop, "rows": df.to_dict(orient="records"), "data_source": "demo"}


@router.post("/historical-crisis", response_model=CrisisResponse)
def historical_crisis(req: CrisisRequest):
    path = os.path.join(DATA_DIR, "crisis_scenarios.json")
    with open(path) as f:
        crises = json.load(f)
    if req.crisis not in crises:
        raise HTTPException(status_code=400, detail=f"Unknown crisis: {req.crisis}")

    crisis_data = crises[req.crisis]
    historical_prices = crisis_data["historical_illustrative"]

    # Run the model with a scenario roughly matching the crisis narrative
    # (rainfall deficit + resulting acreage swing) to compare against the
    # illustrative historical series.
    sim = run_simulation(
        crop=req.crop, seasons=len(historical_prices),
        rainfall_deviation=-25, msp_change=0, demand_shift=0,
        farmer_mix={"risk_averse": 25, "trend_chasing": 55, "msp_informed": 20},
    )

    return {
        "crop": req.crop,
        "crisis": req.crisis,
        "narrative": crisis_data["narrative"],
        "historical": [SeasonPoint(season=p["season"], price=p["price"], acreage=0, production=0, demand=0) for p in historical_prices],
        "simulated": [SeasonPoint(**s) for s in sim["seasons"]],
        "disclaimer": (
            "This is a simplified reconstruction for demonstration purposes, not an exact "
            "historical reproduction. Historical series shown here are illustrative/demo data, "
            "not official Agmarknet or IMD records."
        ),
        "data_source": "demo",
    }
