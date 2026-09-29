export function formatRupees(value) {
  if (value === null || value === undefined) return '—'
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function formatTonnes(value) {
  if (value === null || value === undefined) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M t`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K t`
  return `${Math.round(value)} t`
}

export function formatHectares(value) {
  if (value === null || value === undefined) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M ha`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ha`
  return `${Math.round(value)} ha`
}

export function formatPct(value, opts = {}) {
  if (value === null || value === undefined) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(opts.decimals ?? 1)}%`
}
