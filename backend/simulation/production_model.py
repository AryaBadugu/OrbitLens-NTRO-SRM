"""
Production model: acreage -> yield -> production, with a rainfall shock.
"""

def calculate_yield(base_yield: float, rainfall_deviation_pct: float, rainfall_sensitivity: float) -> float:
    """
    rainfall_deviation_pct: -50..+50, percent deviation from normal rainfall.
    rainfall_sensitivity: crop-specific factor for how much yield moves per
    1% of rainfall deviation (kept small; excess or deficit rainfall both
    reduce yield in reality, but this simplified model treats the sign as
    provided by the user - a negative deviation always reduces yield here
    for tractability, matching common cobweb-model teaching examples).
    """
    # Any deviation from "normal" (0%) is treated as yield-reducing, scaled by sensitivity.
    penalty = -abs(rainfall_deviation_pct) * rainfall_sensitivity
    # A mild deficit is worse than a mild surplus for onion/tomato in practice,
    # so we let negative deviations bite slightly harder.
    if rainfall_deviation_pct < 0:
        penalty *= 1.15
    return max(base_yield * (1 + penalty / 100.0), base_yield * 0.2)


def calculate_production(acreage_hectares: float, yield_per_hectare: float) -> float:
    return max(acreage_hectares * yield_per_hectare, 0.0)
