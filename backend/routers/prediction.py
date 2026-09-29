from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel
from services.prediction_service import predict_commodity_price

router = APIRouter(prefix="/api/prediction", tags=["prediction"])


class PredictionRequest(BaseModel):
    commodity: str = "Onion"
    state: Optional[str] = None
    district: Optional[str] = None
    horizon_days: int = 7


@router.get("/predict")
def api_predict_price_get(
    commodity: str = Query("Onion"),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    horizon_days: int = Query(7, ge=1, le=30)
):
    return predict_commodity_price(
        commodity=commodity,
        state=state,
        district=district,
        horizon_days=horizon_days
    )


@router.post("/predict")
def api_predict_price_post(req: PredictionRequest):
    return predict_commodity_price(
        commodity=req.commodity,
        state=req.state,
        district=req.district,
        horizon_days=req.horizon_days
    )
