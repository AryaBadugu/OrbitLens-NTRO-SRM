export default function Badge({ label, level = 'low', demo = false }) {
  if (demo) return <span className="badge badge-demo">Demo data</span>
  const cls = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' }[level?.toUpperCase()] || 'badge-low'
  return <span className={`badge ${cls}`}>{label}</span>
}
