export default function PageHeader({ title, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="-mx-4 md:-mx-0 bg-white/90 backdrop-blur-sm border-b border-neutral-200 shadow-sm sticky top-10 z-sticky">
      <div className="container py-1.5 md:py-2 px-3 md:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-bold text-neutral-900 break-words leading-tight tracking-tight">
              {title}
            </h1>
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


