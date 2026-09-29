const STEPS = ['Previous Price', 'Farmer Decisions', 'Acreage', 'Production', 'Supply vs Demand', 'Market Price']

export default function FeedbackLoopDiagram() {
  return (
    <div className="flex flex-col items-center py-4">
      <div className="flex flex-wrap justify-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className="px-3 py-2 rounded-xl bg-mandi-50 border border-mandi-100 text-xs font-medium text-mandi-700 text-center min-w-[92px]">
              {step}
            </div>
            {i < STEPS.length - 1 && <span className="mx-1.5 text-mandi-300">→</span>}
          </div>
        ))}
      </div>
      <div className="flex items-center mt-2 text-mandi-400 text-xs gap-1">
        <span>↺ feeds back into</span>
        <span className="font-semibold text-mandi-600">Farmer Decisions</span>
        <span>next season</span>
      </div>
    </div>
  )
}
