"""
Pydantic request/response models for Mandi Mirror.
These define the API contract described in the Phase 1 design doc.
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator

Crop = Literal["onion", "tomato"]


class FarmerMix(BaseModel):
    risk_averse: float = Field(..., ge=0, le=100)
    trend_chasing: float = Field(..., ge=0, le=100)
    msp_informed: float = Field(..., ge=0, le=100)

    @field_validator("msp_informed")
    @classmethod
    def _check_sum(cls, v, info):
        total = v + info.data.get("risk_averse", 0) + info.data.get("trend_chasing", 0)
        if abs(total - 100) > 0.5:
            raise ValueError(
                f"Farmer mix percentages must sum to 100 (got {total:.1f}). "
                "Adjust risk_averse / trend_chasing / msp_informed so they add up."
            )
        return v


class SimulationParams(BaseModel):
    crop: Crop
    seasons: int = Field(10, ge=1, le=30)
    rainfall_deviation: float = Field(0, ge=-50, le=50)  # percent
    msp_change: float = Field(0, ge=-20, le=50)          # percent
    demand_shift: float = Field(0, ge=-30, le=30)        # percent
    farmer_mix: FarmerMix


class SeasonPoint(BaseModel):
    season: int
    price: float
    acreage: float
    production: float
    demand: float


class RunResult(BaseModel):
    seasons: List[SeasonPoint]
    volatility: float
    risk_score: int
    risk_label: Literal["LOW", "MEDIUM", "HIGH"]


class ConfidenceInfo(BaseModel):
    level: Literal["LOW", "MEDIUM", "HIGH"]
    basis: Literal["demo", "calibrated"]
    explanation: str


class ImpactSummary(BaseModel):
    acreage_change_pct: float
    price_change_pct: float
    volatility_change_pct: float = Field(
        ..., description="Change in volatility expressed in percentage POINTS, not a relative percent "
                          "(baseline volatility is often near-zero, which would make a relative percent misleading)."
    )


class SimulationResponse(BaseModel):
    crop: Crop
    baseline: RunResult
    scenario: RunResult
    impact: ImpactSummary
    confidence: ConfidenceInfo
    advisory: str
    data_source: Literal["demo"] = "demo"


class PolicyRequest(BaseModel):
    crop: Crop
    seasons: int = Field(8, ge=1, le=30)
    policy: Literal["msp_increase", "msp_decrease", "demand_increase", "demand_decrease", "rainfall_shock"]
    magnitude: float = Field(..., description="Percent magnitude of the policy lever, e.g. 15 for +15%")
    farmer_mix: Optional[FarmerMix] = None


class PolicyResponse(BaseModel):
    crop: Crop
    baseline: RunResult
    scenario: RunResult
    impact: ImpactSummary
    interpretation: str
    advisory: str
    data_source: Literal["demo"] = "demo"


class CrisisRequest(BaseModel):
    crop: Crop = "onion"
    crisis: Literal["2019", "2023"]


class CrisisResponse(BaseModel):
    crop: Crop
    crisis: str
    narrative: List[str]
    historical: List[SeasonPoint]
    simulated: List[SeasonPoint]
    disclaimer: str
    data_source: Literal["demo"] = "demo"
