"""
Farmer archetype acreage-response functions.

Each archetype represents a simplified behavioural rule for how a group of
farmers adjusts planting area in response to the previous season's price
signal. These are intentionally simple, documented, and configurable -
this is a scenario-exploration tool, not a calibrated econometric model.
"""
from dataclasses import dataclass

# Default sensitivity constants (elasticities). Overridable via CROP_PARAMS.
ALPHA_TREND_CHASING = 0.60   # strong, immediate reaction to last price
ALPHA_RISK_AVERSE = 0.20     # weak reaction, uses a smoothed price
ALPHA_MSP_INFORMED = 0.40    # reacts to expected profitability vs MSP floor


@dataclass
class FarmerMix:
    risk_averse: float
    trend_chasing: float
    msp_informed: float

    def as_weights(self):
        """Return archetype shares as fractions of 1.0 (input is 0-100)."""
        return (
            self.risk_averse / 100.0,
            self.trend_chasing / 100.0,
            self.msp_informed / 100.0,
        )


def trend_chasing_response(last_price: float, ref_price: float, alpha: float = ALPHA_TREND_CHASING) -> float:
    """Strongly responds to the previous season's high (or low) price."""
    if ref_price == 0:
        return 0.0
    return alpha * (last_price - ref_price) / ref_price


def risk_averse_response(smoothed_price: float, ref_price: float, alpha: float = ALPHA_RISK_AVERSE) -> float:
    """Weakly responds, and to a moving-average (smoothed) price rather than
    the raw last price - this dampens the swing relative to trend-chasers."""
    if ref_price == 0:
        return 0.0
    return alpha * (smoothed_price - ref_price) / ref_price


def msp_informed_response(last_price: float, msp: float, ref_profit_price: float,
                           alpha: float = ALPHA_MSP_INFORMED) -> float:
    """Responds to expected profitability, anchored to the MSP as a price floor:
    farmers expect at least MSP even if the open-market price was lower."""
    if ref_profit_price == 0:
        return 0.0
    expected_price = max(last_price, msp)
    return alpha * (expected_price - ref_profit_price) / ref_profit_price


def blended_acreage_response(mix: FarmerMix, last_price: float, smoothed_price: float,
                              msp: float, ref_price: float) -> float:
    """Combine the three archetype responses, weighted by population share."""
    w_ra, w_tc, w_msp = mix.as_weights()
    r_tc = trend_chasing_response(last_price, ref_price)
    r_ra = risk_averse_response(smoothed_price, ref_price)
    r_msp = msp_informed_response(last_price, msp, ref_price)
    return (w_ra * r_ra) + (w_tc * r_tc) + (w_msp * r_msp)
