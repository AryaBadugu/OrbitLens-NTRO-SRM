export function farmerMixSum(mix) {
  return (mix.risk_averse || 0) + (mix.trend_chasing || 0) + (mix.msp_informed || 0)
}

export function isFarmerMixValid(mix) {
  return Math.abs(farmerMixSum(mix) - 100) < 0.5
}
