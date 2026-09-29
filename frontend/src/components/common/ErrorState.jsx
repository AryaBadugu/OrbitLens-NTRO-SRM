import { AlertTriangle } from 'lucide-react'

export default function ErrorState({ message }) {
  return (
    <div className="card border-red-200 bg-red-50 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-red-700 text-sm">Couldn't run the simulation</p>
        <p className="text-sm text-red-600 mt-0.5">{message}</p>
      </div>
    </div>
  )
}
