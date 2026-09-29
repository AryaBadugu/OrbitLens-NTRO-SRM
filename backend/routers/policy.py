from fastapi import APIRouter, HTTPException

from schemas.models import PolicyRequest, PolicyResponse, FarmerMix
from simulation.cobweb_model import run_simulation, compute_impact, CROP_PARAMS
from simulation.advisory import generate_advisory

router = APIRouter(prefix="/api", tags=["policy"])

DEFAULT_MIX = {"risk_averse": 30, "trend_chasing": 50, "msp_informed": 20}


@router.post("/policy-simulation", response_model=PolicyResponse)
def policy_simulation(req: PolicyRequest):
    if req.crop not in CROP_PARAMS:
        raise HTTPException(status_code=400, detail=f"Unsupported crop: {req.crop}")

    mix = req.farmer_mix.model_dump() if req.farmer_mix else DEFAULT_MIX

    shocks = {"rainfall_deviation": 0, "msp_change": 0, "demand_shift": 0}
    if req.policy == "msp_increase":
        shocks["msp_change"] = abs(req.magnitude)
    elif req.policy == "msp_decrease":
        shocks["msp_change"] = -abs(req.magnitude)
    elif req.policy == "demand_increase":
        shocks["demand_shift"] = abs(req.magnitude)
    elif req.policy == "demand_decrease":
        shocks["demand_shift"] = -abs(req.magnitude)
    elif req.policy == "rainfall_shock":
        shocks["rainfall_deviation"] = -abs(req.magnitude)

    baseline = run_simulation(crop=req.crop, seasons=req.seasons,
                               rainfall_deviation=0, msp_change=0, demand_shift=0, farmer_mix=mix)
    scenario = run_simulation(crop=req.crop, seasons=req.seasons, farmer_mix=mix, **shocks)
    impact = compute_impact(baseline, scenario)
    advisory = generate_advisory(req.crop, impact, scenario["risk_label"])

    interpretation_map = {
        "msp_increase": "An MSP increase may encourage additional acreage. Higher acreage can increase production. If production exceeds demand, simulated prices may fall.",
        "msp_decrease": "An MSP decrease may discourage acreage expansion. Lower acreage can reduce production, which may support or raise simulated prices if demand holds steady.",
        "demand_increase": "A demand increase may support higher simulated prices, which could encourage farmers to expand acreage in subsequent seasons.",
        "demand_decrease": "A demand decrease may pressure simulated prices downward, which could discourage acreage expansion in subsequent seasons.",
        "rainfall_shock": "A rainfall deficit may reduce yields and production. Lower production against steady demand may push simulated prices upward and increase volatility.",
    }

    return {
        "crop": req.crop,
        "baseline": baseline,
        "scenario": scenario,
        "impact": impact,
        "interpretation": interpretation_map[req.policy],
        "advisory": advisory,
        "data_source": "demo",
    }
