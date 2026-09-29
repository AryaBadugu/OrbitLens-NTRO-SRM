import os
import json
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx
from dotenv import load_dotenv
from database.db import get_connection, init_db

load_dotenv()
init_db()

logger = logging.getLogger("krishipulse.imd")
logger.setLevel(logging.INFO)

# Default coordinates for key agricultural districts in India
DISTRICT_COORDINATES: Dict[str, Dict[str, float]] = {
    "nashik": {"lat": 19.9975, "lon": 73.7898, "state": "Maharashtra"},
    "delhi": {"lat": 28.7061, "lon": 77.1812, "state": "Delhi"},
    "kolar": {"lat": 13.1368, "lon": 78.1291, "state": "Karnataka"},
    "guntur": {"lat": 16.3067, "lon": 80.4365, "state": "Andhra Pradesh"},
    "indore": {"lat": 22.7196, "lon": 75.8577, "state": "Madhya Pradesh"},
    "surat": {"lat": 21.1702, "lon": 72.8311, "state": "Gujarat"},
    "khanna": {"lat": 30.7024, "lon": 76.2205, "state": "Punjab"},
    "karnal": {"lat": 29.6857, "lon": 76.9905, "state": "Haryana"},
    "shimla": {"lat": 31.1048, "lon": 77.1734, "state": "Himachal Pradesh"},
    "mysore": {"lat": 12.2958, "lon": 76.6394, "state": "Karnataka"},
    "agra": {"lat": 27.1767, "lon": 78.0081, "state": "Uttar Pradesh"},
}

def resolve_location_coords(location: Optional[str], lat: Optional[float], lon: Optional[float]) -> Dict[str, Any]:
    if lat is not None and lon is not None:
        return {"lat": lat, "lon": lon, "name": location or f"{lat:.2f},{lon:.2f}"}
    
    loc_key = (location or "nashik").lower().strip()
    if loc_key in DISTRICT_COORDINATES:
        info = DISTRICT_COORDINATES[loc_key]
        return {"lat": info["lat"], "lon": info["lon"], "name": location.capitalize() if location else "Nashik"}
    
    # Default to Nashik
    return {"lat": 19.9975, "lon": 73.7898, "name": location or "Nashik"}


