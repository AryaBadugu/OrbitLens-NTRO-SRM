"""
Optional calibration hooks.

The core Mandi Mirror model is a cobweb / difference-equation system
(see cobweb_model.py). Regression can optionally be used to fit the
sensitivity constants (alpha_tc, alpha_ra, alpha_msp, gamma) against real
historical data when it becomes available. This module is a placeholder
so that real datasets can later replace the demo CSVs without changing
the simulation architecture.
"""
import numpy as np


def fit_price_sensitivity(historical_prices: list, historical_acreage: list) -> float:
    """
    Very simple linear-regression style calibration example: estimate how
    strongly acreage responded to price changes historically. Returns a
    single elasticity-like coefficient. This is NOT wired into the live
    simulation by default - it's provided as a starting point for real
    calibration work once genuine Agmarknet/IMD data is available.
    """
    if len(historical_prices) < 3 or len(historical_prices) != len(historical_acreage):
        return 0.0
    price_pct = np.diff(historical_prices) / np.array(historical_prices[:-1])
    acreage_pct = np.diff(historical_acreage) / np.array(historical_acreage[:-1])
    if np.std(price_pct) == 0:
        return 0.0
    coef = np.polyfit(price_pct, acreage_pct, 1)[0]
    return float(coef)
