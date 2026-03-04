'use client'

import { ReactNode } from 'react'
import ErrorState from './ErrorState'
import LoadingState from './LoadingState'
import EmptyState from '../ui/EmptyState'
import { LucideIcon } from 'lucide-react'

/**
 * 데이터 상태 통합 Wrapper 컴포넌트
 * 
 * 로딩/에러/빈 상태를 일관되게 처리합니다.
 * 페이지별로 제각각 처리하지 않고 공통 패턴을 사용합니다.
 */

type DataStateWrapperProps = {
  /** 로딩 상태 */
  loading?: boolean
  
  /** 에러 상태 (Error 객체, 문자열, 또는 null) */
  error?: Error | string | null
  
  /** 데이터가 비어있는지 여부 */
  isEmpty?: boolean
  
  /** 빈 상태 아이콘 */
  emptyIcon?: LucideIcon
  
  /** 빈 상태 제목 */
  emptyTitle?: string
  
  /** 빈 상태 설명 */
  emptyDescription?: string
  
  /** 빈 상태 액션 라벨 */
  emptyActionLabel?: string
  
  /** 빈 상태 액션 핸들러 */
  onEmptyAction?: () => void
  
  /** 에러 재시도 핸들러 */
  onRetry?: () => void
  
  /** 에러 재시도 라벨 */
  retryLabel?: string
  
  /** 실제 콘텐츠 (로딩/에러/빈 상태가 아닐 때 표시) */
  children: ReactNode
  
  /** 로딩 스켈레톤 컴포넌트 (기본 LoadingState 대신 사용) */
  loadingComponent?: ReactNode
}

export default function DataStateWrapper({
  loading = false,
  error = null,
  isEmpty = false,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  onRetry,
  retryLabel = '다시 시도',
  children,
  loadingComponent,
}: DataStateWrapperProps) {
  // 로딩 상태
  if (loading) {
    return <>{loadingComponent || <LoadingState />}</>
  }
  
  // 에러 상태
  if (error) {
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : '알 수 없는 오류가 발생했습니다.')
    const errorStateProps: {
      message: string
      onRetry?: () => void
      retryLabel?: string
    } = {
      message: errorMessage,
    }
    if (onRetry) {
      errorStateProps.onRetry = onRetry
      errorStateProps.retryLabel = retryLabel
    }
    return <ErrorState {...errorStateProps} />
  }
  
  // 빈 상태
  if (isEmpty) {
    const emptyStateProps: {
      icon?: typeof emptyIcon
      title: string
      description?: string
      actionLabel?: string
      onAction?: () => void
    } = {
      title: emptyTitle || '데이터가 없습니다',
    }
    if (emptyIcon) emptyStateProps.icon = emptyIcon
    if (emptyDescription) emptyStateProps.description = emptyDescription
    if (emptyActionLabel && onEmptyAction) {
      emptyStateProps.actionLabel = emptyActionLabel
      emptyStateProps.onAction = onEmptyAction
    }
    return <EmptyState {...emptyStateProps} />
  }
  
  // 정상 상태: 콘텐츠 표시
  return <>{children}</>
}
