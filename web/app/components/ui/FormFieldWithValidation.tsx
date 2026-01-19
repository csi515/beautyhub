'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import clsx from 'clsx'

type FormFieldWithValidationProps = {
  label: string
  required?: boolean
  helpText?: string
  error?: string
  validating?: boolean
  success?: boolean
  children: React.ReactNode
  className?: string
}

/**
 * 개선된 폼 필드 컴포넌트
 * 실시간 검증 피드백 및 성공 상태 표시
 */
export default function FormFieldWithValidation({
  label,
  required,
  helpText,
  error,
  validating = false,
  success = false,
  children,
  className = '',
}: FormFieldWithValidationProps) {
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    if (error || success || validating) {
      setShowFeedback(true)
    }
  }, [error, success, validating])


  return (
    <div className={clsx('w-full', className)}>
      {/* 레이블 */}
      {label && (
        <div className="mb-1.5 text-sm font-medium text-neutral-700 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-600 font-semibold">*</span>}
        </div>
      )}

      {/* 입력 필드 */}
      <div className="relative">
        {children}
        
        {/* 상태 아이콘 */}
        {(showFeedback || validating || success || error) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {validating && (
              <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />
            )}
            {!validating && success && !error && (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            {!validating && error && (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
          </div>
        )}
      </div>

      {/* 피드백 메시지 */}
      {showFeedback && (
        <div className="mt-1.5 space-y-1">
          {error && (
            <div className="flex items-start gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-2 py-1.5 animate-slide-in-up">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}
          {!error && success && (
            <div className="flex items-start gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1.5 animate-slide-in-up">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span className="flex-1">올바른 형식입니다</span>
            </div>
          )}
          {!error && !success && helpText && (
            <div className="text-xs text-neutral-500">{helpText}</div>
          )}
        </div>
      )}
    </div>
  )
}
