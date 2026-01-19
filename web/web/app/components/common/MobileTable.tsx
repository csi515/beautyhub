'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

type MobileTableColumn<T> = {
  key: keyof T | string
  header: string
  render?: (item: T, index: number) => ReactNode
  primary?: boolean // 모바일에서 주요 컬럼으로 표시
  className?: string
}

type MobileTableProps<T> = {
  columns: MobileTableColumn<T>[]
  data: T[]
  onRowClick?: (item: T, index: number) => void
  emptyMessage?: string
  className?: string
}

/**
 * 모바일 최적화 테이블 컴포넌트
 * 모바일에서는 카드 뷰로, 데스크톱에서는 테이블로 표시
 */
export default function MobileTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = '데이터가 없습니다.',
  className = '',
}: MobileTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={`text-center py-12 text-neutral-500 ${className}`}>
        {emptyMessage}
      </div>
    )
  }

  const primaryColumn = columns.find(col => col.primary) || columns[0]
  if (!primaryColumn) return null
  const secondaryColumns = columns.filter(col => col !== primaryColumn)

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <div className={`md:hidden space-y-3 scroll-container ${className}`}>
        {data.map((item, rowIdx) => (
          <div
            key={rowIdx}
            onClick={() => onRowClick?.(item, rowIdx)}
            className={clsx(
              'bg-white rounded-xl border border-neutral-200 shadow-sm p-4 transition-all duration-200',
              onRowClick && [
                'cursor-pointer',
                'hover:shadow-md hover:border-neutral-300',
                'active:scale-[0.98] active:shadow-sm',
                'touch-manipulation',
                'focus-visible:ring-2 focus-visible:ring-secondary-300 focus-visible:ring-offset-2',
              ]
            )}
            role={onRowClick ? 'button' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onRowClick(item, rowIdx)
              }
            }}
            aria-label={onRowClick ? `행 ${rowIdx + 1} 클릭` : undefined}
          >
            {/* 주요 컬럼 (큰 텍스트) */}
            <div className="mb-3 pb-3 border-b border-neutral-100">
              <div className="text-base font-semibold text-neutral-900">
                {primaryColumn.render
                  ? primaryColumn.render(item, rowIdx)
                  : String(item[primaryColumn.key as keyof T] ?? '')}
              </div>
            </div>

            {/* 나머지 컬럼들 */}
            <div className="space-y-2">
              {secondaryColumns.map((col, colIdx) => {
                const value = col.render
                  ? col.render(item, rowIdx)
                  : String(item[col.key as keyof T] ?? '')
                
                return (
                  <div
                    key={colIdx}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="text-xs font-medium text-neutral-500 flex-shrink-0">
                      {col.header}
                    </span>
                    <div className={clsx(
                      'text-sm text-neutral-700 text-right flex-1 min-w-0',
                      col.className
                    )}>
                      {value}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 뷰 */}
      <div className={`hidden md:block overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-md scroll-container ${className}`}>
        <table className="w-full border-collapse" role="table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-sm font-medium text-neutral-900 bg-neutral-100 border-b border-neutral-200 text-left"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick?.(item, rowIdx)}
                className={clsx(
                  'border-b border-neutral-200 transition-colors duration-300',
                  onRowClick && [
                    'cursor-pointer',
                    'hover:bg-neutral-50',
                    'active:bg-neutral-100',
                    'touch-manipulation',
                  ]
                )}
                role={onRowClick ? 'row' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onRowClick(item, rowIdx)
                  }
                }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={clsx(
                      'px-4 py-3 text-sm text-neutral-800',
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(item, rowIdx)
                      : String(item[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

