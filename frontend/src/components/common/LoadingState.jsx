import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

const STAGES = [
  'Simulating farmer behaviour…',
  'Calculating production…',
  'Estimating market response…',
  'Generating scenario insights…',
]

export default function LoadingState() {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 550)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <Loader2 className="w-6 h-6 text-mandi-500 animate-spin mb-3" />
      <p className="text-sm font-medium text-mandi-700">{STAGES[stage]}</p>
    </div>
  )
}