def fetch_live_weather(lat: float, lon: float) -> Dict[str, Any]:
    """Fetches real weather data using Open-Meteo / IMD gridded parameters."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": str(lat),
        "longitude": str(lon),
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
        "timezone": "Asia/Kolkata"
    }
    
    try:
        with httpx.Client(timeout=8.0) as client:
            res = client.get(url, params=params)
            if res.status_code == 200:
                data = res.json()
                current = data.get("current", {})
                daily = data.get("daily", {})
                
                precip = current.get("precipitation", 0.0)
                temp = current.get("temperature_2m", 25.0)
                humidity = current.get("relative_humidity_2m", 65.0)
                
                # Check for weather warnings based on precipitation/temperature extremes
                warnings = []
                if precip > 50:
                    warnings.append({"severity": "HIGH", "type": "HEAVY_RAINFALL", "message": "Heavy rainfall alert: Risk of crop inundation."})
                elif precip > 20:
                    warnings.append({"severity": "MEDIUM", "type": "MODERATE_RAINFALL", "message": "Moderate rainfall expected: Adjust irrigation schedule."})
                    
                if temp > 40:
                    warnings.append({"severity": "HIGH", "type": "HEATWAVE", "message": "Heatwave warning: Protect young saplings and increase watering."})
                elif temp < 5:
                    warnings.append({"severity": "HIGH", "type": "FROST_ALERT", "message": "Frost alert: Risk of cold damage to winter crops."})

                return {
                    "ok": True,
                    "temperature": temp,
                    "humidity": humidity,
                    "rainfall": precip,
                    "wind_speed_kmh": current.get("wind_speed_10m", 10.0),
                    "daily": daily,
                    "warnings": warnings,
                    "source": "India Meteorological Department / Open-Meteo Gridded Weather Data"
                }
    except Exception as exc:
        logger.warning(f"[WEATHER] Upstream weather fetch failed for {lat},{lon}: {exc}")
        
    return {"ok": False}


def get_cached_weather(loc_key: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT data_json, fetched_at FROM weather_cache WHERE location_key = ?", (loc_key,)).fetchone()
    conn.close()
    if row:
        data = json.loads(row["data_json"])
        data["fetched_at"] = row["fetched_at"]
        data["data_status"] = "cached"
        return data
    return None


def save_cached_weather(loc_key: str, data: Dict[str, Any]):
    conn = get_connection()
    now_iso = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "INSERT OR REPLACE INTO weather_cache (location_key, data_json, fetched_at) VALUES (?, ?, ?)",
        (loc_key, json.dumps(data), now_iso)
    )
    conn.commit()
    conn.close()


def get_current_weather(location: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
    coords = resolve_location_coords(location, lat, lon)
    loc_key = f"{coords['lat']:.2f}:{coords['lon']:.2f}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    live = fetch_live_weather(coords["lat"], coords["lon"])
    if live["ok"]:
        payload = {
            "source": live["source"],
            "data_status": "live",
            "location": coords["name"],
            "coordinates": {"latitude": coords["lat"], "longitude": coords["lon"]},
            "temperature": live["temperature"],
            "humidity": live["humidity"],
            "rainfall": live["rainfall"],
            "wind_speed_kmh": live["wind_speed_kmh"],
            "warnings": live["warnings"],
            "timestamp": now_iso
        }
        save_cached_weather(loc_key, payload)
        return payload
        
    # Fallback to cache if available
    cached = get_cached_weather(loc_key)
    if cached:
        return cached
        
    # Fallback response when both live and cache are unavailable
    return {
        "source": "India Meteorological Department",
        "data_status": "unavailable",
        "location": coords["name"],
        "coordinates": {"latitude": coords["lat"], "longitude": coords["lon"]},
        "temperature": 27.5,
        "humidity": 60.0,
        "rainfall": 0.0,
        "wind_speed_kmh": 12.0,
        "warnings": [],
        "timestamp": now_iso
    }


def get_city_forecast(city: str = "Nashik", days: int = 5) -> Dict[str, Any]:
    coords = resolve_location_coords(city, None, None)
    live = fetch_live_weather(coords["lat"], coords["lon"])
    now_iso = datetime.now(timezone.utc).isoformat()
    
    if live["ok"] and "daily" in live:
        daily = live["daily"]
        times = daily.get("time", [])[:days]
        max_temps = daily.get("temperature_2m_max", [])[:days]
        min_temps = daily.get("temperature_2m_min", [])[:days]
        rains = daily.get("precipitation_sum", [])[:days]
        
        forecast_days = []
        for i in range(len(times)):
            forecast_days.append({
                "date": times[i],
                "max_temp": max_temps[i] if i < len(max_temps) else 30.0,
                "min_temp": min_temps[i] if i < len(min_temps) else 20.0,
                "rainfall_mm": rains[i] if i < len(rains) else 0.0,
            })
            
        return {
            "source": "India Meteorological Department",
            "data_status": "live",
            "city": coords["name"],
            "coordinates": {"latitude": coords["lat"], "longitude": coords["lon"]},
            "forecast": forecast_days,
            "timestamp": now_iso
        }
        
    return {
        "source": "India Meteorological Department",
        "data_status": "unavailable",
        "city": coords["name"],
        "coordinates": {"latitude": coords["lat"], "longitude": coords["lon"]},
        "forecast": [],
        "timestamp": now_iso
    }


def get_district_rainfall(district: str = "Nashik") -> Dict[str, Any]:
    coords = resolve_location_coords(district, None, None)
    live = fetch_live_weather(coords["lat"], coords["lon"])
    now_iso = datetime.now(timezone.utc).isoformat()
    
    precip = live.get("rainfall", 0.0) if live.get("ok") else 0.0
    
    return {
        "source": "India Meteorological Department",
        "data_status": "live" if live.get("ok") else "cached",
        "district": coords["name"],
        "actual_rainfall_mm": precip,
        "normal_rainfall_mm": 12.5,
        "deviation_percentage": round(((precip - 12.5) / 12.5) * 100, 1) if precip > 0 else -100.0,
        "category": "Excess" if precip > 15 else ("Normal" if precip >= 8 else "Deficient"),
        "timestamp": now_iso
    }


def get_weather_warnings(district: str = "Nashik") -> Dict[str, Any]:
    coords = resolve_location_coords(district, None, None)
    live = fetch_live_weather(coords["lat"], coords["lon"])
    now_iso = datetime.now(timezone.utc).isoformat()
    
    warnings = live.get("warnings", []) if live.get("ok") else []
    
    return {
        "source": "India Meteorological Department",
        "data_status": "live" if live.get("ok") else "cached",
        "district": coords["name"],
        "warning_count": len(warnings),
        "warnings": warnings,
        "timestamp": now_iso
    }
