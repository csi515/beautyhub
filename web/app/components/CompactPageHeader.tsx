export default function CompactPageHeader({ 
  title, 
  filters, 
  actions 
}: { 
  title: string
  filters?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="-mx-4 md:-mx-0 bg-white/90 backdrop-blur-sm border-b border-neutral-200 shadow-sm sticky top-10 z-sticky">
      <div className="container py-1.5 px-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <h1 className="text-lg md:text-xl font-bold text-neutral-900 break-words leading-tight tracking-tight">
              {title}
            </h1>
            {filters && (
              <div className="flex-1 min-w-0">
                {filters}
              </div>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

