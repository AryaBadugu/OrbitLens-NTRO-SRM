from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from services.imd_service import (
    get_current_weather,
    get_city_forecast,
    get_district_rainfall,
    get_weather_warnings
)

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("/current")
def api_get_current_weather(
    location: Optional[str] = Query(None, description="City/District name e.g. Nashik"),
    latitude: Optional[float] = Query(None, description="Latitude"),
    longitude: Optional[float] = Query(None, description="Longitude")
):
    if latitude is not None and not (-90.0 <= latitude <= 90.0):
        raise HTTPException(status_code=400, detail="Invalid latitude.")
    if longitude is not None and not (-180.0 <= longitude <= 180.0):
        raise HTTPException(status_code=400, detail="Invalid longitude.")
        
    return get_current_weather(location=location, lat=latitude, lon=longitude)


@router.get("/city-forecast")
def api_get_city_forecast(
    city: str = Query("Nashik", description="City name"),
    days: int = Query(5, ge=1, le=14)
):
    return get_city_forecast(city=city, days=days)


@router.get("/district-rainfall")
def api_get_district_rainfall(
    district: str = Query("Nashik", description="District name")
):
    return get_district_rainfall(district=district)


@router.get("/warnings")
def api_get_weather_warnings(
    district: str = Query("Nashik", description="District name")
):
    return get_weather_warnings(district=district)
