'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  showInfo?: boolean
}

/**
 * 통합 페이지네이션 컴포넌트
 * 일관된 디자인과 반응형 레이아웃
 */
export default function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
  showInfo = true,
}: PaginationProps) {
  const showingFrom = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const showingTo = Math.min(page * pageSize, totalItems)

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 border-t border-neutral-200 bg-neutral-50 ${className}`}>
      {/* 정보 표시 */}
      {showInfo && (
        <div className="text-xs sm:text-sm text-neutral-600">
          총 {totalItems.toLocaleString()}개 · {showingFrom.toLocaleString()}-{showingTo.toLocaleString()} 표시 · {page}/{totalPages} 페이지
        </div>
      )}

      {/* 컨트롤 */}
      <div className="flex items-center gap-2">
        {/* 페이지 크기 선택 */}
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value))
              onPageChange(1) // 페이지 크기 변경 시 첫 페이지로
            }}
            className="h-9 rounded-lg border border-neutral-300 px-3 text-sm bg-white text-neutral-900 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 outline-none transition-all duration-200 touch-manipulation"
            aria-label="페이지당 항목 수"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}/페이지
              </option>
            ))}
          </select>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 touch-manipulation"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* 페이지 번호 표시 (선택적) */}
          {totalPages <= 10 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`h-9 min-w-[36px] px-2 rounded-lg border text-sm font-medium transition-all duration-200 touch-manipulation ${
                    p === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400'
                  }`}
                  aria-label={`${p}페이지로 이동`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 touch-manipulation"
            aria-label="다음 페이지"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

