"""
Auto-generated plain-language policy advisory.

Rules followed strictly:
  - Never assert an outcome will definitely happen.
  - Always use hedged language: "may", "could", "simulation indicates".
  - Always tie the statement back to "under the selected assumptions".
"""

def generate_advisory(crop: str, impact: dict, risk_label: str) -> str:
    crop_name = crop.capitalize()
    acreage_change = impact["acreage_change_pct"]
    price_change = impact["price_change_pct"]
    vol_change = impact["volatility_change_pct"]

    acreage_phrase = (
        f"may increase by approximately {abs(acreage_change):.0f}%"
        if acreage_change > 0
        else f"may decrease by approximately {abs(acreage_change):.0f}%"
        if acreage_change < 0
        else "may remain broadly similar to baseline"
    )

    price_phrase = (
        f"could fall by roughly {abs(price_change):.0f}%"
        if price_change < 0
        else f"could rise by roughly {abs(price_change):.0f}%"
        if price_change > 0
        else "could stay close to baseline levels"
    )

    vol_phrase = (
        "market volatility may increase relative to baseline"
        if vol_change > 1
        else "market volatility may ease relative to baseline"
        if vol_change < -1
        else "market volatility may stay broadly in line with baseline"
    )

    risk_phrase = {
        "HIGH": "The simulation flags this scenario as HIGH risk, suggesting close monitoring may be warranted.",
        "MEDIUM": "The simulation flags this scenario as MEDIUM risk.",
        "LOW": "The simulation flags this scenario as LOW risk under the selected assumptions.",
    }[risk_label]

    return (
        f"Under the selected assumptions, {crop_name.lower()} acreage {acreage_phrase} "
        f"compared to baseline. If production moves faster than demand, simulated prices "
        f"{price_phrase}, and {vol_phrase}. {risk_phrase} "
        f"Policymakers may consider monitoring acreage intentions and demand conditions "
        f"before the harvest season. This is a simulation-derived indicator, not a guaranteed forecast."
    )
