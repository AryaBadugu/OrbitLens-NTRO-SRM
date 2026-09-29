"""
Cobweb model orchestration.

Implements the feedback loop:
  Previous Price -> Farmer Acreage Decision -> Weather Shock -> Production
  -> Supply vs Demand -> Market Price -> Next Season

Baseline and scenario runs both call run_simulation() with different
SimulationParams, so they are always structurally comparable.
"""
from .farmer_behaviour import FarmerMix, blended_acreage_response
from .production_model import calculate_yield, calculate_production
from .demand_model import calculate_demand
from .risk_model import calculate_volatility, calculate_risk_score, risk_label

# Crop base parameters. These stand in for calibrated constants; real
# historical calibration would refine these per crop/region.
CROP_PARAMS = {
    "onion": {
        "base_price": 1800.0,       # Rs / quintal
        "base_acreage": 1_400_000,  # hectares
        "base_yield": 17.0,         # tonnes / hectare
        "base_demand_tonnes": 23_800_000,
        "msp": 1200.0,
        "rainfall_sensitivity": 0.9,
        "gamma": 0.6,               # price sensitivity to supply/demand gap
        "price_floor": 300.0,
        "price_ceiling": 12000.0,
    },
    "tomato": {
        "base_price": 1500.0,
        "base_acreage": 800_000,
        "base_yield": 22.0,
        "base_demand_tonnes": 20_500_000,
        "msp": 900.0,
        "rainfall_sensitivity": 1.2,
        "gamma": 0.75,
        "price_floor": 200.0,
        "price_ceiling": 15000.0,
    },
}


def run_simulation(crop: str, seasons: int, rainfall_deviation: float, msp_change: float,
                    demand_shift: float, farmer_mix: dict) -> dict:
    params = CROP_PARAMS[crop]
    mix = FarmerMix(**farmer_mix)

    msp = params["msp"] * (1 + msp_change / 100.0)
    ref_price = params["base_price"]

    price = params["base_price"]
    acreage = params["base_acreage"]
    price_history = [price]

    season_points = []
    for t in range(1, seasons + 1):
        smoothed_price = sum(price_history[-3:]) / len(price_history[-3:])

        response = blended_acreage_response(
            mix=mix, last_price=price, smoothed_price=smoothed_price,
            msp=msp, ref_price=ref_price,
        )
        acreage = acreage * (1 + response)
        acreage = min(max(acreage, params["base_acreage"] * 0.5), params["base_acreage"] * 1.8)

        yield_per_ha = calculate_yield(params["base_yield"], rainfall_deviation, params["rainfall_sensitivity"])
        production = calculate_production(acreage, yield_per_ha)

        demand = calculate_demand(
            params["base_demand_tonnes"], demand_shift, price, ref_price,
        )

        supply_tonnes = production
        gap_ratio = demand / supply_tonnes if supply_tonnes > 0 else 1.0
        new_price = ref_price * (gap_ratio ** params["gamma"])
        new_price = min(max(new_price, params["price_floor"]), params["price_ceiling"])

        season_points.append({
            "season": t,
            "price": round(new_price, 2),
            "acreage": round(acreage, 0),
            "production": round(production, 0),
            "demand": round(demand, 0),
        })

        price = new_price
        price_history.append(price)

    prices = [p["price"] for p in season_points]
    volatility = calculate_volatility(prices)
    risk_score = calculate_risk_score(volatility, prices, msp)

    return {
        "seasons": season_points,
        "volatility": round(volatility, 4),
        "risk_score": risk_score,
        "risk_label": risk_label(risk_score),
    }


def compute_impact(baseline: dict, scenario: dict) -> dict:
    def pct_change(a, b):
        return round(((b - a) / a) * 100, 1) if a else 0.0

    base_final_acreage = baseline["seasons"][-1]["acreage"]
    scen_final_acreage = scenario["seasons"][-1]["acreage"]
    base_final_price = baseline["seasons"][-1]["price"]
    scen_final_price = scenario["seasons"][-1]["price"]

    # Volatility is itself already a fraction (e.g. 0.02 = 2% swing), and a
    # no-shock baseline often has near-zero volatility, which makes a
    # relative percentage change explode/mislead. Report the change in
    # percentage points instead (e.g. baseline 0% -> scenario 3% = "+3 pts").
    volatility_change_pts = round((scenario["volatility"] - baseline["volatility"]) * 100, 1)

    return {
        "acreage_change_pct": pct_change(base_final_acreage, scen_final_acreage),
        "price_change_pct": pct_change(base_final_price, scen_final_price),
        "volatility_change_pct": volatility_change_pts,
    }
