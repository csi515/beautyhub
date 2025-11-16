export default function MetricCard({
  label,
  value,
  delta,
  hint,
  className = '',
  colorIndex = 0,
}: {
  label: string
  value: string | number
  delta?: { value: string; tone?: 'up' | 'down' | 'neutral' }
  hint?: string
  className?: string
  colorIndex?: number
}) {
  const toneCls =
    delta?.tone === 'up'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : delta?.tone === 'down'
      ? 'text-rose-600 bg-rose-50 border-rose-200'
      : 'text-neutral-600 bg-neutral-50 border-neutral-200'
  
  const colorSchemes = [
    { bg: 'bg-gradient-to-br from-pink-50 to-rose-100', border: 'border-pink-200', text: 'text-pink-700' },
    { bg: 'bg-gradient-to-br from-blue-50 to-cyan-100', border: 'border-blue-200', text: 'text-blue-700' },
    { bg: 'bg-gradient-to-br from-emerald-50 to-teal-100', border: 'border-emerald-200', text: 'text-emerald-700' },
    { bg: 'bg-gradient-to-br from-amber-50 to-yellow-100', border: 'border-amber-200', text: 'text-amber-700' },
    { bg: 'bg-gradient-to-br from-purple-50 to-violet-100', border: 'border-purple-200', text: 'text-purple-700' },
    { bg: 'bg-gradient-to-br from-indigo-50 to-blue-100', border: 'border-indigo-200', text: 'text-indigo-700' },
  ]
  
  const scheme = colorSchemes[colorIndex % colorSchemes.length]
  
  return (
    <div className={`${scheme.bg} rounded-xl border-2 ${scheme.border} shadow-md hover:shadow-lg transition-all duration-300 p-4 md:p-6 ${className}`}>
      <div className={`text-sm font-medium ${scheme.text} opacity-80`}>{label}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className={`text-2xl md:text-3xl font-bold tracking-tight ${scheme.text}`}>{value}</div>
        {delta?.value && (
          <span className={`text-xs inline-flex items-center rounded-full px-2 py-0.5 border ${toneCls}`}>{delta.value}</span>
        )}
      </div>
      {hint && <div className={`mt-2 text-xs ${scheme.text} opacity-70`}>{hint}</div>}
    </div>
  )
}


