'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useAppToast } from './Toast'
import clsx from 'clsx'

type ProgressToastOptions = {
  title: string
  description?: string
  onComplete?: () => void
  onError?: (error: Error) => void
}

/**
 * 진행 상태를 표시하는 Toast
 * 비동기 작업의 진행 상황을 사용자에게 알림
 */
export function useProgressToast() {
  const toast = useAppToast()
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const showProgress = async (
    promise: Promise<any>,
    options: ProgressToastOptions
  ) => {
    setIsLoading(true)
    setProgress(0)

    // 진행률 시뮬레이션 (실제로는 API 응답에 따라 업데이트)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + 10
      })
    }, 200)

    try {
      const result = await promise
      clearInterval(progressInterval)
      setProgress(100)
      setIsLoading(false)
      
      setTimeout(() => {
        toast.success(options.title, options.description)
        options.onComplete?.()
      }, 500)
      
      return result
    } catch (error) {
      clearInterval(progressInterval)
      setIsLoading(false)
      setProgress(0)
      
      const err = error instanceof Error ? error : new Error(String(error))
      toast.error(options.title, err.message)
      options.onError?.(err)
      throw err
    }
  }

  return { showProgress, progress, isLoading }
}

/**
 * 진행 상태 Toast 컴포넌트
 */
export function ProgressToast({
  title,
  progress,
  isLoading,
}: {
  title: string
  progress: number
  isLoading: boolean
}) {
  if (!isLoading && progress === 0) return null

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-[1100] rounded-xl border p-4 shadow-2xl',
        'bg-white/95 backdrop-blur-md border-neutral-200',
        'min-w-[280px] max-w-md',
        'animate-slide-in-right'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
        ) : progress === 100 ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-rose-600" />
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-neutral-900 mb-1">
            {title}
          </h4>
          {isLoading && (
            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-600 h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
