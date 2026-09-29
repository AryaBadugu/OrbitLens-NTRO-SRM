"""
Volatility, risk score, and confidence indicator calculations.

All outputs here are simulation-derived indicators, not officially
validated government risk metrics - this is stated explicitly in the
advisory text and in /api/model-info.
"""
import numpy as np


def calculate_volatility(prices: list) -> float:
    """Std deviation of season-over-season percentage price changes."""
    if len(prices) < 2:
        return 0.0
    arr = np.array(prices, dtype=float)
    pct_changes = np.diff(arr) / arr[:-1]
    return float(np.std(pct_changes))


def calculate_risk_score(volatility: float, prices: list, msp: float) -> int:
    """
    Composite 0-100 risk score from three normalized components:
      - volatility (season-over-season swings)
      - how far prices deviate from the MSP band
      - extremity of the price range across the run (proxy for supply/demand gap)
    """
    vol_component = min(volatility / 0.5, 1.0)  # 50% swing volatility -> saturates at 1.0

    if prices and msp:
        deviations = [abs(p - msp) / msp for p in prices]
        msp_component = min(float(np.mean(deviations)) / 0.6, 1.0)
    else:
        msp_component = 0.0

    if prices:
        price_range = (max(prices) - min(prices)) / (np.mean(prices) or 1)
        range_component = min(price_range / 1.2, 1.0)
    else:
        range_component = 0.0

    composite = 0.5 * vol_component + 0.3 * msp_component + 0.2 * range_component
    return int(round(composite * 100))


def risk_label(score: int) -> str:
    if score >= 66:
        return "HIGH"
    if score >= 33:
        return "MEDIUM"
    return "LOW"


def confidence_indicator(seasons: int) -> dict:
    """
    Demo confidence indicator. Not derived from real calibration data -
    explicitly labeled as such so it is never mistaken for a validated metric.
    """
    # Slightly more "confidence" with more seasons simulated, purely as a
    # illustrative placeholder; real confidence requires historical calibration.
    base_fit = 0.71
    level = "MEDIUM"
    if seasons >= 15:
        level = "MEDIUM"
    elif seasons < 4:
        level = "LOW"
    return {
        "level": level,
        "basis": "demo",
        "explanation": f"Historical calibration explains {int(base_fit*100)}% of observed "
                        f"variation (demo value - not derived from validated calibration data).",
    }
