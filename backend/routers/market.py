from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from services.agmarknet_service import (
    get_market_prices,
    get_nearest_markets,
    get_upstream_status,
    test_upstream_connectivity,
    sync_market_data
)
from database.db import get_connection

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/prices")
def api_get_market_prices(
    commodity: Optional[str] = Query(None, description="Commodity name e.g. Onion, Tomato"),
    state: Optional[str] = Query(None, description="State name e.g. Maharashtra"),
    district: Optional[str] = Query(None, description="District name e.g. Nashik"),
    market: Optional[str] = Query(None, description="Mandi/Market name"),
    limit: int = Query(50, ge=1, le=500)
):
    return get_market_prices(
        commodity=commodity,
        state=state,
        district=district,
        market=market,
        limit=limit
    )


@router.get("/markets")
def api_get_markets():
    conn = get_connection()
    rows = conn.execute("""
        SELECT DISTINCT market, district, state, latitude, longitude
        FROM agmarknet_records
        ORDER BY state, district, market
    """).fetchall()
    conn.close()
    
    return {
        "source": "Government of India OGD / AGMARKNET",
        "count": len(rows),
        "markets": [dict(r) for r in rows]
    }


@router.get("/nearest")
def api_get_nearest_markets(
    latitude: float = Query(..., description="Latitude of location"),
    longitude: float = Query(..., description="Longitude of location"),
    commodity: Optional[str] = Query(None, description="Commodity filter"),
    limit: int = Query(5, ge=1, le=50)
):
    if not (-90.0 <= latitude <= 90.0) or not (-180.0 <= longitude <= 180.0):
        raise HTTPException(status_code=400, detail="Invalid latitude/longitude coordinates.")
        
    return get_nearest_markets(
        lat=latitude,
        lon=longitude,
        commodity=commodity,
        limit=limit
    )


@router.get("/status")
def api_get_market_status():
    return get_upstream_status()


@router.get("/upstream-test")
def api_test_upstream():
    return test_upstream_connectivity()


@router.post("/sync")
def api_sync_market_data(
    limit: int = Query(200, ge=1, le=1000),
    commodity: Optional[str] = Query(None)
):
    result = sync_market_data(limit=limit, commodity=commodity)
    if not result["success"]:
        raise HTTPException(
            status_code=result.get("status_code", 502),
            detail={
                "error": "AGMARKNET_SYNC_FAILED",
                "message": result.get("error", "Upstream AGMARKNET synchronization failed"),
                "source": "data.gov.in / AGMARKNET",
                "retryable": True
            }
        )
    return result
