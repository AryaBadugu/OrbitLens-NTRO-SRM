from fastapi import APIRouter
from simulation.cobweb_model import CROP_PARAMS

router = APIRouter(tags=["meta"])


from database.db import get_connection
from services.agmarknet_service import get_upstream_status
from services.imd_service import get_current_weather


@router.get("/health")
def health():
    db_ok = False
    try:
        conn = get_connection()
        conn.execute("SELECT 1")
        conn.close()
        db_ok = True
    except Exception:
        db_ok = False

    agmarknet_stat = get_upstream_status()
    weather_stat = get_current_weather("Nashik")

    return {
        "status": "ok",
        "diagnostics": {
            "application": "healthy",
            "database": "connected" if db_ok else "error",
            "agmarknet": {
                "configured": agmarknet_stat["api_key_configured"],
                "cached_records": agmarknet_stat["cached_record_count"],
                "last_sync": agmarknet_stat["last_sync"]
            },
            "imd": {
                "status": weather_stat.get("data_status", "unavailable"),
                "source": weather_stat.get("source")
            }
        }
    }



@router.get("/crops")
def crops():
    return {
        "crops": [
            {
                "id": crop_id,
                "label": crop_id.capitalize(),
                "base_price": params["base_price"],
                "base_acreage": params["base_acreage"],
                "msp": params["msp"],
            }
            for crop_id, params in CROP_PARAMS.items()
        ]
    }


@router.get("/model-info")
def model_info():
    return {
        "model_type": "Cobweb model / system of difference equations",
        "steps": [
            {"id": "historical_data", "title": "Historical Data", "description": "Demo/illustrative historical price, acreage and rainfall series stand in for real Agmarknet/IMD data."},
            {"id": "farmer_behaviour", "title": "Farmer Behaviour", "description": "Three simplified archetypes (risk-averse, trend-chasing, MSP-informed) determine how strongly acreage responds to the previous price."},
            {"id": "acreage_decision", "title": "Acreage Decision", "description": "Each archetype's response is blended by population share to update total acreage."},
            {"id": "weather_shock", "title": "Weather Shock", "description": "A rainfall deviation input scales expected yield per hectare."},
            {"id": "production", "title": "Production", "description": "Acreage x yield-per-hectare = total production for the season."},
            {"id": "demand", "title": "Demand", "description": "A simplified demand function combines an exogenous shift with mild own-price elasticity."},
            {"id": "market_price", "title": "Market Price", "description": "A market-clearing function sets price from the demand/supply gap."},
            {"id": "feedback_loop", "title": "Feedback Loop", "description": "This season's price becomes next season's planting signal - repeating the cycle."},
            {"id": "risk_analysis", "title": "Risk Analysis", "description": "Volatility, MSP deviation and price-range extremity combine into a 0-100 risk score."},
            {"id": "policy_simulation", "title": "Policy Simulation", "description": "MSP, demand and rainfall levers can be tested against the same model to compare outcomes."},
        ],
        "assumptions": [
            "Farmer archetypes are simplified behavioural groups, not individually modeled farmers.",
            "Demand is modeled simply (exogenous shift + mild own-price elasticity); real demand depends on substitution, income, exports, and storage, which are not modeled here.",
            "Weather is represented only through a single rainfall-deviation input, not spatial or timing detail.",
            "Collective behaviour is aggregated at the national/crop level, not regionally.",
            "This model is intended for scenario exploration, not guaranteed prediction.",
            "Historical calibration against real Agmarknet/IMD data is required for stronger real-world validity; current sensitivity constants are illustrative defaults.",
        ],
        "data_source": "demo",
    }
