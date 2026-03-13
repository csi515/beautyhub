'use client'

import { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import Button from '@/app/components/ui/Button'

type PageHeaderProps = {
  title?: string
  icon?: ReactNode
  className?: string
}

/**
 * 페이지 헤더 컴포넌트
 * 제목과 아이콘만 표시하여 공간 효율 극대화
 */
export default function PageHeader({
  title,
  icon,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 shadow-sm p-2 sm:p-3 md:hidden ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 sm:gap-3">
          {icon && <div className="flex-shrink-0 text-blue-600">{icon}</div>}
          {title && (
            <h1 className="text-base sm:text-lg font-bold text-neutral-900">
              {title}
            </h1>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 액션 버튼 생성 헬퍼 (FilterBar 등에서 사용)
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
