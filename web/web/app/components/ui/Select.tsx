'use client'

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }

export default function Select({ label, className, children, ...rest }: Props) {
  return (
    <label className="block">
      {label && (
        <div className="mb-2 text-base font-semibold text-neutral-700">
          {label}
        </div>
      )}
               <select
                 {...rest}
                 onFocus={(e) => {
                   // 모바일에서 입력 필드 포커스 시 자동 스크롤
                   if (typeof window !== 'undefined' && window.innerWidth < 768) {
                     setTimeout(() => {
                       e.target.scrollIntoView({
                         behavior: 'smooth',
                         block: 'center',
                       })
                     }, 300)
                   }
                   rest.onFocus?.(e)
                 }}
                 className={`w-full h-11 rounded-lg border border-neutral-400 bg-white px-3 text-base sm:text-sm text-neutral-900 outline-none shadow-sm transition-all duration-200 hover:border-neutral-500 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 cursor-pointer touch-manipulation ${className || ''}`}
                 autoComplete="off"
               >
        {children}
      </select>
    </label>
  )
}



