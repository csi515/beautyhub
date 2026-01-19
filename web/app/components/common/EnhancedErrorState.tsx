'use client'

import { AlertCircle, RefreshCw, WifiOff, ServerOff } from 'lucide-react'
import Button from '../ui/Button'
import clsx from 'clsx'

type ErrorType = 'network' | 'server' | 'not-found' | 'permission' | 'unknown'

type EnhancedErrorStateProps = {
  title?: string
  message: string
  errorType?: ErrorType
  onRetry?: () => void
  retryLabel?: string
  suggestions?: string[]
  className?: string
}

/**
 * 개선된 에러 상태 컴포넌트
 * 에러 유형에 따른 친절한 메시지 및 복구 제안
 */
export default function EnhancedErrorState({
  title,
  message,
  errorType = 'unknown',
  onRetry,
  retryLabel = '다시 시도',
  suggestions,
  className = '',
}: EnhancedErrorStateProps) {
  const errorConfig = {
    network: {
      icon: <WifiOff className="h-8 w-8 text-amber-600" />,
      defaultTitle: '네트워크 연결 오류',
      defaultSuggestions: [
        '인터넷 연결을 확인해주세요',
        'Wi-Fi 또는 모바일 데이터가 켜져 있는지 확인해주세요',
        '잠시 후 다시 시도해주세요',
      ],
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
    },
    server: {
      icon: <ServerOff className="h-8 w-8 text-rose-600" />,
      defaultTitle: '서버 오류',
      defaultSuggestions: [
        '서버에 일시적인 문제가 발생했습니다',
        '잠시 후 다시 시도해주세요',
        '문제가 계속되면 관리자에게 문의해주세요',
      ],
      bgColor: 'bg-rose-50',
      iconBg: 'bg-rose-100',
    },
    'not-found': {
      icon: <AlertCircle className="h-8 w-8 text-neutral-400" />,
      defaultTitle: '찾을 수 없음',
      defaultSuggestions: [
        '요청하신 리소스를 찾을 수 없습니다',
        'URL을 확인해주세요',
        '이전 페이지로 돌아가주세요',
      ],
      bgColor: 'bg-neutral-50',
      iconBg: 'bg-neutral-100',
    },
    permission: {
      icon: <AlertCircle className="h-8 w-8 text-amber-600" />,
      defaultTitle: '권한 없음',
      defaultSuggestions: [
        '이 작업을 수행할 권한이 없습니다',
        '관리자에게 권한을 요청해주세요',
      ],
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
    },
    unknown: {
      icon: <AlertCircle className="h-8 w-8 text-rose-600" />,
      defaultTitle: '오류가 발생했습니다',
      defaultSuggestions: [
        '예상치 못한 오류가 발생했습니다',
        '페이지를 새로고침해주세요',
        '문제가 계속되면 관리자에게 문의해주세요',
      ],
      bgColor: 'bg-rose-50',
      iconBg: 'bg-rose-100',
    },
  }

  const config = errorConfig[errorType]
  const displayTitle = title || config.defaultTitle
  const displaySuggestions = suggestions || config.defaultSuggestions

  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="text-center space-y-6 max-w-md">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className={clsx('h-16 w-16 rounded-full flex items-center justify-center', config.iconBg)}>
            {config.icon}
          </div>
        </div>

        {/* 제목 및 메시지 */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{displayTitle}</h3>
          <p className="text-sm text-neutral-600 mb-4">{message}</p>
        </div>

        {/* 제안 사항 */}
        {displaySuggestions.length > 0 && (
          <div className={clsx('rounded-lg p-4 text-left', config.bgColor)}>
            <p className="text-xs font-medium text-neutral-700 mb-2">다음을 시도해보세요:</p>
            <ul className="space-y-1.5">
              {displaySuggestions.map((suggestion, index) => (
                <li key={index} className="text-xs text-neutral-600 flex items-start gap-2">
                  <span className="text-neutral-400 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 재시도 버튼 */}
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="mt-2"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * 에러 메시지에서 에러 유형 추출
 */
export function getErrorType(error: unknown): ErrorType {
  if (!error) return 'unknown'
  
  const errorMessage = error instanceof Error ? error.message : String(error)
  const lowerMessage = errorMessage.toLowerCase()

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return 'network'
  }
  if (lowerMessage.includes('404') || lowerMessage.includes('not found')) {
    return 'not-found'
  }
  if (lowerMessage.includes('403') || lowerMessage.includes('permission') || lowerMessage.includes('unauthorized')) {
    return 'permission'
  }
  if (lowerMessage.includes('500') || lowerMessage.includes('server')) {
    return 'server'
  }

  return 'unknown'
}
