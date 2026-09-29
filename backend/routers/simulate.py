from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from schemas.models import SimulationParams, SimulationResponse
from simulation.cobweb_model import run_simulation, compute_impact, CROP_PARAMS
from simulation.risk_model import confidence_indicator
from simulation.advisory import generate_advisory
from database.db import save_run

router = APIRouter(prefix="/api", tags=["simulate"])


def _baseline_params(params: SimulationParams) -> dict:
    """Baseline = no rainfall/MSP/demand shocks, default 50/30/20-ish neutral mix
    is NOT forced - baseline uses the same farmer mix as scenario so the
    comparison isolates the effect of the external shocks, matching the
    proposal's 'baseline vs scenario' framing."""
    return dict(
        crop=params.crop, seasons=params.seasons,
        rainfall_deviation=0, msp_change=0, demand_shift=0,
        farmer_mix=params.farmer_mix.model_dump(),
    )


def _scenario_params(params: SimulationParams) -> dict:
    return dict(
        crop=params.crop, seasons=params.seasons,
        rainfall_deviation=params.rainfall_deviation,
        msp_change=params.msp_change, demand_shift=params.demand_shift,
        farmer_mix=params.farmer_mix.model_dump(),
    )


@router.post("/simulate", response_model=SimulationResponse)
def simulate(params: SimulationParams):
    if params.crop not in CROP_PARAMS:
        raise HTTPException(status_code=400, detail=f"Unsupported crop: {params.crop}")

    baseline = run_simulation(**_baseline_params(params))
    scenario = run_simulation(**_scenario_params(params))
    impact = compute_impact(baseline, scenario)
    confidence = confidence_indicator(params.seasons)
    advisory = generate_advisory(params.crop, impact, scenario["risk_label"])

    result = {
        "crop": params.crop,
        "baseline": baseline,
        "scenario": scenario,
        "impact": impact,
        "confidence": confidence,
        "advisory": advisory,
        "data_source": "demo",
    }
    try:
        save_run(params.crop, params.model_dump(), result)
    except Exception:
        pass  # run caching is best-effort, never block the response
    return result


@router.post("/simulate/baseline")
def simulate_baseline(params: SimulationParams):
    return run_simulation(**_baseline_params(params))


@router.post("/simulate/scenario")
def simulate_scenario(params: SimulationParams):
    return run_simulation(**_scenario_params(params))
