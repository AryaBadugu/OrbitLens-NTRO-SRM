export default function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-3">
          <div>
            {title && <h3 className="font-semibold text-mandi-900">{title}</h3>}
            {subtitle && <p className="text-xs text-mandi-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
