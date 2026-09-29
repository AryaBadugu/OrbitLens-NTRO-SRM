import os
import pytest
from fastapi.testclient import TestClient
from main import app
from services.agmarknet_service import fetch_from_agmarknet, seed_demo_historical_records_if_empty

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    seed_demo_historical_records_if_empty()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "diagnostics" in data
    assert data["diagnostics"]["application"] == "healthy"
    assert data["diagnostics"]["database"] == "connected"

def test_crops_endpoint():
    response = client.get("/api/crops")
    assert response.status_code == 200
    data = response.json()
    assert "crops" in data
    assert len(data["crops"]) > 0

def test_market_status():
    response = client.get("/api/market/status")
    assert response.status_code == 200
    data = response.json()
    assert "api_key_configured" in data
    assert "cached_record_count" in data
    assert data["cached_record_count"] >= 0

def test_market_upstream_test():
    response = client.get("/api/market/upstream-test")
    assert response.status_code == 200
    data = response.json()
    assert "ok" in data
    assert "elapsed_ms" in data

def test_market_prices_default():
    response = client.get("/api/market/prices")
    assert response.status_code == 200
    data = response.json()
    assert "records" in data
    assert "source" in data
    assert "data_status" in data

def test_market_prices_filtering():
    response = client.get("/api/market/prices?commodity=Onion&state=Maharashtra")
    assert response.status_code == 200
    data = response.json()
    assert "records" in data
    for r in data["records"]:
        assert r["commodity"].lower() == "onion"

def test_nearest_mandi():
    response = client.get("/api/market/nearest?latitude=19.99&longitude=73.78&commodity=Onion")
    assert response.status_code == 200
    data = response.json()
    assert "nearest_markets" in data
    assert len(data["nearest_markets"]) > 0
    first = data["nearest_markets"][0]
    assert "distance_km" in first
    assert "modal_price" in first
    assert "coordinates" in first

def test_invalid_coordinates():
    response = client.get("/api/market/nearest?latitude=999.0&longitude=73.78")
    assert response.status_code == 400
    assert "Invalid latitude/longitude" in response.json()["detail"]

def test_weather_endpoints():
    current_res = client.get("/api/weather/current?location=Nashik")
    assert current_res.status_code == 200
    assert "temperature" in current_res.json()
    
    forecast_res = client.get("/api/weather/city-forecast?city=Nashik&days=3")
    assert forecast_res.status_code == 200
    assert "forecast" in forecast_res.json()

    warnings_res = client.get("/api/weather/warnings?district=Nashik")
    assert warnings_res.status_code == 200
    assert "warnings" in warnings_res.json()

def test_prediction_endpoint():
    res = client.get("/api/prediction/predict?commodity=Onion&district=Nashik")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["success", "insufficient_historical_data"]
    if data["status"] == "success":
        assert "predicted_price" in data
        assert "model" in data

def test_chatbot_endpoint():
    res = client.post("/api/chat", json={"message": "Where is the nearest onion mandi?", "latitude": 19.99, "longitude": 73.78})
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert "citations" in data
    assert len(data["citations"]) > 0

def test_api_key_missing_behavior(monkeypatch):
    monkeypatch.setenv("DATA_GOV_IN_API_KEY", "")
    res = fetch_from_agmarknet(limit=1)
    assert res["ok"] is False
    assert res["status_code"] == 401
