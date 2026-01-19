'use client'

import { Inbox, Search, Package, FileX, Plus, ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import clsx from 'clsx'

type EmptyStateType = 'default' | 'no-data' | 'no-search' | 'no-items' | 'no-results'

type EnhancedEmptyStateProps = {
  type?: EmptyStateType
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
  secondaryActionLabel?: string
  secondaryActionOnClick?: () => void
  icon?: React.ReactNode
  className?: string
  illustration?: React.ReactNode
}

const defaultIcons: Record<EmptyStateType, React.ReactNode> = {
  default: <Inbox className="h-16 w-16 text-neutral-300" />,
  'no-data': <FileX className="h-16 w-16 text-neutral-300" />,
  'no-search': <Search className="h-16 w-16 text-neutral-300" />,
  'no-items': <Package className="h-16 w-16 text-neutral-300" />,
  'no-results': <Search className="h-16 w-16 text-neutral-300" />,
}

const defaultTitles: Record<EmptyStateType, string> = {
  default: '데이터가 없습니다',
  'no-data': '데이터가 없습니다',
  'no-search': '검색 결과가 없습니다',
  'no-items': '항목이 없습니다',
  'no-results': '결과를 찾을 수 없습니다',
}

const defaultDescriptions: Record<EmptyStateType, string> = {
  default: '아직 등록된 데이터가 없습니다. 첫 번째 항목을 추가해보세요.',
  'no-data': '표시할 데이터가 없습니다. 새 항목을 추가하면 여기에 표시됩니다.',
  'no-search': '검색 조건에 맞는 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요.',
  'no-items': '등록된 항목이 없습니다. 첫 번째 항목을 추가해보세요.',
  'no-results': '조건에 맞는 결과가 없습니다. 필터를 조정해보세요.',
}

/**
 * 개선된 빈 상태 컴포넌트
 * 더 명확한 안내와 액션 제안
 */
export default function EnhancedEmptyState({
  type = 'default',
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionOnClick,
  icon,
  className = '',
  illustration,
}: EnhancedEmptyStateProps) {
  const displayIcon = icon || defaultIcons[type]
  const displayTitle = title || defaultTitles[type]
  const displayDescription = description || defaultDescriptions[type]

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-neutral-200 p-8 md:p-12 max-w-md mx-auto text-center shadow-sm',
        className
      )}
    >
      {/* 일러스트레이션 */}
      {illustration && (
        <div className="flex justify-center mb-6">{illustration}</div>
      )}

      {/* 아이콘 */}
      {!illustration && (
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-neutral-50 flex items-center justify-center">
            {displayIcon}
          </div>
        </div>
      )}

      {/* 제목 */}
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{displayTitle}</h3>

      {/* 설명 */}
      {displayDescription && (
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed max-w-sm mx-auto">
          {displayDescription}
        </p>
      )}

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {actionLabel && actionOnClick && (
          <Button
            size="md"
            variant="primary"
            onClick={actionOnClick}
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            {actionLabel}
          </Button>
        )}
        {actionLabel && !actionOnClick && actionHref && (
          <a href={actionHref} className="w-full sm:w-auto">
            <Button
              size="md"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              {actionLabel}
            </Button>
          </a>
        )}
        {secondaryActionLabel && secondaryActionOnClick && (
          <Button
            size="md"
            variant="outline"
            onClick={secondaryActionOnClick}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
