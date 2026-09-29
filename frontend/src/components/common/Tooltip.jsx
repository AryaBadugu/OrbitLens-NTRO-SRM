import { useState } from 'react'
import { Info } from 'lucide-react'

export default function Tooltip({ text }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="text-mandi-400 hover:text-mandi-600 ml-1"
        aria-label="More info"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 text-xs bg-mandi-900 text-white rounded-lg px-3 py-2 shadow-lg">
          {text}
        </span>
      )}
    </span>
  )
}
