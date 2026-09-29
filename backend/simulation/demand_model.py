"""
Demand model - intentionally the simplest part of Mandi Mirror.
This is flagged as a documented limitation (see /api/model-info):
real demand depends on substitution, income, exports, storage, etc.,
which this MVP does not model.
"""

def calculate_demand(base_demand: float, demand_shift_pct: float,
                      last_price: float, ref_price: float,
                      price_elasticity: float = 0.15) -> float:
    """
    base_demand: baseline demand (tonnes) for the crop.
    demand_shift_pct: -30..+30, an exogenous shift the user sets (e.g. export
        demand surge, festival demand, substitution away from another crop).
    price_elasticity: mild own-price elasticity - demand softens a little
        when the previous price was unusually high.
    """
    exogenous = 1 + (demand_shift_pct / 100.0)
    price_effect = 1.0
    if ref_price:
        price_effect = 1 - price_elasticity * (last_price - ref_price) / ref_price
        price_effect = max(price_effect, 0.5)
    return max(base_demand * exogenous * price_effect, 0.0)
