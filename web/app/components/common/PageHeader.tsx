'use client'

import { ReactNode, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useTheme, useMediaQuery } from '@mui/material'
import Button from '../ui/Button'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'

type PageHeaderProps = {
  title?: string
  icon?: ReactNode
  description?: string
  variant?: 'default' | 'sticky' | 'compact'
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  filters?: ReactNode
  actions?: ReactNode | ReactNode[]
  className?: string
  // MUI 스타일 옵션 (FinanceHeader 호환)
  useMUI?: boolean
  // 모바일에서 TopBar에 헤더 정보 전달 여부
  useMobileHeader?: boolean
  // 필터 Bottom Sheet 트리거 (모바일용)
  onFilterOpen?: () => void
  // 활성 필터 개수 (모바일용)
  filterBadge?: number
}

/**
 * 통합 페이지 헤더 컴포넌트
 * 검색, 필터, 액션 버튼을 포함하는 일관된 헤더 디자인
 * variant에 따라 다른 스타일 제공:
 * - default: 기본 카드 스타일 (rounded-xl, shadow-md)
 * - sticky: 고정 헤더 스타일 (sticky, border-b)
 * - compact: 간결한 헤더 스타일 (sticky, 필터와 제목이 한 줄)
 */
export default function PageHeader({
  title,
  icon,
  description,
  variant = 'default',
  search,
  filters,
  actions,
  className = '',
  useMUI = false,
  useMobileHeader = true,
  onFilterOpen,
  filterBadge,
}: PageHeaderProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { setHeaderInfo, clearHeaderInfo } = usePageHeader()

  // 모바일에서 Context에 헤더 정보 전달
  useEffect(() => {
    if (isMobile && useMobileHeader && title) {
      const handleFilterClick = () => {
        if (onFilterOpen) {
          onFilterOpen()
        }
        // filters prop이 있으면 onFilterOpen이 반드시 제공되어야 함
      }

      setHeaderInfo({
        title,
        icon,
        showBack: true, // 기본적으로 뒤로가기 표시
        onFilter: filters || onFilterOpen ? handleFilterClick : undefined,
        filterBadge,
        actions,
        description,
      })

      return () => {
        clearHeaderInfo()
      }
    } else {
      // 모바일이 아니거나 useMobileHeader가 false면 Context 클리어
      clearHeaderInfo()
      return () => {
        // cleanup 함수는 항상 반환되어야 함
      }
    }
  }, [isMobile, useMobileHeader, title, icon, filters, onFilterOpen, filterBadge, actions, description, setHeaderInfo, clearHeaderInfo])

  // 모바일에서 Context를 사용하므로 여기서는 아무것도 렌더링하지 않음
  // (TopBar가 Context에서 정보를 읽어서 표시)
  if (isMobile && useMobileHeader && title) {
    return null
  }

  // MUI 기반 렌더링 (FinanceHeader 호환)
  if (useMUI) {
    const { Stack, Typography } = require('@mui/material')
    const actionsArray = Array.isArray(actions) ? actions : (actions ? [actions] : [])
    
    return (
      <Stack direction={{ xs: 'row', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1} className={className}>
        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {title}
        </Typography>
        {actionsArray.length > 0 && (
          <Stack direction="row" spacing={1}>
            {actionsArray.map((action, idx) => (
              <span key={idx}>{action}</span>
            ))}
          </Stack>
        )}
      </Stack>
    )
  }

  // Sticky variant
  if (variant === 'sticky') {
    return (
      <div className={`-mx-4 md:-mx-0 bg-white/90 backdrop-blur-sm border-b border-neutral-200 shadow-sm sticky top-10 z-sticky ${className}`}>
        <div className="container py-1.5 md:py-2 px-3 md:px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              {icon && <span className="inline-block mr-2">{icon}</span>}
              <h1 className="text-lg md:text-xl font-bold text-neutral-900 break-words leading-tight tracking-tight inline">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-neutral-600 mt-1">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                {Array.isArray(actions) ? actions.map((action, idx) => <span key={idx}>{action}</span>) : actions}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`-mx-4 md:-mx-0 bg-white/90 backdrop-blur-sm border-b border-neutral-200 shadow-sm sticky top-10 z-sticky ${className}`}>
        <div className="container py-1.5 px-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="min-w-0 flex-1 flex items-center gap-3">
              {icon && <span className="flex-shrink-0">{icon}</span>}
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
                {Array.isArray(actions) ? actions.map((action, idx) => <span key={idx}>{action}</span>) : actions}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 shadow-md p-3 sm:p-4 transition-shadow duration-200 ${className}`}>
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
              <input
                type="search"
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    input.blur()
                  }
                }}
                placeholder={search.placeholder || '검색어를 입력하세요'}
                className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-4 text-base sm:text-sm text-neutral-800 outline-none shadow-sm placeholder:text-neutral-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 transition-all duration-200 touch-manipulation"
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
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                enterKeyHint="search"
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
              {Array.isArray(actions) ? actions.map((action, idx) => <span key={idx}>{action}</span>) : actions}
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

