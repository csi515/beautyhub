'use client'

import { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'

type PageHeaderProps = {
  title?: string
  icon?: ReactNode
  description?: string
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  filters?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * 통합 페이지 헤더 컴포넌트
 * 검색, 필터, 액션 버튼을 포함하는 일관된 헤더 디자인
 */
export default function PageHeader({
  title,
  icon,
  description,
  search,
  filters,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 shadow-sm p-3 sm:p-4 ${className}`}>
      {/* 제목 영역 */}
      {(title || icon) && (
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {icon && <div className="flex-shrink-0 text-blue-600">{icon}</div>}
            {title && (
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
                {title}
              </h1>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-neutral-600">{description}</p>
          )}
        </div>
      )}

      {/* 검색/필터/액션 영역 */}
      {(search || filters || actions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          {/* 검색 */}
          {search && (
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
                검색
              </label>
              <Input
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder || '검색어를 입력하세요'}
                fullWidth
                size="small"
                onFocus={(e) => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setTimeout(() => {
                      e.currentTarget.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      })
                    }, 300)
                  }
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
          )}

          {/* 필터 */}
          {filters && (
            <div className="w-full sm:w-auto">
              {filters}
            </div>
          )}

          {/* 액션 버튼 */}
          {actions && (
            <div className="flex items-end">
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 빠른 액션 버튼 생성 헬퍼
 */
export function createActionButton(
  label: string,
  onClick: () => void,
  variant: 'primary' | 'secondary' = 'primary',
  icon: ReactNode = <Plus className="h-4 w-4" />,
  disabled: boolean = false
) {
  return (
    <Button
      variant={variant}
      size="md"
      leftIcon={icon}
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto"
    >
      {label}
    </Button>
  )
}

